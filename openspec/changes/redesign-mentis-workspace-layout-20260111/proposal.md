# Change: 重新设计 Mentis 工作台布局 - 参考 Manus 三栏布局风格

## Why

当前 Mentis 工作台采用顶部标签页的设计，用户需要在不同功能模块（对话、任务、VM、日志）之间切换。这种设计存在以下问题：

1. **缺乏同时可见性**：用户无法同时查看对话和虚拟机执行情况，需要频繁切换标签页
2. **上下文切换成本高**：在多任务场景下，需要记住不同标签页的状态
3. **信息密度不足**：标签页设计浪费了屏幕空间，无法充分利用宽屏显示器的优势
4. **用户体验不够流畅**：参考 Manus 等现代 AI 工作台的优秀设计，三栏布局（任务列表、对话、执行窗口）能够提供更好的工作流体验

通过参考 Manus 的三栏布局设计，可以：

- **提升信息密度**：左侧任务列表、中间对话、右侧执行窗口同时可见
- **降低上下文切换成本**：用户可以同时查看对话内容和执行结果
- **优化工作流**：符合"查看-执行-反馈"的自然工作流程
- **支持灵活布局**：用户可以关闭或独立查看执行窗口，适应不同工作场景

## What Changes

### 1. 三栏布局设计 (Three-Column Layout)
- **ADDED**: 左侧栏：会话/任务列表（SessionSidebar，保留现有功能）
- **MODIFIED**: 中间栏：对话区域（MentisChatWindow，为主要工作区域）
- **ADDED**: 右侧栏：执行窗口（ExecutionPanel，包含 VM 屏幕、任务状态、执行日志）
- **ADDED**: 布局控制：支持关闭/打开右侧栏，支持独立查看执行窗口

### 2. 执行窗口面板 (Execution Panel)
- **ADDED**: 统一执行窗口组件（ExecutionPanel），整合 VM 屏幕、任务状态、执行日志
- **ADDED**: 执行窗口标签页：VM 屏幕、任务列表、执行日志
- **ADDED**: 执行窗口控制：最小化、最大化、独立窗口、关闭
- **ADDED**: 执行状态指示器：显示当前执行的任务和状态

### 3. 布局响应式设计 (Responsive Layout)
- **MODIFIED**: 桌面端：三栏布局（左侧 300px，中间自适应，右侧 400px）
- **MODIFIED**: 平板端：可折叠侧边栏，两栏布局（对话 + 执行窗口）
- **MODIFIED**: 移动端：单栏布局，通过标签页切换

### 4. 布局状态管理 (Layout State Management)
- **ADDED**: 布局状态持久化（保存用户的布局偏好）
- **ADDED**: 布局快捷键（快速切换侧边栏和执行窗口）
- **ADDED**: 布局预设（紧凑、标准、宽敞）

### 5. 执行窗口独立查看 (Execution Panel Standalone View)
- **ADDED**: 执行窗口独立路由（`/mentis/workspace/:sessionId/execution`）
- **ADDED**: 执行窗口全屏模式
- **ADDED**: 执行窗口弹窗模式（Modal）
- **ADDED**: 执行窗口返回主工作台的功能

## Impact

- **Affected specs**: 新的能力规范（capabilities）
  - `mentis-workspace-three-column-layout` (新增)
  - `mentis-execution-panel` (新增)
  - `mentis-workspace-layout-control` (新增)

- **Affected code**: 
  - 前端：
    - **MODIFIED**: `mentis/frontend/src/components/Workspace.tsx` (重新设计布局结构)
    - **NEW**: `mentis/frontend/src/components/ExecutionPanel.tsx` (执行窗口组件)
    - **NEW**: `mentis/frontend/src/components/ExecutionPanelTabs.tsx` (执行窗口标签页)
    - **NEW**: `mentis/frontend/src/components/LayoutControls.tsx` (布局控制组件)
    - **MODIFIED**: `mentis/frontend/src/components/MentisChatWindow.tsx` (优化为中间栏布局)
    - **MODIFIED**: `mentis/frontend/src/App.tsx` (添加执行窗口独立路由)
  - 后端：
    - 无需后端变更（纯前端布局改进）

- **New dependencies**: 无（使用现有 Material-UI 组件）

- **Breaking changes**: 
  - **MODIFIED**: 工作台 URL 结构（可选，保持兼容）
  - **MODIFIED**: 执行窗口的显示方式（从标签页切换到右侧栏）

## Non-Breaking Changes

此提案主要为前端布局改进，不涉及 API 变更。现有功能将保持不变，只是改变显示方式。用户可以继续使用现有的标签页布局（作为备选方案），或切换到新的三栏布局。
