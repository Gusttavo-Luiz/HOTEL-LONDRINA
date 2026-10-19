# Hotel Triunfo Londrina — site oficial

Site institucional e de solicitação de reservas do **Hotel Triunfo Londrina**
(Rua Professor João Cândido, 39 – Centro, Londrina - PR).

Construído com [Astro](https://astro.build) e gerado como **site estático**
(HTML + CSS + pouco JavaScript), o que garante carregamento rápido, bom SEO e
hospedagem simples (Netlify, Vercel, Cloudflare Pages, GitHub Pages ou
qualquer servidor web).

## Comandos

| Comando           | Ação                                                          |
| ----------------- | ------------------------------------------------------------- |
| `npm install`     | Instala as dependências (Node 22.12+)                         |
| `npm run dev`     | Servidor de desenvolvimento em `http://localhost:4321`        |
| `npm run build`   | Verifica tipos e gera o site em `dist/`                       |
| `npm run preview` | Visualiza o build de produção                                 |
| `npm test`        | Build + testes de ponta a ponta (Playwright, desktop e celular) |

Para os testes: `npx playwright install chromium` (uma vez). Se já houver um
Chromium instalado, aponte `PW_CHROMIUM_PATH` para o executável.

## Onde atualizar cada informação

Todo o conteúdo editável está centralizado — não é preciso mexer nos componentes.

| Arquivo                     | Conteúdo                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| `src/config/site.ts`        | Telefones, WhatsApp, endereço, links (mapa, avaliações, motor de reservas, redes sociais), endpoint do formulário |
| `src/data/rooms.ts`         | Categorias de acomodação (vazio até o hotel confirmar os dados)          |
| `src/data/photos.ts`        | Galeria por categoria e fotos de destaque                                |
| `src/assets/fotos/`         | Arquivos das fotos oficiais (veja o README da pasta)                     |
| `src/data/reviews.ts`       | Depoimentos de hóspedes                                                  |
| `src/data/highlights.ts`    | Diferenciais (hero e cards)                                              |
| `src/data/faq.ts`           | Perguntas frequentes (também geram dados estruturados FAQPage)           |
| `src/data/navigation.ts`    | Itens do menu                                                            |
| `src/components/Logo.astro` | Marca provisória — substituir pelo logotipo oficial                      |
| `src/styles/global.css`     | Paleta, tipografia e estilos base                                        |

### Fotos

Salve as fotos reais em `src/assets/fotos/` com os nomes listados em
`src/assets/fotos/README.md`. O build gera AVIF/WebP em vários tamanhos
automaticamente. Enquanto uma foto não existir, o espaço aparece como
**"Foto pendente"**; para ocultar esses espaços, defina
`showPhotoPlaceholders: false` em `src/config/site.ts`.

### Acomodações

Cadastre cada categoria em `src/data/rooms.ts` seguindo o modelo comentado no
arquivo (nome, descrição, capacidade, camas, tipo de banheiro, comodidades,
observações e fotos). Ao cadastrar a primeira, a seção passa a exibir os cards
e o formulário de reserva ganha o campo "Acomodação de preferência".

## Fluxo de reservas

- **Não existe disponibilidade simulada.** O formulário valida as datas e os
  dados e monta uma mensagem pronta para o **WhatsApp oficial** da recepção. A
  reserva só é confirmada pela equipe.
- Quando o hotel tiver um **motor de reservas** (Omnibees, HBook, Cloudbeds…),
  preencha `links.bookingEngine` em `src/config/site.ts`: o botão
  "Fazer reserva online" passa a abrir o sistema oficial.

## Formulário de contato

Sem backend configurado, a mensagem é encaminhada ao WhatsApp oficial. Para
receber por e-mail/servidor, informe um endpoint HTTPS em
`forms.contactEndpoint` (recebe `POST` JSON com `name`, `email`, `phone`,
`message`). O formulário mostra estado de envio, sucesso e erro com
alternativa pelo WhatsApp. Nunca coloque chaves privadas nesse arquivo — ele é
público.

## SEO

- Títulos e descrições por página, URL canônica, Open Graph e Twitter Card.
- Dados estruturados `Hotel`, `WebSite` e `FAQPage` (somente dados confirmados).
- `sitemap.xml` e `robots.txt` gerados no build (`src/pages/`).
- Ícones e imagem de compartilhamento: `node scripts/generate-brand-assets.mjs`
  (rode de novo ao receber o logotipo oficial ou troque `public/og-image.jpg`
  por uma foto real do hotel em 1200×630).
