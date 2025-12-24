# 大模型API计费系统 - API接口说明

## 概述

本文档说明计费模块对外提供的API接口（Service层接口）。

## 核心Service接口

### 1. TokenQuotaService - 配额管理服务

#### 1.1 获取用户配额

```java
UserTokenQuota getUserQuota(Long userId)
```

**说明**: 获取用户的配额信息，如果不存在则自动创建。

**参数**:
- `userId`: 用户ID

**返回**: UserTokenQuota对象

#### 1.2 检查配额是否充足

```java
boolean hasEnoughQuota(Long userId, String quotaType, Long amount)
```

**说明**: 检查用户是否有足够的配额。

**参数**:
- `userId`: 用户ID
- `quotaType`: 配额类型（text_token, image, audio, video）
- `amount`: 需要的数量

**返回**: true表示充足，false表示不足

#### 1.3 扣除配额

```java
boolean consumeQuota(Long userId, String quotaType, Long amount)
```

**说明**: 扣除用户配额，使用悲观锁防止并发超扣。

**参数**:
- `userId`: 用户ID
- `quotaType`: 配额类型
- `amount`: 扣除数量

**返回**: true表示成功，false表示配额不足

#### 1.4 分配配额

```java
void grantQuota(Long userId, String quotaType, Long amount, String source, Long referenceId, String description)
```

**说明**: 为用户分配配额（增加配额）。

**参数**:
- `userId`: 用户ID
- `quotaType`: 配额类型
- `amount`: 分配数量
- `source`: 来源（membership, purchase, admin_grant）
- `referenceId`: 关联ID（订单ID、会员ID等）
- `description`: 描述

### 2. PricingService - 资费计算服务

#### 2.1 获取模型资费配置

```java
AIModelPricing getPricing(Long modelId, String pricingType)
```

**说明**: 获取模型的资费配置。

**参数**:
- `modelId`: 模型ID
- `pricingType`: 计费类型（input_token, output_token, image, audio_minute, video_second）

**返回**: AIModelPricing对象

**异常**: PricingNotFoundException（如果未找到配置）

#### 2.2 计算文本生成费用

```java
BigDecimal calculateTextGenerationCost(Long modelId, Integer inputTokens, Integer outputTokens)
```

**说明**: 计算文本生成的费用。

**参数**:
- `modelId`: 模型ID
- `inputTokens`: 输入Token数
- `outputTokens`: 输出Token数

**返回**: 费用（元）

#### 2.3 计算图片生成费用

```java
BigDecimal calculateImageGenerationCost(Long modelId, Integer imageCount)
```

**说明**: 计算图片生成的费用。

**参数**:
- `modelId`: 模型ID
- `imageCount`: 图片数量

**返回**: 费用（元）

#### 2.4 计算音频处理费用

```java
BigDecimal calculateAudioCost(Long modelId, Integer durationSeconds)
```

**说明**: 计算音频处理的费用。

**参数**:
- `modelId`: 模型ID
- `durationSeconds`: 音频时长（秒）

**返回**: 费用（元）

#### 2.5 计算视频生成费用

```java
BigDecimal calculateVideoCost(Long modelId, Integer durationSeconds)
```

**说明**: 计算视频生成的费用。

**参数**:
- `modelId`: 模型ID
- `durationSeconds`: 视频时长（秒）

**返回**: 费用（元）

#### 2.6 通用费用计算

```java
BigDecimal calculateCost(Long modelId, String usageType, Map<String, Object> usageData)
```

**说明**: 根据使用类型和参数计算费用。

**参数**:
- `modelId`: 模型ID
- `usageType`: 使用类型（text_generation, image_generation, audio_tts, audio_stt, video_generation）
- `usageData`: 使用数据（包含inputTokens, outputTokens, imageCount, audioDuration, videoDuration等）

**返回**: 费用（元）

### 3. UsageRecordService - 使用记录服务

#### 3.1 记录使用情况（通用）

```java
void recordUsage(Long userId, Long providerId, Long modelId, String usageType,
                Integer inputTokens, Integer outputTokens, Integer totalTokens,
                Integer imageCount, Integer audioDuration, Integer videoDuration,
                BigDecimal costAmount, Long tokenConsumed, String status, String errorMessage)
```

**说明**: 记录AI API使用情况。

**参数**:
- `userId`: 用户ID
- `providerId`: 提供商ID
- `modelId`: 模型ID
- `usageType`: 使用类型
- `inputTokens`: 输入Token数
- `outputTokens`: 输出Token数
- `totalTokens`: 总Token数
- `imageCount`: 图片数量
- `audioDuration`: 音频时长（秒）
- `videoDuration`: 视频时长（秒）
- `costAmount`: 费用
- `tokenConsumed`: 消耗的Token配额
- `status`: 状态（success, failed, timeout）
- `errorMessage`: 错误信息

#### 3.2 记录文本生成使用

```java
void recordTextGeneration(Long userId, Long providerId, Long modelId,
                         Integer inputTokens, Integer outputTokens, Integer totalTokens,
                         BigDecimal costAmount, Long tokenConsumed, boolean success, String errorMessage)
```

#### 3.3 记录图片生成使用

```java
void recordImageGeneration(Long userId, Long providerId, Long modelId,
                          Integer imageCount, BigDecimal costAmount, Long tokenConsumed,
                          boolean success, String errorMessage)
```

#### 3.4 记录音频处理使用

```java
void recordAudioProcessing(Long userId, Long providerId, Long modelId, String audioType,
                          Integer audioDuration, BigDecimal costAmount, Long tokenConsumed,
                          boolean success, String errorMessage)
```

#### 3.5 记录视频生成使用

```java
void recordVideoGeneration(Long userId, Long providerId, Long modelId,
                          Integer videoDuration, BigDecimal costAmount, Long tokenConsumed,
                          boolean success, String errorMessage)
```

### 4. AIModelLookupService - 模型查找服务

#### 4.1 查找模型ID

```java
Optional<Long> findModelId(String providerName, String modelCode)
```

**说明**: 根据provider名称和model code查找模型ID。

**参数**:
- `providerName`: 提供商名称（dashscope, openai等）
- `modelCode`: 模型代码（qwen-max, gpt-4等）

**返回**: Optional<Long>，如果找到则包含模型ID

#### 4.2 查找Provider ID

```java
Optional<Long> findProviderId(String providerName)
```

**说明**: 根据provider名称查找provider ID。

**参数**:
- `providerName`: 提供商名称

**返回**: Optional<Long>，如果找到则包含provider ID

#### 4.3 查找或创建Provider

```java
AIProvider findOrCreateProvider(String providerName, String displayName)
```

**说明**: 查找provider，如果不存在则创建。

**参数**:
- `providerName`: 提供商名称
- `displayName`: 显示名称

**返回**: AIProvider对象

#### 4.4 查找或创建Model

```java
AIModel findOrCreateModel(Long providerId, String modelCode, String modelName, String modelType)
```

**说明**: 查找model，如果不存在则创建。

**参数**:
- `providerId`: 提供商ID
- `modelCode`: 模型代码
- `modelName`: 模型名称
- `modelType`: 模型类型（text, image, audio, video）

**返回**: AIModel对象

## 异常说明

### QuotaInsufficientException

配额不足异常。

**抛出场景**: 当用户配额不足时，`consumeQuota`方法会返回false，AOP切面会抛出此异常。

**异常信息**:
- `quotaType`: 配额类型
- `required`: 需要的数量
- `available`: 可用数量

### PricingNotFoundException

资费配置未找到异常。

**抛出场景**: 当模型资费配置不存在时。

**异常信息**: 包含modelId和pricingType信息

## 使用示例

### 示例1: 检查并扣除配额

```java
@Autowired
private TokenQuotaService tokenQuotaService;

// 检查配额
if (tokenQuotaService.hasEnoughQuota(userId, "text_token", 1000L)) {
    // 扣除配额
    boolean success = tokenQuotaService.consumeQuota(userId, "text_token", 1000L);
    if (success) {
        // 执行AI调用
    }
}
```

### 示例2: 计算费用

```java
@Autowired
private PricingService pricingService;

// 计算文本生成费用
BigDecimal cost = pricingService.calculateTextGenerationCost(modelId, 100, 200);
```

### 示例3: 分配配额

```java
@Autowired
private TokenQuotaService tokenQuotaService;

// 会员开通时分配配额
tokenQuotaService.grantQuota(userId, "text_token", 100000L, 
    "membership", planId, "会员开通赠送");
```

### 示例4: 记录使用情况

```java
@Autowired
private UsageRecordService usageRecordService;

// 记录文本生成使用
usageRecordService.recordTextGeneration(userId, providerId, modelId,
    100, 200, 300, new BigDecimal("0.05"), 300L, true, null);
```

