import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'YORMIT'

interface Props {
  title?: string
  source?: string
  firstSeenAt?: string
  resolvedAt?: string
  occurrences?: number
  resolutionNotes?: string
}

function fmt(d?: string) {
  if (!d) return '-'
  try { return new Date(d).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return d }
}

const InternalAlertResolvedEmail = ({
  title = 'Incidencia', source = '-', firstSeenAt, resolvedAt, occurrences = 1, resolutionNotes,
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Resuelta: {title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={badge}>● RESUELTA</Text>
          <Heading style={logo}>{SITE_NAME} · Sistema interno</Heading>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>{title}</Heading>

          <Section style={metaCard}>
            <Text style={metaRow}><strong>Módulo:</strong> {source}</Text>
            <Text style={metaRow}><strong>Apareció:</strong> {fmt(firstSeenAt)}</Text>
            <Text style={metaRow}><strong>Resuelta:</strong> {fmt(resolvedAt)}</Text>
            <Text style={metaRow}><strong>Ocurrencias totales:</strong> {occurrences}</Text>
          </Section>

          {resolutionNotes ? (
            <>
              <Heading style={h2}>Notas de resolución</Heading>
              <Text style={text}>{resolutionNotes}</Text>
            </>
          ) : (
            <Text style={text}>No quedan acciones pendientes asociadas a esta incidencia.</Text>
          )}

          <Hr style={divider} />
          <Text style={footerText}>
            Email automático de vigilancia interna. Si la incidencia reaparece, recibirás una nueva alerta crítica.
          </Text>
        </Section>

        <Section style={brandFooter}>
          <Text style={brandText}>{SITE_NAME} · Internal monitoring</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InternalAlertResolvedEmail,
  subject: (d: Record<string, any>) => `✅ [YORMIT] Resuelta: ${d.title || 'incidencia'}`,
  displayName: 'Alerta interna resuelta',
  previewData: {
    title: 'Fallo en process-email-queue',
    source: 'edge_function',
    firstSeenAt: new Date(Date.now() - 3600_000).toISOString(),
    resolvedAt: new Date().toISOString(),
    occurrences: 3,
    resolutionNotes: 'Reintentos manuales correctos. Causa raíz: timeout puntual.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0b1f2a', padding: '24px 32px', borderRadius: '12px 12px 0 0' }
const badge = { fontSize: '11px', fontWeight: '700' as const, color: '#7be0a6', letterSpacing: '2px', margin: '0 0 6px' }
const logo = { fontSize: '18px', fontWeight: '800' as const, color: '#ffffff', margin: '0', letterSpacing: '1px' }
const contentSection = { padding: '28px 32px 20px' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#1a2a3a', margin: '0 0 16px' }
const h2 = { fontSize: '14px', fontWeight: '700' as const, color: '#1a2a3a', margin: '20px 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const text = { fontSize: '14px', color: '#3a4a5a', lineHeight: '1.6', margin: '0 0 12px' }
const metaCard = { backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', margin: '8px 0 20px' }
const metaRow = { fontSize: '13px', color: '#3a4a5a', margin: '2px 0', lineHeight: '1.5' }
const divider = { borderColor: '#e8ecf0', margin: '20px 0 12px' }
const footerText = { fontSize: '11px', color: '#8a9aaa', lineHeight: '1.5', margin: '0' }
const brandFooter = { backgroundColor: '#f8fafb', padding: '14px 32px', borderRadius: '0 0 12px 12px', textAlign: 'center' as const }
const brandText = { fontSize: '11px', color: '#8a9aaa', margin: '0' }
