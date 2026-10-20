import { useState } from 'react';
import { Icon } from './Icon';

interface Props {
  src: string;
  title: string;
}

/**
 * O mapa do Google só é carregado após a autorização do visitante:
 * evita cookies de terceiros sem consentimento e economiza dados móveis.
 */
export default function MapEmbed({ src, title }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return <iframe className="map-embed__frame" src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />;
  }

  return (
    <div className="map-embed__consent">
      <Icon name="mapPin" size={34} />
      <p className="map-embed__title">Mapa interativo</p>
      <p>Ao carregar o mapa, o Google pode coletar dados de navegação conforme a política de privacidade dele.</p>
      <button type="button" className="btn btn--navy btn--sm" onClick={() => setLoaded(true)}>
        Carregar mapa
      </button>
    </div>
  );
}
