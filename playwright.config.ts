import { defineConfig } from '@playwright/test';
const port = 3100;
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 240000,
  expect: { timeout: 30000 },
  use: {
    baseURL: 'http://127.0.0.1:' + port,
    headless: true,
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROME_PATH ||
        (process.platform === 'win32'
          ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
          : undefined),
    },
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ' + port,
    url: 'http://127.0.0.1:' + port,
    timeout: 120000,
    reuseExistingServer: false,
    env: {
      APP_URL: 'http://127.0.0.1:' + port,
    },
  },
  reporter: [['list'], ['json', { outputFile: 'work/e2e-results.json' }]],
  outputDir: 'work/e2e-artifacts',
});
