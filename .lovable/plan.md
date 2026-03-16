

## Plan: Restaurar vídeo de fondo en móvil

### Cambios en `src/pages/Landing.tsx`

#### 1. Eliminar la restricción `!isMobile` del vídeo
- Línea 135: quitar el condicional `{!isMobile && (` para que el `<video>` se renderice siempre
- El poster WebP sigue como fallback visual instantáneo mientras el vídeo carga

#### 2. Cargar el vídeo también en móvil (con delay mayor)
- Línea 49: eliminar `if (isMobile || ...) return;`
- Usar delay de 500ms en móvil vs 100ms en desktop para priorizar el render inicial del hero

```typescript
useEffect(() => {
  if (!bgVideoRef.current) return;
  const video = bgVideoRef.current;
  const delay = isMobile ? 500 : 100;
  const timer = setTimeout(() => {
    video.src = "/videos/hero-background.mp4";
    video.load();
  }, delay);
  return () => clearTimeout(timer);
}, [isMobile]);
```

#### 3. Encuadre optimizado para móvil
- Aplicar `object-[center_25%]` en móvil y `object-center` en desktop al `<video>`, para que en pantallas verticales se vean los personajes y el Coliseo (igual que ya se hace con el poster)

```tsx
<video
  ref={bgVideoRef}
  muted loop playsInline preload="none"
  onCanPlay={handleBgVideoCanPlay}
  className={`absolute inset-0 w-full h-full object-cover ${isMobile ? "object-[center_25%]" : "object-center"} transition-opacity duration-1000 ${videoReady ? "opacity-100" : "opacity-0"}`}
/>
```

### Resultado
- **Móvil**: poster visible al instante → vídeo carga con 500ms de delay → fade-in suave de 1s
- **Desktop**: sin cambios (delay 100ms como antes)
- Encuadre optimizado en ambos dispositivos

