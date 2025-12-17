# 部署文件总结

## 数字生命体交互系统（心域）阿里云 ECS 部署文件清单

### 📋 部署脚本

| 文件名 | 功能 | 说明 |
|--------|------|------|
| `deploy.sh` | 主部署脚本 | 一键部署后端和前端 |
| `deploy-backend.sh` | 后端部署脚本 | 部署 Spring Boot 后端服务 |
| `deploy-frontend.sh` | 前端部署脚本 | 部署 React 前端和 Nginx |
| `update.sh` | 更新脚本 | 更新已部署的系统 |
| `check-status.sh` | 状态检查脚本 | 检查系统运行状态 |
| `configure-api-keys.sh` | API Key 配置脚本 | 交互式配置大模型 API Key |

### 📄 配置文件

| 文件名 | 功能 | 说明 |
|--------|------|------|
| `env.template` | 环境变量模板 | 所有配置项的模板文件 |
| `.env` (部署后生成) | 环境变量配置 | 实际使用的配置文件（在 `/opt/heartsphere/.env`） |

### 📚 文档文件

| 文件名 | 功能 | 说明 |
|--------|------|------|
| `QUICK_DEPLOY.md` | 快速部署指南 | 快速上手指南 |
| `deploy/README.md` | 详细部署文档 | 完整的部署说明 |
| `API_KEYS_CONFIG.md` | API Key 配置指南 | 大模型 API Key 配置说明 |

## 快速开始

### 1. 上传项目到服务器

```bash
# 在本地打包（排除 node_modules 和 target）
tar --exclude='node_modules' \
    --exclude='target' \
    --exclude='.git' \
    -czf heartsphere.tar.gz heartsphere_new/

# 上传到服务器
scp heartsphere.tar.gz root@your-server-ip:/root/
```

### 2. 在服务器上部署

```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 解压项目
cd /root
tar -xzf heartsphere.tar.gz
cd heartsphere_new

# 执行部署
chmod +x deploy.sh deploy-backend.sh deploy-frontend.sh
./deploy.sh
```

### 3. 配置 API Key

```bash
# 使用交互式脚本配置
./configure-api-keys.sh

# 或者手动编辑
vi /opt/heartsphere/.env
```

### 4. 重新构建前端（如果配置了 API Key）

```bash
./deploy-frontend.sh
```

## 文件说明

### 部署脚本功能

#### `deploy.sh` - 主部署脚本
- 创建应用用户和目录
- 调用后端和前端部署脚本
- 配置防火墙规则

#### `deploy-backend.sh` - 后端部署
- ✅ 安装 Java 17
- ✅ 安装 Maven
- ✅ 安装 MySQL 8.0
- ✅ 创建数据库和用户
- ✅ 构建 Spring Boot JAR
- ✅ 创建 systemd 服务
- ✅ 生成环境配置文件
- ✅ 配置生产环境

#### `deploy-frontend.sh` - 前端部署
- ✅ 安装 Node.js 18+
- ✅ 安装 Nginx
- ✅ 读取环境变量配置
- ✅ 生成 `.env.production` 文件
- ✅ 构建 React 生产版本
- ✅ 配置 Nginx 反向代理
- ✅ 配置静态文件服务

#### `update.sh` - 更新脚本
- 支持单独更新后端或前端
- 自动备份旧版本
- 失败时自动回滚

#### `check-status.sh` - 状态检查
- 检查服务运行状态
- 检查端口监听
- 检查数据库连接
- 检查 API 健康状态
- 显示系统资源使用

#### `configure-api-keys.sh` - API Key 配置
- 交互式配置界面
- 支持配置所有大模型 API Key
- 自动重新构建前端

## 环境变量配置

### 必需配置

```bash
# 数据库配置
DB_NAME=heartsphere
DB_USER=heartsphere
DB_PASSWORD=your-strong-password
DB_HOST=localhost
DB_PORT=3306

# JWT 密钥（自动生成）
JWT_SECRET=...
```

### 大模型 API Key 配置（重要！）

```bash
# 至少配置一个 API Key
GEMINI_API_KEY=your-gemini-key
# 或
OPENAI_API_KEY=your-openai-key
# 或
QWEN_API_KEY=your-qwen-key
# 或
DOUBAO_API_KEY=your-doubao-key
```

### 可选配置

```bash
# 微信登录（可选）
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_REDIRECT_URI=http://your-domain.com/api/wechat/callback

# 图片存储
IMAGE_STORAGE_PATH=/opt/heartsphere/uploads/images
IMAGE_BASE_URL=http://your-domain.com/api/images

# 路由策略
TEXT_PROVIDER=gemini
IMAGE_PROVIDER=gemini
ENABLE_FALLBACK=true
```

## 部署后验证

### 1. 检查服务状态

```bash
./check-status.sh
```

### 2. 测试后端 API

```bash
curl http://localhost:8081/api/health
```

### 3. 测试前端页面

```bash
curl http://localhost
# 或浏览器访问
http://your-server-ip
```

## 常见问题

### Q: 如何配置大模型 API Key？

**A:** 有两种方式：

1. **使用交互式脚本（推荐）**
   ```bash
   ./configure-api-keys.sh
   ```

2. **手动编辑配置文件**
   ```bash
   vi /opt/heartsphere/.env
   # 添加 API Key 配置
   # 然后重新构建前端
   ./deploy-frontend.sh
   ```

### Q: 配置 API Key 后需要重启服务吗？

**A:** 需要重新构建前端，因为 API Key 是在构建时注入的：

```bash
./deploy-frontend.sh
# 或
./update.sh  # 选择选项 2（仅更新前端）
```

### Q: 如何查看当前配置的 API Key？

**A:** 使用配置脚本查看：

```bash
./configure-api-keys.sh
# 选择选项 6（查看当前配置）
```

### Q: 可以只配置一个 API Key 吗？

**A:** 可以。系统至少需要一个 API Key 才能正常工作。推荐配置 Gemini API Key。

### Q: 如何切换使用不同的模型？

**A:** 编辑 `/opt/heartsphere/.env` 文件，修改路由策略：

```bash
TEXT_PROVIDER=qwen      # 改为使用 Qwen
IMAGE_PROVIDER=qwen     # 改为使用 Qwen
```

然后重新构建前端。

## 安全建议

1. **保护配置文件**
   - `.env` 文件权限已设置为 600
   - 不要将 API Key 提交到代码仓库
   - 定期轮换 API Key

2. **防火墙配置**
   - 只开放必要端口（80, 443）
   - 后端端口（8081）建议不对外开放，仅通过 Nginx 访问

3. **SSL 证书**
   - 生产环境建议配置 HTTPS
   - 使用 Let's Encrypt 免费证书

## 技术支持

如遇到问题，请提供：
- 系统版本信息
- 服务状态：`./check-status.sh`
- 后端日志：`journalctl -u heartsphere-backend -n 100`
- 前端日志：`tail -100 /var/log/nginx/heartsphere-error.log`





