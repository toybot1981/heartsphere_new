# 心域微信小程序版本（Web-View 模式）

这是一个基于 web-view 的微信小程序版本，直接嵌入 mobile H5 版本，无需重写代码。

## 项目结构

```
wechat/
├── app.js              # 小程序入口文件（简化版）
├── app.json            # 小程序全局配置
├── app.wxss            # 小程序全局样式
├── pages/
│   ├── index/          # 入口页面（自动跳转到 web-view）
│   └── webview/        # web-view 页面（嵌入 H5）
└── project.config.json # 项目配置
```

## 快速开始

### 1. 配置 H5 地址

在 `pages/index/index.js` 中修改 H5 地址：

```javascript
data: {
  h5Url: 'https://your-domain.com/mobile' // 生产环境
  // 或
  h5Url: 'http://localhost:3000' // 开发环境（需要开启调试）
}
```

### 2. 配置业务域名

**重要：** web-view 必须配置业务域名才能正常使用。

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" -> "开发管理" -> "开发设置"
3. 在"业务域名"中添加你的 H5 域名
4. 下载验证文件并上传到服务器根目录
5. 域名必须支持 HTTPS（生产环境）

### 3. 开发环境调试

开发环境使用 `localhost` 需要：

1. 在微信开发者工具中：
   - 点击右上角"详情"
   - 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
2. 确保本地开发服务器运行在配置的端口

### 4. 运行项目

1. 使用微信开发者工具打开 `wechat` 目录
2. 确保 mobile 版本正在运行（如果使用 localhost）
3. 点击编译运行

## 工作原理

1. 用户打开小程序
2. `pages/index/index` 自动跳转到 `pages/webview/webview`
3. web-view 组件加载指定的 H5 页面
4. H5 页面（mobile 版本）在小程序中运行

## 数据通信

### H5 向小程序发送消息

在 mobile 版本中添加：

```typescript
// 检测是否在小程序环境
const isMiniprogram = () => {
  return typeof window !== 'undefined' && 
         window.navigator.userAgent.includes('miniProgram');
};

// 发送消息给小程序
if (isMiniprogram() && window.wx) {
  window.wx.miniProgram.postMessage({
    data: {
      type: 'login',
      token: 'xxx',
      userInfo: {}
    }
  });
}
```

### 小程序接收消息

已在 `pages/webview/webview.js` 中实现 `onMessage` 方法。

## 注意事项

1. **业务域名**：必须配置，否则无法使用 web-view
2. **HTTPS**：生产环境必须使用 HTTPS
3. **性能**：web-view 性能略低于原生小程序
4. **功能限制**：web-view 中无法使用部分小程序 API
5. **调试**：开发环境需要开启"不校验合法域名"选项

## 优势

- ✅ 无需重写代码，直接复用 mobile 版本
- ✅ 快速上线，立即可用
- ✅ 维护成本低，只需维护一套代码
- ✅ 功能完整，保留所有 mobile 版本功能

## 劣势

- ❌ 需要配置业务域名
- ❌ 性能略低于原生小程序
- ❌ 部分小程序能力受限

## 后续优化

如果需要更好的性能和体验，可以考虑：

1. **混合方案**：关键页面使用原生小程序，其他使用 web-view
2. **迁移到 Taro**：一套代码多端运行，性能更好
3. **使用 kbone**：微信官方方案，可直接运行 React 代码

详细方案请参考 `INTEGRATION_GUIDE.md`。
