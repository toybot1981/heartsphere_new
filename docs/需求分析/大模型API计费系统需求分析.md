# 大模型API计费系统需求分析文档

**文档版本**: V1.0  
**编写日期**: 2025-12-22  
**功能模块**: 大模型API计费系统  
**目标**: 实现基于Token的大模型API计费，通过会员系统提供配额管理，弥补成本压力

---

## 一、需求概述

### 1.1 背景

随着系统集成的AI模型数量增加（阿里云通义、OpenAI、Gemini、豆包等），API调用成本持续上升。为了：
1. **控制成本**：精确跟踪每个模型的调用成本
2. **用户付费**：通过会员系统让用户为AI使用付费
3. **公平使用**：避免免费用户滥用导致成本失控
4. **灵活定价**：支持不同模型的差异化定价策略

需要建立一套完整的大模型API计费系统。

### 1.2 核心目标

- ✅ **精确计费**：记录每次API调用的Token使用量和费用
- ✅ **配额管理**：为不同会员等级提供不同的Token配额
- ✅ **实时扣费**：在使用API时实时检查和扣费
- ✅ **成本透明**：用户可查看自己的使用情况和账单
- ✅ **灵活配置**：管理员可配置各模型的资费标准

### 1.3 适用范围

- **文本生成**：聊天对话、内容生成等
- **图片生成**：AI生成图片
- **语音处理**：文本转语音、语音转文本
- **视频生成**：AI生成视频（未来）
- **其他AI能力**：各种AI服务的调用

---

## 二、功能需求

### 2.1 模型资费管理模块

#### 2.1.1 模型资费配置

**功能描述**: 管理员配置每个模型提供商、每个模型的资费标准

**详细需求**:

1. **支持多层级配置**:
   - 提供商级别（如：阿里云通义）
   - 模型级别（如：qwen-max、qwen-plus）
   - 能力级别（文本生成、图片生成、语音处理等）

2. **资费参数**:
   - **输入Token价格**（元/千Token）：处理用户输入的费用
   - **输出Token价格**（元/千Token）：生成内容的费用
   - **图片生成价格**（元/张）：按图片数量计费
   - **语音处理价格**（元/分钟）：语音转文字或文字转语音
   - **视频生成价格**（元/秒）：视频生成费用
   - **最低计费单位**：如不足1千Token按1千Token计费

3. **定价策略**:
   - **固定价格**：固定费率
   - **阶梯价格**：根据使用量分档计费（如0-1万Token一个价，1-10万另一个价）
   - **会员折扣**：不同会员等级享受不同折扣

4. **配置管理**:
   - 创建、编辑、删除资费配置
   - 启用/禁用模型
   - 历史价格记录（用于成本分析）
   - 批量导入/导出配置

**数据模型**:
```sql
-- 模型提供商表
CREATE TABLE ai_providers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '提供商名称：alibaba, openai, gemini, doubao',
  display_name VARCHAR(200) NOT NULL COMMENT '显示名称：阿里云通义千问',
  enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 模型表
CREATE TABLE ai_models (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  provider_id BIGINT NOT NULL COMMENT '提供商ID',
  model_code VARCHAR(100) NOT NULL COMMENT '模型代码：qwen-max, gpt-4',
  model_name VARCHAR(200) NOT NULL COMMENT '模型名称：通义千问-Max',
  model_type VARCHAR(50) NOT NULL COMMENT '模型类型：text, image, audio, video',
  enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES ai_providers(id),
  UNIQUE KEY uk_provider_model (provider_id, model_code)
);

-- 模型资费配置表
CREATE TABLE ai_model_pricing (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  model_id BIGINT NOT NULL COMMENT '模型ID',
  pricing_type VARCHAR(50) NOT NULL COMMENT '计费类型：input_token, output_token, image, audio_minute, video_second',
  unit_price DECIMAL(12, 6) NOT NULL COMMENT '单价',
  unit VARCHAR(50) NOT NULL COMMENT '单位：per_1k_tokens, per_image, per_minute, per_second',
  min_charge_unit DECIMAL(12, 6) DEFAULT 0 COMMENT '最低计费单位',
  effective_date DATETIME NOT NULL COMMENT '生效日期',
  expiry_date DATETIME NULL COMMENT '失效日期（NULL表示永久有效）',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否生效',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES ai_models(id),
  INDEX idx_model_effective (model_id, effective_date, is_active)
);

-- 阶梯定价表（可选）
CREATE TABLE ai_model_tiered_pricing (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  pricing_id BIGINT NOT NULL COMMENT '资费配置ID',
  min_quantity DECIMAL(12, 2) NOT NULL COMMENT '最小数量',
  max_quantity DECIMAL(12, 2) NULL COMMENT '最大数量（NULL表示无上限）',
  unit_price DECIMAL(12, 6) NOT COMMENT '该阶梯的单价',
  FOREIGN KEY (pricing_id) REFERENCES ai_model_pricing(id)
);
```

**API接口**:
- `GET /api/admin/ai-models/providers` - 获取所有提供商列表
- `POST /api/admin/ai-models/providers` - 创建提供商
- `PUT /api/admin/ai-models/providers/{id}` - 更新提供商
- `GET /api/admin/ai-models/models` - 获取所有模型列表
- `POST /api/admin/ai-models/models` - 创建模型
- `PUT /api/admin/ai-models/models/{id}` - 更新模型
- `GET /api/admin/ai-models/pricing` - 获取资费配置列表
- `POST /api/admin/ai-models/pricing` - 创建资费配置
- `PUT /api/admin/ai-models/pricing/{id}` - 更新资费配置

#### 2.1.2 模型使用统计

**功能描述**: 统计各模型的使用量和成本

**详细需求**:
- 按提供商统计
- 按模型统计
- 按时间维度统计（日、周、月）
- 按用户维度统计
- 成本趋势分析

---

### 2.2 Token配额管理模块

#### 2.2.1 会员配额配置

**功能描述**: 为不同会员等级配置Token配额

**详细需求**:

1. **配额类型**:
   - **文本Token配额**：文本生成的总Token数（输入+输出）
   - **图片生成配额**：每月可生成图片数量
   - **语音处理配额**：每月语音处理时长（分钟）
   - **视频生成配额**：每月视频生成时长（秒）

2. **配额周期**:
   - **月度配额**：每月重置
   - **永久配额**：累计配额，不重置

3. **配额获取方式**:
   - **会员订阅赠送**：开通会员自动获得
   - **充值购买**：用户单独购买Token包
   - **活动赠送**：参与活动获得

4. **配额继承**:
   - 升级会员时，原有配额保留
   - 会员到期时，未使用的配额保留一定时间（如30天）

**数据模型**:
```sql
-- 会员配额配置表（扩展subscription_plans表）
ALTER TABLE subscription_plans ADD COLUMN text_token_quota INT DEFAULT 0 COMMENT '文本Token配额（每月）';
ALTER TABLE subscription_plans ADD COLUMN image_generation_quota INT DEFAULT 0 COMMENT '图片生成配额（每月）';
ALTER TABLE subscription_plans ADD COLUMN audio_processing_quota INT DEFAULT 0 COMMENT '语音处理配额（每月，分钟）';
ALTER TABLE subscription_plans ADD COLUMN video_generation_quota INT DEFAULT 0 COMMENT '视频生成配额（每月，秒）';
ALTER TABLE subscription_plans ADD COLUMN permanent_token_quota INT DEFAULT 0 COMMENT '永久Token配额';

-- 用户Token配额表
CREATE TABLE user_token_quota (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  text_token_total BIGINT DEFAULT 0 COMMENT '文本Token总配额',
  text_token_used BIGINT DEFAULT 0 COMMENT '文本Token已使用',
  text_token_monthly_quota BIGINT DEFAULT 0 COMMENT '月度文本Token配额',
  text_token_monthly_used BIGINT DEFAULT 0 COMMENT '月度文本Token已使用',
  image_quota_total INT DEFAULT 0 COMMENT '图片生成总配额',
  image_quota_used INT DEFAULT 0 COMMENT '图片生成已使用',
  image_quota_monthly INT DEFAULT 0 COMMENT '月度图片配额',
  image_quota_monthly_used INT DEFAULT 0 COMMENT '月度图片已使用',
  audio_quota_total INT DEFAULT 0 COMMENT '语音处理总配额（分钟）',
  audio_quota_used INT DEFAULT 0 COMMENT '语音处理已使用（分钟）',
  audio_quota_monthly INT DEFAULT 0 COMMENT '月度语音配额（分钟）',
  audio_quota_monthly_used INT DEFAULT 0 COMMENT '月度语音已使用（分钟）',
  video_quota_total INT DEFAULT 0 COMMENT '视频生成总配额（秒）',
  video_quota_used INT DEFAULT 0 COMMENT '视频生成已使用（秒）',
  video_quota_monthly INT DEFAULT 0 COMMENT '月度视频配额（秒）',
  video_quota_monthly_used INT DEFAULT 0 COMMENT '月度视频已使用（秒）',
  last_reset_date DATE COMMENT '上次重置日期',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY uk_user_id (user_id)
);

-- Token配额变动记录表
CREATE TABLE token_quota_transaction (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  transaction_type VARCHAR(50) NOT NULL COMMENT '变动类型：grant（授予）, consume（消费）, purchase（购买）, refund（退款）',
  quota_type VARCHAR(50) NOT NULL COMMENT '配额类型：text_token, image, audio, video',
  amount BIGINT NOT NULL COMMENT '变动数量',
  balance_after BIGINT NOT NULL COMMENT '变动后余额',
  source VARCHAR(100) COMMENT '来源：membership, purchase, admin_grant, usage',
  reference_id BIGINT COMMENT '关联ID（订单ID、会员ID等）',
  description VARCHAR(500) COMMENT '描述',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_type (user_id, transaction_type, created_at)
);
```

#### 2.2.2 配额分配与重置

**功能描述**: 会员订阅时自动分配配额，定期重置月度配额

**详细需求**:

1. **自动分配**:
   - 用户开通会员时，根据订阅计划自动分配配额
   - 会员续费时，再次分配月度配额
   - 升级会员时，计算差额并补充

2. **月度重置**:
   - 每月1日自动重置月度配额
   - 重置前保存上月使用记录
   - 重置时累加到总配额（如未使用完）

3. **配额提醒**:
   - 配额使用达到80%时提醒
   - 配额不足时提示充值
   - 配额即将到期时提醒

**业务流程**:
```
用户开通会员 
  → 根据订阅计划获取配额配置
  → 初始化或更新user_token_quota表
  → 创建quota_transaction记录（grant类型）
  → 通知用户配额已到账

每月1日定时任务
  → 遍历所有活跃会员
  → 保存上月使用记录
  → 重置月度配额为计划配额
  → 更新last_reset_date
```

#### 2.2.3 Token包购买

**功能描述**: 用户可单独购买Token包，补充配额

**详细需求**:

1. **Token包配置**:
   - 管理员配置不同的Token包（如：100万Token/99元）
   - 支持不同的配额类型（文本、图片等）
   - 支持优惠活动（限时折扣、买赠等）

2. **购买流程**:
   - 用户选择Token包
   - 创建支付订单
   - 支付成功后自动到账
   - 记录购买记录

**数据模型**:
```sql
-- Token包配置表
CREATE TABLE token_packages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '包名称：100万Token包',
  quota_type VARCHAR(50) NOT NULL COMMENT '配额类型：text_token, image, audio, video',
  amount BIGINT NOT NULL COMMENT 'Token数量',
  price DECIMAL(10, 2) NOT NULL COMMENT '价格',
  original_price DECIMAL(10, 2) COMMENT '原价（用于显示折扣）',
  bonus_amount BIGINT DEFAULT 0 COMMENT '赠送数量',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 2.3 Token使用记录与计费模块

#### 2.3.1 API调用拦截与记录

**功能描述**: 在调用AI模型API前后进行拦截，记录使用量和计算费用

**详细需求**:

1. **拦截点**:
   - 文本生成：记录输入Token、输出Token
   - 图片生成：记录生成的图片数量
   - 语音处理：记录处理时长
   - 视频生成：记录生成时长

2. **记录信息**:
   - 用户ID
   - 模型提供商、模型名称
   - 使用量（Token数、图片数、时长等）
   - 费用计算（单价×数量）
   - 调用时间
   - 请求参数（可选，用于调试）
   - 响应状态（成功/失败）

3. **异步记录**:
   - API调用不应阻塞业务逻辑
   - 使用异步队列记录使用记录
   - 失败重试机制

**实现方式**:
```java
// 切面拦截AI模型调用
@Aspect
@Component
public class AIServiceInterceptor {
    
    @Around("@annotation(RequiresToken)")
    public Object intercept(ProceedingJoinPoint joinPoint) {
        // 1. 获取用户信息
        // 2. 检查配额
        // 3. 执行API调用
        // 4. 记录使用量
        // 5. 扣除配额
        // 6. 计算费用（用于成本统计）
    }
}
```

#### 2.3.2 费用计算

**功能描述**: 根据使用量和资费配置计算费用

**详细需求**:

1. **计算规则**:
   - 文本：`费用 = (输入Token数 + 输出Token数) / 1000 × 单价`
   - 图片：`费用 = 图片数量 × 单价`
   - 语音：`费用 = 处理时长（分钟） × 单价`
   - 视频：`费用 = 生成时长（秒） × 单价`

2. **最低计费**:
   - 如果使用量不足最低计费单位，按最低计费单位计算

3. **会员折扣**:
   - 根据用户会员等级应用折扣
   - 折扣后费用用于成本计算（实际成本）
   - Token消耗按实际使用量（不折扣）

4. **成本统计**:
   - 实时成本（每次调用）
   - 日成本统计
   - 月成本统计
   - 用户成本分布

**数据模型**:
```sql
-- AI使用记录表
CREATE TABLE ai_usage_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  provider_id BIGINT NOT NULL COMMENT '提供商ID',
  model_id BIGINT NOT NULL COMMENT '模型ID',
  usage_type VARCHAR(50) NOT NULL COMMENT '使用类型：text_generation, image_generation, audio_tts, audio_stt, video_generation',
  input_tokens INT DEFAULT 0 COMMENT '输入Token数',
  output_tokens INT DEFAULT 0 COMMENT '输出Token数',
  total_tokens INT DEFAULT 0 COMMENT '总Token数',
  image_count INT DEFAULT 0 COMMENT '图片数量',
  audio_duration INT DEFAULT 0 COMMENT '音频时长（秒）',
  video_duration INT DEFAULT 0 COMMENT '视频时长（秒）',
  cost_amount DECIMAL(12, 6) NOT NULL COMMENT '费用（元）',
  token_consumed BIGINT NOT NULL COMMENT '消耗的Token配额',
  status VARCHAR(20) DEFAULT 'success' COMMENT '状态：success, failed, timeout',
  request_id VARCHAR(100) COMMENT '请求ID（用于追踪）',
  error_message TEXT COMMENT '错误信息',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (provider_id) REFERENCES ai_providers(id),
  FOREIGN KEY (model_id) REFERENCES ai_models(id),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_provider_created (provider_id, created_at),
  INDEX idx_model_created (model_id, created_at)
);
```

#### 2.3.3 配额检查与扣费

**功能描述**: 在API调用前检查配额，调用成功后扣除

**详细需求**:

1. **配额检查**:
   - 检查月度配额和永久配额
   - 优先使用月度配额，不足时使用永久配额
   - 配额不足时拒绝请求，返回友好提示

2. **扣费逻辑**:
   - 调用成功后立即扣费
   - 调用失败不扣费（但记录失败记录）
   - 使用数据库事务确保一致性

3. **并发控制**:
   - 使用乐观锁或悲观锁防止超扣
   - 扣费失败时回滚API调用（如可能）

**伪代码**:
```java
public boolean consumeQuota(Long userId, String quotaType, Long amount) {
    // 1. 查询用户配额（加锁）
    UserTokenQuota quota = lockUserQuota(userId);
    
    // 2. 检查配额
    if (!hasEnoughQuota(quota, quotaType, amount)) {
        return false; // 配额不足
    }
    
    // 3. 扣除配额
    deductQuota(quota, quotaType, amount);
    
    // 4. 更新数据库
    updateQuota(quota);
    
    // 5. 记录变动
    recordTransaction(userId, quotaType, amount, "consume");
    
    return true;
}
```

---

### 2.4 用户使用统计与账单模块

#### 2.4.1 使用统计

**功能描述**: 用户可查看自己的AI使用统计

**详细需求**:

1. **实时统计**:
   - 当前配额余额
   - 今日使用量
   - 本月使用量
   - 累计使用量

2. **使用明细**:
   - 按时间查看使用记录
   - 按模型查看使用统计
   - 按用途查看（对话、图片生成等）

3. **可视化**:
   - 使用趋势图表
   - 模型使用分布图
   - 配额消耗预测

**API接口**:
- `GET /api/user/quota/current` - 获取当前配额
- `GET /api/user/quota/usage` - 获取使用统计
- `GET /api/user/quota/records` - 获取使用记录列表
- `GET /api/user/quota/statistics` - 获取统计图表数据

#### 2.4.2 费用账单

**功能描述**: 管理员查看系统成本和用户消费账单

**详细需求**:

1. **系统成本账单**:
   - 按模型统计成本
   - 按时间统计成本
   - 成本趋势分析
   - 盈利分析（收入-成本）

2. **用户消费账单**:
   - 用户实际支付的费用
   - Token包购买记录
   - 会员订阅记录

**数据模型**:
```sql
-- 成本统计表（每日汇总）
CREATE TABLE ai_cost_daily (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  stat_date DATE NOT NULL COMMENT '统计日期',
  provider_id BIGINT NOT NULL COMMENT '提供商ID',
  model_id BIGINT NOT NULL COMMENT '模型ID',
  usage_type VARCHAR(50) NOT NULL COMMENT '使用类型',
  total_usage BIGINT NOT NULL COMMENT '总使用量',
  total_cost DECIMAL(12, 6) NOT NULL COMMENT '总成本',
  call_count INT NOT NULL COMMENT '调用次数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_date_provider_model_type (stat_date, provider_id, model_id, usage_type)
);
```

---

### 2.5 配额不足处理模块

#### 2.5.1 配额不足提示

**功能描述**: 当用户配额不足时，提供友好的提示和引导

**详细需求**:

1. **提示时机**:
   - 配额不足时拒绝API调用
   - 配额低于20%时提前提醒
   - 配额用尽时提示充值

2. **提示内容**:
   - 当前配额余额
   - 建议购买的Token包
   - 会员升级建议
   - 充值链接

#### 2.5.2 降级策略

**功能描述**: 配额不足时的降级方案

**详细需求**:

1. **免费用户限制**:
   - 每日使用上限
   - 每次调用Token上限
   - 禁用部分高级功能

2. **会员过期处理**:
   - 保留未使用配额30天
   - 过期后降级为免费用户
   - 提醒续费

---

## 三、技术实现方案

### 3.1 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   前端应用层                              │
│  - 调用AI API                                            │
│  - 显示配额信息                                          │
│  - 购买Token包                                           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│               API网关层（拦截器）                         │
│  - 配额检查                                              │
│  - 使用记录                                              │
│  - 费用计算                                              │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              AI服务适配层                                 │
│  - ModelAdapter                                          │
│  - 多模型调用                                            │
│  - 响应解析                                              │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              计费服务层                                   │
│  - TokenQuotaService (配额管理)                          │
│  - PricingService (资费计算)                             │
│  - UsageRecordService (使用记录)                         │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              数据持久层                                   │
│  - MySQL (配额、使用记录)                                │
│  - Redis (配额缓存、限流)                                │
└─────────────────────────────────────────────────────────┘
```

### 3.2 核心服务设计

#### 3.2.1 TokenQuotaService（配额服务）

**职责**:
- 配额查询和更新
- 配额检查和扣费
- 配额分配和重置
- 配额变动记录

**关键方法**:
```java
public interface TokenQuotaService {
    // 获取用户配额
    UserTokenQuota getUserQuota(Long userId);
    
    // 检查配额
    boolean hasEnoughQuota(Long userId, String quotaType, Long amount);
    
    // 扣除配额
    boolean consumeQuota(Long userId, String quotaType, Long amount);
    
    // 分配配额
    void grantQuota(Long userId, String quotaType, Long amount, String source);
    
    // 重置月度配额
    void resetMonthlyQuota();
}
```

#### 3.2.2 PricingService（资费服务）

**职责**:
- 查询模型资费
- 计算使用费用
- 应用会员折扣

**关键方法**:
```java
public interface PricingService {
    // 获取模型资费
    ModelPricing getPricing(Long modelId, String pricingType);
    
    // 计算费用
    BigDecimal calculateCost(Long modelId, String usageType, Map<String, Object> usageData);
    
    // 应用折扣
    BigDecimal applyDiscount(BigDecimal cost, String membershipLevel);
}
```

#### 3.2.3 UsageRecordService（使用记录服务）

**职责**:
- 记录API使用
- 统计使用量
- 生成账单

**关键方法**:
```java
public interface UsageRecordService {
    // 记录使用
    void recordUsage(AIUsageRecord record);
    
    // 获取使用统计
    UsageStatistics getStatistics(Long userId, LocalDate startDate, LocalDate endDate);
    
    // 生成成本报告
    CostReport generateCostReport(LocalDate startDate, LocalDate endDate);
}
```

### 3.3 数据库设计

见2.1.1、2.2.1、2.3.2节的数据模型定义。

### 3.4 缓存策略

**Redis缓存**:
- 用户配额缓存（减少数据库查询）
- 模型资费缓存（配置变更不频繁）
- 配额扣费锁（防止并发超扣）

**缓存更新**:
- 配额变更时更新缓存
- 资费配置变更时刷新缓存
- 定时同步数据库和缓存

---

## 四、业务流程

### 4.1 AI API调用流程

```
用户发起AI请求
    ↓
API拦截器检查配额
    ↓
[配额不足?] → 是 → 返回错误，提示充值
    ↓ 否
记录请求开始（pending状态）
    ↓
调用AI模型API
    ↓
解析响应，提取Token使用量
    ↓
计算费用
    ↓
扣除配额
    ↓
记录使用记录（success）
    ↓
返回结果给用户
```

### 4.2 会员开通流程

```
用户选择订阅计划
    ↓
创建支付订单
    ↓
支付成功
    ↓
激活会员
    ↓
根据订阅计划获取配额配置
    ↓
初始化/更新用户配额
    ↓
创建配额变动记录（grant）
    ↓
通知用户配额到账
```

### 4.3 Token包购买流程

```
用户选择Token包
    ↓
创建支付订单
    ↓
支付成功
    ↓
增加用户配额
    ↓
创建配额变动记录（purchase）
    ↓
通知用户Token到账
```

### 4.4 月度配额重置流程

```
定时任务（每月1日0点）
    ↓
遍历所有活跃会员
    ↓
保存上月使用统计
    ↓
重置月度配额为计划配额
    ↓
更新last_reset_date
    ↓
创建配额变动记录（monthly_reset）
    ↓
通知用户配额已重置
```

---

## 五、非功能需求

### 5.1 性能要求

- **配额检查响应时间** < 50ms（使用缓存）
- **扣费操作响应时间** < 100ms
- **使用记录写入**：异步处理，不阻塞主流程
- **支持并发**：1000+并发配额检查

### 5.2 可靠性要求

- **数据一致性**：配额扣费必须保证数据一致
- **不丢记录**：所有使用记录必须保存
- **容错处理**：API调用失败不影响配额扣除逻辑

### 5.3 安全性要求

- **配额防刷**：防止用户绕过配额检查
- **参数验证**：所有输入参数必须验证
- **权限控制**：只有管理员可配置资费

### 5.4 可扩展性

- **新模型接入**：易于添加新模型和资费配置
- **新配额类型**：易于扩展新的配额类型
- **新定价策略**：支持灵活的定价策略

---

## 六、实施计划

### 6.1 第一阶段：基础架构（1-2周）

- [ ] 设计数据库表结构
- [ ] 创建实体类和Repository
- [ ] 实现TokenQuotaService基础功能
- [ ] 实现PricingService基础功能
- [ ] 创建管理后台API（资费配置）

### 6.2 第二阶段：计费集成（2-3周）

- [ ] 实现API拦截器
- [ ] 集成到现有AI服务调用
- [ ] 实现使用记录功能
- [ ] 实现配额检查和扣费
- [ ] 测试各种场景

### 6.3 第三阶段：会员配额（1-2周）

- [ ] 扩展会员计划表，添加配额字段
- [ ] 实现配额自动分配
- [ ] 实现月度配额重置任务
- [ ] 实现Token包购买功能
- [ ] 前端配额显示

### 6.4 第四阶段：统计与优化（1周）

- [ ] 实现使用统计API
- [ ] 实现成本统计功能
- [ ] 前端统计页面
- [ ] 性能优化
- [ ] 文档完善

---

## 七、测试计划

### 7.1 功能测试

- [ ] 配额检查和扣费准确性
- [ ] 会员配额自动分配
- [ ] 月度配额重置
- [ ] Token包购买到账
- [ ] 费用计算准确性
- [ ] 配额不足处理

### 7.2 性能测试

- [ ] 并发配额检查
- [ ] 大量使用记录写入
- [ ] 月度重置任务性能

### 7.3 压力测试

- [ ] 高并发API调用场景
- [ ] 配额扣费并发安全

---

## 八、风险与应对

### 8.1 技术风险

**风险1**: 配额扣费并发问题导致超扣  
**应对**: 使用数据库锁或分布式锁，严格测试并发场景

**风险2**: 使用记录丢失  
**应对**: 使用消息队列异步处理，失败重试机制

**风险3**: 性能瓶颈  
**应对**: 使用Redis缓存，异步处理非关键路径

### 8.2 业务风险

**风险1**: 资费配置错误导致成本失控  
**应对**: 配置审核机制，上线前测试，设置成本预警

**风险2**: 用户配额异常  
**应对**: 记录所有配额变动，支持人工调整

---

## 九、后续优化

### 9.1 短期优化

- 配额预测和推荐
- 更详细的成本分析报告
- 配额使用提醒优化

### 9.2 长期规划

- AI模型成本预测
- 动态定价策略
- 用户使用行为分析
- 成本优化建议

---

## 十、总结

本需求分析文档详细描述了大模型API计费系统的完整功能需求、技术实现方案和业务流程。系统通过精确的Token计费、灵活的配额管理和透明的使用统计，既能控制成本，又能为用户提供良好的使用体验。

系统设计考虑了性能、可靠性和可扩展性，采用模块化设计，易于维护和扩展。通过分阶段实施，可以逐步完善功能，降低开发风险。

---

**文档维护**: 本文档应随系统开发进展持续更新和完善。


