# Swagger 生产环境排除配置

## ✅ 已完成的配置

### 1. Maven Profile 配置
在 `pom.xml` 的 `prod` profile 中，将 Swagger 依赖设置为 `provided` scope：

```xml
<profile>
    <id>prod</id>
    <properties>
        <spring.profiles.active>prod</spring.profiles.active>
    </properties>
    <dependencies>
        <!-- 在生产环境排除 Swagger，减少 JAR 包大小 (~3.8M) -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>${springdoc.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</profile>
```

### 2. Spring 配置类条件装配
在 `OpenApiConfig` 类上添加 `@ConditionalOnProperty` 注解：

```java
@Configuration
@ConditionalOnProperty(name = "springdoc.swagger-ui.enabled", havingValue = "true", matchIfMissing = true)
public class OpenApiConfig {
    // ...
}
```

### 3. 应用配置
在 `application-prod.yml` 中禁用 Swagger：

```yaml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

## 📊 效果

### JAR 包大小减少
- **Swagger UI**: ~3.8M
- **相关依赖**: ~1-2M
- **总计减少**: ~5-6M

### 依赖排除验证
生产环境打包后，JAR 包中不包含以下依赖：
- `springdoc-openapi-starter-webmvc-ui`
- `swagger-ui`
- `swagger-core` (部分)

## 🚀 使用方法

### 开发环境
```bash
# 默认包含 Swagger 依赖
mvn clean package

# 或显式使用 dev profile
mvn clean package -Pdev
```

### 生产环境
```bash
# 排除 Swagger 依赖
mvn clean package -Pprod

# 运行时不包含 Swagger
java -jar target/heartsphere-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## ⚠️ 注意事项

1. **开发环境仍可使用 Swagger**
   - 开发环境默认包含 Swagger 依赖
   - 可以通过 `http://localhost:8081/swagger-ui.html` 访问

2. **生产环境配置**
   - Swagger UI 已被排除，即使配置启用也无法使用
   - `application-prod.yml` 中已禁用 Swagger

3. **安全考虑**
   - 生产环境排除 Swagger 可以避免暴露 API 文档
   - 减少攻击面

## 🔍 验证方法

### 检查依赖树
```bash
# 开发环境（包含 Swagger）
mvn dependency:tree -Pdev | grep springdoc

# 生产环境（排除 Swagger）
mvn dependency:tree -Pprod | grep springdoc
```

### 检查 JAR 包内容
```bash
# 解压 JAR 包并检查
jar -tf target/heartsphere-service-0.0.1-SNAPSHOT.jar | grep swagger
```

### 检查 JAR 包大小
```bash
# 开发环境打包
mvn clean package -Pdev
ls -lh target/heartsphere-service-0.0.1-SNAPSHOT.jar

# 生产环境打包
mvn clean package -Pprod
ls -lh target/heartsphere-service-0.0.1-SNAPSHOT.jar
```

## 📚 相关文档

- `DEPENDENCY_OPTIMIZATION_SUMMARY.md` - 依赖优化总结
- `JAR_SIZE_ANALYSIS.md` - JAR 包大小分析
