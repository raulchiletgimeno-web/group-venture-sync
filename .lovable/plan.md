

## Ajustes finos en la Política de Privacidad

Solo se modifica `src/pages/legal/PrivacyPolicy.tsx`. Ningún otro archivo se toca.

### Cambio 1 — Sección 4: Base jurídica (líneas 66-70)

Reescribir los tres puntos para que:
- **Ejecución del servicio** sea la base principal (registro, gestión de viajes, chat, fotos, gastos, etc.)
- **Consentimiento** quede vinculado específicamente a funcionalidades opcionales como notificaciones push
- **Interés legítimo** se mantenga para mejora y seguridad

Nuevo texto de los `<li>`:
- **Ejecución de la relación contractual:** el tratamiento de tus datos es necesario para prestarte el servicio ofrecido por YORMIT, incluyendo la gestión de tu cuenta, la organización de viajes, la comunicación entre miembros, la subida de fotografías y el registro de gastos compartidos.
- **Consentimiento:** para determinadas funcionalidades opcionales, como el envío de notificaciones push, el tratamiento se basa en tu consentimiento expreso, que puedes revocar en cualquier momento.
- **Interés legítimo:** para mejorar el funcionamiento de la plataforma y garantizar su seguridad.

### Cambio 2 — Sección 9: Contenido subido por usuarios (líneas 121-126)

Reforzar la redacción y añadir referencia a menores. Reemplazar los dos párrafos actuales por tres:

1. Los usuarios son los únicos responsables del contenido que suban o compartan a través de YORMIT. Queda prohibido subir contenido ilícito, difamatorio, ofensivo o que vulnere derechos de terceros.
2. Al subir fotografías o cualquier dato personal de terceras personas, **el usuario declara y garantiza** que cuenta con la autorización, legitimación o consentimiento suficiente de dichas personas para compartir dicho contenido a través de la plataforma.
3. En el caso de imágenes o datos de **menores de edad**, el usuario debe contar con la autorización expresa de sus progenitores o representantes legales, cuando así lo exija la normativa aplicable.
4. (Párrafo final existente sobre responsabilidad de la plataforma y retirada de contenido, sin cambios.)

### Resumen de cambios
| Sección | Qué cambia |
|---------|-----------|
| 4. Base jurídica | Reordena: ejecución del servicio como base principal, consentimiento para push y opcionales |
| 9. Contenido subido | Refuerza "declara y garantiza", añade párrafo sobre menores |

### Nada más se toca
No se modifican diseño, rutas, estructura, ni ningún otro archivo de la aplicación.

