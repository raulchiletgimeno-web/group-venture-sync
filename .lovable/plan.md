

# Probar tu aplicación en el móvil

Tienes dos opciones para usar tu app en el móvil. Te las explico de forma sencilla:

---

## Opción 1: Aplicación Web Instalable (PWA) — Recomendada

Tu app se puede instalar directamente desde el navegador de tu móvil, como si fuera una app real. No necesitas publicarla en ninguna tienda de aplicaciones.

**Ventajas:**
- Funciona en iPhone y Android
- Se instala en segundos desde el navegador
- No requiere configuración técnica compleja
- Funciona offline y carga rápido

**Limitaciones:**
- Algunas funciones avanzadas del teléfono (como notificaciones push en iPhone) pueden estar limitadas

---

## Opción 2: App Nativa (Capacitor)

Una app real que se puede publicar en Apple App Store y Google Play Store.

**Ventajas:**
- Acceso completo a todas las funciones del teléfono
- Se puede publicar en las tiendas oficiales

**Limitaciones:**
- Requiere mucha más configuración técnica
- Necesitas herramientas de desarrollo: Xcode (Mac) para iPhone, Android Studio para Android
- El proceso es más largo y complejo

---

## Recomendación

Para probar tu app rápidamente en el móvil, **la Opción 1 (PWA)** es la más sencilla y rápida. Solo necesito hacer unos ajustes en el código para que tu app sea instalable desde el navegador.

Si más adelante quieres publicarla en las tiendas de aplicaciones, podemos pasar a la Opción 2.

---

## Detalles técnicos (Opción 1 - PWA)

1. Instalar la dependencia `vite-plugin-pwa`
2. Configurar `vite.config.ts` con el manifest de la app (nombre, iconos, colores)
3. Añadir meta tags optimizados para móvil en `index.html`
4. Crear iconos de la app en la carpeta `public/`
5. Crear una página `/install` con instrucciones para instalar la app en el móvil

Una vez hecho, solo tendrás que:
- Abrir tu app en el navegador del móvil
- En iPhone: pulsar "Compartir" y luego "Añadir a pantalla de inicio"
- En Android: pulsar el menú del navegador y "Instalar aplicación"

