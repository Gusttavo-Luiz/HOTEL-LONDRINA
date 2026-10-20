import { PUBLIC_SHOW_PLACEHOLDERS } from 'astro:env/client';

/**
 * Exibe conteúdo provisório (molduras "Foto pendente" e acomodações não
 * confirmadas). Ativo em `npm run dev`; em produção, apenas se
 * PUBLIC_SHOW_PLACEHOLDERS=true.
 */
export const showProvisional = import.meta.env.DEV || PUBLIC_SHOW_PLACEHOLDERS === true;
