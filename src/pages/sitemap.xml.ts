import type { APIRoute } from 'astro';

/** Páginas indexáveis do site. Inclua aqui novas páginas públicas. */
const pages = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/politica-de-privacidade/', changefreq: 'yearly', priority: '0.3' },
];

export const GET: APIRoute = ({ site }) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map(
      (page) =>
        `  <url>\n    <loc>${new URL(page.path, site).href}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
