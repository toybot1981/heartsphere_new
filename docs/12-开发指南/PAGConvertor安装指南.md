# PAGConvertor 安装指南

## 概述

PAGConvertor 是腾讯开发的工具，用于将视频、GIF、APNG、图片序列和 Lottie JSON 文件转换为 PAG 文件。目前该工具**仅支持 macOS 平台**。

## 系统要求

- **操作系统**: macOS（仅支持）
- **架构**: x86_64 或 Apple Silicon (M1/M2/M3)

## 安装步骤

### 1. 下载 PAGConvertor

访问 PAG 官网的下载页面：
- **官方文档**: https://pag.io/docs/SDK-migration.html
- **下载链接**: 在 "From Lottie To PAG" 页面找到 PAGConvertor 的下载链接

### 2. 解压文件

```bash
# 下载完成后，解压压缩包
unzip PAGConvertor.zip
cd PAGConvertor
```

### 3. 设置可执行权限

```bash
# 在解压后的目录中，赋予所有文件执行权限
chmod +x ./*

# 或者单独设置
chmod +x PAGConvertor
chmod +x convert.sh
```

### 4. 解决 macOS 安全限制

如果系统提示"无法打开 PAGConvertor，因为无法验证开发者"：

1. 打开 **系统设置** -> **隐私与安全性**
2. 在"安全性"部分，找到关于 PAGConvertor 的提示
3. 点击 **"仍要打开"** 或 **"允许"**

或者使用命令行绕过：

```bash
# 移除隔离属性
xattr -d com.apple.quarantine PAGConvertor
```

### 5. 测试安装

```bash
# 测试 PAGConvertor 是否可以运行
./PAGConvertor --version

# 或者
./PAGConvertor -h
```

## 配置到项目

### 方法 1: 复制到项目工具目录（推荐）

```bash
# 在项目根目录执行
cd /Users/admin/Workspace/heartsphere_new/backend

# 确保工具目录存在
mkdir -p tools/bin

# 复制 PAGConvertor 到工具目录
cp /path/to/PAGConvertor/PAGConvertor tools/bin/
chmod +x tools/bin/PAGConvertor

# 验证
./tools/bin/PAGConvertor --version
```

### 方法 2: 添加到系统 PATH

```bash
# 编辑 ~/.zshrc 或 ~/.bash_profile
echo 'export PATH="/path/to/PAGConvertor:$PATH"' >> ~/.zshrc

# 重新加载配置
source ~/.zshrc

# 验证
which PAGConvertor
PAGConvertor --version
```

### 方法 3: 使用环境变量

```bash
# 在启动后端服务前设置环境变量
export PAG_CONVERTOR_PATH=/path/to/PAGConvertor/PAGConvertor

# 或在 application.yml 中配置
# app.video.processing.animation.pag.convertor-path: /path/to/PAGConvertor/PAGConvertor
```

### 方法 4: 通过配置文件指定

在 `backend/src/main/resources/application.yml` 中配置：

```yaml
app:
  video:
    processing:
      animation:
        pag:
          convertor-path: /path/to/PAGConvertor/PAGConvertor
```

## 使用方法

### 命令行使用

```bash
# 转换视频文件
./PAGConvertor video.mp4 25

# 转换 GIF 文件
./PAGConvertor animation.gif

# 转换图片序列（文件夹）
./PAGConvertor frames_folder 30

# 转换 Lottie JSON
./PAGConvertor animation.json
```

### 通过 API 使用

系统启动后，可以通过 API 或管理后台进行转换：

```bash
POST /api/videos/to-animation
{
  "url": "视频URL",
  "format": "pag",
  "fps": 10,
  "width": 640,
  "height": 480,
  "pagCompressionLevel": 6
}
```

## 验证安装

### 检查后端服务日志

启动后端服务后，查看日志中是否有：

```
PAGConvertor 路径: /path/to/PAGConvertor
```

如果没有找到，会显示：

```
未找到 PAGConvertor 工具，PAG 转换功能将不可用
```

### 测试转换功能

1. 通过管理后台上传一个测试视频
2. 选择转换为 PAG 格式
3. 如果转换成功，说明安装配置正确

## 常见问题

### 1. 权限被拒绝 (Permission denied)

```bash
chmod +x PAGConvertor
```

### 2. macOS 安全限制

```bash
# 移除隔离属性
xattr -d com.apple.quarantine PAGConvertor
```

### 3. 找不到 PAGConvertor

检查以下几点：
- 路径是否正确
- 文件是否有执行权限
- 是否在 macOS 系统上（不支持 Windows/Linux）

### 4. 转换失败

- 检查输入文件格式是否支持
- 查看后端日志获取详细错误信息
- 确认 PAGConvertor 版本是否最新

## 支持的输入格式

- **视频**: MP4, MOV, AVI, WebM
- **动画**: GIF, APNG
- **图片序列**: PNG 图片文件夹
- **Lottie**: JSON 文件

## 相关链接

- **PAG 官网**: https://pag.io
- **PAG 文档**: https://pag.io/docs
- **迁移指南**: https://pag.io/docs/SDK-migration.html
- **GitHub**: https://github.com/Tencent/libpag

## 注意事项

1. **平台限制**: PAGConvertor 目前仅支持 macOS，Windows 和 Linux 用户无法使用
2. **文件大小**: 转换大文件可能需要较长时间，建议测试小文件
3. **输出位置**: 转换后的 `.pag` 文件会保存在输入文件的相同目录
4. **版本兼容**: 确保使用最新版本的 PAGConvertor 以获得最佳效果

## 更新日志

- **2026-01-09**: 创建安装指南
