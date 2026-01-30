import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_ENV } from './test-data';

// ES module 中获取 __dirname 的等价方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Playwright 测试配置
 * 配置测试环境、浏览器选项、报告输出等
 */
export default defineConfig({
  // 测试目录
  testDir: path.join(__dirname, '../tests'),
  
  // 测试环境 URL
  use: {
    baseURL: TEST_ENV.PC_URL,
    // 截图配置
    screenshot: 'only-on-failure',
    // 视频配置
    video: 'retain-on-failure',
    // 跟踪配置
    trace: 'on-first-retry',
    // 超时配置
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // 浏览器配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile 测试配置
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        baseURL: TEST_ENV.MOBILE_URL,
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        baseURL: TEST_ENV.MOBILE_URL,
      },
    },
  ],

  // 并行执行配置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 报告配置
  reporter: [
    ['html', { outputFolder: path.join(__dirname, '../reports/html') }],
    ['json', { outputFile: path.join(__dirname, '../reports/results.json') }],
    ['list'],
  ],

  // 输出目录
  outputDir: path.join(__dirname, '../reports/test-results'),

  // 全局设置
  globalSetup: undefined,
  globalTeardown: undefined,

  // Web 服务器配置（可选，用于自动启动服务器）
  // webServer: {
  //   command: 'npm run dev',
  //   url: TEST_ENV.PC_URL,
  //   reuseExistingServer: !process.env.CI,
  // },
});
