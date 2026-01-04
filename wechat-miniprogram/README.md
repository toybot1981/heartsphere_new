# 心域微信小程序

这是一个微信小程序项目，通过内嵌WebView的方式加载Mobile版本的网页（http://heartsphere.cn）。

## 项目结构

```
wechat-miniprogram/
├── app.js                 # 小程序逻辑
├── app.json              # 小程序配置
├── app.wxss              # 全局样式
├── pages/                # 页面目录
│   └── webview/          # WebView页面
│       ├── index.js      # 页面逻辑
│       ├── index.wxml    # 页面结构
│       ├── index.wxss    # 页面样式
│       └── index.json    # 页面配置
├── project.config.json   # 项目配置
├── sitemap.json          # 站点地图配置
└── README.md             # 说明文档
```

## 功能特性

1. **WebView集成**: 内嵌WebView加载Mobile版本网页
2. **加载状态**: 显示加载中动画
3. **错误处理**: 网络错误时显示错误提示和重试按钮
4. **下拉刷新**: 支持下拉刷新重新加载页面
5. **分享功能**: 支持微信小程序分享

## 配置说明

### 1. 修改AppID

在 `project.config.json` 中修改 `appid` 为你的小程序AppID：

```json
{
  "appid": "your-appid-here"
}
```

### 2. 修改Mobile版本地址

在 `app.js` 中修改 `globalData.mobileUrl`：

```javascript
globalData: {
  mobileUrl: 'http://heartsphere.cn' // 修改为你的Mobile版本地址
}
```

### 3. 配置业务域名

在微信公众平台配置业务域名：
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" -> "开发管理" -> "开发设置"
3. 在"业务域名"中添加 `heartsphere.cn`
4. 下载验证文件并上传到服务器根目录

## 开发步骤

1. **安装微信开发者工具**
   - 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

2. **导入项目**
   - 打开微信开发者工具
   - 选择"导入项目"
   - 选择 `wechat-miniprogram` 目录
   - 输入AppID（测试可以使用测试号）

3. **配置域名**
   - 在微信公众平台配置业务域名
   - 确保域名已备案（国内服务器）

4. **编译运行**
   - 在微信开发者工具中点击"编译"
   - 在模拟器中查看效果

## 注意事项

1. **域名要求**:
   - 必须是HTTPS协议（生产环境）
   - 必须在微信公众平台配置业务域名
   - 域名需要备案（国内服务器）

2. **WebView限制**:
   - WebView中无法使用微信小程序API
   - 需要通过 `postMessage` 进行通信
   - 需要处理页面跳转和返回

3. **性能优化**:
   - 首次加载可能较慢，建议添加加载动画
   - 可以预加载关键资源
   - 注意控制WebView内存占用

## 调试

1. **开启调试模式**:
   - 在 `app.json` 中设置 `"debug": true"`
   - 或在微信开发者工具中开启"调试模式"

2. **查看日志**:
   - 在微信开发者工具的"Console"面板查看日志
   - 所有日志都带有 `[WeChat MiniProgram]` 或 `[WebView Page]` 前缀

3. **网络请求**:
   - 在"Network"面板查看网络请求
   - 检查是否有跨域问题

## 发布

1. **上传代码**:
   - 在微信开发者工具中点击"上传"
   - 填写版本号和项目备注

2. **提交审核**:
   - 登录微信公众平台
   - 进入"版本管理" -> "开发版本"
   - 选择版本提交审核

3. **发布上线**:
   - 审核通过后，在"版本管理" -> "审核版本"中发布

## 常见问题

### Q: WebView无法加载页面？
A: 检查以下几点：
- 域名是否在业务域名白名单中
- 是否使用HTTPS协议
- 网络连接是否正常

### Q: 页面显示空白？
A: 可能原因：
- WebView加载失败，查看错误日志
- 页面资源加载失败
- 检查控制台是否有错误信息

### Q: 如何与WebView通信？
A: 使用 `postMessage` API：
- WebView中：`window.wx.miniProgram.postMessage()`
- 小程序中：监听 `bindmessage` 事件

## 更新日志

### v1.0.0 (2025-01-03)
- 初始版本
- 实现WebView基础功能
- 添加加载状态和错误处理
- 支持下拉刷新和分享功能
