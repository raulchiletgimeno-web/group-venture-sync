

## Corrección del scroll inicial del chat en iOS

### Problema

En iOS/Safari, `scrollIntoView()` no se ejecuta correctamente en el primer render porque Safari necesita un ciclo de layout adicional tras el montaje del DOM. El `requestAnimationFrame` simple que funciona en Android no es suficiente en Safari.

### Solución

En el bloque de scroll inicial (líneas 119-131 de `Chat.tsx`), añadir un `setTimeout` extra **solo para iOS** que permita a Safari completar su layout antes de hacer el scroll. Esto no afecta a Android porque el `requestAnimationFrame` seguirá funcionando igual para dispositivos no-iOS.

### Cambio concreto

**Fichero**: `src/pages/trips/Chat.tsx` (solo el bloque de scroll, líneas ~119-131)

Lógica actual:
```js
requestAnimationFrame(() => {
  if (firstUnreadIdx > 0) {
    const el = vp.querySelector(`[data-msg-idx="${firstUnreadIdx}"]`);
    if (el) {
      (el as HTMLElement).scrollIntoView({ block: "start" });
      isInitialLoad.current = false;
      return;
    }
  }
  vp.scrollTop = vp.scrollHeight;
  isInitialLoad.current = false;
});
```

Nueva lógica:
```js
const doScroll = () => {
  if (firstUnreadIdx > 0) {
    const el = vp.querySelector(`[data-msg-idx="${firstUnreadIdx}"]`);
    if (el) {
      (el as HTMLElement).scrollIntoView({ block: "start" });
      isInitialLoad.current = false;
      return;
    }
  }
  vp.scrollTop = vp.scrollHeight;
  isInitialLoad.current = false;
};

const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
if (isIOS) {
  // Safari needs an extra layout pass before scrollIntoView works reliably
  requestAnimationFrame(() => {
    setTimeout(doScroll, 300);
  });
} else {
  requestAnimationFrame(doScroll);
}
```

### Por qué funciona

- Safari/iOS a menudo necesita un frame extra + un pequeño delay para que el layout del scroll container se estabilice
- El `setTimeout(300)` da tiempo a Safari para completar el layout sin afectar a Android
- En Android se mantiene el comportamiento actual exacto (solo `requestAnimationFrame`)

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Chat.tsx` | Bloque de scroll inicial (~10 líneas modificadas) |

No se toca ningún otro fichero, pantalla ni funcionalidad.

