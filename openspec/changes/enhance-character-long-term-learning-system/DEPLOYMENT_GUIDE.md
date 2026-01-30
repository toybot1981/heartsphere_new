# 角色长期学习系统 - 部署和上线指南

## 1. 部署清单

### 部署前检查清单

```
部署环境检查
  ☐ Java 17+ 已安装
  ☐ Spring Boot 3.2.0+ 已配置
  ☐ MySQL 8.0+ 已就绪
  ☐ Redis 6.0+ 已就绪
  ☐ 网络连接验证
  ☐ 磁盘空间充足（>5GB）

代码准备
  ☐ 代码编译无误
  ☐ 所有测试通过
  ☐ 代码审查完成
  ☐ 版本标签创建
  ☐ Git 分支合并完成

数据库准备
  ☐ 数据库备份完成
  ☐ 迁移脚本验证
  ☐ 索引创建验证
  ☐ 权限配置完成
  ☐ 连接池配置验证

配置准备
  ☐ application.yml 配置完成
  ☐ 环境变量设置完成
  ☐ 日志配置就绪
  ☐ 定时任务配置完成
  ☐ 监控告警配置完成

文档准备
  ☐ API 文档交接
  ☐ 用户文档交接
  ☐ 管理员手册交接
  ☐ 故障排除指南交接
  ☐ 部署文档准备

团队准备
  ☐ 部署人员培训完成
  ☐ 支持团队就位
  ☐ 应急方案制定
  ☐ 沟通渠道建立
  ☐ 回滚方案准备
```

---

## 2. 部署步骤

### 步骤 1: 数据库初始化

```bash
# 1. 连接到数据库
mysql -u root -p${DB_PASSWORD} -h ${DB_HOST}

# 2. 创建数据库 (如果不存在)
CREATE DATABASE IF NOT EXISTS heartsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. 验证数据库
USE heartsphere;
SHOW TABLES;

# 4. 备份现有数据
mysqldump -u root -p${DB_PASSWORD} heartsphere > /backups/heartsphere_pre_deploy_$(date +%Y%m%d).sql
```

### 步骤 2: 应用部署

```bash
# 1. 编译应用
cd /path/to/backend
./gradlew clean build -x test

# 2. 检查编译结果
ls -la build/libs/heartsphere-*.jar

# 3. 部署 JAR 文件
cp build/libs/heartsphere-*.jar /opt/heartsphere/app.jar

# 4. 启动应用
java -jar /opt/heartsphere/app.jar \
  --spring.datasource.url=jdbc:mysql://${DB_HOST}:3306/heartsphere \
  --spring.datasource.username=${DB_USER} \
  --spring.datasource.password=${DB_PASSWORD} \
  --spring.redis.host=${REDIS_HOST} \
  --spring.redis.port=${REDIS_PORT}

# 5. 验证启动
curl http://localhost:8080/actuator/health
# 预期返回: {"status":"UP"}
```

### 步骤 3: 数据库迁移

```bash
# Flyway 会自动执行迁移脚本
# 检查迁移状态
curl http://localhost:8080/actuator/health/db

# 查看迁移历史
mysql -u root -p${DB_PASSWORD} heartsphere -e \
  "SELECT * FROM flyway_schema_history;"
```

### 步骤 4: 功能验证

```bash
# 1. 测试 API 端点
curl -X GET http://localhost:8080/api/memory/v1/character/1/stats \
  -H "Authorization: Bearer {test_token}"

# 2. 检查日志
tail -f /var/log/heartsphere/application.log

# 3. 验证定时任务
grep -i "scheduled" /var/log/heartsphere/application.log

# 4. 检查缓存
redis-cli PING
# 预期返回: PONG
```

### 步骤 5: 前端部署

```bash
# 1. 编译前端
cd /path/to/frontend
npm run build

# 2. 部署到 Web 服务器
cp -r dist/* /var/www/heartsphere/

# 3. 验证前端
curl http://localhost:3000
# 应该返回 HTML 内容
```

---

## 3. 灰度发布计划

### 灰度发布时间表

```
第 1 天: 金丝雀部署 (5% 用户)
  - 部署到 1 个服务实例
  - 监控性能指标
  - 收集用户反馈
  - 预期: 无重大问题

第 2-3 天: 小范围扩展 (20% 用户)
  - 部署到 5 个服务实例
  - 扩大监控覆盖
  - 收集更多反馈
  - 预期: 系统稳定

第 4-5 天: 中等规模扩展 (50% 用户)
  - 部署到 10 个服务实例
  - 性能基准测试
  - 业务数据验证
  - 预期: 性能达标

第 6-7 天: 全量部署 (100% 用户)
  - 部署到所有实例
  - 全面监控和告警
  - 定期状态更新
  - 预期: 顺利上线
```

### 灰度发布配置

```yaml
# nginx.conf - 负载均衡配置
upstream heartsphere_backend {
  server backend1:8080 weight=5;    # 金丝雀 (5%)
  server backend2:8080 weight=19;   # 稳定版 (95%)
}

# 灰度切换脚本
#!/bin/bash
CANARY_WEIGHT=$1  # 金丝雀权重 (5, 20, 50, 100)
STABLE_WEIGHT=$((100 - CANARY_WEIGHT))

# 更新 nginx 配置
sed -i "s/weight=[0-9]*/weight=$CANARY_WEIGHT/g" /etc/nginx/upstream_canary.conf
sed -i "s/weight=[0-9]*/weight=$STABLE_WEIGHT/g" /etc/nginx/upstream_stable.conf

# 重载配置
nginx -s reload
```

### 灰度发布监控

```
监控项目                    阈值        告警条件
─────────────────────────────────────────────────
API 错误率                  < 1%       > 2%
P95 响应时间                < 100ms    > 200ms
CPU 使用率                  < 70%      > 85%
内存使用率                  < 80%      > 90%
数据库连接数                < 50       > 60
缓存命中率                  > 80%      < 70%
```

---

## 4. 回滚方案

### 快速回滚步骤

```bash
#!/bin/bash
# 快速回滚脚本
BACKUP_VERSION="2026-01-23-stable"

# 1. 停止新版本
systemctl stop heartsphere-new

# 2. 恢复数据库 (如果需要)
mysql -u root -p${DB_PASSWORD} < /backups/heartsphere_pre_deploy.sql

# 3. 启动旧版本
systemctl start heartsphere-${BACKUP_VERSION}

# 4. 验证
curl http://localhost:8080/actuator/health

# 5. 通知团队
echo "Rollback to ${BACKUP_VERSION} completed"
```

### 回滚条件

```
自动回滚触发条件:
  ✓ API 错误率 > 5% 持续 5 分钟
  ✓ 内存泄漏 (持续上升，无法释放)
  ✓ 数据库连接耗尽
  ✓ 业务数据异常 (可用性下降 > 50%)

手动回滚触发条件:
  ✓ 发现严重 Bug
  ✓ 用户大量投诉
  ✓ 性能严重下降
  ✓ 安全问题发现
```

---

## 5. 监控和告警

### 关键监控指标

```
实时性能监控:
  POST   /actuator/metrics/api.requests              (API 请求统计)
  GET    /actuator/metrics/memory.usage              (内存使用)
  GET    /actuator/metrics/process.cpu.usage         (CPU 使用)
  GET    /actuator/metrics/system.cpu.usage          (系统 CPU)
  GET    /actuator/metrics/sql.connection.pool.active (数据库连接)

业务监控:
  POST   /api/health/character-learning              (学习系统健康)
  GET    /admin/metrics/assets-created-today         (今日资产统计)
  GET    /admin/metrics/feedback-processed-today     (今日反馈统计)
  GET    /admin/metrics/level-ups-today              (今日晋升统计)
```

### 告警规则示例

```yaml
groups:
  - name: heartsphere-memory
    rules:
      # API 错误告警
      - alert: HighAPIErrorRate
        expr: rate(api_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        annotations:
          summary: "API 错误率过高 (> 1%)"
          
      # 内存告警
      - alert: HighMemoryUsage
        expr: memory_usage_percent > 90
        for: 10m
        annotations:
          summary: "内存使用率过高 (> 90%)"
          
      # 数据库连接告警
      - alert: DatabaseConnectionPoolExhausted
        expr: db_connection_pool_active > 50
        for: 5m
        annotations:
          summary: "数据库连接池接近耗尽"
          
      # 定时任务失败告警
      - alert: ScheduledJobFailure
        expr: scheduled_job_failures_total > 0
        for: 1m
        annotations:
          summary: "定时任务执行失败"
```

---

## 6. 性能基准测试

### 基准测试计划

```
测试类型      并发用户    持续时间    目标指标
─────────────────────────────────────────────
单端点测试    10-100     5 分钟    P95 < 100ms
完整流程      50-500     10 分钟   P95 < 200ms
高负载测试    1000+      15 分钟   P99 < 500ms
长期稳定性    100        1 小时    无内存泄漏
```

### 性能测试脚本

```bash
#!/bin/bash
# 使用 Apache Bench 进行性能测试

# 1. 单个 API 端点测试
ab -n 1000 -c 100 -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:8080/api/memory/v1/character/1/stats

# 2. 创建资产端点测试
for i in {1..100}; do
  curl -X POST http://localhost:8080/api/memory/v1/character/1/assets \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"assetType":"DOMAIN_KNOWLEDGE","title":"Test '$i'","content":"Test content"}'
done

# 3. 使用 JMeter 进行复杂场景测试
jmeter -n -t test_plan.jmx -l results.jtl -j jmeter.log
```

---

## 7. 上线后检查

### 24 小时内检查清单

```
系统状态
  ☐ API 可用性 > 99%
  ☐ 平均响应时间 < 100ms
  ☐ 错误率 < 0.1%
  ☐ 数据库运行正常
  ☐ 缓存命中率 > 80%

功能验证
  ☐ 创建资产成功率 100%
  ☐ 多层记忆检索正常
  ☐ 反馈处理正常
  ☐ 等级计算正确
  ☐ 定时衰减任务执行

用户反馈
  ☐ 没有严重投诉
  ☐ UI/UX 反馈正常
  ☐ 性能反馈良好
  ☐ 数据准确性验证
  ☐ 隐私保护生效

日志检查
  ☐ 没有异常错误
  ☐ 没有警告堆积
  ☐ 没有性能警告
  ☐ 安全日志正常
  ☐ 审计日志完整
```

### 7 天后检查清单

```
稳定性评估
  ☐ 系统运行稳定 (无崩溃)
  ☐ 性能稳定 (无波动)
  ☐ 数据完整性验证
  ☐ 备份策略有效

用户满意度
  ☐ 用户反馈积极
  ☐ 功能使用率高
  ☐ 错误率低
  ☐ 留存率良好

优化建议
  ☐ 收集优化建议
  ☐ 制定改进计划
  ☐ 规划下一阶段
  ☐ 文档更新
```

---

## 8. 常见部署问题

### 问题 1: 数据库迁移失败

**症状**: Flyway 迁移报错

**解决方案**:
```bash
# 1. 检查 Flyway 历史
SELECT * FROM flyway_schema_history;

# 2. 手动修复错误的迁移
DELETE FROM flyway_schema_history WHERE version = 'X.X';

# 3. 重新运行迁移
# (重启应用会自动重新执行)
```

### 问题 2: 定时任务未执行

**症状**: 衰减任务日志没有记录

**解决方案**:
```bash
# 1. 检查是否启用了 Scheduling
grep "EnableScheduling" /path/to/Application.java

# 2. 检查定时任务配置
curl http://localhost:8080/admin/scheduler/jobs

# 3. 手动触发衰减任务
curl -X POST http://localhost:8080/admin/jobs/decay \
  -H "Authorization: Bearer {admin_token}"
```

### 问题 3: 高内存占用

**症状**: 内存使用率持续上升

**解决方案**:
```bash
# 1. 检查堆内存设置
java -XX:+PrintFlagsFinal -version 2>&1 | grep -i heapsize

# 2. 增加堆内存
java -Xmx2g -Xms2g -jar app.jar

# 3. 启用内存监控
curl http://localhost:8080/actuator/metrics/memory.usage
```

---

## 9. 部署检查脚本

```bash
#!/bin/bash
# 完整的部署验证脚本

echo "🚀 开始部署验证..."

# 1. 检查 Java
echo "✓ 检查 Java..."
java -version

# 2. 检查数据库连接
echo "✓ 检查数据库..."
mysql -u root -p${DB_PASSWORD} -e "SELECT 1" > /dev/null && echo "  ✅ MySQL 正常" || echo "  ❌ MySQL 失败"

# 3. 检查 Redis
echo "✓ 检查 Redis..."
redis-cli PING > /dev/null && echo "  ✅ Redis 正常" || echo "  ❌ Redis 失败"

# 4. 启动应用
echo "✓ 启动应用..."
java -jar /opt/heartsphere/app.jar &
sleep 10

# 5. 检查 API
echo "✓ 检查 API..."
curl -s http://localhost:8080/actuator/health | grep -q "UP" && echo "  ✅ API 正常" || echo "  ❌ API 失败"

# 6. 检查数据库迁移
echo "✓ 检查数据库迁移..."
mysql -u root -p${DB_PASSWORD} heartsphere -e "SHOW TABLES LIKE 'character_%';" | grep -q "character_knowledge_assets" && echo "  ✅ 迁移成功" || echo "  ❌ 迁移失败"

echo "✅ 部署验证完成！"
```

---

最后更新：2026-01-24
