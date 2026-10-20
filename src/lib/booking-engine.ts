import { PUBLIC_BOOKING_ENGINE_URL } from 'astro:env/client';

/**
 * Monta a URL do motor de reservas oficial, se configurado em
 * PUBLIC_BOOKING_ENGINE_URL (marcadores {checkin} {checkout} {adults} {children}).
 */
export function bookingEngineUrl(stay: { checkIn: string; checkOut: string; adults: number; children: number }): string | null {
  const template = PUBLIC_BOOKING_ENGINE_URL?.trim();
  if (!template || !/^https:\/\//.test(template)) return null;
  return template
    .replaceAll('{checkin}', encodeURIComponent(stay.checkIn))
    .replaceAll('{checkout}', encodeURIComponent(stay.checkOut))
    .replaceAll('{adults}', String(stay.adults))
    .replaceAll('{children}', String(stay.children));
}
