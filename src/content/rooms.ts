/**
 * Acomodações.
 *
 * Somente categorias com `status: 'confirmado'` são publicadas em produção.
 * Itens `provisorio` aparecem apenas no ambiente de desenvolvimento, com o
 * selo "Dados provisórios", para validar o layout.
 *
 * Para publicar: preencha os dados oficiais (nome, capacidade, comodidades,
 * tarifa) informados pelo hotel e mude o status para 'confirmado'.
 */
export interface Room {
  id: string;
  status: 'confirmado' | 'provisorio';
  name: string;
  description: string;
  /** Capacidade máxima de hóspedes. */
  capacity: number;
  /** Comodidades confirmadas desta categoria. */
  amenities: string[];
  /** Tarifa a partir de (R$). Omitir para exibir "Consulte tarifas". */
  priceFrom?: number;
  /** Arquivos em src/assets/fotos/. */
  photos: { file: string; alt: string }[];
}

/** Comodidades confirmadas para os quartos em geral. */
export const roomBaseAmenities = ['TV', 'Escrivaninha', 'Roupa de cama', 'Toalhas', 'Wi-Fi gratuito'];

export const rooms: Room[] = [
  {
    id: 'provisorio-individual',
    status: 'provisorio',
    name: '[PROVISÓRIO] Quarto Individual',
    description: 'Texto de exemplo para validação do layout. Substituir pela descrição oficial do hotel.',
    capacity: 1,
    amenities: roomBaseAmenities,
    photos: [{ file: 'quarto-individual-01.jpg', alt: 'Quarto individual do Hotel Triunfo' }],
  },
  {
    id: 'provisorio-duplo',
    status: 'provisorio',
    name: '[PROVISÓRIO] Quarto Duplo',
    description: 'Texto de exemplo para validação do layout. Substituir pela descrição oficial do hotel.',
    capacity: 2,
    amenities: roomBaseAmenities,
    photos: [{ file: 'quarto-duplo-01.jpg', alt: 'Quarto duplo do Hotel Triunfo' }],
  },
  {
    id: 'provisorio-triplo',
    status: 'provisorio',
    name: '[PROVISÓRIO] Quarto Triplo',
    description: 'Texto de exemplo para validação do layout. Substituir pela descrição oficial do hotel.',
    capacity: 3,
    amenities: roomBaseAmenities,
    photos: [{ file: 'quarto-triplo-01.jpg', alt: 'Quarto triplo do Hotel Triunfo' }],
  },
];
