/**
 * Gera favicons PNG e a imagem de compartilhamento (Open Graph) a partir da
 * marca provisória. Execute novamente após receber o logotipo oficial:
 *   node scripts/generate-brand-assets.mjs
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const pub = new URL('../public/', import.meta.url);
const favicon = await readFile(new URL('favicon.svg', pub));

await sharp(favicon, { density: 300 }).resize(32, 32).png().toFile(new URL('favicon-32.png', pub).pathname);
await sharp(favicon, { density: 600 }).resize(192, 192).png().toFile(new URL('icon-192.png', pub).pathname);
await sharp(favicon, { density: 900 }).resize(512, 512).png().toFile(new URL('icon-512.png', pub).pathname);
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#0f2340' } })
  .composite([{ input: await sharp(favicon, { density: 600 }).resize(150, 150).png().toBuffer(), gravity: 'center' }])
  .png()
  .toFile(new URL('apple-touch-icon.png', pub).pathname);

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="0.85" cy="0.2" r="0.6">
      <stop offset="0" stop-color="#d6ae66" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#d6ae66" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0f2340"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(90 90) scale(2.2)">
    <rect x="1" y="1" width="38" height="38" rx="10" fill="#fbf8f3"/>
    <path d="M11 13h18M20 13v15" stroke="#0f2340" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M14 30h12" stroke="#0f2340" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
  </g>
  <text x="200" y="145" font-family="DejaVu Serif, Liberation Serif, serif" font-size="40" fill="#ffffff" font-weight="bold">Hotel Triunfo</text>
  <text x="202" y="180" font-family="DejaVu Sans, Liberation Sans, sans-serif" font-size="20" letter-spacing="6" fill="#e4c78f">LONDRINA</text>
  <text x="90" y="340" font-family="DejaVu Serif, Liberation Serif, serif" font-size="58" fill="#ffffff">Hotel econômico em Londrina,</text>
  <text x="90" y="412" font-family="DejaVu Serif, Liberation Serif, serif" font-size="58" fill="#ffffff">com localização privilegiada.</text>
  <text x="90" y="500" font-family="DejaVu Sans, Liberation Sans, sans-serif" font-size="26" fill="#f5efe5" opacity="0.85">Há mais de 60 anos no centro · Estacionamento · Wi-Fi · Café da manhã · 24h</text>
  <rect x="90" y="540" width="80" height="4" fill="#d6ae66"/>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 86, mozjpeg: true }).toFile(new URL('og-image.jpg', pub).pathname);

console.log('Ícones e imagem Open Graph gerados em public/.');
