# 修复字符编码问题

## 问题描述

生产服务器部署时出现错误：
```
Caused by: java.io.UnsupportedEncodingException: utf8mb4
```

## 原因分析

在 MySQL JDBC URL 中使用了 `characterEncoding=utf8mb4`，但 Java 不支持 `utf8mb4` 作为字符集名称。

**重要说明：**
- `utf8mb4` 是 MySQL 数据库的字符集名称
- Java JDBC 的 `characterEncoding` 参数需要使用 Java 标准字符集名称
- 应该使用 `UTF-8` 或 `utf-8`（Java 标准名称）

## 修复内容

### 1. 修复 application.yml
- **文件**: `backend/src/main/resources/application.yml`
- **修改**: `characterEncoding=utf8mb4` → `characterEncoding=UTF-8`

### 2. 修复部署脚本
- **文件**: `deploy/deploy-backend.sh`
- **修改**: 生成 `application-prod.yml` 时使用 `UTF-8` 而不是 `utf8mb4`

## 修复后的配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://host:port/database?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
```

## 注意事项

1. **数据库字符集**: MySQL 数据库和表的字符集仍然应该使用 `utf8mb4`（在 CREATE TABLE 语句中）
2. **JDBC 连接**: JDBC URL 中的 `characterEncoding` 必须使用 Java 标准字符集名称 `UTF-8`
3. **兼容性**: `UTF-8` 和 `utf-8` 都可以，但推荐使用 `UTF-8`（更规范）

## 验证

修复后，重新部署应用，应该不再出现 `UnsupportedEncodingException` 错误。

## 相关文件

- `backend/src/main/resources/application.yml` ✅ 已修复
- `deploy/deploy-backend.sh` ✅ 已修复
- `backend/src/main/resources/application.properties` (使用 `utf8`，可以保留或改为 `UTF-8`)
