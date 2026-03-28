

## Add author-only message deletion to Chat

### Current state

- **Database (RLS)**: The `trip_messages` table already has the correct policy: `"Author can delete own messages"` with `USING (auth.uid() = user_id)`. Backend is already secure.
- **UI**: The chat has **no delete functionality at all** — no button, no gesture, nothing. Users currently cannot delete any messages.
- **Storage**: The `trip-photos` bucket stores chat media files. Storage deletion uses the Supabase client which respects the authenticated user context.

### What needs to change

Only the UI needs updating — the database layer is already correctly locked down.

### Changes — single file: `src/pages/trips/Chat.tsx`

1. **Add `Trash2` icon** to lucide imports
2. **Add `deleteMessage` function** that:
   - Deletes from `trip_messages` table (RLS enforces author-only)
   - If the message has a `file_path`, also removes the file from storage
   - If the message is an image, also removes the corresponding `trip_photos` record
   - Removes the message from local state
3. **Add delete button on each message bubble** — only rendered when `isOwn` is true (i.e., `msg.user_id === user?.id`)
   - Small trash icon, shown inside the message bubble near the timestamp
   - Clean, minimal design consistent with the premium look

### Security summary

| Layer | Protection |
|-------|-----------|
| UI | Delete icon only rendered for `msg.user_id === user?.id` |
| App logic | `deleteMessage` only callable on own messages |
| Database (RLS) | `auth.uid() = user_id` — already in place, rejects unauthorized deletes |

### UX

- Non-authors see no delete option whatsoever
- Author sees a small trash icon on hover/tap, keeping the chat clean
- Confirmation not needed for single messages (matches standard chat UX)

