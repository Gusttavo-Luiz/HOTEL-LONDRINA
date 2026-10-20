/**
 * Prefixa caminhos internos com o `base` do site. No domínio oficial o base é
 * "/"; na demonstração do GitHub Pages é "/HOTEL-LONDRINA/".
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
