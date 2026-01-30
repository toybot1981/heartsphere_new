# 角色长期学习系统 - 快速启动检查清单

## 🚀 5 分钟快速验证

使用本清单快速验证系统是否就绪。

---

## ✅ 前置条件检查

### 环境要求

```
☐ Java 17+ 已安装
  验证: java -version
  预期: openjdk version "17" 或更高

☐ MySQL 8.0+ 已安装并运行
  验证: mysql --version
  预期: mysql Ver 8.0.x 或更高

☐ Redis 6.0+ 已安装并运行
  验证: redis-cli ping
  预期: PONG

☐ Node.js 18+ 已安装 (前端)
  验证: node --version
  预期: v18.x.x 或更高

☐ 端口可用
  ☐ 8080 (后端)
  ☐ 3000 (前端)
  ☐ 3306 (MySQL)
  ☐ 6379 (Redis)
```

### 配置文件检查

```
☐ application.yml 已配置
  - 数据库连接信息
  - Redis 连接信息
  - 定时任务配置

☐ 环境变量已设置
  - DB_PASSWORD
  - REDIS_PASSWORD (如需要)
  - JWT_SECRET (如需要)
```

---

## 🔧 后端验证 (2 分钟)

### 步骤 1: 编译验证

```bash
cd /path/to/backend
./gradlew clean build -x test

# 预期输出:
# BUILD SUCCESSFUL
```

**检查点**:
- ☐ 编译无错误
- ☐ JAR 文件已生成: `build/libs/heartsphere-*.jar`

### 步骤 2: 数据库迁移验证

```bash
# 检查迁移脚本是否存在
ls -la src/main/resources/db/migration/V20260122*.sql

# 预期: 文件存在
```

**检查点**:
- ☐ 迁移脚本文件存在
- ☐ SQL 语法正确 (可手动验证)

### 步骤 3: 启动验证

```bash
# 启动应用
java -jar build/libs/heartsphere-*.jar

# 等待 10-15 秒后，检查健康状态
curl http://localhost:8080/actuator/health

# 预期输出:
# {"status":"UP","components":{"db":{"status":"UP"},"redis":{"status":"UP"}}}
```

**检查点**:
- ☐ 应用成功启动
- ☐ 健康检查返回 UP
- ☐ 数据库连接正常
- ☐ Redis 连接正常

### 步骤 4: API 端点验证

```bash
# 测试统计端点 (需要有效的 token)
curl -X GET http://localhost:8080/api/memory/v1/character/1/stats \
  -H "Authorization: Bearer {your_token}"

# 预期: 返回 JSON 响应或 401 (未授权，但端点存在)
```

**检查点**:
- ☐ API 端点可访问
- ☐ 返回正确的状态码

---

## 💻 前端验证 (2 分钟)

### 步骤 1: 依赖安装

```bash
cd /path/to/frontend
npm install

# 预期: 无错误，依赖安装完成
```

**检查点**:
- ☐ node_modules 已创建
- ☐ 无安装错误

### 步骤 2: 编译验证

```bash
npm run build

# 预期输出:
# ✓ built in Xs
```

**检查点**:
- ☐ 编译成功
- ☐ dist 目录已创建
- ☐ 无 TypeScript 错误

### 步骤 3: 开发服务器验证

```bash
npm run dev

# 预期: 服务器在 http://localhost:3000 启动
# 浏览器访问: http://localhost:3000
```

**检查点**:
- ☐ 开发服务器启动成功
- ☐ 页面可以访问
- ☐ 无控制台错误

---

## 🗄️ 数据库验证 (1 分钟)

### 步骤 1: 表结构验证

```sql
-- 连接到数据库
mysql -u root -p heartsphere

-- 检查新表是否存在
SHOW TABLES LIKE 'character_%';

-- 预期输出:
-- +-----------------------------------+
-- | Tables_in_heartsphere (character_%) |
-- +-----------------------------------+
-- | character_knowledge_assets        |
-- | character_learning_history        |
-- +-----------------------------------+
```

**检查点**:
- ☐ `character_knowledge_assets` 表存在
- ☐ `character_learning_history` 表存在
- ☐ `characters` 表有新字段

### 步骤 2: 索引验证

```sql
-- 检查索引
SHOW INDEX FROM character_knowledge_assets;

-- 预期: 看到多个索引，包括:
-- - PRIMARY KEY
-- - idx_character_type
-- - idx_trust_score
-- - idx_created_at
```

**检查点**:
- ☐ 主键索引存在
- ☐ 复合索引存在
- ☐ 外键约束存在

---

## 🧪 功能验证 (5 分钟)

### 测试 1: 创建知识资产

```bash
# 使用 API 创建资产
curl -X POST http://localhost:8080/api/memory/v1/character/1/assets \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "assetType": "DOMAIN_KNOWLEDGE",
    "title": "测试知识资产",
    "content": "这是一个测试内容，用于验证系统功能。",
    "summary": "测试摘要"
  }'

# 预期: 返回 200 OK 和资产信息
```

**检查点**:
- ☐ 资产创建成功
- ☐ 返回正确的资产 ID
- ☐ 数据库中有记录

### 测试 2: 查询相关资产

```bash
# 查询相关资产
curl -X GET "http://localhost:8080/api/memory/v1/character/1/related-assets?query=测试&limit=10" \
  -H "Authorization: Bearer {token}"

# 预期: 返回资产列表
```

**检查点**:
- ☐ 查询成功
- ☐ 返回相关资产
- ☐ 排序正确

### 测试 3: 提交反馈

```bash
# 提交反馈 (使用上面创建的资产 ID)
curl -X POST http://localhost:8080/api/memory/v1/assets/{assetId}/feedback \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "feedbackType": "positive",
    "comment": "这个资产很有帮助"
  }'

# 预期: 返回 200 OK
```

**检查点**:
- ☐ 反馈提交成功
- ☐ 信任度已更新
- ☐ 数据库记录正确

### 测试 4: 获取学习统计

```bash
# 获取角色统计
curl -X GET http://localhost:8080/api/memory/v1/character/1/stats \
  -H "Authorization: Bearer {token}"

# 预期: 返回统计信息
```

**检查点**:
- ☐ 统计信息返回成功
- ☐ 等级计算正确
- ☐ 资产数量正确

---

## 📊 性能验证 (可选)

### 响应时间检查

```bash
# 测试记忆检索性能
time curl -X GET "http://localhost:8080/api/memory/v1/character/1/related-assets?query=测试" \
  -H "Authorization: Bearer {token}"

# 预期: 响应时间 < 100ms
```

**检查点**:
- ☐ P95 响应时间 < 100ms
- ☐ 无超时错误

---

## 🔍 日志验证

### 检查应用日志

```bash
# 查看应用日志
tail -f /var/log/heartsphere/application.log

# 或如果使用控制台输出
# 检查是否有错误或警告
```

**检查点**:
- ☐ 无 ERROR 级别日志
- ☐ 定时任务日志正常
- ☐ API 请求日志正常

---

## ✅ 完整检查清单

### 代码层面
- [ ] 后端编译无错误
- [ ] 前端编译无错误
- [ ] 所有测试通过
- [ ] 代码风格符合规范

### 数据库层面
- [ ] 迁移脚本执行成功
- [ ] 表结构正确
- [ ] 索引创建成功
- [ ] 外键约束正确

### 功能层面
- [ ] API 端点可访问
- [ ] 创建资产功能正常
- [ ] 查询资产功能正常
- [ ] 反馈功能正常
- [ ] 统计功能正常

### 性能层面
- [ ] 响应时间达标
- [ ] 无内存泄漏
- [ ] 数据库连接正常
- [ ] 缓存工作正常

### 文档层面
- [ ] API 文档完整
- [ ] 用户指南完整
- [ ] 管理员手册完整
- [ ] 故障排除指南完整

---

## 🚨 常见问题快速修复

### 问题 1: 编译失败

```bash
# 清理并重新编译
./gradlew clean
./gradlew build --refresh-dependencies
```

### 问题 2: 数据库连接失败

```bash
# 检查数据库是否运行
systemctl status mysql

# 检查连接信息
mysql -u root -p -h localhost
```

### 问题 3: 端口被占用

```bash
# 查找占用端口的进程
lsof -i :8080
lsof -i :3000

# 杀死进程或更改端口
```

### 问题 4: 迁移脚本失败

```bash
# 检查 Flyway 状态
mysql -u root -p heartsphere -e "SELECT * FROM flyway_schema_history;"

# 手动执行迁移 (谨慎!)
mysql -u root -p heartsphere < src/main/resources/db/migration/V20260122*.sql
```

---

## 📝 验证报告模板

```
验证日期: __________
验证人员: __________

环境信息:
  - Java 版本: __________
  - MySQL 版本: __________
  - Redis 版本: __________
  - Node.js 版本: __________

验证结果:
  ☐ 后端编译: 通过 / 失败
  ☐ 前端编译: 通过 / 失败
  ☐ 数据库迁移: 通过 / 失败
  ☐ API 端点: 通过 / 失败
  ☐ 功能测试: 通过 / 失败
  ☐ 性能测试: 通过 / 失败

问题记录:
  1. __________
  2. __________
  3. __________

总体评估: ☐ 通过  ☐ 失败  ☐ 需要修复

签名: __________
日期: __________
```

---

## 🎯 快速启动命令

### 一键启动脚本

```bash
#!/bin/bash
# quick-start.sh

echo "🚀 启动角色长期学习系统..."

# 1. 检查环境
echo "✓ 检查环境..."
java -version && mysql --version && redis-cli ping

# 2. 启动后端
echo "✓ 启动后端..."
cd backend && ./gradlew bootRun &

# 3. 等待后端启动
sleep 15

# 4. 检查健康状态
echo "✓ 检查后端健康..."
curl http://localhost:8080/actuator/health

# 5. 启动前端
echo "✓ 启动前端..."
cd frontend && npm run dev &

echo "✅ 系统启动完成！"
echo "后端: http://localhost:8080"
echo "前端: http://localhost:3000"
```

---

## 📞 获取帮助

如果验证过程中遇到问题：

1. **查看日志**: `/var/log/heartsphere/application.log`
2. **查看文档**: [故障排除指南](./TROUBLESHOOTING_GUIDE.md)
3. **联系支持**: tech-support@heartsphere.com

---

最后更新：2026-01-24

**祝您验证顺利！** ✅
