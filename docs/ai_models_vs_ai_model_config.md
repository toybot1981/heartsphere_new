# ai_models 和 ai_model_config 表的关系说明

## 概述

这两个表服务于不同的目的，但在计费系统中是协同工作的：

### 1. **ai_model_config** (管理配置表)
- **用途**：系统统一接入模式下的AI模型配置管理
- **位置**：`backend/src/main/java/com/heartsphere/admin/entity/AIModelConfig.java`
- **职责**：
  - 存储模型的管理配置（API Key、Base URL、模型参数等）
  - 用于统一路由服务选择模型
  - 作为定价配置的关联对象（`ai_model_pricing.model_id` 指向 `ai_model_config.id`）

**主要字段**：
- `id`: 主键
- `provider`: 提供商名称（如：doubao, dashscope, gemini, openai）
- `model_name`: 模型名称（如：doubao-1-5-pro-32k-250115, qwen-max）
- `capability`: 能力类型（text, image, audio, video）
- `api_key`: API密钥（加密存储）
- `base_url`: API基础URL
- `model_params`: 模型参数（JSON格式）
- `is_default`: 是否为默认模型
- `priority`: 优先级（用于容错模式排序）
- `is_active`: 是否启用
- `description`: 描述

### 2. **ai_models** (计费系统表)
- **用途**：计费系统的模型记录，用于使用情况统计和资源池管理
- **位置**：`backend/src/main/java/com/heartsphere/billing/entity/AIModel.java`
- **职责**：
  - 记录实际使用过的模型（用于使用记录统计）
  - 关联到 `ai_providers` 表
  - 作为使用记录（`ai_usage_records`）的关联对象

**主要字段**：
- `id`: 主键
- `provider_id`: 关联到 `ai_providers.id`
- `model_code`: 模型代码（如：doubao-1-5-pro-32k-250115）
- `model_name`: 模型显示名称
- `model_type`: 模型类型（text, image, audio, video）
- `enabled`: 是否启用

## 关系说明

### 数据流向

```
统一路由服务
    ↓ (选择模型)
ai_model_config (获取配置: API Key, Base URL等)
    ↓
AIService (调用AI API)
    ↓
计费拦截 (AIBillingAspect)
    ↓
├─→ pricingModelId (ai_model_config.id) → 查找定价 (ai_model_pricing)
└─→ billingModelId (ai_models.id) → 记录使用情况 (ai_usage_records)
```

### 两个ID的用途

在 `AIBillingAspect` 中，会同时获取两个ID：

1. **pricingModelId** (`ai_model_config.id`)
   - 用于查找定价配置：`ai_model_pricing.model_id = ai_model_config.id`
   - 用于计算费用：`PricingService.calculateCost(pricingModelId, ...)`

2. **billingModelId** (`ai_models.id`)
   - 用于记录使用情况：`ai_usage_records.model_id = ai_models.id`
   - 用于统计和报表：按计费系统的模型维度统计使用量

### 自动创建机制

当统一路由服务选择了 `ai_model_config` 中的模型，但 `ai_models` 中不存在对应记录时：

1. `AIBillingAspect` 会调用 `AIModelLookupService.findOrCreateModel()`
2. 自动在 `ai_models` 表中创建对应记录
3. 创建时使用 `provider` 和 `model_code` 作为匹配条件

### 关联关系图

```
┌─────────────────────┐
│  ai_model_config    │
│  (管理配置表)       │
│                     │
│  - id (PK)          │
│  - provider         │
│  - model_name       │
│  - capability       │
│  - api_key          │
│  - base_url         │
└──────────┬──────────┘
           │
           │ model_id (FK)
           │
           ▼
┌─────────────────────┐
│  ai_model_pricing   │
│  (定价配置表)       │
│                     │
│  - id (PK)          │
│  - model_id (FK)    │──→ ai_model_config.id
│  - pricing_type     │
│  - unit_price       │
└─────────────────────┘

┌─────────────────────┐
│  ai_models          │
│  (计费系统表)       │
│                     │
│  - id (PK)          │
│  - provider_id (FK) │──→ ai_providers.id
│  - model_code       │
│  - model_name       │
│  - model_type       │
└──────────┬──────────┘
           │
           │ model_id (FK)
           │
           ▼
┌─────────────────────┐
│  ai_usage_records   │
│  (使用记录表)       │
│                     │
│  - id (PK)          │
│  - model_id (FK)    │──→ ai_models.id
│  - usage_type       │
│  - cost_amount      │
│  - image_count      │
└─────────────────────┘
```

## 为什么需要两个表？

1. **职责分离**：
   - `ai_model_config`：关注模型配置和路由策略
   - `ai_models`：关注计费和统计分析

2. **数据独立性**：
   - 管理员可以在 `ai_model_config` 中配置模型
   - 使用记录存储在 `ai_models` 中，即使配置被删除，历史记录仍然保留

3. **扩展性**：
   - 定价配置关联到 `ai_model_config`，便于管理员配置定价
   - 使用记录关联到 `ai_models`，便于按模型维度统计

## 注意事项

⚠️ **重要**：`ai_model_pricing.model_id` 现在关联到 `ai_model_config.id`，但在 `AIModelPricing.java` 实体类中，`@ManyToOne` 关联的仍然是 `AIModel`。这可能会导致ORM映射问题，需要更新实体类。

