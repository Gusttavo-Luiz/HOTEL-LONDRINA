import type { IconName } from '../components/icons';

/**
 * Pontos de interesse informados pelo hotel. Inclua `distance` somente
 * quando a distância tiver sido informada/verificada.
 */
export const pointsOfInterest: { icon: IconName; name: string; distance?: string }[] = [
  { icon: 'plane', name: 'Aeroporto de Londrina', distance: 'aprox. 3 km' },
  { icon: 'store', name: 'Calçadão da Avenida Paraná' },
  { icon: 'landmark', name: 'Museu Histórico de Londrina Padre Carlos Weiss' },
  { icon: 'church', name: 'Catedral Metropolitana de Londrina' },
  { icon: 'trees', name: 'Praça Tomi Nakagawa' },
];
