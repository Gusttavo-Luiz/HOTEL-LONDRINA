import { useEffect, useId, useRef, useState, type SyntheticEvent } from 'react';
import { addDaysISO, nights, todayISO, validateRequest, LIMITS, type FieldErrors, type Subject } from '../../lib/validation';
import { onPrefill } from '../../lib/prefill';
import { Icon } from './Icon';
import './request-form.css';

interface Props {
  phoneDisplay: string;
  phoneHref: string;
  whatsappHref: string | null;
  rooms: { id: string; name: string }[];
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success'; id: number }
  | { kind: 'error'; message: string };

const initial = {
  subject: 'reserva' as Subject,
  name: '',
  contact: '',
  checkIn: '',
  checkOut: '',
  adults: '2',
  children: '0',
  roomId: '',
  message: '',
  consent: false,
  empresa_url: '',
};

export default function RequestForm({ phoneDisplay, phoneHref, whatsappHref, rooms }: Props) {
  const uid = useId();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const today = todayISO();
  const isReserva = values.subject === 'reserva';

  useEffect(
    () =>
      onPrefill((data) => {
        setValues((v) => ({
          ...v,
          subject: data.subject ?? v.subject,
          checkIn: data.checkIn ?? v.checkIn,
          checkOut: data.checkOut ?? v.checkOut,
          adults: data.adults !== undefined ? String(data.adults) : v.adults,
          children: data.children !== undefined ? String(data.children) : v.children,
          roomId: data.roomId !== undefined && rooms.some((r) => r.id === data.roomId) ? data.roomId : v.roomId,
        }));
        setStatus({ kind: 'idle' });
      }),
    [rooms],
  );

  const set = (key: keyof typeof initial) => (value: string | boolean) => {
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (key === 'checkIn' && typeof value === 'string' && value && (!v.checkOut || v.checkOut <= value)) {
        next.checkOut = addDaysISO(value, 1);
      }
      return next;
    });
    if (errors[key as keyof FieldErrors]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const fieldProps = (key: keyof FieldErrors) => ({
    id: `${uid}-${key}`,
    name: key,
    'aria-invalid': errors[key] ? (true as const) : undefined,
    'aria-describedby': errors[key] ? `${uid}-${key}-err` : undefined,
  });

  const errorFor = (key: keyof FieldErrors) =>
    errors[key] ? (
      <p className="field-error" id={`${uid}-${key}-err`}>
        {errors[key]}
      </p>
    ) : null;

  function focusFirstError(errs: FieldErrors) {
    const order: (keyof FieldErrors)[] = ['subject', 'name', 'contact', 'checkIn', 'checkOut', 'adults', 'children', 'message', 'consent'];
    const first = order.find((k) => errs[k]);
    if (first) document.getElementById(`${uid}-${first}`)?.focus();
  }

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === 'sending') return;

    const payload = isReserva ? values : { ...values, checkIn: '', checkOut: '', adults: '', children: '' };
    const { errors: errs } = validateRequest(payload, today);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus({ kind: 'error', message: 'Verifique os campos destacados.' });
      focusFirstError(errs);
      return;
    }

    setStatus({ kind: 'sending' });
    try {
      const response = await fetch('/api/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, elapsed: Date.now() - startedAt.current }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; id?: number; error?: string; fields?: FieldErrors };
      if (response.status === 201 && result.ok && typeof result.id === 'number') {
        setStatus({ kind: 'success', id: result.id });
        setValues(initial);
        startedAt.current = Date.now();
        requestAnimationFrame(() => statusRef.current?.focus());
        return;
      }
      if (result.fields) {
        setErrors(result.fields);
        focusFirstError(result.fields);
      }
      setStatus({ kind: 'error', message: result.error ?? 'Não foi possível enviar sua solicitação.' });
    } catch {
      setStatus({ kind: 'error', message: 'Sem conexão com o servidor. Verifique sua internet ou fale com a recepção.' });
    }
  }

  const n = isReserva && values.checkIn && values.checkOut ? nights(values.checkIn, values.checkOut) : null;

  if (status.kind === 'success') {
    return (
      <div className="rf rf--done" ref={statusRef} tabIndex={-1} role="status" aria-live="polite">
        <span className="rf__done-icon">
          <Icon name="check" size={28} />
        </span>
        <h3>Solicitação nº {status.id} recebida</h3>
        <p>
          Obrigado! Nossa recepção vai responder pelo contato informado. <strong>Sua reserva ainda não está confirmada</strong> — a
          confirmação de disponibilidade e valores é feita pela equipe do hotel.
        </p>
        <p>
          Precisa de resposta imediata? Ligue para <a href={phoneHref}>{phoneDisplay}</a>.
        </p>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => setStatus({ kind: 'idle' })}>
          Enviar outra solicitação
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="rf" onSubmit={submit} noValidate aria-labelledby={`${uid}-title`}>
      <h3 id={`${uid}-title`}>Envie sua solicitação</h3>

      <fieldset className="rf__subject">
        <legend className="label">Assunto</legend>
        {(
          [
            ['reserva', 'Solicitar reserva'],
            ['informacoes', 'Dúvidas e informações'],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="rf__chip">
            <input
              type="radio"
              name="subject"
              value={value}
              checked={values.subject === value}
              onChange={() => set('subject')(value)}
              id={value === 'reserva' ? `${uid}-subject` : undefined}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <div className="rf__row">
        <div className="field">
          <label htmlFor={`${uid}-name`}>
            Nome <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            className="input"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.nameMax}
            required
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
            {...fieldProps('name')}
          />
          {errorFor('name')}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-contact`}>
            E-mail ou telefone <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            className="input"
            type="text"
            inputMode="email"
            autoComplete="email"
            maxLength={LIMITS.contactMax}
            required
            placeholder="E-mail ou celular com DDD"
            value={values.contact}
            onChange={(e) => set('contact')(e.target.value)}
            {...fieldProps('contact')}
          />
          {errorFor('contact')}
        </div>
      </div>

      {isReserva && (
        <>
          <div className="rf__row">
            <div className="field">
              <label htmlFor={`${uid}-checkIn`}>
                Data de entrada <span className="req" aria-hidden="true">*</span>
              </label>
              <input
                className="input"
                type="date"
                min={today}
                max={addDaysISO(today, LIMITS.maxDaysAhead)}
                required
                value={values.checkIn}
                onChange={(e) => set('checkIn')(e.target.value)}
                {...fieldProps('checkIn')}
              />
              {errorFor('checkIn')}
            </div>
            <div className="field">
              <label htmlFor={`${uid}-checkOut`}>
                Data de saída <span className="req" aria-hidden="true">*</span>
              </label>
              <input
                className="input"
                type="date"
                min={values.checkIn ? addDaysISO(values.checkIn, 1) : addDaysISO(today, 1)}
                required
                value={values.checkOut}
                onChange={(e) => set('checkOut')(e.target.value)}
                {...fieldProps('checkOut')}
              />
              {errorFor('checkOut')}
            </div>
          </div>
          {n !== null && n > 0 && <p className="rf__nights">{n} {n === 1 ? 'noite' : 'noites'} de hospedagem</p>}

          <div className="rf__row rf__row--3">
            <div className="field">
              <label htmlFor={`${uid}-adults`}>Adultos</label>
              <select className="input" value={values.adults} onChange={(e) => set('adults')(e.target.value)} {...fieldProps('adults')}>
                {Array.from({ length: LIMITS.maxAdults }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              {errorFor('adults')}
            </div>
            <div className="field">
              <label htmlFor={`${uid}-children`}>Crianças</label>
              <select className="input" value={values.children} onChange={(e) => set('children')(e.target.value)} {...fieldProps('children')}>
                {Array.from({ length: LIMITS.maxChildren + 1 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              {errorFor('children')}
            </div>
            {rooms.length > 0 && (
              <div className="field">
                <label htmlFor={`${uid}-roomId`}>Acomodação</label>
                <select className="input" value={values.roomId} onChange={(e) => set('roomId')(e.target.value)} {...fieldProps('roomId')}>
                  <option value="">Sem preferência</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor={`${uid}-message`}>
          Mensagem{' '}
          {isReserva ? (
            <span className="hint">(opcional)</span>
          ) : (
            <span className="req" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <textarea
          className="input"
          rows={4}
          maxLength={LIMITS.messageMax}
          placeholder={isReserva ? 'Ex.: horário previsto de chegada, viagem com pet, nota fiscal para empresa…' : 'Como podemos ajudar?'}
          value={values.message}
          onChange={(e) => set('message')(e.target.value)}
          {...fieldProps('message')}
        />
        {errorFor('message')}
      </div>

      <div className="rf__hp" aria-hidden="true">
        <label htmlFor={`${uid}-hp`}>Não preencha este campo</label>
        <input id={`${uid}-hp`} type="text" tabIndex={-1} autoComplete="off" value={values.empresa_url} onChange={(e) => set('empresa_url')(e.target.value)} />
      </div>

      <div className="field">
        <label className="rf__consent">
          <input type="checkbox" checked={values.consent} onChange={(e) => set('consent')(e.target.checked)} {...fieldProps('consent')} />
          <span>
            Autorizo o Hotel Triunfo a usar estes dados para responder à minha solicitação, conforme a{' '}
            <a href="/politica-de-privacidade/">Política de Privacidade</a>. <span className="req" aria-hidden="true">*</span>
          </span>
        </label>
        {errorFor('consent')}
      </div>

      <button type="submit" className="btn btn--gold btn--block" aria-busy={status.kind === 'sending' || undefined} disabled={status.kind === 'sending'}>
        <Icon name="arrowRight" /> {isReserva ? 'Enviar solicitação de reserva' : 'Enviar mensagem'}
      </button>
      <p className="rf__legal">
        <span className="req" aria-hidden="true">*</span> Campos obrigatórios. A reserva só é confirmada após o retorno da recepção.
      </p>

      <div aria-live="polite" role="status">
        {status.kind === 'error' && (
          <p className="alert alert--error">
            <Icon name="info" size={18} />
            <span>
              {status.message} Se preferir, ligue para <a href={phoneHref}>{phoneDisplay}</a>
              {whatsappHref && (
                <>
                  {' '}
                  ou{' '}
                  <a href={whatsappHref} target="_blank" rel="noopener">
                    fale pelo WhatsApp
                  </a>
                </>
              )}
              .
            </span>
          </p>
        )}
      </div>
    </form>
  );
}
