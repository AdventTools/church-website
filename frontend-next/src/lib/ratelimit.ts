import Redis from 'ioredis';

// Rate-limit pe Redis local (fereastră fixă). Dacă Redis lipsește sau cade, limita NU dispare:
// se trece pe un contor în memoria procesului. E mai slab (se pierde la repornire și nu se împarte
// între instanțe), dar e singura instanță care rulează, iar alternativa — să lăsăm totul să treacă —
// înseamnă că limita se poate dezactiva pur și simplu doborând Redis.
let client: Redis | null = null;
let disabled = false;

function redis(): Redis | null {
  if (disabled) return null;
  if (client) return client;
  const url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
  try {
    client = new Redis(url, { maxRetriesPerRequest: 1, enableOfflineQueue: false, lazyConnect: false });
    client.on('error', () => {}); // fără a umple logul; rezerva din memorie preia limitarea
    return client;
  } catch {
    disabled = true;
    return null;
  }
}

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
  }
  const hit = memory.get(key);
  if (!hit || hit.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  hit.count += 1;
  return hit.count <= limit;
}

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const r = redis();
  if (!r) return memoryLimit(key, limit, windowSec);
  try {
    const k = `rl:${key}`;
    const n = await r.incr(k);
    if (n === 1) await r.expire(k, windowSec);
    return n <= limit;
  } catch {
    return memoryLimit(key, limit, windowSec);
  }
}
