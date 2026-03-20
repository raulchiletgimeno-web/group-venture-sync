
Plan de diagnóstico preciso para obtener los valores reales en móvil

Lo que ya pude comprobar en el código
- `PushNotificationBanner` sí está montado en `Dashboard` y está fuera del contenedor con `overflow-hidden`, así que ahora mismo no parece un problema de clipping.
- La condición real que decide si se renderiza es:
  - `shouldShow = !dismissed && !isSubscribed && (requiresInstall || canRequestPermission || showFallbackState)`
- Y los subestados son:
  - `requiresInstall = isMobile && !isInstalled && (supportState === "install-required" || (isIOS && !isSupported))`
  - `canRequestPermission = isSupported && permission !== "denied"`
  - `showFallbackState = !requiresInstall && !canRequestPermission && !isSubscribed && permission !== "denied"`

Lo que NO puedo afirmar todavía como valor real
- En la captura disponible no hay logs `[PushBanner]`.
- Además, el snapshot actual está en `/auth`, no en `/dashboard`.
- Por eso no sería honesto decirte ahora valores reales de:
  `supportState`, `permission`, `isSubscribed`, `isMobile`, `isInstalled`, `dismissed`, `requiresInstall`, `canRequestPermission`, `showFallbackState`, `shouldShow`.

Qué significa esto técnicamente
- Con la lógica actual, el banner solo puede desaparecer si ocurre una de estas cosas en móvil:
  1. `dismissed = true`
  2. `isSubscribed = true`
  3. `permission = "denied"`
  4. o una combinación anómala que deje `requiresInstall`, `canRequestPermission` y `showFallbackState` todos en `false`

Implementación que haré en el siguiente paso para obtener los valores exactos
1. Añadir un panel de diagnóstico temporal visible en móvil dentro del Dashboard.
2. Hacer que ese panel se renderice incluso cuando el banner normal devolvería `null`.
3. Mostrar ahí exactamente estos valores en runtime:
   - `supportState`
   - `permission`
   - `isSubscribed`
   - `isMobile`
   - `isInstalled`
   - `dismissed`
   - `requiresInstall`
   - `canRequestPermission`
   - `showFallbackState`
   - `shouldShow`
4. Revisar con esos datos el caso real en Android y iPhone.
5. Corregir la condición exacta que esté bloqueando el render.
6. Retirar después el diagnóstico temporal y dejar el banner final ya estable.

Resultado esperado tras ese paso
- Ya no trabajaremos por intuición.
- Tendremos el estado exacto que está tomando el móvil.
- A partir de ahí podré decirte con precisión:
  - cuál es la causa real
  - qué condición concreta lo bloquea
  - y cuál es la corrección definitiva
