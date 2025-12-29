# ai_models 表使用情况分析

## 当前使用情况

`ai_models` 表**仍然在使用中**，主要用于以下场景：

### 1. **使用记录关联**（核心用途）
- `ai_usage_records.model_id` → `ai_models.id`
- 每条使用记录都需要关联到一个 `ai_models` 记录

### 2. **后端服务使用**

#### AIBillingAspect（计费拦截器）
```java
// 查找或创建 ai_models 记录
Long billingModelId = modelLookupService.findModelId(provider, modelCode);
// 使用 billingModelId 记录使用情况
usageRecordService.recordUsage(..., billingModelId, ...);
```

#### AIModelLookupService
- 负责查找和自动创建 `ai_models` 记录
- 当统一路由选择模型后，如果 `ai_models` 中不存在，会自动创建

#### 其他服务
- `BillingMonitorService` - 监控服务使用
- `QuotaCalculationService` - 配额计算
- `BillingInitializationService` - 初始化数据

### 3. **前端使用**

#### PricingManagement.tsx（定价管理）
```typescript
// 从计费系统获取模型列表（用于显示）
billingApi.models.getAll(adminToken)
```

#### UsageRecordsView.tsx（使用记录视图）
```typescript
// 获取模型列表，用于展示使用记录的模型信息
billingApi.models.getAll(adminToken)
```

#### CostStatisticsView.tsx（成本统计视图）
```typescript
// 获取模型列表，用于统计展示
billingApi.models.getAll(adminToken)
```

## 是否可以移除？

### 理论上的可能性

**可以移除**，但需要大量的重构工作：

1. **数据库迁移**
   - 将 `ai_usage_records.model_id` 改为指向 `ai_model_config.id`
   - 迁移现有的使用记录数据

2. **代码重构**
   - 修改 `AIUsageRecord.model_id` 的关联关系
   - 修改 `AIBillingAspect` 中的逻辑，使用 `ai_model_config.id` 替代 `ai_models.id`
   - 移除 `AIModelLookupService` 中的模型创建逻辑
   - 移除 `AIModelRepository` 和相关服务

3. **前端调整**
   - 修改前端获取模型列表的API调用，改为从 `ai_model_config` 获取
   - 更新使用记录展示逻辑

### 当前设计的合理性

**保留 `ai_models` 表有一定合理性**：

1. **职责分离**
   - `ai_model_config` - 管理配置（API Key、Base URL等）
   - `ai_models` - 计费统计（使用记录、成本统计）

2. **数据独立性**
   - 即使 `ai_model_config` 中的配置被删除，历史使用记录仍然保留
   - 使用记录基于 `ai_models`，不受配置变更影响

3. **扩展性**
   - `ai_models` 可以存储额外的计费相关字段（未来可能需要）
   - 便于按计费维度进行统计和分析

## 建议

### 短期建议
**保留 `ai_models` 表**，因为：
1. 当前架构已经稳定运行
2. 职责分离清晰
3. 重构成本高，风险大
4. 没有明显的性能或维护问题

### 长期考虑
如果将来需要简化架构，可以考虑：
1. 统一到 `ai_model_config` 表
2. 但需要确保历史数据迁移完整
3. 需要全面的测试验证

## 总结

**`ai_models` 表目前仍然有用且在使用中**，主要用于：
- ✅ 使用记录的关联（`ai_usage_records.model_id`）
- ✅ 前端展示和统计
- ✅ 计费系统的基础数据

不建议在当前阶段移除，除非有明确的业务需求或架构优化目标。


