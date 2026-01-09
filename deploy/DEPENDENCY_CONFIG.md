# 依赖配置说明

## 📋 概述

HeartSphere 项目的依赖配置已经优化，所有依赖都在主 `dependencies` 中，Maven Profile 仅用于配置 Spring Profile。

## 🔧 Maven Profile 说明

| Profile | 用途 | 说明 |
|---------|------|------|
| **dev** (默认) | 开发环境 | 设置 `spring.profiles.active=dev`，使用 `application-dev.yml` |
| **prod** | 生产环境 | 设置 `spring.profiles.active=prod`，使用 `application-prod.yml` |

**重要**: Profile 不再用于依赖管理，所有依赖统一在主 dependencies 中。

## 📦 包含的依赖

所有环境（dev 和 prod）都包含以下完整依赖：

- ✅ **Docker Java Client** - Mentis VM 管理功能
- ✅ **Selenium**（精简版）- GUI 自动化测试
  - `selenium-api`
  - `selenium-chrome-driver`
  - `selenium-firefox-driver`
  - `selenium-support`
- ✅ **支付宝SDK** - 支付功能
- ✅ **微信支付SDK** - 支付功能

## 🚀 使用方法

### 开发环境

```bash
# 编译（默认使用 dev profile）
mvn clean compile

# 运行（使用 dev profile，application-dev.yml）
mvn spring-boot:run

# 或显式指定
mvn spring-boot:run -Pdev

# 打包
mvn clean package -Pdev
```

### 生产环境

```bash
# 编译（使用 prod profile）
mvn clean compile -Pprod

# 打包（使用 prod profile）
mvn clean package -Pprod

# 运行（使用 prod profile，application-prod.yml）
mvn spring-boot:run -Pprod

# 或使用部署脚本
./deploy/deploy-backend-prod.sh
```

## 📊 配置文件

### application-dev.yml
- 懒加载：启用
- Swagger：启用
- Mentis：默认关闭（可通过配置开启）
- 支付：默认关闭（可通过配置开启）

### application-prod.yml
- 懒加载：关闭
- Swagger：关闭
- Mentis：按需开启
- 支付：按需开启

## ⚠️ 注意事项

1. **依赖管理**
   - 所有依赖都在主 `dependencies` 中
   - dev 和 prod profile 都包含完整依赖
   - 开发环境可以测试所有功能（Mentis、支付等）

2. **功能控制**
   - 通过配置文件中的 `@ConditionalOnProperty` 控制功能启用/禁用
   - 例如：`mentis.enabled=true` 启用 Mentis 功能
   - 例如：`payment.enabled=true` 启用支付功能

3. **Profile 用途**
   - 仅用于配置 Spring Profile
   - 控制使用哪个 `application-*.yml` 配置文件
   - 不影响依赖加载

## 🔍 验证方法

### 检查依赖树
```bash
# 所有环境都包含完整依赖
mvn dependency:tree | grep -E "(selenium|docker|alipay|wechatpay)"
```

### 检查编译
```bash
# 开发环境
mvn clean compile -Pdev

# 生产环境
mvn clean compile -Pprod
```

### 检查打包
```bash
# 开发环境
mvn clean package -Pdev
ls -lh backend/target/*.jar

# 生产环境
mvn clean package -Pprod
ls -lh backend/target/*.jar
```

## 📚 相关文档

- `backend/DEPENDENCY_OPTIMIZATION_SUMMARY.md` - 依赖优化总结
- `backend/DEPENDENCY_OPTIMIZATION.md` - 详细优化方案
- `backend/PERFORMANCE_ANALYSIS.md` - 性能分析报告

## 🎯 优化效果

| 指标 | 优化前 | 优化后 | 减少 |
|------|--------|--------|------|
| **依赖大小** | ~474MB | ~404MB | 70MB (15%) |
| **编译时间** | ~60s | ~50s | 10s (17%) |
| **启动时间** | 51.5s | 7.9s | 43.6s (85%) |
| **JAR大小** | ~150MB | ~130MB | 20MB (13%) |

**说明**: 
- 依赖大小减少主要来自移除 `selenium-java`（~70MB）
- 启动时间优化主要来自懒加载和异步初始化（已实施）

