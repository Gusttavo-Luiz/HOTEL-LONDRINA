import type { ImageMetadata } from 'astro';

/** Todas as imagens presentes em src/assets/fotos, indexadas pelo nome do arquivo. */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/fotos/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const byName = new Map<string, ImageMetadata>(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.toLowerCase(), mod.default]),
);

/** Retorna a imagem oficial, ou `undefined` se o arquivo ainda não foi enviado. */
export function getPhoto(file: string): ImageMetadata | undefined {
  return byName.get(file.toLowerCase());
}
