import type { APIRoute } from 'astro';
import { validateRequest, type RequestInput } from '../../lib/validation';
import { insertRequest, markEmailSent } from '../../server/db';
import { mailConfigured, sendNotification } from '../../server/mailer';
import { rateLimit } from '../../server/rate-limit';
import { clientIp, isSameOrigin } from '../../server/client-ip';

export const prerender = false;

const MAX_BODY = 16 * 1024;
const MIN_FILL_MS = 2500;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const withTimeout = <T>(promise: Promise<T>, ms: number) =>
  Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!isSameOrigin(request)) return json(403, { error: 'Origem não permitida.' });
  if (!request.headers.get('content-type')?.includes('application/json'))
    return json(415, { error: 'Formato de envio não suportado.' });
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) return json(413, { error: 'Mensagem muito longa.' });

  const ip = clientIp(request, clientAddress);
  if (!rateLimit(`req:${ip}`))
    return json(429, { error: 'Muitas solicitações em pouco tempo. Aguarde alguns minutos ou ligue para a recepção.' });

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return json(413, { error: 'Mensagem muito longa.' });
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('invalid');
  } catch {
    return json(400, { error: 'Não foi possível ler os dados enviados.' });
  }

  // Antispam: campo invisível preenchido indica robô; não armazenamos nada.
  if (typeof body.empresa_url === 'string' && body.empresa_url.trim() !== '') return json(202, { ok: true });
  if (typeof body.elapsed !== 'number' || body.elapsed < MIN_FILL_MS)
    return json(400, { error: 'Envio muito rápido. Confira os dados e tente novamente.' });

  const { data, errors } = validateRequest(body as unknown as RequestInput);
  if (!data) return json(422, { error: 'Verifique os campos destacados.', fields: errors });

  let id: number;
  try {
    id = insertRequest(data);
  } catch (error) {
    console.error('[solicitacoes] falha ao gravar', error);
    return json(500, { error: 'Não foi possível registrar sua solicitação agora. Ligue para a recepção.' });
  }

  let emailSent = false;
  if (mailConfigured()) {
    try {
      emailSent = await withTimeout(sendNotification(id, data), 12_000);
      if (emailSent) markEmailSent(id);
    } catch (error) {
      // A solicitação já está gravada e visível no painel; apenas registramos a falha.
      console.error(`[solicitacoes] e-mail da solicitação ${id} não enviado`, error);
    }
  }

  return json(201, { ok: true, id, emailSent });
};

export const ALL: APIRoute = () => json(405, { error: 'Método não permitido.' });
