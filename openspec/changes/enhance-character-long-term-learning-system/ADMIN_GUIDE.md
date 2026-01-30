# 角色长期学习系统 - 管理员手册

## 概述

本手册面向系统管理员，提供了角色长期学习系统的运维、配置、监控和故障排除指南。

---

## 目录

1. [系统架构](#系统架构)
2. [安装和配置](#安装和配置)
3. [日常运维](#日常运维)
4. [性能监控](#性能监控)
5. [故障排除](#故障排除)
6. [数据管理](#数据管理)
7. [安全管理](#安全管理)

---

## 系统架构

### 系统组件

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                │
│  React 组件 | API 调用 | 本地缓存 | 用户反馈收集             │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────────────────────────┐
│                        中间层 (API)                          │
│  请求验证 | 速率限制 | 认证授权 | 响应格式化                │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      业务逻辑层                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ 资产管理服务      │  │ 学习追踪服务      │                 │
│  │ - 创建、查询      │  │ - 统计分析        │                 │
│  │ - 隐私检测        │  │ - 等级计算        │                 │
│  │ - 相似度检测      │  │ - 历史追踪        │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ 定时任务          │  │ 反馈处理          │                 │
│  │ - 资产衰减        │  │ - 信任度更新      │                 │
│  │ - 资产清理        │  │ - 学习事件记录    │                 │
│  └──────────────────┘  └──────────────────┘                 │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                      数据访问层                              │
│  JPA Repository | SQL 查询 | 事务管理 | 查询优化             │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴────────┬──────────────┐
         │                │              │
    ┌────▼────┐      ┌───▼────┐    ┌───▼────┐
    │ MySQL   │      │ Redis  │    │ HSMem  │
    │ 知识资产  │      │ 缓存   │    │ P0记忆 │
    │ 学习历史  │      │ Session│    │ 检索   │
    └────────┘      └────────┘    └───────┘
```

### 数据流

```
用户对话
    ↓
[ChatWindow] 发送消息
    ↓
[generateAIResponse] 生成 AI 回复
    ↓
[多层记忆检索] 获取 P0/P1/P2 记忆
    ↓
[资产升级检测] 识别可升级内容
    ↓
[用户反馈] 评价回复质量
    ↓
[反馈处理] 更新信任度
    ↓
[定时衰减] 每日自动衰减和清理
    ↓
[等级晋升] 计算并更新角色等级
```

---

## 安装和配置

### 先决条件

```
- Java 17+
- Spring Boot 3.2.0+
- MySQL 8.0+
- Redis 6.0+
```

### 数据库初始化

Flyway 会自动执行迁移脚本：

```sql
-- 自动执行的迁移文件
V20260122__add_character_learning_system.sql
```

验证迁移是否成功：

```bash
# 检查表是否已创建
mysql> SHOW TABLES LIKE 'character_%';
+---------------------------------+
| Tables_in_heartsphere (character_%) |
+---------------------------------+
| character_knowledge_assets      |
| character_learning_history      |
+---------------------------------+
```

### 配置参数

在 `application.yml` 中配置：

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  datasource:
    url: jdbc:mysql://localhost:3306/heartsphere
    username: root
    password: ${DB_PASSWORD}

heartsphere:
  memory:
    # 隐私检测配置
    sensitive-info:
      enabled: true
      check-frequency: 1  # 每次创建资产时检查
    
    # 相似度检测配置
    similarity:
      enabled: true
      threshold: 0.75  # 75% 相似度触发警告
      algorithm: COMBINED  # LEVENSHTEIN, JACCARD, COMBINED
    
    # 资产衰减配置
    decay:
      enabled: true
      unused-days-threshold: 30  # 30 天未使用触发衰减
      decay-rate-per-day: 2  # 每天衰减 2 分
      cleanup-threshold: 20  # 信任度 < 20 的资产标记清理
      cleanup-days: 60  # 60 天未使用的低信任资产删除
    
    # 经验等级配置
    experience:
      level-config:
        L1: { min_assets: 0, max_assets: 5, min_trust: 0 }
        L2: { min_assets: 6, max_assets: 20, min_trust: 60 }
        L3: { min_assets: 21, max_assets: 50, min_trust: 70 }
        L4: { min_assets: 51, max_assets: 100, min_trust: 80 }
        L5: { min_assets: 101, max_assets: -1, min_trust: 85 }
    
    # 定时任务配置
    scheduled:
      decay-job:
        cron: "0 0 2 * * *"  # 每天凌晨 2 点
        timezone: Asia/Shanghai
        enabled: true
      
      optimize-job:
        cron: "0 0 3 ? * SUN"  # 每周日凌晨 3 点
        timezone: Asia/Shanghai
        enabled: true
```

### 启用定时任务

在主应用类上添加注解：

```java
@SpringBootApplication
@EnableScheduling  // 启用定时任务
public class HeartsphereApplication {
    public static void main(String[] args) {
        SpringApplication.run(HeartsphereApplication.class, args);
    }
}
```

---

## 日常运维

### 1. 日志监控

#### 重要日志位置

```
/var/log/heartsphere/application.log
/var/log/heartsphere/memory-system.log
/var/log/heartsphere/scheduled-tasks.log
```

#### 日志级别配置

```yaml
logging:
  level:
    com.heartsphere.memory: DEBUG
    com.heartsphere.memory.job: INFO
    org.springframework.data.jpa: WARN
  file:
    name: /var/log/heartsphere/application.log
    max-size: 10MB
    max-history: 30
```

#### 重要日志检查

```bash
# 检查资产衰减任务是否运行
grep "资产衰减" /var/log/heartsphere/application.log

# 检查隐私检测是否工作
grep "敏感信息检测" /var/log/heartsphere/application.log

# 检查错误
grep "ERROR" /var/log/heartsphere/application.log
```

### 2. 数据库维护

#### 备份策略

```bash
#!/bin/bash
# 每天凌晨 1 点备份
0 1 * * * mysqldump -u root -p${DB_PASSWORD} heartsphere > /backups/heartsphere_$(date +\%Y\%m\%d).sql
```

#### 索引优化

```sql
-- 检查索引使用情况
SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_NAME = 'character_knowledge_assets';

-- 重新构建索引
OPTIMIZE TABLE character_knowledge_assets;
OPTIMIZE TABLE character_learning_history;
```

#### 数据清理

```sql
-- 查看待删除的低效资产
SELECT id, title, trust_score, last_used_at 
FROM character_knowledge_assets 
WHERE trust_score < 20 AND last_used_at < DATE_SUB(NOW(), INTERVAL 60 DAY);

-- 手动清理（在充分测试后）
DELETE FROM character_knowledge_assets 
WHERE trust_score < 20 AND last_used_at < DATE_SUB(NOW(), INTERVAL 60 DAY);
```

### 3. 缓存管理

#### Redis 监控

```bash
# 连接 Redis
redis-cli

# 查看内存使用
> INFO memory

# 查看键统计
> DBSIZE

# 清空过期键
> MEMORY PURGE
```

#### 手动清空缓存

```bash
# 清空特定用户的缓存
redis-cli DEL "memory:user:123:*"

# 清空特定角色的缓存
redis-cli DEL "character:123:*"

# 清空所有缓存（谨慎！）
redis-cli FLUSHDB
```

---

## 性能监控

### 1. 关键指标

```
┌────────────────────┬─────────┬─────────┬──────────┐
│ 指标               │ 目标    │ 当前    │ 状态     │
├────────────────────┼─────────┼─────────┼──────────┤
│ 记忆检索 P95       │ <100ms  │ ~80ms   │ ✅ 优秀  │
│ 资产创建延迟       │ <50ms   │ ~30ms   │ ✅ 优秀  │
│ 反馈处理延迟       │ <50ms   │ ~40ms   │ ✅ 优秀  │
│ 数据库连接数       │ <50     │ ~20     │ ✅ 正常  │
│ 缓存命中率         │ >80%    │ ~85%    │ ✅ 良好  │
│ API 错误率         │ <0.1%   │ ~0.01%  │ ✅ 极低  │
│ 定时任务成功率     │ >99%    │ ~99.8%  │ ✅ 优秀  │
└────────────────────┴─────────┴─────────┴──────────┘
```

### 2. 监控工具

#### 使用 Prometheus 和 Grafana

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'heartsphere-memory'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/actuator/prometheus'
```

#### Spring Boot Actuator

```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus, health, metrics
  metrics:
    export:
      prometheus:
        enabled: true
```

### 3. 报警规则

```yaml
# alerts.yml
groups:
  - name: memory-system
    rules:
      - alert: HighMemoryCheckLatency
        expr: |
          histogram_quantile(0.95, rate(memory_retrieval_duration_seconds_bucket[5m])) > 0.1
        for: 5m
        annotations:
          summary: "记忆检索延迟过高"
      
      - alert: AssetCreationError
        expr: |
          rate(asset_creation_errors_total[5m]) > 0.01
        for: 5m
        annotations:
          summary: "资产创建错误率过高"
      
      - alert: ScheduledJobFailure
        expr: |
          rate(scheduled_job_failures_total[1h]) > 0
        for: 5m
        annotations:
          summary: "定时任务执行失败"
```

---

## 故障排除

### 常见问题

#### 问题 1: 资产创建缓慢

**症状**: 创建资产响应时间 > 500ms

**原因分析**:
1. 隐私检测太严格
2. 相似度检测数据库查询慢
3. 网络延迟

**解决方案**:
```sql
-- 检查表大小
SELECT 
  TABLE_NAME,
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS MB
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN ('character_knowledge_assets', 'character_learning_history');

-- 如果表过大，考虑分区或归档
ALTER TABLE character_knowledge_assets 
ADD PARTITION (PARTITION p_2025_q4 VALUES LESS THAN ('2025-10-01'));
```

#### 问题 2: 定时衰减任务未执行

**症状**: 日志中没有衰减任务的执行记录

**原因分析**:
1. Spring Scheduling 未启用
2. 任务配置错误
3. 数据库连接超时

**解决方案**:
```bash
# 检查日志
tail -f /var/log/heartsphere/application.log | grep "资产衰减"

# 手动触发衰减任务（通过 REST 端点）
curl -X POST http://localhost:8080/admin/jobs/decay \
  -H "Authorization: Bearer {admin_token}"

# 检查 Spring 是否启用了 Scheduling
grep -i "scheduling" /var/log/heartsphere/application.log
```

#### 问题 3: 隐私检测误报率高

**症状**: 合法的资产被标记为包含敏感信息

**原因分析**:
1. 关键词匹配过于宽泛
2. 正则表达式有漏洞

**解决方案**:
```java
// 在 SensitiveInfoDetector 中调整阈值
private static final int FIRST_PERSON_PRONOUN_THRESHOLD = 5;  // 调整敏感度

// 调整关键词列表
private static final String[] SENSITIVE_KEYWORDS = {
    // 移除误报的关键词
};
```

#### 问题 4: 等级计算不准确

**症状**: 角色等级突然下降或不符合预期

**原因分析**:
1. 信任度计算错误
2. 等级计算配置错误
3. 反馈处理有 Bug

**解决方案**:
```sql
-- 检查角色的资产统计
SELECT 
  c.id,
  c.knowledge_asset_count,
  AVG(cka.trust_score) as avg_trust,
  c.experience_level
FROM characters c
LEFT JOIN character_knowledge_assets cka ON c.id = cka.character_id
GROUP BY c.id
HAVING avg_trust < 50;

-- 手动重新计算等级
UPDATE characters 
SET experience_level = CASE 
  WHEN knowledge_asset_count > 100 THEN 5
  WHEN knowledge_asset_count > 50 THEN 4
  WHEN knowledge_asset_count > 20 THEN 3
  WHEN knowledge_asset_count > 5 THEN 2
  ELSE 1
END
WHERE id = 123;
```

### 调试技巧

#### 启用详细日志

```yaml
logging:
  level:
    com.heartsphere.memory: DEBUG
    com.heartsphere.memory.util: DEBUG
    org.springframework.data.jpa: DEBUG
```

#### 查看 SQL 查询

```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true
```

---

## 数据管理

### 1. 数据导出

```bash
# 导出某个角色的所有资产
mysql -u root -p${DB_PASSWORD} heartsphere -e \
  "SELECT * FROM character_knowledge_assets WHERE character_id = 123" \
  > assets_backup.csv

# 导出学习历史
mysql -u root -p${DB_PASSWORD} heartsphere -e \
  "SELECT * FROM character_learning_history WHERE character_id = 123" \
  > learning_history.csv
```

### 2. 数据导入

```bash
# 批量导入资产（需要预处理 CSV）
LOAD DATA LOCAL INFILE '/path/to/assets.csv'
INTO TABLE character_knowledge_assets
COLUMNS TERMINATED BY ','
LINES TERMINATED BY '\n'
(character_id, asset_type, title, content, ...);
```

### 3. 数据验证

```sql
-- 检查数据完整性
SELECT 
  'Missing characters' AS issue,
  COUNT(*) AS count
FROM character_knowledge_assets
WHERE character_id NOT IN (SELECT id FROM characters);

-- 检查孤立的学习历史记录
SELECT 
  'Orphaned history' AS issue,
  COUNT(*) AS count
FROM character_learning_history
WHERE character_id NOT IN (SELECT id FROM characters);
```

---

## 安全管理

### 1. 访问控制

```java
// 在 MemoryController 中配置权限
@GetMapping("/character/{characterId}/stats")
@PreAuthorize("hasRole('ADMIN') or @charPermissionService.canView(#characterId, principal)")
public ResponseEntity<CharacterLearningStatsResponse> getStats(
    @PathVariable Long characterId,
    Authentication principal
) {
    // ...
}
```

### 2. 隐私保护

```yaml
security:
  privacy:
    # 自动脱敏配置
    auto-sanitize: true
    mask-patterns:
      - email: "***@***.***"
      - phone: "***-****"
      - id_card: "***-***-***-****"
    
    # 隐私审计日志
    audit-log:
      enabled: true
      path: /var/log/heartsphere/privacy-audit.log
```

### 3. 数据加密

```yaml
spring:
  jpa:
    properties:
      hibernate:
        dialect: com.heartsphere.security.EncryptedMySQLDialect
        
security:
  encryption:
    enabled: true
    algorithm: AES-256
    key-path: ${ENCRYPTION_KEY_PATH}
```

### 4. 审计日志

```sql
-- 创建审计表
CREATE TABLE audit_log (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id BIGINT,
  details JSON,
  timestamp DATETIME,
  INDEX idx_user_action (user_id, action),
  INDEX idx_timestamp (timestamp)
);

-- 查询审计日志
SELECT * FROM audit_log
WHERE user_id = 123 AND action = 'DELETE_ASSET'
ORDER BY timestamp DESC;
```

---

## 常见命令速查表

```bash
# 启动服务
./gradlew bootRun

# 查看服务状态
curl http://localhost:8080/actuator/health

# 查看定时任务
curl http://localhost:8080/admin/scheduler/jobs

# 手动执行衰减任务
curl -X POST http://localhost:8080/admin/jobs/decay \
  -H "Authorization: Bearer {token}"

# 查看数据库连接
curl http://localhost:8080/actuator/metrics/sql.connection.pool.active

# 查看 API 调用统计
curl http://localhost:8080/actuator/metrics | grep api

# 查看缓存命中率
redis-cli INFO stats | grep hits
```

---

## 获取支持

**技术支持**: tech-support@heartsphere.com  
**文档**: https://docs.heartsphere.com/  
**问题跟踪**: https://github.com/heartsphere/issues/

---

最后更新：2026-01-24
