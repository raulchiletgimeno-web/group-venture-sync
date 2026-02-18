

## Fase 2: Autenticacion, Viajes y Sistema de Invitacion

### Resumen

Activar Lovable Cloud (Supabase integrado), implementar autenticacion con email/password, crear la estructura de base de datos para viajes y miembros, y desarrollar el flujo completo de crear viaje, unirse por invite link y listar viajes del usuario.

---

### Paso 1 -- Activar Lovable Cloud

Activar el backend integrado de Lovable (Supabase Cloud) para disponer de base de datos, autenticacion y storage.

---

### Paso 2 -- Migracion: Tablas base y seguridad

Crear la primera migracion con las tablas fundamentales y las politicas RLS.

**Tablas a crear:**

- `profiles` (id uuid PK referencing auth.users, name, email, avatar_url, created_at)
- `trips` (id uuid PK, title, destination, start_date, end_date, created_by FK profiles, status enum, invite_code unique, created_at)
- `trip_members` (id uuid PK, trip_id FK trips, user_id FK profiles, role enum creator/member, joined_at)

**Funciones helper (SECURITY DEFINER):**

- `is_trip_member(trip_id uuid)` -- verifica si auth.uid() es miembro del viaje
- `is_trip_creator(trip_id uuid)` -- verifica si auth.uid() es creador del viaje

**Trigger:**

- `handle_new_user` -- al registrarse un usuario, crea automaticamente su fila en `profiles`

**Politicas RLS:**

- `profiles`: SELECT para todos los autenticados, UPDATE solo el propio usuario
- `trips`: SELECT/INSERT/UPDATE solo miembros, DELETE solo creador
- `trip_members`: SELECT para miembros del viaje, INSERT controlado

---

### Paso 3 -- Cliente Supabase

Crear `src/lib/supabase.ts` con la inicializacion del cliente Supabase usando las variables de entorno del proyecto Cloud.

---

### Paso 4 -- Contexto de autenticacion

Crear `src/contexts/AuthContext.tsx`:

- Provider que envuelve la app
- Escucha `onAuthStateChange` (configurado ANTES de `getSession`)
- Expone: `user`, `session`, `loading`, `signUp`, `signIn`, `signOut`
- Estado global accesible via `useAuth()` hook

---

### Paso 5 -- Paginas de autenticacion

**`src/pages/Auth.tsx`:**

- Formulario con dos modos: Login / Registro
- Campos: email, password (y nombre en registro)
- Validacion con feedback visual
- Redireccion a `/` tras login exitoso
- Estilo coherente con el design system (gradientes, cards, tipografia)

**`src/pages/ResetPassword.tsx`:**

- Formulario para solicitar reset y para establecer nueva contrasena
- Ruta `/reset-password`

---

### Paso 6 -- Proteccion de rutas

Crear `src/components/ProtectedRoute.tsx`:

- Wrapper que verifica sesion activa
- Si no hay sesion, redirige a `/auth`
- Muestra loading spinner mientras verifica

Actualizar `App.tsx`:

- Envolver rutas protegidas (home, trip) con `ProtectedRoute`
- Dejar `/auth` y `/reset-password` como rutas publicas
- Envolver todo con `AuthProvider`

---

### Paso 7 -- Crear viaje

**`src/components/CreateTripDialog.tsx`:**

- Dialog/Sheet con formulario: titulo, destino, fecha inicio, fecha fin
- Genera `invite_code` aleatorio (8 caracteres alfanumericos)
- Inserta en `trips` y automaticamente crea una fila en `trip_members` con role `creator`
- Toast de confirmacion y redireccion al dashboard del viaje

---

### Paso 8 -- Unirse a viaje por invite link

**`src/pages/JoinTrip.tsx`:**

- Ruta `/join/:inviteCode`
- Busca el viaje por `invite_code`
- Si el usuario ya es miembro, redirige al viaje
- Si no, lo anade como `member` en `trip_members`
- Muestra confirmacion y redirige al dashboard del viaje

**Flujo de invitacion:**

- En el dashboard del viaje, el boton "Invitar amigos" copia al portapapeles el link `{origin}/join/{invite_code}`

---

### Paso 9 -- Listar viajes reales del usuario

Actualizar `src/pages/Index.tsx`:

- Reemplazar `mockTrips` por query real a Supabase
- Consultar `trips` donde el usuario es miembro (via `trip_members`)
- Mostrar `EmptyState` si no tiene viajes
- Conectar boton "Crear viaje" al dialog
- Conectar boton "Unirse" a un dialog que pida el codigo de invitacion

Actualizar `src/components/TripLayout.tsx` y `src/pages/TripDashboard.tsx`:

- Cargar datos reales del viaje desde Supabase usando `tripId` de la URL
- Mostrar titulo, destino, fechas y miembros reales

---

### Paso 10 -- Header con sesion de usuario

Actualizar la pagina principal para mostrar:

- Nombre/avatar del usuario en el header
- Boton de cerrar sesion
- Navegacion contextual

---

### Detalles tecnicos

**Estructura de archivos nuevos:**

```text
src/
  lib/
    supabase.ts
  contexts/
    AuthContext.tsx
  components/
    ProtectedRoute.tsx
    CreateTripDialog.tsx
    JoinTripDialog.tsx
  pages/
    Auth.tsx
    ResetPassword.tsx
    JoinTrip.tsx
```

**Rutas actualizadas:**

```text
/auth              -- Login/Registro (publica)
/reset-password    -- Reset contrasena (publica)
/join/:inviteCode  -- Unirse a viaje (protegida)
/                  -- Home con lista de viajes (protegida)
/trip/:tripId/*    -- Dashboard y secciones (protegida)
```

**Generacion de invite_code:**

```typescript
const generateInviteCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 8)
    .toUpperCase();
```

**Consulta de viajes del usuario:**

```typescript
const { data } = await supabase
  .from('trips')
  .select(`*, trip_members!inner(user_id)`)
  .eq('trip_members.user_id', user.id)
  .order('start_date', { ascending: true });
```

