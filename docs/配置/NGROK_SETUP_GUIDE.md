# ngrok 安装和配置指南

本指南将帮助您安装 ngrok 并配置 Notion OAuth 回调地址。

## 快速开始

### 步骤 1: 安装 ngrok

运行安装脚本：

```bash
./install_ngrok.sh
```

如果 Homebrew 安装失败，脚本会尝试直接下载二进制文件。

**手动安装方法：**

1. 访问 [ngrok 下载页面](https://ngrok.com/download)
2. 选择 macOS (ARM64) 版本下载
3. 解压后将 `ngrok` 移动到 `/usr/local/bin/`：
   ```bash
   sudo mv ngrok /usr/local/bin/ngrok
   sudo chmod +x /usr/local/bin/ngrok
   ```

### 步骤 2: 注册 ngrok 账号并获取 Token

1. 访问 [ngrok 注册页面](https://dashboard.ngrok.com/signup) 注册免费账号
2. 登录后访问 [获取 authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. 复制您的 authtoken
4. 运行认证命令：
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

### 步骤 3: 启动后端服务

确保后端服务正在运行：

```bash
cd backend
mvn spring-boot:run
```

或者如果已经在运行，检查端口 8081 是否被占用：
```bash
lsof -ti:8081
```

### 步骤 4: 启动 ngrok 隧道

运行启动脚本：

```bash
./start_ngrok.sh
```

脚本会：
- 检查后端服务是否运行
- 启动 ngrok 隧道到端口 8081
- 自动获取公共 URL
- 显示回调地址信息

**输出示例：**
```
==========================================
✅ ngrok 启动成功！
==========================================

📋 隧道信息：
   本地地址: http://localhost:8081
   公共地址: https://abc123.ngrok-free.app
   回调地址: https://abc123.ngrok-free.app/api/notes/notion/callback

📊 ngrok 控制台: http://127.0.0.1:4040
📝 日志文件: /tmp/ngrok.log
```

### 步骤 5: 更新 Notion 配置

#### 5.1 在 Notion 开发者门户更新

1. 访问 [Notion 我的集成页面](https://www.notion.so/my-integrations)
2. 找到您的集成，点击进入
3. 在 **"OAuth domain & URIs"** 部分
4. 设置 **Redirect URI** 为脚本显示的 `回调地址`
5. 保存设置

#### 5.2 在管理后台更新

**方法 1: 使用自动更新脚本**

```bash
./update_notion_callback.sh
```

脚本会提示您输入管理员 token 并自动更新配置。

**方法 2: 手动更新**

1. 访问管理后台
2. 进入 **系统配置** → **Notion 配置**
3. 将 **回调地址** 设置为 ngrok 提供的回调地址
4. 保存配置

### 步骤 6: 测试授权流程

1. 在前端应用中点击 "授权 Notion"
2. 应该会跳转到 Notion 授权页面
3. 授权后应该能成功回调到您的本地后端

## 常用命令

### 查看 ngrok 状态

访问 ngrok 控制台：
```
http://127.0.0.1:4040
```

或查看日志：
```bash
tail -f /tmp/ngrok.log
```

### 停止 ngrok

```bash
./stop_ngrok.sh
```

或手动停止：
```bash
pkill ngrok
```

### 查看当前隧道信息

```bash
cat /tmp/ngrok_info.txt
```

## 故障排除

### 问题 1: ngrok 无法启动

**检查：**
- ngrok 是否已安装：`which ngrok`
- 是否已配置 authtoken：`ngrok config check`
- 端口 8081 是否被占用：`lsof -ti:8081`

### 问题 2: 无法获取公共 URL

**解决：**
- 等待几秒后重试，ngrok 需要时间初始化
- 检查 ngrok 日志：`tail -f /tmp/ngrok.log`
- 访问 ngrok 控制台查看状态

### 问题 3: 回调地址不匹配

**检查：**
- Notion 开发者门户中的 Redirect URI 必须与后端配置完全一致
- 包括协议（https）、域名、路径
- 注意不要有多余的斜杠

### 问题 4: ngrok 免费版限制

ngrok 免费版每次启动 URL 会变化。如果需要固定 URL，可以：
- 升级到付费版
- 或每次启动后手动更新 Notion 配置

## 注意事项

1. **每次重启 ngrok，URL 都会变化**（免费版）
   - 需要重新更新 Notion 和管理后台的配置

2. **ngrok 免费版有连接数限制**
   - 适合开发和测试
   - 生产环境建议使用固定域名

3. **安全性**
   - ngrok 会将您的本地服务暴露到公网
   - 确保后端有适当的认证和授权
   - 不要在生产环境长期使用 ngrok

4. **性能**
   - ngrok 会增加请求延迟
   - 仅用于开发测试，不适合生产环境

## 生产环境建议

对于生产环境，建议：

1. 使用固定域名和 HTTPS
2. 配置反向代理（如 Nginx）
3. 使用专业的云服务（AWS、Azure、GCP 等）
4. 配置防火墙和安全组规则

## 相关文件

- `install_ngrok.sh` - 安装脚本
- `start_ngrok.sh` - 启动脚本
- `stop_ngrok.sh` - 停止脚本
- `update_notion_callback.sh` - 更新配置脚本
- `NOTION_CONFIG_GUIDE.md` - Notion 配置指南
- `NOTION_LOCAL_TESTING.md` - 本地测试指南


