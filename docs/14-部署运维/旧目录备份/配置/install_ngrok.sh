#!/bin/bash

# ngrok 安装脚本
# 适用于 macOS (ARM64)

echo "=========================================="
echo "正在安装 ngrok..."
echo "=========================================="

# 检查系统架构
ARCH=$(uname -m)
echo "检测到系统架构: $ARCH"

# 检查是否已安装
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok 已安装"
    ngrok version
    exit 0
fi

# 方法1: 使用 Homebrew 安装（推荐）
if command -v brew &> /dev/null; then
    echo "使用 Homebrew 安装 ngrok..."
    # 检查是否设置了代理
    if [ -n "$HTTP_PROXY" ] || [ -n "$http_proxy" ]; then
        echo "检测到代理设置，使用代理安装..."
    fi
    brew install ngrok
    if [ $? -eq 0 ]; then
        echo "✅ ngrok 安装成功"
        ngrok version
        exit 0
    else
        echo "⚠️  Homebrew 安装失败，尝试其他方法..."
    fi
fi

# 方法2: 直接下载二进制文件
echo "正在下载 ngrok 二进制文件..."

# 根据架构选择下载链接
if [ "$ARCH" = "arm64" ]; then
    DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip"
    BINARY_NAME="ngrok-arm64"
elif [ "$ARCH" = "x86_64" ]; then
    DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip"
    BINARY_NAME="ngrok-amd64"
else
    echo "❌ 不支持的架构: $ARCH"
    exit 1
fi

# 下载并解压
cd /tmp
curl -L -o ngrok.zip "$DOWNLOAD_URL"

if [ $? -ne 0 ]; then
    echo "❌ 下载失败，请检查网络连接"
    echo ""
    echo "手动安装方法："
    echo "1. 访问 https://ngrok.com/download"
    echo "2. 下载对应版本的 ngrok"
    echo "3. 解压后将 ngrok 移动到 /usr/local/bin/"
    exit 1
fi

unzip -o ngrok.zip
chmod +x ngrok

# 移动到系统路径
sudo mv ngrok /usr/local/bin/ngrok

if [ $? -eq 0 ]; then
    echo "✅ ngrok 安装成功"
    ngrok version
else
    echo "⚠️  需要管理员权限，请手动执行："
    echo "sudo mv /tmp/ngrok /usr/local/bin/ngrok"
    echo "sudo chmod +x /usr/local/bin/ngrok"
fi

# 清理
rm -f ngrok.zip

echo ""
echo "=========================================="
echo "安装完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 注册 ngrok 账号（免费）：https://dashboard.ngrok.com/signup"
echo "2. 获取 authtoken：https://dashboard.ngrok.com/get-started/your-authtoken"
echo "3. 运行认证命令：ngrok config add-authtoken YOUR_TOKEN"
echo "4. 运行启动脚本：./start_ngrok.sh"
