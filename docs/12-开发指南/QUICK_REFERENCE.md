# Maven优化快速参考卡

## 🚀 3个命令立即优化

### 1️⃣ 应用优化配置（1分钟）

```bash
cd backend
cp pom.xml pom.xml.backup
cp pom-optimized.xml pom.xml
```

### 2️⃣ 配置Maven加速（30秒）

```bash
mkdir -p ~/.m2
cp settings.xml ~/.m2/
```

### 3️⃣ 使用快速编译（立即生效）

```bash
# 最快
./build-fast.sh dev

# 或手动
mvn clean package -Pdev -T 4 -DskipTests
```

---

## 📋 常用命令速查

### 日常开发

```bash
# 快速编译（推荐）
mvn compile -T 4                    # 20秒
mvn package -o -T 4                 # 30秒

# 完整编译
mvn clean package -Pdev -T 4        # 1分钟

# 超快编译（跳过更多）
mvn package -o -DskipTests -T 4     # 40秒
```

### 测试相关

```bash
# 所有测试
mvn test -T 4                       # 2分钟

# 单个测试类
mvn test -Dtest=JournalEntryRepositoryTest

# 跳过集成测试
mvn test -Dexcludes="**/*IntegrationTest"

# 并行测试
mvn test -T 8                       # 1.5分钟
```

### 生产构建

```bash
# 完整构建
mvn clean package -Pprod -T 4       # 4分钟

# Docker构建
./build-fast.sh docker              # 4分钟
```

### 依赖分析

```bash
# 查看依赖树
mvn dependency:tree

# 分析依赖大小
mvn dependency:tree | sort -k3 -rn | head -20

# 检查未使用依赖
mvn dependency:analyze
```

---

## 🎯 Profile选择

| 场景 | 命令 | 时间 |
|------|------|------|
| **日常开发** | `-Pdev` | 1分钟 |
| **测试环境** | `-Ptest` | 2-3分钟 |
| **生产构建** | `-Pprod` | 4分钟 |
| **Docker** | `-Pdocker` | 4分钟 |

---

## 🔧 Maven参数速查

| 参数 | 说明 | 效果 |
|------|------|------|
| `-T 4` | 4线程编译 | 节省50%时间 |
| `-o` | 离线模式 | 节省网络时间 |
| `-DskipTests` | 跳过测试 | 节省测试时间 |
| `--offline` | 完全离线 | 最快速度 |
| `-Pdev` | dev profile | 跳过测试 |
| `-B` | 批量模式 | 减少输出 |

---

## 📊 预期效果

| 操作 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 日常编译 | 3-4分钟 | 40-60秒 | 75% ↓ |
| 包体积 | 120MB | 45MB | 62% ↓ |
| Docker镜像 | 450MB | 180MB | 60% ↓ |

---

## 🐛 问题排查

### 编译慢？

```bash
# 1. 检查线程数
mvn -version

# 2. 增加线程
mvn clean package -T 8

# 3. 检查网络
time mvn dependency:resolve
```

### 包体积大？

```bash
# 1. 分析依赖
mvn dependency:tree -Dscope=compile

# 2. 检查JAR内容
jar tf target/*.jar | wc -l

# 3. 查看分层
java -Djarmode=tools -jar target/*.jar list-layers
```

### 测试失败？

```bash
# 1. 单独运行失败测试
mvn test -Dtest=FailTest

# 2. 跳过失败的测试
mvn test -Dmaven.test.failure.ignore=true

# 3. 只运行单元测试
mvn test -Dexcludes="**/*IntegrationTest"
```

---

## 📁 重要文件位置

| 文件 | 路径 | 用途 |
|------|------|------|
| **pom.xml** | backend/ | Maven配置 |
| **pom-optimized.xml** | backend/ | 优化后配置 |
| **settings.xml** | ~/.m2/ | Maven全局配置 |
| **build-fast.sh** | backend/ | 快速构建脚本 |
| **Dockerfile** | backend/ | Docker配置 |
| **.dockerignore** | backend/ | Docker忽略文件 |

---

## 💡 最佳实践

### ✅ DO（推荐）

```bash
# 1. 使用dev profile日常开发
mvn package -Pdev

# 2. 增量编译（不要每次clean）
mvn compile -T 4

# 3. 并行编译（利用多核）
mvn package -T 4

# 4. 使用脚本简化命令
./build-fast.sh dev
```

### ❌ DON'T（避免）

```bash
# 1. 不要每次都clean
mvn clean compile  # ❌ 除非必要

# 2. 不要在开发时执行完整测试
mvn clean test    # ❌ 耗时太长

# 3. 不要使用单线程编译
mvn package      # ❌ 未使用-T参数

# 4. 不要在高速网络忽略镜像
# ❌ 即使网络快，镜像也能提速
```

---

## 🎓 学习资源

### 快速链接

- [QUICK_OPTIMIZATION.md](QUICK_OPTIMIZATION.md) - 快速优化指南
- [MAVEN_OPTIMIZATION_GUIDE.md](MAVEN_OPTIMIZATION_GUIDE.md) - 完整优化方案
- [OPTIMIZATION_COMPARISON.md](OPTIMIZATION_COMPARISON.md) - 优化对比数据

### Maven文档

- [官方文档](https://maven.apache.org/guides/)
- [Spring Boot Maven](https://docs.spring.io/spring-boot/docs/current/reference/html/build.html)
- [多模块构建](https://maven.apache.org/guides/mini/guide-multiple-modules/)

---

## ✅ 实施检查清单

- [ ] 备份原pom.xml
- [ ] 应用pom-optimized.xml
- [ ] 配置~/.m2/settings.xml
- [ ] 设置脚本执行权限
- [ ] 测试快速编译
- [ ] 验证包体积减小
- [ ] 更新IDE配置
- [ ] 配置CI/CD

---

**最后更新**: 2025-12-26
**版本**: v1.0
**适用项目**: HeartSphere Backend
