/**
 * Regras de validação compartilhadas entre o navegador e o servidor.
 * O servidor sempre revalida tudo — a validação no navegador é só conforto.
 */

export const LIMITS = {
  maxAdults: 10,
  maxChildren: 8,
  maxDaysAhead: 730,
  maxNights: 365,
  nameMax: 100,
  contactMax: 160,
  messageMax: 1500,
} as const;

export type Subject = 'reserva' | 'informacoes';

export interface StayInput {
  checkIn: string;
  checkOut: string;
  adults: number | string;
  children: number | string;
}

export interface RequestInput extends Partial<StayInput> {
  subject: Subject | string;
  name: string;
  contact: string;
  roomId?: string;
  message?: string;
  consent: boolean | string;
}

export interface RequestData {
  subject: Subject;
  name: string;
  contact: string;
  contactType: 'email' | 'telefone';
  checkIn: string | null;
  checkOut: string | null;
  adults: number | null;
  children: number | null;
  roomId: string | null;
  message: string;
}

export type FieldErrors = Partial<Record<keyof RequestInput | 'stay', string>>;

const DAY_MS = 86_400_000;

/* ---------- Datas ---------- */

/** "AAAA-MM-DD" → número de dias desde a época (UTC), ou null se inválida. */
export function dayNumber(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const time = Date.UTC(y, m - 1, d);
  const date = new Date(time);
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return time / DAY_MS;
}

export function isoFromDayNumber(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

/** Data de hoje em Londrina (America/Sao_Paulo), em "AAAA-MM-DD". */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDaysISO(iso: string, days: number): string {
  const base = dayNumber(iso);
  return base === null ? iso : isoFromDayNumber(base + days);
}

export function nights(checkIn: string, checkOut: string): number | null {
  const a = dayNumber(checkIn);
  const b = dayNumber(checkOut);
  return a === null || b === null ? null : b - a;
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/* ---------- Texto e contato ---------- */

/** Remove caracteres de controle e espaços repetidos. */
export function clean(value: unknown, max: number, multiline = false): string {
  let text = String(value ?? '').normalize('NFC');
  text = text.replace(multiline ? /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, ' ');
  text = multiline ? text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : text.replace(/\s+/g, ' ');
  return text.trim().slice(0, max);
}

export function isEmail(value: string): boolean {
  return value.length <= LIMITS.contactMax && /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(value);
}

/** Telefone brasileiro com DDD (10 ou 11 dígitos, aceita +55). Retorna só os dígitos. */
export function normalizePhone(value: string): string | null {
  if (/[a-z@]/i.test(value)) return null;
  let digits = value.replace(/\D/g, '');
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
  if (digits.length !== 10 && digits.length !== 11) return null;
  if (!/^[1-9]{2}/.test(digits)) return null;
  if (digits.length === 11 && digits[2] !== '9') return null;
  return digits;
}

export function formatPhone(digits: string): string {
  return digits.length === 11
    ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    : `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

function toInt(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
}

/* ---------- Estadia ---------- */

export function validateStay(input: StayInput, today = todayISO()) {
  const errors: { checkIn?: string; checkOut?: string; adults?: string; children?: string } = {};
  const start = input.checkIn ? dayNumber(input.checkIn) : null;
  const end = input.checkOut ? dayNumber(input.checkOut) : null;
  const todayN = dayNumber(today)!;

  if (!input.checkIn) errors.checkIn = 'Informe a data de entrada.';
  else if (start === null) errors.checkIn = 'Data de entrada inválida.';
  else if (start < todayN) errors.checkIn = 'A data de entrada não pode estar no passado.';
  else if (start - todayN > LIMITS.maxDaysAhead) errors.checkIn = 'Para datas com mais de 2 anos de antecedência, fale com a recepção.';

  if (!input.checkOut) errors.checkOut = 'Informe a data de saída.';
  else if (end === null) errors.checkOut = 'Data de saída inválida.';
  else if (start !== null && end <= start) errors.checkOut = 'A saída deve ser pelo menos 1 dia depois da entrada.';
  else if (start !== null && end - start > LIMITS.maxNights) errors.checkOut = 'Para estadias acima de 1 ano, fale com a recepção.';

  const adults = toInt(input.adults);
  const children = toInt(input.children) ?? 0;
  if (adults === null || Number.isNaN(adults) || adults < 1) errors.adults = 'Informe pelo menos 1 adulto.';
  else if (adults > LIMITS.maxAdults) errors.adults = `Para grupos com mais de ${LIMITS.maxAdults} adultos, fale com a recepção.`;
  if (Number.isNaN(children) || children < 0) errors.children = 'Quantidade de crianças inválida.';
  else if (children > LIMITS.maxChildren) errors.children = `Para mais de ${LIMITS.maxChildren} crianças, fale com a recepção.`;

  return { errors, adults: adults ?? 0, children: Number.isNaN(children) ? 0 : children };
}

/* ---------- Solicitação completa ---------- */

export function validateRequest(input: RequestInput, today = todayISO()): { data?: RequestData; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const subject: Subject | null = input.subject === 'reserva' || input.subject === 'informacoes' ? input.subject : null;
  if (!subject) errors.subject = 'Escolha o assunto.';

  const name = clean(input.name, LIMITS.nameMax);
  if (name.length < 2 || !/\p{L}/u.test(name)) errors.name = 'Informe seu nome.';

  const rawContact = clean(input.contact, LIMITS.contactMax);
  let contact = '';
  let contactType: 'email' | 'telefone' = 'email';
  if (!rawContact) errors.contact = 'Informe um e-mail ou telefone para retorno.';
  else if (rawContact.includes('@')) {
    if (isEmail(rawContact)) contact = rawContact.toLowerCase();
    else errors.contact = 'E-mail inválido. Exemplo: nome@exemplo.com.br';
  } else {
    const phone = normalizePhone(rawContact);
    if (phone) {
      contact = formatPhone(phone);
      contactType = 'telefone';
    } else errors.contact = 'Telefone inválido. Informe com DDD, por exemplo (43) 99999-9999.';
  }

  const message = clean(input.message, LIMITS.messageMax, true);
  const roomId = clean(input.roomId, 60) || null;

  let checkIn: string | null = null;
  let checkOut: string | null = null;
  let adults: number | null = null;
  let children: number | null = null;

  const hasStay = Boolean(input.checkIn || input.checkOut);
  if (subject === 'reserva' || hasStay) {
    const stay = validateStay(
      { checkIn: input.checkIn ?? '', checkOut: input.checkOut ?? '', adults: input.adults ?? '', children: input.children ?? 0 },
      today,
    );
    Object.assign(errors, stay.errors);
    checkIn = input.checkIn ?? null;
    checkOut = input.checkOut ?? null;
    adults = stay.adults;
    children = stay.children;
  }

  if (subject === 'informacoes' && message.length < 10) errors.message = 'Escreva sua mensagem (mínimo de 10 caracteres).';

  if (input.consent !== true && input.consent !== 'true' && input.consent !== 'on')
    errors.consent = 'É necessário autorizar o uso dos dados para responder à sua solicitação.';

  if (Object.keys(errors).length || !subject) return { errors };
  return {
    errors,
    data: { subject, name, contact, contactType, checkIn, checkOut, adults, children, roomId, message },
  };
}
