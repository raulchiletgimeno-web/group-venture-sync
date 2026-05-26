// Endpoint interno de ingesta de alertas. Protegido por header x-internal-secret.
// Deduplica por event_key en ventana 24h y dispara email inmediato solo en 'critical'.
import { createClient } from 'npm:@supabase/supabase-js@2';

const ALERT_RECIPIENT = 'info@yormit.com';
const DEDUP_WINDOW_HOURS = 24;

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

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'invalid_body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { severity, source, event_key, title, description, impact, recommended_action, metadata } = body as Record<string, unknown>;
    if (!['critical','warning','info'].includes(String(severity)) || !source || !event_key || !title || !description) {
      return new Response(JSON.stringify({ error: 'missing_fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const sinceIso = new Date(Date.now() - DEDUP_WINDOW_HOURS * 3600 * 1000).toISOString();

    // Buscar incidencia abierta reciente con mismo event_key
    const { data: existing } = await supabase
      .from('internal_alerts')
      .select('*')
      .eq('event_key', event_key)
      .eq('status', 'open')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let alertRow: any;
    let isNew = false;

    if (existing) {
      const { data: updated } = await supabase
        .from('internal_alerts')
        .update({
          occurrences: (existing.occurrences ?? 1) + 1,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      alertRow = updated;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from('internal_alerts')
        .insert({
          severity, source, event_key, title, description,
          impact: impact ?? null,
          recommended_action: recommended_action ?? null,
          metadata: metadata ?? {},
        })
        .select()
        .single();
      if (insErr) throw insErr;
      alertRow = inserted;
      isNew = true;
    }

    // Email inmediato solo si critical y aún no se notificó
    if (severity === 'critical' && alertRow && !alertRow.notified_immediately_at) {
      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'internal-alert-critical',
            recipientEmail: ALERT_RECIPIENT,
            idempotencyKey: `internal-alert-critical-${alertRow.id}`,
            templateData: {
              severity: alertRow.severity,
              source: alertRow.source,
              title: alertRow.title,
              description: alertRow.description,
              impact: alertRow.impact,
              recommendedAction: alertRow.recommended_action,
              occurrences: alertRow.occurrences,
              firstSeenAt: alertRow.first_seen_at,
              eventKey: alertRow.event_key,
            },
          },
        });
        await supabase
          .from('internal_alerts')
          .update({ notified_immediately_at: new Date().toISOString() })
          .eq('id', alertRow.id);
      } catch (e) {
        console.error('internal-alert send email failed', e);
      }
    }

    return new Response(JSON.stringify({ ok: true, id: alertRow?.id, deduplicated: !isNew }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('internal-alert error', e);
    return new Response(JSON.stringify({ error: 'internal_error', detail: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
