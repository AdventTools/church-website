import Redis from 'ioredis';

// Rate-limit pe Redis local (fereastră fixă). Fail-open: dacă Redis lipsește sau cade,
// nu blocăm utilizatorii legitimi — securitatea reală rămâne honeypot + verificarea de timp.
let client: Redis | null = null;
let disabled = false;

function redis(): Redis | null {
  if (disabled) return null;
  if (client) return client;
  const url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
  try {
    client = new Redis(url, { maxRetriesPerRequest: 1, enableOfflineQueue: false, lazyConnect: false });
    client.on('error', () => {}); // fail-open, fără a umple logul
    return client;
  } catch {
    disabled = true;
    return null;
  }
}

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const r = redis();
  if (!r) return true;
  try {
    const k = `rl:${key}`;
    const n = await r.incr(k);
    if (n === 1) await r.expire(k, windowSec);
    return n <= limit;
  } catch {
    return true;
  }
}
