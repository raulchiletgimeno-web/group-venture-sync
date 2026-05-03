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

    const now = new Date()
    // Catch-up window: trips ending in last 3 days (D-1 a D-3 idealmente).
    const today = now.toISOString().slice(0, 10)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)

    let query = supabase
      .from('trips')
      .select('id, title, destination, start_date, end_date')

    if (forceTripId) {
      query = query.eq('id', forceTripId)
    } else {
      // Trips that ended yesterday or earlier (within 3 days).
      query = query.gte('end_date', threeDaysAgo).lt('end_date', today)
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
      // Filter: at least 18h since end_date 00:00 UTC, so we don't send at midnight UTC
      // but during the morning of D+1 in European timezones.
      if (!forceTripId) {
        const tripEnd = new Date(trip.end_date + 'T00:00:00Z')
        const hoursSinceEnd =
          (now.getTime() - tripEnd.getTime()) / (1000 * 60 * 60)
        // hoursSinceEnd > 24 because end_date day itself is still "the trip day"
        // (e.g. trip ends 02-may → send during 03-may, ~24h+ after end_date 00:00).
        if (hoursSinceEnd < 24 || hoursSinceEnd > 96) continue
      }

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
            // Re-read in case of race
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
      JSON.stringify({ ok: true, processed: totalSent, details }),
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
