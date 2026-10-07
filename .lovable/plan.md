# Calendario de Crear viaje en el idioma del usuario

## Cambio (solo `src/components/CreateTripDialog.tsx`)
- Pasar al calendario el idioma de YORMIT mediante el soporte de idiomas que ya incluye la librería de fechas (sin dependencias nuevas):
  - español → `es`, inglés → `enGB`, francés → `fr`, portugués → `pt`, italiano → `it`, alemán → `de`, chino → `zhCN`; si falta alguno, inglés.
- Con ese idioma, meses y días salen traducidos y la semana empieza en lunes (también en inglés británico; en chino también lunes).
- No cambia nada más: selección, reglas inicio/fin, viaje de un día, validaciones, diseño ni guardado.

## Validación (Playwright, móvil, sesión real)
1. Español: meses y días en español, primera columna lunes.
2. Inglés: meses y días en inglés.
3. Cambiar idioma y volver a abrir: se adapta.
4. Crear un viaje de prueba tras el cambio, comprobar fechas guardadas y borrarlo.
