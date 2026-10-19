/**
 * Galeria oficial do hotel.
 *
 * Para publicar uma foto, salve o arquivo em `src/assets/fotos/` com o nome
 * indicado em `file` (JPG, PNG ou WebP, de preferência com 1600 px ou mais
 * no lado maior). O build gera automaticamente versões AVIF/WebP otimizadas.
 * Enquanto o arquivo não existir, o espaço aparece como "Foto pendente".
 *
 * Nunca use fotos de banco de imagens como se fossem do Hotel Triunfo.
 */

export const galleryCategories = [
  { id: 'fachada', label: 'Fachada' },
  { id: 'recepcao', label: 'Recepção' },
  { id: 'quartos', label: 'Quartos' },
  { id: 'banheiros', label: 'Banheiros' },
  { id: 'cafe', label: 'Café da manhã' },
  { id: 'estacionamento', label: 'Estacionamento' },
  { id: 'areas-comuns', label: 'Áreas comuns' },
] as const;

export type GalleryCategory = (typeof galleryCategories)[number]['id'];

export interface GalleryPhoto {
  file: string;
  category: GalleryCategory;
  alt: string;
}

export const galleryPhotos: GalleryPhoto[] = [
  { file: 'fachada-01.jpg', category: 'fachada', alt: 'Fachada do Hotel Triunfo na Rua Professor João Cândido, no centro de Londrina' },
  { file: 'recepcao-01.jpg', category: 'recepcao', alt: 'Recepção do Hotel Triunfo' },
  { file: 'quarto-01.jpg', category: 'quartos', alt: 'Quarto do Hotel Triunfo' },
  { file: 'quarto-02.jpg', category: 'quartos', alt: 'Quarto do Hotel Triunfo' },
  { file: 'banheiro-01.jpg', category: 'banheiros', alt: 'Banheiro do Hotel Triunfo' },
  { file: 'cafe-01.jpg', category: 'cafe', alt: 'Café da manhã servido no Hotel Triunfo' },
  { file: 'estacionamento-01.jpg', category: 'estacionamento', alt: 'Estacionamento próprio do Hotel Triunfo' },
  { file: 'areas-comuns-01.jpg', category: 'areas-comuns', alt: 'Área comum do Hotel Triunfo' },
];

/** Fotos de destaque usadas fora da galeria. */
export const featuredPhotos = {
  hero: { file: 'hero.jpg', alt: 'Hotel Triunfo, no centro de Londrina' },
  about: { file: 'sobre.jpg', alt: 'Ambiente interno do Hotel Triunfo' },
} as const;
