/** Regras de validação compartilhadas pelos formulários (executadas no navegador). */

const DAY_MS = 86_400_000;

/** Converte "AAAA-MM-DD" em data local (meia-noite) ou `null` se inválida. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS);
}

export function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Limite de antecedência aceito pelo formulário (evita datas digitadas por engano). */
export const MAX_DAYS_AHEAD = 730;

export function validateStay(checkInRaw: string, checkOutRaw: string) {
  const errors: { checkin?: string; checkout?: string } = {};
  const checkIn = checkInRaw ? parseISODate(checkInRaw) : null;
  const checkOut = checkOutRaw ? parseISODate(checkOutRaw) : null;
  const now = today();

  if (!checkInRaw) errors.checkin = 'Informe a data de check-in.';
  else if (!checkIn) errors.checkin = 'Data de check-in inválida. Use o formato dd/mm/aaaa.';
  else if (checkIn < now) errors.checkin = 'O check-in não pode ser em uma data passada.';
  else if (nightsBetween(now, checkIn) > MAX_DAYS_AHEAD)
    errors.checkin = 'Para datas com mais de 2 anos de antecedência, fale diretamente com a recepção.';

  if (!checkOutRaw) errors.checkout = 'Informe a data de check-out.';
  else if (!checkOut) errors.checkout = 'Data de check-out inválida. Use o formato dd/mm/aaaa.';
  else if (checkIn && checkOut <= checkIn) errors.checkout = 'O check-out deve ser posterior ao check-in.';

  return { errors, checkIn, checkOut };
}

/** Remove caracteres de controle e espaços excedentes. */
export function clean(value: string, max = 500): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, max);
}

export function isValidName(value: string): boolean {
  const name = clean(value, 120);
  return name.length >= 2 && /\p{L}/u.test(name);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(value.trim()) && value.length <= 160;
}

/** Telefone brasileiro com DDD: 10 (fixo) ou 11 (celular) dígitos, com ou sem +55. */
export function normalizePhone(value: string): string | null {
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
