

## Validación de email obligatoria en el registro de YORMIT

### Situación actual

- El registro ya usa `supabase.auth.signUp` con `emailRedirectTo`, y el mensaje post-registro dice "Revisa tu email para confirmar tu cuenta"
- **Pero** la app no verifica si el email está confirmado: `ProtectedRoute` solo comprueba si hay sesión, no si `email_confirmed_at` existe
- Si auto-confirm está activo en el backend, los usuarios entran directamente sin verificar nada

### Cambios necesarios

#### 1. Desactivar auto-confirmación de email (backend)
Usar `cloud--configure_auth` para asegurar que `enable_signup = true` y `double_confirm_changes = true` y que auto-confirm esté **desactivado**. Esto hace que el usuario reciba un email de confirmación real y no pueda hacer login hasta confirmarlo.

#### 2. Pantalla de verificación pendiente (`Auth.tsx`)
Tras un registro exitoso, en lugar de solo mostrar un toast, cambiar a un estado `"check-email"` que muestre:
- Icono de email (Mail)
- Título: "Verifica tu correo electrónico"
- Texto: "Hemos enviado un email de verificación a **{email}**. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta en YORMIT."
- Botón "Reenviar email de verificación" que llama a `supabase.auth.resend({ type: 'signup', email })`
- Enlace "Volver al inicio de sesión" para cambiar a modo login

#### 3. Bloqueo en `ProtectedRoute.tsx`
Añadir comprobación: si el usuario tiene sesión pero `user.email_confirmed_at` es `null`, redirigir a `/auth` (o mostrar la pantalla de verificación pendiente). Esto impide acceso a la app sin email verificado.

#### 4. Control en login (`Auth.tsx`)
Tras un login exitoso, si `session.user.email_confirmed_at` es falsy, mostrar la pantalla de verificación pendiente en vez de navegar al dashboard.

#### 5. Traducciones (`translations.ts`)
Añadir las siguientes claves en los 7 idiomas:
- `verifyEmailTitle` — "Verifica tu correo electrónico"
- `verifyEmailDesc` — "Hemos enviado un email de verificación a {email}..."
- `resendVerification` — "Reenviar email de verificación"
- `resendVerificationSuccess` — "Email reenviado correctamente"
- `resendVerificationDesc` — "Revisa tu bandeja de entrada"
- `backToLogin` — "Volver al inicio de sesión"
- `emailNotVerified` — "Tu email aún no ha sido verificado"

#### 6. `AuthContext.tsx` — Añadir `resendVerificationEmail`
Exponer una función `resendVerificationEmail(email: string)` que llame a `supabase.auth.resend({ type: 'signup', email })`.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/Auth.tsx` | Nuevo estado `check-email`, pantalla de verificación, botón reenviar |
| `src/components/ProtectedRoute.tsx` | Comprobar `email_confirmed_at` |
| `src/contexts/AuthContext.tsx` | Añadir `resendVerificationEmail` |
| `src/i18n/translations.ts` | Nuevas claves en 7 idiomas |

No se toca ninguna otra parte de la app.

