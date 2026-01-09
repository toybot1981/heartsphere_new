#!/bin/bash
# Android Studio 自动安装脚本

DMG_FILE="/tmp/android-studio-mac.dmg"
VOLUME_NAME="Android Studio"
APP_NAME="Android Studio.app"
DESTINATION="/Applications/$APP_NAME"

echo "🚀 Android Studio 自动安装脚本"
echo "================================"
echo ""

# 检查 DMG 文件是否存在
if [ ! -f "$DMG_FILE" ]; then
    echo "❌ 错误：找不到 DMG 文件"
    echo "   位置: $DMG_FILE"
    echo ""
    echo "请先运行下载命令："
    echo "  curl -L -o /tmp/android-studio-mac.dmg 'https://redirector.gvt1.com/edgedl/android/studio/install/2024.1.1.12/android-studio-2024.1.1.12-mac_arm.dmg'"
    exit 1
fi

# 检查文件大小
FILE_SIZE=$(du -m "$DMG_FILE" | awk '{print $1}')
echo "✓ 找到 DMG 文件: $FILE_SIZE MB"
echo ""

# 检查是否已安装
if [ -d "$DESTINATION" ]; then
    echo "⚠️  Android Studio 已经安装"
    echo ""
    read -p "是否要重新安装？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "取消安装"
        exit 0
    fi
    echo "删除旧版本..."
    sudo rm -rf "$DESTINATION"
fi

# 1. 挂载 DMG
echo "📂 步骤 1/4: 挂载 DMG 文件..."
hdiutil attach "$DMG_FILE" -readonly -nobrowse -quiet 2>/dev/null

if [ ! -d "/Volumes/$VOLUME_NAME" ]; then
    echo "❌ 错误：无法挂载 DMG 文件"
    exit 1
fi

echo "✓ DMG 文件已挂载"
echo ""

# 2. 复制到 Applications
echo "📦 步骤 2/4: 复制 Android Studio 到 Applications..."
echo "   这可能需要几分钟..."

sudo cp -R "/Volumes/$VOLUME_NAME/$APP_NAME" "$DESTINATION"

if [ ! -d "$DESTINATION" ]; then
    echo "❌ 错误：复制失败"
    hdiutil detach "/Volumes/$VOLUME_NAME" -quiet
    exit 1
fi

echo "✓ Android Studio 已复制到 Applications"
echo ""

# 3. 卸载 DMG
echo "📤 步骤 3/4: 卸载 DMG 文件..."
hdiutil detach "/Volumes/$VOLUME_NAME" -quiet
echo "✓ DMG 文件已卸载"
echo ""

# 4. 完成
echo "✅ 步骤 4/4: 安装完成！"
echo ""
echo "📁 安装位置: $DESTINATION"
echo ""
echo "📝 下一步操作："
echo "   1. 启动 Android Studio:"
echo "      open -a 'Android Studio'"
echo ""
echo "   2. 首次启动会显示欢迎向导"
echo "   3. 选择 'Standard' 安装类型"
echo "   4. 等待下载 Android SDK (10-30分钟)"
echo ""
echo "📚 详细说明请参考: INSTALL_GUIDE.md"
echo ""

# 询问是否立即启动
read -p "是否现在启动 Android Studio？(Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo "启动 Android Studio..."
    open -a "Android Studio"
    echo ""
    echo "✓ Android Studio 已启动"
    echo "💡 如果是首次启动，请按照欢迎向导完成配置"
fi

echo ""
echo "🎉 安装成功！"
