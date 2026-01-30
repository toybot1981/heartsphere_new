# Electron 安装问题排查

## 网络超时问题

如果遇到 `ETIMEDOUT` 错误，通常是网络无法访问 GitHub（Electron 从 GitHub Releases 下载二进制文件）。

### 解决方案 1：使用国内镜像源（推荐）

设置 Electron 镜像环境变量：

```bash
# 使用淘宝镜像
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"

# 或使用腾讯云镜像
export ELECTRON_MIRROR="https://mirrors.cloud.tencent.com/electron/"

# 然后安装
npm install
```

### 解决方案 2：临时设置（单次安装）

```bash
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" npm install
```

### 解决方案 3：在 .npmrc 中配置（永久）

在 `main/frontend/.npmrc` 文件中添加：

```
electron_mirror=https://npmmirror.com/mirrors/electron/
```

### 解决方案 4：使用代理

如果有代理，设置代理环境变量：

```bash
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
npm install
```

### 解决方案 5：稍后重试

网络问题可能是临时的，可以稍后重试：

```bash
npm install
```

## 验证安装

安装成功后，验证 Electron 是否可用：

```bash
cd main/frontend
npx electron --version
```

应该显示 Electron 版本号（如 `v33.2.0`）。

## 仅安装 Electron（不安装其他依赖）

如果只需要安装 Electron 相关依赖：

```bash
cd main/frontend
npm install electron electron-builder concurrently wait-on cross-env --save-dev
```

## 跳过 Electron 安装（仅构建 Web）

如果暂时不需要 Electron，可以跳过安装，直接构建 Web 版本：

```bash
npm run build
```

这会生成 `dist/` 目录，Electron 可以在后续需要时再安装。
