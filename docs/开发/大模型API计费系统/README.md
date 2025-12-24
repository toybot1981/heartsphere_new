# 大模型API计费系统

## 概述

这是一个独立的大模型API计费模块，通过AOP切面的方式拦截AI服务调用，实现基于Token的精确计费。

## 模块结构

```
com.heartsphere.billing/
├── annotation/          # 注解定义
│   └── RequiresTokenQuota.java
├── aspect/             # AOP切面
│   └── AIBillingAspect.java
├── config/             # 配置类
│   └── BillingConfig.java
├── entity/             # 实体类
│   ├── AIProvider.java
│   ├── AIModel.java
│   ├── AIModelPricing.java
│   ├── UserTokenQuota.java
│   ├── TokenQuotaTransaction.java
│   ├── AIUsageRecord.java
│   ├── AICostDaily.java
│   └── TokenPackage.java
├── exception/          # 异常类
│   ├── QuotaInsufficientException.java
│   └── PricingNotFoundException.java
├── repository/         # Repository接口
│   ├── AIProviderRepository.java
│   ├── AIModelRepository.java
│   ├── AIModelPricingRepository.java
│   ├── UserTokenQuotaRepository.java
│   ├── TokenQuotaTransactionRepository.java
│   ├── AIUsageRecordRepository.java
│   ├── AICostDailyRepository.java
│   └── TokenPackageRepository.java
└── service/            # 服务层
    ├── PricingService.java
    ├── TokenQuotaService.java
    ├── UsageRecordService.java
    └── AIModelLookupService.java
```

## 工作原理

1. **非侵入式设计**: 通过在`AIServiceImpl`的方法上添加`@RequiresTokenQuota`注解来标记需要计费的方法
2. **AOP拦截**: `AIBillingAspect`切面拦截所有标注了`@RequiresTokenQuota`的方法
3. **配额检查**: 在实际调用前检查用户配额是否充足
4. **使用记录**: 调用成功后记录使用量、计算费用并扣除配额

## 使用方式

### 1. 数据库初始化

执行 `backend/src/main/resources/db/migration/create_billing_tables.sql` 创建所有必要的数据库表。

### 2. 初始化模型数据

需要先初始化AI提供商和模型数据：

```java
// 示例：创建provider
AIProvider provider = new AIProvider();
provider.setName("dashscope");
provider.setDisplayName("阿里云通义千问");
provider.setEnabled(true);
providerRepository.save(provider);

// 示例：创建model
AIModel model = new AIModel();
model.setProviderId(provider.getId());
model.setModelCode("qwen-max");
model.setModelName("通义千问-Max");
model.setModelType("text");
model.setEnabled(true);
modelRepository.save(model);

// 示例：创建定价配置
AIModelPricing pricing = new AIModelPricing();
pricing.setModelId(model.getId());
pricing.setPricingType("input_token");
pricing.setUnitPrice(new BigDecimal("0.002")); // 每千Token 0.002元
pricing.setUnit("per_1k_tokens");
pricing.setEffectiveDate(LocalDateTime.now());
pricing.setIsActive(true);
pricingRepository.save(pricing);
```

### 3. 配置用户配额

用户配额可以通过以下方式分配：

- **会员订阅**: 当用户开通会员时，根据订阅计划分配配额
- **Token包购买**: 用户单独购买Token包
- **管理员授予**: 管理员手动分配配额

示例代码：

```java
@Autowired
private TokenQuotaService tokenQuotaService;

// 分配配额
tokenQuotaService.grantQuota(userId, "text_token", 100000L, "membership", planId, "会员开通赠送");
```

### 4. 在AI服务方法上添加注解

在`AIServiceImpl`的相应方法上添加`@RequiresTokenQuota`注解：

```java
@RequiresTokenQuota(quotaType = "text_token", usageType = "text_generation")
public TextGenerationResponse generateText(Long userId, TextGenerationRequest request) {
    // 业务逻辑
}
```

## 核心服务说明

### PricingService - 资费计算服务

负责根据模型资费配置计算使用费用：

- `calculateTextGenerationCost()`: 计算文本生成费用
- `calculateImageGenerationCost()`: 计算图片生成费用
- `calculateAudioCost()`: 计算音频处理费用
- `calculateVideoCost()`: 计算视频生成费用

### TokenQuotaService - 配额管理服务

负责用户配额的管理：

- `getUserQuota()`: 获取用户配额
- `hasEnoughQuota()`: 检查配额是否充足
- `consumeQuota()`: 扣除配额（带悲观锁防止并发超扣）
- `grantQuota()`: 分配配额

### UsageRecordService - 使用记录服务

负责记录AI API使用情况：

- `recordTextGeneration()`: 记录文本生成使用
- `recordImageGeneration()`: 记录图片生成使用
- `recordAudioProcessing()`: 记录音频处理使用
- `recordVideoGeneration()`: 记录视频生成使用

### AIModelLookupService - 模型查找服务

负责根据provider和model code查找模型ID：

- `findModelId()`: 查找模型ID
- `findProviderId()`: 查找provider ID
- `findOrCreateProvider()`: 查找或创建provider
- `findOrCreateModel()`: 查找或创建model

## 异常处理

- `QuotaInsufficientException`: 配额不足异常，当用户配额不足时抛出
- `PricingNotFoundException`: 资费配置未找到异常，当模型资费配置不存在时抛出

## 注意事项

1. **并发控制**: 配额扣除使用数据库悲观锁（`PESSIMISTIC_WRITE`）防止并发超扣
2. **模型配置**: 如果模型未在计费系统中配置，调用仍然会执行，但不会计费
3. **失败处理**: API调用失败时不会扣除配额，但会记录失败记录
4. **流式调用**: 流式文本生成会在完成后统一记录使用量

## 后续优化

1. 月度配额重置定时任务
2. Token包购买功能
3. 配额使用统计和报表
4. 成本统计和分析
5. 配额预警和提醒

