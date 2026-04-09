

## Personalizar el email de verificación de registro de YORMIT

### Situación actual

- El dominio de email `notify.mail.yormit.com` está verificado y activo
- No existen plantillas de auth email personalizadas — se usan las plantillas por defecto de Lovable
- La infraestructura de email (colas, cron, etc.) ya está configurada

### Qué voy a hacer

#### 1. Crear las plantillas de auth email personalizadas

Usaré la herramienta de scaffolding para generar las 6 plantillas de auth email (signup, recovery, magic-link, invite, email-change, reauthentication) y el edge function `auth-email-hook`.

#### 2. Personalizar la plantilla de signup (verificación de registro)

Aplicaré el branding de YORMIT con estos elementos:

**Colores extraídos del proyecto:**
- Primary: `hsl(200, 80%, 50%)` — azul YORMIT
- Foreground: `hsl(215, 30%, 12%)` — texto oscuro
- Muted foreground: `hsl(215, 12%, 50%)` — texto secundario
- Border radius: `0.75rem`
- Font: Plus Jakarta Sans (con fallback Arial)
- Fondo del email: `#ffffff`

**Asunto:**
> Verifica tu correo y activa tu cuenta en YORMIT

**Contenido del email:**
- Marca YORMIT visible en la cabecera (texto con estilo, sin imagen externa)
- Saludo: "Hola,"
- Bienvenida: "Te damos la bienvenida a YORMIT."
- Texto: "Ya casi está todo listo. Solo falta verificar tu correo electrónico para activar tu cuenta y empezar a usar la app con normalidad."
- Botón azul YORMIT: "Verificar mi cuenta"
- Texto alternativo con enlace por si el botón no funciona
- Nota discreta: "Si no has solicitado esta cuenta, puedes ignorar este mensaje."
- Cierre: "Gracias por confiar en YORMIT. Nos vemos dentro."

#### 3. Aplicar branding a las demás plantillas de auth

Las otras 5 plantillas (recovery, magic-link, etc.) también recibirán el branding de YORMIT para consistencia visual, aunque el foco principal es signup.

#### 4. Desplegar el edge function

Desplegar `auth-email-hook` para que los emails personalizados se activen.

### Ficheros que se crearán/modificarán

| Fichero | Acción |
|---------|--------|
| `supabase/functions/auth-email-hook/index.ts` | Crear (scaffold) |
| `supabase/functions/auth-email-hook/deno.json` | Crear (scaffold) |
| `supabase/functions/_shared/email-templates/signup.tsx` | Crear y personalizar |
| `supabase/functions/_shared/email-templates/recovery.tsx` | Crear y personalizar |
| `supabase/functions/_shared/email-templates/magic-link.tsx` | Crear y personalizar |
| `supabase/functions/_shared/email-templates/invite.tsx` | Crear y personalizar |
| `supabase/functions/_shared/email-templates/email-change.tsx` | Crear y personalizar |
| `supabase/functions/_shared/email-templates/reauthentication.tsx` | Crear y personalizar |

### Lo que NO se toca

- Ningún fichero de la app (Auth.tsx, ProtectedRoute.tsx, AuthContext.tsx, etc.)
- Ninguna lógica de registro ni verificación
- Ninguna otra pantalla ni funcionalidad

