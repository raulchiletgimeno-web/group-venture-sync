import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
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

interface TripPostDepartureProps {
  userName?: string
  tripName?: string
  destination?: string
  startDate?: string
  endDate?: string
  feedbackUrl?: string
}

const SUBJECT_VARIANTS: Array<(d: Record<string, any>) => string> = [
  (_d) => `✨ Valóranos en 10 segundos`,
  (d) => `💬 ¿Qué tal ${d.tripName ?? 'tu viaje'}? Cuéntanoslo en 10s`,
  (_d) => `⭐ Tu opinión sobre YORMIT (10 segundos)`,
  (d) => `🙌 ¿Cómo ha ido ${d.tripName ?? 'tu viaje'}? Tu opinión cuenta`,
]

function pickSubject(data: Record<string, any>): string {
  const idx = Math.floor(Math.random() * SUBJECT_VARIANTS.length)
  return SUBJECT_VARIANTS[idx](data)
}

const TripPostDepartureEmail = ({
  userName,
  tripName,
  destination,
  startDate,
  endDate,
  feedbackUrl,
}: TripPostDepartureProps) => {
  const greetingName = userName && userName.trim() ? userName : 'viajero'
  const tName = tripName ?? 'tu viaje'
  const url = feedbackUrl ?? 'https://www.yormit.com'

  const tripChip = [destination, [startDate, endDate].filter(Boolean).join(' – ')]
    .filter(Boolean)
    .join(' · ')

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{`Valóranos en 10 segundos · ${tName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>{SITE_NAME}</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading style={h1}>¡Hola, {greetingName}! 👋</Heading>
            <Text style={lead}>
              ¿Qué tal ha ido <strong>{tName}</strong>? Tu opinión nos ayuda a
              mejorar {SITE_NAME} ✨
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Button href={url} style={cta}>
              Valorar en 10 segundos →
            </Button>
            <Text style={ctaMicro}>Solo 10 segundos. Prometido.</Text>
          </Section>

          {tripChip && (
            <Section style={chipSection}>
              <Text style={chip}>📍 {tripChip}</Text>
            </Section>
          )}

          <Section style={contentSection}>
            <Text style={closing}>Gracias por viajar con {SITE_NAME} 🙌</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: TripPostDepartureEmail,
  subject: pickSubject,
  displayName: 'Feedback al día siguiente del viaje',
  previewData: {
    userName: 'Juan',
    tripName: 'Escapada a Lisboa',
    destination: 'Lisboa',
    startDate: '22 nov 2025',
    endDate: '26 nov 2025',
    feedbackUrl: 'https://www.yormit.com/feedback?token=demo',
  },
} satisfies TemplateEntry

// Styles — premium, ligero, mobile-first
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
}
const container = { margin: '0 auto', maxWidth: '560px', padding: '0' }
const header = {
  backgroundColor: '#0099dd',
  padding: '24px 24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}
const brand = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  letterSpacing: '2px',
  margin: '0',
}
const contentSection = { padding: '24px 28px 8px' }
const h1 = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  margin: '0 0 10px',
}
const lead = {
  color: '#1a1a1a',
  fontSize: '17px',
  lineHeight: '1.5',
  margin: '0',
}
const ctaSection = {
  padding: '20px 28px 8px',
  textAlign: 'center' as const,
}
const cta = {
  backgroundColor: '#0099dd',
  color: '#ffffff',
  fontSize: '17px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '12px',
  display: 'inline-block',
  boxShadow: '0 6px 16px rgba(0, 153, 221, 0.25)',
}
const ctaMicro = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '12px 0 0',
}
const chipSection = {
  padding: '4px 28px 8px',
  textAlign: 'center' as const,
}
const chip = {
  display: 'inline-block',
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '999px',
  color: '#0369a1',
  fontSize: '13px',
  padding: '6px 14px',
  margin: '0',
}
const closing = {
  color: '#1a1a1a',
  fontSize: '14px',
  margin: '8px 0 0',
  textAlign: 'center' as const,
}
