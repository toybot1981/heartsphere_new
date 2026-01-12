
# ✅ API 文档（Swagger/OpenAPI）配置完成

## ✅ 已完成的工作

### 1. 添加依赖 ✅
- ✅ 在 edu/backend/pom.xml 中添加 springdoc-openapi-starter-webmvc-ui 依赖（版本 2.3.0）

### 2. 创建配置类 ✅
- ✅ 创建 OpenApiConfig.java 配置类
- ✅ 配置 API 信息（标题、描述、版本、联系方式）
- ✅ 配置服务器列表（开发环境、生产环境）

## 📁 创建/更新的文件

1. **edu/backend/pom.xml** - 添加 springdoc-openapi 依赖
2. **edu/backend/src/main/java/com/heartsphere/edu/config/OpenApiConfig.java** - OpenAPI 配置类（新建）

## 🔧 配置说明

### API 文档信息
- 标题：HeartSphere Education Edition API
- 描述：HeartSphere 教育版数字人教育功能 API 文档
- 版本：1.0.0

### 服务器配置
- 开发环境：http://localhost:8084
- 生产环境：https://api-edu.heartsphere.com

## 📖 访问方式

启动 edu 后端服务后，可以通过以下地址访问 API 文档：

- **Swagger UI**: http://localhost:8084/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8084/v3/api-docs
- **OpenAPI YAML**: http://localhost:8084/v3/api-docs.yaml

## ⚠️ 注意事项

1. **注解完善**：可以在 Controller 和 DTO 类中添加 Swagger 注解来完善 API 文档：
   - @Operation：API 操作描述
   - @ApiResponse：响应说明
   - @Parameter：参数说明
   - @Schema：模型说明

2. **生产环境**：建议在生产环境禁用 Swagger UI（通过配置文件）

3. **认证配置**：如果需要添加 JWT 认证到 Swagger UI，可以配置 SecurityScheme

## 下一步建议

1. **添加 API 注解**：在 Controller 和 DTO 类中添加 Swagger 注解
2. **测试 API 文档**：启动服务后访问 Swagger UI，验证文档是否正确生成
3. **配置认证**：如果需要，添加 JWT 认证配置到 Swagger UI

**API 文档配置已完成！**

