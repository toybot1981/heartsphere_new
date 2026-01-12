# Graph 执行 API - 完成总结

**文档版本**: V1.0  
**编写日期**: 2025-01-02  
**状态**: ✅ 已完成

---

## 📋 完成情况

### ✅ 已完成功能

#### 1. GraphExecution 实体 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/entity/GraphExecution.java`

**功能**:
- 存储Graph执行的状态和结果
- 支持执行状态（RUNNING, PAUSED, WAITING, COMPLETED, FAILED, CANCELLED）
- 存储执行上下文（当前节点、等待信息、步骤数等）
- 序列化存储GraphState和上下文数据

**字段**:
- `executionId` - 执行ID（UUID，唯一）
- `graphId` - Graph定义ID
- `status` - 执行状态
- `currentNodeId` - 当前执行的节点ID
- `waitType` - 等待类型（CHOICE, WAIT, NONE）
- `waitingNodeId` - 等待中的节点ID
- `stepCount` - 执行步骤数
- `stateJson` - GraphState的JSON序列化
- `contextDataJson` - 执行上下文数据的JSON序列化
- `errorMessage` - 错误信息
- `createdBy` - 创建者ID
- `completedAt` - 完成时间

---

#### 2. GraphExecutionRepository ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/repository/GraphExecutionRepository.java`

**功能**:
- 提供执行记录的CRUD操作
- 支持按执行ID、Graph ID、状态查询

**方法**:
- `findByExecutionId(String executionId)` - 根据执行ID查找
- `findByGraphId(Long graphId)` - 根据Graph ID查找所有执行记录
- `findByStatus(String status)` - 根据状态查找执行记录
- `findByGraphIdAndStatus(Long graphId, String status)` - 根据Graph ID和状态查找

---

#### 3. DTO 类 ✅

**文件**:
- `backend/src/main/java/com/heartsphere/aiagent/dto/GraphExecutionDTO.java`
- `backend/src/main/java/com/heartsphere/aiagent/dto/GraphExecutionRequest.java`
- `backend/src/main/java/com/heartsphere/aiagent/dto/GraphExecutionChoiceRequest.java`

**功能**:
- `GraphExecutionDTO` - 执行记录的DTO，包含反序列化的状态数据
- `GraphExecutionRequest` - 执行请求DTO，包含初始状态数据
- `GraphExecutionChoiceRequest` - 用户选择请求DTO，包含选项ID

---

#### 4. GraphExecutionService ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/service/GraphExecutionService.java`

**功能**:
- 执行Graph的业务逻辑
- 执行状态管理
- 执行上下文的序列化和反序列化
- Graph定义到执行引擎的转换

**主要方法**:
- `executeGraph(Long graphId, GraphExecutionRequest request, Long adminId)` - 执行Graph
- `getExecutionStatus(Long graphId, String executionId)` - 获取执行状态
- `continueExecution(Long graphId, String executionId, Long adminId)` - 继续执行（用于WaitNode）
- `makeChoice(Long graphId, String executionId, GraphExecutionChoiceRequest choiceRequest, Long adminId)` - 用户选择（用于ChoiceNode）

**核心逻辑**:
1. 从数据库加载Graph定义（GraphDefinitionDTO）
2. 转换为GraphEngine.GraphDefinition（使用NodeFactory创建节点）
3. 创建初始状态（GraphState）
4. 使用EnhancedGraphExecutor执行
5. 保存执行记录到数据库（序列化状态）
6. 支持继续执行和用户选择（反序列化状态，继续执行，更新记录）

---

#### 5. GraphExecutionController ✅

**文件**: `backend/src/main/java/com/heartsphere/admin/controller/GraphExecutionController.java`

**功能**:
- 提供Graph执行的REST API接口
- 管理员认证验证

**API端点**:

1. **POST /api/admin/graph/{id}/execute**
   - 执行Graph
   - 请求体: `GraphExecutionRequest`（可选，包含初始状态）
   - 返回: `GraphExecutionDTO`

2. **GET /api/admin/graph/{id}/execution/{executionId}**
   - 获取执行状态
   - 返回: `GraphExecutionDTO`

3. **POST /api/admin/graph/{id}/execution/{executionId}/continue**
   - 继续执行（用于WaitNode）
   - 返回: `GraphExecutionDTO`

4. **POST /api/admin/graph/{id}/execution/{executionId}/choice**
   - 用户选择（用于ChoiceNode）
   - 请求体: `GraphExecutionChoiceRequest`（包含选项ID）
   - 返回: `GraphExecutionDTO`

---

#### 6. 数据库迁移脚本 ✅

**文件**: `backend/src/main/resources/db/migration/V20250102001__create_graph_executions_table.sql`

**功能**:
- 创建`graph_executions`表
- 包含所有必要的字段和索引
- 外键关联到`graph_definitions`表

---

## 🔄 执行流程

### 基本执行流程

```
1. POST /api/admin/graph/{id}/execute
   ↓
2. GraphExecutionService.executeGraph()
   ↓
3. 加载GraphDefinitionDTO
   ↓
4. 转换为GraphEngine.GraphDefinition（使用NodeFactory）
   ↓
5. 创建初始状态（GraphState）
   ↓
6. EnhancedGraphExecutor.start()
   ↓
7. 执行节点，直到遇到等待或完成
   ↓
8. 保存执行记录（序列化状态）
   ↓
9. 返回GraphExecutionDTO
```

### ChoiceNode 执行流程

```
1. 执行到ChoiceNode
   ↓
2. EnhancedGraphExecutor检测到等待（WAITING, CHOICE）
   ↓
3. 保存执行记录
   ↓
4. 返回执行状态（WAITING）
   ↓
5. 前端展示选项给用户
   ↓
6. POST /api/admin/graph/{id}/execution/{executionId}/choice
   ↓
7. GraphExecutionService.makeChoice()
   ↓
8. 恢复执行上下文（反序列化）
   ↓
9. EnhancedGraphExecutor.setUserChoice()
   ↓
10. ChoiceNode.handleChoice() 应用效果
   ↓
11. 继续执行下一个节点
   ↓
12. 更新执行记录
```

### WaitNode 执行流程

```
1. 执行到WaitNode
   ↓
2. WaitNode.checkWaitCondition() 检查条件
   ↓
3. 如果条件不满足，EnhancedGraphExecutor设置等待（WAITING, WAIT）
   ↓
4. 保存执行记录
   ↓
5. 返回执行状态（WAITING）
   ↓
6. 外部系统等待条件满足
   ↓
7. POST /api/admin/graph/{id}/execution/{executionId}/continue
   ↓
8. GraphExecutionService.continueExecution()
   ↓
9. 恢复执行上下文（反序列化）
   ↓
10. EnhancedGraphExecutor.continueExecution()
   ↓
11. 继续执行下一个节点
   ↓
12. 更新执行记录
```

---

## 📊 API 使用示例

### 1. 执行Graph

```bash
POST /api/admin/graph/1/execute
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "initialState": {
    "character_favorability": {
      "character_1": 50
    },
    "character_skills": {
      "skill_1": 30
    }
  }
}
```

**响应**:
```json
{
  "id": 1,
  "executionId": "550e8400-e29b-41d4-a716-446655440000",
  "graphId": 1,
  "status": "WAITING",
  "currentNodeId": "choice_1",
  "waitType": "CHOICE",
  "waitingNodeId": "choice_1",
  "stepCount": 2,
  "state": { ... },
  "contextData": { ... }
}
```

### 2. 获取执行状态

```bash
GET /api/admin/graph/1/execution/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <admin_token>
```

### 3. 用户选择

```bash
POST /api/admin/graph/1/execution/550e8400-e29b-41d4-a716-446655440000/choice
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "optionId": "option_1"
}
```

### 4. 继续执行

```bash
POST /api/admin/graph/1/execution/550e8400-e29b-41d4-a716-446655440000/continue
Authorization: Bearer <admin_token>
```

---

## 📁 文件结构

```
backend/src/main/java/com/heartsphere/aiagent/
├── entity/
│   └── GraphExecution.java                  # 执行实体
├── repository/
│   └── GraphExecutionRepository.java        # 执行Repository
├── dto/
│   ├── GraphExecutionDTO.java               # 执行DTO
│   ├── GraphExecutionRequest.java           # 执行请求DTO
│   └── GraphExecutionChoiceRequest.java     # 选择请求DTO
└── service/
    └── GraphExecutionService.java           # 执行服务

backend/src/main/java/com/heartsphere/admin/controller/
└── GraphExecutionController.java            # 执行控制器

backend/src/main/resources/db/migration/
└── V20250102001__create_graph_executions_table.sql  # 数据库迁移脚本
```

---

## ✅ 完成检查清单

- [x] GraphExecution 实体
- [x] GraphExecutionRepository
- [x] DTO 类（GraphExecutionDTO, GraphExecutionRequest, GraphExecutionChoiceRequest）
- [x] GraphExecutionService（执行逻辑）
- [x] GraphExecutionController（REST API）
- [x] 数据库迁移脚本
- [x] 代码编译通过
- [x] 文档编写
- [ ] API 测试（可选，下一阶段）

---

## ⏭️ 下一步工作

### 可选增强功能

1. **执行日志记录**
   - 记录每个节点的执行日志
   - 记录执行时间和性能指标

2. **执行历史查询**
   - 查询某个Graph的所有执行记录
   - 按状态、时间范围过滤

3. **执行管理**
   - 暂停/恢复执行
   - 取消执行
   - 删除执行记录

4. **执行统计**
   - 执行成功率
   - 平均执行时间
   - 节点执行次数统计

---

**文档维护者**: HeartSphere Development Team  
**最后更新**: 2025-01-02
