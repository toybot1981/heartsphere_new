# Design: 记忆管理页面拆分

## Context

- **现状**：`admin/frontend/src/components/memory/UserMemoryManagement.tsx` 约 1533 行，内含 6 个 Tab、多个 Dialog、大量 useState 与 handler，单文件难以维护与测试。
- **约束**：每个组件文件 ≤500 行；不改变对外路由与功能；遵循 project.md 前端组件化与单一职责。
- **利益相关**：Admin 前端开发、后续 E2E/回归测试。

## Goals / Non-Goals

- **Goals**
  - 按 Tab 与共享能力拆分为多个文件，单文件 ≤500 行
  - 明确组件边界与状态归属，便于维护与测试
  - 保持现有 UI 与交互不变
- **Non-Goals**
  - 不改变业务逻辑或 API 调用方式
  - 不在本变更内重写 HSMem/Admin 记忆 API

## Decisions

### 1. 组件边界与文件布局

| 文件 | 职责 | 行数上限 | 说明 |
|------|------|----------|------|
| `UserMemoryManagement.tsx` | 容器：Tabs、activeTab、组合子组件、MUIProvider | ≤500 | 仅布局与路由级状态 |
| `UserMemoryTab.tsx` | Tab 0：用户记忆（Admin API）— 检索、用户列表、记忆列表、记忆详情弹窗 | ≤500 | 可含该 Tab 内 Dialog |
| `HsmemQueryTab.tsx` | Tab 1：HSMem 查询 — 查询表单、结果列表、结果详情弹窗 | ≤500 | 同上 |
| `MemoryTraceTab.tsx` | Tab 2：记忆提取追溯 — 用户ID、三层数据与详情弹窗 | ≤500 | 同上 |
| `ResourceLayerTab.tsx` | Tab 3：资源管理 — 筛选、列表、资源详情弹窗 | ≤500 | 同上 |
| `ItemLayerTab.tsx` | Tab 4：记忆项管理 — 筛选、列表、项详情 | ≤500 | 同上 |
| `CategoryLayerTab.tsx` | Tab 5：类别管理 — 类别列表/卡片、类别详情弹窗 | ≤500 | 同上 |
| `memoryUtils.ts` 或 `memory/utils.ts` | `hsmemItemToUserMemory` 等纯函数 | 按需 | 可放 `components/memory/` 下 |
| 可选 `memoryTypes.ts` | 仅类型时可与现有 api 类型复用，不强制新文件 | 按需 | 若类型已分布在 api 层可不再抽 |

- **Dialog 归属**：每个 Tab 内使用的 Dialog 随该 Tab 组件一起移动（如记忆详情在 UserMemoryTab，HSMem 结果详情在 HsmemQueryTab），避免单文件膨胀；若某弹窗被多 Tab 复用，可提取为共享组件（如 `MemoryDetailDialog.tsx`）并控制在 ≤500 行内。

### 2. 状态策略

- **容器持有**：`activeTab`、与路由/上下文相关的 `adminToken`、以及从 `useAdminState` 来的 `selectedUserId`/`setSelectedUserId`（若需在多个 Tab 间共享）保留在 `UserMemoryManagement` 或现有 Context。
- **Tab 内部状态**：各 Tab 自身用到的 loading、list、filter、selectedItem、dialogOpen 等由对应 Tab 组件内部 useState 管理，通过 props 向子组件传递回调（如 onViewDetail）即可；无需为拆分而全局提升所有状态。
- **跨 Tab 共享**：若确有少量状态需跨 Tab（例如“当前选中的用户ID”在 Tab0 与 Tab1 都要用），由容器通过 props 或 Context 下传，不在各 Tab 内重复请求同一数据。

### 3. 与现有目录的配合

- 现有 `admin/frontend/src/components/memory/` 下已有 `MemoryDashboard.tsx`、`MemoryManagement.tsx` 等；本次拆分仅动 `UserMemoryManagement.tsx` 及其衍生出的新 Tab 组件与 utils，不改变其他 memory 组件或 `index.ts` 的导出方式，除非为统一导出新 Tab 而扩展 `index.ts`。

### 4. 500 行上限的落地

- 每个新建或拆分后的 `.tsx`/`.ts` 文件在 MR/PR 中检查行数（如 `wc -l` 或 CI）；若某 Tab 内容拆后仍超 500 行，可再拆为该 Tab 下的子组件（如 `UserMemoryTab` 内再拆 `UserMemoryList.tsx`、`MemoryDetailDialog.tsx`），直至满足 ≤500 行。

## Risks / Trade-offs

- **风险**：拆分后 props 层级变多，初次阅读需在容器与 Tab 间跳转。  
  **缓解**：在 design.md 与各文件顶部注释中写明该组件的职责与主要 props，并保持 Tab 组件命名与路由/菜单一致。
- **取舍**：不在此变更中引入新的状态库（如 Redux）；仍以 React 本地状态 + 现有 Context 为主，以减小改动面。

## Migration Plan

1. **分析阶段**：基于当前 `UserMemoryManagement.tsx` 做一次行号/区块标注（哪些行属于哪个 Tab、哪些属于共享弹窗/工具），产出与 design 一致的映射表（可写在 design 或 tasks 的第一次任务里）。
2. **抽取顺序**：先抽 utils/types，再按 Tab 0 → Tab 5 顺序逐个抽取为独立文件，并在容器中改为引入对应 Tab 组件、按 `activeTab` 渲染；每步提交保证页面可运行、无功能回退。
3. **回归**：依赖现有手动验证 + 本变更任务中安排的「自动化测试方案」（web-automation-testing）对记忆管理模块做需求分析与用例编写，测试资产落于 `admin/frontend/e2e/memory-management/`，用于后续回归。
4. **回滚**：若需回滚，恢复单文件 `UserMemoryManagement.tsx` 至拆分前版本即可；无数据或 API 变更。

## Open Questions

- 无；若实施中发现某 Tab 内 Dialog 与列表强耦合难以单拆，可优先保证该 Tab 文件 ≤500 行，必要时将该 Tab 再拆为“列表组件 + 弹窗组件”两个文件。
