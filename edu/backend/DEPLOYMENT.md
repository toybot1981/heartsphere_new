# Edu 后端服务部署指南

## 📋 部署概览

本文档说明如何部署 HeartSphere Edu 后端服务到生产环境。

## 🔧 环境要求

- **Java**: JDK 17 或更高版本
- **MySQL**: 8.0 或更高版本
- **Maven**: 3.8 或更高版本（用于构建）
- **操作系统**: Linux / macOS / Windows

## 📦 构建

### 1. 构建 JAR 文件

```bash
cd edu/backend
mvn clean package -DskipTests
```

构建产物：`target/heartsphere-edu-service-0.0.1-SNAPSHOT.jar`

### 2. 验证构建

```bash
java -jar target/heartsphere-edu-service-0.0.1-SNAPSHOT.jar --version
```

## 🗄️ 数据库准备

### 1. 创建数据库

```sql
CREATE DATABASE heartsphere_edu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 数据库迁移

数据库迁移脚本会在应用启动时自动执行（Flyway）。

迁移脚本位于：`src/main/resources/db/migration/`

### 3. 验证数据库

```sql
USE heartsphere_edu;
SHOW TABLES;
-- 应该看到：
-- - edu_characters
-- - edu_character_interactions
-- - flyway_schema_history
```

## ⚙️ 配置

### 1. 配置文件

创建生产环境配置文件：`application-prod.yml`

```yaml
server:
  port: 8084

spring:
  application:
    name: heartsphere-edu-service
  profiles:
    active: prod
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useUnicode=true&characterEncoding=UTF-8&useSSL=true&serverTimezone=Asia/Shanghai&connectionCollation=utf8mb4_unicode_ci
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect

# 教育版配置
edu:
  enabled: true

# 日志配置
logging:
  level:
    root: INFO
    com.heartsphere.edu: INFO
  file:
    name: logs/edu-backend.log
    max-size: 10MB
    max-history: 30

# Swagger 配置（生产环境建议禁用）
springdoc:
  swagger-ui:
    enabled: false
```

### 2. 环境变量

使用环境变量配置敏感信息：

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=heartsphere_edu
export DB_USER=your_db_user
export DB_PASSWORD=your_db_password
export SPRING_PROFILES_ACTIVE=prod
```

### 3. 系统服务（systemd）

创建 systemd 服务文件：`/etc/systemd/system/heartsphere-edu.service`

```ini
[Unit]
Description=HeartSphere Edu Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=your_user
WorkingDirectory=/opt/heartsphere-edu/backend
ExecStart=/usr/bin/java -jar -Xms512m -Xmx1024m -Dspring.profiles.active=prod /opt/heartsphere-edu/backend/heartsphere-edu-service-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 4. 启动服务

```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start heartsphere-edu

# 设置开机自启
sudo systemctl enable heartsphere-edu

# 查看状态
sudo systemctl status heartsphere-edu

# 查看日志
sudo journalctl -u heartsphere-edu -f
```

## 🔐 安全配置

### 1. 数据库安全

- 使用强密码
- 限制数据库访问 IP
- 启用 SSL 连接（生产环境）
- 定期备份数据库

### 2. 应用安全

- 禁用 Swagger UI（生产环境）
- 配置 HTTPS（使用反向代理，如 Nginx）
- 配置防火墙规则
- 使用 JWT token 进行认证
- 配置 CORS（如果需要）

### 3. 日志安全

- 不要记录敏感信息（密码、token）
- 定期清理日志文件
- 监控异常日志

## 🔄 更新部署

### 1. 停止服务

```bash
sudo systemctl stop heartsphere-edu
```

### 2. 备份

```bash
# 备份数据库
mysqldump -u your_user -p heartsphere_edu > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份配置文件
cp application-prod.yml application-prod.yml.backup
```

### 3. 更新应用

```bash
# 备份旧版本
mv heartsphere-edu-service-0.0.1-SNAPSHOT.jar heartsphere-edu-service-0.0.1-SNAPSHOT.jar.backup

# 上传新版本
cp new-version.jar heartsphere-edu-service-0.0.1-SNAPSHOT.jar
```

### 4. 启动服务

```bash
sudo systemctl start heartsphere-edu
sudo systemctl status heartsphere-edu
```

### 5. 验证

- 检查服务状态
- 检查日志
- 测试 API 端点
- 检查数据库迁移状态

## 📊 监控

### 1. 健康检查

应用提供了健康检查端点（如果配置了 Actuator）：

```
GET /actuator/health
```

### 2. 日志监控

```bash
# 实时查看日志
sudo journalctl -u heartsphere-edu -f

# 查看最近日志
sudo journalctl -u heartsphere-edu -n 100

# 查看错误日志
sudo journalctl -u heartsphere-edu -p err
```

### 3. 性能监控

- 监控 JVM 内存使用
- 监控数据库连接池
- 监控 API 响应时间
- 监控错误率

## 🐛 故障排除

### 常见问题

1. **服务启动失败**
   - 检查日志：`sudo journalctl -u heartsphere-edu -n 100`
   - 检查数据库连接
   - 检查端口是否被占用
   - 检查 Java 版本

2. **数据库连接失败**
   - 检查数据库服务是否运行
   - 检查连接配置（用户名、密码、URL）
   - 检查网络连接
   - 检查防火墙规则

3. **数据库迁移失败**
   - 检查数据库用户权限
   - 检查迁移脚本语法
   - 检查 flyway_schema_history 表

4. **内存不足**
   - 增加 JVM 堆内存：`-Xms512m -Xmx2048m`
   - 检查系统内存使用情况

## 📝 回滚

如果需要回滚到之前的版本：

```bash
# 停止服务
sudo systemctl stop heartsphere-edu

# 恢复旧版本
mv heartsphere-edu-service-0.0.1-SNAPSHOT.jar.backup heartsphere-edu-service-0.0.1-SNAPSHOT.jar

# 恢复数据库（如果需要）
mysql -u your_user -p heartsphere_edu < backup_YYYYMMDD_HHMMSS.sql

# 启动服务
sudo systemctl start heartsphere-edu
```

## 📚 相关文档

- [README](../README.md)
- [项目设计文档](../../openspec/changes/separate-edu-version/design.md)
- [API 文档](http://localhost:8084/swagger-ui.html)（开发环境）

---

**最后更新：2026-01-10**
