## Auditoría de buckets y policies de Storage

He revisado el estado real del proyecto (no el snapshot del panel) y la advertencia "Public Bucket Allows Listing" **ya no existe**.

### 1. Buckets existentes

Solo hay un bucket en el proyecto:

| Bucket | public |
|---|---|
| `trip-photos` | **false** (privado) |

No hay ningún otro bucket. No queda ningún bucket público.

### 2. Policies de `storage.objects` activas

| Operación | Policy | Condición |
|---|---|---|
| SELECT | Trip members can view trip photos | `bucket_id = 'trip-photos' AND is_trip_member(trip_id)` — solo rol `authenticated` |
| INSERT | Trip members can upload photos | `bucket_id = 'trip-photos' AND auth.role() = 'authenticated' AND is_trip_member(trip_id)` |
| DELETE | Author or creator can delete photos | `auth.role() = 'authenticated' AND (autor del archivo O creador del viaje)` |

No existe ninguna policy con `USING (true)`, ni ninguna que permita subir, listar o borrar sin ser miembro del viaje. No hay policy para el rol `anon`. No hay policy de UPDATE (no se puede sobrescribir desde cliente fuera de los flujos previstos por upsert del propietario).

### 3. Resultado del linter ahora mismo

`supabase--linter` devuelve **5 warnings**, todas del tipo "Signed-In Users Can Execute SECURITY DEFINER Function" (las que ya decidimos mantener: `is_trip_member`, `is_trip_creator`, `get_unseen_counts`, `get_unseen_section_counts`, `find_trip_id_by_invite_code`, necesarias para RLS y hooks).

**Ya NO aparece** `0025_public_bucket_allows_listing` ni ningún hallazgo de storage. La corrección de hacer `trip-photos` privado (hecha en un cambio anterior) ya resolvió esta advertencia.

### 4. Sobre el panel de seguridad

Los hallazgos que ves en el panel (`PUBLIC_STORAGE_EXPOSURE`, `SUPA_public_bucket_allows_listing`) provienen de un escaneo anterior y están desactualizados. Para refrescarlos hay que volver a ejecutar el escaneo desde el panel de Seguridad, o yo puedo marcar el finding como resuelto con `security--manage_security_finding` para que desaparezca de la lista.

### Plan propuesto

**Opción A (recomendada): no tocar código ni SQL.** El problema ya está corregido. Solo marco como resueltos en el panel:

- `supabase_lov` / `trip_photos_bucket_public_read` → mark_as_fixed (el bucket ya es privado y las policies exigen `is_trip_member`).
- `supabase` / `SUPA_public_bucket_allows_listing` → mark_as_fixed (no aparece en el linter actual).

No se toca: diseño, navegación, emails, chat, gastos, transport, accommodation, schedule, auth, fotos (lógica), i18n, RLS, ni ninguna otra parte de la app. Cero cambios de código o SQL.

### Validación que haré tras aprobar

1. Re-ejecutar `supabase--linter` y confirmar que no aparece ningún hallazgo de storage.
2. Confirmar con `SELECT public FROM storage.buckets` que `trip-photos` sigue privado.
3. Confirmar con `pg_policies` que las 3 policies siguen como están descritas arriba.

¿Apruebas la Opción A (solo marcar como resuelto, sin tocar nada)?
