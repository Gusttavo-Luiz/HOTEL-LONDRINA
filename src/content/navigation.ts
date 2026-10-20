import { withBase } from '../lib/url';

export const navigation = [
  { label: 'Início', href: withBase('/#inicio') },
  { label: 'Sobre o Hotel', href: withBase('/#sobre') },
  { label: 'Acomodações', href: withBase('/#acomodacoes') },
  { label: 'Comodidades', href: withBase('/#comodidades') },
  { label: 'Localização', href: withBase('/#localizacao') },
  { label: 'Contato', href: withBase('/#contato') },
] as const;
