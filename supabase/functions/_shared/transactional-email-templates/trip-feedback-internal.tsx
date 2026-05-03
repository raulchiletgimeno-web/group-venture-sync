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

interface FeedbackInternalProps {
  tripName?: string
  destination?: string
  userName?: string
  userEmail?: string
  rating?: number
  sectionsUsed?: string[]
  mostUsefulSection?: string
  sectionToImprove?: string
  missingFeature?: string
  whatToChange?: string
  wouldUseAgain?: string
  freeComment?: string
  profileFirstName?: string
  profileLastName?: string
  profileAge?: number
  profileResidence?: string
  profileTravelsWith?: string
  submittedAt?: string
}

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  if (value === undefined || value === null || value === '') return null
  return (
    <Text style={row}>
      <span style={rowLabel}>{label}:</span> {value}
    </Text>
  )
}

const InternalFeedbackEmail = (props: FeedbackInternalProps) => {
  const stars =
    typeof props.rating === 'number'
      ? '⭐'.repeat(Math.max(1, Math.min(5, props.rating)))
      : ''

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>{`Nuevo feedback YORMIT — ${stars || 'sin valoración'} — ${props.tripName ?? ''}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>YORMIT · Feedback</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading style={h1}>Nuevo feedback recibido</Heading>
            <Text style={ratingBig}>
              {stars} {props.rating ? `(${props.rating}/5)` : ''}
            </Text>
          </Section>

          <Section style={card}>
            <Text style={cardTitle}>Viaje</Text>
            <Row label="Nombre del viaje" value={props.tripName} />
            <Row label="Destino" value={props.destination} />
          </Section>

          <Section style={card}>
            <Text style={cardTitle}>Usuario</Text>
            <Row label="Nombre en YORMIT" value={props.userName} />
            <Row label="Email" value={props.userEmail} />
            <Row label="Enviado" value={props.submittedAt} />
          </Section>

          <Section style={card}>
            <Text style={cardTitle}>Respuestas</Text>
            <Row
              label="Secciones más usadas"
              value={
                props.sectionsUsed && props.sectionsUsed.length
                  ? props.sectionsUsed.join(', ')
                  : undefined
              }
            />
            <Row label="Sección más útil" value={props.mostUsefulSection} />
            <Row label="Sección a mejorar" value={props.sectionToImprove} />
            <Row label="Funcionalidad que echa de menos" value={props.missingFeature} />
            <Row label="Qué cambiaría" value={props.whatToChange} />
            <Row label="¿Volvería a usar YORMIT?" value={props.wouldUseAgain} />
            <Row label="Comentario libre" value={props.freeComment} />
          </Section>

          {(props.profileFirstName ||
            props.profileLastName ||
            props.profileAge ||
            props.profileResidence ||
            props.profileTravelsWith) && (
            <Section style={card}>
              <Text style={cardTitle}>Perfil opcional</Text>
              <Row label="Nombre" value={props.profileFirstName} />
              <Row label="Primer apellido" value={props.profileLastName} />
              <Row label="Edad" value={props.profileAge} />
              <Row label="Lugar de residencia" value={props.profileResidence} />
              <Row label="Suele viajar con" value={props.profileTravelsWith} />
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: InternalFeedbackEmail,
  subject: (d: Record<string, any>) =>
    `📝 Feedback YORMIT — ${typeof d.rating === 'number' ? d.rating + '★ ' : ''}${d.tripName ?? ''}`,
  to: 'info@yormit.com',
  displayName: 'Feedback interno (info@yormit.com)',
  previewData: {
    tripName: 'Escapada a Lisboa',
    destination: 'Lisboa',
    userName: 'Juan Ga.',
    userEmail: 'juan@example.com',
    rating: 5,
    sectionsUsed: ['Chat', 'Fotos', 'Gastos'],
    mostUsefulSection: 'Gastos',
    sectionToImprove: 'Itinerario',
    missingFeature: 'Modo offline',
    whatToChange: 'Más rapidez al subir fotos',
    wouldUseAgain: 'Sí',
    freeComment: 'Me encanta la app, súper útil para viajar en grupo.',
    profileFirstName: 'Juan',
    profileLastName: 'García',
    profileAge: 30,
    profileResidence: 'Madrid',
    profileTravelsWith: 'amigos',
    submittedAt: '03 may 2026 18:30',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
}
const container = { margin: '0 auto', maxWidth: '640px', padding: '0' }
const header = {
  backgroundColor: '#0099dd',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}
const brand = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  letterSpacing: '1.5px',
  margin: '0',
}
const contentSection = { padding: '20px 28px' }
const h1 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  margin: '0 0 8px',
}
const ratingBig = {
  color: '#0099dd',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  margin: '0',
}
const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '16px 20px',
  margin: '8px 28px 12px',
}
const cardTitle = {
  color: '#0369a1',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 10px',
}
const row = {
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 6px',
}
const rowLabel = { color: '#475569', fontWeight: 'bold' as const }
