# QuotaManagementService 实现说明

## 服务概述

`QuotaManagementService` 是会员体系配额管理的核心服务，负责基于会员体系的配额查询、检查、扣减、重置和超量处理。

## 主要功能

### 1. 配额查询 (`getQuotaInfo`)
- 获取用户当前的配额信息
- 包括文本Token、图片、视频、API调用等各类配额
- 返回配额总量、已使用量、可用量

### 2. 配额检查 (`checkQuota`)
- 检查用户是否有足够的配额
- 支持所有配额类型（文本Token、图片、视频、API调用）
- 只读操作，不修改数据

### 3. 配额扣减 (`consumeQuota`)
- 扣减用户配额
- 支持所有配额类型
- 自动处理超量情况
- 记录使用记录到 `quota_usage_records` 表

### 4. 配额重置
- **月度重置** (`resetMonthlyQuota`): 每月1日重置文本Token、图片、视频配额
- **日度重置** (`resetDailyQuota`): 每日重置API调用配额

### 5. 超量处理 (`handleOverageConsumption`)
- 当配额不足时，创建超量付费记录
- 允许使用但标记为超量
- 创建 `overage_charges` 记录，状态为 `pending`

## 核心类和方法

### DTO类

#### QuotaInfo
配额信息DTO，包含：
- 用户ID、会员ID、计划类型
- 各类配额的总量、已使用量、可用量
- 配额重置日期

#### QuotaResult
配额操作结果DTO，包含：
- 操作是否成功
- 使用前后配额对比
- 是否超量及超量金额
- 使用记录ID

### 枚举类

#### QuotaType
配额类型枚举：
- `TEXT_TOKEN` - 文本Token配额
- `IMAGE` - 图片生成配额
- `VIDEO` - 视频生成配额
- `API_CALL` - API调用配额

## 使用示例

### 查询配额
```java
@Autowired
private QuotaManagementService quotaManagementService;

QuotaInfo quotaInfo = quotaManagementService.getQuotaInfo(userId);
System.out.println("可用Token: " + quotaInfo.getTextTokenAvailable());
```

### 检查配额
```java
boolean hasEnough = quotaManagementService.checkQuota(
    userId, 
    QuotaType.TEXT_TOKEN, 
    1000L
);
```

### 扣减配额
```java
QuotaResult result = quotaManagementService.consumeQuota(
    userId,
    QuotaType.TEXT_TOKEN,
    1000L,
    conversationId,  // 关联记录ID（可选）
    "conversation"   // 关联记录类型（可选）
);

if (result.isSuccess()) {
    if (result.isOverage()) {
        // 处理超量付费
        BigDecimal overageAmount = result.getOverageAmount();
    }
}
```

## 数据库表关系

1. **memberships** - 存储会员信息和配额使用量
2. **subscription_plans** - 存储订阅计划的配额配置
3. **quota_usage_records** - 记录每次配额使用
4. **overage_charges** - 记录超量付费

## 注意事项

1. **并发安全**: 配额扣减使用了数据库事务，但建议在生产环境使用悲观锁（`@Lock`）
2. **配额重置**: 重置操作由定时任务调用，建议在每月1日0点和每日0点执行
3. **超量处理**: 当前实现允许超量使用，但创建超量付费记录。可根据业务需求调整策略
4. **API调用配额**: 需要每日重置，在扣减时会自动检查并重置

## 后续优化建议

1. 添加悲观锁支持，防止并发超扣
2. 添加配额预警机制（如80%、90%时提醒）
3. 优化超量处理策略（可选择拒绝或允许）
4. 添加配额使用统计和分析功能
5. 支持配额借用（预借下月配额）

## 文件位置

- 服务类: `backend/src/main/java/com/heartsphere/service/QuotaManagementService.java`
- DTO类: `backend/src/main/java/com/heartsphere/billing/dto/QuotaInfo.java`, `QuotaResult.java`
- 枚举类: `backend/src/main/java/com/heartsphere/billing/enums/QuotaType.java`
