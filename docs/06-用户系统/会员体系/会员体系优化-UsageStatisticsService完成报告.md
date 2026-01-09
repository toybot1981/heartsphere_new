# UsageStatisticsService 完成报告

## 完成时间
2026-01-06

## 完成内容

### 1. DTO类创建 ✅

#### UsageStats.java
- **位置**: `backend/src/main/java/com/heartsphere/billing/dto/UsageStats.java`
- **功能**: 使用统计DTO
- **字段**:
  - 用户ID、会员ID、计划类型
  - 统计周期（开始/结束日期）
  - 各类配额使用统计（文本Token、图片、视频、API调用）
  - 每日使用统计列表
  - 内部类：QuotaUsageStats（配额使用统计）、DailyUsage（每日使用统计）

#### CostAnalysis.java
- **位置**: `backend/src/main/java/com/heartsphere/billing/dto/CostAnalysis.java`
- **功能**: 成本分析DTO
- **字段**:
  - 用户ID、分析周期
  - 订阅费用、超量付费、总成本
  - 平均每日成本
  - 成本分解列表（按配额类型）
  - 内部类：QuotaCostBreakdown（配额成本分解）

### 2. 服务类创建 ✅

#### UsageStatisticsService.java
- **位置**: `backend/src/main/java/com/heartsphere/service/UsageStatisticsService.java`
- **代码行数**: 440行
- **功能**: 使用统计核心服务

## 核心功能

### 1. 实时统计 ✅

#### getCurrentPeriodStats(Long userId)
- 获取当前周期（本月）使用统计
- 包含所有配额类型的使用情况
- 包含每日使用统计列表

#### getQuotaUsageRate(Long userId, QuotaType quotaType)
- 获取指定配额类型的使用率
- 返回配额总量、已使用量、可用量、使用率

### 2. 历史统计 ✅

#### getDailyUsage(Long userId, LocalDate startDate, LocalDate endDate)
- 获取指定时间范围内的每日使用统计
- 按日期分组统计各类配额使用量
- 自动填充缺失的日期（使用量为0）
- 按日期排序返回

#### getMonthlyUsage(Long userId, int months)
- 获取最近N个月的月度使用统计
- 返回每月使用统计列表

### 3. 成本分析 ✅

#### calculateUsageCost(Long userId, LocalDate startDate, LocalDate endDate)
- 计算指定时间范围内的使用成本
- 主要统计超量付费

#### getCostAnalysis(Long userId, LocalDate startDate, LocalDate endDate)
- 获取完整的成本分析
- 包含订阅费用、超量付费、总成本
- 计算平均每日成本
- 按配额类型分解成本

### 4. 辅助方法 ✅

#### buildUsageStats
- 构建使用统计DTO
- 从使用记录中统计各类配额使用量
- 构建配额使用统计和每日使用统计

#### buildQuotaUsageStats
- 构建配额使用统计
- 计算可用量和使用率

#### buildCostBreakdown
- 构建成本分解
- 按配额类型分组统计超量付费

## 技术实现

### 数据来源

1. **配额使用记录** (`quota_usage_records`)
   - 统计各类配额的使用量
   - 按时间范围查询

2. **超量付费记录** (`overage_charges`)
   - 统计超量付费金额
   - 按配额类型分解成本

3. **会员和订阅计划**
   - 获取配额配置信息
   - 获取超量价格配置

### 统计算法

#### 使用量统计
- 从 `quota_usage_records` 表中按时间范围查询
- 按配额类型分组统计
- 使用 Java Stream API 进行聚合计算

#### 成本计算
- 订阅费用：从订阅计划价格获取
- 超量费用：从 `overage_charges` 表中统计已支付的费用
- 总成本：订阅费用 + 超量费用
- 平均每日成本：总成本 / 天数

#### 使用率计算
```
使用率 = (已使用量 / 配额总量) × 100%
```

## 使用示例

### 获取当前周期统计
```java
@Autowired
private UsageStatisticsService statisticsService;

UsageStats currentStats = statisticsService.getCurrentPeriodStats(userId);

System.out.println("文本Token使用: " + currentStats.getTextTokenStats().getUsed() + 
                   " / " + currentStats.getTextTokenStats().getQuotaTotal());
System.out.println("使用率: " + currentStats.getTextTokenStats().getUsageRate() + "%");
```

### 获取每日使用统计
```java
LocalDate startDate = LocalDate.now().minusDays(7);
LocalDate endDate = LocalDate.now();

List<UsageStats.DailyUsage> dailyUsage = statisticsService.getDailyUsage(userId, startDate, endDate);

for (UsageStats.DailyUsage daily : dailyUsage) {
    System.out.println(daily.getDate() + ": Token=" + daily.getTextTokenUsed());
}
```

### 获取成本分析
```java
LocalDate startDate = LocalDate.now().minusMonths(1);
LocalDate endDate = LocalDate.now();

CostAnalysis analysis = statisticsService.getCostAnalysis(userId, startDate, endDate);

System.out.println("订阅费用: " + analysis.getSubscriptionCost());
System.out.println("超量费用: " + analysis.getOverageCost());
System.out.println("总成本: " + analysis.getTotalCost());
System.out.println("平均每日成本: " + analysis.getAverageDailyCost());
```

### 获取配额使用率
```java
UsageStats.QuotaUsageStats tokenStats = statisticsService.getQuotaUsageRate(
    userId, 
    QuotaType.TEXT_TOKEN
);

System.out.println("使用率: " + tokenStats.getUsageRate() + "%");
```

## 数据库集成

### 使用的表
1. **quota_usage_records** - 配额使用记录
2. **overage_charges** - 超量付费记录
3. **memberships** - 会员信息
4. **subscription_plans** - 订阅计划

### 使用的服务
1. `MembershipService` - 获取会员信息
2. `QuotaManagementService` - 获取配额信息
3. `QuotaUsageRecordRepository` - 查询使用记录
4. `OverageChargeRepository` - 查询超量付费记录

## 代码质量

- ✅ 使用Lombok简化代码
- ✅ 使用@Slf4j记录日志
- ✅ 使用@Transactional(readOnly = true)优化只读操作
- ✅ 完整的JavaDoc注释
- ✅ 异常处理完善
- ✅ 代码结构清晰
- ✅ 使用Java Stream API进行数据处理

## 文件清单

### 新建文件
- `backend/src/main/java/com/heartsphere/service/UsageStatisticsService.java` (440行)
- `backend/src/main/java/com/heartsphere/billing/dto/UsageStats.java` (131行)
- `backend/src/main/java/com/heartsphere/billing/dto/CostAnalysis.java` (93行)

### 代码统计
- 服务类：440行
- DTO类：224行（UsageStats: 131行，CostAnalysis: 93行）
- 总计：664行代码

## 后续优化建议

1. **缓存优化**: 统计查询可以添加缓存，减少数据库查询
2. **聚合表**: 可以考虑创建聚合表，提高查询性能
3. **异步统计**: 大数据量统计可以使用异步处理
4. **导出功能**: 支持导出统计报表（Excel/CSV）
5. **可视化数据**: 提供更丰富的统计图表数据

## 注意事项

1. **性能优化**: 大量历史数据统计可能需要优化查询
2. **数据精度**: 成本计算使用BigDecimal确保精度
3. **日期处理**: 使用LocalDate和LocalDateTime处理日期时间
4. **空值处理**: 完善的null值处理，避免NPE

---

**状态**: ✅ UsageStatisticsService 已完成，第三步后端服务开发全部完成！
