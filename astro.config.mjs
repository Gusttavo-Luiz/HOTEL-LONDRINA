// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Domínio oficial — usado em URLs canônicas, Open Graph e sitemap.
  site: 'https://hoteltriunfolondrina.com.br',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  image: {
    responsiveStyles: false,
  },
});
