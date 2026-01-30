import { Page, expect, Locator } from '@playwright/test';

/**
 * 自定义断言函数
 * 提供常用的断言功能
 */

/**
 * 断言页面元素存在
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param options - 选项
 */
export async function assertElementExists(
  page: Page,
  selector: string,
  options?: { timeout?: number; visible?: boolean }
): Promise<void> {
  const locator = page.locator(selector);
  if (options?.visible !== false) {
    await expect(locator).toBeVisible({ timeout: options?.timeout });
  } else {
    await expect(locator).toBeAttached({ timeout: options?.timeout });
  }
}

/**
 * 断言页面元素不存在
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param timeout - 超时时间（毫秒）
 */
export async function assertElementNotExists(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<void> {
  await expect(page.locator(selector)).not.toBeVisible({ timeout });
}

/**
 * 断言文本内容
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param text - 期望的文本内容
 * @param options - 选项
 */
export async function assertTextContent(
  page: Page,
  selector: string,
  text: string | RegExp,
  options?: { exact?: boolean; timeout?: number }
): Promise<void> {
  const locator = page.locator(selector);
  if (options?.exact) {
    await expect(locator).toHaveText(text, { timeout: options?.timeout });
  } else {
    await expect(locator).toContainText(text, { timeout: options?.timeout });
  }
}

/**
 * 断言页面包含文本
 * @param page - Playwright Page 对象
 * @param text - 期望的文本内容
 * @param options - 选项
 */
export async function assertPageContainsText(
  page: Page,
  text: string | RegExp,
  options?: { timeout?: number }
): Promise<void> {
  const body = page.locator('body');
  await expect(body).toContainText(text, { timeout: options?.timeout });
}

/**
 * 断言 URL
 * @param page - Playwright Page 对象
 * @param url - 期望的 URL（可以是字符串或正则表达式）
 * @param options - 选项
 */
export async function assertUrl(
  page: Page,
  url: string | RegExp,
  options?: { timeout?: number }
): Promise<void> {
  if (typeof url === 'string') {
    await expect(page).toHaveURL(url, { timeout: options?.timeout });
  } else {
    await expect(page).toHaveURL(url, { timeout: options?.timeout });
  }
}

/**
 * 断言元素可点击
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param timeout - 超时时间（毫秒）
 */
export async function assertElementClickable(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<void> {
  const locator = page.locator(selector);
  await expect(locator).toBeEnabled({ timeout });
  await expect(locator).toBeVisible({ timeout });
}

/**
 * 断言表单输入值
 * @param page - Playwright Page 对象
 * @param selector - 元素选择器
 * @param value - 期望的值
 * @param timeout - 超时时间（毫秒）
 */
export async function assertInputValue(
  page: Page,
  selector: string,
  value: string,
  timeout: number = 5000
): Promise<void> {
  await expect(page.locator(selector)).toHaveValue(value, { timeout });
}

/**
 * 断言功能状态（例如：加载中、已完成等）
 * @param page - Playwright Page 对象
 * @param selector - 状态元素选择器
 * @param expectedState - 期望的状态
 * @param timeout - 超时时间（毫秒）
 */
export async function assertFeatureState(
  page: Page,
  selector: string,
  expectedState: string,
  timeout: number = 5000
): Promise<void> {
  const locator = page.locator(selector);
  const actualState = await locator.textContent({ timeout });
  expect(actualState).toContain(expectedState);
}
