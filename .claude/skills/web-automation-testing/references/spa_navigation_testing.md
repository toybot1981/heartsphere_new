# SPA 无 URL 路由场景的测试策略

针对单页应用（SPA）中通过应用内状态切换、无独立 URL 的页面（如心域 main 的「现实世界」）的测试写法。

## 原则

- **不依赖 URL 变化**：切换屏幕后 URL 可能不变，因此不能用「navigate to /realworld」或「verify URL contains /realworld」。
- **用特征文案或元素验证状态**：进入某屏后，用该屏独有的文案或元素做 verify。

## 推荐步骤模式

### 1. 进入某屏

- 先 `navigate to` 应用根 URL（如 `http://localhost:3000`）。
- 再 `click text=进入现实`（或等价入口）。
- 用 `wait for text=写今日` 或 `wait for 2 seconds` 等待该屏渲染。
- 用 `verify text=写今日` 确认已进入目标屏。

### 2. 示例流程（现实世界日记）

```
- navigate to http://localhost:3000
- wait for 2 seconds
- click text=进入现实
- wait for 3 seconds
- verify text=写今日
```

### 3. 模态框

- SPA 内弹窗无独立 URL，用「wait for 模态框内特征文案」再断言，例如：
  - `click button[title*="查看从日记中提取的记忆"]`
  - `wait for 5 seconds`
  - `verify text=日记记忆`

## 等待策略

- 状态切换后增加 `wait for N seconds` 或 `wait for <selector>`，避免过早 verify。
- 异步加载（如记忆列表）适当延长等待或使用 `wait for text=某内容`。

## 参考

- 现实世界日记 e2e：`main/frontend/e2e/realworld-journal-memory/`
- 技能 test_case_patterns.md：Dynamic Content、Timeout Handling
