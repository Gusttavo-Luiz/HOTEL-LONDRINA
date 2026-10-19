/**
 * Dados oficiais do Hotel Triunfo Londrina.
 *
 * Este é o ponto central para atualizar contatos, endereço e integrações.
 * Use somente informações confirmadas pelo hotel — elas também alimentam
 * os dados estruturados (schema.org) lidos pelos buscadores.
 */

export const site = {
  name: 'Hotel Triunfo Londrina',
  shortName: 'Hotel Triunfo',
  url: 'https://hoteltriunfolondrina.com.br',
  locale: 'pt_BR',
  description:
    'Hotel econômico no centro de Londrina, há mais de 60 anos recebendo hóspedes com acolhimento. Estacionamento próprio, Wi-Fi nos quartos, café da manhã e atendimento 24 horas.',
  yearsOfHistory: '60',

  contact: {
    phone: {
      display: '(43) 3323-5054',
      e164: '+554333235054',
    },
    whatsapp: {
      display: '(43) 9 98451-9027',
      e164: '+5543998451927',
      /** Número no formato aceito por https://wa.me/ (somente dígitos). */
      waNumber: '5543998451927',
    },
    /** Nenhum e-mail oficial foi informado. Preencha somente com um endereço confirmado. */
    email: null as string | null,
    hours: 'Atendimento 24 horas',
  },

  address: {
    street: 'Rua Professor João Cândido, 39',
    district: 'Centro',
    city: 'Londrina',
    state: 'PR',
    postalCode: '86010-000',
    country: 'BR',
  },

  links: {
    /**
     * Motor de reservas oficial (Omnibees, HBook, Cloudbeds etc.).
     * Enquanto for `null`, o botão "Fazer reserva online" leva ao formulário
     * de solicitação, que encaminha os dados à equipe pelo WhatsApp.
     */
    bookingEngine: null as string | null,
    /** Página onde estão as avaliações reais do hotel. */
    reviews:
      'https://www.google.com/maps/search/?api=1&query=Hotel+Triunfo+Rua+Professor+Jo%C3%A3o+C%C3%A2ndido+39+Londrina',
    maps:
      'https://www.google.com/maps/search/?api=1&query=Rua+Professor+Jo%C3%A3o+C%C3%A2ndido%2C+39+-+Centro%2C+Londrina+-+PR%2C+86010-000',
    mapsEmbed:
      'https://www.google.com/maps?q=Rua+Professor+Jo%C3%A3o+C%C3%A2ndido%2C+39+-+Centro%2C+Londrina+-+PR%2C+86010-000&output=embed',
    /** Perfis oficiais. Deixe `null` até receber os endereços corretos. */
    instagram: null as string | null,
    facebook: null as string | null,
  },

  forms: {
    /**
     * Endpoint HTTPS que recebe o formulário de contato via POST (JSON),
     * por exemplo um backend próprio ou serviço como Formspree.
     * Enquanto for `null`, a mensagem é encaminhada pelo WhatsApp oficial.
     * Nunca coloque chaves privadas aqui: este valor é público.
     */
    contactEndpoint: null as string | null,
  },

  /**
   * Exibe molduras identificadas ("Foto pendente") onde ainda não há fotografia
   * oficial. Defina como `false` para ocultar esses espaços em produção.
   */
  showPhotoPlaceholders: true,
} as const;

export const fullAddress = `${site.address.street} – ${site.address.district}, ${site.address.city} - ${site.address.state}, CEP ${site.address.postalCode}`;

export const whatsappUrl = (message?: string) =>
  `https://wa.me/${site.contact.whatsapp.waNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export const phoneHref = `tel:${site.contact.phone.e164}`;
export const mobileHref = `tel:${site.contact.whatsapp.e164}`;
