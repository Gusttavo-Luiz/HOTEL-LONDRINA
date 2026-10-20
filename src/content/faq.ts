import { hotel, fullAddress, formatBRL } from '../config/hotel';

/** Perguntas frequentes — respostas apenas com informações confirmadas. */
export const faq: { question: string; answer: string }[] = [
  {
    question: 'Qual é o endereço do Hotel Triunfo?',
    answer: `${fullAddress}, na região central de Londrina.`,
  },
  {
    question: 'Como faço uma reserva?',
    answer: `Informe as datas e o número de hóspedes no formulário de reserva deste site ou ligue para a recepção no ${hotel.phone.display}. A reserva é confirmada somente após o retorno da nossa equipe.`,
  },
  {
    question: 'O café da manhã está incluso?',
    answer: 'Sim. O café da manhã está incluso na diária, conforme as condições da reserva. Confirme com a recepção ao reservar.',
  },
  {
    question: 'O hotel possui estacionamento?',
    answer: 'Sim. O hotel possui garagem própria e gratuita para hóspedes, sujeita às condições de utilização. Consulte a recepção.',
  },
  {
    question: 'O hotel aceita animais de estimação?',
    answer: 'Sim, o hotel aceita animais de estimação. As regras de hospedagem para pets devem ser confirmadas com a recepção antes da reserva.',
  },
  {
    question: 'A recepção funciona 24 horas?',
    answer: 'Sim. A recepção atende 24 horas por dia.',
  },
  {
    question: 'Como consultar os preços das diárias?',
    answer: `A diária de referência é de ${formatBRL(hotel.referenceRate.amount)}, sujeita a disponibilidade, data e tipo de acomodação. Para o valor exato, envie uma solicitação pelo site ou ligue para ${hotel.phone.display}.`,
  },
  {
    question: 'Como cancelar ou alterar uma reserva?',
    answer: `As condições de cancelamento e alteração dependem da tarifa e do canal em que a reserva foi feita. Entre em contato com a recepção pelo ${hotel.phone.display} para verificar o seu caso.`,
  },
];
