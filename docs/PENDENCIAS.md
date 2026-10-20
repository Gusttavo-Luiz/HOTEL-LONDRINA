# Pendências que dependem do hotel

## Informações a confirmar
- [ ] **Tipos de quarto**: nomes oficiais, capacidade, comodidades e tarifas
      (`src/content/rooms.ts` — hoje só há exemplos provisórios, que não vão ao ar).
- [ ] **WhatsApp**: número habilitado para atendimento (`PUBLIC_WHATSAPP_NUMBER`).
- [ ] **Motor de reservas** (Booking.com, Omnibees, HBook…): link oficial, se houver.
- [ ] **E-mail da recepção** e dados SMTP para receber as solicitações.
- [ ] **Regras para pets** e **condições do estacionamento** (textos citam "a confirmar").
- [ ] **Política de cancelamento/alteração**, para detalhar a resposta da FAQ.
- [ ] Distâncias dos pontos de interesse (só o aeroporto, ~3 km, foi informado).
- [ ] **Redes sociais oficiais** (`hotel.social` em `src/config/hotel.ts`).
- [ ] Atualizar periodicamente a nota e o total de avaliações do Google
      (`googleRating` em `src/config/hotel.ts`).
- [ ] Dados do controlador para a Política de Privacidade (razão social/CNPJ), se desejado.

## Imagens a fornecer (somente fotos reais)
- [ ] Logotipo oficial (SVG ou PNG em alta resolução).
- [ ] `hero.jpg` — fachada ou acomodação (foto principal).
- [ ] `sobre-01.jpg` (recepção) e `sobre-02.jpg` (área comum).
- [ ] Galeria: `fachada-01.jpg`, `recepcao-01.jpg`, `quarto-01.jpg`, `quarto-02.jpg`,
      `cafe-01.jpg`, `areas-comuns-01.jpg`, `garagem-01.jpg`.
- [ ] Uma foto por tipo de quarto (nomes em `src/content/rooms.ts`).
- [ ] Imagem de compartilhamento 1200×630 para substituir `public/og-image.jpg`.

## Integrações opcionais
- Avaliações em tempo real via **Google Places API**: exige chave de API
  restrita e aprovação; deve rodar no servidor (nunca expor a chave no navegador).
