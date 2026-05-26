import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'YORMIT'

interface Item {
  severity?: string
  source?: string
  title?: string
  description?: string
  occurrences?: number
  lastSeenAt?: string
}

interface Props {
  items?: Item[]
  total?: number
}

function fmt(d?: string) {
  if (!d) return '-'
  try { return new Date(d).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) } catch { return d }
}

const InternalAlertDigestEmail = ({ items = [], total = 0 }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Resumen diario de incidencias · {total} eventos</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={badge}>RESUMEN DIARIO</Text>
          <Heading style={logo}>{SITE_NAME} · Sistema interno</Heading>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>Incidencias de las últimas 24 horas</Heading>
          <Text style={text}>Total: <strong>{total}</strong> incidencia{total === 1 ? '' : 's'} (no críticas).</Text>

          {items.map((it, i) => (
            <Section key={i} style={itemCard}>
              <Text style={itemSeverity}>{(it.severity || '').toUpperCase()} · {it.source}</Text>
              <Text style={itemTitle}>{it.title}</Text>
              <Text style={itemDesc}>{it.description}</Text>
              <Text style={itemMeta}>Última: {fmt(it.lastSeenAt)} · Ocurrencias: {it.occurrences ?? 1}</Text>
            </Section>
          ))}

          <Hr style={divider} />
          <Text style={footerText}>
            Las incidencias críticas se notifican aparte de inmediato.
            Si no hay incidencias, no recibirás este correo.
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
  component: InternalAlertDigestEmail,
  subject: (d: Record<string, any>) => `📋 [YORMIT] Resumen diario · ${d.total || 0} incidencias`,
  displayName: 'Resumen diario interno',
  previewData: {
    total: 2,
    items: [
      { severity: 'warning', source: 'cron', title: 'check-trip-debts tardó más de lo esperado', description: 'Ejecución de 18s vs media 4s.', occurrences: 1, lastSeenAt: new Date().toISOString() },
      { severity: 'info', source: 'db', title: 'Pico de errores leves en logs', description: '12 entradas WARNING en última hora.', occurrences: 3, lastSeenAt: new Date().toISOString() },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0b1f2a', padding: '24px 32px', borderRadius: '12px 12px 0 0' }
const badge = { fontSize: '11px', fontWeight: '700' as const, color: '#7ad6ff', letterSpacing: '2px', margin: '0 0 6px' }
const logo = { fontSize: '18px', fontWeight: '800' as const, color: '#ffffff', margin: '0', letterSpacing: '1px' }
const contentSection = { padding: '28px 32px 20px' }
const h1 = { fontSize: '20px', fontWeight: '700' as const, color: '#1a2a3a', margin: '0 0 12px' }
const text = { fontSize: '14px', color: '#3a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const itemCard = { borderLeft: '3px solid #0099dd', backgroundColor: '#f7fafc', padding: '12px 14px', borderRadius: '6px', margin: '10px 0' }
const itemSeverity = { fontSize: '11px', fontWeight: '700' as const, color: '#0099dd', letterSpacing: '1px', margin: '0 0 4px' }
const itemTitle = { fontSize: '14px', fontWeight: '700' as const, color: '#1a2a3a', margin: '0 0 4px' }
const itemDesc = { fontSize: '13px', color: '#3a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
const itemMeta = { fontSize: '11px', color: '#8a9aaa', margin: '0' }
const divider = { borderColor: '#e8ecf0', margin: '20px 0 12px' }
const footerText = { fontSize: '11px', color: '#8a9aaa', lineHeight: '1.5', margin: '0' }
const brandFooter = { backgroundColor: '#f8fafb', padding: '14px 32px', borderRadius: '0 0 12px 12px', textAlign: 'center' as const }
const brandText = { fontSize: '11px', color: '#8a9aaa', margin: '0' }
