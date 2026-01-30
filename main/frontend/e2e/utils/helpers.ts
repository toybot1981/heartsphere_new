import { Page, expect } from '@playwright/test';
import { TEST_ACCOUNT, TEST_TIMEOUT } from '../config/test-data';

/**
 * 测试辅助函数
 * 提供登录、等待、截图等常用功能
 */

/**
 * 登录辅助函数
 * @param page - Playwright Page 对象
 * @param username - 用户名（可选，默认使用测试账号）
 * @param password - 密码（可选，默认使用测试账号）
 */
export async function login(
  page: Page,
  username: string = TEST_ACCOUNT.username,
  password: string = TEST_ACCOUNT.password
): Promise<void> {
  // 等待登录按钮或输入框出现
  const loginButton = page.locator('button:has-text("登录")').or(page.locator('button:has-text("Login")'));
  const usernameInput = page.locator('input[type="text"]').or(page.locator('input[placeholder*="用户名"]')).or(page.locator('input[placeholder*="账号"]'));
  const passwordInput = page.locator('input[type="password"]');

  // 如果已经有登录按钮，说明需要打开登录模态框
  if (await loginButton.isVisible().catch(() => false)) {
    await loginButton.click();
    await page.waitForTimeout(1000); // 等待模态框打开
  }

  // 输入用户名和密码
  if (await usernameInput.isVisible().catch(() => false)) {
    await usernameInput.fill(username);
  }
  if (await passwordInput.isVisible().catch(() => false)) {
    await passwordInput.fill(password);
  }

  // 点击登录按钮
  const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("登录")')).or(page.locator('button:has-text("Login")'));
  await submitButton.click();

  // 等待登录完成（等待主界面加载）
  await page.waitForTimeout(2000); // 等待登录请求完成
}

/**
 * 等待页面加载完成
 * @param page - Playwright Page 对象
 * @param timeout - 超时时间（毫秒）
 */
export async function waitForPageLoad(page: Page, timeout: number = TEST_TIMEOUT.PAGE_LOAD): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * 等待元素出现
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param timeout - 超时时间（毫秒）
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = TEST_TIMEOUT.DEFAULT
): Promise<void> {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

/**
 * 等待元素消失
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param timeout - 超时时间（毫秒）
 */
export async function waitForElementHidden(
  page: Page,
  selector: string,
  timeout: number = TEST_TIMEOUT.DEFAULT
): Promise<void> {
  await page.waitForSelector(selector, { timeout, state: 'hidden' });
}

/**
 * 重试函数
 * @param fn - 要重试的函数
 * @param maxRetries - 最大重试次数
 * @param delay - 重试间隔（毫秒）
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError || new Error('Retry failed');
}

/**
 * 截图函数
 * @param page - Playwright Page 对象
 * @param name - 截图文件名
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `e2e/screenshots/${name}-${Date.now()}.png`, fullPage: true });
}

/**
 * 检查页面是否包含文本
 * @param page - Playwright Page 对象
 * @param text - 要检查的文本
 */
export async function pageContainsText(page: Page, text: string): Promise<boolean> {
  const content = await page.textContent('body');
  return content?.includes(text) ?? false;
}

/**
 * 等待 API 请求完成
 * @param page - Playwright Page 对象
 * @param urlPattern - URL 模式（可选）
 * @param timeout - 超时时间（毫秒）
 */
export async function waitForApiRequest(
  page: Page,
  urlPattern?: string | RegExp,
  timeout: number = TEST_TIMEOUT.API
): Promise<void> {
  if (urlPattern) {
    await page.waitForResponse(response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      } else {
        return urlPattern.test(url);
      }
    }, { timeout });
  } else {
    await page.waitForLoadState('networkidle', { timeout });
  }
}
