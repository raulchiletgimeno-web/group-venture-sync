# Validación completa de YormitDatePicker (solo pruebas, sin cambios de código)

## Alcance
No se modifica ningún archivo ni dato real. Solo pruebas automatizadas en el navegador con un viaje "ZZ TEST FECHAS".

## Pruebas (390 px iPhone y 412 px Android, en español e inglés)
1. Crear viaje: elegir inicio y fin, guardar, reabrir, comprobar persistencia.
2. Editar viaje: cambiar ambas fechas, guardar, reabrir, comprobar.
3. Alojamiento: crear con check-in/check-out, guardar, editar, comprobar, cambiar ambas y guardar.
4. Transporte: crear con fecha+hora de salida y llegada, guardar, reabrir, comprobar fecha y hora; intentar llegada anterior a salida (debe bloquearse).
5. Actividades: crear con fecha y hora, guardar, reabrir, comprobar, editar y guardar.

## Validación visual (capturas)
Meses y días en el idioma correcto, semana lunes-domingo, calendario visible y pulsable, campos no cortados, ningún modal tapado, fecha conservada al cerrar el calendario.

Además se contrasta cada guardado leyendo el valor real en la base de datos.

## Limpieza
Borrar solo los viajes "ZZ TEST" creados y sus alojamientos, transportes, actividades y membresías; comprobar con una consulta que no queda nada.

## Informe final
PASS/FAIL por formulario, persistencia de fechas y horas, reglas de validación, diferencias iPhone/Android y español/inglés, confirmación de limpieza y de que no se tocó nada más. Si aparece un fallo, se informa y se propone la corrección por separado, sin aplicarla.
