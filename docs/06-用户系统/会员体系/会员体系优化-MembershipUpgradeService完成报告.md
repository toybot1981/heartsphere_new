# MembershipUpgradeService 完成报告

## 完成时间
2026-01-06

## 完成内容

### 1. DTO类创建 ✅

#### UpgradeResult.java
- **位置**: `backend/src/main/java/com/heartsphere/billing/dto/UpgradeResult.java`
- **功能**: 升级/降级结果DTO
- **字段**:
  - 操作结果（成功/失败）
  - 用户ID、原计划ID、目标计划ID
  - 操作类型（upgrade/downgrade）
  - 价格信息（金额、剩余价值、目标价格、实际支付金额）
  - 配额转换信息（JSON格式）
  - 新的会员信息（ID、状态、到期时间）
  - 错误消息

### 2. 服务类创建 ✅

#### MembershipUpgradeService.java
- **位置**: `backend/src/main/java/com/heartsphere/service/MembershipUpgradeService.java`
- **代码行数**: 449行
- **功能**: 会员升级/降级核心服务

## 核心功能

### 1. 升级功能 ✅

#### upgradeMembership(Long userId, Long targetPlanId)
- 升级会员到目标计划
- 计算升级价格（按比例）
- 转换配额（按比例）
- 更新会员信息
- 记录升级信息

**升级逻辑**：
1. 验证是否可以升级（层级检查）
2. 计算升级价格（目标计划价格 - 剩余价值）
3. 按比例转换配额使用量
4. 更新会员信息
5. 保存升级记录

### 2. 降级功能 ✅

#### downgradeMembership(Long userId, Long targetPlanId)
- 降级会员到目标计划
- 调整配额（确保不超过目标配额）
- 更新会员信息
- 记录降级信息

**降级逻辑**：
1. 验证是否可以降级（层级检查）
2. 调整配额使用量（不超过目标配额）
3. 更新会员信息（立即生效或下个周期生效）
4. 保存降级记录

### 3. 价格计算 ✅

#### calculateUpgradePrice(Long userId, Long targetPlanId)
- 计算升级价格（对外接口）
- 返回需要支付的金额

#### calculateUpgradePrice(Membership, SubscriptionPlan, SubscriptionPlan)
- 内部价格计算方法
- 按比例计算剩余时间价值
- 升级价格 = 目标计划价格 - 剩余价值

#### calculateRemainingValue(Membership, SubscriptionPlan)
- 计算当前计划的剩余价值
- 基于剩余天数按比例计算
- 公式：计划价格 × (剩余天数 / 总天数)

### 4. 配额转换 ✅

#### convertQuota(Membership, SubscriptionPlan, SubscriptionPlan)
- 升级时按比例转换配额使用量
- 支持文本Token、图片、视频配额
- 确保转换后的使用量不超过目标配额

#### adjustQuotaForDowngrade(Membership, SubscriptionPlan, SubscriptionPlan)
- 降级时调整配额使用量
- 确保使用量不超过目标配额
- 如果超过，调整为目标配额上限

#### calculateQuotaConversionRatio(SubscriptionPlan, SubscriptionPlan)
- 计算配额转换比例
- 基于文本Token配额比例

### 5. 辅助方法 ✅

#### canUpgrade/canDowngrade
- 验证是否可以升级/降级
- 基于计划层级判断（free < basic < standard < premium）

#### getPlanLevel(String planType)
- 获取计划层级
- free=0, basic=1, standard=2, premium=3

#### updateMembershipForUpgrade/updateMembershipForDowngrade
- 更新会员信息
- 升级：立即生效
- 降级：立即生效（可根据业务需求调整为下个周期生效）

#### buildQuotaConversionInfo
- 构建配额转换信息（JSON格式）
- 包含转换前后的配额和使用量

## 技术实现

### 价格计算算法

#### 剩余价值计算
```
剩余价值 = 计划价格 × (剩余天数 / 总天数)
```

#### 升级价格计算
```
升级价格 = 目标计划价格 - 当前计划剩余价值
```

如果升级价格 < 0，则设为 0（免费升级）

### 配额转换算法

#### 升级时配额转换
```
转换后使用量 = 当前使用量 × (目标配额 / 当前配额)
最终使用量 = min(转换后使用量, 目标配额)
```

#### 降级时配额调整
```
最终使用量 = min(当前使用量, 目标配额)
```

### 计划层级体系

- free (0) < basic (1) < standard (2) < premium (3)
- 只能从低层级升级到高层级
- 只能从高层级降级到低层级

## 使用示例

### 升级会员
```java
@Autowired
private MembershipUpgradeService upgradeService;

// 计算升级价格
BigDecimal upgradePrice = upgradeService.calculateUpgradePrice(userId, targetPlanId);

// 执行升级
UpgradeResult result = upgradeService.upgradeMembership(userId, targetPlanId);

if (result.isSuccess()) {
    // 创建支付订单
    // 支付成功后，会员已升级
    System.out.println("升级价格: " + result.getActualPaymentAmount());
    System.out.println("配额转换信息: " + result.getQuotaConversionInfo());
}
```

### 降级会员
```java
// 执行降级
UpgradeResult result = upgradeService.downgradeMembership(userId, targetPlanId);

if (result.isSuccess()) {
    // 降级成功（通常下个周期生效）
    System.out.println("降级成功，新计划: " + result.getToPlanId());
}
```

## 数据库集成

### 使用的表
1. **memberships** - 会员信息
2. **subscription_plans** - 订阅计划

### 使用的服务
1. `MembershipService` - 获取会员信息
2. `MembershipRepository` - 保存会员信息
3. `SubscriptionPlanRepository` - 获取订阅计划

### 更新的字段
- `plan_id` - 计划ID
- `plan_type` - 计划类型
- `renewal_price` - 续费价格
- `upgrade_from_plan_id` - 升级前计划ID（仅升级时）
- 配额使用量字段（转换后）

## 代码质量

- ✅ 使用Lombok简化代码
- ✅ 使用@Slf4j记录日志
- ✅ 使用@Transactional管理事务
- ✅ 完整的JavaDoc注释
- ✅ 异常处理完善
- ✅ 代码结构清晰
- ✅ 价格计算精确（使用BigDecimal，保留2位小数）

## 业务规则

### 升级规则
1. 只能从低层级升级到高层级
2. 升级价格 = 目标计划价格 - 剩余价值
3. 配额按比例转换
4. 立即生效

### 降级规则
1. 只能从高层级降级到低层级
2. 降级通常不退款（可根据业务需求调整）
3. 配额使用量调整为不超过目标配额
4. 立即生效（可根据业务需求调整为下个周期生效）

### 特殊情况
- 免费计划升级：直接支付目标计划价格
- 配额为0：重置使用量为0
- 剩余时间为0或负数：剩余价值为0
- 升级价格为负数：设为0（免费升级）

## 文件清单

### 新建文件
- `backend/src/main/java/com/heartsphere/service/MembershipUpgradeService.java` (449行)
- `backend/src/main/java/com/heartsphere/billing/dto/UpgradeResult.java` (78行)

### 代码统计
- 服务类：449行
- DTO类：78行
- 总计：527行代码

## 后续优化建议

1. **降级策略**: 可以添加降级生效时机配置（立即生效/下个周期生效）
2. **退款处理**: 降级时可以计算并处理退款
3. **升级优惠**: 可以添加升级折扣或优惠活动
4. **配额保护**: 升级时可以保留部分配额不转换
5. **升级通知**: 升级/降级后发送通知

## 注意事项

1. **价格精度**: 使用BigDecimal确保价格计算精确
2. **配额转换**: 转换比例基于文本Token配额，可能不够精确
3. **降级策略**: 当前实现为立即生效，可根据业务需求调整
4. **并发安全**: 升级/降级操作使用事务保护
5. **支付集成**: 升级需要创建支付订单，降级可能需要退款处理

---

**状态**: ✅ MembershipUpgradeService 已完成，可以继续开发其他服务
