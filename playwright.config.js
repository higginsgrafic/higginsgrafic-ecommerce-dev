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
    // Desktop browsers — executen tots els tests excepte mobile.spec.js i lighthouse.spec.js
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
      testIgnore: [/mobile\.spec\.js$/, /lighthouse\.spec\.js$/],
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
      testIgnore: [/mobile\.spec\.js$/, /lighthouse\.spec\.js$/],
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
      testIgnore: [/mobile\.spec\.js$/, /lighthouse\.spec\.js$/],
    },
    // Mobile viewports — només executen mobile.spec.js
    // (cross-browser-layout depèn de CSS vars que no es publiquen a mòbil)
    {
      name: 'mobile-chrome',
      testMatch: /mobile\.spec\.js$/,
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile-safari',
      testMatch: /mobile\.spec\.js$/,
      use: {
        browserName: 'webkit',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    // Tablet — només mobile.spec.js
    {
      name: 'tablet',
      testMatch: /mobile\.spec\.js$/,
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
    // Lighthouse — només executa lighthouse.spec.js (chromium, single worker)
    {
      name: 'lighthouse',
      testMatch: /lighthouse\.spec\.js$/,
      use: { browserName: 'chromium' },
      // Lighthouse és CPU-intensiu, no paral·lelitzar
      retries: 1,
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
