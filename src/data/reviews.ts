export interface Review {
  author: string;
  /** Nota original de 1 a 5 — não altere. */
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** Data original (AAAA-MM-DD), quando disponível. */
  date?: string;
}

/**
 * Avaliações históricas fornecidas pelo hotel, publicadas entre 2018 e 2019.
 * A data exata de cada avaliação não foi informada.
 */
export const reviewsPeriod = '2018 e 2019';

export const reviews: Review[] = [
  {
    author: 'Edenilson Fernandes Junior',
    rating: 5,
    text: 'Hotel barato muito bom. Wi-Fi em todos os quartos, café da manhã. Ótimo lugar pra quem vem a Londrina a trabalho.',
  },
  {
    author: 'Marcio Olmarcio',
    rating: 5,
    text: 'Custo benefício.',
  },
  {
    author: 'Rodrigo Arroio',
    rating: 4,
    text: 'Um ótimo lugar para quem não pode gastar muito ou precisa ficar vários dias trabalhando na cidade de Londrina. O hotel é bem simples, o banheiro é compartilhado e também não tem área para fumantes. Mas o atendimento e o café da manhã compensam.',
  },
  {
    author: 'Marina Gabriela Pereira',
    rating: 5,
    text: 'Estive no hotel a trabalho. Ótimo ambiente e atendimento.',
  },
  {
    author: 'Kevin Marano',
    rating: 4,
    text: 'Simples, bom e barato. Não dispõe de nenhum luxo, porém é a opção perfeita para quem quer economizar, mas sem abrir mão de um lugar agradável.',
  },
];
