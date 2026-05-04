## Encuestas de grupo en el chat

Añado una nueva opción **"Crear encuesta"** dentro del menú del botón **+** del chat (junto a Cámara, Galería y Ubicación), sin tocar nada más de la app. El micrófono permanece visible y separado.

---

### 1. Flujo de usuario

**Crear encuesta:**
1. Pulsar **+** → **Crear encuesta** (nueva opción, mismo estilo que las otras).
2. Se abre un modal limpio (Dialog) con:
   - Campo *Pregunta* (obligatorio, 1–200 caracteres).
   - Lista de opciones (mín. 2, máx. 10). Empieza con 2 vacías + botón **+ Añadir opción**.
   - Cada opción es eliminable (icono X) si hay más de 2.
   - Botón **Publicar encuesta** (deshabilitado hasta que haya pregunta + ≥2 opciones rellenas).
3. Al publicar, aparece como un mensaje nuevo en el chat (tipo `poll`).

**Votar:**
- Cualquier miembro pulsa una opción → se registra su voto.
- **Voto único + se puede cambiar** (toca otra opción y se cambia). Justificación al final.
- La opción que ha votado el usuario se ve marcada (radio relleno + acento teal).

**Resultados:**
- Siempre visibles en la tarjeta:
  - Texto de cada opción.
  - Barra de progreso teal con el % de votos.
  - Nº absoluto de votos por opción.
  - Total de votos al pie ("12 votos").
- Actualización en tiempo real (realtime) para todos los miembros.

**Borrar:** solo el autor de la encuesta puede borrarla (mismo patrón que el resto de mensajes).

---

### 2. Cómo se ve en el chat

Tarjeta dentro de la burbuja blanca habitual (mismos colores YORMIT, redondeo y sombras):

```text
┌─────────────────────────────────────┐
│ 📊 Encuesta                         │
│ ¿Dónde cenamos esta noche?          │
│                                     │
│ ◉ Pizzería Da Marco       ████ 60% │
│                                  6  │
│ ○ Restaurante asiático    ██   30% │
│                                  3  │
│ ○ Cocinar en casa          █   10% │
│                                  1  │
│                                     │
│ 10 votos                            │
└─────────────────────────────────────┘
```

- Cabecera con icono `BarChart3` + "Encuesta".
- Opciones tocables (botones grandes, accesibles en móvil).
- Animación suave de la barra al votar.
- Sigue funcionando reply / swipe / borrar como cualquier mensaje.

---

### 3. Modelo de datos (migración)

Tres cambios mínimos y aislados:

**a) Permitir `poll` como tipo de mensaje** (igual que hicimos con `location`):

```sql
ALTER TABLE public.trip_messages
  DROP CONSTRAINT IF EXISTS trip_messages_type_check;
ALTER TABLE public.trip_messages
  ADD CONSTRAINT trip_messages_type_check
  CHECK (type = ANY (ARRAY['text','audio','image','location','poll']));
```

**b) Tabla `trip_polls`** (una fila por encuesta, vinculada al mensaje):

```sql
CREATE TABLE public.trip_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL UNIQUE REFERENCES public.trip_messages(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL,
  created_by uuid NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,  -- [{ id: "opt_1", text: "Pizza" }, ...]
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view polls"   ON public.trip_polls FOR SELECT TO authenticated USING (is_trip_member(trip_id));
CREATE POLICY "Members create polls" ON public.trip_polls FOR INSERT TO authenticated WITH CHECK (is_trip_member(trip_id) AND created_by = auth.uid());
CREATE POLICY "Author deletes polls" ON public.trip_polls FOR DELETE TO authenticated USING (created_by = auth.uid());
```

**c) Tabla `trip_poll_votes`** (un voto por usuario y encuesta — UNIQUE permite cambiar voto vía upsert):

```sql
CREATE TABLE public.trip_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.trip_polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  option_id text NOT NULL,
  voted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);
ALTER TABLE public.trip_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view votes" ON public.trip_poll_votes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM trip_polls p WHERE p.id = poll_id AND is_trip_member(p.trip_id)));
CREATE POLICY "Members vote" ON public.trip_poll_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM trip_polls p WHERE p.id = poll_id AND is_trip_member(p.trip_id)));
CREATE POLICY "Members change own vote" ON public.trip_poll_votes FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members remove own vote" ON public.trip_poll_votes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_poll_votes;
```

**d) Actualizar `get_unseen_section_counts` y `get_unseen_counts`**: no hace falta — las encuestas viajan como `trip_messages` tipo `poll` y ya cuentan como mensajes nuevos en el badge del chat. ✅

---

### 4. Cambios en código

**`src/pages/trips/Chat.tsx`**
- Añadir `"poll"` al tipo `Message`.
- Añadir cuarto botón en el popover del **+**: **"Crear encuesta"** (icono `BarChart3`, mismo patrón visual que los otros 3).
- Nuevo estado `pollDialogOpen` y nuevo componente local `<PollDialog />` con el formulario (Dialog + Input pregunta + lista de Inputs opciones + botón añadir/eliminar + Publicar).
- Función `createPoll(question, options)`:
  1. Insertar un `trip_messages` con `type: 'poll'`, `content: question`.
  2. Insertar `trip_polls` con `message_id`, `options` (cada una con `id` generado: `opt_<uuid>`).
  3. `notifyTripEvent(tripId, "chat", user.id)`.
- Render del mensaje cuando `msg.type === 'poll'`: nuevo subcomponente `<PollCard pollMessageId={msg.id} isOwn={isOwn} />` que:
  - Carga `trip_polls` + `trip_poll_votes` por `poll_id`.
  - Suscribe a realtime (`trip_poll_votes` filtrado por `poll_id`).
  - Renderiza pregunta, opciones tocables, barras y total.
  - Al pulsar opción: `upsert` en `trip_poll_votes` por `(poll_id, user_id)` cambiando `option_id` (permite cambiar voto). Si pulsa la opción ya votada → `delete` (quitar voto).
- `messageSnippet` devuelve `t.pollMsg` cuando `type === 'poll'` (para previews de reply).

**`src/i18n/translations.ts`** — añadir 7 idiomas × claves nuevas:
- `createPoll` ("Crear encuesta" / "Create poll" / …)
- `poll` ("Encuesta")
- `pollMsg` ("📊 Encuesta")
- `pollQuestionPlaceholder` ("Escribe una pregunta…")
- `pollOptionPlaceholder` ("Opción {n}")
- `addOption` ("Añadir opción")
- `publishPoll` ("Publicar encuesta")
- `pollVotesCount` ({n} votos / {n} voto)
- `noVotesYet` ("Sin votos todavía")

---

### 5. Decisión de UX: ¿se puede cambiar el voto?

**Sí, se permite cambiar el voto y quitarlo.**

Razones:
- Es un grupo de viaje pequeño y de confianza, no una votación formal — la gente cambia de opinión ("al final prefiero la pizzería").
- WhatsApp lo permite y es la convención que los usuarios esperan.
- Volver a pulsar la misma opción quita el voto (toggle), por si alguien quiere abstenerse.
- Implementación más simple: una fila por usuario con `UNIQUE(poll_id, user_id)` + upsert.

---

### 6. Lo que NO se toca

Foto, galería, ubicación, audio, texto, replies, swipe, scroll, badges, notificaciones push, diseño global del chat, header, otras secciones, RLS de tablas existentes (sólo se amplía el CHECK de `type`).

---

### 7. Validación post-implementación

1. Publicado.
2. + → **Crear encuesta** abre modal premium.
3. Voto se registra en realtime para todos.
4. Resultados con barras y % visibles siempre.
5. Toque en otra opción cambia el voto; toque en la misma lo quita.
6. Solo el autor puede borrar la encuesta (cascada borra los votos).
7. Confirmado: nada más de la app modificado.
