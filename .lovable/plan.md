

## Plan: Handle `permission=denied` state and add "blocked" banner

### Root cause confirmed
`permission === "denied"` makes both `canRequestPermission` and `showFallbackState` evaluate to `false`, so `shouldShow` is `false` and the banner returns `null`. There is no visual state for "notifications blocked".

### Changes

#### 1. `src/components/PushNotificationBanner.tsx`
- Add a fourth state: `isDenied = permission === "denied" && !isSubscribed`
- Include `isDenied` in `shouldShow`: `!dismissed && !isSubscribed && (requiresInstall || canRequestPermission || showFallbackState || isDenied)`
- When `isDenied`, render a distinct banner (amber/warning tone) with `BellOff` icon, explaining that notifications are blocked and how to unblock them in browser/OS settings
- No action button (since the browser won't allow re-prompting), just informative text + dismiss X
- Remove debug panel export and usage from Dashboard (diagnosis complete)

#### 2. `src/i18n/translations.ts`
- Add 2 new keys to `TranslationKeys`: `pushDeniedTitle`, `pushDeniedDescription`
- Add translations for all 7 languages:
  - ES: "Notificaciones bloqueadas" / "Has denegado el permiso de notificaciones. Para activarlas, ve a la configuración de tu navegador o dispositivo y permite las notificaciones para YORMIT."
  - EN/FR/PT/IT/ZH/DE: equivalent

#### 3. `src/pages/Dashboard.tsx`
- Remove `PushDebugPanel` import and `<PushDebugPanel />` render

### Files
1. **Modify** `src/components/PushNotificationBanner.tsx`
2. **Modify** `src/i18n/translations.ts` — add 2 keys × 7 languages
3. **Modify** `src/pages/Dashboard.tsx` — remove debug panel

### Testing
- In Lovable preview (where `permission=denied`): amber "blocked" banner visible
- On mobile real device: reset notification permission in browser settings, reload → should see the green "Activar" banner
- If denied again → amber "blocked" banner appears

