# Graph 执行状态持久化 - 完成总结

**文档版本**: V1.0  
**编写日期**: 2025-01-02  
**状态**: ✅ 已完成增强

---

## 📋 完成情况

### ✅ 已有基础功能

#### 1. GraphExecution 实体 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/entity/GraphExecution.java`

**功能**:
- 存储Graph执行的状态和结果
- 支持执行状态（RUNNING, PAUSED, WAITING, COMPLETED, FAILED, CANCELLED）
- 存储执行上下文（当前节点、等待信息、步骤数等）
- 序列化存储GraphState和上下文数据

---

#### 2. 执行状态的序列化和反序列化 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/service/GraphExecutionService.java`

**功能**:
- `saveExecution()`: 保存执行记录（序列化状态）
- `restoreExecutionContext()`: 恢复执行上下文（反序列化状态）
- `updateExecution()`: 更新执行记录

---

### ✅ 新增功能

#### 3. 执行历史查询 ✅

**文件**: 
- `backend/src/main/java/com/heartsphere/aiagent/service/GraphExecutionService.java`
- `backend/src/main/java/com/heartsphere/admin/controller/GraphExecutionQueryController.java`
- `backend/src/main/java/com/heartsphere/aiagent/dto/GraphExecutionQueryRequest.java`
- `backend/src/main/java/com/heartsphere/aiagent/dto/GraphExecutionListResponse.java`

**功能**:
- 支持多条件查询（Graph ID、状态、创建者、时间范围）
- 支持分页查询
- 支持按Graph ID查询执行历史
- 提供查询请求和响应DTO

**Repository扩展**:
- `findByConditions()`: 复杂条件查询
- `findByGraphId()`: 分页查询（按Graph ID）
- `findByStatus()`: 分页查询（按状态）
- `findByGraphIdAndStatus()`: 分页查询（按Graph ID和状态）
- `findByCreatedBy()`: 分页查询（按创建者）
- `findByCreatedAtBetween()`: 分页查询（按时间范围）

**API端点**:
- `POST /api/admin/graph/executions/query` - 查询执行历史
- `GET /api/admin/graph/{id}/executions` - 根据Graph ID查询执行历史

---

#### 4. 执行统计功能 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/service/GraphExecutionService.java`

**功能**:
- `getExecutionStatistics()`: 获取执行统计信息
- 支持按Graph ID统计或全局统计
- 统计项：总数、已完成、失败、运行中、等待中

**API端点**:
- `GET /api/admin/graph/executions/statistics?graphId={graphId}` - 获取执行统计信息

**Repository扩展**:
- `countByGraphId()`: 统计指定Graph的执行记录数
- `countByStatus()`: 统计指定状态的执行记录数

---

#### 5. 执行状态清理功能 ✅

**文件**: 
- `backend/src/main/java/com/heartsphere/aiagent/service/GraphExecutionService.java`
- `backend/src/main/java/com/heartsphere/aiagent/repository/GraphExecutionRepository.java`

**功能**:
- `cleanupOldExecutions()`: 清理旧的执行记录
- 删除指定天数之前已完成的执行记录（COMPLETED, FAILED, CANCELLED）
- 返回删除的记录数

**Repository扩展**:
- `deleteByStatusInAndCompletedAtBefore()`: 删除指定状态和时间之前的记录

**API端点**:
- `POST /api/admin/graph/executions/cleanup?daysBefore={daysBefore}` - 清理旧的执行记录

---

## 📊 API 使用示例

### 1. 查询执行历史

```bash
POST /api/admin/graph/executions/query
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "graphId": 1,
  "status": "COMPLETED",
  "startTime": "2025-01-01T00:00:00",
  "endTime": "2025-01-31T23:59:59",
  "page": 0,
  "size": 20
}
```

**响应**:
```json
{
  "executions": [...],
  "total": 100,
  "page": 0,
  "size": 20,
  "totalPages": 5
}
```

### 2. 根据Graph ID查询执行历史

```bash
GET /api/admin/graph/1/executions?page=0&size=20
Authorization: Bearer <admin_token>
```

### 3. 获取执行统计信息

```bash
# 全局统计
GET /api/admin/graph/executions/statistics
Authorization: Bearer <admin_token>

# 指定Graph的统计
GET /api/admin/graph/executions/statistics?graphId=1
Authorization: Bearer <admin_token>
```

**响应**:
```json
{
  "total": 100,
  "completed": 80,
  "failed": 5,
  "running": 10,
  "waiting": 5
}
```

### 4. 清理旧的执行记录

```bash
# 清理30天前的记录
POST /api/admin/graph/executions/cleanup?daysBefore=30
Authorization: Bearer <admin_token>
```

**响应**:
```json
{
  "deletedCount": 50,
  "daysBefore": 30,
  "message": "成功清理了50条执行记录"
}
```

---

## 📁 文件结构

```
backend/src/main/java/com/heartsphere/aiagent/
├── entity/
│   └── GraphExecution.java                          # 执行实体（已存在）✅
├── repository/
│   └── GraphExecutionRepository.java                # Repository（已扩展）✅
├── dto/
│   ├── GraphExecutionDTO.java                       # 执行DTO（已存在）✅
│   ├── GraphExecutionQueryRequest.java              # 查询请求DTO（新增）✅
│   └── GraphExecutionListResponse.java              # 列表响应DTO（新增）✅
└── service/
    └── GraphExecutionService.java                   # 执行服务（已扩展）✅

backend/src/main/java/com/heartsphere/admin/controller/
├── GraphExecutionController.java                    # 执行控制器（已存在）✅
└── GraphExecutionQueryController.java               # 查询控制器（新增）✅
```

---

## 🔄 数据流

### 执行状态保存流程

```
1. EnhancedGraphExecutor执行Graph
   ↓
2. ExecutionContext包含执行状态
   ↓
3. GraphExecutionService.saveExecution()
   ↓
4. 序列化GraphState和上下文数据（JSON）
   ↓
5. 保存到GraphExecution实体
   ↓
6. 持久化到数据库
```

### 执行状态恢复流程

```
1. 从数据库加载GraphExecution
   ↓
2. GraphExecutionService.restoreExecutionContext()
   ↓
3. 反序列化stateJson和contextDataJson
   ↓
4. 重建GraphState和ExecutionContext
   ↓
5. 返回ExecutionContext
   ↓
6. EnhancedGraphExecutor继续执行
```

---

## ⚠️ 注意事项

1. **序列化格式**:
   - 使用Jackson ObjectMapper进行JSON序列化
   - GraphState的数据通过`getData()`获取Map后序列化
   - 确保状态中的数据都可以被序列化（避免循环引用等）

2. **性能考虑**:
   - stateJson使用LONGTEXT类型，可以存储大量数据
   - 建议定期清理旧的执行记录，避免数据库过大
   - 查询时使用分页，避免一次性加载过多数据

3. **清理策略**:
   - 默认清理30天前的已完成/失败/取消的记录
   - 可以配置清理周期（建议通过定时任务定期执行）
   - 只清理已完成状态的记录，保留运行中和等待中的记录

4. **数据完整性**:
   - 执行状态的序列化和反序列化需要保证数据完整性
   - 建议对序列化异常进行处理和日志记录
   - 恢复失败时应该抛出异常，避免继续执行错误的状态

---

## ✅ 完成检查清单

- [x] GraphExecution 实体（已存在）
- [x] 执行状态的序列化和反序列化（已存在）
- [x] 执行历史查询功能
- [x] 执行统计功能
- [x] 执行状态清理功能
- [x] Repository扩展
- [x] Service方法扩展
- [x] Controller扩展
- [x] DTO类
- [x] 文档编写
- [ ] 定时清理任务（可选，可以通过Spring Scheduled Task实现）

---

## ⏭️ 下一步工作

### 可选增强功能

1. **定时清理任务**
   - 使用Spring Scheduled Task定期执行清理
   - 配置清理周期（例如：每天凌晨执行）
   - 配置清理策略（保留天数等）

2. **执行日志记录**
   - 记录每个节点的执行日志
   - 记录执行时间和性能指标
   - 支持日志查询和分析

3. **执行状态压缩**
   - 对于长期存储的执行记录，可以压缩stateJson
   - 减少存储空间占用

---

**文档维护者**: HeartSphere Development Team  
**最后更新**: 2025-01-02
