

## Fase 2: Autenticacion, Viajes y Sistema de Invitacion

### Resumen

Activar Lovable Cloud, implementar autenticacion email/password, crear tablas con RLS, y desarrollar los flujos de crear viaje, unirse por invite link y listar viajes reales.

---

### Paso 1 -- Activar Lovable Cloud

Activar el backend integrado (Supabase Cloud) para base de datos, autenticacion y storage.

---

### Paso 2 -- Migracion: Tablas base y seguridad

Crear la migracion inicial con tablas, funciones helper y politicas RLS.

**Tablas:**

- `profiles` (id uuid PK -> auth.users ON DELETE CASCADE, name text, email text, avatar_url text, created_at timestamptz)
- `trips` (id uuid PK, title text, destination text, start_date date, end_date date, created_by uuid FK -> profiles, status text CHECK upcoming/active/finished, invite_code text UNIQUE, created_at timestamptz)
- `trip_members` (id uuid PK, trip_id uuid FK -> trips ON DELETE CASCADE, user_id uuid FK -> profiles ON DELETE CASCADE, role text CHECK creator/member, joined_at timestamptz, UNIQUE(trip_id, user_id))

**Funciones helper (SECURITY DEFINER):**

```text
is_trip_member(p_trip_id uuid) -> boolean
  Retorna true si auth.uid() existe en trip_members para ese trip

is_trip_creator(p_trip_id uuid) -> boolean
  Retorna true si auth.uid() tiene role='creator' en trip_members para ese trip
```

**Trigger:**

- `handle_new_user`: Al insertar en auth.users, crea fila en profiles con id, email y name (desde raw_user_meta_data)

**Politicas RLS:**

```text
profiles:
  SELECT  -> auth.uid() = id (solo ver su propio perfil)
  INSERT  -> auth.uid() = id (para el trigger)
  UPDATE  -> auth.uid() = id

trips:
  SELECT  -> is_trip_member(id)
  INSERT  -> auth.uid() = created_by
  UPDATE  -> is_trip_member(id)
  DELETE  -> is_trip_creator(id)

trip_members:
  SELECT  -> is_trip_member(trip_id)
  INSERT  -> is_trip_creator(trip_id) OR user_id = auth.uid()
  DELETE  -> is_trip_creator(trip_id)
```

Nota sobre INSERT en trip_members: se permite que el creador anada miembros, y que un usuario se anada a si mismo (para el flujo de join por invite code, que valida el codigo antes de insertar).

---

### Paso 3 -- Cliente Supabase

Crear `src/integrations/supabase/client.ts` con la inicializacion del cliente usando las variables de entorno inyectadas por Lovable Cloud.

Crear `src/integrations/supabase/types.ts` con los tipos TypeScript generados para las tablas.

---

### Paso 4 -- Contexto de autenticacion

Crear `src/contexts/AuthContext.tsx`:

- Provider que envuelve toda la app
- Configura `onAuthStateChange` ANTES de llamar a `getSession()`
- Expone: user, session, loading, profile, signUp, signIn, signOut
- signUp envia name en `raw_user_meta_data` para que el trigger lo use
- Hook `useAuth()` para consumir el contexto

---

### Paso 5 -- Paginas de autenticacion

**`src/pages/Auth.tsx`:**

- Dos modos: Login y Registro (toggle con tabs o boton)
- Campos: email, password, nombre (solo en registro)
- Validacion visual con estados de error
- Redireccion a `/` tras login exitoso
- Estilo con gradiente hero y cards del design system

**`src/pages/ResetPassword.tsx`:**

- Dos estados: solicitar reset (email) y establecer nueva contrasena
- Detecta `type=recovery` en URL hash para mostrar formulario de nueva contrasena
- Llama `updateUser({ password })` para completar el reset
- Ruta publica `/reset-password`

---

### Paso 6 -- Proteccion de rutas

Crear `src/components/ProtectedRoute.tsx`:

- Verifica sesion activa via useAuth()
- Si loading: spinner centrado
- Si no hay sesion: Navigate to `/auth`
- Si hay sesion: renderiza children

Actualizar `App.tsx`:

- Envolver con AuthProvider
- Rutas publicas: `/auth`, `/reset-password`
- Rutas protegidas: `/`, `/trip/:tripId/*`, `/join/:inviteCode`

---

### Paso 7 -- Crear viaje

**`src/components/CreateTripDialog.tsx`:**

- Dialog con formulario: titulo, destino, fecha inicio, fecha fin
- Al submit:
  1. Genera invite_code de 8 caracteres alfanumericos
  2. Inserta en `trips` con created_by = auth.uid()
  3. Inserta en `trip_members` con role = 'creator'
  4. Toast de exito
  5. Navega a `/trip/{id}`

---

### Paso 8 -- Unirse a viaje

**`src/components/JoinTripDialog.tsx`:**

- Dialog simple con input para pegar codigo de invitacion
- Busca trip por invite_code
- Si existe y el usuario no es miembro, inserta en trip_members

**`src/pages/JoinTrip.tsx`:**

- Ruta `/join/:inviteCode`
- Automaticamente busca viaje por codigo
- Si ya es miembro: redirige al viaje
- Si no: lo anade y redirige
- Maneja errores (codigo invalido, viaje no encontrado)

---

### Paso 9 -- Listar viajes reales

Actualizar `src/pages/Index.tsx`:

- Reemplazar mockTrips por query a Supabase
- Query: `trips` con join inner a `trip_members` filtrado por user.id
- Mostrar EmptyState si no hay viajes
- Conectar boton "Crear viaje" al CreateTripDialog
- Conectar boton "Unirse" al JoinTripDialog
- Mostrar nombre del usuario y boton logout en el header

Actualizar `src/components/TripLayout.tsx`:

- Cargar datos reales del viaje desde Supabase por tripId
- Mostrar titulo real en el header

Actualizar `src/pages/TripDashboard.tsx`:

- Cargar datos del viaje y miembros reales
- Boton "Invitar amigos" copia link al portapapeles

---

### Paso 10 -- Header con usuario

En Index.tsx, agregar al hero section:

- Avatar/nombre del usuario logueado
- Boton de cerrar sesion (icono LogOut)

---

### Detalles tecnicos

**Archivos nuevos:**

```text
src/integrations/supabase/client.ts
src/integrations/supabase/types.ts
src/contexts/AuthContext.tsx
src/components/ProtectedRoute.tsx
src/components/CreateTripDialog.tsx
src/components/JoinTripDialog.tsx
src/pages/Auth.tsx
src/pages/ResetPassword.tsx
src/pages/JoinTrip.tsx
```

**Archivos modificados:**

```text
src/App.tsx          -- AuthProvider + rutas nuevas + ProtectedRoute
src/pages/Index.tsx  -- datos reales + dialogs + header usuario
src/components/TripLayout.tsx   -- datos reales del viaje
src/pages/TripDashboard.tsx     -- datos reales + boton invitar
```

**Rutas finales:**

```text
/auth              -- publica
/reset-password    -- publica
/                  -- protegida (lista de viajes)
/trip/:tripId/*    -- protegida (dashboard + secciones)
/join/:inviteCode  -- protegida (unirse a viaje)
```

**Generacion de invite_code:**

```text
8 caracteres alfanumericos en mayusculas
Generados con crypto.getRandomValues
```

**Query de viajes del usuario:**

```text
supabase
  .from('trips')
  .select('*, trip_members!inner(user_id, role)')
  .eq('trip_members.user_id', user.id)
  .order('start_date', { ascending: true })
```
