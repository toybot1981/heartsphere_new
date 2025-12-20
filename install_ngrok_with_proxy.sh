#!/bin/bash

# 使用代理安装 ngrok 的脚本
# 代理地址：127.0.0.1:7897

echo "=========================================="
echo "使用代理安装 ngrok..."
echo "代理地址: 127.0.0.1:7897"
echo "=========================================="

# 设置代理环境变量
export HTTP_PROXY=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897
export http_proxy=http://127.0.0.1:7897
export https_proxy=http://127.0.0.1:7897
export ALL_PROXY=http://127.0.0.1:7897
export all_proxy=http://127.0.0.1:7897

# 检查是否已安装
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok 已安装"
    ngrok version
    exit 0
fi

# 使用 Homebrew 安装
if command -v brew &> /dev/null; then
    echo "正在使用 Homebrew 安装 ngrok（通过代理）..."
    brew install ngrok
    
    if [ $? -eq 0 ]; then
        echo "✅ ngrok 安装成功"
        ngrok version
        exit 0
    else
        echo "❌ Homebrew 安装失败"
        exit 1
    fi
else
    echo "❌ 未找到 Homebrew，请先安装 Homebrew"
    exit 1
fi


