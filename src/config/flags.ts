import { PUBLIC_DEMO_MODE, PUBLIC_SHOW_PLACEHOLDERS } from 'astro:env/client';

/**
 * Exibe conteúdo provisório (molduras "Foto pendente" e acomodações não
 * confirmadas). Ativo em `npm run dev`; em produção, apenas se
 * PUBLIC_SHOW_PLACEHOLDERS=true.
 */
export const showProvisional = import.meta.env.DEV || PUBLIC_SHOW_PLACEHOLDERS === true;

/**
 * Demonstração estática (GitHub Pages): não há servidor, então o formulário
 * só valida os dados e avisa que nada foi enviado. A página não é indexada.
 */
export const demoMode = PUBLIC_DEMO_MODE === true;
