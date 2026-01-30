# 📋 前置条件完成指南

## 目标
完成 5 个关键前置条件，使提案获得正式批准，随后启动实现

---

## 前置条件 1️⃣：AI 处理流程的集成点

### 目标
确定技能应用引擎在 AI 处理流程中的确切位置

### 调查步骤
```bash
# 1. 查找 AI 处理流程的关键位置
find main/backend -name "*Chat*Controller" -o -name "*AI*Controller" \
  -o -name "*Conversation*Service"

# 2. 查看现有的 AI 响应生成流程
grep -r "generateResponse\|callLLM\|processMessage" \
  main/backend/src --include="*.java"

# 3. 查看聊天记录的数据结构
grep -r "class.*Chat.*Message\|class.*Conversation" \
  main/backend/src --include="*.java"
```

### 决策点
**选项 A**: 在调用 LLM 前
- 优: 可基于用户消息提前决定
- 缺: 无法基于 LLM 理解精准选择

**选项 B**: 在 LLM 响应后、生成最终响应前
- 优: 可基于 LLM 理解精准选择
- 缺: 可能改变响应

**选项 C**: 在生成响应后（异步）
- 优: 不影响响应生成
- 缺: 用户等待可能增加

### 建议
**选项 B** 最合理 - 在 LLM 生成响应内容后，但在返回给用户前调用技能引擎

---

## 前置条件 2️⃣：Breaking Changes 迁移计划

### 目标
明确 AI 响应处理流程修改的影响范围和迁移策略

### 关键问题
1. 现有哪些系统依赖 AI 响应的格式？
2. 聊天记录结构修改如何处理（需要数据迁移吗？）
3. 灰度发布策略（如何分阶段推出？）

### 建议的迁移方案

#### Phase 1: 兼容模式（v1.1）
```
AI 响应格式:
  OLD FORMAT (兼容):
    {
      "message": "AI 的回复",
      "timestamp": "..."
    }
    
  NEW FORMAT (向后兼容):
    {
      "message": "AI 的回复",
      "timestamp": "...",
      "skillApplications": [           // 新字段，可选
        {
          "skillId": "xxx",
          "name": "推荐系统",
          "status": "COMPLETED",
          "result": {...}
        }
      ]
    }
```

#### Phase 2: 逐步迁移
- Week 1-2: 发布 v1.1（向后兼容）
- Week 3-4: 5% 用户启用新功能
- Week 5-6: 25% 用户启用新功能
- Week 7-8: 100% 用户启用新功能

#### Phase 3: 清理
- 移除兼容代码
- 更新所有客户端

### 建议的灰度策略
```yaml
feature-flags:
  skill-application:
    enabled: false  # 初始禁用
    rollout-percentage: 0
    
  skill-execution-records:
    enabled: false  # 初始禁用
    rollout-percentage: 0
    
  skill-debug-panel:
    enabled: false  # 初始禁用
    rollout-percentage: 0
```

---

## 前置条件 3️⃣：数据库归档和保留策略

### 目标
定义 skill_execution_records 表的生命周期管理

### 建议配置

```yaml
# application.yml
skill:
  execution:
    # 记录保留期（天）
    record-retention-days: 90
    
    # 归档配置
    archive:
      enabled: true
      batch-size: 10000          # 每批处理 10000 条
      schedule: "0 2 * * *"      # 每天凌晨 2 点运行
      target-table: "skill_execution_records_archive"
    
    # 监控告警
    monitoring:
      table-size-alert-gb: 10    # 表大小 > 10GB 告警
      record-count-alert: 10000000  # 记录数 > 1000万 告警
```

### 分表策略（1 年后）
```
根据 conversation_id 分表:
  - skill_execution_records_2026q1 (Jan-Mar)
  - skill_execution_records_2026q2 (Apr-Jun)
  ...
  
基于时间范围自动路由查询
```

### 归档脚本示例
```sql
-- 每天凌晨 2 点执行
-- 将 90 天前的记录归档
INSERT INTO skill_execution_records_archive
SELECT * FROM skill_execution_records
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

DELETE FROM skill_execution_records
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- 重建索引
ANALYZE TABLE skill_execution_records;
```

---

## 前置条件 4️⃣：性能目标和监控指标

### 目标
定义关键性能指标和监控告警

### 建议的性能目标

| 指标 | 目标 | 告警阈值 |
|------|------|---------|
| 技能评分延迟 | < 50ms | > 100ms |
| 执行记录查询 | < 200ms | > 500ms |
| 调试面板更新 | < 1s | > 2s |
| 异步记录队列堆积 | < 1000 | > 5000 |
| API 响应时间增加 | < 100ms | > 200ms |

### 监控指标清单

```yaml
metrics:
  # 技能应用引擎
  skill.evaluation-time-ms:
    type: histogram
    description: "技能评估耗时"
    buckets: [10, 25, 50, 100, 250, 500]
    
  skill.scoring-by-dimension:
    type: histogram
    description: "各维度得分分布"
    labels: [dimension]  # keyword, semantic, context, memory
    
  skill.application-count:
    type: counter
    description: "技能应用次数"
    labels: [skill_id, status]  # APPLIED, REJECTED, FAILED
    
  # 执行记录
  skill.execution-record-queue-size:
    type: gauge
    description: "异步记录队列大小"
    alert: "> 5000"
    
  skill.execution-record-write-time:
    type: histogram
    description: "记录写入耗时"
    
  # 数据库
  skill_execution_records.table-size-gb:
    type: gauge
    description: "表大小（GB）"
    alert: "> 10"
    
  skill_execution_records.record-count:
    type: gauge
    description: "记录总数"
    alert: "> 10000000"
```

### Prometheus/New Relic 配置示例

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'heartsphere-skill'
    static_configs:
      - targets: ['localhost:9090']
    metric_path: '/actuator/prometheus'
```

---

## 前置条件 5️⃣：AI 处理流程细节调查

### 目标
理解现有的 AI 处理流程实现

### 调查清单

- [ ] **主要入口**
  - 聊天消息如何进入 AI 处理流程？
  - 是否通过特定的 Controller（如 ChatController）？
  - 消息的数据结构是什么？

- [ ] **LLM 调用**
  - LLM 调用在哪个 Service 中执行？
  - 调用前/后是否有预处理/后处理？
  - 是否支持多个 LLM 提供商？

- [ ] **聊天记录存储**
  - 聊天记录用什么实体存储（ChatMessage, Conversation, etc.）？
  - 响应的数据结构是什么？
  - 是否有元数据字段可用于存储技能信息？

- [ ] **错误处理**
  - 如果 LLM 调用失败如何处理？
  - 是否有重试机制？
  - 是否有降级策略？

- [ ] **现有的技能相关代码**
  - 是否已有技能应用的逻辑？
  - 是否有相关的配置或表？
  - 是否需要修改现有代码？

### 建议的代码审查

```bash
# 查找关键的入口点
grep -r "@RestController.*Chat\|@Service.*Chat" \
  main/backend/src/main/java/com/heartsphere --include="*.java"

# 查找 LLM 调用
grep -r "callLLM\|generateResponse\|invokeModel" \
  main/backend/src --include="*.java" -B 5 -A 5

# 查找聊天记录实体
grep -r "class ChatMessage\|class Conversation\|class Dialog" \
  main/backend/src --include="*.java" -A 20

# 查找现有的技能代码
grep -r "class.*Skill\|interface.*Skill" \
  main/backend/src --include="*.java"
```

---

## ✅ 前置条件完成清单

### 需要完成的文档

- [ ] **集成点决策文档** (1-2页)
  - 选择的选项（推荐：选项 B）
  - 具体的代码位置
  - 示意图

- [ ] **迁移计划文档** (2-3页)
  - 向后兼容策略
  - 灰度发布计划
  - 回滚方案

- [ ] **数据管理计划** (1-2页)
  - 保留策略
  - 归档脚本
  - 分表计划

- [ ] **性能基准文档** (1页)
  - 性能目标
  - 监控指标定义
  - 告警配置

- [ ] **AI 流程分析报告** (2-3页)
  - 流程图
  - 关键代码位置
  - 集成建议

---

## 📅 完成时间表

```
Day 1-2: 前置条件调查（分工进行）
  - 后端: 调查 AI 流程（2 天）
  - 架构: 制定迁移计划（2 天）
  - DBA: 规划数据管理（2 天）
  - 后端: 定义性能目标（1 天）

Day 3: 汇总报告
  - 所有文档整合
  - 决策会议准备

Day 4: 决策会议
  - 确认所有决策
  - 获得正式批准
  - 启动实现阶段
```

---

## 🚀 完成后的下一步

一旦所有前置条件完成并获得批准，启动实现阶段：

1. **后端基础实现** (阶段 1: 1-2 周)
   - 创建数据库表
   - 实现实体和 Service
   - 编写单元测试

2. **后端集成** (阶段 2: 1-2 周)
   - 创建 REST API
   - 集成 AI 处理流程
   - 配置异步处理

3. **前端实现** (阶段 3-4: 2-3 周)
   - 调试面板
   - 响应标记
   - 实时更新

4. **测试和部署** (阶段 5-6: 1-2 周)
   - 完整的功能和性能测试
   - 灰度发布
   - 监控和优化

---

## 📞 需要帮助？

如果调查过程中有问题，可以：
1. 查看 OpenSpec 的完整设计文档（`design.md`）
2. 参考现有的类似实现
3. 进行技术讨论和知识转移

---

**目标**: 在 1 周内完成所有前置条件调查  
**结果**: 获得正式批准，启动 Phase 1 实现

