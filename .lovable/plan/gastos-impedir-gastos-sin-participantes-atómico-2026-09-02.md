# Gastos: impedir gastos sin participantes (atómico)

## Hallazgo en Viveiro

Consulta ejecutada sobre los datos reales: en el viaje **Viveiro ( Lugo )** hay **0 gastos con 0 participantes**. Ampliada la consulta a toda la base de datos: tampoco existe ningún gasto huérfano en ningún viaje. Es decir, hoy no hay datos que corregir; lo que sí existe es el hueco que permite crearlos.

## Causa real

El flujo actual de creación en `src/pages/trips/Expenses.tsx` hace **dos operaciones separadas**:

1. `insert` en `trip_expenses` (se guarda ya, con saldo afectado)
2. `insert` en `trip_expense_splits`

Si el paso 2 falla (RLS, red, cierre de la app, pestaña cerrada tras el paso 1 — el diálogo se cierra antes de terminar), queda un **gasto huérfano sin participantes** que ya cuenta en los saldos. Además, la API permite hoy insertar directamente en `trip_expenses` sin ningún split: la única protección de base de datos es un trigger en `DELETE` de splits, que no cubre el alta.

## Qué se va a hacer

### Backend (base de datos)
- Nueva función `public.save_trip_expense(...)` en PL/pgSQL, **SECURITY INVOKER** (respeta íntegramente las RLS actuales, no se abren permisos):
  - recibe viaje, id de gasto (nulo al crear), título, importe, pagador, ruta de recibo y el array de participantes;
  - si el array viene vacío → `RAISE EXCEPTION 'expense_requires_at_least_one_member'` y **no se escribe nada**;
  - crea o actualiza el gasto y sincroniza los splits **en la misma transacción**: o todo o nada;
  - `GRANT EXECUTE` solo a `authenticated`.
- Nuevo trigger `AFTER INSERT` sobre `trip_expenses`, como **constraint trigger DEFERRABLE INITIALLY DEFERRED**, que al confirmar la transacción exige que el gasto tenga al menos 1 split. Esto bloquea también cualquier inserción directa contra la API (PostgREST) sin participantes.
- Se mantiene el trigger existente de `DELETE` de splits.

### Frontend
- `src/pages/trips/Expenses.tsx`: crear y editar pasan a llamar a la RPC en lugar de los dos inserts/updates sueltos.
- El diálogo **ya no se cierra antes de guardar**: se cierra solo si la RPC devuelve éxito; ante error se queda abierto con el aviso “Selecciona al menos una persona para compartir este gasto.”
- Se conserva la validación visual previa y el borde rojo del bloque de participantes.

## Fuera de alcance (no se toca)
Fórmulas de saldos, Total gastado, Mis gastos, quién debe a quién, pagos, reembolsos, cierre/reapertura del viaje, chat, fotos, actividades, emails, notificaciones y el resto de la app. Ninguna RLS se relaja.

## Validación
- 0 participantes → falla y no queda ningún registro (se comprueba por consulta tras el intento).
- 1 y varios participantes → se guarda correctamente.
- Editar quitando todos los participantes → impedido, sin dejar el gasto sin splits.
- Consulta final de gastos huérfanos en todos los viajes → debe seguir en 0.
