import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta sobre o build de produção (servidor Node real).
 * `npm test` faz o build antes. Com Chromium já instalado no sistema,
 * defina PW_CHROMIUM_PATH.
 */
export const ADMIN = { username: 'recepcao', password: 'senha-de-teste-123' };

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4322',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 }, hasTouch: true } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node dist/server/entry.mjs',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      HOST: '127.0.0.1',
      PORT: '4322',
      DATA_DIR: 'test-results/data',
      ADMIN_USER: ADMIN.username,
      ADMIN_PASSWORD: ADMIN.password,
      RATE_LIMIT_MAX: '1000',
    },
  },
});
