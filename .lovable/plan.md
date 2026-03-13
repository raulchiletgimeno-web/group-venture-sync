

## Plan: Arreglar video HEVC incompatible con navegadores

### Problema detectado
El archivo `Video_Publicidad_Yormit.mp4` está codificado en **HEVC (H.265/hvc1)**, un códec que la mayoría de navegadores (Chrome, Firefox, Edge) **no soportan para el track de video**, pero sí para audio. Por eso se escucha el audio pero la imagen aparece en negro.

### Solución
Re-codificar el video a **H.264 (AVC) + AAC**, que es compatible con todos los navegadores. Esto requiere un paso externo ya que no es posible transcodificar video dentro de Lovable.

### Pasos

1. **Convertir el video** usando una de estas opciones:
   - **FFmpeg** (línea de comandos): `ffmpeg -i Video_Publicidad_Yormit.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k Video_Publicidad_Yormit_h264.mp4`
   - **HandBrake** (app gratuita): Abrir el video → Preset "Fast 1080p30" → Exportar
   - **Convertidor online**: cloudconvert.com o convertio.co, seleccionar MP4 con H.264

2. **Subir el archivo convertido** a Lovable reemplazando el actual en `public/videos/Video_Publicidad_Yormit.mp4`

3. **Verificar** que el video muestra imagen y audio correctamente en el modal

### Notas técnicas
- El archivo actual pesa ~67 MB y está grabado con un Samsung Galaxy Z Flip6, que por defecto graba en HEVC
- Para futuras grabaciones, se puede cambiar la configuración de la cámara del teléfono a H.264 (en Ajustes de cámara → Opciones de video avanzadas → Desactivar "Videos de alta eficiencia")
- No se requieren cambios de código; el problema es exclusivamente del formato del archivo de video

