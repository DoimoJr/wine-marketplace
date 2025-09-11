import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Web Frontend Tests
    {
      name: 'web-chromium',
      testDir: './tests/web',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000'
      },
    },
    {
      name: 'web-firefox',
      testDir: './tests/web',
      use: { 
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:3000'
      },
    },
    {
      name: 'web-webkit',
      testDir: './tests/web',
      use: { 
        ...devices['Desktop Safari'],
        baseURL: 'http://localhost:3000'
      },
    },
    {
      name: 'web-mobile',
      testDir: './tests/web',
      use: { 
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:3000'
      },
    },

    // Admin Dashboard Tests
    {
      name: 'admin-chromium',
      testDir: './tests/admin',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001'
      },
    },

    // API Tests
    {
      name: 'api-tests',
      testDir: './tests/api',
      use: {
        baseURL: 'http://localhost:3010'
      },
    },
  ],

  // Comment out webServer for local development since servers are already running
  // Uncomment for CI/CD where servers need to be started automatically
  // webServer: [
  //   {
  //     command: 'pnpm --filter web dev',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120 * 1000,
  //   },
  //   {
  //     command: 'pnpm --filter admin dev',
  //     url: 'http://localhost:3001', 
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120 * 1000,
  //   },
  //   {
  //     command: 'pnpm --filter api dev',
  //     url: 'http://localhost:3002',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120 * 1000,
  //   },
  // ],
});