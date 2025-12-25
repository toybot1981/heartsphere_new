# 微信开放平台 "Scope 参数错误或没有 Scope 权限" 错误修复指南

## 错误原因

当使用微信开放平台进行扫码登录时，如果出现 "Scope 参数错误或没有 Scope 权限" 错误，通常由以下原因导致：

1. **应用类型错误**：使用了非"网站应用"类型的应用
2. **权限未申请**：网站应用权限未申请或未通过审核
3. **回调域名配置错误**：授权回调域名配置不正确
4. **AppID/AppSecret 错误**：使用了错误的应用凭证

## 排查步骤

### 步骤1：检查应用类型

1. 登录 [微信开放平台](https://open.weixin.qq.com/)
2. 进入"管理中心" -> "网站应用"
3. **确认应用类型为"网站应用"**

   ⚠️ **重要**：
   - ✅ **网站应用**：支持 `snsapi_login` scope（PC端扫码登录）
   - ❌ **移动应用**：不支持扫码登录，只支持手机端授权
   - ❌ **小程序**：不支持网站登录
   - ❌ **公众号**：不支持网站登录

4. 如果应用类型不是"网站应用"，需要：
   - 创建一个新的"网站应用"
   - 或使用已有的"网站应用"的AppID和AppSecret

### 步骤2：检查网站应用权限

1. 在"网站应用"详情页面，检查"开发信息"
2. **确认已申请并开通以下权限**：
   - ✅ 获取用户基本信息
   - ✅ 获取用户昵称、头像

3. 如果权限未申请：
   - 点击"申请"按钮
   - 填写申请理由
   - 等待审核通过（通常1-3个工作日）

### 步骤3：检查授权回调域名配置

1. 在"网站应用"详情页面，找到"授权回调域"
2. **配置授权回调域**：
   
   **格式要求**：
   - 只需要填写域名，不需要协议（http/https）和端口
   - 不需要包含路径（如 `/api/wechat/callback`）
   
   **正确示例**：
   ```
   ✅ example.com
   ✅ ngrok-free.app  (如果是ngrok免费域名，填写完整域名)
   ✅ a1b2c3d4.ngrok-free.app  (ngrok完整域名)
   ```
   
   **错误示例**：
   ```
   ❌ http://example.com
   ❌ https://example.com
   ❌ example.com:8081
   ❌ example.com/api/wechat/callback
   ```

3. **本地测试使用内网穿透**：
   - 如果使用 ngrok：填写完整的 ngrok 域名（如 `a1b2c3d4.ngrok-free.app`）
   - 如果使用 natapp：填写 natapp 域名（如 `xxxxx.natapp1.cc`）

### 步骤4：检查系统配置

1. **检查 AppID 和 AppSecret**：
   - 登录管理后台
   - 进入"系统配置" -> "微信配置"
   - 确认 AppID 和 AppSecret 是否正确
   - 确认使用的是"网站应用"的 AppID，而不是其他类型应用的 AppID

2. **检查回调地址配置**：
   - 确认"微信回调地址"配置为完整URL
   - 格式：`https://your-domain.com/api/wechat/callback`
   - 如果是本地测试，使用内网穿透的HTTPS地址

### 步骤5：检查代码中的 scope 参数

当前代码使用的 scope 是 `snsapi_login`，这是**正确的**，仅适用于网站应用：

```java
String scope = "snsapi_login"; // 网站应用使用此scope
```

**不要修改此参数**，如果修改为其他 scope（如 `snsapi_base` 或 `snsapi_userinfo`）会导致错误。

## 常见错误码及解决方案

### 错误码：40029
**错误信息**：invalid code, hints: [ req_id: xxx ]

**原因**：code 已被使用或已过期

**解决**：
- 确保每次生成的二维码都是新的
- code 只能使用一次，不能重复使用

### 错误码：40163
**错误信息**：code been used

**原因**：code 已被使用

**解决**：
- 同一个 code 只能使用一次
- 如果回调失败，需要重新生成二维码

### Scope 相关错误
**错误信息**：Scope参数错误或没有Scope权限

**原因**：
1. 应用类型不是"网站应用"
2. 未申请网站应用权限
3. 授权回调域名配置错误

**解决**：
- 按照上述步骤1-3进行检查和修复

## 完整配置示例

### 1. 微信开放平台配置

```
应用类型：网站应用
应用名称：你的应用名称
AppID：wx1234567890abcdef（网站应用的AppID）
AppSecret：1234567890abcdef1234567890abcdef（网站应用的AppSecret）
授权回调域：your-domain.com（或 ngrok 域名）
权限：获取用户基本信息 ✅
```

### 2. 系统配置（管理后台）

```
微信AppID：wx1234567890abcdef
微信AppSecret：1234567890abcdef1234567890abcdef
微信回调地址：https://your-domain.com/api/wechat/callback
```

### 3. 本地测试配置（使用ngrok）

```
微信AppID：wx1234567890abcdef
微信AppSecret：1234567890abcdef1234567890abcdef
微信回调地址：https://a1b2c3d4.ngrok-free.app/api/wechat/callback
授权回调域：a1b2c3d4.ngrok-free.app
```

## 测试流程

### 1. 本地测试（使用ngrok）

```bash
# 1. 启动后端服务
cd backend
mvn spring-boot:run

# 2. 启动ngrok（新终端）
ngrok http 8081

# 3. 复制ngrok提供的HTTPS地址
# 例如：https://a1b2c3d4.ngrok-free.app

# 4. 配置微信开放平台
# - 授权回调域：a1b2c3d4.ngrok-free.app
# - 系统配置中设置回调地址：https://a1b2c3d4.ngrok-free.app/api/wechat/callback

# 5. 测试登录
# - 访问前端登录页面
# - 点击"微信登录"
# - 扫码测试
```

### 2. 生产环境测试

1. 确保域名已备案（如果使用国内服务器）
2. 配置 HTTPS 证书
3. 在微信开放平台配置正式域名
4. 测试登录流程

## 调试日志

后端日志中会记录详细的调试信息：

```
[WeChatAuthService] 开始生成微信登录二维码
[WeChatAuthService] 获取微信配置信息: appId=wx..., appSecret=***, redirectUri=...
[WeChatAuthService] 生成微信登录二维码state: xxx, scope: snsapi_login
[WeChatAuthService] 构建微信登录二维码URL完成
[WeChatAuthService] 收到微信回调，code: xxx, state: xxx
[WeChatAuthService] 请求微信access_token
```

如果出现错误，日志会显示：
```
获取access_token失败: errcode=xxx, errmsg=xxx
Scope参数错误或没有Scope权限。请检查：1) 微信开放平台应用类型是否为'网站应用'；2) 是否已申请网站应用权限；3) 授权回调域名是否正确配置
```

## 常见问题

### Q1: 我之前使用的是移动应用的AppID，现在想改成网站应用怎么办？

**A:** 
- 需要在微信开放平台创建一个新的"网站应用"
- 使用新应用的 AppID 和 AppSecret
- 更新系统配置中的 AppID 和 AppSecret

### Q2: 授权回调域可以配置多个吗？

**A:** 
- 可以配置多个，用分号或换行分隔
- 例如：`domain1.com;domain2.com` 或
```
domain1.com
domain2.com
```

### Q3: ngrok 每次启动域名都变化，每次都要更新吗？

**A:** 
- 免费版 ngrok 每次启动域名都会变化
- 可以使用付费版设置固定域名
- 或使用 natapp 付费版
- 或使用其他内网穿透工具的固定域名功能

### Q4: 测试时一直提示"Scope参数错误"，检查都正常？

**A:** 
- 确认 AppID 和 AppSecret 确实来自"网站应用"
- 确认授权回调域填写正确（只填域名，不填协议和路径）
- 等待几分钟后再试（配置可能有延迟）
- 清除浏览器缓存和Cookie
- 检查是否有多个微信开放平台账号，确认使用的是正确的账号

## 参考文档

- [微信开放平台文档 - 网站应用微信登录](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
- [微信开放平台 - 应用类型说明](https://open.weixin.qq.com/cgi-bin/frame?t=home/web_tmpl&lang=zh_CN)

## 联系支持

如果按照以上步骤排查后仍无法解决，请：

1. 收集以下信息：
   - 后端日志完整输出
   - 微信开放平台应用类型截图
   - 授权回调域配置截图
   - 系统配置截图

2. 检查微信开放平台状态：
   - 应用是否正常
   - 权限是否已开通
   - 是否有审核中的申请

