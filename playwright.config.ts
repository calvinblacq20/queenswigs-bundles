import { defineConfig, devices } from '@playwright/test';

// Real-device viewports/user agents across the three engines customers use:
// Chromium (Android, Chrome/Edge), WebKit (every iPhone/iPad browser, Safari), Firefox.
const matrix = [
  { name: 'android-galaxy-s9', use: devices['Galaxy S9+'] },
  { name: 'android-galaxy-s24', use: devices['Galaxy S24'] },
  { name: 'android-pixel-7', use: devices['Pixel 7'] },
  { name: 'android-galaxy-tab-s9', use: devices['Galaxy Tab S9'] },
  { name: 'ios-iphone-se', use: devices['iPhone SE'] },
  { name: 'ios-iphone-14', use: devices['iPhone 14'] },
  { name: 'ios-iphone-15-pro-max', use: devices['iPhone 15 Pro Max'] },
  { name: 'ios-ipad-mini', use: devices['iPad Mini'] },
  { name: 'ios-ipad-pro-landscape', use: devices['iPad Pro 11 landscape'] },
  {
    name: 'desktop-chrome-1366',
    use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
  },
  {
    name: 'desktop-safari-1440',
    use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
  },
  {
    name: 'desktop-firefox-1280',
    use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 720 } },
  },
  {
    name: 'desktop-chrome-1920',
    use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
  },
];

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: matrix,
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
