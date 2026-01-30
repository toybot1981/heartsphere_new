## 1. 分析与准备

- [x] 1.1 对 `admin/frontend/src/components/memory/UserMemoryManagement.tsx` 做结构分析：标注 6 个 Tab 的起止行、共享 Dialog 与工具函数位置，产出与 design.md 一致的组件映射（可写在 design 或单独分析文档）
- [x] 1.2 抽取共享工具函数（如 `hsmemItemToUserMemory`）至 `admin/frontend/src/components/memory/utils/` 或 `memoryUtils.ts`，并在原文件中改为引用，确认构建与页面正常

## 2. 按 Tab 拆分为独立组件

- [x] 2.1 抽取 Tab 0「用户记忆（Admin API）」为 `UserMemoryTab.tsx`，状态与 handler 迁入该组件，容器中改为按 `activeTab === 0` 渲染 `<UserMemoryTab ... />`，单文件 ≤500 行
- [x] 2.2 抽取 Tab 1「HSMem 查询」为 `HsmemQueryTab.tsx`，同上约束
- [x] 2.3 抽取 Tab 2「记忆提取追溯」为 `MemoryTraceTab.tsx`，同上约束
- [x] 2.4 抽取 Tab 3「资源管理（Resource Layer）」为 `ResourceLayerTab.tsx`，同上约束
- [x] 2.5 抽取 Tab 4「记忆项管理（Item Layer）」为 `ItemLayerTab.tsx`，同上约束
- [x] 2.6 抽取 Tab 5「类别管理（Category Layer）」为 `CategoryLayerTab.tsx`，同上约束
- [x] 2.7 精简容器 `UserMemoryManagement.tsx`：仅保留 Tabs、activeTab、MUIProvider 与各 Tab 组件组合，确保容器自身 ≤500 行；按需更新 `components/memory/index.ts` 导出

## 3. 验证与收尾

- [x] 3.1 本地运行 Admin 前端，逐一点击 6 个 Tab，确认展示与交互与拆分前一致（检索、列表、弹窗、筛选等）
- [x] 3.2 使用 `wc -l` 或 CI 检查所有涉及文件行数，确保每个组件文件 ≤500 行；若某文件超限，按 design 再拆子组件直至满足

## 4. 自动化测试方案（前端页面功能）

- [x] 4.1 使用 **web-automation-testing** 技能对「记忆管理」模块/功能点进行需求分析，并围绕需求编写 E2E 测试用例；测试方案资产（如 test_plan.json、README、报告等）存放于 `admin/frontend/e2e/memory-management/`，遵循测试覆盖原则：先核心路径，再按功能点扩展用例，失败交 Agent 修复后继续直至模块功能全覆盖
