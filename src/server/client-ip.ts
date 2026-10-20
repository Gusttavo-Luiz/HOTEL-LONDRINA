import { TRUST_PROXY } from 'astro:env/server';

/** IP do visitante; usa X-Forwarded-For somente atrás de proxy confiável. */
export function clientIp(request: Request, fallback: string | undefined): string {
  if (TRUST_PROXY) {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwarded) return forwarded;
  }
  return fallback ?? 'desconhecido';
}

/** Host público da requisição (considera X-Forwarded-Host atrás de proxy confiável). */
export function requestHost(request: Request): string | null {
  if (TRUST_PROXY) {
    const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    if (forwarded) return forwarded.toLowerCase();
  }
  return request.headers.get('host')?.toLowerCase() ?? null;
}

/** Aceita apenas requisições sem Origin (mesmo site) ou com Origin igual ao host atendido. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host.toLowerCase() === requestHost(request);
  } catch {
    return false;
  }
}
