import nodemailer, { type Transporter } from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO } from 'astro:env/server';
import { formatDateBR, nights, type RequestData } from '../lib/validation';

let transporter: Transporter | null = null;

export const mailConfigured = () => Boolean(SMTP_HOST && MAIL_TO && MAIL_FROM);

function getTransport(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ?? 587,
    secure: SMTP_SECURE ?? false,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    // Conteúdo é sempre texto puro gerado aqui; nada de arquivos/URLs externos.
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return transporter;
}

export function describeRequest(id: number, data: RequestData): string {
  const lines = [
    `Solicitação nº ${id} — ${data.subject === 'reserva' ? 'Pedido de reserva' : 'Pedido de informações'}`,
    '',
    `Nome: ${data.name}`,
    `Contato (${data.contactType}): ${data.contact}`,
  ];
  if (data.checkIn && data.checkOut) {
    const n = nights(data.checkIn, data.checkOut);
    lines.push(
      `Entrada: ${formatDateBR(data.checkIn)}`,
      `Saída: ${formatDateBR(data.checkOut)} (${n} ${n === 1 ? 'noite' : 'noites'})`,
      `Adultos: ${data.adults ?? '-'} · Crianças: ${data.children ?? 0}`,
    );
  }
  if (data.roomId) lines.push(`Acomodação de interesse: ${data.roomId}`);
  if (data.message) lines.push('', 'Mensagem:', data.message);
  lines.push('', 'Responda ao hóspede pelo contato informado. A reserva só está confirmada após o retorno da recepção.');
  return lines.join('\n');
}

/** Envia o aviso por e-mail. Retorna `true` se o servidor SMTP aceitou a mensagem. */
export async function sendNotification(id: number, data: RequestData): Promise<boolean> {
  if (!mailConfigured()) return false;
  await getTransport().sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    replyTo: data.contactType === 'email' ? data.contact : undefined,
    subject: `[Site] ${data.subject === 'reserva' ? 'Reserva' : 'Contato'} nº ${id} — ${data.name}`,
    text: describeRequest(id, data),
  });
  return true;
}
