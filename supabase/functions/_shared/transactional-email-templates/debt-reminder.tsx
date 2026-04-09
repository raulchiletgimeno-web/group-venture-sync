import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "YORMIT"

interface DebtReminderProps {
  debtorName?: string
  creditorName?: string
  amount?: string
  tripName?: string
  message?: string
}

function cleanAmount(raw: string | undefined): string {
  return (raw || '?').replace(/\s*€/g, '').trim()
}

const EMAIL_SUBJECTS = [
  (data: Record<string, any>) => `💸 ${data.debtorName || 'Amigo/a'}, tienes una cuenta pendiente`,
  (data: Record<string, any>) => `🔔 ${SITE_NAME} te recuerda: deuda pendiente de ${cleanAmount(data.amount)} €`,
  (data: Record<string, any>) => `😉 ${data.debtorName || 'Hey'}, ¿nos ponemos al día con las cuentas?`,
  (data: Record<string, any>) => `🤖 Recordatorio de ${SITE_NAME}: ${cleanAmount(data.amount)} € pendientes`,
  (data: Record<string, any>) => `☕ ${data.debtorName || 'Oye'}, queda una cosita por cuadrar...`,
]

function pickSubject(data: Record<string, any>): string {
  const idx = Math.floor(Math.random() * EMAIL_SUBJECTS.length)
  return EMAIL_SUBJECTS[idx](data)
}

const DebtReminderEmail = ({
  debtorName = 'Amigo/a',
  creditorName = 'tu compañero/a',
  amount: rawAmount = '0.00',
  tripName = 'el viaje',
  message,
}: DebtReminderProps) => {
  const amount = rawAmount.replace(/\s*€/g, '').trim()
  return (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tienes {amount} € pendientes con {creditorName} del viaje "{tripName}"</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={headerSection}>
          <Heading style={logo}>{SITE_NAME}</Heading>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>
            ¡Hola, {debtorName}! 👋
          </Heading>

          <Text style={text}>
            Te escribimos desde <strong>{SITE_NAME}</strong> porque todavía tienes una deuda pendiente
            del viaje <strong>"{tripName}"</strong>.
          </Text>

          <Section style={debtCard}>
            <Text style={debtAmount}>{amount} €</Text>
            <Text style={debtDetail}>pendientes con <strong>{creditorName}</strong></Text>
          </Section>

          <Text style={text}>
            Puedes pagarle por <strong>Bizum</strong>, <strong>transferencia</strong> o como prefiráis.
            Después, entra en la sección de <strong>Gastos</strong> del viaje y ajústalo para que deje
            de aparecer como pendiente.
          </Text>

          {message && (
            <>
              <Hr style={divider} />
              <Text style={botMessage}>
                💬 <em>{message}</em>
              </Text>
            </>
          )}

          <Hr style={divider} />

          <Text style={footerText}>
            Este email se envía automáticamente porque el viaje ha terminado y aún hay cuentas pendientes.
            Cuando ajustes el gasto en la app, dejarás de recibir estos recordatorios.
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
  component: DebtReminderEmail,
  subject: pickSubject,
  displayName: 'Recordatorio de deuda',
  previewData: {
    debtorName: 'Carlos',
    creditorName: 'María',
    amount: '42.50',
    tripName: 'Fin de semana en Lisboa',
    message: '🤖 Venga Carlos, que María está esperando esos 42.50 €. ¡Un Bizum y listo!',
  },
} satisfies TemplateEntry

// Styles
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
const debtCard = {
  backgroundColor: '#f0f8ff',
  border: '1px solid #d0e8f8',
  borderRadius: '10px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '20px 0',
}
const debtAmount = {
  fontSize: '36px',
  fontWeight: '800' as const,
  color: '#0099dd',
  margin: '0 0 4px',
}
const debtDetail = {
  fontSize: '14px',
  color: '#5a6a7a',
  margin: '0',
}
const divider = { borderColor: '#e8ecf0', margin: '24px 0' }
const botMessage = {
  fontSize: '14px',
  color: '#5a6a7a',
  lineHeight: '1.5',
  backgroundColor: '#fafafa',
  padding: '12px 16px',
  borderRadius: '8px',
  borderLeft: '3px solid #0099dd',
  margin: '0',
}
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
