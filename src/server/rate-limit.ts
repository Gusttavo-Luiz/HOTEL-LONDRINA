import { RATE_LIMIT_MAX } from 'astro:env/server';

/** Limite simples em memória: N tentativas por janela, por chave (IP). */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max = RATE_LIMIT_MAX ?? 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, list] of hits) if (list.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}
