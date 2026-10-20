// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

// DEPLOY_TARGET=pages gera a demonstração estática para o GitHub Pages.
const githubPages = process.env.DEPLOY_TARGET === 'pages';

export default defineConfig({
  site: githubPages ? 'https://gusttavo-luiz.github.io' : 'https://www.hoteltriunfolondrina.com.br',
  base: githubPages ? '/HOTEL-LONDRINA' : undefined,
  // Páginas públicas são pré-renderizadas (HTML estático, ótimo para SEO).
  // API de solicitações e painel administrativo rodam no servidor Node.
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  trailingSlash: 'ignore',
  // CSS embutido no HTML: evita requisições que bloqueiam a renderização.
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  // Fontes sempre como arquivos (sem data: URI), compatível com a CSP font-src 'self'.
  vite: { build: { assetsInlineLimit: 0 } },
  security: {
    checkOrigin: true,
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        'frame-src https://www.google.com https://maps.google.com',
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
    },
  },
  env: {
    schema: {
      // Públicas (embutidas no build)
      PUBLIC_WHATSAPP_NUMBER: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_BOOKING_ENGINE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_SHOW_PLACEHOLDERS: envField.boolean({ context: 'client', access: 'public', optional: true }),
      PUBLIC_DEMO_MODE: envField.boolean({ context: 'client', access: 'public', optional: true }),
      // Privadas (somente servidor)
      DATA_DIR: envField.string({ context: 'server', access: 'secret', optional: true }),
      DATA_RETENTION_DAYS: envField.number({ context: 'server', access: 'secret', optional: true }),
      TRUST_PROXY: envField.boolean({ context: 'server', access: 'secret', optional: true }),
      RATE_LIMIT_MAX: envField.number({ context: 'server', access: 'secret', optional: true }),
      ADMIN_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_HOST: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_PORT: envField.number({ context: 'server', access: 'secret', optional: true }),
      SMTP_SECURE: envField.boolean({ context: 'server', access: 'secret', optional: true }),
      SMTP_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      SMTP_PASS: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
