# Tailwind CSS 和字体资源替换说明

## 问题说明

原项目使用了以下需要 VPN 才能访问的外部资源：
1. `https://cdn.tailwindcss.com` - Tailwind CSS CDN
2. `https://fonts.googleapis.com` - Google Fonts

## 已完成的替换

### 1. Google Fonts → 国内镜像

已替换为**中科大镜像**：
- 原地址：`https://fonts.googleapis.com/css2?family=Noto+Sans+SC...`
- 新地址：`https://fonts.proxy.ustclug.org/css2?family=Noto+Sans+SC...`

**备用字体链**：如果镜像也无法访问，会自动使用系统字体：
- `'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'SimHei', 'SimSun', sans-serif`

### 2. Tailwind CSS CDN → 本地构建（推荐）

已创建 Tailwind 配置文件，需要安装依赖后使用本地构建版本。

## 安装步骤

### 方案一：安装 Tailwind CSS（推荐，性能更好）

在 `frontend` 目录下运行：

```bash
# 如果遇到权限问题，先运行：
sudo chown -R $(whoami) ~/.npm

# 然后安装依赖：
npm install -D tailwindcss postcss autoprefixer
```

安装完成后，重启开发服务器：
```bash
npm run dev
```

### 方案二：使用临时 CDN（当前方案）

**已配置临时 CDN 方案**：使用 `unpkg.com` CDN（国内可访问），确保页面可以正常显示。

当前 `index.html` 和 `admin.html` 中已包含：
```html
<!-- 使用 Staticfile CDN（七牛云，国内访问快） -->
<script src="https://cdn.staticfile.org/tailwindcss/3.4.1/tailwind.min.js"></script>
```

**备用 CDN 选项**（如果 Staticfile 无法访问）：
- BootCDN：`https://cdn.bootcdn.net/ajax/libs/tailwindcss/3.4.1/tailwind.min.js`
- JSDMirror：`https://cdn.jsdmirror.com/npm/tailwindcss@3/dist/tailwind.min.js`

**注意**：
- 这个 CDN 方案是临时的，性能不如本地构建版本
- 安装 Tailwind CSS 后，可以移除这行代码，使用本地构建版本（通过 `src/index.css`）
- 本地构建版本会通过 `index.tsx` 和 `admin.tsx` 中的 `import './src/index.css'` 自动加载

## 已完成的配置

- ✅ `tailwind.config.js` - Tailwind 配置文件
- ✅ `postcss.config.js` - PostCSS 配置文件  
- ✅ `src/index.css` - CSS 入口文件（包含 Tailwind 指令）
- ✅ `index.tsx` 和 `admin.tsx` - 已引入 CSS 文件
- ✅ `index.html` 和 `admin.html` - 已移除 Tailwind CDN，使用国内字体镜像

## 其他国内镜像选项

如果中科大镜像也无法访问，可以尝试以下替代：

1. **75CDN**：`https://cdn.baomitu.com/fonts/css?family=Noto+Sans+SC`
2. **jsDelivr**：`https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5/index.css`
3. **BootCDN**：`https://cdn.bootcdn.net/ajax/libs/font-awesome/...`

## 验证

安装完成后，检查：
1. 浏览器控制台没有 `ERR_CONNECTION_CLOSED` 错误
2. 页面样式正常显示
3. 字体正确加载（检查 Network 标签中的字体请求）

