import { Page, Locator } from '@playwright/test';
import { login } from './helpers';

/**
 * 页面对象模型
 * 封装页面元素和操作方法
 */

/**
 * 登录页面对象
 */
export class LoginPage {
  constructor(private page: Page) {}

  // 页面元素
  get usernameInput(): Locator {
    return this.page.locator('input[type="text"]').or(this.page.locator('input[placeholder*="用户名"]')).or(this.page.locator('input[placeholder*="账号"]'));
  }

  get passwordInput(): Locator {
    return this.page.locator('input[type="password"]');
  }

  get loginButton(): Locator {
    return this.page.locator('button:has-text("登录")').or(this.page.locator('button:has-text("Login")')).or(this.page.locator('button[type="submit"]'));
  }

  // 操作方法
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await login(this.page, username, password);
  }

  async isLoggedIn(): Promise<boolean> {
    // 检查是否显示用户信息或主界面元素
    const userInfo = this.page.locator('[data-testid="user-info"]').or(this.page.locator('.user-profile'));
    return await userInfo.isVisible().catch(() => false);
  }
}

/**
 * 主页面对象
 */
export class MainPage {
  constructor(private page: Page) {}

  // 页面元素
  get sceneList(): Locator {
    return this.page.locator('[data-testid="scene-list"]').or(this.page.locator('.scene-list'));
  }

  get characterList(): Locator {
    return this.page.locator('[data-testid="character-list"]').or(this.page.locator('.character-list'));
  }

  get chatWindow(): Locator {
    return this.page.locator('[data-testid="chat-window"]').or(this.page.locator('.chat-window'));
  }

  // 操作方法
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * 场景管理页面对象
 */
export class ScenarioPage {
  constructor(private page: Page) {}

  // 页面元素
  get createScenarioButton(): Locator {
    return this.page.locator('button:has-text("创建场景")').or(this.page.locator('button:has-text("新建场景")'));
  }

  get scenarioList(): Locator {
    return this.page.locator('[data-testid="scenario-list"]').or(this.page.locator('.scenario-list'));
  }

  // 操作方法
  async createScenario(name: string, description: string): Promise<void> {
    await this.createScenarioButton.click();
    await this.page.waitForTimeout(1000); // 等待模态框打开
    // 填写场景信息并保存
    // 这里需要根据实际 UI 实现
  }
}

/**
 * 角色管理页面对象
 */
export class CharacterPage {
  constructor(private page: Page) {}

  // 页面元素
  get createCharacterButton(): Locator {
    return this.page.locator('button:has-text("创建角色")').or(this.page.locator('button:has-text("新建角色")'));
  }

  get characterList(): Locator {
    return this.page.locator('[data-testid="character-list"]').or(this.page.locator('.character-list'));
  }

  // 操作方法
  async createCharacter(name: string, description: string): Promise<void> {
    await this.createCharacterButton.click();
    await this.page.waitForTimeout(1000); // 等待模态框打开
    // 填写角色信息并保存
    // 这里需要根据实际 UI 实现
  }

  async selectCharacter(name: string): Promise<void> {
    const characterCard = this.characterList.locator(`text=${name}`).first();
    await characterCard.click();
    await this.page.waitForTimeout(1000); // 等待聊天窗口打开
  }
}

/**
 * 聊天页面对象
 */
export class ChatPage {
  constructor(private page: Page) {}

  // 页面元素
  get messageInput(): Locator {
    return this.page.locator('textarea').or(this.page.locator('input[type="text"]')).or(this.page.locator('[data-testid="message-input"]'));
  }

  get sendButton(): Locator {
    return this.page.locator('button:has-text("发送")').or(this.page.locator('button:has-text("Send")')).or(this.page.locator('[data-testid="send-button"]'));
  }

  get messageList(): Locator {
    return this.page.locator('[data-testid="message-list"]').or(this.page.locator('.message-list')).or(this.page.locator('.chat-messages'));
  }

  // 操作方法
  async sendMessage(text: string): Promise<void> {
    await this.messageInput.fill(text);
    await this.sendButton.click();
    await this.page.waitForTimeout(1000); // 等待消息发送
  }

  async waitForMessage(text: string, timeout: number = 30000): Promise<void> {
    await this.messageList.locator(`text=${text}`).waitFor({ timeout, state: 'visible' });
  }
}
