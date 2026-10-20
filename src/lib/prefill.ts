/**
 * Canal entre o widget de consulta, os botões "Consultar este quarto" e o
 * formulário de solicitação (ilhas independentes na mesma página).
 */
export interface Prefill {
  subject?: 'reserva' | 'informacoes';
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  roomId?: string;
}

const EVENT = 'triunfo:prefill';
let pending: Prefill | null = null;

export function sendPrefill(data: Prefill) {
  pending = { ...pending, ...data };
  window.dispatchEvent(new CustomEvent<Prefill>(EVENT, { detail: pending }));
}

/** Recebe preenchimentos (inclusive um enviado antes da ilha carregar). */
export function onPrefill(handler: (data: Prefill) => void): () => void {
  if (pending) handler(pending);
  const listener = (event: Event) => handler((event as CustomEvent<Prefill>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function goToRequestForm() {
  const form = document.getElementById('solicitacao');
  form?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  window.setTimeout(() => form?.querySelector<HTMLElement>('input[name="name"]')?.focus({ preventScroll: true }), 450);
}
