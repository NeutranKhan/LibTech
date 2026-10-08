import { ensure } from '@/lib/domain';
const state = globalThis as unknown as {
  libtechRate?: Map<string, { count: number; expires: number }>;
};
export function rateLimit(key: string, max = 120, windowMs = 60000) {
  const map = (state.libtechRate ??= new Map());
  const now = Date.now();
  if (map.size > 5000) {
    for (const [k, v] of map) if (v.expires < now) map.delete(k);
    ensure(map.size <= 5000, 429, 'The service is busy. Try again shortly.');
  }
  const previous = map.get(key);
  const value =
    previous && previous.expires > now ? previous : { count: 0, expires: now + windowMs };
  ensure(value.count < max, 429, 'Please slow down and try again in a minute.');
  value.count++;
  map.set(key, value);
}
