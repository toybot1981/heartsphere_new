# Main 项目端到端测试文档

本文档说明如何运行和管理 Main 项目的端到端自动化测试。

## 测试框架

本测试使用 [Playwright](https://playwright.dev/) 作为端到端测试框架。

## 测试环境要求

1. **开发服务器运行**: 确保 Main 项目前端在 `http://localhost:3000` 运行
2. **测试账号**: 使用 `tongyexin/123456` 作为测试账号
3. **Node.js**: 需要 Node.js 18+ 版本
4. **浏览器**: Playwright 会自动安装所需浏览器

## 安装

1. **安装依赖**:
   ```bash
   cd main/frontend
   npm install
   ```

2. **安装浏览器**:
   ```bash
   npx playwright install
   ```

## 运行测试

### 完整测试

运行所有 PC 和 Mobile 版本的测试：

```bash
npm run test:e2e
```

### PC 版本测试

只运行 PC 版本的测试：

```bash
npm run test:e2e:pc
```

### Mobile 版本测试

只运行 Mobile 版本的测试：

```bash
npm run test:e2e:mobile
```

### UI 模式

使用 Playwright UI 模式运行测试（便于调试）：

```bash
npm run test:e2e:ui
```

### 查看测试报告

查看 HTML 格式的测试报告：

```bash
npm run test:e2e:report
```

## 测试目录结构

```
e2e/
├── config/
│   ├── playwright.config.ts      # Playwright 配置
│   └── test-data.ts              # 测试数据配置
├── utils/
│   ├── helpers.ts                # 测试辅助函数
│   ├── page-objects.ts           # 页面对象模型
│   └── assertions.ts             # 自定义断言
├── tests/
│   ├── pc/                       # PC 版本测试
│   │   ├── login.spec.ts
│   │   ├── scenario.spec.ts
│   │   ├── character.spec.ts
│   │   ├── chat.spec.ts
│   │   └── ...
│   └── mobile/                   # Mobile 版本测试
│       ├── login.spec.ts
│       ├── scenario.spec.ts
│       └── ...
├── reports/                      # 测试报告目录
└── screenshots/                  # 测试截图目录
```

## 测试覆盖范围

### PC 版本测试 (`http://localhost:3000`)

- ✅ 登录功能
- ✅ 场景管理
- ✅ 角色管理
- ✅ 聊天功能
- ⏳ 剧本系统
- ⏳ 信箱功能
- ⏳ 心域连接
- ⏳ 用户设置

### Mobile 版本测试 (`http://localhost:3000/mobile.html`)

- ✅ 登录功能
- ⏳ 场景管理
- ⏳ 角色管理
- ⏳ 聊天功能
- ⏳ 响应式布局

## 测试报告

测试执行后会生成以下报告：

1. **HTML 报告**: `e2e/reports/html/index.html`
   - 详细的测试结果
   - 失败测试的截图
   - 测试执行时间统计

2. **JSON 报告**: `e2e/reports/results.json`
   - 机器可读的测试结果
   - 支持 CI/CD 集成

3. **截图**: `e2e/screenshots/`
   - 失败测试的页面截图

## 添加新测试

1. **创建测试文件**: 在 `e2e/tests/pc/` 或 `e2e/tests/mobile/` 目录下创建新的测试文件

2. **使用页面对象模型**: 使用 `e2e/utils/page-objects.ts` 中定义的页面对象

3. **使用辅助函数**: 使用 `e2e/utils/helpers.ts` 中的辅助函数

4. **使用自定义断言**: 使用 `e2e/utils/assertions.ts` 中的断言函数

示例：

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../utils/page-objects';
import { TEST_ACCOUNT } from '../../config/test-data';

test.describe('My Feature Tests', () => {
  test('should test my feature', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.username, TEST_ACCOUNT.password);
    
    // 你的测试代码
  });
});
```

## 故障排除

### 测试失败

1. **检查开发服务器**: 确保 `http://localhost:3000` 可以访问
2. **检查测试账号**: 确保测试账号 `tongyexin/123456` 可用
3. **查看测试报告**: 运行 `npm run test:e2e:report` 查看详细错误信息
4. **查看截图**: 检查 `e2e/screenshots/` 目录下的失败截图

### 浏览器安装问题

如果浏览器安装失败，可以手动安装：

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

## 注意事项

1. **测试数据**: 测试可能会创建测试数据，测试数据可能不会自动清理
2. **测试顺序**: 测试应该是独立的，不依赖执行顺序
3. **选择器**: 使用稳定的选择器（如 `data-testid`），避免使用易变的 CSS 类名
4. **等待**: 使用 Playwright 的自动等待机制，避免硬编码的 `sleep`

## 参考文档

- [Playwright 文档](https://playwright.dev/docs/intro)
- [Playwright API 参考](https://playwright.dev/docs/api/class-playwright)
- [测试最佳实践](https://playwright.dev/docs/best-practices)
