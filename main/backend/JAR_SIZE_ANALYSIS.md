# JAR 包大小分析报告

## 📦 总体情况

- **JAR 文件大小**: 138MB
- **依赖总数**: 161 个
- **依赖总大小**: ~109MB

## 🔝 最大的依赖包（前30个）

| 大小 | 依赖包 | 类别 |
|------|--------|------|
| 24M | alipay-sdk-java-4.38.200.ALL.jar | 支付SDK |
| 11M | hibernate-core-6.3.1.Final.jar | ORM框架 |
| 4.3M | bcprov-jdk15on-1.62.jar | 加密库 |
| 4.0M | byte-buddy-1.14.10.jar | 字节码生成 |
| 3.8M | swagger-ui-5.10.3.jar | API文档 |
| 3.3M | tomcat-embed-core-10.1.16.jar | 内嵌服务器 |
| 3.1M | jtokkit-1.1.0.jar | Token处理 |
| 2.4M | mysql-connector-j-8.1.0.jar | 数据库驱动 |
| 2.0M | aspectjweaver-1.9.20.1.jar | AOP框架 |
| 1.8M | spring-boot-autoconfigure-3.2.0.jar | Spring Boot |
| 1.8M | reactor-core-3.6.0.jar | 响应式编程 |
| 1.8M | spring-web-6.1.1.jar | Spring Web |
| 1.8M | spring-core-6.1.1.jar | Spring Core |
| 1.7M | spring-security-config-6.2.0.jar | Spring Security |
| 1.6M | kotlin-stdlib-1.9.20.jar | Kotlin标准库 |
| 1.5M | jackson-databind-2.15.3.jar | JSON处理 |
| 1.5M | spring-boot-3.2.0.jar | Spring Boot |
| 1.4M | spring-data-jpa-3.2.0.jar | Spring Data JPA |
| 1.4M | spring-data-commons-3.2.0.jar | Spring Data |
| 1.3M | opennlp-tools-2.3.3.jar | NLP工具 |
| 1.2M | spring-context-6.1.1.jar | Spring Context |
| 1.0M | spring-webmvc-6.1.1.jar | Spring MVC |
| 940K | spring-webflux-6.1.1.jar | Spring WebFlux |
| 899K | jaxb-runtime-4.0.4.jar | XML绑定 |
| 868K | caffeine-3.1.8.jar | 缓存库 |
| 861K | micrometer-core-1.12.0.jar | 监控指标 |
| 852K | spring-beans-6.1.1.jar | Spring Beans |
| 835K | httpcore5-5.2.3.jar | HTTP客户端 |
| 821K | wechatpay-java-0.2.12.jar | 支付SDK |
| 820K | httpclient5-5.2.1.jar | HTTP客户端 |

## 📊 按类别统计

### 💳 支付相关
- **支付宝SDK**: 24M (最大单个依赖)
- **微信支付SDK**: 821K
- **总计**: ~25M

### 🌐 Selenium 相关
- 多个 selenium 相关依赖，总计约 15-20M

### 🐳 Docker 相关
- 多个 docker-java 相关依赖，总计约 5-8M

### 💾 数据库相关
- **Hibernate Core**: 11M (第二大单个依赖)
- **MySQL Connector**: 2.4M
- **Spring Data JPA**: 1.4M
- **总计**: ~15M

### 🔧 Spring Boot 相关
- Spring Boot 核心依赖组：~20M

## 💡 优化建议

### 1. 支付宝SDK (24M) - 最大占用
**现状**: 支付宝SDK 是最大的单个依赖（24M）

**优化方案**:
- ✅ 已在代码中使用 `@ConditionalOnProperty` 条件装配
- ✅ 可通过配置 `payment.alipay.enabled=false` 禁用
- ⚠️ 但仍然会打包到 JAR 中

**进一步优化**:
- 考虑使用 `<scope>provided</scope>` 在生产环境按需加载
- 或使用 Maven Profile 分离（但已改为统一依赖管理）
- **注意**: 当前配置（统一依赖）是正确的，因为开发环境也需要测试支付功能

### 2. Hibernate Core (11M) - 第二大依赖
**现状**: ORM 框架核心，必需依赖

**优化方案**:
- 这是 Spring Data JPA 的核心依赖，无法移除
- 可以考虑使用更轻量的 ORM（如 MyBatis），但需要重构

### 3. Swagger UI (3.8M)
**现状**: API 文档工具

**优化方案**:
- ✅ 生产环境可通过配置禁用
- 考虑使用 `<scope>provided</scope>` 在生产环境排除
- 或使用 Spring Profile 条件装配

### 4. Selenium (总计 ~15-20M)
**现状**: 多个 selenium 相关依赖

**优化方案**:
- ✅ 已精简（只保留需要的驱动）
- ✅ 已在代码中使用 `@ConditionalOnProperty` 条件装配
- ⚠️ 但仍然会打包到 JAR 中

**进一步优化**:
- 如果生产环境不需要 GUI 自动化，可以考虑：
  - 使用 `<scope>provided</scope>` 在生产环境排除
  - 或创建单独的模块/项目

### 5. Docker Java Client (~5-8M)
**现状**: Mentis VM 管理功能

**优化方案**:
- ✅ 已在代码中使用 `@ConditionalOnProperty` 条件装配
- ✅ 可通过配置 `mentis.enabled=false` 禁用
- ⚠️ 但仍然会打包到 JAR 中

## 📈 优化优先级

1. **高优先级** - 支付宝SDK (24M)
   - 如果生产环境不需要，可以考虑排除
   
2. **中优先级** - Swagger UI (3.8M)
   - 生产环境可以排除
   
3. **中优先级** - Selenium (~15-20M)
   - 如果生产环境不需要，可以考虑排除

4. **低优先级** - Docker Java Client (~5-8M)
   - 如果生产环境不需要 Mentis，可以考虑排除

5. **必需依赖** - Hibernate Core (11M)
   - 核心功能，无法移除

## 🎯 总结

当前 JAR 包大小 138MB 是合理的，主要因为：
1. ✅ 支付SDK（24M）- 功能必需，已在代码中条件装配
2. ✅ Hibernate Core (11M) - ORM 核心，必需
3. ✅ Spring Boot 生态（~20M）- 框架核心，必需
4. ✅ Selenium (~15-20M) - 已精简，功能必需
5. ✅ Docker Client (~5-8M) - 功能必需，已在代码中条件装配

**建议**: 
- 如果生产环境确实不需要某些功能（如 Swagger、Selenium、支付），可以考虑使用 Maven `<scope>provided</scope>` 在生产环境排除
- 但当前配置（统一依赖，条件装配）更灵活，允许运行时通过配置启用/禁用功能
