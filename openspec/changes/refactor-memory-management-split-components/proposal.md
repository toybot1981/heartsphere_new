# Change: 记忆管理页面拆分为多组件（单文件 ≤500 行）

## Why

当前 Admin 前端用户记忆管理页面 `UserMemoryManagement.tsx` 为单文件约 1533 行，包含 6 个 Tab（用户记忆、HSMem 查询、记忆提取追溯、资源管理、记忆项管理、类别管理）及大量共享状态、弹窗与工具函数。单文件过大导致：

- 维护与定位成本高，难以快速理解某一 Tab 或弹窗的边界
- 协作易冲突，多人修改同一文件风险大
- 不利于按 Tab/功能做单元或 E2E 测试隔离
- 与项目约定的前端组件化、单一职责不符

需要对该页面进行分析并拆分为多个组件，**每个组件文件不超过 500 行**，在保持现有功能与交互不变的前提下提升可维护性与可测试性。

## What Changes

- **分析并固化拆分方案**
  - 对 `admin/frontend/src/components/memory/UserMemoryManagement.tsx` 做结构分析，明确 6 个 Tab 面板、共享弹窗、工具函数与状态归属
  - 在 `design.md` 中记录组件边界、文件布局与状态策略（提升到父级 vs 保留在子组件）

- **按 Tab/功能拆分为独立组件**
  - 将「用户记忆（Admin API）」Tab 内容提取为独立组件（如 `UserMemoryTab.tsx`）
  - 将「HSMem 查询」Tab 内容提取为独立组件（如 `HsmemQueryTab.tsx`）
  - 将「记忆提取追溯」Tab 内容提取为独立组件（如 `MemoryTraceTab.tsx`）
  - 将「资源管理（Resource Layer）」Tab 内容提取为独立组件（如 `ResourceLayerTab.tsx`）
  - 将「记忆项管理（Item Layer）」Tab 内容提取为独立组件（如 `ItemLayerTab.tsx`）
  - 将「类别管理（Category Layer）」Tab 内容提取为独立组件（如 `CategoryLayerTab.tsx`）
  - 共享弹窗（记忆详情、HSMem 结果详情、资源详情、类别详情等）可提取为独立组件或保留在容器内，确保单文件 ≤500 行

- **共享逻辑与类型**
  - 工具函数（如 `hsmemItemToUserMemory`）及共享类型移至 `utils` 或 `types`，供各 Tab 组件复用
  - 容器组件 `UserMemoryManagement.tsx` 仅负责 Tabs 布局、activeTab 状态及子组件组合，自身 ≤500 行

- **自动化测试方案（前端页面功能）**
  - 按 project.md 与 AGENTS.md 要求：涉及前端页面功能，须在 tasks 中提供「自动化测试方案」任务
  - 方案由 **web-automation-testing** 技能完成：先对记忆管理模块/功能点做需求分析，再围绕需求编写用例；测试资产存放于 `admin/frontend/e2e/memory-management/`

## Impact

- **受影响规范**：新增能力 `admin-memory-management-ui`（本变更内以 ADDED 形式出现在 `specs/admin-memory-management-ui/spec.md`），约束记忆管理页面以多文件、单文件 ≤500 行方式实现
- **受影响代码**：
  - `admin/frontend/src/components/memory/UserMemoryManagement.tsx` 重构为容器，并新增/迁移至：
    - `admin/frontend/src/components/memory/UserMemoryTab.tsx`（或等价命名）
    - `admin/frontend/src/components/memory/HsmemQueryTab.tsx`
    - `admin/frontend/src/components/memory/MemoryTraceTab.tsx`
    - `admin/frontend/src/components/memory/ResourceLayerTab.tsx`
    - `admin/frontend/src/components/memory/ItemLayerTab.tsx`
    - `admin/frontend/src/components/memory/CategoryLayerTab.tsx`
    - 可选：共享弹窗组件、`memoryUtils.ts` / `memoryTypes.ts` 等
  - 路由或父级引用保持使用 `UserMemoryManagement` 入口，对外行为不变
- **无破坏性**：仅重构文件与组件边界，不改变对外 API、路由或用户可见功能
