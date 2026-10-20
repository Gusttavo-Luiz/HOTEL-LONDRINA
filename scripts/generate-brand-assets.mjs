/**
 * Gera favicons PNG e a imagem Open Graph a partir da marca provisória.
 * Rode novamente ao receber o logotipo oficial:  node scripts/generate-brand-assets.mjs
 * (Ideal: substituir public/og-image.jpg por uma foto real do hotel em 1200×630.)
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const pub = (f) => new URL(`../public/${f}`, import.meta.url).pathname;
const icon = await readFile(pub('favicon.svg'));

await sharp(icon, { density: 300 }).resize(32, 32).png().toFile(pub('favicon-32.png'));
await sharp(icon, { density: 600 }).resize(180, 180).png().toFile(pub('apple-touch-icon.png'));
await sharp(icon, { density: 600 }).resize(192, 192).png().toFile(pub('icon-192.png'));
await sharp(icon, { density: 900 }).resize(512, 512).png().toFile(pub('icon-512.png'));

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#11264a"/>
  <rect x="0" y="600" width="1200" height="30" fill="#cfa95f"/>
  <g transform="translate(90 86)" fill="none" stroke-linecap="round">
    <circle cx="44" cy="44" r="41" stroke="#fff" stroke-width="3"/>
    <path d="M26 31h36M44 31v31" stroke="#fff" stroke-width="5"/>
    <path d="M34 62h20" stroke="#cfa95f" stroke-width="3"/>
  </g>
  <text x="206" y="128" font-family="DejaVu Serif, serif" font-size="44" font-weight="bold" fill="#fff">Hotel Triunfo</text>
  <text x="208" y="166" font-family="DejaVu Sans, sans-serif" font-size="20" letter-spacing="5" fill="#e2c690">LONDRINA · PR</text>
  <text x="90" y="330" font-family="DejaVu Serif, serif" font-size="56" fill="#fff">Hotel econômico no centro</text>
  <text x="90" y="400" font-family="DejaVu Serif, serif" font-size="56" fill="#fff">de Londrina.</text>
  <text x="90" y="490" font-family="DejaVu Sans, sans-serif" font-size="26" fill="#f4eee4">Café da manhã incluso · Wi-Fi e estacionamento gratuitos · Recepção 24h</text>
  <text x="90" y="540" font-family="DejaVu Sans, sans-serif" font-size="24" fill="#e2c690">(43) 3323-5054</text>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 86, mozjpeg: true }).toFile(pub('og-image.jpg'));
console.log('Ícones e og-image.jpg gerados em public/.');
