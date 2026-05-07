## Plan: Página de eliminación de cuenta (/eliminar-cuenta)

### Objetivo
Crear una nueva página pública e informativa en `/eliminar-cuenta` donde los usuarios puedan consultar cómo solicitar la eliminación de su cuenta y datos personales, sin necesidad de iniciar sesión.

### Cambios

1. **Nueva página legal**
   - Archivo: `src/pages/legal/DeleteAccount.tsx`
   - Contenido: texto proporcionado por el usuario (título, instrucciones de solicitud por email, plazos, consecuencias de la eliminación, responsable).
   - Estilo: sigue exactamente el patrón visual de las páginas legales existentes (`LegalNotice`, `CookiesPolicy`, `Contact`):
     - Layout centrado `max-w-3xl`, fondo `bg-background`, tarjeta `bg-card rounded-xl border border-border shadow-card`.
     - Header con `BrandLogo` y enlace "Volver".
     - Tipografía y espaciado idénticos.
   - Idioma: español, tono profesional y sencillo.

2. **Registro de ruta**
   - Archivo: `src/App.tsx`
   - Añadir ruta pública (sin `ProtectedRoute`) antes del catch-all `*`:
     ```text
     <Route path="/eliminar-cuenta" element={<DeleteAccount />} />
     ```
   - Importar el componente con lazy loading, igual que el resto de páginas legales.

### Alcance
- Solo se crea un archivo nuevo y se añade una línea de ruta + import.
- **No se modifica** ninguna otra página, componente, estilo, lógica de negocio, backend ni navegación existente.

### Validación esperada
1. La URL `/eliminar-cuenta` carga la página correctamente.
2. Es accesible sin autenticación.
3. El diseño es coherente con el resto de páginas legales y se ve bien en móvil.
4. Ningún otro archivo del proyecto ha sido alterado.