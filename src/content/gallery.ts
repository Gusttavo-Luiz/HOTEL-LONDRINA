/**
 * Fotos oficiais. Salve os arquivos em `src/assets/fotos/` com o nome
 * indicado; o build gera versões AVIF/WebP otimizadas. Arquivos ausentes
 * aparecem como "Foto pendente" apenas no ambiente de desenvolvimento.
 */
export const featuredPhotos = {
  hero: { file: 'hero.jpg', alt: 'Fachada do Hotel Triunfo, no centro de Londrina' },
  about: { file: 'sobre-01.jpg', alt: 'Recepção do Hotel Triunfo' },
  aboutSecondary: { file: 'sobre-02.jpg', alt: 'Área comum do Hotel Triunfo' },
} as const;

export const galleryPhotos: { file: string; alt: string; label: string }[] = [
  { file: 'fachada-01.jpg', alt: 'Fachada do Hotel Triunfo na Rua Professor João Cândido', label: 'Fachada' },
  { file: 'recepcao-01.jpg', alt: 'Recepção do Hotel Triunfo', label: 'Recepção' },
  { file: 'quarto-01.jpg', alt: 'Quarto do Hotel Triunfo', label: 'Quartos' },
  { file: 'quarto-02.jpg', alt: 'Quarto do Hotel Triunfo', label: 'Quartos' },
  { file: 'cafe-01.jpg', alt: 'Café da manhã do Hotel Triunfo', label: 'Café da manhã' },
  { file: 'areas-comuns-01.jpg', alt: 'Área comum do Hotel Triunfo', label: 'Áreas comuns' },
  { file: 'garagem-01.jpg', alt: 'Garagem do Hotel Triunfo', label: 'Garagem' },
];
