import { useId, useState, type SyntheticEvent } from 'react';
import { addDaysISO, nights, todayISO, validateStay, LIMITS } from '../../lib/validation';
import { bookingEngineUrl } from '../../lib/booking-engine';
import { goToRequestForm, sendPrefill } from '../../lib/prefill';
import { Icon } from './Icon';
import './booking-widget.css';

type Errors = Partial<Record<'checkIn' | 'checkOut' | 'adults' | 'children', string>>;

export default function BookingWidget() {
  const uid = useId();
  const today = todayISO();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState(false);

  const n = checkIn && checkOut ? nights(checkIn, checkOut) : null;

  function onCheckIn(value: string) {
    setCheckIn(value);
    setErrors((e) => ({ ...e, checkIn: undefined, checkOut: undefined }));
    // Mantém a saída sempre depois da entrada.
    if (value && (!checkOut || checkOut <= value)) setCheckOut(addDaysISO(value, 1));
  }

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateStay({ checkIn, checkOut, adults, children }, today);
    setErrors(result.errors);
    if (Object.keys(result.errors).length) {
      const first = Object.keys(result.errors)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    const stay = { checkIn, checkOut, adults, children };
    const engine = bookingEngineUrl(stay);
    if (engine) {
      window.location.assign(engine);
      return;
    }
    sendPrefill({ subject: 'reserva', ...stay });
    setNotice(true);
    goToRequestForm();
  }

  const field = (key: keyof Errors) => ({
    id: `${uid}-${key}`,
    'aria-invalid': errors[key] ? (true as const) : undefined,
    'aria-describedby': errors[key] ? `${uid}-${key}-err` : undefined,
  });

  const error = (key: keyof Errors) =>
    errors[key] ? (
      <p className="field-error" id={`${uid}-${key}-err`}>
        {errors[key]}
      </p>
    ) : null;

  return (
    <form className="bw" onSubmit={submit} noValidate aria-label="Consultar hospedagem">
      <div className="bw__fields">
        <div className="field bw__date">
          <label htmlFor={`${uid}-checkIn`}>
            <Icon name="calendar" size={16} /> Entrada
          </label>
          <input
            className="input"
            type="date"
            min={today}
            max={addDaysISO(today, LIMITS.maxDaysAhead)}
            value={checkIn}
            onChange={(e) => onCheckIn(e.target.value)}
            required
            {...field('checkIn')}
          />
          {error('checkIn')}
        </div>
        <div className="field bw__date">
          <label htmlFor={`${uid}-checkOut`}>
            <Icon name="calendar" size={16} /> Saída
          </label>
          <input
            className="input"
            type="date"
            min={checkIn ? addDaysISO(checkIn, 1) : addDaysISO(today, 1)}
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setErrors((x) => ({ ...x, checkOut: undefined }));
            }}
            required
            {...field('checkOut')}
          />
          {error('checkOut')}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-adults`}>
            <Icon name="users" size={16} /> Adultos
          </label>
          <select className="input" value={adults} onChange={(e) => setAdults(Number(e.target.value))} {...field('adults')}>
            {Array.from({ length: LIMITS.maxAdults }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          {error('adults')}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-children`}>Crianças</label>
          <select className="input" value={children} onChange={(e) => setChildren(Number(e.target.value))} {...field('children')}>
            {Array.from({ length: LIMITS.maxChildren + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          {error('children')}
        </div>
        <button type="submit" className="btn btn--gold bw__submit">
          <Icon name="search" /> Buscar hospedagem
        </button>
      </div>
      <p className="bw__foot" aria-live="polite">
        {notice ? (
          <>
            <Icon name="check" size={16} /> Dados levados ao formulário abaixo. Complete seu nome e contato para enviar a solicitação.
          </>
        ) : n && n > 0 ? (
          <>
            <Icon name="info" size={16} /> {n} {n === 1 ? 'noite' : 'noites'} · a disponibilidade é confirmada pela recepção.
          </>
        ) : (
          <>
            <Icon name="info" size={16} /> Sem consulta automática: a recepção confirma disponibilidade e valores.
          </>
        )}
      </p>
    </form>
  );
}
