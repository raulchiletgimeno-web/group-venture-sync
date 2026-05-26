import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'YORMIT'

interface Props {
  severity?: string
  source?: string
  title?: string
  description?: string
  impact?: string
  recommendedAction?: string
  occurrences?: number
  firstSeenAt?: string
  eventKey?: string
}

function fmt(d?: string) {
  if (!d) return '-'
  try { return new Date(d).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return d }
}

const InternalAlertCriticalEmail = ({
  severity = 'critical', source = '-', title = 'Incidencia crítica',
  description = '', impact, recommendedAction, occurrences = 1, firstSeenAt, eventKey,
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>[CRÍTICO] {title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={badge}>● ALERTA CRÍTICA</Text>
          <Heading style={logo}>{SITE_NAME} · Sistema interno</Heading>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>{title}</Heading>

          <Section style={metaCard}>
            <Text style={metaRow}><strong>Severidad:</strong> {severity.toUpperCase()}</Text>
            <Text style={metaRow}><strong>Módulo:</strong> {source}</Text>
            <Text style={metaRow}><strong>Primera detección:</strong> {fmt(firstSeenAt)}</Text>
            <Text style={metaRow}><strong>Ocurrencias:</strong> {occurrences}</Text>
            {eventKey ? <Text style={metaRow}><strong>ID evento:</strong> {eventKey}</Text> : null}
          </Section>

          <Heading style={h2}>Descripción</Heading>
          <Text style={text}>{description}</Text>

          {impact ? (<><Heading style={h2}>Impacto</Heading><Text style={text}>{impact}</Text></>) : null}

          {recommendedAction ? (
            <Section style={actionCard}>
              <Text style={actionTitle}>Acción recomendada</Text>
              <Text style={actionText}>{recommendedAction}</Text>
            </Section>
          ) : null}

          <Hr style={divider} />
          <Text style={footerText}>
            Email automático de vigilancia interna. No reenviar.
            Solo verás otro correo de esta incidencia si reaparece tras resolverse.
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
  component: InternalAlertCriticalEmail,
  subject: (d: Record<string, any>) => `🚨 [YORMIT CRÍTICO] ${d.title || 'Incidencia'}`,
  displayName: 'Alerta interna crítica',
  previewData: {
    severity: 'critical', source: 'edge_function', title: 'Fallo en process-email-queue',
    description: 'La función ha devuelto 500 al procesar la cola de emails.',
    impact: 'Los emails en cola pueden no entregarse en tiempo.',
    recommendedAction: 'Revisar logs de process-email-queue y reintentar.',
    occurrences: 1, firstSeenAt: new Date().toISOString(), eventKey: 'edge:process-email-queue:500',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0b1f2a', padding: '24px 32px', borderRadius: '12px 12px 0 0' }
const badge = { fontSize: '11px', fontWeight: '700' as const, color: '#ff5c5c', letterSpacing: '2px', margin: '0 0 6px' }
const logo = { fontSize: '18px', fontWeight: '800' as const, color: '#ffffff', margin: '0', letterSpacing: '1px' }
const contentSection = { padding: '28px 32px 20px' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#1a2a3a', margin: '0 0 16px' }
const h2 = { fontSize: '14px', fontWeight: '700' as const, color: '#1a2a3a', margin: '20px 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const text = { fontSize: '14px', color: '#3a4a5a', lineHeight: '1.6', margin: '0 0 12px' }
const metaCard = { backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', margin: '8px 0 20px' }
const metaRow = { fontSize: '13px', color: '#3a4a5a', margin: '2px 0', lineHeight: '1.5' }
const actionCard = { backgroundColor: '#fff8e6', borderLeft: '3px solid #f5a623', padding: '12px 16px', borderRadius: '6px', margin: '16px 0' }
const actionTitle = { fontSize: '12px', fontWeight: '700' as const, color: '#8a5a00', margin: '0 0 4px', textTransform: 'uppercase' as const }
const actionText = { fontSize: '14px', color: '#3a4a5a', lineHeight: '1.5', margin: '0' }
const divider = { borderColor: '#e8ecf0', margin: '24px 0 16px' }
const footerText = { fontSize: '11px', color: '#8a9aaa', lineHeight: '1.5', margin: '0' }
const brandFooter = { backgroundColor: '#f8fafb', padding: '14px 32px', borderRadius: '0 0 12px 12px', textAlign: 'center' as const }
const brandText = { fontSize: '11px', color: '#8a9aaa', margin: '0' }
