import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

function clampStr(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  if (!t) return undefined
  return t.length > max ? t.slice(0, max) : t
}

function clampInt(v: unknown, min: number, max: number): number | undefined {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseInt(v, 10) : NaN
  if (!Number.isFinite(n)) return undefined
  if (n < min || n > max) return undefined
  return Math.floor(n)
}

function clampStrArray(v: unknown, maxItems: number, maxLen: number): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: string[] = []
  for (const item of v) {
    if (typeof item !== 'string') continue
    const t = item.trim()
    if (!t) continue
    out.push(t.length > maxLen ? t.slice(0, maxLen) : t)
    if (out.length >= maxItems) break
  }
  return out.length ? out : undefined
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const token = url.searchParams.get('token')
      if (!token) {
        return new Response(
          JSON.stringify({ ok: false, error: 'missing_token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: tok } = await supabase
        .from('trip_feedback_tokens')
        .select('token, trip_id, user_id, used_at')
        .eq('token', token)
        .maybeSingle()

      if (!tok) {
        return new Response(
          JSON.stringify({ ok: false, error: 'invalid_token' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (tok.used_at) {
        return new Response(
          JSON.stringify({ ok: false, error: 'already_used' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: trip } = await supabase
        .from('trips')
        .select('id, title, destination, start_date, end_date')
        .eq('id', tok.trip_id)
        .maybeSingle()

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', tok.user_id)
        .maybeSingle()

      return new Response(
        JSON.stringify({
          ok: true,
          trip: trip ?? null,
          userName: profile?.name ?? '',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ ok: false, error: 'invalid_body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = typeof body.token === 'string' ? body.token : ''
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: 'missing_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rating = clampInt(body.rating, 1, 5)
    if (rating === undefined) {
      return new Response(
        JSON.stringify({ ok: false, error: 'rating_required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: tok } = await supabase
      .from('trip_feedback_tokens')
      .select('token, trip_id, user_id, used_at')
      .eq('token', token)
      .maybeSingle()

    if (!tok) {
      return new Response(
        JSON.stringify({ ok: false, error: 'invalid_token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (tok.used_at) {
      return new Response(
        JSON.stringify({ ok: false, error: 'already_used' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sectionsUsed = clampStrArray(body.sections_used, 20, 60)
    const mostUsefulSection = clampStr(body.most_useful_section, 80)
    const sectionToImprove = clampStr(body.section_to_improve, 80)
    const missingFeature = clampStr(body.missing_feature, 1000)
    const whatToChange = clampStr(body.what_to_change, 1000)
    const wouldUseAgain = clampStr(body.would_use_again, 30)
    const freeComment = clampStr(body.free_comment, 2000)
    const profileFirstName = clampStr(body.profile_first_name, 80)
    const profileLastName = clampStr(body.profile_last_name, 80)
    const profileAge = clampInt(body.profile_age, 0, 130)
    const profileResidence = clampStr(body.profile_residence, 120)
    const profileTravelsWith = clampStr(body.profile_travels_with, 60)

    const { error: insertErr } = await supabase.from('trip_feedback').insert({
      trip_id: tok.trip_id,
      user_id: tok.user_id,
      rating,
      sections_used: sectionsUsed ?? null,
      most_useful_section: mostUsefulSection ?? null,
      section_to_improve: sectionToImprove ?? null,
      missing_feature: missingFeature ?? null,
      what_to_change: whatToChange ?? null,
      would_use_again: wouldUseAgain ?? null,
      free_comment: freeComment ?? null,
      profile_first_name: profileFirstName ?? null,
      profile_last_name: profileLastName ?? null,
      profile_age: profileAge ?? null,
      profile_residence: profileResidence ?? null,
      profile_travels_with: profileTravelsWith ?? null,
    })

    if (insertErr) {
      console.error('Failed to insert trip_feedback', insertErr)
      return new Response(
        JSON.stringify({ ok: false, error: 'insert_failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('trip_feedback_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    // Resolve context for internal email
    const { data: trip } = await supabase
      .from('trips')
      .select('id, title, destination')
      .eq('id', tok.trip_id)
      .maybeSingle()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', tok.user_id)
      .maybeSingle()

    const submittedAt = new Date().toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })

    // Send internal feedback email to info@yormit.com
    try {
      const sendRes = await fetch(
        `${supabaseUrl}/functions/v1/send-transactional-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
          },
          body: JSON.stringify({
            templateName: 'trip-feedback-internal',
            // recipientEmail is overridden by the template `to` field, but we
            // pass it for safety.
            recipientEmail: 'info@yormit.com',
            idempotencyKey: `feedback-internal-${token}`,
            templateData: {
              tripName: trip?.title,
              destination: trip?.destination,
              userName: profile?.name,
              userEmail: profile?.email,
              rating,
              sectionsUsed,
              mostUsefulSection,
              sectionToImprove,
              missingFeature,
              whatToChange,
              wouldUseAgain,
              freeComment,
              profileFirstName,
              profileLastName,
              profileAge,
              profileResidence,
              profileTravelsWith,
              submittedAt,
            },
          }),
        }
      )
      if (!sendRes.ok) {
        console.error('Failed to send internal feedback email', {
          status: sendRes.status,
          body: await sendRes.text(),
        })
      }
    } catch (e) {
      console.error('Internal feedback email exception', e)
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('submit-trip-feedback failed', e)
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
