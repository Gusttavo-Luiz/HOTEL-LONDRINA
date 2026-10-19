import type { IconName } from '../components/icons';

/** Linha de diferenciais exibida no topo (hero). */
export const quickHighlights: { icon: IconName; label: string }[] = [
  { icon: 'parking', label: 'Estacionamento próprio' },
  { icon: 'wifi', label: 'Wi-Fi nos quartos' },
  { icon: 'coffee', label: 'Café da manhã' },
  { icon: 'clock', label: 'Atendimento 24 horas' },
];

/** Cards da seção de diferenciais. Somente serviços confirmados pelo hotel. */
export const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'mapPin',
    title: 'Excelente localização',
    text: 'Estamos no centro de Londrina, próximos ao terminal de ônibus, à Catedral, a restaurantes, museus, farmácias, bancos e ao comércio local.',
  },
  {
    icon: 'parking',
    title: 'Estacionamento próprio',
    text: 'Viaje com mais praticidade. O Hotel Triunfo possui garagem própria para os hóspedes durante a estadia.',
  },
  {
    icon: 'coffee',
    title: 'Café da manhã',
    text: 'Comece o dia com uma opção de café da manhã variado, com pães, frutas, bolos, frios, biscoitos, sucos e outras opções.',
  },
  {
    icon: 'wallet',
    title: 'Economia',
    text: 'Uma alternativa de hospedagem para quem deseja controlar os gastos sem abrir mão de uma localização estratégica e de um atendimento acolhedor.',
  },
  {
    icon: 'handshake',
    title: 'Atendimento especial',
    text: 'Nossa equipe de recepção e limpeza está preparada para receber os hóspedes com respeito, atenção e disposição para ajudar.',
  },
];
