import type { APIRoute } from 'astro';
import { withBase } from '../lib/url';
import { demoMode } from '../config/flags';

export const GET: APIRoute = ({ site }) =>
  new Response(
    demoMode
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${new URL(withBase('/sitemap.xml'), site).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
