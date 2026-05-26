// Cron diario: agrupa warnings/info de últimas 24h y envía resumen a info@yormit.com.
// También envía emails de resolución pendientes para incidencias críticas resueltas.
import { createClient } from 'npm:@supabase/supabase-js@2';

const ALERT_RECIPIENT = 'info@yormit.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const secret = Deno.env.get('INTERNAL_ALERT_SECRET');
    const header = req.headers.get('x-internal-secret');
    if (!secret || header !== secret) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const sinceIso = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    // 1) Resumen warning/info no incluidos previamente
    const { data: digestItems } = await supabase
      .from('internal_alerts')
      .select('*')
      .in('severity', ['warning', 'info'])
      .gte('last_seen_at', sinceIso)
      .is('included_in_digest_at', null)
      .order('severity', { ascending: true })
      .order('last_seen_at', { ascending: false });

    let digestSent = false;
    if (digestItems && digestItems.length > 0) {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'internal-alert-digest',
          recipientEmail: ALERT_RECIPIENT,
          idempotencyKey: `internal-alert-digest-${new Date().toISOString().slice(0,10)}`,
          templateData: {
            items: digestItems.map((a: any) => ({
              severity: a.severity,
              source: a.source,
              title: a.title,
              description: a.description,
              occurrences: a.occurrences,
              lastSeenAt: a.last_seen_at,
            })),
            total: digestItems.length,
          },
        },
      });
      const ids = digestItems.map((a: any) => a.id);
      await supabase
        .from('internal_alerts')
        .update({ included_in_digest_at: new Date().toISOString() })
        .in('id', ids);
      digestSent = true;
    }

    // 2) Emails de resolución para críticas resueltas que aún no se notificaron como resueltas
    const { data: resolvedCriticals } = await supabase
      .from('internal_alerts')
      .select('*')
      .eq('severity', 'critical')
      .eq('status', 'resolved')
      .not('notified_immediately_at', 'is', null)
      .is('included_in_digest_at', null)
      .not('resolved_at', 'is', null);

    let resolvedSent = 0;
    if (resolvedCriticals) {
      for (const a of resolvedCriticals as any[]) {
        try {
          await supabase.functions.invoke('send-transactional-email', {
            body: {
              templateName: 'internal-alert-resolved',
              recipientEmail: ALERT_RECIPIENT,
              idempotencyKey: `internal-alert-resolved-${a.id}`,
              templateData: {
                title: a.title,
                source: a.source,
                firstSeenAt: a.first_seen_at,
                resolvedAt: a.resolved_at,
                occurrences: a.occurrences,
                resolutionNotes: a.resolution_notes,
              },
            },
          });
          await supabase
            .from('internal_alerts')
            .update({ included_in_digest_at: new Date().toISOString() })
            .eq('id', a.id);
          resolvedSent++;
        } catch (e) {
          console.error('resolved email failed', a.id, e);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, digestSent, digestCount: digestItems?.length ?? 0, resolvedSent }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('internal-alert-digest error', e);
    return new Response(JSON.stringify({ error: 'internal_error', detail: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
