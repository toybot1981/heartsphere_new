# ai_models 表重构总结

## 重构目标

将所有关联 `ai_models` 的实体统一到 `ai_model_config`，使 `ai_models` 表达到可删除的条件。

## 已完成的修改

### 1. 数据库实体修改

#### AIUsageRecord.java
- ✅ 修改 `model_id` 字段，现在关联到 `ai_model_config.id`
- ✅ 添加 `@ManyToOne` 关联到 `AIModelConfig`

#### AIModelPricing.java
- ✅ 已修改为关联到 `ai_model_config`（之前已完成）

### 2. 后端代码修改

#### AIBillingAspect.java
- ✅ 移除 `billingModelId` 相关逻辑
- ✅ 统一使用 `pricingModelId`（现在称为 `modelId`），来自 `ai_model_config.id`
- ✅ 移除 `ai_models` 表的自动创建逻辑
- ✅ 保留 `ai_providers` 的查找和创建（资源池管理仍需要）

#### UsageRecordService.java
- ✅ 方法签名保持不变，`modelId` 参数现在表示 `ai_model_config.id`

#### AdminBillingModelController.java
- ✅ 修改为从 `ai_model_config` 获取数据
- ✅ 移除创建、更新、删除方法（这些操作应该在模型配置管理中完成）
- ✅ 标记为 `@Deprecated`，建议使用 `/api/admin/ai-config/models`

### 3. 数据库迁移

#### V10004__change_usage_records_model_id_to_config.sql
- ✅ 创建迁移脚本，将 `ai_usage_records.model_id` 从关联 `ai_models` 改为关联 `ai_model_config`
- ✅ 包含数据迁移逻辑（通过 provider 和 model_code 匹配）

### 4. 前端代码修改

#### PricingManagement.tsx
- ✅ 移除 `billingModels` 状态
- ✅ 统一使用 `adminApi.aiConfig.models.getAll()` 获取模型列表
- ✅ 修改 `getModelName` 和 `getModel` 方法，直接从 `models`（ai_model_config）获取
- ✅ 修改 `groupPricingsByProvider`，移除对 `billingModel` 的依赖

#### UsageRecordsView.tsx
- ✅ 修改为使用 `adminApi.aiConfig.models.getAll()` 获取模型列表
- ✅ 修改类型定义，使用 `AIModelConfig` 替代 `AIModel`

#### CostStatisticsView.tsx
- ✅ 修改为使用 `adminApi.aiConfig.models.getAll()` 获取模型列表
- ✅ 修改类型定义，使用 `AIModelConfig` 替代 `AIModel`

## 保留的内容

以下内容暂时保留，因为它们可能在其他地方仍有使用：

1. **AIModelLookupService**
   - `findModelId()` 和 `findOrCreateModel()` 方法暂时保留
   - 这些方法现在没有被调用，但为了代码完整性暂时保留
   - 如果确认不再使用，可以后续删除

2. **ai_models 表**
   - 表结构暂时保留，但已经没有任何关联
   - 可以安全删除（需要先确认没有其他地方使用）

## 后续清理工作

### 可选清理步骤

1. **删除 AIModelLookupService 中的模型相关方法**
   ```java
   // 可以删除的方法：
   - findModelId(String providerName, String modelCode)
   - findOrCreateModel(Long providerId, String modelCode, String modelName, String modelType)
   ```

2. **删除 ai_models 表**
   ```sql
   -- 在确认没有其他地方使用后，可以删除表
   DROP TABLE IF EXISTS ai_models;
   ```

3. **删除相关实体类和Repository**
   - `AIModel.java`
   - `AIModelRepository.java`

4. **删除相关服务（如果不再使用）**
   - `BillingInitializationService` 中关于 `ai_models` 的初始化代码
   - `BillingMonitorService` 中关于 `ai_models` 的查询代码
   - `QuotaCalculationService` 中关于 `ai_models` 的查询代码

## 注意事项

1. **数据迁移**
   - 迁移脚本会尝试将现有的 `ai_usage_records.model_id` 从 `ai_models.id` 映射到 `ai_model_config.id`
   - 如果映射失败（模型在 `ai_model_config` 中不存在），记录会保留原值，需要手动处理

2. **兼容性**
   - `AdminBillingModelController` 已标记为 `@Deprecated`
   - 建议前端逐步迁移到使用 `adminApi.aiConfig.models` API

3. **测试建议**
   - 测试使用记录创建和查询
   - 测试定价配置关联
   - 测试前端模型列表展示
   - 测试数据迁移脚本的执行

## 重构后的数据流

```
统一路由服务选择模型
    ↓
ai_model_config (获取配置: API Key, Base URL)
    ↓
AI服务调用
    ↓
计费拦截 (AIBillingAspect)
    ├─→ modelId (ai_model_config.id) → 查找定价配置 (ai_model_pricing)
    └─→ modelId (ai_model_config.id) → 记录使用情况 (ai_usage_records)
```

## 总结

✅ **已完成**：所有关联 `ai_models` 的实体已统一到 `ai_model_config`  
✅ **可删除**：`ai_models` 表现在已经没有任何关联，可以安全删除  
⚠️ **待清理**：相关实体类、Repository 和服务可以后续清理

