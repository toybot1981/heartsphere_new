# 微信开放平台本地测试回调配置指南

微信开放平台（包括微信登录和微信支付）不支持直接回调到 `localhost`，因为 `localhost` 不是公网地址。本文档提供几种在本地开发环境中测试微信回调的解决方案。

## 方案一：使用 ngrok（推荐）

### 1. 安装 ngrok

**macOS:**
```bash
brew install ngrok
# 或
brew install ngrok/ngrok/ngrok
```

**Windows:**
- 访问 https://ngrok.com/download 下载
- 或使用 Chocolatey: `choco install ngrok`

**Linux:**
```bash
# 下载并解压
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

### 2. 注册并获取 Token

1. 访问 https://dashboard.ngrok.com/signup 注册账号
2. 获取 Authtoken
3. 配置 token:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 3. 启动内网穿透

**对于后端服务（端口 8081）:**
```bash
ngrok http 8081
```

**输出示例:**
```
Forwarding  https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:8081
```

### 4. 配置微信开放平台

#### 微信登录回调配置

1. 登录 [微信开放平台](https://open.weixin.qq.com/)
2. 进入"网站应用" -> 你的应用
3. 在"授权回调域"中配置：
   - 格式：`xxxx-xxxx-xxxx.ngrok-free.app`（不需要加协议和端口）
   - 例如：`a1b2c3d4.ngrok-free.app`
4. 在系统配置中设置回调地址：
   ```
   https://xxxx-xxxx-xxxx.ngrok-free.app/api/wechat/callback
   ```

#### 微信支付回调配置

1. 登录 [微信商户平台](https://pay.weixin.qq.com/)
2. 进入"开发配置" -> "支付配置"
3. 设置"支付回调URL"：
   ```
   https://xxxx-xxxx-xxxx.ngrok-free.app/api/payment/callback/wechat
   ```

### 5. 注意事项

- **免费版限制：**
  - 每次启动 ngrok 会生成新的随机域名
  - 需要每次更新微信开放平台的配置
  - 有连接数限制

- **付费版优势：**
  - 可以设置固定域名
  - 无连接数限制
  - 更稳定

## 方案二：使用 natapp（国内推荐）

### 1. 注册并下载

1. 访问 https://natapp.cn/ 注册账号
2. 下载客户端（支持 Windows/macOS/Linux）

### 2. 获取隧道

1. 登录后进入"我的隧道"
2. 购买免费隧道或付费隧道
3. 记录隧道的 authtoken

### 3. 配置并启动

**创建配置文件 `natapp.yml`:**
```yaml
clienttoken: YOUR_AUTH_TOKEN
```

**启动:**
```bash
natapp -authtoken=YOUR_AUTH_TOKEN -subdomain=your-subdomain 8081
```

**或使用配置文件:**
```bash
natapp -config=natapp.yml
```

### 4. 配置微信开放平台

使用 natapp 提供的域名（格式：`your-subdomain.natapp1.cc`）配置回调地址。

## 方案三：使用 localtunnel（免费，简单）

### 1. 安装

```bash
npm install -g localtunnel
```

### 2. 启动

```bash
lt --port 8081
```

**输出示例:**
```
your url is: https://random-name.loca.lt
```

### 3. 配置微信开放平台

使用 loca.lt 提供的域名配置回调地址。

**注意：** 首次访问需要点击"Continue"按钮确认。

## 方案四：使用微信沙箱环境（仅支付）

### 1. 申请沙箱环境

1. 登录 [微信商户平台](https://pay.weixin.qq.com/)
2. 进入"开发配置" -> "沙箱环境"
3. 获取沙箱密钥和证书

### 2. 配置沙箱回调

沙箱环境支持配置本地回调地址进行测试，但需要配合内网穿透使用。

## 方案五：使用固定域名 + 本地 hosts（高级）

### 1. 购买域名并配置 DNS

1. 购买一个测试域名（如：`test.example.com`）
2. 配置 A 记录指向你的服务器 IP
3. 或使用 CNAME 指向 ngrok 固定域名

### 2. 配置本地 hosts（仅本地访问）

**macOS/Linux:**
```bash
sudo vim /etc/hosts
```

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts
```

**添加:**
```
127.0.0.1 test.example.com
```

### 3. 配置微信开放平台

使用 `test.example.com` 配置回调地址。

## 推荐配置流程

### 开发环境（推荐使用 ngrok）

1. **启动后端服务:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **启动 ngrok:**
   ```bash
   ngrok http 8081
   ```

3. **复制 ngrok 提供的 HTTPS 地址:**
   ```
   https://xxxx-xxxx-xxxx.ngrok-free.app
   ```

4. **更新系统配置:**
   - 微信登录回调：`https://xxxx-xxxx-xxxx.ngrok-free.app/api/wechat/callback`
   - 微信支付回调：`https://xxxx-xxxx-xxxx.ngrok-free.app/api/payment/callback/wechat`

5. **更新微信开放平台配置:**
   - 在微信开放平台中配置授权回调域
   - 在微信商户平台中配置支付回调URL

### 生产环境

1. 使用固定域名
2. 配置 HTTPS 证书
3. 在微信开放平台配置正式回调地址

## 常见问题

### Q1: ngrok 每次启动域名都变化怎么办？

**A:** 
- 使用付费版 ngrok 可以设置固定域名
- 或使用 natapp 付费版
- 或使用方案五（固定域名）

### Q2: 微信回调验证失败？

**A:** 
- 检查回调地址是否正确（必须是 HTTPS）
- 检查授权回调域配置是否正确（不需要协议和端口）
- 检查签名验证逻辑是否正确实现

### Q3: 本地测试时回调超时？

**A:**
- 检查 ngrok 连接是否正常
- 检查后端服务是否正常运行
- 检查防火墙设置

### Q4: 如何测试微信支付回调？

**A:**
1. 使用微信支付沙箱环境
2. 使用内网穿透工具暴露本地服务
3. 在微信商户平台配置回调URL
4. 发起测试支付，微信会自动回调

## 测试工具

### 测试微信登录回调

```bash
# 使用 curl 模拟回调
curl "https://your-ngrok-domain.ngrok-free.app/api/wechat/callback?code=TEST_CODE&state=TEST_STATE"
```

### 测试微信支付回调

```bash
# 使用 curl 模拟回调（需要正确的签名和加密数据）
curl -X POST "https://your-ngrok-domain.ngrok-free.app/api/payment/callback/wechat" \
  -H "Content-Type: application/json" \
  -H "Wechatpay-Signature: test" \
  -H "Wechatpay-Timestamp: 1234567890" \
  -H "Wechatpay-Nonce: test" \
  -H "Wechatpay-Serial: test" \
  -d '{"resource":{"ciphertext":"test"}}'
```

## 相关文档

- [ngrok 官方文档](https://ngrok.com/docs)
- [natapp 官方文档](https://natapp.cn/article/natapp_newbie)
- [微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)

## 安全注意事项

1. **不要在生产环境使用内网穿透工具**
2. **测试完成后及时关闭内网穿透**
3. **不要在代码中硬编码测试回调地址**
4. **使用环境变量管理回调地址**
5. **确保回调接口有正确的签名验证**





