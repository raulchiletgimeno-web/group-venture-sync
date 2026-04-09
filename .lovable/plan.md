

## Add "¿Te ayudo?" label above the help chatbot icon

### What changes

**1. Add translation key `helpMeLabel`** in `src/i18n/translations.ts`

| Language | Value |
|----------|-------|
| es | ¿Te ayudo? |
| en | Need help? |
| fr | Besoin d'aide ? |
| pt | Precisa de ajuda? |
| it | Serve aiuto? |
| zh | 需要帮助？ |
| de | Brauchen Sie Hilfe? |

Add to the `TranslationKeys` type and all 7 language blocks.

**2. Wrap the help button in a flex-col layout** in `src/pages/Dashboard.tsx` (lines 245–251)

Replace the standalone `<button>` with a small wrapper that stacks the label text above the icon:

```tsx
<div className="flex flex-col items-center gap-1">
  <span className="text-xs font-bold text-black">{t.helpMeLabel}</span>
  <button
    onClick={() => setHelpOpen(true)}
    className="h-10 w-10 rounded-full gradient-hero shadow-card-hover flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
    aria-label={t.helpChatTitle}
  >
    <MessageCircleQuestion className="h-5 w-5 text-white" />
  </button>
</div>
```

### Files touched
- `src/i18n/translations.ts` — new key + type
- `src/pages/Dashboard.tsx` — button wrapper with label

### Nothing else changes
No other components, pages, or logic are modified.

