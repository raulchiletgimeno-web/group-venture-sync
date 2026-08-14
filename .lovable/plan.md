# Prueba controlada de emails automáticos (info@yormit.com)

Objetivo: validar de extremo a extremo el email pre-viaje y el post-viaje sin afectar a viajes reales ni a otros usuarios.

## Datos de la prueba

Cuenta destinataria: `info@yormit.com` (perfil existente, único miembro aprobado de ambos viajes).

Viajes que se crearán (identificados como TEST):

- `[TEST] Prueba pre-viaje YORMIT` — inicio = hoy + 2 días, fin = hoy + 4 días.
- `[TEST] Prueba post-viaje YORMIT` — inicio = hoy - 4 días, fin = ayer.

Ambos con destino real (por ejemplo Logroño, España) para que la meteorología pueda resolverse, `created_by` = perfil de info@yormit.com, y un único registro en miembros con rol creador y estado aprobado.

## Pasos

1. Crear los dos viajes de prueba y sus miembros (solo info@yormit.com).
2. Invocar `check-trip-pre-departure` con `force_trip_id` del primer viaje.
3. Invocar `check-trip-post-departure` con `force_trip_id` del segundo viaje.
4. Repetir ambas invocaciones una segunda vez para comprobar que no hay duplicados.
5. Revisar `email_send_log`, logs de las funciones y token de feedback generado; comprobar que el enlace de feedback responde.

## Comprobaciones

Pre-viaje: función ejecutada, email generado, destinatario correcto, estado en logs, aceptación del proveedor, checklist presente, bloque meteorológico presente o email enviado igualmente si falla/timeout, sin duplicado en la segunda ejecución.

Post-viaje: función ejecutada, email generado, destinatario correcto, token de feedback válido y enlace operativo, estado en logs, aceptación del proveedor, sin duplicado.

## Garantías

- Solo se usa `force_trip_id`; no se procesan viajes reales.
- No se modifican crons, plantillas, horarios ni lógica de las funciones.
- No se toca ningún otro archivo de la aplicación.
- Los viajes de prueba quedan con prefijo `[TEST]` y se te indicarán sus identificadores al terminar.

## Informe final

Se entregará: PASS/FAIL de cada flujo, estado exacto del proveedor, si los emails llegaron, errores o warnings, confirmación de que ningún usuario real recibió nada, confirmación de que no se tocó nada más, e identificación de los viajes TEST.
