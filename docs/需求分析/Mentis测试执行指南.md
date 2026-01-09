# Mentis 测试执行指南

## 快速开始

### 1. Shell 脚本测试（推荐）

```bash
# 使用默认账号
./scripts/test-mentis.sh

# 指定管理员账号
./scripts/test-mentis.sh admin your_password
```

### 2. Python 脚本测试（更详细）

```bash
# 需要安装 requests 库
pip install requests

# 运行测试
python3 scripts/test-mentis-api.py

# 指定服务器地址和账号
python3 scripts/test-mentis-api.py http://localhost:8080 admin admin123
```

### 3. Java 集成测试

```bash
cd backend
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

### 🔄 待测试
- 任务执行和状态跟踪
- 虚拟机状态管理
- 命令安全性验证
- 并发性能测试

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

## 测试报告

测试完成后，查看：
- Shell 脚本输出：显示通过/失败统计
- Python 脚本：详细的测试结果和响应内容
- Java 测试：JUnit 测试报告

---

**最后更新**：2025-01-07
