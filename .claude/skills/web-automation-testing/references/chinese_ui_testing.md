# 中文 UI 自动化测试

针对中文界面（如心域 main 工程现实世界日记）的步骤写法建议。

## 选择器策略

### 1. 使用 text= 匹配中文文案

- **格式**：`click text=进入现实`、`verify text=写今日`
- **注意**：步骤中直接使用中文，确保 test plan JSON 为 UTF-8 编码。技能内 `test_executor.py` 已使用 `encoding='utf-8'` 读取 plan，并将 `text=` 选择器透传至 Playwright，无需修改脚本即可使用中文步骤；若遇截断或编码问题可改用 `button:has-text("写今日")` 等 Playwright 语法。

### 2. 常用模式

```
- click text=进入现实
- verify text=写今日
- click text=新思维
- verify text=日记记忆
- click button[title*="查看从日记中提取的记忆"]
```

### 3. 备选选择器

- 若 `text=中文` 不稳定，可尝试：
  - `button:has-text("写今日")`
  - `[aria-label*="写今日"]`
  - 通过 DevTools 获取的 data-testid 或唯一 class（若项目有约定）

## 避免的写法

- 不要使用 `wait for page load`（执行器可能将其解析为选择器）；用 `wait for 2 seconds` 或 `wait for text=写今日`。
- 中文与标点尽量与页面实际文案一致，避免全角/半角混用导致匹配失败。

## 参考

- 现实世界日记 e2e 测试计划：`main/frontend/e2e/realworld-journal-memory/test_plan.json`
- 技能 SKILL.md：Test Step Syntax、Troubleshooting
