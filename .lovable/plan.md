## Qué estaba fallando

El email de 48h antes llama a `fetchForecast(destination, ...)` en `supabase/functions/check-trip-pre-departure/index.ts`. Esa función pasa el campo `destination` tal cual a la API de geocoding de Open-Meteo.

El problema: en YORMIT los destinos se guardan como cadenas compuestas separadas por comas, por ejemplo:

- `"Logroño, Logroño, España"` (Rioja Bike Race) → 0 resultados
- `"Disney, Paris , Francia"` → 0 resultados
- `"Tirana y costa, Albania, Albania"` → 0 resultados

La API de geocoding de Open-Meteo solo acepta **un nombre de lugar simple** (`"Logroño"` sí funciona). Cuando recibe la cadena entera con comas, devuelve `{ results: [] }`, `fetchForecast` retorna `null`, y la plantilla `trip-pre-departure.tsx` (que tiene `{forecast && forecast.length > 0 && ...}`) omite el bloque del tiempo.

Por eso en algunos viajes (destino simple, por ejemplo `"Madrid"`) sí aparece y en otros (destino compuesto) no.

No es un fallo de la plantilla, ni de la API meteorológica, ni de la lógica condicional general — es un fallo de **resolución del destino** en el geocoding.

## Qué voy a corregir

**Único archivo a tocar:** `supabase/functions/check-trip-pre-departure/index.ts` (función `fetchForecast`).

1. Construir una lista ordenada de candidatos a partir de `destination`:
   - cadena completa tal cual
   - cada segmento separado por comas, en orden (primero ciudad, luego provincia, luego país)
   - el último segmento (país) como último recurso
   - deduplicada y sin vacíos
2. Intentar el geocoding con cada candidato hasta encontrar uno con `results[0].latitude/longitude` válidos.
3. Mantener el resto del flujo igual (forecast diario, weathercode, tmax/tmin, render en plantilla).
4. Añadir `console.warn` cuando ningún candidato resuelva, para tener trazabilidad en logs futuros sin romper nada.

Esto cubre los formatos reales que hay en BD (`"Ciudad, Provincia, País"`, `"Ciudad y zona, Región, País"`, `"Ciudad"`).

## Lo que NO voy a tocar

- La plantilla `trip-pre-departure.tsx` (estética, copy, bloque del tiempo): se queda exactamente igual. Solo cambia que ahora `forecast` llegará informado en los casos que antes fallaban.
- La lógica de envío, idempotencia, ventana de 48h, RLS, cron, ni ninguna otra Edge Function.
- Ningún archivo del frontend.
- Ningún otro email.

## Validación

Tras desplegar `check-trip-pre-departure`:
- Probaré el geocoding con los destinos reales en BD (Logroño, Disney/Paris, Tirana, etc.) para confirmar que ahora resuelven.
- Confirmaré que el bloque del tiempo aparecerá siempre que el destino contenga al menos una localización geocodificable (que es el 100% de los actuales).

## Detalles técnicos

```ts
function buildCandidates(destination: string): string[] {
  const raw = destination?.trim() ?? ''
  if (!raw) return []
  const parts = raw.split(',').map(p => p.trim()).filter(Boolean)
  const candidates = [raw, ...parts, parts[parts.length - 1]]
  return [...new Set(candidates)].filter(Boolean)
}
```

Bucle dentro de `fetchForecast`: por cada candidato → llamada geocoding → si hay `latitude/longitude`, romper y continuar con el `forecast`. Si ninguno resuelve, `console.warn('Geocoding failed for all candidates', { destination, candidates })` y devolver `null` (mismo comportamiento actual, pero en la práctica ya no debería ocurrir con los datos reales).
