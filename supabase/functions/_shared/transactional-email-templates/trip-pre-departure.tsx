import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'YORMIT'

interface DailyForecast {
  date: string // ISO yyyy-mm-dd
  tmax: number
  tmin: number
  code: number
}

interface TripPreDepartureProps {
  userName?: string
  tripName?: string
  destination?: string
  startDate?: string // human readable
  endDate?: string // human readable
  forecast?: DailyForecast[] // optional weather block
}

const SUBJECT_VARIANTS: Array<(d: Record<string, any>) => string> = [
  (d) => `✈️ En 48 horas empieza tu viaje a ${d.destination ?? 'destino'}`,
  (d) => `🎒 Tu viaje está a la vuelta de la esquina, ${d.userName ?? ''}`.trim(),
  (d) => `🌍 En dos días empieza ${d.tripName ?? 'tu viaje'}`,
  (d) => `⏳ ${d.tripName ?? 'Tu viaje'} arranca en 48 horas`,
]

function pickSubject(data: Record<string, any>): string {
  const idx = Math.floor(Math.random() * SUBJECT_VARIANTS.length)
  return SUBJECT_VARIANTS[idx](data)
}

function weatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if ([1, 2].includes(code)) return '🌤️'
  if (code === 3) return '⛅'
  if ([45, 48].includes(code)) return '🌫️'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return '🌧️'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️'
  if ([95, 96, 99].includes(code)) return '⛈️'
  return '🌡️'
}

function weatherLabel(code: number): string {
  if (code === 0) return 'Despejado'
  if ([1, 2].includes(code)) return 'Mayormente despejado'
  if (code === 3) return 'Nublado'
  if ([45, 48].includes(code)) return 'Niebla'
  if ([51, 53, 55].includes(code)) return 'Llovizna'
  if ([56, 57].includes(code)) return 'Llovizna helada'
  if ([61, 63, 65, 80, 81, 82].includes(code)) return 'Lluvia'
  if ([66, 67].includes(code)) return 'Lluvia helada'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Nieve'
  if (code === 95) return 'Tormenta'
  if ([96, 99].includes(code)) return 'Tormenta con granizo'
  return ''
}

function formatForecastDay(iso: string): string {
  try {
    const d = new Date(iso + 'T12:00:00Z')
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return `${days[d.getUTCDay()]} ${d.getUTCDate()}`
  } catch {
    return iso
  }
}

const CHECKLIST = [
  'Ropa y calzado adecuados para el destino',
  'Cargador del móvil y batería externa',
  'DNI o pasaporte',
  'Tarjeta sanitaria',
  'Tarjetas bancarias y algo de efectivo',
  'Reservas, billetes o documentación importante',
  'Medicación personal si la necesitas',
  'Adaptadores o conexiones si viajas al extranjero',
  'Revisión de roaming o conectividad móvil si aplica',
]

const TripPreDepartureEmail = ({
  userName,
  tripName,
  destination,
  startDate,
  endDate,
  forecast,
}: TripPreDepartureProps) => {
  const greetingName = userName && userName.trim() ? userName : 'viajero'
  const tName = tripName ?? 'tu viaje'
  const dest = destination ?? 'tu destino'

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{`En 48 horas empieza ${tName} — checklist y previsión del tiempo`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={brand}>{SITE_NAME}</Heading>
          </Section>

          {/* Greeting */}
          <Section style={contentSection}>
            <Heading style={h1}>¡Hola, {greetingName}! 👋</Heading>
            <Text style={lead}>
              En <strong>48 horas</strong> empieza <strong>{tName}</strong> ✈️
            </Text>
            <Text style={text}>
              Seguramente ya hay ganas de que llegue el momento. Te dejamos un
              pequeño recordatorio para que lo tengas todo bajo control y
              puedas disfrutar del viaje desde antes de salir.
            </Text>
          </Section>

          {/* Trip details card */}
          <Section style={card}>
            <Text style={cardTitle}>Datos del viaje</Text>
            <Text style={cardRow}>
              <span style={cardLabel}>📍 Destino:</span> {dest}
            </Text>
            {(startDate || endDate) && (
              <Text style={cardRow}>
                <span style={cardLabel}>📅 Fechas:</span>{' '}
                {startDate ?? ''}
                {startDate && endDate ? ' – ' : ''}
                {endDate ?? ''}
              </Text>
            )}
          </Section>

          {/* Checklist */}
          <Section style={contentSection}>
            <Heading style={h2}>📋 Checklist antes de salir</Heading>
            {CHECKLIST.map((item, i) => (
              <Text key={i} style={checkItem}>
                <span style={check}>✓</span> {item}
              </Text>
            ))}
          </Section>

          {/* Weather */}
          {forecast && forecast.length > 0 && (
            <Section style={contentSection}>
              <Heading style={h2}>🌤️ El tiempo en {dest}</Heading>
              <Section style={weatherTable}>
                {forecast.slice(0, 7).map((d, i) => (
                  <Section key={i} style={weatherRow}>
                    <Text style={weatherDay}>{formatForecastDay(d.date)}</Text>
                    <Text style={weatherIcon}>
                      {weatherEmoji(d.code)}{' '}
                      <span style={weatherLabelStyle}>
                        {weatherLabel(d.code)}
                      </span>
                    </Text>
                    <Text style={weatherTemp}>
                      {Math.round(d.tmax)}° / {Math.round(d.tmin)}°
                    </Text>
                  </Section>
                ))}
              </Section>
            </Section>
          )}

          {/* Closing */}
          <Section style={contentSection}>
            <Text style={text}>
              Lo importante ahora es una sola cosa: preparar lo necesario y
              empezar a disfrutar del viaje antes incluso de salir.
            </Text>
            <Text style={closing}>
              Gracias por viajar con {SITE_NAME}. Nos vemos dentro. ✈️
            </Text>
            <Text style={tagline}>
              Empieza el viaje antes de salir.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: TripPreDepartureEmail,
  subject: pickSubject,
  displayName: 'Recordatorio 48h antes del viaje',
  previewData: {
    userName: 'Juan Ga.',
    tripName: 'Escapada a Lisboa',
    destination: 'Lisboa',
    startDate: '22 nov 2025',
    endDate: '26 nov 2025',
    forecast: [
      { date: '2025-11-22', tmax: 19, tmin: 12, code: 1 },
      { date: '2025-11-23', tmax: 18, tmin: 11, code: 3 },
      { date: '2025-11-24', tmax: 17, tmin: 10, code: 61 },
      { date: '2025-11-25', tmax: 19, tmin: 12, code: 2 },
      { date: '2025-11-26', tmax: 20, tmin: 13, code: 0 },
    ],
  },
} satisfies TemplateEntry

// Styles — consistentes con debt-reminder.tsx
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
}
const container = {
  margin: '0 auto',
  maxWidth: '600px',
  padding: '0',
}
const header = {
  backgroundColor: '#0099dd',
  padding: '28px 24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}
const brand = {
  color: '#ffffff',
  fontSize: '26px',
  fontWeight: 'bold' as const,
  letterSpacing: '2px',
  margin: '0',
}
const contentSection = {
  padding: '24px 28px',
}
const h1 = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  margin: '0 0 12px',
}
const h2 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  margin: '0 0 14px',
}
const lead = {
  color: '#1a1a1a',
  fontSize: '17px',
  lineHeight: '1.5',
  margin: '0 0 12px',
}
const text = {
  color: '#4a4a4a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 12px',
}
const card = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '10px',
  padding: '18px 22px',
  margin: '8px 28px 16px',
}
const cardTitle = {
  color: '#0369a1',
  fontSize: '13px',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 10px',
}
const cardRow = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 6px',
}
const cardLabel = {
  color: '#475569',
  fontWeight: 'bold' as const,
}
const checkItem = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 6px',
}
const check = {
  color: '#0099dd',
  fontWeight: 'bold' as const,
  marginRight: '6px',
}
const weatherTable = {
  backgroundColor: '#fafafa',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '8px 14px',
}
const weatherRow = {
  borderBottom: '1px solid #f0f0f0',
  padding: '8px 0',
}
const weatherDay = {
  display: 'inline-block',
  width: '28%',
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  margin: '0',
}
const weatherIcon = {
  display: 'inline-block',
  width: '46%',
  color: '#4a4a4a',
  fontSize: '14px',
  margin: '0',
}
const weatherLabelStyle = {
  color: '#6b7280',
  fontSize: '13px',
}
const weatherTemp = {
  display: 'inline-block',
  width: '24%',
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  textAlign: 'right' as const,
  margin: '0',
}
const closing = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  margin: '14px 0 6px',
}
const tagline = {
  color: '#0099dd',
  fontSize: '14px',
  fontStyle: 'italic' as const,
  margin: '0',
}
