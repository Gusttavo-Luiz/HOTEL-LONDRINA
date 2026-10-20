# Hotel Triunfo — site oficial

Site institucional e de reservas do **Hotel Triunfo** (Rua Professor João
Cândido, 39 – Centro, Londrina - PR).

- **Páginas públicas** pré-renderizadas em HTML estático (rápidas e boas para SEO).
- **Componentes interativos** em React + TypeScript (consulta de hospedagem,
  formulário de solicitação, galeria, mapa).
- **Servidor Node** com API real de solicitações (SQLite nativo do Node),
  aviso por e-mail via SMTP e **painel da recepção** protegido por senha.

## Demonstração online (GitHub Pages)

Cada atualização da branch `main` publica automaticamente uma **versão de
demonstração estática** em <https://gusttavo-luiz.github.io/HOTEL-LONDRINA/>
(workflow `.github/workflows/pages.yml`).

- Não há servidor no GitHub Pages: o formulário valida os dados e avisa que
  **nada foi enviado** (modo `PUBLIC_DEMO_MODE`). O painel `/admin` não existe lá.
- A demonstração exibe uma faixa "Versão de demonstração" e não é indexada
  pelo Google (`noindex` + `robots.txt` bloqueando tudo).
- Configuração única no GitHub: **Settings → Pages → Build and deployment →
  Source: GitHub Actions**.
- Build local da demonstração: `DEPLOY_TARGET=pages PUBLIC_DEMO_MODE=true npm run build`
  (saída em `dist/client`).

## Requisitos e comandos

Node.js **22.12+**.

| Comando | Ação |
| --- | --- |
| `npm install` | Instala as dependências |
| `npm run dev` | Desenvolvimento em `http://localhost:4321` (mostra dados provisórios e "Foto pendente") |
| `npm run build` | Verifica tipos e gera o build em `dist/` |
| `npm start` | Inicia o servidor de produção (`HOST`/`PORT` opcionais) |
| `npm test` | Build + testes Playwright (desktop, tablet e celular) |

Para os testes: `npx playwright install chromium` (uma vez), ou aponte
`PW_CHROMIUM_PATH` para um Chromium já instalado.

## Configuração (variáveis de ambiente)

Copie `.env.example` para `.env` e preencha. **Nunca versione o `.env`.**

| Variável | Para quê |
| --- | --- |
| `ADMIN_USER`, `ADMIN_PASSWORD` | Ativam o painel `/admin` (senha com 12+ caracteres). Sem elas, o painel fica desativado (404). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO` | Envio de e-mail para a recepção a cada nova solicitação. Opcional: sem SMTP, as solicitações ficam no painel. |
| `DATA_DIR` | Pasta do banco SQLite (padrão `./data`). Faça backup dela. |
| `DATA_RETENTION_DAYS` | Exclusão automática de solicitações antigas (padrão 180 dias, LGPD). |
| `TRUST_PROXY` | `true` atrás de Nginx/Cloudflare (usa `X-Forwarded-For`/`Host`). |
| `RATE_LIMIT_MAX` | Envios por IP a cada 10 min (padrão 5). |
| `PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp **confirmado** (só dígitos, ex.: `5543…`). Vazio = botões de WhatsApp ocultos. |
| `PUBLIC_BOOKING_ENGINE_URL` | Motor de reservas oficial, se existir. Ex.: `https://…?checkin={checkin}&checkout={checkout}&adults={adults}&children={children}` |
| `PUBLIC_SHOW_PLACEHOLDERS` | `true` para exibir conteúdo provisório num build (homologação). |

As variáveis `PUBLIC_*` são embutidas no HTML durante o build; as demais são
lidas pelo servidor em tempo de execução.

## Onde editar o conteúdo

| Arquivo | Conteúdo |
| --- | --- |
| `src/config/hotel.ts` | Nome, telefone, endereço, diária de referência, nota/total do Google, links |
| `src/content/amenities.ts` | Comodidades confirmadas e destaques do topo |
| `src/content/rooms.ts` | Acomodações (só `status: 'confirmado'` vai ao ar) |
| `src/content/gallery.ts` | Fotos da galeria e de destaque |
| `src/assets/fotos/` | Arquivos das fotos oficiais (veja o README da pasta) |
| `src/content/location.ts` | Pontos de interesse |
| `src/content/faq.ts` | Perguntas frequentes (também geram dados estruturados) |
| `src/components/Logo.astro` | Marca provisória — trocar pelo logotipo oficial |
| `src/styles/global.css` | Paleta, tipografia e estilos base |

## Como funciona a reserva

1. O visitante informa datas e hóspedes em **"Consultar sua hospedagem"**.
2. Se `PUBLIC_BOOKING_ENGINE_URL` estiver configurado, é redirecionado ao
   motor oficial com os dados preenchidos.
3. Caso contrário, os dados vão para o **formulário de solicitação**; ao enviar,
   a API valida no servidor, grava no banco e (se configurado) envia e-mail.
   O visitante recebe o número da solicitação e o aviso de que **a reserva só
   é confirmada após o retorno da recepção**. Não há disponibilidade simulada.

A mensagem de sucesso só aparece quando o servidor confirma a gravação
(HTTP 201). Falhas mostram erro e o telefone da recepção.

## Segurança

- Validação no navegador **e** no servidor (`src/lib/validation.ts`).
- Antispam: campo invisível, tempo mínimo de preenchimento e limite por IP.
- API aceita somente JSON do próprio site (verificação de `Origin`), limite de 16 KB.
- Painel com HTTP Basic + comparação em tempo constante, limite de tentativas,
  `no-store`, `noindex` e proteção CSRF de formulários (`checkOrigin`).
- Content-Security-Policy com hashes gerada pelo Astro; sem cookies de rastreamento.
- Nenhuma credencial no frontend. Detalhes de implantação (HTTPS, compressão,
  backup) em [`docs/IMPLANTACAO.md`](docs/IMPLANTACAO.md).

## Pendências que dependem do hotel

Veja [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md).
