import { useCallback, useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { Icon } from './Icon';

export interface LightboxItem {
  src: string;
  alt: string;
  label: string;
}

interface Props {
  items: LightboxItem[];
  children: ReactNode;
}

/**
 * Envolve a grade de miniaturas (renderizada pelo Astro) e abre a foto
 * ampliada em um <dialog> acessível: Esc fecha, setas navegam, deslizar no celular.
 */
export default function Lightbox({ items, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const [index, setIndex] = useState(0);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + items.length) % items.length), [items.length]);

  function onGridClick(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-lightbox-index]');
    if (!button) return;
    opener.current = button;
    setIndex(Number(button.dataset.lightboxIndex));
    dialog.current?.showModal();
    document.documentElement.classList.add('no-scroll');
  }

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => {
      document.documentElement.classList.remove('no-scroll');
      opener.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    el.addEventListener('close', onClose);
    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('close', onClose);
      el.removeEventListener('keydown', onKey);
    };
  }, [go]);

  const item = items[index];
  const many = items.length > 1;

  return (
    <div onClick={onGridClick}>
      {children}
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Foto ampliada"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const delta = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {item && (
          <figure className="lightbox__figure">
            <img src={item.src} alt={item.alt} className="lightbox__img" />
            <figcaption>
              <span>
                {item.label} — {item.alt}
              </span>
              {many && (
                <span className="lightbox__count" data-lightbox-count>
                  {index + 1} de {items.length}
                </span>
              )}
            </figcaption>
          </figure>
        )}
        <button type="button" className="lightbox__btn lightbox__close" onClick={() => dialog.current?.close()} aria-label="Fechar">
          <Icon name="close" size={24} />
        </button>
        {many && (
          <>
            <button type="button" className="lightbox__btn lightbox__prev" onClick={() => go(-1)} aria-label="Foto anterior">
              <Icon name="chevronLeft" size={28} />
            </button>
            <button type="button" className="lightbox__btn lightbox__next" onClick={() => go(1)} aria-label="Próxima foto">
              <Icon name="chevronRight" size={28} />
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}
