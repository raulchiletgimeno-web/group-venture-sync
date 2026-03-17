

## Plan: Fix browser auto-translation and protect brand elements

### Root causes identified

1. **`<html lang="en">`** in `index.html` — the page declares English but content is Spanish. Chrome sees Spanish text on an "English" page and offers to translate.
2. **No `translate="no"` meta tag** — nothing tells the browser to skip auto-translation.
3. **Brand text "YORMIT"** is rendered as raw text nodes mixed with Luggage icon components — browser translators can break this layout by wrapping text in `<font>` tags.
4. **`lang` attribute never updates** when user switches language via the in-app selector.

### Changes

#### 1. `index.html` — Set correct lang and block auto-translate

- Change `<html lang="en">` to `<html lang="es">`
- Add `<meta name="google" content="notranslate">` (Chrome-specific)
- Add `class="notranslate"` to `<html>` element (Google Translate convention)

#### 2. `src/contexts/LanguageContext.tsx` — Sync `<html lang>` dynamically

Add a `useEffect` that sets `document.documentElement.lang` to the current language code (e.g. `"es"`, `"en"`, `"fr"`) whenever the user changes language. This keeps the HTML lang attribute accurate for all 7 supported languages.

#### 3. Protect all YORMIT brand logos with `translate="no"`

Add `translate="no"` attribute to the 4 brand logo elements across:
- `src/pages/Landing.tsx` — hero logo + footer logo
- `src/pages/Dashboard.tsx` — header logo
- `src/pages/Auth.tsx` — auth page logo
- `src/pages/ResetPassword.tsx` — reset page logo

This prevents browsers from wrapping these elements in translation `<font>` tags that break the icon+text layout.

### Result

- Browser won't offer "Translate to Spanish?" on a Spanish page
- If user switches to English/French/etc, `lang` updates correctly so browser won't re-offer Spanish translation
- YORMIT logos are protected from layout-breaking translation injection on all pages

