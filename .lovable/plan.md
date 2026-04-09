

## Complete legal pages with definitive text

Replace placeholder content in the 4 existing legal page components with professionally drafted Spanish legal text using the provided business data. No changes to layout, styling, routing, or any other part of the app.

### Files modified (content only, same structure/styling)

**1. `src/pages/legal/LegalNotice.tsx`** — 7 sections:
1. Titular del sitio web — Raul Chilet Gimeno, NIF 52633612K, address, email, phone
2. Objeto — YORMIT as a free group travel webapp
3. Condiciones generales de uso — responsible use, prohibited activities, user-generated content responsibility
4. Propiedad intelectual e industrial — all IP belongs to the titular, users cannot reproduce without authorization
5. Limitación de responsabilidad — no guarantees on availability, user-generated content disclaimer
6. Legislación aplicable y jurisdicción — Spanish law, courts of Valencia
7. Contacto — info@yormit.com

**2. `src/pages/legal/PrivacyPolicy.tsx`** — 10 sections:
1. Responsable del tratamiento — full identification with all provided data
2. Datos que recogemos — registration data, profile, chat messages, photos, trip info, expenses, push notification tokens, usage data
3. Finalidades del tratamiento — account management, trip organization features, notifications, service improvement
4. Base jurídica — consent (registration), contract execution (service), legitimate interest (improvement)
5. Destinatarios — hosting/infrastructure providers, no data sold, international transfers with guarantees
6. Plazo de conservación — while account active + legal retention period, deletion on request
7. Derechos del usuario — access, rectification, deletion, opposition, limitation, portability, complaint to AEPD
8. Ejercicio de derechos — email info@yormit.com with ID copy
9. Contenido subido por usuarios — users must not upload illegal content, photos of third parties require their authorization, platform may remove infringing content
10. Seguridad — technical and organizational measures

**3. `src/pages/legal/CookiesPolicy.tsx`** — 5 sections:
1. What are cookies — brief explanation
2. Cookies used — only technical/session cookies, no analytics/advertising/marketing cookies currently
3. Future changes — if analytics or marketing cookies are added, this policy and consent mechanism will be updated
4. Cookie management — browser settings instructions, impact warning
5. Contact — info@yormit.com

**4. `src/pages/legal/Contact.tsx`** — Add phone number card alongside email, keep response time note:
- Email: info@yormit.com
- Phone: 616 448 475
- Response time: 48 business hours

### What does NOT change
- No design, layout, or CSS changes
- No routing changes
- No changes to Landing, Dashboard, App.tsx, or any other file
- Same component structure, same imports, same wrapper classes

### Banner de cookies
After implementation I will advise on whether a cookie consent banner is needed given the current cookie usage (spoiler: since only technical cookies are used, it is not legally required right now, but recommended to add one proactively).

