import type { IconName } from '../components/icons';

export type BathroomType = 'privativo' | 'compartilhado';

export interface RoomCategory {
  /** Identificador único, sem espaços (usado no formulário de reserva). */
  id: string;
  /** Nome oficial da categoria, como usado pelo hotel. */
  name: string;
  description: string;
  /** Capacidade máxima de hóspedes. */
  maxGuests: number;
  /** Ex.: "1 cama de casal" ou "2 camas de solteiro". */
  beds: string;
  bathroom: BathroomType;
  /** Comodidades confirmadas desta categoria. */
  amenities: string[];
  /** Observações relevantes (ex.: "Sem elevador — quartos no 1º andar"). */
  notes?: string[];
  /**
   * Nomes de arquivos em `src/assets/fotos/` (ex.: "quarto-duplo-01.jpg").
   * Arquivos ausentes aparecem como "Foto pendente".
   */
  photos: { file: string; alt: string }[];
}

/**
 * Categorias de acomodação.
 *
 * ⚠️ Lista vazia de propósito: nomes, capacidades, camas e tipo de banheiro
 * ainda precisam ser confirmados pelo hotel. Enquanto estiver vazia, o site
 * exibe as informações gerais confirmadas e convida o visitante a consultar
 * a equipe. Modelo de cadastro:
 *
 * {
 *   id: 'duplo-compartilhado',
 *   name: 'Nome oficial da categoria',
 *   description: 'Descrição breve e verdadeira do quarto.',
 *   maxGuests: 2,
 *   beds: '1 cama de casal',
 *   bathroom: 'compartilhado',
 *   amenities: ['Wi-Fi', 'Ventilador'],
 *   notes: ['Banheiro compartilhado no mesmo andar'],
 *   photos: [{ file: 'quarto-duplo-01.jpg', alt: 'Quarto com cama de casal' }],
 * }
 */
export const rooms: RoomCategory[] = [];

/** Itens confirmados válidos para toda a hospedagem. */
export const stayIncludes: { icon: IconName; label: string }[] = [
  { icon: 'wifi', label: 'Wi-Fi nos quartos' },
  { icon: 'coffee', label: 'Café da manhã diário' },
  { icon: 'parking', label: 'Estacionamento próprio' },
  { icon: 'clock', label: 'Recepção 24 horas' },
  { icon: 'sparkles', label: 'Equipe de limpeza' },
];
