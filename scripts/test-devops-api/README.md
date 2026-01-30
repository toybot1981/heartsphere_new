# DevOps 工作台 API 测试脚本

本目录包含 DevOps 工作台 API 的全面测试脚本。

## 📋 测试脚本

### 1. test-devops-comprehensive-api.sh
**全面测试脚本** - 测试所有 DevOps 工作台 API 接口

```bash
./scripts/test-devops-comprehensive-api.sh [base_url] [username] [password]
```

**功能**:
- ✅ 脚本管理 API（列表、详情、执行、历史）
- ✅ 定时任务 API（CRUD）
- ✅ 部署流程 API（模板管理、执行、历史）
- ✅ 错误处理测试
- ✅ 统计信息测试

**默认参数**:
- `base_url`: http://localhost:8085
- `username`: admin
- `password`: admin123

### 2. test-devops-pipeline-api.sh
**部署流程 API 专项测试** - 专门测试部署流程相关 API

```bash
./scripts/test-devops-pipeline-api.sh [base_url] [username] [password]
```

**功能**:
- ✅ 流程模板 CRUD
- ✅ 流程执行
- ✅ 执行状态查询
- ✅ 执行历史
- ✅ 流程取消
- ✅ 错误处理

### 3. test-devops-api-quick.sh
**快速测试脚本** - 快速验证基本功能

```bash
./scripts/test-devops-api-quick.sh [base_url] [username] [password]
```

**功能**:
- ✅ 登录验证
- ✅ 脚本列表
- ✅ 流程模板列表
- ✅ 统计信息
- ✅ 定时任务列表

## 🚀 快速开始

### 前置条件

1. **启动后端服务**:
```bash
cd admin/backend
mvn spring-boot:run
# 或
./scripts/start-admin-backend.sh
```

2. **创建数据库表** (如果还没有):
```bash
mysql -u root -p heartsphere < sql/create_pipeline_tables.sql
```

3. **确保有管理员账号**:
- 默认: admin / admin123
- 或使用你自己的账号

### 运行测试

#### 方式1: 快速测试（推荐首次使用）
```bash
./scripts/test-devops-api-quick.sh
```

#### 方式2: 全面测试
```bash
./scripts/test-devops-comprehensive-api.sh
```

#### 方式3: 只测试部署流程
```bash
./scripts/test-devops-pipeline-api.sh
```

#### 方式4: 指定自定义参数
```bash
./scripts/test-devops-comprehensive-api.sh http://localhost:8085 myuser mypass
```

## 📊 测试覆盖

### 脚本管理 API
- ✅ `GET /api/admin/devops/scripts` - 获取所有脚本
- ✅ `GET /api/admin/devops/scripts?category=scan` - 按分类获取
- ✅ `GET /api/admin/devops/scripts/{scriptId}` - 获取脚本详情
- ✅ `POST /api/admin/devops/scripts/{scriptId}/execute` - 执行脚本
- ✅ `GET /api/admin/devops/executions/{executionId}` - 获取执行状态
- ✅ `GET /api/admin/devops/executions/{executionId}/detail` - 获取执行详情
- ✅ `GET /api/admin/devops/executions` - 获取执行历史
- ✅ `GET /api/admin/devops/statistics` - 获取统计信息

### 定时任务 API
- ✅ `GET /api/admin/devops/scheduled-tasks` - 获取定时任务列表
- ✅ `POST /api/admin/devops/scheduled-tasks` - 创建定时任务
- ✅ `PUT /api/admin/devops/scheduled-tasks/{taskId}` - 更新定时任务
- ✅ `DELETE /api/admin/devops/scheduled-tasks/{taskId}` - 删除定时任务

### 部署流程 API
- ✅ `GET /api/admin/devops/pipelines` - 获取所有流程模板
- ✅ `GET /api/admin/devops/pipelines?environment=test` - 按环境获取
- ✅ `GET /api/admin/devops/pipelines/{pipelineId}` - 获取流程模板详情
- ✅ `POST /api/admin/devops/pipelines` - 创建流程模板
- ✅ `PUT /api/admin/devops/pipelines/{pipelineId}` - 更新流程模板
- ✅ `DELETE /api/admin/devops/pipelines/{pipelineId}` - 删除流程模板
- ✅ `POST /api/admin/devops/pipelines/{pipelineId}/execute` - 执行流程
- ✅ `GET /api/admin/devops/pipelines/executions/{executionId}` - 获取执行状态
- ✅ `GET /api/admin/devops/pipelines/executions/{executionId}/detail` - 获取执行详情
- ✅ `POST /api/admin/devops/pipelines/executions/{executionId}/cancel` - 取消执行
- ✅ `GET /api/admin/devops/pipelines/executions` - 获取执行历史
- ✅ `GET /api/admin/devops/pipelines/executions/{executionId}/stream` - SSE 状态流

## 📝 测试结果说明

### 成功情况
- ✅ 所有测试通过
- 返回正确的 HTTP 状态码
- 响应数据格式正确

### 预期失败情况
以下情况是**预期的失败**（业务逻辑限制）：
- 执行脚本失败：脚本不存在或参数错误
- 执行流程失败：流程模板不存在或步骤配置错误
- 取消执行失败：执行已完成或已取消

这些失败不影响 API 的基本功能测试。

## 🔍 故障排查

### 1. 登录失败
- 检查管理员账号是否存在
- 检查密码是否正确
- 检查后端服务是否运行

### 2. 404 错误
- 检查 API 路径是否正确
- 检查后端服务端口是否正确（默认 8085）

### 3. 500 错误
- 检查数据库表是否已创建
- 检查后端日志查看详细错误信息

### 4. 空列表
- 流程模板列表为空：需要先创建模板或等待系统自动加载预定义模板
- 执行历史为空：正常，表示还没有执行记录

## 📈 性能测试

脚本执行时间：
- 快速测试: ~5-10 秒
- 全面测试: ~30-60 秒（取决于脚本执行时间）

## 🎯 下一步

测试通过后，可以：
1. 在前端界面测试完整功能
2. 执行实际的部署流程
3. 创建自定义流程模板
4. 配置定时任务
