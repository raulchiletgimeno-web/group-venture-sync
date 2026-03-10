

## Plan: Landing page publica + reestructuracion de rutas

### Resumen

Crear una landing page publica en `/` que presente YORMIT como producto. Mover la app privada (dashboard de viajes) a `/dashboard`. Mantener toda la logica de auth intacta.

### Cambios

#### 1. Nueva pagina: `src/pages/Landing.tsx`

Landing page publica con las siguientes secciones, usando los componentes UI existentes (Button, Card, Accordion) y las clases CSS del proyecto (gradient-hero, shadow-card, etc.):

- **Navbar**: Logo YORMIT (con icono Luggage) + boton "Acceder" que lleva a `/auth`
- **Hero**: Titular potente, subtitulo explicativo, CTA "Comenzar ahora" → `/auth`, imagen hero existente (`hero-travel.jpg`)
- **Funcionalidades**: Grid responsive con iconos (Lucide) para cada feature: alojamientos, transportes, actividades, gastos, chat, fotos, meteo, telefonos, info util
- **Previews/Capturas**: Seccion visual con mockups o cards que simulan la interfaz de la app
- **Beneficios**: 3-4 cards con beneficios clave (todo centralizado, sin caos, gratis, etc.)
- **FAQ**: Usando componente Accordion existente con preguntas frecuentes
- **Footer**: Links, copyright, branding YORMIT

Responsive: mobile-first con grid adaptativo. Coherente con la paleta de colores actual (primary azul, secondary verde, accent naranja).

#### 2. Renombrar `src/pages/Index.tsx` → `src/pages/Dashboard.tsx`

Solo renombrar el import, el componente sigue igual. Es la app privada del usuario autenticado.

#### 3. Actualizar `src/App.tsx` - Rutas

```
/           → Landing (publica, sin auth)
/auth       → Auth (publica)
/reset-password → ResetPassword (publica)
/dashboard  → Dashboard (protegida, antes era Index en /)
/join/:code → JoinTrip (protegida)
/trip/:id/* → TripLayout (protegida)
```

#### 4. Actualizar `src/pages/Auth.tsx`

Cambiar la redireccion post-login de `/` a `/dashboard` (linea donde hace `navigate("/")`).

#### 5. Actualizar `src/components/ProtectedRoute.tsx`

Sin cambios necesarios, ya redirige a `/auth` si no hay sesion.

#### 6. Actualizar `src/contexts/AuthContext.tsx`

Sin cambios necesarios.

#### 7. Revisar cualquier `navigate("/")` en el proyecto

Buscar y cambiar a `/dashboard` donde corresponda para que la app privada siga funcionando.

### Sin cambios en base de datos

No se requieren migraciones ni cambios en backend.

