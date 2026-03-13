

## Plan: Instalar YORMIT en pantalla de inicio (PWA Install Prompt)

### Resumen
Crear un componente reutilizable `InstallAppPrompt` que detecte el sistema operativo (Android/iOS/desktop) y muestre el flujo de instalación adecuado. Integrarlo en la Landing pública, el Dashboard privado, y verificar la configuración PWA existente.

### 1. Crear hook `useInstallPrompt`
**Archivo nuevo: `src/hooks/use-install-prompt.ts`**

- Capturar el evento `beforeinstallprompt` (Android/Chrome)
- Detectar si la app ya está instalada (`display-mode: standalone`)
- Detectar iOS via `navigator.userAgent`
- Exponer: `{ isInstalled, isIOS, isAndroid, canInstall, promptInstall, showIOSGuide }`

### 2. Crear componente `InstallAppBanner`
**Archivo nuevo: `src/components/InstallAppBanner.tsx`**

- **Android**: Botón "Añadir YORMIT a mi móvil" que llama a `promptInstall()` directamente
- **iOS**: Botón que abre un modal/drawer con guía visual paso a paso:
  1. Icono de compartir + "Pulsa Compartir"
  2. Icono de cuadrado con flecha + "Añadir a pantalla de inicio"
  3. "Pulsa Añadir"
- **Desktop / ya instalado**: No mostrar nada
- Diseño premium: iconos SVG inline, animaciones sutiles, estilo coherente con la app
- Botón de cerrar para descartar (con localStorage para no volver a mostrar)

### 3. Añadir traducciones (7 idiomas)
**Archivo: `src/i18n/translations.ts`**

Añadir claves para:
- `installTitle` / `installButton` / `installIOSStep1` / `installIOSStep2` / `installIOSStep3` / `installDismiss` / `installAlreadyInstalled`

### 4. Integrar en Landing
**Archivo: `src/pages/Landing.tsx`**

- Añadir el `InstallAppBanner` como floating banner o sección visible antes del CTA final
- Solo visible en móvil y si no está instalado

### 5. Integrar en Dashboard
**Archivo: `src/pages/Dashboard.tsx`**

- Añadir un botón discreto en la zona del hero o junto a los botones de acción
- Solo visible si no está instalado y el usuario está en móvil

### 6. Verificar configuración PWA
La configuración en `vite.config.ts` ya tiene:
- `display: "standalone"` 
- Iconos 192x192 y 512x512
- `apple-touch-icon` en `index.html`
- Service worker con `autoUpdate`
- `navigateFallbackDenylist` para `/~oauth`

Todo correcto, no requiere cambios.

### Archivos a modificar/crear
| Archivo | Acción |
|---|---|
| `src/hooks/use-install-prompt.ts` | Crear |
| `src/components/InstallAppBanner.tsx` | Crear |
| `src/i18n/translations.ts` | Añadir ~10 claves x 7 idiomas |
| `src/pages/Landing.tsx` | Importar e integrar banner |
| `src/pages/Dashboard.tsx` | Importar e integrar botón |

