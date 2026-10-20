import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/fotos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

const byName = new Map<string, ImageMetadata>(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.toLowerCase(), mod.default]),
);

/** Foto oficial pelo nome do arquivo, ou `undefined` se ainda não foi enviada. */
export function getPhoto(file: string): ImageMetadata | undefined {
  return byName.get(file.toLowerCase());
}
