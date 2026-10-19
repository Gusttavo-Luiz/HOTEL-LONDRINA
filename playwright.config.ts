import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta sobre o build de produção.
 * Em ambientes com Chromium pré-instalado, defina PW_CHROMIUM_PATH.
 */
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4322',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    launchOptions: { executablePath },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // O build é feito pelo script `npm test` antes de iniciar o servidor.
    command: 'node node_modules/astro/bin/astro.mjs preview --port 4322',
    url: 'http://localhost:4322',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
