# 增强管理端记忆提取查询功能 - 设计文档

## Context

当前管理端的记忆管理模块已经集成了 hsmem 服务，支持基本的记忆查询功能。但是，根据 hsmem 记忆系统的三层架构设计，管理员需要能够方便地查看和追溯用户记忆的完整提取过程。

### hsmem 三层架构

1. **Resource Layer（资源层）**: 存储原始多模态数据（对话、文本、文档）
2. **Memory Item Layer（记忆项层）**: 从资源中提取的离散记忆单元
3. **Memory Category Layer（记忆分类层）**: 将相关记忆项聚合成结构化的文本记忆

### 当前实现状态

- ✅ 已有基本的 HSMem 查询功能（在 UserMemoryManagement 组件中）
- ✅ 已有 hsmemApi 客户端服务
- ❌ 缺乏对三层架构的完整展示
- ❌ 缺乏资源→记忆项→分类的追溯能力
- ❌ 缺乏记忆提取统计功能

## Goals

1. **提供完整的记忆提取追溯视图**：让管理员能够查看用户记忆从原始资源到记忆项再到分类的完整流程
2. **增强详情查看功能**：支持查看资源、记忆项、分类的详细信息
3. **提供统计和可视化**：显示用户的记忆提取统计信息
4. **保持与现有功能的兼容性**：不影响现有的记忆查询和测试功能

## Non-Goals

- 不修改 hsmem 服务的后端实现（仅使用现有 API）
- 不实现记忆删除功能（如果 hsmem API 不支持）
- 不实现复杂的图表可视化（优先使用简单的表格和卡片）

## Decisions

### Decision 1: 使用现有 hsmem API

**选择**: 使用现有的 hsmem REST API，通过前端过滤实现按用户ID查询

**理由**:
- hsmem 服务已经提供了完整的 API 接口
- 记忆项和资源都包含 `user_id` 字段，可以在前端进行过滤
- 避免修改后端服务，降低复杂度

**替代方案考虑**:
- 在 hsmem 服务中添加按用户ID查询的专用接口：需要修改后端，增加复杂度
- 在 admin 后端添加包装接口：增加中间层，可能影响性能

### Decision 2: 在 UserMemoryManagement 组件中添加新标签页

**选择**: 在现有的 UserMemoryManagement 组件中添加"记忆提取追溯"标签页

**理由**:
- 与现有的"用户记忆（Admin API）"和"HSMem查询"标签页保持一致
- 复用现有的组件结构和样式
- 用户可以在同一个页面中切换不同的视图

**替代方案考虑**:
- 创建独立的组件：会增加组件数量，但可能更清晰
- 在现有标签页中添加子标签：可能使界面过于复杂

### Decision 3: 使用对话框展示详情

**选择**: 使用 Material-UI 的 Dialog 组件展示资源、记忆项、分类的详情

**理由**:
- 与现有的记忆详情对话框保持一致
- 不占用主页面空间
- 支持嵌套对话框（从资源详情跳转到记忆项详情）

**替代方案考虑**:
- 使用侧边栏（Drawer）：可能更适合展示大量信息，但实现更复杂
- 使用新页面：需要路由管理，增加复杂度

### Decision 4: 前端过滤实现按用户ID查询

**选择**: 先获取所有数据，然后在前端按 `user_id` 过滤

**理由**:
- hsmem API 可能不支持直接按用户ID查询
- 如果数据量不大，前端过滤性能可接受
- 实现简单，不需要修改后端

**替代方案考虑**:
- 如果数据量很大，可以考虑在 hsmem 服务中添加按用户ID查询的接口
- 或者使用分页和过滤参数（如果 API 支持）

## Implementation Approach

### 1. API 客户端扩展

在 `hsmemApi.ts` 中添加以下方法：

```typescript
// 获取所有资源（需要在前端过滤）
getAllResources(): Promise<Resource[]>

// 获取所有记忆项（需要在前端过滤）
getAllMemoryItems(): Promise<MemoryItem[]>

// 获取资源详情（通过资源ID）
getResource(resourceId: string): Promise<Resource>

// 获取记忆项详情（通过记忆项ID）
getMemoryItem(itemId: string): Promise<MemoryItem>

// 获取分类详情（通过分类名称）
getCategory(categoryName: string): Promise<Category>
```

**注意**: 如果 hsmem API 不支持这些接口，需要：
1. 检查现有 API 是否可以通过参数过滤
2. 或者在前端通过现有 API 获取数据后过滤

### 2. 组件结构

```
UserMemoryManagement
├── Tabs
│   ├── Tab 0: 用户记忆（Admin API）
│   ├── Tab 1: HSMem查询
│   └── Tab 2: 记忆提取追溯 (新增)
│       ├── 用户ID输入
│       ├── 查询按钮
│       ├── 统计卡片
│       │   ├── 资源总数
│       │   ├── 记忆项总数
│       │   └── 分类总数
│       ├── 资源列表
│       ├── 记忆项列表
│       └── 分类列表
├── 资源详情对话框
├── 记忆项详情对话框
└── 分类详情对话框
```

### 3. 数据流

```
用户输入用户ID
    │
    ▼
调用 hsmemApi.getAllResources()
调用 hsmemApi.getAllMemoryItems()
调用 hsmemApi.getCategories()
    │
    ▼
前端过滤（按 user_id）
    │
    ▼
组织数据（建立资源→记忆项→分类的关联）
    │
    ▼
显示统计信息
显示资源列表
显示记忆项列表
显示分类列表
```

### 4. 追溯链实现

**数据结构**:
```typescript
interface MemoryExtractionTrace {
  userId: string;
  resources: Resource[];
  memoryItems: MemoryItem[];
  categories: Category[];
  // 关联关系
  resourceToItems: Map<string, string[]>; // resourceId -> itemIds
  itemToCategories: Map<string, string[]>; // itemId -> categoryNames
  categoryToItems: Map<string, string[]>; // categoryName -> itemIds
}
```

**导航实现**:
- 在资源详情中显示关联的记忆项列表（通过 `resourceToItems` 查找）
- 在记忆项详情中显示关联的资源（通过 `resource_id` 字段）和分类（通过 `categories` 字段）
- 在分类详情中显示包含的记忆项列表（通过 `categoryToItems` 查找）

## Risks / Trade-offs

### Risk 1: hsmem API 可能不支持按用户ID查询

**影响**: 需要获取所有数据后在前端过滤，如果数据量很大可能影响性能

**缓解措施**:
- 先检查 hsmem API 是否支持过滤参数
- 如果数据量很大，考虑添加缓存或分页
- 如果性能问题严重，可以在 hsmem 服务中添加专用接口

### Risk 2: 数据量可能很大

**影响**: 一次性加载所有资源、记忆项、分类可能导致页面卡顿

**缓解措施**:
- 使用分页加载
- 添加虚拟滚动（如果列表很长）
- 添加加载状态提示
- 考虑懒加载（只加载当前可见的数据）

### Risk 3: 关联关系可能不完整

**影响**: 如果 hsmem API 返回的数据中缺少关联信息，追溯链可能不完整

**缓解措施**:
- 检查 hsmem API 返回的数据结构
- 确保记忆项包含 `resource_id` 字段
- 确保记忆项包含 `categories` 字段
- 如果缺少，需要调用额外的 API 获取关联信息

## Migration Plan

### Phase 1: API 客户端扩展
1. 检查 hsmem API 是否支持所需接口
2. 在 `hsmemApi.ts` 中添加新的 API 方法
3. 添加类型定义

### Phase 2: 组件功能实现
1. 在 `UserMemoryManagement.tsx` 中添加新标签页
2. 实现用户ID输入和查询功能
3. 实现数据获取和过滤逻辑
4. 实现统计信息展示

### Phase 3: 列表和详情展示
1. 实现资源列表展示
2. 实现记忆项列表展示
3. 实现分类列表展示
4. 实现详情对话框

### Phase 4: 追溯链和导航
1. 实现数据关联关系建立
2. 实现追溯链导航功能
3. 实现详情页面中的跳转功能

### Phase 5: 测试和优化
1. 测试所有功能
2. 优化性能和用户体验
3. 添加错误处理和空状态

## Open Questions

1. ~~**hsmem API 是否支持按用户ID查询？**~~ ✅ **已解决**
   - ✅ 已添加 `GET /api/v1/memory/items?user_id={user_id}` 接口
   - ✅ 已修复检索接口的 `where` 参数过滤逻辑

2. ~~**hsmem API 是否提供获取所有资源的接口？**~~ ✅ **已解决**
   - ✅ 已添加 `GET /api/v1/memory/resources` 接口
   - ✅ 已添加 `GET /api/v1/memory/resources/{resource_id}` 接口

3. ~~**记忆项数据中是否包含完整的关联信息？**~~ ✅ **已确认**
   - ✅ 记忆项包含 `resource_id` 和 `categories` 字段
   - ✅ 分类数据包含 `item_ids` 字段

4. **数据量预估？**
   - 需要了解典型用户会有多少资源、记忆项、分类
   - 这会影响是否需要实现分页或虚拟滚动
   - 当前实现支持获取所有数据，如果数据量大可以后续添加分页

## References

- hsmem 设计文档: `hsmem/DESIGN_ARCHITECTURE.md`
- hsmem API 文档: `http://localhost:8000/docs`
- 现有实现: `admin/frontend/src/components/memory/UserMemoryManagement.tsx`
- 现有 API 客户端: `admin/frontend/src/services/api/hsmem/hsmemApi.ts`
