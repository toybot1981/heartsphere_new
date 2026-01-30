# Agent Mind 数据库设置指南

## 问题说明

如果遇到错误：`Table 'heartsphere.agent_identity' doesn't exist`，说明数据库表尚未创建。

## 快速设置步骤

### 1. 创建数据库（如果不存在）

```sql
CREATE DATABASE IF NOT EXISTS heartsphere_agent_mind 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 创建数据库表

有两种方式：

#### 方式一：通过 Agent Mind 后端服务自动创建（推荐）

1. 启动 Agent Mind 后端服务：
   ```bash
   cd agent-mind/backend
   mvn spring-boot:run
   ```

2. Flyway 会自动执行迁移脚本，创建所需的表。

#### 方式二：手动执行 SQL 脚本

执行以下 SQL 脚本：

**创建 agent_identity 表：**
```sql
USE heartsphere_agent_mind;

CREATE TABLE IF NOT EXISTS agent_identity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    character_id BIGINT NOT NULL UNIQUE COMMENT '角色ID（关联到Character表）',
    identity_data JSON COMMENT '身份认知数据（JSON格式）',
    capabilities JSON COMMENT '能力列表（JSON格式）',
    limitations JSON COMMENT '能力边界（JSON格式）',
    self_awareness_level INT DEFAULT 0 COMMENT '自我认知水平（0-100）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_character_id (character_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**创建 agent_state_history 表：**
```sql
USE heartsphere_agent_mind;

CREATE TABLE IF NOT EXISTS agent_state_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    character_id BIGINT NOT NULL COMMENT '角色ID',
    state_type VARCHAR(50) NOT NULL COMMENT '状态类型',
    state_description TEXT COMMENT '状态描述',
    duration_ms BIGINT COMMENT '状态持续时间（毫秒）',
    transition_reason TEXT COMMENT '状态转换原因',
    related_session_id BIGINT COMMENT '关联的会话ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_character_id (character_id),
    INDEX idx_state_type (state_type),
    INDEX idx_created_at (created_at),
    INDEX idx_character_state (character_id, state_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. 验证表创建

```sql
USE heartsphere_agent_mind;

-- 检查表是否存在
SHOW TABLES;

-- 检查表结构
DESCRIBE agent_identity;
DESCRIBE agent_state_history;
```

### 4. 重启 Admin 后端服务

```bash
cd admin/backend
mvn spring-boot:run
```

## 迁移脚本位置

数据库迁移脚本位于：
- `agent-mind/backend/src/main/resources/db/migration/V20250122_001__create_agent_identity_table.sql`
- `agent-mind/backend/src/main/resources/db/migration/V20250122_002__create_agent_state_history_table.sql`

## 配置检查

确保 `admin/backend/src/main/resources/application.yml` 中配置了正确的数据库连接：

```yaml
spring:
  datasource:
    agent-mind:
      url: jdbc:mysql://localhost:3306/heartsphere_agent_mind?...
      username: root
      password: your_password
```

## 常见问题

### Q: 表创建后仍然报错？
A: 检查：
1. 数据库连接配置是否正确
2. Service 方法是否添加了 `@DataSource("agent-mind")` 注解
3. 是否重启了 Admin 后端服务

### Q: 如何确认数据源切换成功？
A: 查看 Admin 后端日志，应该能看到 SQL 查询指向 `heartsphere_agent_mind` 数据库。

### Q: 表已存在但仍有错误？
A: 检查表结构是否与实体类定义一致，特别是字段类型和名称。
