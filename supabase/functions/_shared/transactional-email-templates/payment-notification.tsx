import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YORMIT"

interface PaymentNotificationProps {
  debtorName?: string
  creditorName?: string
  amount?: string
  tripName?: string
  paymentMethod?: string
  paidAt?: string
}

const METHOD_LABELS: Record<string, string> = {
  bizum: 'Bizum',
  transfer: 'Transferencia bancaria',
  cash: 'Efectivo',
  other: 'Otro método',
}

const EMAIL_SUBJECTS = [
  (data: Record<string, any>) => `💰 ¡Buenas noticias! ${data.debtorName || 'Alguien'} te ha pagado`,
  (data: Record<string, any>) => `🎉 ${data.debtorName || 'Tu compañero/a'} ha saldado su deuda contigo`,
  (data: Record<string, any>) => `✅ Pago registrado: ${data.amount || '?'} € de ${data.debtorName || 'tu compañero/a'}`,
  (data: Record<string, any>) => `💸 ¡Cha-ching! ${data.debtorName || 'Alguien'} ha marcado un pago de ${data.amount || '?'} €`,
  (data: Record<string, any>) => `🙌 ${data.debtorName || 'Tu amigo/a'} dice que ya te ha pagado`,
]

function pickSubject(data: Record<string, any>): string {
  const idx = Math.floor(Math.random() * EMAIL_SUBJECTS.length)
  return EMAIL_SUBJECTS[idx](data)
}

function formatDate(iso: string | undefined): string {
  if (!iso) return 'hoy'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return 'hoy'
  }
}

const PaymentNotificationEmail = ({
  debtorName = 'Tu compañero/a',
  creditorName = 'amigo/a',
  amount = '0.00',
  tripName = 'el viaje',
  paymentMethod = 'other',
  paidAt,
}: PaymentNotificationProps) => {
  const cleanAmount = amount.replace(/\s*€/g, '').trim()
  const methodLabel = METHOD_LABELS[paymentMethod] || METHOD_LABELS.other
  const dateStr = formatDate(paidAt)

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>¡Buenas noticias! {debtorName} te ha pagado {cleanAmount} € del viaje "{tripName}"</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Heading style={logo}>{SITE_NAME}</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading style={h1}>
              ¡Buenas noticias, {creditorName}! 🎉
            </Heading>

            <Text style={text}>
              <strong>{debtorName}</strong> ha marcado como pagada su deuda contigo
              del viaje <strong>"{tripName}"</strong>. ¡Parece que las cuentas se van cuadrando!
            </Text>

            <Section style={paymentCard}>
              <Text style={paymentAmount}>{cleanAmount} €</Text>
              <Text style={paymentDetail}>pagados por <strong>{debtorName}</strong></Text>
            </Section>

            <Section style={detailsBox}>
              <Text style={detailRow}>
                📱 <strong>Método de pago:</strong> {methodLabel}
              </Text>
              <Text style={detailRow}>
                📅 <strong>Fecha:</strong> {dateStr}
              </Text>
            </Section>

            <Text style={text}>
              Si todo te cuadra, ¡genial! No tienes que hacer nada más.
              Si algo no encaja, siempre puedes revisarlo en la sección de <strong>Gastos</strong> del viaje en {SITE_NAME}.
            </Text>

            <Hr style={divider} />

            <Text style={footerText}>
              Este email se envía automáticamente cuando un compañero de viaje marca un pago como realizado.
            </Text>
          </Section>

          <Section style={brandFooter}>
            <Text style={brandText}>
              Enviado con ❤️ por {SITE_NAME} · Tu app de viajes en grupo
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PaymentNotificationEmail,
  subject: pickSubject,
  displayName: 'Notificación de pago recibido',
  previewData: {
    debtorName: 'Carlos',
    creditorName: 'María',
    amount: '42.50',
    tripName: 'Fin de semana en Lisboa',
    paymentMethod: 'bizum',
    paidAt: new Date().toISOString(),
  },
} satisfies TemplateEntry

// Styles (matching debt-reminder.tsx)
const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '0 auto' }
const headerSection = {
  backgroundColor: '#0099dd',
  padding: '24px 32px',
  borderRadius: '12px 12px 0 0',
  textAlign: 'center' as const,
}
const logo = {
  fontSize: '28px',
  fontWeight: '800' as const,
  color: '#ffffff',
  margin: '0',
  letterSpacing: '2px',
}
const contentSection = { padding: '32px 32px 24px' }
const h1 = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#1a2a3a',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#3a4a5a',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const paymentCard = {
  backgroundColor: '#f0fff4',
  border: '1px solid #c6f6d5',
  borderRadius: '10px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '20px 0',
}
const paymentAmount = {
  fontSize: '36px',
  fontWeight: '800' as const,
  color: '#22c55e',
  margin: '0 0 4px',
}
const paymentDetail = {
  fontSize: '14px',
  color: '#5a6a7a',
  margin: '0',
}
const detailsBox = {
  backgroundColor: '#fafafa',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 20px',
}
const detailRow = {
  fontSize: '14px',
  color: '#3a4a5a',
  lineHeight: '1.6',
  margin: '0 0 8px',
}
const divider = { borderColor: '#e8ecf0', margin: '24px 0' }
const footerText = {
  fontSize: '12px',
  color: '#8a9aaa',
  lineHeight: '1.5',
  margin: '0',
}
const brandFooter = {
  backgroundColor: '#f8fafb',
  padding: '16px 32px',
  borderRadius: '0 0 12px 12px',
  textAlign: 'center' as const,
}
const brandText = {
  fontSize: '12px',
  color: '#8a9aaa',
  margin: '0',
}
