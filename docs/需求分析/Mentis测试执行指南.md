# Mentis 测试执行指南

## 快速开始

### 1. 全面测试脚本（推荐）⭐

```bash
# 使用默认配置（后端：http://localhost:8082，账号：admin/admin123）
./scripts/test-mentis-comprehensive.sh

# 指定后端地址和账号
./scripts/test-mentis-comprehensive.sh http://localhost:8082 admin admin123
```

**测试覆盖**：
- ✅ CHAT 类型任务
- ✅ COMMAND 类型任务
- ✅ SCRIPT 类型任务
- ✅ **COMPUTER_USE 类型任务**（查天气、搜索信息等）

### 2. Shell 脚本测试（基础）

```bash
# 使用默认账号
./scripts/test-mentis.sh

# 指定管理员账号
./scripts/test-mentis.sh admin your_password
```

### 3. Python 脚本测试（更详细）

```bash
# 需要安装 requests 库
pip install requests

# 运行测试
python3 scripts/test-mentis-api.py

# 指定服务器地址和账号
python3 scripts/test-mentis-api.py http://localhost:8082 admin admin123
```

### 4. Java 集成测试

```bash
cd mentis/backend
mvn test -Dtest=AdminMentisIntegrationTest
```

---

## 测试覆盖范围

### ✅ 已测试
- 管理员认证
- 会话创建、查询
- 同步消息发送
- 流式消息发送
- 错误处理（无效token、无效会话）
- **CHAT 类型任务识别和执行**
- **COMMAND 类型任务识别和执行**
- **SCRIPT 类型任务识别和执行**
- **COMPUTER_USE 类型任务识别和执行** ⭐
- **任务分解为多个步骤** ⭐
- **意图识别优化（查询类任务识别为 COMPUTER_USE）** ⭐

### 🔄 待测试
- 虚拟机状态管理（详细测试）
- 命令安全性验证（详细测试）
- 并发性能测试
- GUI 自动化操作（浏览器操作）的详细验证

---

## 测试环境配置

### 必需配置

1. **数据库迁移**
   ```sql
   -- 确认表已创建
   SHOW TABLES LIKE 'mentis%';
   ```

2. **应用配置**
   ```yaml
   # application.yml
   mentis:
     enabled: true
   ```

3. **管理员账号**
   - 确保存在测试管理员账号
   - 默认：admin / admin123

---

## 常见问题

### Q: 测试脚本报错 "连接拒绝"
A: 检查后端服务是否运行在指定端口（默认8080）

### Q: 管理员登录失败
A: 检查管理员账号是否存在，或使用正确的用户名和密码

### Q: 流式响应没有收到数据
A: 检查后端日志，确认 SSE 连接是否建立成功

---

## 测试话术文档

### 📝 完整测试话术
详细测试话术请参考：`docs/TESTING_DIALOGUES.md`

**重点场景**：
- ⭐⭐⭐ **COMPUTER_USE 场景**：查天气、搜索信息、查询资料等
- CHAT 场景：简单问候、知识问答
- COMMAND 场景：执行系统命令
- SCRIPT 场景：执行脚本代码

### 📋 快速参考
快速测试参考：`docs/TESTING_QUICK_REFERENCE.md`

---

## 测试报告

测试完成后，查看：
- Shell 脚本输出：显示通过/失败统计
- Python 脚本：详细的测试结果和响应内容
- Java 测试：JUnit 测试报告
- **全面测试脚本**：`scripts/test-mentis-comprehensive.sh` 的输出

---

## 相关文档

- **测试话术文档**：`docs/TESTING_DIALOGUES.md`
- **快速参考**：`docs/TESTING_QUICK_REFERENCE.md`
- **详细测试方案**：`docs/需求分析/Mentis详细测试方案.md`
- **测试脚本**：`scripts/test-mentis-comprehensive.sh`

---

**最后更新**：2026-01-13
