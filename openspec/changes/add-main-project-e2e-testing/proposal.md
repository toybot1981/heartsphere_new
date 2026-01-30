# Change: 添加 Main 项目端到端自动化测试

## Why

Main 项目（HeartSphere）包含 PC 和 Mobile 两个版本，功能复杂且涉及多个模块（聊天、场景管理、角色管理、剧本系统、信箱、心域连接等）。目前缺乏全面的端到端自动化测试，无法确保：

1. **功能完整性**：所有核心功能在不同环境下正常工作
2. **跨平台一致性**：PC 和 Mobile 版本功能一致性
3. **回归测试**：新功能或修改不会破坏现有功能
4. **用户体验**：关键用户流程的可用性

通过自动化浏览器测试，可以：
- 覆盖主要功能模块
- 验证 PC 和 Mobile 版本的完整功能
- 生成详细的测试报告
- 支持持续集成和回归测试

## What Changes

### 新增测试框架和工具
- **测试框架**: Playwright（推荐）或 Puppeteer
- **测试脚本**: 端到端测试脚本，覆盖主要功能模块
- **测试配置**: 测试环境配置和工具链
- **测试报告**: 自动生成详细的测试报告（HTML、JSON 格式）

### 测试覆盖范围
- **PC 版本** (`http://localhost:3000`):
  - 登录功能（使用 tongyexin/123456）
  - 场景管理（创建、编辑、删除场景）
  - 角色管理（创建、编辑、删除角色）
  - 聊天功能（与角色对话）
  - 剧本系统（创建、编辑、执行剧本）
  - 信箱功能（发送、接收消息）
  - 心域连接（共享、快速连接）
  - 用户设置（配置管理）
  - 其他核心功能

- **Mobile 版本** (`http://localhost:3000/mobile.html`):
  - 登录功能（使用 tongyexin/123456）
  - 移动端适配的功能测试
  - 触摸交互测试
  - 响应式布局测试
  - 移动端特有功能测试

### 测试脚本结构
- 测试用例组织：按功能模块分组
- 测试数据管理：测试账号和测试数据
- 测试工具函数：公共测试工具和辅助函数
- 测试报告生成：详细的测试结果和截图

## Impact

- **Affected specs**: `testing` capability
- **Affected code**:
  - 新增测试脚本目录：`main/frontend/e2e/`
  - 新增测试配置文件：`playwright.config.ts` 或 `puppeteer.config.js`
  - 新增测试报告目录：`main/frontend/e2e/reports/`
  - 更新 `package.json`：添加测试脚本和依赖

- **Breaking changes**: 无

- **Migration notes**:
  - 需要安装测试框架依赖（Playwright 或 Puppeteer）
  - 需要确保测试环境可以访问 `http://localhost:3000`
  - 测试账号（tongyexin/123456）需要存在且可用
