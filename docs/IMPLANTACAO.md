# Implantação

O site precisa de um servidor com **Node.js 22.12+** (VPS, Render, Railway,
Fly.io etc.). Hospedagem apenas estática não atende: o formulário depende da
API e do banco.

## Passo a passo (VPS)

```bash
git clone <repo> && cd HOTEL-LONDRINA
npm ci
cp .env.example .env   # preencha os valores reais
npm run build
HOST=127.0.0.1 PORT=4321 node --env-file=.env dist/server/entry.mjs
```

Mantenha o processo ativo com `systemd` ou `pm2` e faça **backup diário da
pasta `DATA_DIR`** (contém as solicitações).

## HTTPS e compressão (Nginx)

O servidor Node não comprime respostas; deixe isso e o HTTPS com o proxy
reverso (ou Cloudflare). Exemplo:

```nginx
server {
  listen 443 ssl http2;
  server_name www.hoteltriunfolondrina.com.br;
  ssl_certificate     /etc/letsencrypt/live/www.hoteltriunfolondrina.com.br/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/www.hoteltriunfolondrina.com.br/privkey.pem;

  gzip on;
  gzip_types text/html text/css application/javascript application/json image/svg+xml application/xml;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  location /_astro/ {
    proxy_pass http://127.0.0.1:4321;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
  location / {
    proxy_pass http://127.0.0.1:4321;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto https;
  }
}

server {
  listen 80;
  server_name hoteltriunfolondrina.com.br www.hoteltriunfolondrina.com.br;
  return 301 https://www.hoteltriunfolondrina.com.br$request_uri;
}
```

Com proxy, defina `TRUST_PROXY=true`.

## Checklist após publicar

- [ ] `https://www.hoteltriunfolondrina.com.br` abre com cadeado (HTTPS).
- [ ] Enviar uma solicitação de teste e conferir no `/admin` e no e-mail.
- [ ] Excluir a solicitação de teste no painel.
- [ ] Enviar o `sitemap.xml` no Google Search Console.
- [ ] Conferir se nome, endereço e telefone estão iguais ao Perfil da Empresa no Google.
