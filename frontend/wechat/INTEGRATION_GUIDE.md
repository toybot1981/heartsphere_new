# Mobile 版本集成到微信小程序方案

## 方案对比

### 方案 1: web-view 组件（推荐 - 最简单）

**优点：**
- ✅ 无需修改 mobile 代码
- ✅ 快速集成，立即可用
- ✅ 保持 mobile 版本的所有功能
- ✅ 维护成本低

**缺点：**
- ❌ 需要配置业务域名
- ❌ 部分小程序能力受限（如支付、分享等）
- ❌ 性能略低于原生小程序

**实现步骤：**

1. **配置业务域名**
   - 在微信公众平台配置业务域名
   - 域名需要支持 HTTPS
   - 需要下载验证文件到服务器根目录

2. **修改 app.json**
```json
{
  "pages": [
    "pages/webview/webview"
  ],
  "window": {
    "navigationBarTitleText": "心域"
  }
}
```

3. **访问方式**
```javascript
// 在小程序中跳转到 web-view
wx.navigateTo({
  url: '/pages/webview/webview?url=' + encodeURIComponent('https://your-domain.com/mobile')
});
```

---

### 方案 2: Taro 框架（推荐 - 长期方案）

**优点：**
- ✅ 一套代码，多端运行（H5、小程序、App）
- ✅ 性能接近原生小程序
- ✅ 可以使用小程序原生能力
- ✅ 代码复用率高

**缺点：**
- ❌ 需要重构部分代码
- ❌ 学习成本
- ❌ 构建配置较复杂

**实现步骤：**

1. **安装 Taro**
```bash
npm install -g @tarojs/cli
npm install @tarojs/taro @tarojs/components @tarojs/runtime
```

2. **创建 Taro 项目结构**
```
frontend/
├── mobile/          # 原有 mobile 版本
└── taro/           # Taro 版本
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── app.config.js
    └── config/
        └── index.js
```

3. **迁移组件**
   - 将 React 组件迁移到 Taro
   - 使用 Taro 的组件替代 HTML 标签
   - 适配小程序 API

---

### 方案 3: kbone（微信官方方案）

**优点：**
- ✅ 可以直接运行 Vue/React 代码
- ✅ 无需大幅修改代码
- ✅ 官方支持

**缺点：**
- ❌ 性能开销较大
- ❌ 包体积较大
- ❌ 部分功能受限

**实现步骤：**

1. **安装 kbone**
```bash
npm install miniprogram-element miniprogram-patch
```

2. **配置构建**
   - 使用 kbone 提供的构建工具
   - 将 React 代码编译为小程序可运行格式

---

## 推荐方案：web-view（快速集成）

### 完整实现

#### 1. 创建 web-view 页面

已创建 `pages/webview/webview.js` 和 `pages/webview/webview.wxml`

#### 2. 修改 app.json

```json
{
  "pages": [
    "pages/webview/webview"
  ],
  "window": {
    "navigationBarTitleText": "心域",
    "navigationBarBackgroundColor": "#000000",
    "navigationBarTextStyle": "white"
  }
}
```

#### 3. 配置业务域名

1. 登录微信公众平台
2. 进入"开发" -> "开发管理" -> "开发设置"
3. 配置"业务域名"
4. 上传验证文件到服务器

#### 4. 修改 mobile 版本以支持小程序环境

在 mobile 版本中添加小程序适配：

```typescript
// frontend/mobile/utils/miniprogram.ts
export const isMiniprogram = () => {
  return typeof window !== 'undefined' && 
         window.navigator.userAgent.includes('miniProgram');
};

// 在小程序中发送消息给小程序
export const sendToMiniprogram = (data: any) => {
  if (isMiniprogram() && window.wx) {
    window.wx.miniProgram.postMessage({
      data: data
    });
  }
};
```

#### 5. 处理登录状态同步

```typescript
// 在 mobile 版本登录成功后
if (isMiniprogram()) {
  sendToMiniprogram({
    type: 'login',
    token: authToken,
    userInfo: userProfile
  });
}
```

---

## 方案 2：Taro 迁移（推荐长期使用）

### 迁移步骤

1. **创建 Taro 项目**
```bash
cd frontend
taro init taro-app
```

2. **迁移组件结构**
   - 将 `mobile/components` 迁移到 `taro/src/components`
   - 将 `mobile/MobileApp.tsx` 迁移为 `taro/src/app.tsx`
   - 适配 Taro 组件 API

3. **适配示例**

**原 React 代码：**
```tsx
<div className="container">
  <button onClick={handleClick}>点击</button>
</div>
```

**Taro 代码：**
```tsx
<View className="container">
  <Button onClick={handleClick}>点击</Button>
</View>
```

4. **构建配置**
```javascript
// config/index.js
module.exports = {
  // 小程序配置
  mini: {
    compile: {
      exclude: ['node_modules']
    }
  },
  // H5 配置
  h5: {
    // ...
  }
};
```

---

## 建议

### 短期方案（1-2周）
使用 **web-view** 方案，快速上线，验证功能。

### 长期方案（1-2月）
迁移到 **Taro**，获得更好的性能和用户体验。

### 实施建议

1. **第一阶段**：使用 web-view 快速集成
   - 配置业务域名
   - 创建 web-view 页面
   - 测试功能完整性

2. **第二阶段**：逐步迁移到 Taro
   - 先迁移核心页面（日记、聊天）
   - 保留 web-view 作为备用
   - 逐步替换

3. **第三阶段**：完全使用 Taro
   - 移除 web-view 依赖
   - 优化性能
   - 使用小程序原生能力

---

## 注意事项

1. **业务域名配置**：web-view 必须配置业务域名，且需要 HTTPS
2. **性能优化**：web-view 性能略低，建议关键页面使用原生
3. **功能限制**：web-view 中无法使用部分小程序 API
4. **数据同步**：需要处理 H5 和小程序之间的数据同步


