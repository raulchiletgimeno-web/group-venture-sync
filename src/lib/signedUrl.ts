import { supabase } from "@/integrations/supabase/client";

const BUCKET = "trip-photos";
const DEFAULT_TTL = 3600; // 1h
const REFRESH_WINDOW_MS = 5 * 60 * 1000; // refresh if <5 min remaining

type CacheEntry = { url: string; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<string>>();

function cached(path: string): string | null {
  const e = cache.get(path);
  if (!e) return null;
  if (e.expiresAt - Date.now() < REFRESH_WINDOW_MS) return null;
  return e.url;
}

export async function getSignedUrl(path: string, expiresIn: number = DEFAULT_TTL): Promise<string> {
  if (!path) return "";
  const hit = cached(path);
  if (hit) return hit;
  const existing = pending.get(path);
  if (existing) return existing;

  const p = (async () => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) {
      throw error ?? new Error("Failed to sign URL");
    }
    cache.set(path, { url: data.signedUrl, expiresAt: Date.now() + expiresIn * 1000 });
    return data.signedUrl;
  })();
  pending.set(path, p);
  try {
    return await p;
  } finally {
    pending.delete(path);
  }
}

export async function getSignedUrls(
  paths: string[],
  expiresIn: number = DEFAULT_TTL
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const missing: string[] = [];
  for (const path of paths) {
    if (!path) continue;
    const hit = cached(path);
    if (hit) out[path] = hit;
    else missing.push(path);
  }
  if (missing.length === 0) return out;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(missing, expiresIn);
  if (error) {
    // Fall back to per-path signing (best-effort).
    await Promise.all(
      missing.map(async (p) => {
        try {
          out[p] = await getSignedUrl(p, expiresIn);
        } catch {
          /* skip */
        }
      })
    );
    return out;
  }
  const expiresAt = Date.now() + expiresIn * 1000;
  for (const row of data ?? []) {
    if (row.path && row.signedUrl) {
      cache.set(row.path, { url: row.signedUrl, expiresAt });
      out[row.path] = row.signedUrl;
    }
  }
  return out;
}

export function clearSignedUrlCache() {
  cache.clear();
}
