# Maven 编译内存不足问题解决方案

## 问题描述
编译时出现退出码 137，表示进程被系统终止，通常是由于内存不足（OOM）导致的。

## 解决方案

### 方案 1：通过环境变量设置（推荐）

在运行 Maven 命令前，设置 `MAVEN_OPTS` 环境变量：

```bash
export MAVEN_OPTS="-Xmx4g -Xms2g"
mvn clean compile
```

或者在单次命令中设置：

```bash
MAVEN_OPTS="-Xmx4g -Xms2g" mvn clean compile
```

### 方案 2：在 pom.xml 中配置（已配置）

已在 `pom.xml` 中添加了 `maven-compiler-plugin` 配置，增加编译内存到 4GB。

### 方案 3：使用 Maven Wrapper（如果使用）

如果使用 Maven Wrapper，可以编辑 `.mvn/jvm.config` 文件：

```
-Xmx4g
-Xms2g
```

## 内存建议

- **最小内存**：2GB (Xms2g)
- **最大内存**：4GB (Xmx4g)
- 如果系统内存充足，可以增加到 6GB 或 8GB

## 验证

编译完成后，可以通过以下命令验证：

```bash
mvn clean compile
```

如果仍然出现内存不足，可以尝试：
1. 增加内存分配（如 `-Xmx6g`）
2. 关闭其他占用内存的应用程序
3. 使用增量编译而不是完全重新编译
