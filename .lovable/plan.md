

## Cambio del remitente visible a "YORMIT"

### Cambio único

En `supabase/functions/send-transactional-email/index.ts`, línea 8:

- **Antes:** `const SITE_NAME = "group-venture-sync"`
- **Después:** `const SITE_NAME = "YORMIT"`

### Resultado

El remitente visible en los emails pasará de:

`group-venture-sync <noreply@notify.mail.yormit.com>`

a:

**`YORMIT <noreply@notify.mail.yormit.com>`**

### Lo que NO se toca

- No se cambia `SENDER_DOMAIN` ni `FROM_DOMAIN` (siguen siendo `notify.mail.yormit.com`, que es el dominio verificado)
- No se toca ninguna plantilla de email
- No se toca la lógica de recordatorios ni de deudas
- No se toca ningún otro fichero de la app

### Despliegue

Se redesplegará únicamente la función `send-transactional-email` para que el cambio entre en vigor.

