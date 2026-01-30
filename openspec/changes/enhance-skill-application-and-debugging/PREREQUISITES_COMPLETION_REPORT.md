# 📋 前置条件调查完成报告

## 执行摘要

基于对现有代码库的深入分析，以下是 5 个关键前置条件的完整调查结果。所有条件都已完成分析并提供了具体的实施方案。

**调查日期**: 2026-01-24  
**调查人**: AI Assistant  
**状态**: ✅ 完成

---

## 前置条件 1️⃣：AI 处理流程的集成点 ✅

### 调查结果

#### 现有 AI 处理流程

**关键入口**:
- **Controller**: `AIServiceController` (`main/backend/src/main/java/com/heartsphere/aiagent/controller/AIServiceController.java`)
- **Endpoint**: `POST /v1/chat/completions` (行 653)
- **Service**: `AIService` (`generateText()` 方法)

**流程链**:
```
1. 用户请求 
   ↓
2. AIServiceController.chatCompletions() (行 654)
   - 验证用户认证 (行 663)
   - 转换请求格式 (行 671)
   ↓
3. AIService.generateText(userId, internalRequest) (行 674)
   - 调用 LLM
   - 生成响应
   ↓
4. 转换为 OpenAPI 格式 (行 677)
   ↓
5. 返回响应 (行 679)
```

**消息存储**:
- **实体**: `ChatMessageEntity` (`main/backend/src/main/java/com/heartsphere/memory/entity/ChatMessageEntity.java`)
- **字段**: 
  - `sessionId` - 会话 ID
  - `role` - 消息角色（USER/ASSISTANT/SYSTEM）
  - `content` - 消息内容
  - `metadata` - JSON 元数据（可扩展）
  - `timestamp` - 时间戳

#### 推荐的集成点

**✅ 选择方案 B（最优）**: 在 LLM 响应后、返回给用户前

**具体位置**:
```java
// AIServiceController.java 行 674 附近
TextGenerationResponse internalResponse = aiService.generateText(userId, internalRequest);

// ↓ 在这里插入技能应用引擎
// 新增:
SkillApplicationResult skillResult = skillApplicationEngine.evaluateAndApply(
    internalResponse,      // AI 生成的响应
    internalRequest,       // 用户请求信息
    userId,               // 用户 ID
    conversationContext   // 对话上下文
);

// 修改响应添加技能元数据
internalResponse.setSkillApplications(skillResult.getAppliedSkills());

// ↓ 然后转换并返回
ChatCompletionResponse response = convertToOpenAPIResponse(internalResponse, request.getModel());
```

**优势**:
- ✅ LLM 已完成语义理解，评估准确
- ✅ 不阻塞 AI 响应生成
- ✅ 技能执行不影响最终响应内容
- ✅ 易于集成和测试

**实现检查点**:
- [ ] 修改 `AIServiceController.chatCompletions()` 方法
- [ ] 修改 `AIServiceController.chatCompletionsStreamInternal()` 方法（流式）
- [ ] 在 `TextGenerationResponse` 中添加 `skillApplications` 字段
- [ ] 在 `ChatCompletionResponse` 中添加 `skillApplications` 字段

---

## 前置条件 2️⃣：Breaking Changes 迁移计划 ✅

### 调查结果

#### 影响范围分析

**1. 依赖 AI 响应格式的系统**:

```
直接依赖项:
├─ MemoryController.saveChatMessage() (行 700)
│  └─ 可接受元数据字段 ✅
├─ Stream 响应处理 (行 692)
│  └─ SseEmitter 格式化
└─ 客户端集成
   └─ Web/Mobile 前端

间接依赖项:
├─ 多代理协作系统
├─ 插件系统
└─ 与第三方的集成
```

**2. 聊天记录结构分析**:

```java
// ChatMessageEntity 现有结构
@Table(name = "chat_messages")
public class ChatMessageEntity {
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;  // ← 已有 JSON 字段，可存储技能信息
}

// 元数据格式（建议）
{
  "skillApplications": [
    {
      "skillId": "recommend_system",
      "name": "推荐系统",
      "score": 85,
      "status": "COMPLETED",
      "result": {...}
    }
  ],
  "other_metadata": {...}
}
```

#### 向后兼容迁移方案

**Phase 1: 版本 v1.1（向后兼容模式）**

```yaml
时间表: Week 1-2

变更:
  - AI 响应格式
    OLD: 
      {
        "id": "...",
        "message": "AI 回复"
      }
    NEW (向后兼容):
      {
        "id": "...",
        "message": "AI 回复",
        "skillApplications": [       # 新增，可选字段
          {
            "skillId": "...",
            "name": "...",
            "status": "COMPLETED"
          }
        ]
      }

  - 聊天消息存储
    OLD: metadata = {}
    NEW: metadata = { 
      "skillApplications": [...] 
    }

  - 功能开关 (特性标志)
    skill-application:
      enabled: false  # 初始禁用
      rollout-percentage: 0
```

**关键: 所有现有系统正常工作，新字段可选**

**Phase 2: 灰度发布（周 3-8）**

```
Week 3-4: 5% 用户
  - 启用技能应用引擎
  - 收集日志和反馈
  - 验证无重大问题

Week 5-6: 25% 用户
  - 继续收集反馈
  - 优化权重配置

Week 7-8: 100% 用户
  - 全量启用
  - 监控指标
```

**Phase 3: 清理（周 9-10）**

```
移除兼容代码:
  - 删除 skillApplications 判空逻辑
  - 更新所有文档
  - 收集最终数据
```

#### 实现检查点

```yaml
数据库兼容性:
  - [ ] ChatMessageEntity 的 metadata 字段已有 JSON 支持 ✅
  - [ ] 无需修改数据库表结构
  - [ ] 历史数据自动兼容（向后兼容）

API 兼容性:
  - [ ] OpenAPI 响应格式添加可选字段
  - [ ] 客户端检查字段存在再使用
  - [ ] 保留旧格式支持

客户端兼容性:
  - [ ] Web 客户端可安全忽略新字段
  - [ ] Mobile 客户端可安全忽略新字段
  - [ ] 第三方集成无影响

特性开关:
  - [ ] 在 application.yml 中配置
  - [ ] 可动态调整（无需重启）
  - [ ] 支持按用户/组织级别的灰度
```

---

## 前置条件 3️⃣：数据库归档和保留策略 ✅

### 调查结果

#### 推荐配置

```yaml
# application.yml 配置
skill:
  execution-records:
    # 记录保留期（天）
    retention-days: 90
    
    # 归档配置
    archive:
      enabled: true
      batch-size: 10000
      schedule: "0 2 * * *"      # 每天凌晨 2 点
      target-table: "skill_execution_records_archive"
    
    # 监控告警
    monitoring:
      table-size-alert-gb: 10
      record-count-alert: 10000000

# 数据库设置
database:
  # 基于 MySQL 8.0+ 的分区策略
  partitioning:
    enabled: true
    strategy: "RANGE COLUMNS (created_at)"
    interval: "month"  # 按月分区
```

#### 容量规划

**假设条件**:
- 100 万活跃用户
- 每用户每天平均 100 条执行记录
- 每条记录约 150 字节（JSON 字段）

**增长预测**:
```
第 1 年:
  年增长: 100万 × 100 × 365 = 36.5 亿 条
  年存储: ~550 GB

第 2 年:
  累计: 73 亿 条
  累计存储: ~1.1 TB

需要的行动时间点:
  3 个月后: 执行首次归档
  1 年后: 考虑分表
  2 年后: 必须分表（避免单表超过 500GB）
```

#### 归档脚本

```sql
-- 每天凌晨 2 点执行
-- 将 90 天前的记录归档

-- 1. 移动到归档表
INSERT INTO skill_execution_records_archive
SELECT * FROM skill_execution_records
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- 2. 删除已归档记录
DELETE FROM skill_execution_records
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)
LIMIT 100000;  -- 分批删除，避免长时间锁表

-- 3. 优化表
ANALYZE TABLE skill_execution_records;
OPTIMIZE TABLE skill_execution_records;
```

#### 分表计划（1 年后执行）

```sql
-- 按 created_at 月份分表
ALTER TABLE skill_execution_records 
PARTITION BY RANGE COLUMNS (created_at) (
  PARTITION p_2026_01 VALUES LESS THAN ('2026-02-01'),
  PARTITION p_2026_02 VALUES LESS THAN ('2026-03-01'),
  ...
  PARTITION p_max VALUES LESS THAN (MAXVALUE)
);

-- 优点:
-- - 查询性能提升 30-50%
-- - 清理过期数据时只需 DROP PARTITION
-- - 自动增长管理
```

#### 实现检查点

```yaml
表设计:
  - [x] skill_execution_records 表已设计（参考提案）
  - [ ] 添加 created_at 索引（已有）✅
  - [ ] 添加 updated_at 索引

归档配置:
  - [ ] 在 application.yml 中配置保留期
  - [ ] 创建 ArchiveService
  - [ ] 配置定时任务（使用 @Scheduled）

监控告警:
  - [ ] 设置表大小监控（目标: 10GB 告警）
  - [ ] 设置记录数监控（目标: 1000万 告警）
  - [ ] 配置邮件/Slack 告警

分表计划:
  - [ ] 文档记录时间点（6 个月后执行）
  - [ ] 准备分区脚本
  - [ ] 制定执行计划
```

---

## 前置条件 4️⃣：性能目标和监控指标 ✅

### 调查结果

#### 性能目标

```yaml
关键性能指标 (KPI):

技能评分:
  目标延迟: < 50ms         # 从请求到评分完成
  P99 延迟: < 100ms
  成功率: > 99.5%

执行记录查询:
  目标延迟: < 200ms        # 单条记录查询
  P99 延迟: < 500ms
  吞吐量: > 1000 QPS

调试面板实时更新:
  目标延迟: < 1s           # WebSocket 消息延迟
  P99 延迟: < 2s

异步记录写入:
  队列堆积: < 1000 消息    # 正常情况下
  告警阈值: > 5000 消息

API 响应时间增加:
  增加延迟: < 100ms        # 添加技能引擎的开销
  告警阈值: > 200ms
```

#### Prometheus 指标定义

```yaml
metrics:
  skill_evaluation_duration_seconds:
    type: histogram
    description: "技能评估耗时"
    buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5]
    labels: [skill_id, status]
    target: < 0.05s
    
  skill_scoring_by_dimension:
    type: histogram
    description: "各维度得分分布"
    labels: [dimension]  # keyword, semantic, context, memory
    
  skill_application_count:
    type: counter
    description: "技能应用总数"
    labels: [skill_id, status, dimension]  # APPLIED, REJECTED, FAILED
    
  skill_execution_record_queue_size:
    type: gauge
    description: "异步记录队列大小"
    alert: "> 5000"
    
  skill_execution_record_write_duration:
    type: histogram
    description: "记录写入耗时"
    buckets: [0.01, 0.05, 0.1, 0.5, 1.0]
    
  skill_execution_records_table_size_bytes:
    type: gauge
    description: "表大小（字节）"
    alert: "> 10GB"
    
  skill_execution_records_count:
    type: gauge
    description: "表中记录总数"
    alert: "> 10000000"
```

#### 监控告警规则

```yaml
# prometheus-rules.yml
groups:
  - name: skill_application_alerts
    interval: 1m
    rules:
      - alert: SkillEvaluationSlow
        expr: histogram_quantile(0.99, skill_evaluation_duration_seconds) > 0.1
        for: 5m
        annotations:
          summary: "技能评估耗时过长"
          
      - alert: SkillRecordQueueBacklog
        expr: skill_execution_record_queue_size > 5000
        for: 2m
        annotations:
          summary: "异步记录队列堆积"
          
      - alert: SkillExecutionRecordTableTooLarge
        expr: skill_execution_records_table_size_bytes > 10737418240  # 10GB
        for: 10m
        annotations:
          summary: "执行记录表过大，需要归档"
```

#### 实现检查点

```yaml
Micrometer 集成:
  - [ ] 添加 Micrometer 依赖（已有）✅
  - [ ] 配置 Prometheus 导出
  - [ ] 注册自定义指标

指标收集:
  - [ ] SkillEvaluationMetrics 类
  - [ ] SkillExecutionRecordMetrics 类
  - [ ] 在相关位置添加计时和计数

Prometheus 配置:
  - [ ] prometheus.yml 配置 job
  - [ ] 告警规则部署
  - [ ] 告警通知配置

Grafana 仪表盘:
  - [ ] 创建技能应用仪表盘
  - [ ] 创建性能监控仪表盘
  - [ ] 创建告警仪表盘
```

---

## 前置条件 5️⃣：AI 处理流程细节调查 ✅

### 调查结果

#### 完整的 AI 处理流程图

```
用户请求
  ↓
POST /v1/chat/completions
  ↓
AIServiceController.chatCompletions()
  ├─ 验证用户认证
  ├─ 转换请求格式 (ChatCompletionRequest → TextGenerationRequest)
  ├─ 检查流式/非流式模式
  ↓ (非流式)
AIService.generateText()
  ├─ 检查 LLM 提供商配置
  ├─ 构建 LLM 请求
  ├─ 调用具体 LLM 实现 (OpenAI, Qwen, Doubao, etc.)
  ├─ 获取响应 (TextGenerationResponse)
  ├─ 存储对话历史
  ↓
[新增位置：技能应用引擎]
SkillApplicationEngine.evaluateAndApply()
  ├─ 评估所有可用技能
  ├─ 计算技能适用性得分
  ├─ 选择最高分技能
  ├─ 执行技能
  ├─ 记录执行结果
  ↓
转换为 OpenAPI 格式
  ├─ 添加技能元数据
  ├─ 格式化响应
  ↓
返回客户端
```

#### 关键代码位置

```
1. 主入口:
   main/backend/src/main/java/com/heartsphere/aiagent/controller/
   - AIServiceController.java (行 653-687)
     └─ POST /v1/chat/completions

2. AI 服务实现:
   main/backend/src/main/java/com/heartsphere/aiagent/service/
   - AIService.java
     └─ generateText(userId, request)
     └─ generateTextStream(userId, request, callback)

3. 消息存储:
   main/backend/src/main/java/com/heartsphere/memory/
   - ChatMessageEntity.java (聊天消息实体)
   - MemoryController.java (行 700: 保存消息)

4. 对话管理:
   main/backend/src/main/java/com/heartsphere/mailbox/service/
   - ConversationService.java (对话管理)

5. LLM 提供商实现:
   main/backend/src/main/java/com/heartsphere/aiagent/provider/
   - OpenAIProvider, QwenProvider, DoubaoProvider, etc.
```

#### 现有技能相关代码

```
技能定义管理:
  main/backend/src/main/java/com/heartsphere/skill/
  ├─ SkillController.java
  ├─ SkillService.java
  ├─ SkillDefinition.java (实体)
  └─ skill_definitions (数据库表)

技能执行:
  main/backend/src/main/java/com/heartsphere/skill/executor/
  ├─ SkillExecutor.java (基础)
  ├─ LLMBasedSkillExecutor.java (LLM 基础)
  └─ ScriptSkillExecutor.java (脚本基础)

技能应用检查点:
  ✅ 已有技能定义表
  ✅ 已有技能执行器框架
  ⚠️  缺少技能应用引擎（评估和选择逻辑）
  ⚠️  缺少执行记录追踪
```

#### 错误处理机制

```java
现有的错误处理:
1. AIServiceController 捕获异常 (行 680-686)
   - IllegalArgumentException → 400 Bad Request
   - 其他异常 → 500 Internal Server Error

2. Stream 处理异常 (行 692+)
   - 在 CompletableFuture 中捕获
   - 发送错误事件给客户端

需要保持的模式:
- 不阻塞 AI 生成过程
- 异常不影响最终响应
- 详细的日志记录
```

#### 降级策略

```
建议的降级方案:

1. 技能应用失败:
   - 不中断 AI 响应生成
   - 记录失败原因
   - 用户看不到失败
   - 后台告警

2. 记录写入队列满:
   - 启用内存缓冲
   - 定期刷新到数据库
   - 配置告警

3. 性能超出目标:
   - 自动降低评估详度
   - 减少维度计算
   - 启用快速路径
```

#### 实现检查点

```yaml
代码位置确认:
  - [x] AIServiceController.chatCompletions() ✅
  - [x] AIService.generateText() ✅
  - [x] ChatMessageEntity 元数据字段 ✅
  - [x] 现有技能系统框架 ✅

修改点准备:
  - [ ] TextGenerationResponse 添加 skillApplications 字段
  - [ ] ChatCompletionResponse 添加 skillApplications 字段
  - [ ] 在 generateText 后插入技能应用引擎调用

异常处理保持:
  - [ ] 维持现有异常处理模式
  - [ ] 添加技能应用异常处理
  - [ ] 完整的日志记录

流式处理支持:
  - [ ] 流式响应中支持技能元数据
  - [ ] 可能需要异步发送技能信息
```

---

## 📊 前置条件总结表

| 前置条件 | 状态 | 关键决策 | 风险 | 实施周期 |
|---------|------|---------|------|--------|
| 1. 集成点 | ✅ 完成 | 选择方案 B | 低 | 1-2 天 |
| 2. 迁移计划 | ✅ 完成 | 向后兼容 + 灰度 | 中 | 2-3 天 |
| 3. 数据管理 | ✅ 完成 | 90 天保留 + 归档 | 低 | 1-2 天 |
| 4. 性能基准 | ✅ 完成 | Prometheus 监控 | 低 | 1 天 |
| 5. 流程分析 | ✅ 完成 | 已确认所有位置 | 低 | 1 天 |

---

## ✅ 批准建议

**总体评估**: ✅ **已就绪启动实现**

所有 5 个前置条件都已完成详细的调查和分析：

1. ✅ **集成点明确** - 在 LLM 响应后、返回给用户前
2. ✅ **迁移策略清晰** - 向后兼容 + 灰度发布模式
3. ✅ **数据管理方案完整** - 90 天保留、自动归档、分表计划
4. ✅ **性能指标量化** - 具体的 SLA 和监控告警规则
5. ✅ **代码位置确认** - 所有关键文件和方法已识别

**下一步**:
1. 获得技术负责人确认（1 天）
2. 获得各部门签核（1 天）
3. 启动 Phase 1 实现（2月中旬）

**预期时间表**:
- 批准: 2026-01-31（下周五）
- 启动: 2026-02-10（2月中旬）
- Phase 1 完成: 2026-02-21（2周）

---

**报告生成**: 2026-01-24  
**调查对象**: enhance-skill-application-and-debugging 提案  
**调查状态**: ✅ 完成，就绪启动

