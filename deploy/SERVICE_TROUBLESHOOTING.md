# 后端服务故障排查指南

## 问题：systemd 服务启动失败

当遇到以下错误时：
```
Job for heartsphere-backend.service failed because of unavailable resources or another system error.
```

## 快速诊断

运行诊断脚本：
```bash
sudo ./check-backend-service.sh
```

该脚本会检查：
1. 用户是否存在
2. 目录是否存在
3. JAR 文件是否存在
4. Java 是否安装
5. 环境变量文件是否存在
6. systemd 服务文件配置是否正确
7. 服务状态
8. 最近的错误日志

## 自动修复

运行修复脚本：
```bash
sudo ./fix-backend-service.sh
```

该脚本会自动：
1. 创建用户（如果不存在）
2. 创建必要的目录
3. 检查 JAR 文件
4. 验证 Java 环境
5. 创建或验证环境变量文件
6. 更新 systemd 服务文件
7. 重新加载 systemd 并启动服务

## 手动排查步骤

### 1. 检查用户是否存在

```bash
id heartsphere
```

如果用户不存在，创建用户：
```bash
sudo useradd -r -s /bin/bash -d /opt/heartsphere heartsphere
```

### 2. 检查目录和文件

```bash
# 检查目录
ls -la /opt/heartsphere/backend/

# 检查 JAR 文件
ls -lh /opt/heartsphere/backend/app.jar

# 检查环境变量文件
ls -la /opt/heartsphere/.env
```

### 3. 检查 Java 环境

```bash
# 检查 Java 是否安装
java -version

# 检查 JAVA_HOME
echo $JAVA_HOME
```

### 4. 检查服务文件

```bash
# 查看服务文件
cat /etc/systemd/system/heartsphere-backend.service

# 验证服务文件语法
systemctl cat heartsphere-backend
```

### 5. 查看服务状态和日志

```bash
# 查看服务状态
systemctl status heartsphere-backend

# 查看详细日志
journalctl -u heartsphere-backend -n 50

# 实时查看日志
journalctl -u heartsphere-backend -f
```

## 常见问题及解决方案

### 问题 1: 用户不存在

**错误信息：**
```
Failed to set up user: No such user
```

**解决方案：**
```bash
sudo useradd -r -s /bin/bash -d /opt/heartsphere heartsphere
sudo chown -R heartsphere:heartsphere /opt/heartsphere
```

### 问题 2: JAR 文件不存在

**错误信息：**
```
Cannot find JAR file
```

**解决方案：**
```bash
# 重新构建并部署
cd /path/to/heartsphere_new/backend
mvn clean package -DskipTests
sudo cp target/*.jar /opt/heartsphere/backend/app.jar
sudo chown heartsphere:heartsphere /opt/heartsphere/backend/app.jar
```

### 问题 3: Java 路径不正确

**错误信息：**
```
/usr/bin/java: No such file or directory
```

**解决方案：**
```bash
# 查找 Java 路径
which java
readlink -f /usr/bin/java

# 更新服务文件中的 Java 路径
sudo vi /etc/systemd/system/heartsphere-backend.service
# 修改 ExecStart 中的 java 路径
sudo systemctl daemon-reload
sudo systemctl restart heartsphere-backend
```

### 问题 4: 环境变量文件格式错误

**错误信息：**
```
Failed to load environment file
```

**解决方案：**
```bash
# 检查环境变量文件格式
cat /opt/heartsphere/.env

# 确保文件格式正确（每行 KEY=VALUE）
# 确保文件权限正确
sudo chown heartsphere:heartsphere /opt/heartsphere/.env
sudo chmod 600 /opt/heartsphere/.env
```

### 问题 5: 数据库连接失败

**错误信息：**
```
Cannot connect to database
```

**解决方案：**
```bash
# 检查数据库配置
cat /opt/heartsphere/.env | grep DB_

# 测试数据库连接
mysql -u heartsphere -p -h localhost heartsphere

# 检查 MySQL 服务
systemctl status mysqld
```

### 问题 6: 端口被占用

**错误信息：**
```
Address already in use
```

**解决方案：**
```bash
# 检查端口占用
netstat -tlnp | grep 8081
# 或
ss -tlnp | grep 8081

# 停止占用端口的进程
sudo kill -9 <PID>
```

## 重新部署

如果以上方法都无法解决问题，可以重新运行部署脚本：

```bash
cd /path/to/heartsphere_new/deploy
sudo ./deploy-backend.sh
```

## 验证服务

服务启动成功后，验证服务是否正常工作：

```bash
# 检查服务状态
systemctl status heartsphere-backend

# 检查端口监听
netstat -tlnp | grep 8081

# 测试 API
curl http://localhost:8081/api/health
```

## 联系支持

如果问题仍然存在，请提供以下信息：

1. 诊断脚本输出：`sudo ./check-backend-service.sh`
2. 服务日志：`journalctl -u heartsphere-backend -n 100`
3. 系统信息：`uname -a` 和 `cat /etc/os-release`

