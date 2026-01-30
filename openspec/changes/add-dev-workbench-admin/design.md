# 研发工作台设计文档

## 架构设计

### 整体架构

研发工作台采用前后端分离架构：

```
┌─────────────────┐
│  Admin Frontend │
│  (React/TS)     │
│                 │
│  DevWorkbench   │
│  Component      │
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│  Admin Backend  │
│  (Spring Boot)  │
│                 │
│  DevWorkbench   │
│  Controller     │
│  Service        │
└────────┬────────┘
         │
         │ Execute Scripts
         │
┌────────▼────────┐
│  Script Engine  │
│  (Process Exec) │
└─────────────────┘
```

### 前端架构

#### 组件结构

```
DevWorkbench/
├── DevWorkbench.tsx          # 主组件
├── ScriptList.tsx            # 脚本列表
├── ScriptExecutor.tsx        # 脚本执行器
├── ExecutionHistory.tsx      # 执行历史
├── LogViewer.tsx             # 日志查看器
├── CodeScanner.tsx           # 代码扫描
├── TestRunner.tsx           # 测试执行
├── BuildDeploy.tsx          # 构建部署
├── DatabaseManager.tsx      # 数据库管理
└── ServerManager.tsx        # 服务器管理
```

#### 状态管理

- 使用 React Context 或 Redux 管理全局状态
- 脚本执行状态（执行中、已完成、失败）
- 日志流状态
- 历史记录状态

### 后端架构

#### 包结构

```
com.heartsphere.admin
├── controller
│   └── DevWorkbenchController.java
├── service
│   └── DevWorkbenchService.java
├── entity
│   ├── ScriptExecution.java
│   └── ScriptConfig.java
├── repository
│   ├── ScriptExecutionRepository.java
│   └── ScriptConfigRepository.java
├── dto
│   ├── ScriptExecutionRequest.java
│   ├── ScriptExecutionResponse.java
│   └── ScriptInfo.java
└── config
    └── ScriptConfigLoader.java
```

#### 核心服务

**DevWorkbenchService**:
- `executeScript(ScriptExecutionRequest)`: 执行脚本
- `getExecutionStatus(String executionId)`: 获取执行状态
- `getExecutionLogs(String executionId)`: 获取执行日志
- `getExecutionHistory(Pageable)`: 获取执行历史
- `validatePermission(String scriptId, Admin admin)`: 验证权限

**ScriptExecutionEngine**:
- 安全执行系统命令
- 收集实时日志
- 处理执行结果
- 超时控制

## 脚本配置系统

### 脚本配置文件格式

```yaml
# scripts-config.yml
scripts:
  - id: build-all
    name: 构建所有模块
    category: build
    description: 执行全量构建
    script: scripts/build/build-all.sh
    type: shell
    parameters: []
    timeout: 3600
    requiresAuth: true
    permissions:
      - ROLE_ADMIN
      - ROLE_DEVELOPER
    
  - id: code-scan
    name: 代码扫描
    category: scan
    description: 执行代码质量扫描
    script: scripts/scan/code-scan.sh
    type: shell
    parameters:
      - name: module
        type: string
        required: false
        description: 要扫描的模块
    timeout: 1800
    requiresAuth: true
    permissions:
      - ROLE_ADMIN
      - ROLE_DEVELOPER
```

### 脚本分类

- **build**: 构建相关脚本
- **test**: 测试相关脚本
- **deploy**: 部署相关脚本
- **scan**: 代码扫描脚本
- **database**: 数据库管理脚本
- **server**: 服务器管理脚本
- **other**: 其他脚本

## 脚本执行引擎

### 执行流程

1. **权限验证**
   - 检查用户是否有执行该脚本的权限
   - 检查脚本是否需要认证

2. **参数验证**
   - 验证参数格式和类型
   - 过滤危险参数（防止命令注入）

3. **创建执行记录**
   - 在数据库中创建执行记录
   - 生成执行 ID

4. **执行脚本**
   - 使用 ProcessBuilder 安全执行脚本
   - 设置工作目录和环境变量
   - 设置超时时间

5. **收集日志**
   - 实时收集标准输出和错误输出
   - 存储到数据库或文件系统

6. **更新执行状态**
   - 更新执行状态（执行中、成功、失败）
   - 存储执行结果

### 安全措施

1. **命令注入防护**
   - 参数白名单验证
   - 参数转义处理
   - 禁止执行危险命令（rm -rf, format 等）

2. **权限控制**
   - 基于角色的访问控制（RBAC）
   - 脚本级别权限配置
   - 敏感操作二次确认

3. **资源限制**
   - 执行超时控制
   - 内存限制
   - 并发执行限制

4. **审计日志**
   - 记录所有执行操作
   - 记录执行用户和时间
   - 记录执行参数和结果

## 数据库设计

### ScriptExecution 表

```sql
CREATE TABLE script_execution (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    script_id VARCHAR(100) NOT NULL,
    script_name VARCHAR(200) NOT NULL,
    executor_id BIGINT NOT NULL,
    executor_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL, -- RUNNING, SUCCESS, FAILED, CANCELLED
    parameters TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration BIGINT, -- 执行时长（毫秒）
    exit_code INT,
    output_log TEXT,
    error_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_script_id (script_id),
    INDEX idx_executor_id (executor_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### ScriptConfig 表（可选）

```sql
CREATE TABLE script_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    script_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    script_path VARCHAR(500) NOT NULL,
    script_type VARCHAR(20) NOT NULL, -- shell, python, node
    config_json TEXT, -- JSON 格式的配置
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_enabled (enabled)
);
```

## API 设计

### 脚本列表

```
GET /api/admin/dev-workbench/scripts
Response: {
  scripts: [
    {
      id: "build-all",
      name: "构建所有模块",
      category: "build",
      description: "执行全量构建",
      parameters: []
    }
  ]
}
```

### 执行脚本

```
POST /api/admin/dev-workbench/scripts/{scriptId}/execute
Request: {
  parameters: {
    module: "main"
  }
}
Response: {
  executionId: "exec-123456",
  status: "RUNNING"
}
```

### 查询执行状态

```
GET /api/admin/dev-workbench/executions/{executionId}
Response: {
  executionId: "exec-123456",
  status: "SUCCESS",
  startTime: "2025-01-22T10:00:00",
  endTime: "2025-01-22T10:05:00",
  duration: 300000,
  exitCode: 0
}
```

### 查询执行日志

```
GET /api/admin/dev-workbench/executions/{executionId}/logs
Query Parameters:
  - type: output|error|all (default: all)
  - offset: 0 (default: 0)
  - limit: 1000 (default: 1000)
Response: {
  logs: [
    {
      type: "output",
      content: "Building module: main",
      timestamp: "2025-01-22T10:00:01"
    }
  ],
  total: 1000,
  hasMore: true
}
```

### 查询执行历史

```
GET /api/admin/dev-workbench/executions
Query Parameters:
  - scriptId: (optional)
  - status: (optional)
  - executorId: (optional)
  - page: 0 (default: 0)
  - size: 20 (default: 20)
Response: {
  content: [...],
  totalElements: 100,
  totalPages: 5,
  page: 0,
  size: 20
}
```

## 前端界面设计

### 主界面布局

```
┌─────────────────────────────────────────┐
│ 研发工作台                                │
├─────────────────────────────────────────┤
│ [脚本列表] [执行历史] [代码扫描] [测试]   │
│          [构建部署] [数据库] [服务器]    │
├─────────────────────────────────────────┤
│                                         │
│  脚本执行区域                            │
│  - 脚本选择                              │
│  - 参数输入                              │
│  - 执行按钮                              │
│  - 状态显示                              │
│                                         │
│  日志显示区域                            │
│  - 实时日志流                            │
│  - 日志搜索                              │
│  - 日志下载                              │
│                                         │
└─────────────────────────────────────────┘
```

### 脚本列表界面

- 按分类分组显示
- 支持搜索和过滤
- 显示脚本描述和参数
- 显示最近执行状态

### 执行历史界面

- 列表显示所有执行记录
- 支持按脚本、状态、执行人过滤
- 显示执行时间、时长、状态
- 点击查看详情和日志

## 集成现有脚本

### 构建脚本

- `scripts/build/build-all.sh` - 全量构建
- `scripts/build/build-module.sh` - 单模块构建
- `scripts/build/check-dependencies.sh` - 依赖检查
- `scripts/build/cache-clean.sh` - 缓存清理

### 测试脚本

- `scripts/test-mentis-comprehensive.sh` - Mentis 测试
- `scripts/test-api.sh` - API 测试
- 各模块的测试脚本

### 部署脚本

- `deploy/deploy-backend-prod.sh` - 后端部署
- `deploy/deploy-frontend-prod.sh` - 前端部署
- `deploy/migrate-database.sh` - 数据库迁移

### 数据库脚本

- `sql/backup_all_databases.sh` - 数据库备份
- `deploy/migrate-database.sh` - 数据库迁移
- `scripts/start-databases.sh` - 启动数据库
- `scripts/stop-databases.sh` - 停止数据库

### 服务器脚本

- `deploy/restart-backend.sh` - 重启后端
- `deploy/start-backend-prod.sh` - 启动后端
- `scripts/dev/view-logs.sh` - 查看日志

## 安全考虑

### 命令注入防护

1. **参数验证**
   - 白名单验证参数值
   - 类型检查
   - 长度限制

2. **参数转义**
   - 对特殊字符进行转义
   - 使用参数化执行

3. **危险命令过滤**
   - 禁止执行系统级危险命令
   - 限制文件系统操作范围

### 权限控制

1. **角色权限**
   - ROLE_ADMIN: 所有权限
   - ROLE_DEVELOPER: 开发和测试权限
   - ROLE_OPERATOR: 部署和运维权限

2. **脚本权限**
   - 每个脚本配置所需权限
   - 敏感操作需要特殊权限

3. **操作审计**
   - 记录所有执行操作
   - 记录执行用户和时间
   - 支持审计日志查询

## 性能考虑

### 并发执行

- 限制同时执行的脚本数量
- 使用线程池管理执行任务
- 避免资源竞争

### 日志存储

- 大日志文件分块存储
- 使用流式传输实时日志
- 定期清理历史日志

### 缓存策略

- 缓存脚本列表和配置
- 缓存执行历史（分页）
- 避免频繁查询数据库

## 扩展性

### 插件机制

- 支持自定义脚本类型
- 支持自定义执行器
- 支持自定义结果处理器

### 通知机制

- 执行完成通知（邮件、Webhook）
- 执行失败告警
- 集成消息系统

### 集成 CI/CD

- 支持触发 CI/CD 流程
- 支持查看 CI/CD 状态
- 支持部署流水线管理
