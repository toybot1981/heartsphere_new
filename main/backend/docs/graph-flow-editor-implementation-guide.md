# Graph 流程编辑器实现指南

**文档版本**: V1.0  
**编写日期**: 2025-01-01  
**状态**: 后端API已完成，前端待实现

---

## 已完成工作

### 后端部分 ✅

1. **数据库实体**
   - `GraphDefinition` - Graph定义实体
   - `GraphNodeEntity` - Graph节点实体
   - `GraphEdgeEntity` - Graph边实体

2. **Repository**
   - `GraphDefinitionRepository`
   - `GraphNodeRepository`
   - `GraphEdgeRepository`

3. **DTO**
   - `GraphDefinitionDTO`
   - `GraphNodeDTO`
   - `GraphEdgeDTO`
   - `GraphDefinitionCreateRequest`

4. **Service**
   - `GraphDefinitionService` - 完整的CRUD操作

5. **Controller**
   - `AdminGraphController` - RESTful API接口

6. **数据库迁移脚本**
   - `create_graph_tables.sql`

### API接口

#### 1. 获取所有Graph定义
```
GET /api/admin/graph
Headers: Authorization: Bearer <token>
Response: List<GraphDefinitionDTO>
```

#### 2. 根据ID获取Graph定义（包含节点和边）
```
GET /api/admin/graph/{id}
Headers: Authorization: Bearer <token>
Response: GraphDefinitionDTO
```

#### 3. 创建Graph定义
```
POST /api/admin/graph
Headers: Authorization: Bearer <token>
Body: GraphDefinitionCreateRequest
Response: GraphDefinitionDTO
```

#### 4. 更新Graph定义
```
PUT /api/admin/graph/{id}
Headers: Authorization: Bearer <token>
Body: GraphDefinitionCreateRequest
Response: GraphDefinitionDTO
```

#### 5. 删除Graph定义
```
DELETE /api/admin/graph/{id}
Headers: Authorization: Bearer <token>
Response: 204 No Content
```

---

## 待实现工作

### 前端部分 ⏳

#### 1. 安装依赖

需要安装 React Flow 库（用于流程编辑器）：

```bash
cd frontend
npm install reactflow
```

#### 2. API Service

在 `frontend/services/api.ts` 中添加 Graph API：

```typescript
export const adminApi = {
  // ... 现有API
  graph: {
    getAll: (token: string) => fetch('/api/admin/graph', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
    
    getById: (id: number, token: string) => fetch(`/api/admin/graph/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()),
    
    create: (data: any, token: string) => fetch('/api/admin/graph', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    
    update: (id: number, data: any, token: string) => fetch(`/api/admin/graph/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    
    delete: (id: number, token: string) => fetch(`/api/admin/graph/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.status === 204 ? null : res.json()),
  }
};
```

#### 3. 创建 Graph 管理组件

创建 `frontend/admin/components/GraphManagement.tsx`：

主要功能：
- Graph列表展示
- 创建新Graph
- 编辑Graph
- 删除Graph
- 打开流程编辑器

#### 4. 创建流程编辑器组件

创建 `frontend/admin/components/GraphFlowEditor.tsx`：

主要功能：
- 使用 React Flow 进行可视化编辑
- 节点拖拽和连接
- 节点属性编辑
- 保存Graph定义

核心功能点：

1. **节点类型**
   - StartNode（开始节点）
   - DialogueNode（对话节点）
   - ChoiceNode（选择节点）
   - ConditionNode（条件节点）
   - SkillCheckNode（技能检查节点）
   - StateChangeNode（状态变更节点）
   - WaitNode（等待节点）
   - EndNode（结束节点）

2. **节点配置面板**
   - 根据节点类型显示不同的配置表单
   - 实时预览配置

3. **连线管理**
   - 拖拽创建连线
   - 条件边的配置（true/false分支）

4. **布局管理**
   - 自动布局
   - 手动拖拽调整位置

#### 5. 集成到 Admin 端

在 `frontend/admin/AdminScreen.tsx` 中添加：

```typescript
import { GraphManagement } from './components/GraphManagement';

// 在 render 部分添加
case 'graph':
  return <GraphManagement 
    adminToken={adminToken}
    onReload={loadSystemData}
  />;
```

在 `frontend/admin/components/AdminSidebar.tsx` 中添加菜单项：

```typescript
{
  id: 'graph',
  label: 'Graph流程编辑器',
  icon: '📊'
}
```

---

## 实现建议

### 阶段1：基础功能（1-2天）

1. ✅ 完成后端API（已完成）
2. ⏳ 创建Graph列表和基本CRUD组件
3. ⏳ 集成到Admin端

### 阶段2：流程编辑器（3-5天）

1. ⏳ 安装React Flow
2. ⏳ 实现基本的节点展示和拖拽
3. ⏳ 实现节点连接
4. ⏳ 实现节点属性编辑面板

### 阶段3：高级功能（2-3天）

1. ⏳ 实现节点类型特定的配置表单
2. ⏳ 实现条件边的配置
3. ⏳ 实现自动布局
4. ⏳ 实现Graph验证

---

## 技术栈

- **后端**: Spring Boot, JPA, MySQL
- **前端**: React, TypeScript, React Flow
- **API**: RESTful API

---

## 参考资源

1. React Flow 官方文档: https://reactflow.dev/
2. React Flow 示例: https://reactflow.dev/examples/
3. 现有组件参考: `frontend/admin/components/ScenariosManagement.tsx`

---

**维护者**: HeartSphere Development Team  
**最后更新**: 2025-01-01
