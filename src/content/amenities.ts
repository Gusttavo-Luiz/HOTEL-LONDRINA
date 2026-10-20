import type { IconName } from '../components/icons';

/** Comodidades confirmadas pelo hotel. Não inclua itens sem confirmação. */
export const amenities: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'coffee',
    title: 'Café da manhã incluso',
    text: 'Café da manhã incluso na diária, conforme as condições da reserva.',
  },
  {
    icon: 'parking',
    title: 'Estacionamento gratuito',
    text: 'Garagem própria e gratuita para hóspedes, sujeita às condições de utilização.',
  },
  {
    icon: 'wifi',
    title: 'Wi-Fi gratuito',
    text: 'Internet sem fio gratuita nos quartos e nas áreas públicas do hotel.',
  },
  {
    icon: 'paw',
    title: 'Aceita animais de estimação',
    text: 'Seu pet é bem-vindo. Consulte a recepção sobre as regras antes de reservar.',
  },
  {
    icon: 'clock',
    title: 'Recepção 24 horas',
    text: 'Equipe disponível a qualquer hora para check-in, informações e suporte.',
  },
  {
    icon: 'tv',
    title: 'Quartos equipados',
    text: 'TV, escrivaninha, roupa de cama e toalhas para uma estadia prática.',
  },
];

/** Destaques curtos exibidos na primeira dobra. */
export const heroHighlights: { icon: IconName; label: string }[] = [
  { icon: 'mapPin', label: 'Localização central' },
  { icon: 'coffee', label: 'Café da manhã incluso*' },
  { icon: 'wifi', label: 'Wi-Fi gratuito' },
  { icon: 'clock', label: 'Recepção 24 horas' },
];
