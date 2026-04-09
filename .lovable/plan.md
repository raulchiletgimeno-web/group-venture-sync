

## Configurar emails de recordatorio de deuda en YORMIT

### Estado actual

No hay ningún dominio de email configurado en tu proyecto. Para que YORMIT pueda enviar emails reales a los deudores, primero necesitamos configurar un dominio de envío.

### Qué sistema se usará

YORMIT usará el sistema de emails integrado en Lovable Cloud. No necesitas crear cuentas en servicios externos ni obtener claves de API. Todo se gestiona desde tu proyecto.

### Lo que necesito de ti

**Paso 1: Configurar tu dominio de email**

Necesitas tener un dominio propio (ya tienes `yormit.com`). El sistema configurará un subdominio de envío (por ejemplo `notify.yormit.com`) para que los emails salgan desde una dirección como `noreply@yormit.com`.

Tendrás que añadir unos registros DNS en tu proveedor de dominio (donde gestionas `yormit.com`). El propio asistente de configuración te indicará exactamente qué registros añadir.

**Paso 2: Una vez configurado el dominio, yo haré lo siguiente**

1. Configurar la infraestructura de email (colas, tablas de seguimiento, envío automático)
2. Crear la plantilla de email de recordatorio de deuda con el tono simpático y premium que ya tenemos
3. Integrar el envío de email en la Edge Function `check-trip-debts` que ya funciona para los mensajes del chat
4. Desplegar todo automáticamente

### Tono del email

Mantendré el mismo espíritu de los mensajes del chat: cercano, divertido, entre amigos. El email incluirá:
- Nombre del deudor
- Importe pendiente
- Nombre del acreedor
- Recordatorio de entrar en Gastos para ajustarlo
- Variedad de asuntos y cuerpos (rotación aleatoria)

### Remitente

Los emails saldrán desde una dirección tipo `noreply@yormit.com` con el nombre visible "YORMIT".

### Ficheros que se modificarán (después de configurar el dominio)

| Fichero | Cambio |
|---|---|
| `supabase/functions/check-trip-debts/index.ts` | Añadir lógica de envío de email al deudor |
| Plantilla de email (nueva) | Template React Email con el tono definido |
| Registry de plantillas | Registrar la nueva plantilla |

**No se toca ningún otro fichero de la app.**

### Siguiente paso

Haz clic en el botón de abajo para configurar tu dominio de email. El asistente te guiará paso a paso.

<lov-actions>
<lov-open-email-setup>Configurar dominio de email</lov-open-email-setup>
</lov-actions>

