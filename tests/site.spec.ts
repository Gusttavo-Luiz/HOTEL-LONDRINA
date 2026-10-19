import { test, expect, type Page } from '@playwright/test';

const WA = 'https://wa.me/5543998451927';
const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1000) < 768;

/** Captura erros de console e intercepta window.open (WhatsApp). */
async function setup(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  // Bloqueia recursos externos (mapa) para os testes não dependerem da rede.
  await page.route(/google\.com/, (route) => route.fulfill({ status: 200, body: '' }));
  await page.addInitScript(() => {
    (window as any).__opened = [];
    window.open = ((url: string) => {
      (window as any).__opened.push(url);
      return { opener: null } as Window;
    }) as typeof window.open;
  });
  await page.goto('/');
  return errors;
}

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

test('página inicial: SEO, estrutura e sem erros de console', async ({ page }) => {
  const errors = await setup(page);
  await expect(page).toHaveTitle(/Hotel Triunfo Londrina/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Hotel econômico em Londrina, com localização privilegiada.');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Londrina/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hoteltriunfolondrina.com.br/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image\.jpg$/);

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = schemas.map((s) => JSON.parse(s)['@type']);
  expect(types).toEqual(expect.arrayContaining(['Hotel', 'WebSite', 'FAQPage']));
  const hotel = JSON.parse(schemas[0]);
  expect(hotel.telephone).toBe('+554333235054');
  expect(hotel.address.postalCode).toBe('86010-000');

  // Todas as imagens têm texto alternativo.
  expect(await page.locator('img:not([alt])').count()).toBe(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test('todos os links internos apontam para seções existentes', async ({ page }) => {
  await setup(page);
  const hashes = await page.$$eval('a[href^="/#"], a[href^="#"]', (links) =>
    [...new Set(links.map((a) => (a as HTMLAnchorElement).hash.slice(1)))],
  );
  expect(hashes.length).toBeGreaterThan(5);
  for (const id of hashes) {
    await expect(page.locator(`[id="${id}"]`), `âncora #${id}`).toHaveCount(1);
  }
  // Nenhum link vazio.
  expect(await page.locator('a:not([href]), a[href=""], a[href="#"]').count()).toBe(0);
});

test('contatos: telefone, WhatsApp e mapa', async ({ page }) => {
  await setup(page);
  await expect(page.locator('a[href="tel:+554333235054"]').first()).toBeAttached();
  const wa = page.locator(`a[href^="${WA}"]`);
  expect(await wa.count()).toBeGreaterThan(3);
  await expect(wa.first()).toHaveAttribute('rel', /noopener/);
  await expect(page.getByRole('link', { name: /Abrir no Google Maps/ })).toHaveAttribute(
    'href',
    /google\.com\/maps\/search\/\?api=1&query=Rua\+Professor/,
  );
  await expect(page.locator('#localizacao iframe')).toHaveAttribute('loading', 'lazy');
});

test('menu de navegação (desktop e celular)', async ({ page }) => {
  await setup(page);
  if (isMobile(page)) {
    const toggle = page.locator('[data-menu-toggle]');
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await menu.getByRole('link', { name: 'Avaliações' }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#avaliacoes$/);
    await expect(page.locator('.action-bar')).toBeVisible();
  } else {
    const nav = page.getByRole('navigation', { name: 'Navegação principal', exact: true });
    for (const label of ['Início', 'Sobre o Hotel', 'Acomodações', 'Fotos', 'Avaliações', 'Localização', 'Contato']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    await nav.getByRole('link', { name: 'Localização' }).click();
    await expect(page).toHaveURL(/#localizacao$/);
    await expect(page.locator('#localizacao h2')).toBeInViewport();
    await expect(page.locator('[data-header]')).toHaveClass(/is-scrolled/);
  }
});

test('botões de reserva levam ao formulário', async ({ page }) => {
  await setup(page);
  await page.locator('#inicio').getByRole('link', { name: 'Faça sua reserva' }).click();
  await expect(page.locator('#form-reserva')).toBeInViewport();
  await page.locator('#reservas').getByRole('link', { name: 'Fazer reserva online' }).click();
  await expect(page.locator('#reserva-checkin')).toBeFocused();
});

test('reserva: validações de campos e datas', async ({ page }) => {
  await setup(page);
  const form = page.locator('#form-reserva');
  await form.getByRole('button', { name: /Enviar solicitação/ }).click();
  await expect(page.locator('#erro-checkin')).toHaveText('Informe a data de check-in.');
  await expect(page.locator('#erro-checkout')).toHaveText('Informe a data de check-out.');
  await expect(page.locator('#erro-name')).not.toBeEmpty();
  await expect(page.locator('#erro-phone')).not.toBeEmpty();
  await expect(page.locator('#reserva-checkin')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#reserva-checkin')).toBeFocused();
  await expect(form.locator('[data-form-status]')).toContainText('4 campos');

  // Data passada
  await page.locator('#reserva-checkin').fill(iso(-2));
  await page.locator('#reserva-checkin').dispatchEvent('change');
  await expect(page.locator('#erro-checkin')).toContainText('data passada');

  // Check-out anterior ao check-in
  await page.locator('#reserva-checkin').fill(iso(10));
  await page.locator('#reserva-checkin').dispatchEvent('change');
  await expect(page.locator('#reserva-checkout')).toHaveValue(iso(11)); // ajustado automaticamente
  await page.locator('#reserva-checkout').fill(iso(9));
  await page.locator('#reserva-checkout').dispatchEvent('change');
  await expect(page.locator('#erro-checkout')).toHaveText('O check-out deve ser posterior ao check-in.');

  // Mesmo dia também é inválido
  await page.locator('#reserva-checkout').fill(iso(10));
  await form.getByRole('button', { name: /Enviar solicitação/ }).click();
  await expect(page.locator('#erro-checkout')).toHaveText('O check-out deve ser posterior ao check-in.');

  // Telefone inválido
  await page.locator('#reserva-telefone').fill('1234');
  await form.getByRole('button', { name: /Enviar solicitação/ }).click();
  await expect(page.locator('#erro-phone')).toContainText('DDD');
  expect(await page.evaluate(() => (window as any).__opened.length)).toBe(0);
});

test('reserva: solicitação válida abre o WhatsApp com os dados', async ({ page }) => {
  await setup(page);
  await page.locator('#reserva-checkin').fill(iso(5));
  await page.locator('#reserva-checkin').dispatchEvent('change');
  await page.locator('#reserva-checkout').fill(iso(8));
  await page.locator('#reserva-checkout').dispatchEvent('change');
  await expect(page.locator('[data-nights]')).toHaveText('3 noites de hospedagem');
  await page.locator('#reserva-hospedes').selectOption('2');
  await page.locator('#reserva-nome').fill('Maria da Silva');
  await page.locator('#reserva-telefone').fill('43999998888');
  await page.locator('#reserva-telefone').blur();
  await expect(page.locator('#reserva-telefone')).toHaveValue('(43) 99999-8888');
  await page.locator('#reserva-obs').fill('Chegada às 22h');
  await page.getByRole('button', { name: /Enviar solicitação/ }).click();

  const opened: string[] = await page.evaluate(() => (window as any).__opened);
  expect(opened).toHaveLength(1);
  expect(opened[0].startsWith(`${WA}?text=`)).toBe(true);
  const text = decodeURIComponent(opened[0].split('?text=')[1]);
  expect(text).toContain('Hóspedes: 2');
  expect(text).toContain('(3 noites)');
  expect(text).toContain('Maria da Silva');
  expect(text).toContain('Chegada às 22h');
  const status = page.locator('#form-reserva [data-form-status]');
  await expect(status).toHaveAttribute('data-tone', 'success');
  await expect(status).toContainText('Envie a mensagem');
  await expect(status.locator(`a[href^="${WA}"]`)).toBeAttached();
});

test('contato: validação e envio pelo WhatsApp', async ({ page }) => {
  await setup(page);
  const form = page.locator('[data-contact-form]');
  await form.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.locator('#erro-contato-name')).toHaveText('Informe seu nome.');
  await expect(page.locator('#erro-contato-email')).toHaveText('Informe seu e-mail.');
  await expect(page.locator('#erro-contato-message')).not.toBeEmpty();
  await expect(page.locator('#erro-contato-phone')).toBeEmpty();

  await page.locator('#contato-nome').fill('João Pereira');
  await page.locator('#contato-email').fill('joao@exemplo');
  await page.locator('#contato-telefone').fill('99');
  await page.locator('#contato-mensagem').fill('Olá');
  await form.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.locator('#erro-contato-email')).toContainText('e-mail válido');
  await expect(page.locator('#erro-contato-phone')).toContainText('DDD');
  await expect(page.locator('#erro-contato-message')).toContainText('mínimo');
  expect(await page.evaluate(() => (window as any).__opened.length)).toBe(0);

  await page.locator('#contato-email').fill('joao@exemplo.com.br');
  await page.locator('#contato-telefone').fill('4333235054');
  await page.locator('#contato-mensagem').fill('Gostaria de saber sobre hospedagem para uma equipe.');
  await form.getByRole('button', { name: 'Enviar mensagem' }).click();
  const opened: string[] = await page.evaluate(() => (window as any).__opened);
  expect(opened).toHaveLength(1);
  const text = decodeURIComponent(opened[0].split('?text=')[1]);
  expect(text).toContain('joao@exemplo.com.br');
  expect(text).toContain('(43) 3323-5054');
  await expect(form.locator('[data-form-status]')).toHaveAttribute('data-tone', 'success');
});

test('avaliações: 5 depoimentos com notas originais e período histórico', async ({ page }) => {
  await setup(page);
  const reviews = page.locator('#avaliacoes .review');
  await expect(reviews).toHaveCount(5);
  const ratings = await reviews.locator('[role="img"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  expect(ratings).toEqual(['Nota 5 de 5', 'Nota 5 de 5', 'Nota 4 de 5', 'Nota 5 de 5', 'Nota 4 de 5']);
  await expect(page.locator('#avaliacoes')).toContainText('2018 e 2019');
  await expect(page.locator('#avaliacoes').getByRole('link', { name: /Ver avaliações/ })).toHaveAttribute('href', /google\.com\/maps/);
});

test('galeria: filtros por categoria e lightbox', async ({ page }) => {
  await setup(page);
  const items = page.locator('.gallery__item');
  const total = await items.count();
  expect(total).toBeGreaterThan(0);
  await page.locator('[data-filter="quartos"]').click();
  await expect(page.locator('[data-filter="quartos"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.gallery__item:not([hidden])')).toHaveCount(
    await page.locator('.gallery__item[data-category="quartos"]').count(),
  );
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator('.gallery__item:not([hidden])')).toHaveCount(total);

  const openers = page.locator('[data-lightbox-src]');
  test.skip((await openers.count()) === 0, 'Nenhuma foto oficial publicada ainda — lightbox sem imagens para abrir.');
  await openers.first().click();
  const dialog = page.locator('[data-lightbox]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lightbox-img]')).toHaveAttribute('src', /\.webp/);
  if ((await openers.count()) > 1) {
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[data-lightbox-count]')).toHaveText(`2 de ${await openers.count()}`);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(openers.first()).toBeFocused();
});

test('FAQ abre e fecha', async ({ page }) => {
  await setup(page);
  const item = page.locator('.faq__item').nth(1);
  await expect(item).not.toHaveAttribute('open', '');
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open', '');
  await expect(item.locator('p')).toBeVisible();
});

test('acessibilidade básica: skip link e foco visível', async ({ page }) => {
  await setup(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  // Todos os campos de formulário têm rótulo associado.
  const unlabeled = await page.$$eval('input:not([type=hidden]):not([tabindex="-1"]), select, textarea', (els) =>
    els.filter((el) => !(el as HTMLInputElement).labels?.length).map((el) => el.id),
  );
  expect(unlabeled).toEqual([]);
});

test('páginas auxiliares: privacidade, 404, robots e sitemap', async ({ page, request }) => {
  await page.goto('/politica-de-privacidade/');
  await expect(page.locator('h1')).toHaveText('Política de Privacidade');
  await expect(page).toHaveTitle(/Política de Privacidade/);

  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://hoteltriunfolondrina.com.br/sitemap.xml');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://hoteltriunfolondrina.com.br/</loc>');
  expect(sitemap).toContain('/politica-de-privacidade/');

  const missing = await page.goto('/pagina-inexistente');
  expect(missing?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('não foi encontrada');
});
