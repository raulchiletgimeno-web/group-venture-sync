

## Plan: Mover banner de instalación a botón flotante superior

### Cambios

**1. `src/pages/Landing.tsx`**
- Eliminar `<InstallAppBanner variant="landing" />` de su posición actual (antes del footer)
- Añadir un nuevo botón flotante fijo justo encima del botón de FAQ existente (bottom-52 → el nuevo botón irá en bottom-[17rem] aprox.)
- El botón flotante tendrá el mismo estilo que el de FAQ: `fixed right-5 z-50 rounded-full bg-primary text-primary-foreground shadow-lg`
- Texto: "Instalar en móvil" con icono `Download`
- Al pulsarlo: ejecuta la misma lógica (install nativo en Android o guía en iOS)
- Necesita importar `useInstallPrompt` directamente en Landing y gestionar el drawer de guía iOS/Android inline

**2. `src/components/InstallAppBanner.tsx`**
- Exportar también el componente `InstallGuideDrawer` para poder reutilizarlo desde Landing
- Sin otros cambios

### Resultado
Dos botones flotantes apilados en la esquina inferior derecha: arriba "Instalar en móvil", debajo "Preguntas frecuentes". El banner inline desaparece.

