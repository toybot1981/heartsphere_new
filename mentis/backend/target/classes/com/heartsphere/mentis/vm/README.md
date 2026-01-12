# Mentis VM 模块说明

## 依赖项

### Docker Java Client

需要在 `pom.xml` 中添加以下依赖：

```xml
<!-- Docker Java Client -->
<dependency>
    <groupId>com.github.docker-java</groupId>
    <artifactId>docker-java-core</artifactId>
    <version>3.3.4</version>
</dependency>
<dependency>
    <groupId>com.github.docker-java</groupId>
    <artifactId>docker-java-httpclient5</artifactId>
    <version>3.3.4</version>
</dependency>
```

## 配置

在 `application.yml` 中添加：

```yaml
mentis:
  docker:
    host: tcp://localhost:2375  # Docker 守护进程地址
    default-image: ubuntu:latest
    default-cpu: 2
    default-memory: 2048  # MB
    default-disk: 20  # GB
```

## 使用说明

### 创建虚拟机

```java
@Autowired
private VmManager vmManager;

VmInstance vm = vmManager.createVmForSession("session123", config);
```

### 获取虚拟机状态

```java
VmStatus status = vmManager.getVmStatus("vm123");
```

### 删除虚拟机

```java
vmManager.deleteVmForSession("session123");
```

## 注意事项

1. 确保 Docker 守护进程正在运行
2. 确保 Docker 守护进程的端口可访问（默认 2375）
3. Docker Java Client 的 API 可能会有变化，注意版本兼容性
