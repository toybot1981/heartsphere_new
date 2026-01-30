# Change: 添加管理后台多标签页支持

## Why

当前管理后台采用单页面模式，一次只能打开一个功能模块。管理人员在处理多个任务时（例如：同时查看用户信息和记忆数据，或者对比不同模块的数据），需要频繁切换功能模块，降低了工作效率。

通过引入多标签页（tabs）功能，管理人员可以：
- 同时打开多个功能模块，在不同标签页中查看
- 快速在多个任务之间切换，无需重新加载数据
- 主动关闭不需要的标签页，保持工作区整洁
- 提升多任务处理效率

## What Changes

- **ADDED**: 多标签页容器组件，支持同时显示多个功能模块
- **ADDED**: 标签页管理功能（打开、切换、关闭）
- **ADDED**: 标签页状态持久化（刷新后恢复已打开的标签页）
- **MODIFIED**: `AdminScreen` 组件从单页面模式改为多标签页模式
- **MODIFIED**: `AdminStateContext` 扩展以支持多标签页状态管理
- **MODIFIED**: 导航逻辑，点击侧边栏菜单项时在新标签页打开（如果已存在则切换到该标签页）

## Impact

- **Affected specs**: `admin-panel` (新增能力)
- **Affected code**: 
  - `admin/frontend/src/AdminScreen.tsx` - 主容器改造
  - `admin/frontend/src/contexts/AdminStateContext.tsx` - 状态管理扩展
  - `admin/frontend/src/components/AdminSidebar.tsx` - 导航逻辑调整
  - 新增组件：`admin/frontend/src/components/AdminTabContainer.tsx`
  - 新增组件：`admin/frontend/src/components/AdminTabBar.tsx`
- **Breaking changes**: 无（向后兼容，默认行为保持不变）
