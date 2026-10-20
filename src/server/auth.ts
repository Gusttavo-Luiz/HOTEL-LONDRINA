import { timingSafeEqual, createHash } from 'node:crypto';
import { ADMIN_USER, ADMIN_PASSWORD } from 'astro:env/server';

/** O painel só é habilitado com usuário e senha forte configurados. */
export const adminEnabled = () => Boolean(ADMIN_USER && ADMIN_PASSWORD && ADMIN_PASSWORD.length >= 12);

const digest = (value: string) => createHash('sha256').update(value).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

/** Valida o cabeçalho HTTP Basic Auth. */
export function isAuthorized(header: string | null): boolean {
  if (!adminEnabled() || !header?.startsWith('Basic ')) return false;
  let decoded = '';
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    return false;
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return false;
  const userOk = safeEqual(decoded.slice(0, sep), ADMIN_USER!);
  const passOk = safeEqual(decoded.slice(sep + 1), ADMIN_PASSWORD!);
  return userOk && passOk;
}
