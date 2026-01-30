# Android 日志查看和网络配置指南

## 📋 查看 Android 日志（Logcat）

### 方法一：在 Android Studio 中查看（推荐）

1. **打开 Logcat**：
   - 在 Android Studio 底部工具栏找到 "Logcat" 标签
   - 或使用菜单：`View` → `Tool Windows` → `Logcat`

2. **过滤日志**：
   - 在搜索框中输入过滤条件：
     - `heartsphere` - 查看应用相关日志
     - `capacitor` - 查看 Capacitor 框架日志
     - `WebView` - 查看 WebView 相关日志
     - `chromium` - 查看 Chromium 引擎日志
     - `tag:MainActivity` - 查看 MainActivity 日志

3. **日志级别**：
   - 使用下拉菜单选择日志级别：
     - `Verbose` - 所有日志
     - `Debug` - 调试信息
     - `Info` - 信息（推荐）
     - `Warn` - 警告
     - `Error` - 错误（最常用）

4. **查看网络请求**：
   - 搜索：`chromium` 或 `network`
   - 查看 API 请求和响应

### 方法二：使用命令行（adb logcat）

```bash
# 查看所有日志
adb logcat

# 只查看错误日志
adb logcat *:E

# 过滤应用相关日志
adb logcat | grep -i "heartsphere\|capacitor\|chromium"

# 查看网络请求
adb logcat | grep -i "network\|http\|api"

# 清除日志并重新开始
adb logcat -c && adb logcat

# 保存日志到文件
adb logcat > android_logs.txt
```

### 方法三：使用 Chrome DevTools（调试 WebView）

1. **启用远程调试**：
   - 在 Chrome 浏览器地址栏输入：`chrome://inspect`
   - 在 "Remote Target" 中找到您的应用
   - 点击 "inspect" 打开 DevTools

2. **查看 Console 日志**：
   - 在 DevTools 中打开 "Console" 标签
   - 可以看到 JavaScript 的 console.log 输出

3. **查看 Network 请求**：
   - 打开 "Network" 标签
   - 可以看到所有 API 请求和响应
   - 检查请求 URL、状态码、响应内容

## 🌐 Android 虚拟机网络配置问题

### 问题原因

Android 虚拟机无法访问 `localhost` 或 `127.0.0.1`，因为：
- 虚拟机有独立的网络环境
- `localhost` 指向虚拟机自身，而不是宿主机
- 需要使用特殊地址访问宿主机

### 解决方案

#### 方案一：使用 10.0.2.2 访问宿主机（推荐用于开发）

Android 模拟器使用 `10.0.2.2` 来访问宿主机的 `localhost`。

**配置步骤**：

1. **创建环境配置文件**：
   在 `main/frontend` 目录下创建 `.env.local` 文件：

   ```bash
   # Android 模拟器访问宿主机
   # 10.0.2.2 是 Android 模拟器访问宿主机的特殊地址
   VITE_API_BASE_URL=http://10.0.2.2:8081
   ```

2. **重新构建**：
   ```bash
   cd main/frontend
   npm run build
   npm run cap:build:android
   ```

3. **验证配置**：
   - 在 Logcat 中搜索 `API_BASE_URL` 或查看网络请求
   - 应该看到请求发送到 `http://10.0.2.2:8081`

#### 方案二：使用实际 IP 地址（推荐用于真实设备）

如果使用真实 Android 设备，需要使用电脑的实际 IP 地址。

1. **查找电脑 IP 地址**：

   **Mac/Linux**:
   ```bash
   # 查看本机 IP 地址
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # 或使用
   ipconfig getifaddr en0  # Wi-Fi
   ipconfig getifaddr en1  # 以太网
   ```

   **Windows**:
   ```cmd
   ipconfig
   # 查找 IPv4 地址，通常是 192.168.x.x 或 10.x.x.x
   ```

2. **配置环境变量**：
   在 `.env.local` 中设置：
   ```bash
   # 使用实际 IP 地址（替换为您的 IP）
   VITE_API_BASE_URL=http://192.168.1.100:8081
   ```

3. **确保防火墙允许连接**：
   - Mac: 系统设置 → 防火墙 → 允许 Node.js 或 Java
   - Windows: 防火墙设置 → 允许端口 8081

4. **确保设备在同一网络**：
   - 手机和电脑必须连接到同一个 Wi-Fi 网络

#### 方案三：使用 Capacitor 开发服务器（开发时推荐）

在开发时，可以让 Android 应用直接连接到 Vite 开发服务器。

1. **修改 `capacitor.config.ts`**：
   ```typescript
   const config: CapacitorConfig = {
     // ... 其他配置
     server: {
       // 开发时连接到本地开发服务器
       url: 'http://10.0.2.2:3000/mobile.html',  // 模拟器
       // url: 'http://192.168.1.100:3000/mobile.html',  // 真实设备（使用实际IP）
       androidScheme: 'https'
     },
   };
   ```

2. **启动开发服务器**：
   ```bash
   cd main/frontend
   npm run dev
   ```

3. **同步到 Android**：
   ```bash
   npx cap sync android
   ```

4. **运行应用**：
   - 应用会直接加载开发服务器的内容
   - 修改代码后会自动热更新

**注意**：使用此方法时，不需要构建，直接运行即可。

#### 方案四：配置后端允许跨域访问

如果后端运行在 `localhost:8081`，需要确保允许来自 Android 应用的请求。

**Spring Boot 配置示例**（如果使用 Spring Boot）：
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")  // 开发环境允许所有来源
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
```

## 🔍 调试网络问题

### 1. 检查 API 请求地址

在 Logcat 中搜索：
```
chromium
```

查看网络请求日志，确认：
- 请求的 URL 是否正确
- 是否返回 404、500 等错误
- 是否有 CORS 错误

### 2. 使用 Chrome DevTools 调试

1. 打开 `chrome://inspect`
2. 找到您的应用并点击 "inspect"
3. 在 Network 标签中查看：
   - 请求 URL
   - 请求方法
   - 状态码
   - 响应内容
   - 错误信息

### 3. 测试网络连接

在 Android 应用中添加测试代码：

```javascript
// 测试网络连接
fetch('http://10.0.2.2:8081/api/health')
  .then(response => {
    console.log('网络连接成功:', response.status);
  })
  .catch(error => {
    console.error('网络连接失败:', error);
  });
```

在 Logcat 或 Chrome DevTools Console 中查看结果。

## 📝 配置示例

### 开发环境配置（.env.local）

```bash
# Android 模拟器
VITE_API_BASE_URL=http://10.0.2.2:8081

# 真实设备（替换为实际 IP）
# VITE_API_BASE_URL=http://192.168.1.100:8081

# 生产环境（留空使用相对路径）
# VITE_API_BASE_URL=
```

### Capacitor 开发服务器配置

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  // ... 其他配置
  server: {
    // 开发环境：连接到 Vite 开发服务器
    url: process.env.NODE_ENV === 'development' 
      ? 'http://10.0.2.2:3000/mobile.html'  // 模拟器
      : undefined,  // 生产环境使用本地资源
    androidScheme: 'https'
  },
};
```

## ✅ 验证清单

配置完成后，验证以下项目：

- [ ] Logcat 中可以看到应用日志
- [ ] 网络请求发送到正确的地址
- [ ] API 请求返回成功（200）而不是失败（404/500）
- [ ] 没有 CORS 错误
- [ ] 应用可以正常加载数据

## 🐛 常见错误和解决方案

### 错误 1: Network request failed

**原因**: 无法连接到后端服务器

**解决方案**:
- 检查后端服务是否运行
- 检查 IP 地址是否正确（模拟器用 `10.0.2.2`，真实设备用实际 IP）
- 检查防火墙设置

### 错误 2: CORS policy error

**原因**: 后端不允许跨域请求

**解决方案**:
- 配置后端允许来自 Android 应用的请求
- 或使用代理服务器

### 错误 3: Connection refused

**原因**: 端口未开放或服务未运行

**解决方案**:
```bash
# 检查后端服务是否运行
curl http://localhost:8081/api/health

# 检查端口是否被占用
lsof -i :8081
```

### 错误 4: 白屏或加载失败

**原因**: Web 资源未正确同步

**解决方案**:
```bash
# 重新构建和同步
npm run cap:build:android
```

## 📚 相关文档

- [Android 启动指南](./ANDROID_启动指南.md)
- [Android 构建指南](./ANDROID_MOBILE_BUILD_GUIDE.md)
- [Capacitor 网络配置](https://capacitorjs.com/docs/guides/live-reload)

---

**提示**: 开发时推荐使用方案三（Capacitor 开发服务器），可以实时看到代码更改，无需重新构建。
