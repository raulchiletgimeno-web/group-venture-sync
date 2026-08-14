# Eliminar los dos viajes de prueba TEST

Objetivo: borrar únicamente los viajes de prueba creados para validar los emails y sus datos asociados, sin tocar nada real.

## Viajes a eliminar

- `[TEST] Prueba pre-viaje YORMIT` — id `11111111-aaaa-4aaa-8aaa-000000000001`
- `[TEST] Prueba post-viaje YORMIT` — id `11111111-aaaa-4aaa-8aaa-000000000002`

## Datos asociados

Al borrar cada viaje, las tablas con borrado en cascada se limpian solas: participantes, mensajes, transporte, alojamiento, actividades, fotos, gastos, últimas visitas, recordatorios de deuda, pagos y recordatorios pre-viaje.

Tres tablas no tienen cascada y se limpiarán explícitamente antes, filtrando solo por esos dos identificadores:

- recordatorios post-viaje
- tokens de feedback
- respuestas de feedback (no hay ninguna, pero se incluye por seguridad)

## Qué NO se toca

- Ningún otro viaje, usuario o dato real.
- El registro histórico de envíos de email (`email_send_log`) se conserva intacto: es la evidencia de auditoría de la prueba y borrarlo alteraría el histórico de envíos. Si prefieres que también se elimine esa evidencia, dímelo y lo hago aparte.
- Crons, plantillas y lógica de funciones: sin cambios.

## Verificación final

Tras el borrado se comprobará que ambos identificadores ya no existen en ninguna tabla de viaje y que el número total de viajes reales es el mismo que antes menos esos dos.
