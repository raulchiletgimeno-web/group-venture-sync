

## Plan: Arreglar autoplay del video modal

### Problema
Los navegadores modernos bloquean `play()` en videos con audio activo. El código actual desmutea el video antes de reproducirlo, por lo que el autoplay falla silenciosamente.

### Solución en `src/pages/Landing.tsx`

Cambiar el `useEffect` para iniciar el video muteado (lo que sí permite autoplay), y desmutearlo justo después de que comience la reproducción:

```ts
useEffect(() => {
  if (showVideo && videoRef.current) {
    videoRef.current.muted = true;
    videoRef.current.play().then(() => {
      if (videoRef.current) videoRef.current.muted = false;
    }).catch(() => {});
  }
}, [showVideo]);
```

Esto garantiza que:
1. El video se reproduce automáticamente al abrir el modal
2. El audio se activa inmediatamente después
3. Al terminar el video, el modal se cierra y vuelve a la landing (ya funciona con `onEnded`)

