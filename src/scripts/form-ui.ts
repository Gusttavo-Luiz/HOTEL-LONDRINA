/** Utilitários de interface para formulários acessíveis. */

export function setFieldError(form: HTMLFormElement, name: string, message?: string) {
  const input = form.elements.namedItem(name) as HTMLInputElement | null;
  const error = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  if (!input) return;
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    if (error) error.textContent = message;
  } else {
    input.removeAttribute('aria-invalid');
    if (error) error.textContent = '';
  }
}

export function clearErrors(form: HTMLFormElement) {
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => (el.textContent = ''));
}

/** Aplica os erros e move o foco para o primeiro campo inválido. Retorna `true` se não houver erros. */
export function applyErrors(form: HTMLFormElement, errors: Record<string, string | undefined>): boolean {
  clearErrors(form);
  const entries = Object.entries(errors).filter(([, message]) => Boolean(message));
  entries.forEach(([name, message]) => setFieldError(form, name, message));
  if (entries.length) {
    const first = form.querySelector<HTMLElement>('[aria-invalid="true"]');
    first?.focus();
    setStatus(
      form,
      'error',
      entries.length === 1 ? 'Verifique o campo destacado.' : `Verifique os ${entries.length} campos destacados.`,
    );
    return false;
  }
  return true;
}

export function setStatus(form: HTMLFormElement, tone: 'success' | 'error' | '', html: string) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) return;
  status.dataset.tone = tone;
  status.innerHTML = html;
}

export function setBusy(button: HTMLButtonElement | null, busy: boolean) {
  if (!button) return;
  button.disabled = busy;
  if (busy) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
}

/** Abre o WhatsApp em nova aba; retorna `false` se o navegador bloquear a janela. */
export function openExternal(url: string): boolean {
  // `noopener` faria window.open retornar sempre null; anulamos o opener manualmente.
  const win = window.open(url, '_blank');
  if (!win) return false;
  win.opener = null;
  return true;
}

export function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
