import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const APP_BASE_URL = 'https://www.yormit.com'

function formatDateEs(iso: string): string {
  try {
    const d = new Date(iso + 'T12:00:00Z')
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
    ]
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  } catch {
    return iso
  }
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Devuelve la fecha (YYYY-MM-DD) y hora actuales en Europe/Madrid.
 * Esto nos permite enviar SIEMPRE a las 10:00 hora local de Madrid,
 * sin importar verano o invierno.
 */
function getMadridNow(): { date: string; hour: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const date = `${get('year')}-${get('month')}-${get('day')}`
  const hour = parseInt(get('hour'), 10)
  return { date, hour }
}

function addDaysISO(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    let forceTripId: string | null = null
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        if (body && typeof body.force_trip_id === 'string') {
          forceTripId = body.force_trip_id
        }
      } catch {
        // ignore
      }
    }

    const madrid = getMadridNow()

    // REGLA: solo se envía a las 10:00 hora local de Madrid.
    // El cron está programado para disparar a 08:00 y 09:00 UTC
    // para cubrir CET/CEST. La función decide aquí si toca enviar.
    if (!forceTripId && madrid.hour !== 10) {
      return new Response(
        JSON.stringify({
          ok: true,
          processed: 0,
          skipped: true,
          reason: `Not 10:00 Europe/Madrid (current hour: ${madrid.hour})`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Selección: viajes cuyo end_date = AYER en Europe/Madrid.
    // Catch-up: también incluimos hace 2 días por si una ejecución falló;
    // la idempotencia (trip_post_departure_reminders) evita duplicados.
    const yesterday = addDaysISO(madrid.date, -1)
    const twoDaysAgo = addDaysISO(madrid.date, -2)

    let query = supabase
      .from('trips')
      .select('id, title, destination, start_date, end_date')

    if (forceTripId) {
      query = query.eq('id', forceTripId)
    } else {
      query = query.in('end_date', [yesterday, twoDaysAgo])
    }

    const { data: trips, error: tripsError } = await query
    if (tripsError) throw tripsError
    if (!trips?.length) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: 'No trips in window' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalSent = 0
    const details: Array<Record<string, unknown>> = []

    for (const trip of trips) {
      const { data: members, error: membersError } = await supabase
        .from('trip_members')
        .select('user_id')
        .eq('trip_id', trip.id)
        .eq('status', 'approved')
      if (membersError || !members?.length) continue

      const userIds = members.map((m) => m.user_id)

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds)
        .not('email', 'is', null)
      if (profilesError || !profiles?.length) continue

      const { data: alreadySent } = await supabase
        .from('trip_post_departure_reminders')
        .select('user_id')
        .eq('trip_id', trip.id)

      const sentSet = new Set((alreadySent ?? []).map((r) => r.user_id))
      const recipients = profiles.filter(
        (p) => !sentSet.has(p.id) && p.email && p.email.includes('@')
      )
      if (!recipients.length) continue

      for (const recipient of recipients) {
        try {
          // Reuse or create one token per (trip, user)
          let token: string
          const { data: existingTok } = await supabase
            .from('trip_feedback_tokens')
            .select('token')
            .eq('trip_id', trip.id)
            .eq('user_id', recipient.id)
            .maybeSingle()

          if (existingTok?.token) {
            token = existingTok.token
          } else {
            token = generateToken()
            const { error: tokErr } = await supabase
              .from('trip_feedback_tokens')
              .insert({ token, trip_id: trip.id, user_id: recipient.id })
            if (tokErr && !tokErr.message?.includes('duplicate')) {
              console.error('Failed to create feedback token', tokErr)
              continue
            }
            const { data: storedTok } = await supabase
              .from('trip_feedback_tokens')
              .select('token')
              .eq('trip_id', trip.id)
              .eq('user_id', recipient.id)
              .maybeSingle()
            if (storedTok?.token) token = storedTok.token
          }

          const feedbackUrl = `${APP_BASE_URL}/feedback?token=${encodeURIComponent(token)}`

          const templateData = {
            userName: recipient.name || '',
            tripName: trip.title,
            destination: trip.destination,
            startDate: formatDateEs(trip.start_date),
            endDate: formatDateEs(trip.end_date),
            feedbackUrl,
          }

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
                templateName: 'trip-post-departure',
                recipientEmail: recipient.email,
                idempotencyKey: `post-departure-${trip.id}-${recipient.id}`,
                templateData,
              }),
            }
          )

          if (!sendRes.ok) {
            console.error('send-transactional-email error', {
              trip: trip.id,
              user: recipient.id,
              status: sendRes.status,
              body: await sendRes.text(),
            })
            continue
          }

          const { error: insertError } = await supabase
            .from('trip_post_departure_reminders')
            .insert({ trip_id: trip.id, user_id: recipient.id })

          if (insertError && !insertError.message?.includes('duplicate')) {
            console.error('Failed to record post reminder', insertError)
          }

          totalSent++
          details.push({ trip: trip.id, user: recipient.id, email: recipient.email })
        } catch (e) {
          console.error('Per-recipient failure', e)
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed: totalSent,
        madrid_now: madrid,
        details,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('check-trip-post-departure failed', e)
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
