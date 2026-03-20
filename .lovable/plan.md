

## Diagnosis: VAPID key mismatch

### Root cause (from edge function logs)

The `test-push` logs show this error:

```text
Test push send error: 403 the VAPID credentials in the authorization header
do not correspond to the credentials used to create the subscriptions.
```

This means:
1. **Subscriptions DO exist in the database** — the function found them (otherwise it would return `no_subscriptions` with 404).
2. **Sending fails** because the VAPID keys stored as secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) don't match the public key hardcoded in the frontend (`BOzv8tvd9ZoYQIdtCIZNDabxooM0qs8_pM3_Dagw1eTIfV1rEtFUetYOAJyvxxV3hACD_wTNLy8se2-0yggt0EI`).
3. The function catches the error silently and returns `sent: 0`, which the Dashboard shows as "0 dispositivos".

The browser creates push subscriptions bound to a specific VAPID public key. When the edge function tries to send using a different VAPID key pair, the push service rejects it with 403.

### Fix

#### 1. Regenerate VAPID keys and sync everywhere

Generate a new VAPID key pair, then:
- Update the `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` secrets with the new values
- Update the hardcoded `VAPID_PUBLIC_KEY` in `src/hooks/use-push-notifications.ts` to match

OR — easier approach — update the secrets to match the key already in the frontend code. The user needs to provide the matching private key for the public key `BOzv8tvd9...`.

Since we don't know which private key corresponds to the frontend public key, the safest approach is:
1. Generate a fresh VAPID key pair using `web-push generate-vapid-keys`
2. Update the secret `VAPID_PUBLIC_KEY` with the new public key
3. Update the secret `VAPID_PRIVATE_KEY` with the new private key
4. Update `src/hooks/use-push-notifications.ts` line 5 with the new public key
5. After publishing, the user must re-subscribe on mobile (old subscriptions are invalidated by the key change)

#### 2. Clean up stale subscriptions

After updating keys, old subscriptions in the DB are useless. Add a step to clear them:
- Run a DELETE on `push_subscriptions` table to remove all existing rows (they were created with the old key)

#### 3. Fix `getClaims` method (secondary issue)

The `test-push` function uses `supabase.auth.getClaims(token)` which may not exist in supabase-js v2. Replace with `supabase.auth.getUser()` which is the standard method:

```typescript
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) { return 401; }
const userId = user.id;
```

### Files to modify
1. `src/hooks/use-push-notifications.ts` — update `VAPID_PUBLIC_KEY` constant
2. `supabase/functions/test-push/index.ts` — fix auth to use `getUser()` instead of `getClaims()`
3. `supabase/functions/send-push/index.ts` — same `getUser()` fix for consistency
4. Secrets: update `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to a matching pair
5. Database: clear existing `push_subscriptions` rows

### Steps
1. I will generate a new VAPID key pair using a script
2. Ask you to update the two secrets with the new values
3. Update the frontend constant
4. Fix auth method in both edge functions
5. Clear stale subscriptions
6. Publish → you re-subscribe on mobile → test again

### Expected result
After re-subscribing, the Test button should return "1 dispositivo" and you should receive the push notification.

