

## Banderas visibles con imagenes locales

Las banderas de flagcdn.com no se estan cargando correctamente, por eso ves iconos vacios. La solucion es reemplazar las URLs externas por imagenes PNG incrustadas directamente en el codigo (data URIs) o usar un CDN mas fiable con formato PNG.

### Cambios:

1. **`src/i18n/translations.ts`**: Cambiar las URLs de flagcdn.com SVG a formato PNG con un CDN mas fiable que soporte CORS correctamente. Usaremos `https://flagcdn.com/w80/xx.png` (formato PNG en vez de SVG) o alternativamente emojis en formato de imagen desde otro servicio como `https://flagsapi.com/XX/flat/64.png`.

2. **`src/pages/Index.tsx`**: Mejorar el estilo visual de las banderas:
   - Aumentar ligeramente el tamano (w-8 h-6)
   - Anadir un borde sutil (`border border-white/30`) para que se distingan del fondo
   - Anadir un anillo de color cuando esta seleccionada (`ring-2 ring-white`) para indicar claramente cual idioma esta activo

### Detalle tecnico:

- Se cambiaran las URLs de `.svg` a `.png` ya que los SVG de flagcdn tienen problemas de carga en algunos contextos
- Alternativa: si PNG de flagcdn tampoco funciona, se usaran imagenes de `https://flagsapi.com/` como respaldo
- Se anadira un borde visible y efecto de seleccion mas claro para distinguir las banderas entre si

