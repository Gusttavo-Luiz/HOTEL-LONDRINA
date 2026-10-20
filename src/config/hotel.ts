/**
 * Dados oficiais do Hotel Triunfo.
 * Altere somente com informações confirmadas pelo hotel — elas também
 * alimentam os dados estruturados (schema.org) lidos pelo Google.
 */
import { PUBLIC_WHATSAPP_NUMBER } from 'astro:env/client';

export const hotel = {
  name: 'Hotel Triunfo',
  /** Nome comercial, igual ao perfil do Google. */
  tradeName: 'Triunfo | Hotel barato em Londrina',
  url: 'https://www.hoteltriunfolondrina.com.br',
  category: 'Hotel econômico tradicional',
  stars: 2,

  phone: { display: '(43) 3323-5054', e164: '+554333235054' },

  address: {
    street: 'Rua Professor João Cândido, 39',
    district: 'Centro',
    city: 'Londrina',
    state: 'PR',
    postalCode: '86010-000',
    country: 'BR',
  },

  /** Diária de referência informada pelo hotel. */
  referenceRate: {
    amount: 145,
    note: 'Valor de referência, sujeito a disponibilidade, data e tipo de acomodação.',
  },

  /** Reputação no Google — atualize quando os números mudarem. */
  googleRating: {
    value: 3.9,
    count: 546,
    updatedAt: '2026-10',
  },

  links: {
    googleReviews: 'https://www.google.com/maps/search/?api=1&query=Hotel+Triunfo+Rua+Professor+Jo%C3%A3o+C%C3%A2ndido+39+Londrina',
    directions:
      'https://www.google.com/maps/dir/?api=1&destination=Rua+Professor+Jo%C3%A3o+C%C3%A2ndido%2C+39+-+Centro%2C+Londrina+-+PR%2C+86010-000',
    mapEmbed:
      'https://www.google.com/maps?q=Rua+Professor+Jo%C3%A3o+C%C3%A2ndido%2C+39+-+Centro%2C+Londrina+-+PR%2C+86010-000&output=embed',
  },

  /** Canais oficiais confirmados. Preencha somente com perfis verificados. */
  social: [] as { label: string; url: string }[],
} as const;

export const fullAddress = `${hotel.address.street} – ${hotel.address.district}, ${hotel.address.city} - ${hotel.address.state}, CEP ${hotel.address.postalCode}`;

export const phoneHref = `tel:${hotel.phone.e164}`;

/** Número de WhatsApp habilitado (via PUBLIC_WHATSAPP_NUMBER), ou `null`. */
export const whatsappNumber = (PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '') || null;

export function whatsappUrl(message?: string): string | null {
  if (!whatsappNumber) return null;
  return `https://wa.me/${whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
