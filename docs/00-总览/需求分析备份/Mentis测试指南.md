# Mentis 测试指南

**日期**：2025-01-07  
**版本**：1.0

---

## 一、测试概述

本指南提供了 Mentis 超级智能体系统的完整测试方案，包括单元测试、集成测试、API 测试和功能测试。

---

## 二、测试分类

### 1. 单元测试

#### 1.1 Service 层测试

**位置**: `backend/src/test/java/com/heartsphere/mentis/service/`

- ✅ `MentisSessionServiceTest.java` - 会话服务测试
- ✅ `MentisTaskServiceTest.java` - 任务服务测试
- ✅ `MentisMessageServiceTest.java` - 消息服务测试

**运行方式**:
```bash
cd backend
mvn test -Dtest=MentisSessionServiceTest
mvn test -Dtest=MentisTaskServiceTest
mvn test -Dtest=MentisMessageServiceTest
```

#### 1.2 Agent 层测试

- ✅ `LLMIntentRecognizerTest.java` - 意图识别器测试
- ✅ `LLMTaskDecomposerTest.java` - 任务分解器测试

**运行方式**:
```bash
mvn test -Dtest=LLMIntentRecognizerTest
mvn test -Dtest=LLMTaskDecomposerTest
```

#### 1.3 Executor 层测试

- ✅ `ExecutionEngineImplTest.java` - 执行引擎测试
- ✅ `ShellCommandExecutorTest.java` - Shell命令执行器测试
- ✅ `CommandSecurityValidatorTest.java` - 命令安全验证器测试

#### 1.4 Util 工具类测试

- ✅ `LLMResponseParserTest.java` - LLM响应解析器测试
- ✅ `IdGeneratorTest.java` - ID生成器测试

#### 1.5 Controller 层测试

- ✅ `MentisChatControllerTest.java` - 聊天控制器测试

**运行所有单元测试**:
```bash
mvn test -Dtest="com.heartsphere.mentis.**.*Test"
```

### 2. 集成测试

#### 2.1 API 集成测试

**位置**: `backend/src/test/java/com/heartsphere/mentis/integration/`

- ✅ `MentisIntegrationTest.java` - 完整的 API 流程测试

**运行方式**:
```bash
mvn test -Dtest=MentisIntegrationTest
```

**测试内容**:
- ✅ 创建会话
- ✅ 获取会话详情
- ✅ 获取会话列表
- ✅ 发送同步消息
- ✅ 更新会话状态
- ✅ 删除会话

### 3. API 功能测试

#### 3.1 Shell 脚本测试

**位置**: `test_mentis_api.sh`

**功能**:
- 自动登录管理员账号
- 测试所有 API 端点
- 验证响应格式和状态码

**运行方式**:
```bash
chmod +x test_mentis_api.sh
./test_mentis_api.sh

# 或指定自定义配置
BASE_URL=http://localhost:8080 \
ADMIN_USERNAME=admin \
ADMIN_PASSWORD=your_password \
./test_mentis_api.sh
```

#### 3.2 Python 流式消息测试

**位置**: `test_mentis_stream.py`

**功能**:
- 测试 SSE 流式响应
- 验证实时消息接收
- 测试多个消息流

**运行方式**:
```bash
chmod +x test_mentis_stream.py
python3 test_mentis_stream.py

# 或安装依赖
pip3 install requests
python3 test_mentis_stream.py
```

### 4. 手动功能测试

#### 4.1 后台管理界面测试

**步骤**:
1. 登录后台管理系统
2. 进入 "AI 智能体" > "Mentis 体验"
3. 测试以下功能：

**测试用例**:

| 功能 | 测试步骤 | 预期结果 |
|------|---------|---------|
| 创建会话 | 页面加载时自动创建会话 | 显示会话ID，显示欢迎消息 |
| 发送文本消息 | 输入消息并点击发送 | 显示用户消息，收到 AI 响应 |
| 流式响应 | 发送需要处理的命令 | 实时显示响应内容，逐字显示 |
| 虚拟机状态 | 切换到虚拟机标签页 | 显示虚拟机状态信息 |
| 任务历史 | 切换到任务标签页 | 显示任务执行历史 |
| 快捷命令 | 点击快捷命令按钮 | 自动填充对应命令 |

#### 4.2 API 端点测试

**使用 Postman 或 curl 测试**:

```bash
# 1. 管理员登录
curl -X POST http://localhost:8080/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. 创建会话（替换 YOUR_TOKEN）
curl -X POST http://localhost:8080/api/admin/mentis/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"测试会话"}'

# 3. 发送消息（替换 YOUR_TOKEN 和 SESSION_ID）
curl -X POST http://localhost:8080/api/admin/mentis/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionId":"SESSION_ID",
    "message":"你好，Mentis",
    "enableComputerUse":false
  }'
```

---

## 三、测试检查清单

### 3.1 基本功能测试

- [ ] 管理员可以成功登录
- [ ] 可以创建新会话
- [ ] 可以获取会话列表
- [ ] 可以获取会话详情
- [ ] 可以发送文本消息
- [ ] 可以接收同步响应
- [ ] 可以接收流式响应
- [ ] 可以更新会话状态
- [ ] 可以删除会话

### 3.2 消息处理测试

- [ ] 简单问候消息可以正常处理
- [ ] 命令执行请求可以识别
- [ ] 脚本运行请求可以识别
- [ ] GUI 自动化请求可以识别
- [ ] 无效请求返回适当错误

### 3.3 流式响应测试

- [ ] SSE 连接可以正常建立
- [ ] 可以实时接收响应数据
- [ ] 响应数据格式正确（JSON）
- [ ] 可以处理多个连续的流式消息
- [ ] 连接超时处理正确

### 3.4 安全测试

- [ ] 未认证请求返回 401
- [ ] 无效 token 返回 401
- [ ] 危险命令被正确拦截
- [ ] 命令安全验证正常工作

### 3.5 错误处理测试

- [ ] 会话不存在返回适当错误
- [ ] 无效的消息格式返回错误
- [ ] 数据库连接错误处理正确
- [ ] LLM 服务错误处理正确

### 3.6 性能测试

- [ ] 创建会话响应时间 < 1s
- [ ] 发送消息响应时间 < 5s
- [ ] 流式响应延迟 < 100ms
- [ ] 并发请求处理正常

---

## 四、测试数据准备

### 4.1 数据库准备

确保以下表已创建：
- ✅ `mentis_sessions`
- ✅ `mentis_tasks`
- ✅ `mentis_messages`
- ✅ `mentis_vm_states`

**验证方式**:
```sql
SHOW TABLES LIKE 'mentis%';
```

### 4.2 测试账号准备

**管理员账号**:
- 用户名: `admin` (或自定义)
- 密码: 需要知道实际密码

**创建测试管理员** (如果需要):
```sql
INSERT INTO system_admins (username, password, email, role, is_active)
VALUES ('test_admin', '$2a$10$...', 'test@example.com', 'ADMIN', 1);
```

---

## 五、常见问题排查

### 5.1 认证失败

**问题**: 返回 401 Unauthorized

**排查步骤**:
1. 检查 token 是否正确
2. 检查 token 是否过期
3. 检查管理员账号是否存在
4. 查看后端日志中的认证错误

### 5.2 会话创建失败

**问题**: 返回 500 错误

**排查步骤**:
1. 检查数据库表是否存在
2. 检查数据库连接
3. 查看后端日志中的错误信息
4. 验证 `userId` 是否正确（管理员使用负数ID）

### 5.3 流式响应不工作

**问题**: 没有收到流式数据

**排查步骤**:
1. 检查前端是否正确解析 SSE 数据
2. 检查后端 SSE 连接是否建立
3. 查看浏览器网络面板中的 EventStream
4. 检查后端日志中的流式处理错误

### 5.4 消息无响应

**问题**: 发送消息后没有响应

**排查步骤**:
1. 检查 `MentisAgentService` 是否实现
2. 检查 LLM 服务是否可用
3. 查看后端日志中的处理错误
4. 验证消息是否保存到数据库

---

## 六、性能基准

### 6.1 响应时间目标

- 创建会话: < 500ms
- 发送同步消息: < 3s
- 流式响应首块: < 500ms
- 获取会话列表: < 200ms

### 6.2 并发测试

使用 Apache Bench (ab) 进行并发测试:

```bash
# 安装 ab
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# 测试会话创建接口
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -p session.json \
  http://localhost:8080/api/admin/mentis/sessions
```

---

## 七、测试报告模板

### 7.1 测试结果记录

**测试日期**: _______________
**测试人员**: _______________
**测试环境**: _______________

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 管理员登录 | ⬜ 通过 / ⬜ 失败 | |
| 创建会话 | ⬜ 通过 / ⬜ 失败 | |
| 发送消息 | ⬜ 通过 / ⬜ 失败 | |
| 流式响应 | ⬜ 通过 / ⬜ 失败 | |
| 错误处理 | ⬜ 通过 / ⬜ 失败 | |

### 7.2 Bug 记录

**Bug #1**:
- 描述: 
- 复现步骤: 
- 预期结果: 
- 实际结果: 
- 严重程度: ⬜ 高 / ⬜ 中 / ⬜ 低

---

## 八、持续测试

### 8.1 CI/CD 集成

建议在 CI/CD 流程中加入测试：

```yaml
# .github/workflows/test.yml 示例
- name: Run Mentis Tests
  run: |
    cd backend
    mvn test -Dtest="com.heartsphere.mentis.**.*Test"
```

### 8.2 测试覆盖率

目标覆盖率：
- Service 层: 80%+
- Controller 层: 70%+
- Util 工具类: 90%+

查看覆盖率报告：
```bash
mvn test jacoco:report
open target/site/jacoco/index.html
```

---

**最后更新**: 2025-01-07
