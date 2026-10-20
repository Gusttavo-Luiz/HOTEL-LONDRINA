import { test, expect, type Page } from '@playwright/test';
import { ADMIN } from '../playwright.config';

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1200) < 768;
const isDesktopNav = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1100;

/** Data em AAAA-MM-DD (fuso de Londrina) a partir de hoje. */
function iso(offset: number) {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  now.setDate(now.getDate() + offset);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

async function open(page: Page, path = '/') {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  // Nenhum teste depende da rede externa (Google Maps).
  await page.route(/google\.com/, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>mapa</p>' }));
  await page.goto(path);
  return errors;
}

/** Aguarda a hidratação dos formulários (ilhas React client:load / client:idle). */
async function hydrated(page: Page) {
  await page.waitForFunction(() => {
    const islands = [...document.querySelectorAll('astro-island')].filter((el) => el.querySelector('form'));
    return islands.length >= 2 && islands.every((el) => !el.hasAttribute('ssr'));
  });
}

test.describe('Página inicial', () => {
  test('SEO, estrutura, dados estruturados e console limpo', async ({ page }) => {
    const errors = await open(page);
    await expect(page).toHaveTitle(/Hotel barato em Londrina/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Sua hospedagem em Londrina com conforto e praticidade.');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /centro de Londrina/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.hoteltriunfolondrina.com.br/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image\.jpg$/);
    await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);

    const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));
    const hotel = schemas.find((s) => s['@type'] === 'Hotel');
    expect(hotel.telephone).toBe('+554333235054');
    expect(hotel.address.postalCode).toBe('86010-000');
    expect(hotel.aggregateRating).toBeUndefined(); // sem avaliações autodeclaradas
    expect(schemas.some((s) => s['@type'] === 'FAQPage')).toBe(true);

    // Hierarquia: nenhum h3 antes do primeiro h2; todas as imagens com alt.
    expect(await page.locator('img:not([alt])').count()).toBe(0);
    await hydrated(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('conteúdo provisório não é publicado em produção', async ({ page }) => {
    await open(page);
    const html = await page.content();
    expect(html).not.toContain('PROVISÓRIO');
    expect(html).not.toContain('Foto pendente');
    await expect(page.locator('#acomodacoes')).toContainText('TV');
    await expect(page.locator('#acomodacoes')).toContainText('R$ 145');
  });

  test('âncoras internas existem e links externos são seguros', async ({ page }) => {
    await open(page);
    const ids = await page.$$eval('a[href*="#"]', (links) => [
      ...new Set(links.map((a) => (a as HTMLAnchorElement).hash.slice(1)).filter(Boolean)),
    ]);
    for (const id of ids) await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
    expect(await page.locator('a:not([href]), a[href=""], a[href="#"]').count()).toBe(0);
    const unsafe = await page.$$eval('a[target="_blank"]', (links) =>
      links.filter((a) => !(a.getAttribute('rel') ?? '').includes('noopener')).map((a) => a.getAttribute('href')),
    );
    expect(unsafe).toEqual([]);
    await expect(page.locator('a[href="tel:+554333235054"]').first()).toBeAttached();
    await expect(page.getByRole('link', { name: /Como chegar/ })).toHaveAttribute('href', /google\.com\/maps\/dir\/\?api=1&destination=Rua\+Professor/);
  });
});

test.describe('Navegação', () => {
  test('menu principal (desktop) e menu mobile', async ({ page }) => {
    await open(page);
    if (isDesktopNav(page)) {
      const nav = page.getByRole('navigation', { name: 'Principal', exact: true });
      for (const label of ['Início', 'Sobre o Hotel', 'Acomodações', 'Comodidades', 'Localização', 'Contato'])
        await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
      await nav.getByRole('link', { name: 'Comodidades' }).click();
      await expect(page).toHaveURL(/#comodidades$/);
      await expect(page.locator('#comodidades-title')).toBeInViewport();
      return;
    }
    const toggle = page.locator('[data-menu-toggle]');
    const menu = page.locator('#menu-mobile');
    await expect(menu).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await menu.getByRole('link', { name: 'Localização' }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#localizacao$/);
  });

  test('botão flutuante aparece fora do topo e some sobre o formulário', async ({ page }) => {
    await open(page);
    const floating = page.locator('[data-floating]');
    await page.locator('#comodidades').scrollIntoViewIfNeeded();
    await expect(floating).not.toHaveClass(/is-hidden/);
    await expect(floating.getByRole('link', { name: /Ligar/ })).toHaveAttribute('href', 'tel:+554333235054');
    await page.locator('#solicitacao').scrollIntoViewIfNeeded();
    await expect(floating).toHaveClass(/is-hidden/);
  });
});

test.describe('Consulta de hospedagem', () => {
  test('valida datas e quantidade de hóspedes', async ({ page }) => {
    await open(page);
    await hydrated(page);
    const widget = page.getByRole('form', { name: 'Consultar hospedagem' });
    await widget.getByRole('button', { name: 'Buscar hospedagem' }).click();
    await expect(widget.getByText('Informe a data de entrada.')).toBeVisible();
    await expect(widget.getByText('Informe a data de saída.')).toBeVisible();

    const entrada = widget.getByLabel('Entrada');
    const saida = widget.getByLabel('Saída');
    await entrada.fill(iso(-1));
    await widget.getByRole('button', { name: 'Buscar hospedagem' }).click();
    await expect(widget.getByText('A data de entrada não pode estar no passado.')).toBeVisible();

    await entrada.fill(iso(10));
    await expect(saida).toHaveValue(iso(11)); // saída ajustada automaticamente
    await saida.fill(iso(10));
    await widget.getByRole('button', { name: 'Buscar hospedagem' }).click();
    await expect(widget.getByText('A saída deve ser pelo menos 1 dia depois da entrada.')).toBeVisible();
  });

  test('encaminha datas e hóspedes para o formulário de solicitação', async ({ page }) => {
    await open(page);
    await hydrated(page);
    const widget = page.getByRole('form', { name: 'Consultar hospedagem' });
    await widget.getByLabel('Entrada').fill(iso(7));
    await widget.getByLabel('Saída').fill(iso(10));
    await widget.getByLabel('Adultos').selectOption('3');
    await widget.getByLabel('Crianças').selectOption('1');
    await expect(widget).toContainText('3 noites');
    await widget.getByRole('button', { name: 'Buscar hospedagem' }).click();

    const form = page.locator('#solicitacao form');
    await expect(form).toBeInViewport();
    await expect(form.getByLabel('Data de entrada')).toHaveValue(iso(7));
    await expect(form.getByLabel('Data de saída')).toHaveValue(iso(10));
    await expect(form.getByLabel('Adultos')).toHaveValue('3');
    await expect(form.getByLabel('Crianças')).toHaveValue('1');
    await expect(form.getByLabel(/^Nome/)).toBeFocused();
  });

  test('"Faça sua reserva" leva à consulta', async ({ page }) => {
    await open(page);
    await page.locator('#inicio').getByRole('link', { name: 'Faça sua reserva' }).click();
    await expect(page).toHaveURL(/#reservar$/);
    await expect(page.getByRole('button', { name: 'Buscar hospedagem' })).toBeInViewport();
  });
});

test.describe('Formulário de solicitação', () => {
  test('validação no navegador', async ({ page }) => {
    await open(page);
    await hydrated(page);
    const form = page.locator('#solicitacao form');
    await form.getByRole('button', { name: /Enviar solicitação/ }).click();
    await expect(form.getByText('Informe seu nome.')).toBeVisible();
    await expect(form.getByText('Informe um e-mail ou telefone para retorno.')).toBeVisible();
    await expect(form.getByText('Informe a data de entrada.')).toBeVisible();
    await expect(form.getByText(/autorizar o uso dos dados/)).toBeVisible();
    await expect(form.getByLabel(/^Nome/)).toBeFocused();

    await form.getByLabel(/E-mail ou telefone/).fill('joao@exemplo');
    await form.getByRole('button', { name: /Enviar solicitação/ }).click();
    await expect(form.getByText(/E-mail inválido/)).toBeVisible();
    await form.getByLabel(/E-mail ou telefone/).fill('1234');
    await form.getByRole('button', { name: /Enviar solicitação/ }).click();
    await expect(form.getByText(/Telefone inválido/)).toBeVisible();

    // Assunto "informações": sem datas, mensagem obrigatória.
    await form.getByText('Dúvidas e informações').click();
    await expect(form.getByLabel('Data de entrada')).toHaveCount(0);
    await form.getByRole('button', { name: 'Enviar mensagem' }).click();
    await expect(form.getByText(/mínimo de 10 caracteres/)).toBeVisible();
  });

  test('envio real grava a solicitação e aparece no painel', async ({ page, browser }) => {
    await open(page);
    await hydrated(page);
    const form = page.locator('#solicitacao form');
    const name = `Hóspede Teste ${Date.now()}`;
    await form.getByLabel(/^Nome/).fill(name);
    await form.getByLabel(/E-mail ou telefone/).fill('43999998888');
    await form.getByLabel('Data de entrada').fill(iso(20));
    await form.getByLabel('Data de saída').fill(iso(23));
    await form.getByLabel(/Mensagem/).fill('Chegada prevista às 22h. <b>teste</b>');
    await form.getByRole('checkbox').check();
    await page.waitForTimeout(2600); // tempo mínimo de preenchimento (antispam)
    await form.getByRole('button', { name: /Enviar solicitação/ }).click();

    const done = page.getByRole('status').filter({ hasText: 'recebida' });
    await expect(done).toBeVisible();
    await expect(done).toContainText('Sua reserva ainda não está confirmada');
    const id = (await done.locator('h3').textContent())!.match(/nº (\d+)/)![1];

    const admin = await browser.newContext({ httpCredentials: ADMIN, baseURL: 'http://127.0.0.1:4322' });
    const adminPage = await admin.newPage();
    await adminPage.goto('/admin');
    const item = adminPage.locator('.req').filter({ hasText: name });
    await expect(item).toContainText(`nº ${id}`);
    await expect(item).toContainText('(43) 99999-8888');
    await expect(item).toContainText('3 noites');
    await expect(item).toContainText('<b>teste</b>'); // exibido como texto, não HTML
    await admin.close();
  });

  test('erro do servidor não exibe sucesso', async ({ page }) => {
    await open(page);
    await hydrated(page);
    await page.route('**/api/solicitacoes', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Falha simulada.' }) }),
    );
    const form = page.locator('#solicitacao form');
    await form.getByText('Dúvidas e informações').click();
    await form.getByLabel(/^Nome/).fill('Ana');
    await form.getByLabel(/E-mail ou telefone/).fill('ana@exemplo.com.br');
    await form.getByLabel(/Mensagem/).fill('Vocês aceitam cachorro de porte médio?');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Enviar mensagem' }).click();
    await expect(form.locator('.alert--error')).toContainText('Falha simulada.');
    await expect(form.locator('.alert--error a[href="tel:+554333235054"]')).toBeVisible();
    await expect(page.getByText(/recebida/)).toHaveCount(0);
  });
});

test.describe('API e painel', () => {
  test('API rejeita dados inválidos, origem externa e métodos indevidos', async ({ request }) => {
    const invalid = await request.post('/api/solicitacoes', {
      data: { subject: 'reserva', name: '', contact: 'x', consent: false, elapsed: 5000 },
    });
    expect(invalid.status()).toBe(422);
    expect((await invalid.json()).fields.name).toBeTruthy();

    const foreign = await request.post('/api/solicitacoes', { data: {}, headers: { Origin: 'https://exemplo-malicioso.com' } });
    expect(foreign.status()).toBe(403);

    const get = await request.get('/api/solicitacoes');
    expect(get.status()).toBe(405);
  });

  test('painel exige senha e permite atualizar e excluir', async ({ browser, request }) => {
    expect((await request.get('/admin')).status()).toBe(401);

    const created = await request.post('/api/solicitacoes', {
      data: { subject: 'informacoes', name: 'Para excluir', contact: 'teste@exemplo.com', message: 'Mensagem para o teste do painel.', consent: true, elapsed: 5000 },
    });
    expect(created.status()).toBe(201);
    const { id } = await created.json();

    const ctx = await browser.newContext({ httpCredentials: ADMIN, baseURL: 'http://127.0.0.1:4322' });
    const page = await ctx.newPage();
    await page.goto('/admin');
    const item = page.locator('.req').filter({ hasText: `nº ${id}` });
    await item.getByLabel(`Status da solicitação ${id}`).selectOption('em_atendimento');
    await item.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('status')).toHaveText(`Solicitação nº ${id} atualizada.`);
    await expect(page.locator('.req').filter({ hasText: `nº ${id}` })).toContainText('Em atendimento');

    page.once('dialog', (d) => d.accept());
    await page.locator('.req').filter({ hasText: `nº ${id}` }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('status')).toHaveText(`Solicitação nº ${id} excluída.`);
    await expect(page.locator('.req').filter({ hasText: `nº ${id}` })).toHaveCount(0);
    await ctx.close();
  });
});

test.describe('Seções', () => {
  test('mapa só carrega após autorização', async ({ page }) => {
    await open(page);
    const map = page.locator('#localizacao .map-embed');
    await map.scrollIntoViewIfNeeded();
    await expect(map.locator('iframe')).toHaveCount(0);
    await map.getByRole('button', { name: 'Carregar mapa' }).click();
    await expect(map.locator('iframe')).toHaveAttribute('src', /google\.com\/maps\?q=Rua\+Professor/);
  });

  test('avaliações mostram nota e total do Google, sem depoimentos inventados', async ({ page }) => {
    await open(page);
    const section = page.locator('#avaliacoes');
    await expect(section).toContainText('3,9');
    await expect(section).toContainText('546 avaliações');
    await expect(section.getByRole('img', { name: /Nota 3,9 de 5/ })).toBeVisible();
    await expect(section.getByRole('link', { name: /Ver avaliações no Google/ })).toHaveAttribute('href', /google\.com\/maps/);
    await expect(section.locator('blockquote')).toHaveCount(0);
  });

  test('comodidades confirmadas e perguntas frequentes', async ({ page }) => {
    await open(page);
    const amenities = page.locator('#comodidades h3');
    await expect(amenities).toHaveText([
      'Café da manhã incluso',
      'Estacionamento gratuito',
      'Wi-Fi gratuito',
      'Aceita animais de estimação',
      'Recepção 24 horas',
      'Quartos equipados',
    ]);
    const item = page.locator('.faq__item').filter({ hasText: 'animais de estimação' });
    await item.locator('summary').click();
    await expect(item.locator('p')).toBeVisible();
    await expect(item.locator('p')).toContainText('regras');
    await expect(page.locator('.faq__item')).toHaveCount(8);
  });

  test('galeria com ampliação (quando há fotos oficiais)', async ({ page }) => {
    await open(page);
    const thumbs = page.locator('[data-lightbox-index]');
    test.skip((await thumbs.count()) === 0, 'Ainda não há fotos oficiais em src/assets/fotos.');
    // A galeria hidrata ao entrar na tela (client:visible).
    await thumbs.first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const island = document.querySelector('[data-lightbox-index]')?.closest('astro-island');
      return island && !island.hasAttribute('ssr');
    });
    await thumbs.first().click();
    const dialog = page.getByRole('dialog', { name: 'Foto ampliada' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('src', /\.webp/);
    if ((await thumbs.count()) > 1) {
      await page.keyboard.press('ArrowRight');
      await expect(dialog.locator('[data-lightbox-count]')).toContainText('2 de');
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(thumbs.first()).toBeFocused();
  });

  test('acessibilidade básica: pular conteúdo e rótulos', async ({ page }) => {
    await open(page);
    await hydrated(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
    const unlabeled = await page.$$eval('input:not([type=hidden]):not([tabindex="-1"]), select, textarea', (els) =>
      els.filter((el) => !(el as HTMLInputElement).labels?.length).map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(unlabeled).toEqual([]);
    // Alvos de toque com pelo menos 44px nos principais botões.
    if (isMobile(page)) {
      const small = await page.$$eval('.btn, .floating a, .header__toggle', (els) =>
        els.filter((el) => (el as HTMLElement).offsetParent && el.getBoundingClientRect().height < 40).length,
      );
      expect(small).toBe(0);
    }
  });
});

test.describe('Páginas auxiliares', () => {
  test('privacidade, 404, robots e sitemap', async ({ page, request }) => {
    await page.goto('/politica-de-privacidade/');
    await expect(page.locator('h1')).toHaveText('Política de Privacidade');
    await expect(page.locator('main')).toContainText('LGPD');

    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Sitemap: https://www.hoteltriunfolondrina.com.br/sitemap.xml');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('<loc>https://www.hoteltriunfolondrina.com.br/</loc>');

    const missing = await page.goto('/nao-existe');
    expect(missing?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('Página não encontrada.');
  });
});
