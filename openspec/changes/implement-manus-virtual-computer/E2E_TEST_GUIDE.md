# 端到端测试指南

## 📋 概述

本指南说明如何运行 E2B VM Provider 的端到端测试，验证整个系统的功能和集成。

## 🔧 测试准备

### 1. 环境要求

- **Java 17+** - 后端运行环境
- **Node.js 18+** - 前端运行环境
- **Maven 3.6+** - Java 构建工具
- **E2B API Key** - E2B 账号 API Key

### 2. 配置 E2B API Key

```bash
# 设置环境变量
export E2B_API_KEY="your-e2b-api-key-here"

# 或添加到 ~/.bashrc 或 ~/.zshrc
echo 'export E2B_API_KEY="your-e2b-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### 3. 配置测试环境

确保 `application.yml` 中 VM Provider 设置为 E2B：

```yaml
mentis:
  vm:
    provider: e2b
  e2b:
    api-key: ${E2B_API_KEY:}
    template: base
    timeout: 300
```

## 🧪 运行测试

### 1. Java 单元测试和集成测试

#### 运行所有测试

```bash
cd mentis/backend
mvn test
```

#### 运行 E2B Provider 测试

```bash
cd mentis/backend
mvn test -Dtest=E2BProviderE2ETest
```

#### 运行 VM Controller 测试

```bash
cd mentis/backend
mvn test -Dtest=VmControllerE2ETest
```

**注意**: 这些测试默认是禁用的（`@Disabled`），需要取消注释 `@Disabled` 注解才能运行。

### 2. Shell 脚本端到端测试

#### 后端 API 测试

```bash
# 确保后端服务运行在 http://localhost:8082
cd mentis/backend
mvn spring-boot:run &

# 运行测试脚本
export E2B_API_KEY="your-e2b-api-key"
./scripts/test-e2e-vm.sh
```

测试脚本会执行以下步骤：

1. ✅ 检查后端服务状态
2. ✅ 创建虚拟机
3. ✅ 获取虚拟机状态
4. ✅ 执行命令
5. ✅ 获取截图
6. ✅ 获取 VNC 连接信息
7. ✅ 删除虚拟机
8. ✅ 验证删除

#### 前端集成测试

```bash
# 确保前后端服务都在运行
cd mentis/frontend
npm start &

cd mentis/backend
mvn spring-boot:run &

# 运行测试脚本
./scripts/test-e2e-frontend.sh
```

## 📊 测试用例

### 1. E2B Provider 测试 (E2BProviderE2ETest)

**测试场景**:

1. **创建沙箱**
   - 测试 E2B 沙箱创建
   - 验证返回的沙箱 ID
   - 验证沙箱状态

2. **获取状态**
   - 测试状态查询
   - 验证状态信息完整性

3. **执行命令**
   - 测试命令执行
   - 验证标准输出和错误输出
   - 验证退出码

4. **获取截图**
   - 测试截图获取
   - 验证截图格式（data URI）

5. **获取 VNC 信息**
   - 测试 VNC 连接信息获取
   - 验证 URL、密码等信息

6. **删除沙箱**
   - 测试沙箱删除
   - 验证清理完成

7. **完整流程**
   - 测试从创建到删除的完整流程
   - 验证每个步骤的正确性

### 2. VM Controller 测试 (VmControllerE2ETest)

**测试场景**:

1. **创建虚拟机 API**
   - `POST /api/mentis/vm/{sessionId}/create`
   - 验证响应格式
   - 验证虚拟机创建

2. **获取状态 API**
   - `GET /api/mentis/vm/{sessionId}/status`
   - 验证响应格式

3. **执行命令 API**
   - `POST /api/mentis/vm/{sessionId}/execute`
   - 验证命令执行结果

4. **获取截图 API**
   - `GET /api/mentis/vm/{sessionId}/screenshot`
   - 验证截图返回

5. **获取 VNC 信息 API**
   - `GET /api/mentis/vm/{sessionId}/vnc`
   - 验证 VNC 连接信息

6. **删除虚拟机 API**
   - `DELETE /api/mentis/vm/{sessionId}`
   - 验证删除和清理

### 3. Shell 脚本测试

**测试步骤**:

```bash
# 1. 创建虚拟机
POST /api/mentis/vm/{sessionId}/create

# 2. 等待沙箱就绪（3秒）

# 3. 获取状态
GET /api/mentis/vm/{sessionId}/status

# 4. 执行命令
POST /api/mentis/vm/{sessionId}/execute
Body: {"command": "echo 'Hello from E2B E2E Test'"}

# 5. 获取截图
GET /api/mentis/vm/{sessionId}/screenshot

# 6. 获取 VNC 信息
GET /api/mentis/vm/{sessionId}/vnc

# 7. 删除虚拟机
DELETE /api/mentis/vm/{sessionId}

# 8. 验证删除
GET /api/mentis/vm/{sessionId}/status (应返回 404)
```

## 🔍 测试验证

### 验证清单

- [ ] 后端服务正常启动
- [ ] E2B API Key 配置正确
- [ ] 虚拟机创建成功
- [ ] 状态查询返回正确
- [ ] 命令执行成功
- [ ] 截图获取正常（如果支持）
- [ ] VNC 信息获取正常（如果支持）
- [ ] 虚拟机删除成功
- [ ] 清理完成

### 常见问题

1. **E2B API Key 未配置**
   - 错误: `E2B API Key 未配置`
   - 解决: 设置 `E2B_API_KEY` 环境变量

2. **后端服务未运行**
   - 错误: `后端服务未运行`
   - 解决: 启动后端服务 `mvn spring-boot:run`

3. **沙箱创建失败**
   - 错误: `创建 E2B 沙箱失败`
   - 可能原因:
     - E2B API Key 无效或过期
     - E2B 账户配额不足
     - 网络连接问题

4. **命令执行超时**
   - 错误: `命令执行超时`
   - 解决: 检查命令是否正常，或增加超时时间

5. **VNC 信息获取返回 404**
   - 说明: 某些 Provider 可能不支持 VNC
   - 解决: 这是正常的，E2B Provider 应该支持

## 📈 测试报告

运行测试后，会生成测试报告：

- **单元测试**: `target/surefire-reports/`
- **集成测试**: `target/failsafe-reports/`
- **测试日志**: 控制台输出和日志文件

## 🎯 下一步

测试通过后，可以：

1. **部署到测试环境**
2. **进行性能测试**
3. **进行负载测试**
4. **进行安全测试**
5. **集成到 CI/CD 流程**

## 📝 注意事项

1. **API Key 安全**
   - 不要将 API Key 提交到代码仓库
   - 使用环境变量管理敏感信息

2. **测试隔离**
   - 每个测试使用独立的会话 ID
   - 测试结束后清理资源

3. **网络依赖**
   - 测试需要网络连接到 E2B API
   - 确保网络连接正常

4. **资源限制**
   - E2B 账户可能有资源使用限制
   - 注意控制测试频率和资源使用
