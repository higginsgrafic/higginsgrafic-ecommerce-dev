/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests/e2e',
  snapshotDir: './tests/e2e/__screenshots__',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3003',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}-snapshots/{projectName}/{arg}{ext}',
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://127.0.0.1:3003',
    reuseExistingServer: true,
    timeout: 120_000,
  },
};

export default config;
