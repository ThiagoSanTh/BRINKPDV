import { sqliteDb } from "./db-sqlite";

interface SyncItem {
  id: string;
  entity: string;
  payload: string;
  createdAt: string;
  synced: number;
}

function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL?.trim();
}

function getSupabaseKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim();
}

export async function syncPendingToSupabase() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseKey) {
    return { ok: false, reason: "missing_supabase_config" };
  }

  const pending = sqliteDb.prepare(
    'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC'
  ).all() as SyncItem[];

  if (pending.length === 0) {
    return { ok: true, synced: 0 };
  }

  for (const item of pending) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${item.entity}`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: item.payload,
      });

      if (response.ok) {
        sqliteDb.prepare('UPDATE sync_queue SET synced = 1 WHERE id = ?').run(item.id);
      }
    } catch (error) {
      console.warn(`[SYNC] Falha ao sincronizar ${item.entity}:`, error);
      break;
    }
  }

  return { ok: true, synced: pending.filter((item) => item.synced === 1).length };
}

export function scheduleSync() {
  if (typeof setInterval !== "function") return;

  const runSync = () => {
    void syncPendingToSupabase().catch(() => undefined);
  };

  runSync();
  const interval = setInterval(runSync, 15000);

  if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("online", runSync);
    globalThis.addEventListener("offline", () => undefined);
  }

  return interval;
}
