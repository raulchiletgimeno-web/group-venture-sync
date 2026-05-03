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
  (d) => `✨ ¿Qué tal ha ido tu experiencia con YORMIT en ${d.tripName ?? 'tu viaje'}?`,
  (d) => `💬 Cuéntanos cómo ha sido ${d.tripName ?? 'tu viaje'} con YORMIT`,
  (_d) => `⭐ Tu opinión nos ayuda a mejorar YORMIT`,
  (_d) => `🙌 Gracias por viajar con YORMIT, ¿nos cuentas tu experiencia?`,
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
  const dest = destination ?? ''
  const url = feedbackUrl ?? 'https://www.yormit.com'

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{`¿Qué tal ha ido ${tName}? Cuéntanos en 2 minutos`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>{SITE_NAME}</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading style={h1}>¡Hola, {greetingName}! 👋</Heading>
            <Text style={lead}>
              Esperamos que hayas disfrutado mucho de <strong>{tName}</strong> 😊
            </Text>
            <Text style={text}>
              Ahora que el viaje ya ha terminado, nos encantaría conocer tu
              experiencia con {SITE_NAME} para seguir mejorando la app y hacer
              que cada viaje en grupo sea todavía más fácil, cómodo y útil.
            </Text>
          </Section>

          {(dest || startDate || endDate) && (
            <Section style={card}>
              <Text style={cardTitle}>Tu viaje</Text>
              {dest && (
                <Text style={cardRow}>
                  <span style={cardLabel}>📍 Destino:</span> {dest}
                </Text>
              )}
              {(startDate || endDate) && (
                <Text style={cardRow}>
                  <span style={cardLabel}>📅 Fechas:</span>{' '}
                  {startDate ?? ''}
                  {startDate && endDate ? ' – ' : ''}
                  {endDate ?? ''}
                </Text>
              )}
            </Section>
          )}

          <Section style={contentSection}>
            <Heading style={h2}>⭐ Tu opinión nos importa</Heading>
            <Text style={text}>
              Solo te llevará un par de minutos. Cuéntanos qué tal ha ido,
              qué te ha gustado, qué mejorarías y qué te ha faltado.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Button href={url} style={cta}>
              Compartir mi experiencia ✨
            </Button>
            <Text style={ctaFallback}>
              O abre este enlace:{' '}
              <span style={ctaUrl}>{url}</span>
            </Text>
          </Section>

          <Section style={contentSection}>
            <Text style={closing}>
              Gracias por formar parte de {SITE_NAME} y por ayudarnos a seguir
              mejorando. Tu opinión nos importa de verdad. 🙌
            </Text>
            <Text style={tagline}>
              Seguimos mejorando viaje a viaje ✈️
            </Text>
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
    userName: 'Juan Ga.',
    tripName: 'Escapada a Lisboa',
    destination: 'Lisboa',
    startDate: '22 nov 2025',
    endDate: '26 nov 2025',
    feedbackUrl: 'https://www.yormit.com/feedback?token=demo',
  },
} satisfies TemplateEntry

// Styles — consistentes con trip-pre-departure
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
}
const container = { margin: '0 auto', maxWidth: '600px', padding: '0' }
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
const contentSection = { padding: '24px 28px' }
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
const cardLabel = { color: '#475569', fontWeight: 'bold' as const }
const ctaSection = {
  padding: '8px 28px 24px',
  textAlign: 'center' as const,
}
const cta = {
  backgroundColor: '#0099dd',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  padding: '14px 28px',
  borderRadius: '10px',
  display: 'inline-block',
}
const ctaFallback = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '14px 0 0',
  wordBreak: 'break-all' as const,
}
const ctaUrl = { color: '#0099dd' }
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
