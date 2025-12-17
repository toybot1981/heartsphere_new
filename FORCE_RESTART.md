# 强制重启后端服务

## 问题诊断

**当前状态：**
- 后端服务进程ID: 22655
- ImageController.class 已编译（在 target/classes 中）
- 但是 `/api/images/upload` 仍然返回 404

**根本原因：**
后端服务在添加 ImageController 之前启动，运行中的JVM没有加载新的Controller类。

## 解决方案

### 步骤1：强制停止旧进程

```bash
# 方法1：优雅停止
kill 22655

# 方法2：如果优雅停止失败，强制杀死
kill -9 22655

# 方法3：通过端口查找并停止
lsof -ti:8081 | xargs kill -9
```

### 步骤2：确认进程已停止

```bash
lsof -ti:8081
# 应该没有输出，表示端口已释放
```

### 步骤3：重新编译（可选，但推荐）

```bash
cd backend
mvn clean compile
```

### 步骤4：启动新服务

```bash
cd backend
mvn spring-boot:run
```

### 步骤5：验证ImageController已加载

启动后，在日志中查找：
- `Mapped "{[/api/images/upload]}"` 
- 或者 `ImageController` 相关的日志

### 步骤6：测试端点

```bash
curl -X POST http://localhost:8081/api/images/upload -F "file=@test.png" -F "category=test"
```

如果返回成功（不是404），说明重启成功！

## 一键重启脚本

```bash
#!/bin/bash
echo "停止旧服务..."
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

echo "重新编译..."
cd backend
mvn clean compile -q

echo "启动新服务..."
mvn spring-boot:run
```



