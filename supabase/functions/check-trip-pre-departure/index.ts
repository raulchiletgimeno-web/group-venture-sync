import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface DailyForecast {
  date: string
  tmax: number
  tmin: number
  code: number
}

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

function buildDestinationCandidates(destination: string): string[] {
  const raw = (destination ?? '').trim()
  if (!raw) return []
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean)
  const ordered = [raw, ...parts, parts[parts.length - 1]].filter(Boolean) as string[]
  return [...new Set(ordered)]
}

async function geocodeDestination(
  destination: string
): Promise<{ latitude: number; longitude: number } | null> {
  const candidates = buildDestinationCandidates(destination)
  for (const candidate of candidates) {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=1&language=es&format=json`
      const geoRes = await fetch(geoUrl)
      if (!geoRes.ok) continue
      const geoData = await geoRes.json()
      const place = geoData?.results?.[0]
      if (place?.latitude && place?.longitude) {
        return { latitude: place.latitude, longitude: place.longitude }
      }
    } catch (e) {
      console.warn('Geocoding candidate failed', { candidate, error: String(e) })
    }
  }
  console.warn('Geocoding failed for all candidates', { destination, candidates })
  return null
}

async function fetchForecast(
  destination: string,
  startDate: string,
  endDate: string
): Promise<DailyForecast[] | null> {
  try {
    const place = await geocodeDestination(destination)
    if (!place) return null

    // 2. Forecast (Open-Meteo supports up to 16 days ahead)
    const fcUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${startDate}&end_date=${endDate}&timezone=auto`
    const fcRes = await fetch(fcUrl)
    if (!fcRes.ok) return null
    const fcData = await fcRes.json()
    const daily = fcData?.daily
    if (!daily?.time?.length) return null

    const out: DailyForecast[] = []
    for (let i = 0; i < daily.time.length; i++) {
      out.push({
        date: daily.time[i],
        tmax: daily.temperature_2m_max[i],
        tmin: daily.temperature_2m_min[i],
        code: daily.weathercode[i],
      })
    }
    return out
  } catch (e) {
    console.error('Weather fetch failed', e)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Optional: force a single trip (manual catch-up)
    let forceTripId: string | null = null
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        if (body && typeof body.force_trip_id === 'string') {
          forceTripId = body.force_trip_id
        }
      } catch {
        // no body / invalid JSON — ignore
      }
    }

    // Regla fija e inamovible:
    // - Email enviado EXACTAMENTE 2 días naturales antes del start_date
    // - EXACTAMENTE a las 10:00 hora de Madrid (Europe/Madrid)
    // - Una sola vez por usuario y por viaje (UNIQUE constraint)
    const madridParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    }).formatToParts(new Date())
    const get = (t: string) => madridParts.find((p) => p.type === t)!.value
    const madridYear = parseInt(get('year'))
    const madridMonth = parseInt(get('month'))
    const madridDay = parseInt(get('day'))
    const madridHour = parseInt(get('hour'))

    // Bloquea cualquier ejecución que no caiga a las 10:00 Madrid
    // (salvo catch-up manual con force_trip_id)
    if (!forceTripId && madridHour !== 10) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: `Skip: Madrid hour is ${madridHour}, not 10` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // target = hoy (Madrid) + 2 días
    const targetDateObj = new Date(Date.UTC(madridYear, madridMonth - 1, madridDay + 2))
    const targetDate = targetDateObj.toISOString().slice(0, 10)

    let query = supabase
      .from('trips')
      .select('id, title, destination, start_date, end_date')

    if (forceTripId) {
      query = query.eq('id', forceTripId)
    } else {
      query = query.eq('start_date', targetDate)
    }

    const { data: trips, error: tripsError } = await query

    if (tripsError) throw tripsError
    if (!trips || trips.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: 'No trips in window' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalSent = 0
    const details: Array<Record<string, unknown>> = []

    for (const trip of trips) {
      // Catch-up window: send any time from ~60h before start until the
      // trip's end day. The UNIQUE (trip_id, user_id) constraint on
      // trip_pre_departure_reminders prevents duplicate sends.
      // In force mode (manual catch-up), bypass the window check entirely.
      if (!forceTripId) {
        const tripStart = new Date(trip.start_date + 'T00:00:00Z')
        const hoursAway = (tripStart.getTime() - now.getTime()) / (1000 * 60 * 60)
        if (hoursAway < -24 || hoursAway > 60) continue
      }

      // Get approved members
      const { data: members, error: membersError } = await supabase
        .from('trip_members')
        .select('user_id')
        .eq('trip_id', trip.id)
        .eq('status', 'approved')

      if (membersError || !members?.length) continue

      const userIds = members.map((m) => m.user_id)

      // Get profiles with valid emails
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds)
        .not('email', 'is', null)

      if (profilesError || !profiles?.length) continue

      // Filter out users already reminded
      const { data: alreadySent } = await supabase
        .from('trip_pre_departure_reminders')
        .select('user_id')
        .eq('trip_id', trip.id)

      const sentSet = new Set((alreadySent ?? []).map((r) => r.user_id))
      const recipients = profiles.filter(
        (p) => !sentSet.has(p.id) && p.email && p.email.includes('@')
      )

      if (!recipients.length) continue

      // Fetch weather once per trip
      const forecast = await fetchForecast(
        trip.destination,
        trip.start_date,
        trip.end_date
      )

      for (const recipient of recipients) {
        try {
          const templateData = {
            userName: recipient.name || '',
            tripName: trip.title,
            destination: trip.destination,
            startDate: formatDateEs(trip.start_date),
            endDate: formatDateEs(trip.end_date),
            forecast: forecast ?? undefined,
          }

          const sendRes = await fetch(
            `${supabaseUrl}/functions/v1/send-transactional-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${supabaseAnonKey}`,
                apikey: supabaseAnonKey,
              },
              body: JSON.stringify({
                templateName: 'trip-pre-departure',
                recipientEmail: recipient.email,
                idempotencyKey: `pre-departure-${trip.id}-${recipient.id}`,
                templateData,
              }),
            }
          )

          const sendError = sendRes.ok
            ? null
            : { message: `HTTP ${sendRes.status}: ${await sendRes.text()}` }

          if (sendError) {
            console.error('send-transactional-email error', {
              trip: trip.id,
              user: recipient.id,
              error: sendError,
            })
            continue
          }

          // Record reminder (UNIQUE constraint prevents races)
          const { error: insertError } = await supabase
            .from('trip_pre_departure_reminders')
            .insert({ trip_id: trip.id, user_id: recipient.id })

          if (insertError && !insertError.message?.includes('duplicate')) {
            console.error('Failed to record reminder', insertError)
          }

          totalSent++
          details.push({
            trip: trip.id,
            user: recipient.id,
            email: recipient.email,
            weather: forecast ? 'included' : 'unavailable',
          })
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
    console.error('check-trip-pre-departure failed', e)
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
