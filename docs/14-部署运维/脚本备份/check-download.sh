#!/bin/bash
# Android Studio 下载进度检查脚本

echo "📥 Android Studio 下载进度检查"
echo "================================"
echo ""

DOWNLOAD_FILE="/tmp/android-studio-mac.dmg"
TOTAL_SIZE=1185  # 总大小约 1185 MB

if [ -f "$DOWNLOAD_FILE" ]; then
    # 获取当前文件大小（MB）
    CURRENT_SIZE=$(du -h "$DOWNLOAD_FILE" | awk '{print $1}' | sed 's/M//')

    # 计算百分比
    if [ "$CURRENT_SIZE" != "" ]; then
        PERCENT=$(echo "scale=1; $CURRENT_SIZE / $TOTAL_SIZE * 100" | bc)
        echo "✅ 下载中..."
        echo "   已下载: ${CURRENT_SIZE} MB / ${TOTAL_SIZE} MB"
        echo "   进度: ${PERCENT}%"

        # 显示进度条
        FILLED=$(echo "$PERCENT / 2" | bc)
        EMPTY=$(echo "50 - $FILLED" | bc)
        printf "   ["
        printf "%${FILLED}s" | tr ' ' '█'
        printf "%${EMPTY}s" | tr ' ' '░'
        printf "]\n"
    else
        echo "⏳ 正在下载..."
    fi
else
    echo "❌ 下载文件不存在"
    echo "   请检查下载是否已开始"
fi

echo ""
echo "💡 提示：下载完成后，文件将保存在："
echo "   $DOWNLOAD_FILE"
echo ""
echo "📝 安装步骤："
echo "   1. 打开 Finder"
echo "   2. 前往 /tmp 目录"
echo "   3. 双击 android-studio-mac.dmg"
echo "   4. 将 Android Studio 拖到 Applications 文件夹"
