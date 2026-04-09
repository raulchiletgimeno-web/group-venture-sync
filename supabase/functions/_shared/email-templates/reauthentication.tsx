/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación en YORMIT</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logo}>YORMIT</Text>
        </Section>

        <Heading style={h1}>Código de verificación</Heading>

        <Text style={text}>Hola,</Text>

        <Text style={text}>
          Usa el siguiente código para confirmar tu identidad en{' '}
          <strong>YORMIT</strong>:
        </Text>

        <Text style={codeStyle}>{token}</Text>

        <Hr style={hr} />

        <Text style={footer}>
          Este código caducará en breve. Si no lo has solicitado, puedes ignorar
          este mensaje.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "'Plus Jakarta Sans', Courier, monospace",
  fontSize: '28px',
  fontWeight: '800' as const,
  color: '#1a9cd4',
  margin: '8px 0 28px',
  textAlign: 'center' as const,
  letterSpacing: '4px',
}
const hr = { borderColor: '#e8eaed', margin: '24px 0' }
const footer = {
  fontSize: '12px',
  color: '#a0a7b4',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}
