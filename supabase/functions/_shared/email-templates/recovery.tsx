/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Restablece tu contraseña en YORMIT</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logo}>YORMIT</Text>
        </Section>

        <Heading style={h1}>Restablece tu contraseña</Heading>

        <Text style={text}>Hola,</Text>

        <Text style={text}>
          Hemos recibido una solicitud para restablecer la contraseña de tu
          cuenta en <strong>YORMIT</strong>. Pulsa el botón para elegir una
          nueva contraseña.
        </Text>

        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Restablecer contraseña
          </Button>
        </Section>

        <Text style={altText}>
          Si el botón no funciona, copia y pega este enlace en tu navegador:
        </Text>
        <Text style={urlText}>
          <Link href={confirmationUrl} style={link}>
            {confirmationUrl}
          </Link>
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Si no has solicitado este cambio, puedes ignorar este mensaje. Tu
          contraseña no se modificará.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = {
  backgroundColor: '#f4f6f8',
  fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
}
const container = {
  backgroundColor: '#ffffff',
  padding: '40px 32px',
  margin: '40px auto',
  maxWidth: '480px',
  borderRadius: '12px',
}
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = {
  fontSize: '28px',
  fontWeight: '800' as const,
  color: '#1a9cd4',
  letterSpacing: '2px',
  margin: '0',
}
const h1 = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#161f2b',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '15px',
  color: '#161f2b',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const buttonSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = {
  backgroundColor: '#1a9cd4',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 32px',
  textDecoration: 'none',
}
const altText = {
  fontSize: '13px',
  color: '#707a8a',
  lineHeight: '1.5',
  margin: '0 0 4px',
}
const urlText = {
  fontSize: '12px',
  color: '#707a8a',
  lineHeight: '1.5',
  margin: '0 0 24px',
  wordBreak: 'break-all' as const,
}
const link = { color: '#1a9cd4', textDecoration: 'underline' }
const hr = { borderColor: '#e8eaed', margin: '24px 0' }
const footer = {
  fontSize: '12px',
  color: '#a0a7b4',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}
