import { defineMiddleware } from 'astro:middleware';
import { adminEnabled, isAuthorized } from './server/auth';
import { rateLimit } from './server/rate-limit';
import { clientIp } from './server/client-ip';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const onRequest = defineMiddleware(async (context, next) => {
  // Páginas pré-renderizadas não passam por aqui em produção.
  if (context.isPrerendered) return next();

  const { pathname } = context.url;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!adminEnabled()) return new Response('Não encontrado', { status: 404 });
    const ip = clientIp(context.request, context.clientAddress);
    if (!isAuthorized(context.request.headers.get('authorization'))) {
      if (!rateLimit(`admin:${ip}`, 10, 15 * 60_000))
        return new Response('Muitas tentativas. Tente novamente mais tarde.', { status: 429 });
      return new Response('Autenticação necessária.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Painel Hotel Triunfo", charset="UTF-8"', 'Cache-Control': 'no-store' },
      });
    }
  }

  const response = await next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(key, value);
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
});
