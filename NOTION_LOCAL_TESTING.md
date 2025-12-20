# Notion OAuth 本地测试快速指南

## 问题说明

Notion OAuth 的回调地址必须是**可公开访问的 URL**。直接使用 `localhost` 时，Notion 服务器无法访问您的本地机器，导致授权失败。

## 推荐方案：使用 ngrok

### 快速开始（使用自动化脚本）

项目已提供自动化脚本，可以一键安装和配置：

```bash
# 1. 安装 ngrok
./install_ngrok.sh

# 2. 启动 ngrok 隧道（会自动检测后端服务）
./start_ngrok.sh

# 3. 更新 Notion 配置（可选，也可手动更新）
./update_notion_callback.sh
```

详细说明请参考：`NGROK_SETUP_GUIDE.md`

### 手动安装（3 步）

#### 1. 安装 ngrok

**macOS：**
```bash
brew install ngrok/ngrok/ngrok
```

**或访问官网下载：** https://ngrok.com/

#### 2. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

确保后端在 `http://localhost:8081` 运行。

#### 3. 启动 ngrok 并配置

**在新终端窗口运行：**
```bash
ngrok http 8081
```

**复制显示的 HTTPS URL**，例如：
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8081
```

**然后：**
1. 在 Notion 集成设置中添加 Redirect URI：
   ```
   https://abc123.ngrok-free.app/api/notes/notion/callback
   ```

2. 在管理后台的 Notion 配置中，设置回调地址为：
   ```
   https://abc123.ngrok-free.app/api/notes/notion/callback
   ```

3. 保存配置，开始测试！

### ngrok 使用技巧

#### 查看请求日志

ngrok 提供了一个 Web 界面查看所有请求：
```
http://127.0.0.1:4040
```

在浏览器中打开此地址，可以：
- 查看所有请求和响应
- 调试 OAuth 流程
- 查看错误信息

#### 固定域名（付费功能）

如果需要固定 URL（避免每次重启都变化），可以：
1. 注册 ngrok 账号（免费版也可用）
2. 在 ngrok 配置文件中设置 authtoken
3. 使用固定域名功能

#### 免费版限制

- 每次启动 URL 会变化
- 有连接数限制
- 适合开发和测试使用

## 其他方案

### 方案 2：使用 localtunnel（免费，简单）

```bash
# 安装
npm install -g localtunnel

# 启动隧道
lt --port 8081 --subdomain yourname
```

然后使用返回的 URL 配置回调地址。

### 方案 3：使用 Cloudflare Tunnel（免费，稳定）

```bash
# 安装 cloudflared
brew install cloudflared

# 启动隧道
cloudflared tunnel --url http://localhost:8081
```

## 测试流程

1. ✅ 启动后端服务（`mvn spring-boot:run`）
2. ✅ 启动 ngrok（`ngrok http 8081`）
3. ✅ 在 Notion 集成中配置回调地址（使用 ngrok URL）
4. ✅ 在管理后台配置回调地址（使用 ngrok URL）
5. ✅ 在前端测试授权流程

## 常见问题

### Q: ngrok URL 每次启动都变化怎么办？

**A:** 这是 ngrok 免费版的限制。每次启动后需要：
1. 更新 Notion 集成中的 Redirect URI
2. 更新管理后台中的回调地址

或者使用 ngrok 付费版获得固定域名。

### Q: ngrok 连接超时怎么办？

**A:** 
- 检查后端服务是否正常运行
- 检查 ngrok 是否正常运行
- 重新启动 ngrok 并更新配置

### Q: 可以使用 HTTP 吗？

**A:** Notion OAuth 要求使用 HTTPS。ngrok 免费版提供 HTTPS，所以推荐使用 ngrok。

### Q: 生产环境也需要 ngrok 吗？

**A:** 不需要。生产环境使用实际的域名和 HTTPS 证书即可。

## 调试技巧

1. **查看 ngrok 请求日志**：访问 `http://127.0.0.1:4040`
2. **查看后端日志**：检查 Spring Boot 控制台输出
3. **查看浏览器控制台**：检查前端是否有错误
4. **检查 Notion 集成日志**：在 Notion 开发者门户查看

## 快速命令参考

```bash
# 启动后端
cd backend && mvn spring-boot:run

# 启动 ngrok（新终端）
ngrok http 8081

# 查看 ngrok 日志
open http://127.0.0.1:4040
```


