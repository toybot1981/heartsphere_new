# 后端依赖优化方案

## 📊 当前依赖分析

### 大型依赖使用情况

| 依赖 | 大小 | 使用文件数 | 状态 |
|------|------|-----------|------|
| **Selenium Java** | ~100MB+ | 1个文件 | ✅ 使用但过度引入 |
| **Docker Java** | ~50MB+ | 2个文件 | ⚠️ 条件化装配（Mentis） |
| **支付宝SDK** | ~20MB | 2个文件 | ⚠️ 条件化装配（支付） |
| **微信支付SDK** | ~10MB | 2个文件 | ⚠️ 条件化装配（支付） |
| **WebFlux** | ~10MB | 9个文件 | ✅ 必需（流式响应） |
| **OAuth Signpost** | ~500KB | 1个文件 | ❓ 可能未使用 |

### 问题分析

1. **Selenium 过度引入**
   - 当前: 引入完整的 `selenium-java`（包含所有浏览器驱动）
   - 实际: 只使用 Chrome 和 Firefox
   - 优化: 只引入 `selenium-chrome-driver`（如果只需要Chrome）
   - 预期减少: ~70MB

2. **Firefox 驱动冗余**
   - 当前: 引入 `selenium-firefox-driver`
   - 实际: 代码支持但可能不使用
   - 优化: 移除 Firefox 驱动（如果不需要）

3. **Docker 依赖条件化**
   - 当前: 直接引入 Docker Java Client
   - 优化: 移到 Maven Profile（按需加载）
   - 预期减少: ~50MB（开发环境）

4. **支付SDK 条件化**
   - 当前: 直接引入支付宝和微信支付SDK
   - 优化: 移到 Maven Profile（按需加载）
   - 预期减少: ~30MB（开发环境）

5. **OAuth Signpost 可能未使用**
   - 当前: 引入 OAuth Signpost（用于Evernote）
   - 优化: 检查使用情况，如未使用则移除

## 🚀 优化方案

### 方案1: 精简 Selenium 依赖（立即执行）

**优化内容:**
- 移除 `selenium-java`（包含所有浏览器驱动）
- 只保留 `selenium-chrome-driver`（如果只需要Chrome）
- 或保留 `selenium-chrome-driver` + `selenium-firefox-driver`（如果两者都需要）

**预期效果:**
- 减少 ~70MB（如果移除Firefox）
- 编译速度提升 ~10-15%
- 启动速度提升 ~5秒

### 方案2: Maven Profile 分层（推荐）

**创建多个 Profile:**
- `dev`（默认）- 不包含 Docker、Selenium、支付SDK
- `prod` - 包含所有依赖
- `mentis` - 包含 Docker 和 Selenium
- `payment` - 包含支付SDK

**预期效果:**
- 开发环境减少 ~150MB
- 编译速度提升 ~30-40%
- 启动速度提升 ~10-15秒

### 方案3: 移除未使用的依赖（立即执行）

**检查并移除:**
- OAuth Signpost（如果确认未使用）
- 其他未使用的依赖

**预期效果:**
- 减少 ~500KB
- 编译速度提升 ~2%

## 📋 实施步骤

### 优先级1: 立即优化（预计减少 ~70MB）

1. **精简 Selenium 依赖**
   ```xml
   <!-- 移除 -->
   <dependency>
       <groupId>org.seleniumhq.selenium</groupId>
       <artifactId>selenium-java</artifactId>
   </dependency>
   <dependency>
       <groupId>org.seleniumhq.selenium</groupId>
       <artifactId>selenium-firefox-driver</artifactId>
   </dependency>
   
   <!-- 只保留 Chrome -->
   <dependency>
       <groupId>org.seleniumhq.selenium</groupId>
       <artifactId>selenium-chrome-driver</artifactId>
       <version>4.15.0</version>
   </dependency>
   ```

2. **检查 OAuth Signpost 使用情况**
   - 如果未使用，移除相关依赖

### 优先级2: Maven Profile 分层（预计减少 ~150MB 开发环境）

1. **创建 Maven Profile**
   - `dev` - 基础依赖
   - `mentis` - Docker + Selenium
   - `payment` - 支付SDK
   - `prod` - 所有依赖

2. **调整代码使用条件化装配**
   - 确保 Mentis 和支付模块有 `@ConditionalOnProperty`

### 优先级3: 长期优化

1. **模块化拆分**
   - 拆分为 core、web、mentis、payment 模块
   - 按需打包

2. **依赖版本统一**
   - 统一 Spring Boot 版本
   - 统一依赖版本

## 🔍 验证方法

### 1. 依赖大小检查
```bash
mvn dependency:tree | grep -E "selenium|docker|alipay|wechatpay"
```

### 2. 编译时间测试
```bash
time mvn clean compile -DskipTests
```

### 3. 打包大小检查
```bash
ls -lh target/*.jar
```

### 4. 启动时间测试
```bash
time mvn spring-boot:run
```

## 📊 预期效果对比

| 指标 | 优化前 | 方案1 | 方案2（dev） | 全部优化 |
|------|--------|-------|-------------|---------|
| **依赖大小** | ~474MB | ~404MB | ~324MB | ~280MB |
| **编译时间** | ~60s | ~50s | ~40s | ~35s |
| **启动时间** | 51.5s | 46s | 35s | 30s |
| **JAR大小** | ~150MB | ~130MB | ~100MB | ~80MB |

## ⚠️ 注意事项

1. **Selenium 精简**
   - 如果只保留 Chrome，需要确保生产环境有 Chrome 浏览器
   - 或使用 Chrome Headless 模式

2. **Maven Profile**
   - 确保 CI/CD 使用正确的 Profile
   - 文档化 Profile 使用方法

3. **条件化装配**
   - 确保代码中有适当的 `@ConditionalOnProperty`
   - 测试各 Profile 下的功能

## 📝 实施清单

- [ ] 优先级1: 精简 Selenium 依赖
- [ ] 优先级1: 检查并移除 OAuth Signpost
- [ ] 优先级2: 创建 Maven Profile
- [ ] 优先级2: 调整依赖到对应 Profile
- [ ] 优先级2: 更新文档
- [ ] 优先级3: 测试各 Profile
- [ ] 优先级3: 更新 CI/CD 配置
