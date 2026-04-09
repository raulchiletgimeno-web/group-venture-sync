

## Add legal pages structure to YORMIT

### New files to create

**4 legal page components** in `src/pages/legal/`:

- `LegalNotice.tsx` — `/aviso-legal` — Aviso Legal placeholder
- `PrivacyPolicy.tsx` — `/privacidad` — Política de Privacidad placeholder
- `CookiesPolicy.tsx` — `/cookies` — Política de Cookies placeholder
- `Contact.tsx` — `/contacto` — Página de contacto (info@yormit.com + placeholder)

Each page will be a simple, clean layout: YORMIT logo at top, structured placeholder text with section headings, and a back-to-home link. Styled consistently with the app's existing design (card backgrounds, typography, colors). All text will be in Spanish since these are legal pages tied to the business entity.

### Route registration — `src/App.tsx`

Add 4 new public routes before the catch-all:

```
/aviso-legal → LegalNotice
/privacidad → PrivacyPolicy
/cookies → CookiesPolicy
/contacto → Contact
```

Lazy-loaded like the other pages.

### Landing page footer — `src/pages/Landing.tsx`

Update the footer (lines 369-380) to add a row of legal links below the existing copyright text:

```
Aviso legal · Privacidad · Cookies · Contacto
```

Small text, muted color, centered on mobile, right-aligned on desktop. Uses `<Link>` from react-router.

### Dashboard footer — `src/pages/Dashboard.tsx`

Add a minimal footer at the bottom of the dashboard page with the same 4 legal links, small and discreet so they don't interfere with the UI.

### Files changed
- `src/App.tsx` — 4 new lazy routes
- `src/pages/Landing.tsx` — footer links
- `src/pages/Dashboard.tsx` — small footer with legal links
- `src/pages/legal/LegalNotice.tsx` — new
- `src/pages/legal/PrivacyPolicy.tsx` — new
- `src/pages/legal/CookiesPolicy.tsx` — new
- `src/pages/legal/Contact.tsx` — new

### Nothing else touched
No changes to any existing functionality, styling, logic, or components.

