# Change: 添加主题/皮肤管理系统

## Why

当前系统采用固定的"科技风格"（Tech Style），使用深色色调（黑色、紫色等），但用户希望有更多选择：

1. **风格单一**: 当前只有一种深色科技风格，无法满足不同用户的审美偏好
2. **缺乏个性化**: 用户无法根据自己的喜好切换界面风格
3. **设计需求**: 根据设计文档，需要新增"海天宁静"（Serene Horizon）风格，采用淡蓝色背景，营造宁静、淡泊、放松的视觉体验
4. **PC和Mobile统一**: 需要确保PC端和移动端都能支持主题切换，保持一致性

## What Changes

- **建立主题/皮肤管理系统**:
  - 创建主题管理基础设施（Theme Provider、Theme Context）
  - 定义主题数据结构（颜色、字体、间距等设计令牌）
  - 实现主题切换功能（用户可选择并保存偏好）
  - 支持主题持久化（本地存储）

- **定义两种主题风格**:
  - **科技风格（Tech Style）**: 当前风格，深色背景（黑色、紫色、靛蓝色），科技感强
  - **海天宁静（Serene Horizon）**: 新风格，淡蓝色背景，宁静、淡泊、放松的视觉体验

- **PC端主题适配**:
  - 更新PC端组件以支持主题系统
  - 使用CSS变量和Tailwind配置实现主题切换
  - 确保所有PC端页面正确应用主题

- **移动端主题适配**:
  - 更新移动端组件以支持主题系统
  - 根据设计文档实现"海天宁静"风格的移动端UI
  - 确保移动端页面正确应用主题

- **用户设置界面**:
  - 在设置页面添加主题选择器
  - PC端和移动端都提供主题切换入口

## Impact

- **影响的文件**:
  - `main/frontend/src/tokens.css` - 重构为支持多主题的CSS变量系统
  - `main/frontend/tailwind.config.js` - 添加主题配置
  - `main/frontend/mobile/components/MobileStyleGuide.ts` - 更新为支持主题系统
  - `main/frontend/components/SettingsModal.tsx` - 添加主题选择器
  - `main/frontend/mobile/components/modals/MobileSettingsModal.tsx` - 添加主题选择器
  - 所有使用硬编码颜色的组件需要迁移到主题系统

- **影响的规范**:
  - 新增主题管理规范，定义主题结构和切换机制
  - 更新UX设计规范，说明主题系统的使用方式

- **影响的工作流**:
  - 前端开发人员需要使用主题系统而非硬编码颜色
  - 新组件开发必须支持主题切换
  - 代码审查需要检查主题兼容性

## Notes

- 主题系统将使用CSS变量（CSS Custom Properties）实现，确保运行时切换性能
- 主题数据将存储在用户本地（localStorage），不依赖后端
- "海天宁静"风格的设计参考：`docs/17-UI模式/心域 (heartsphere.cn) 移动端 UI 重设计方案报告.md`
- 保持向后兼容：
  - 默认使用"科技风格"，确保现有用户不受影响
  - 兼容现有的`[data-theme="dark"]`，映射到`[data-theme="tech"]`
  - 保留现有CSS变量命名，确保现有组件继续工作
- 主题切换应该是即时的，无需刷新页面
- 主题切换包含平滑过渡动画（200-300ms）
- 主题ID使用kebab-case命名规范（`tech`, `serene-horizon`）
- 迁移策略：分阶段迁移，优先基础组件，再迁移页面组件
- Tailwind集成：采用混合方案，减少Tailwind颜色类使用，改用CSS变量
