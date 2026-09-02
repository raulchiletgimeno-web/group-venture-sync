# Sitios útiles: abrir el resultado exacto al pulsar un lugar

## Causa confirmada

En `src/lib/usefulPlaces.ts`, `googleMapsUrlFor` construye:

```
https://www.google.com/maps/search/?api=1&query=<NOMBRE + dirección>&query_place_id=&center=<lat>,<lon>
```

El parámetro `query` contiene el nombre del establecimiento ("BBVA …"), y `query_place_id` va **vacío**. Google Maps interpreta eso como una búsqueda por texto y vuelve a resolver el lugar, sesgándolo hacia la ubicación actual del usuario. El parámetro `center` no fija el destino. Por eso, aunque el resultado mostrado era el BBVA de Aranda del Duero, al abrirlo Maps busca "BBVA" cerca del usuario.

Cada `Place` ya tiene `lat` y `lon` exactos procedentes de Overpass: no hace falta ningún dato nuevo.

## Qué se va a cambiar (un solo archivo)

**`src/lib/usefulPlaces.ts` — solo `googleMapsUrlFor`:**

- El destino pasa a ser **las coordenadas exactas del resultado**: `query=<lat>,<lon>` (Google Maps abre un pin en ese punto exacto, sin re-buscar por nombre).
- El nombre se conserva como contexto visual añadiéndolo a la query junto a las coordenadas (`query=<nombre>@<lat>,<lon>` no es soportado por la URL API; se usará `query=<lat>,<lon>` y se puede incluir el nombre vía `query_place_id` solo si existiera — al no existir, se omite). En la práctica: `https://www.google.com/maps/search/?api=1&query=LAT,LON` abre el pin exacto; Google muestra el nombre del lugar más cercano a ese pin.
- Si en el futuro se quisiera el nombre visible en la URL, alternativa válida: `query=LAT,LON` + `&query_place_id=` vacío eliminado.

Decisión final: `https://www.google.com/maps/search/?api=1&query={lat},{lon}` — destino siempre las coordenadas del resultado seleccionado, nunca el nombre solo ni la ubicación del usuario.

## Lo que NO cambia

- Geocodificación del alojamiento (recién corregida).
- Selector de varios alojamientos.
- Overpass, categorías, orden de resultados, "Cerca de mi ubicación", diseño.
- Los enlaces de mapa de Alojamiento, Transporte y Actividades usan `maps/dir` con direcciones textuales — funcionan bien y no forman parte de este problema; no se tocan.
- La corrección es genérica: todas las categorías usan el mismo `googleMapsUrlFor`, así que las 7 quedan corregidas a la vez.

## Archivos a modificar

- `src/lib/usefulPlaces.ts` (únicamente la función `googleMapsUrlFor`)

## Validación

- Viaje Viveiro-Lugo → Cajeros y bancos → Cerca del alojamiento → Hostal Entrepuertas → pulsar un BBVA: la URL contiene `query=<lat>,<lon>` con las coordenadas de Aranda del Duero, y Maps abre ese pin exacto.
- Repetir con un supermercado y una farmacia.
- `npx tsgo --noEmit` sin errores.
