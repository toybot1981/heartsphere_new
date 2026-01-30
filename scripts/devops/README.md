# DevOps 平台工具脚本

本目录包含 DevOps 平台的各种实用工具脚本。

## 脚本列表

### 1. setup-devops-platform.sh
初始化 DevOps 平台，包括：
- 创建数据库表
- 初始化测试项目
- 配置检查

**使用方法:**
```bash
./scripts/devops/setup-devops-platform.sh
```

### 2. run-pipeline-example.sh
运行示例部署流程，演示完整的 CI/CD 流程。

**使用方法:**
```bash
export AUTH_TOKEN="your-token"
export API_BASE_URL="http://localhost:8080"
./scripts/devops/run-pipeline-example.sh
```

### 3. check-platform-health.sh
检查 DevOps 平台的健康状态，包括：
- API 可用性
- 数据库连接
- CMDB 功能
- 流程功能

**使用方法:**
```bash
export AUTH_TOKEN="your-token"  # 可选
./scripts/devops/check-platform-health.sh
```

### 4. migrate-assets-to-cmdb.sh
将现有资产迁移到 CMDB。

**使用方法:**
```bash
export AUTH_TOKEN="your-token"
export ASSETS_FILE="assets.json"  # 可选，默认为 assets.json
./scripts/devops/migrate-assets-to-cmdb.sh
```

**资产文件格式 (assets.json):**
```json
[
    {
        "name": "服务器名称",
        "type": "SERVER",
        "status": "ACTIVE",
        "description": "描述"
    }
]
```

### 5. backup-devops-data.sh
备份 DevOps 平台数据，包括：
- 数据库表数据
- 配置文件
- 脚本文件

**使用方法:**
```bash
export DB_NAME="your_db"
export DB_USER="your_user"
export DB_PASSWORD="your_password"
export BACKUP_DIR="backups/devops"  # 可选
./scripts/devops/backup-devops-data.sh
```

## 环境变量

### 通用变量
- `API_BASE_URL`: API 基础 URL（默认: http://localhost:8080）
- `AUTH_TOKEN`: 认证 Token

### 数据库变量
- `DB_NAME`: 数据库名称
- `DB_USER`: 数据库用户
- `DB_PASSWORD`: 数据库密码

### 其他变量
- `ASSETS_FILE`: 资产文件路径（默认: assets.json）
- `BACKUP_DIR`: 备份目录（默认: backups/devops）

## 注意事项

1. 所有脚本都需要适当的权限才能执行
2. 数据库相关脚本需要 MySQL 客户端工具
3. API 相关脚本需要 `curl` 和 `jq` 工具
4. 确保环境变量正确设置

## 依赖工具

- `bash` (4.0+)
- `curl`
- `jq`
- `mysql` / `mysqldump`

## 故障排查

### 脚本无法执行
```bash
chmod +x scripts/devops/*.sh
```

### API 连接失败
检查：
1. API 服务是否运行
2. `API_BASE_URL` 是否正确
3. `AUTH_TOKEN` 是否有效

### 数据库连接失败
检查：
1. 数据库服务是否运行
2. 数据库凭据是否正确
3. 网络连接是否正常
