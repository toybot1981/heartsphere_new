# Design: 管理后台多标签页系统

## Context

当前管理后台采用单页面模式，使用 `AdminStateContext` 的 `activeSection` 来控制当前显示的功能模块。管理人员需要频繁切换功能模块来完成多任务处理。

## Goals / Non-Goals

### Goals
- 支持同时打开多个功能模块，每个模块在独立的标签页中显示
- 管理人员可以主动关闭标签页
- 标签页状态在页面刷新后能够恢复
- 保持现有功能模块的独立性和状态管理

### Non-Goals
- 不实现标签页之间的数据共享（每个标签页独立运行）
- 不实现标签页的跨窗口拖拽
- 不实现标签页的会话恢复（仅恢复标签页列表，不恢复数据状态）

## Decisions

### Decision 1: 标签页状态管理
**选择**: 在 `AdminStateContext` 中扩展状态管理，使用数组存储打开的标签页列表

**理由**:
- 与现有的状态管理模式一致
- 便于全局访问和更新
- 支持状态持久化

**实现**:
```typescript
interface TabInfo {
  id: string;              // 唯一标识（如：section + timestamp）
  section: SectionType;     // 功能模块类型
  title: string;           // 标签页标题
  icon?: string;           // 图标（可选）
  timestamp: number;        // 打开时间戳
}

interface AdminStateContextType {
  // ... 现有字段
  openTabs: TabInfo[];      // 打开的标签页列表
  activeTabId: string | null;  // 当前活动标签页ID
  openTab: (section: SectionType) => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
}
```

### Decision 2: 标签页内容渲染策略
**选择**: 使用条件渲染，只渲染活动标签页的内容，其他标签页保持挂载但不渲染

**理由**:
- 避免不必要的组件重新挂载
- 保持标签页的状态（如表单数据、滚动位置）
- 性能开销可控

**替代方案考虑**:
- **完全卸载**: 每次切换都卸载组件，节省内存但会丢失状态
- **全部渲染**: 所有标签页同时渲染，内存占用大

### Decision 3: 状态持久化
**选择**: 使用 `localStorage` 存储标签页列表，页面刷新后恢复

**理由**:
- 简单可靠
- 无需后端支持
- 符合用户期望

**存储内容**:
- 标签页列表（section, title, timestamp）
- 当前活动标签页ID

**不存储**:
- 标签页内的表单数据（避免数据泄露风险）
- 复杂的状态数据（避免存储过大）

### Decision 4: 导航行为
**选择**: 点击侧边栏菜单项时，如果该功能模块已打开，则切换到对应标签页；否则打开新标签页

**理由**:
- 符合用户直觉
- 避免重复打开相同功能模块
- 提升用户体验

**实现逻辑**:
```typescript
const handleSectionClick = (section: SectionType) => {
  const existingTab = openTabs.find(tab => tab.section === section);
  if (existingTab) {
    switchTab(existingTab.id);
  } else {
    openTab(section);
  }
};
```

### Decision 5: 标签页ID生成
**选择**: 使用 `section + timestamp` 作为唯一标识

**理由**:
- 简单可靠
- 支持同一功能模块打开多个实例（如果需要）
- 便于调试

**格式**: `{section}-{timestamp}`，例如：`users-1705891200000`

## Risks / Trade-offs

### Risk 1: 内存占用增加
**风险**: 多个标签页同时挂载可能导致内存占用增加

**缓解措施**:
- 实现标签页数量限制（例如：最多10个）
- 使用 React.memo 优化组件渲染
- 监控内存使用情况

### Risk 2: 状态管理复杂度增加
**风险**: 多标签页状态管理可能增加代码复杂度

**缓解措施**:
- 保持状态管理逻辑集中
- 使用 TypeScript 类型约束
- 编写清晰的文档和注释

### Risk 3: 性能影响
**风险**: 多个标签页可能影响页面性能

**缓解措施**:
- 只渲染活动标签页的内容
- 使用懒加载和代码分割
- 定期进行性能测试

## Migration Plan

### Phase 1: 基础功能实现
1. 扩展 `AdminStateContext` 添加标签页状态管理
2. 创建 `AdminTabContainer` 和 `AdminTabBar` 组件
3. 修改 `AdminScreen` 使用标签页容器

### Phase 2: 导航集成
1. 修改 `AdminSidebar` 的点击处理逻辑
2. 实现智能标签页管理（检查是否已打开）

### Phase 3: 状态持久化
1. 实现标签页状态的 localStorage 存储
2. 实现页面刷新后的状态恢复

### Phase 4: 用户体验优化
1. 添加标签页关闭按钮
2. 添加"关闭其他"和"关闭所有"功能
3. 优化标签页样式和交互

### Rollback Plan
如果出现问题，可以通过功能开关禁用多标签页功能，回退到单页面模式。

## Open Questions

1. **是否需要支持同一功能模块打开多个实例？**
   - 当前设计支持（通过不同的 timestamp）
   - 但可能需要限制，避免资源浪费

2. **标签页数量限制应该是多少？**
   - 建议：10个标签页
   - 需要根据实际使用情况调整

3. **是否需要标签页的拖拽排序？**
   - 当前设计为可选功能
   - 可以后续根据用户反馈添加
