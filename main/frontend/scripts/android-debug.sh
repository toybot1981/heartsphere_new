#!/bin/bash
# Android 调试脚本：查看日志和网络请求

set -e

echo "🔍 Android 调试工具"
echo ""

# 检查 adb 是否可用
if ! command -v adb &> /dev/null; then
    echo "❌ 错误: 未找到 adb 命令"
    echo "请确保 Android SDK Platform-Tools 已安装并添加到 PATH"
    exit 1
fi

# 检查设备连接
echo "📱 检查设备连接..."
DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l | tr -d ' ')

if [ "$DEVICES" -eq 0 ]; then
    echo "⚠️  警告: 未检测到已连接的设备"
    echo "请连接 Android 设备或启动模拟器"
    exit 1
fi

echo "✅ 找到 $DEVICES 个设备"
echo ""

# 显示菜单
echo "请选择操作："
echo "1. 查看所有日志（实时）"
echo "2. 查看错误日志"
echo "3. 查看应用相关日志（heartsphere/capacitor）"
echo "4. 查看网络请求日志"
echo "5. 清除日志并重新开始"
echo "6. 保存日志到文件"
echo "7. 测试网络连接"
echo ""

read -p "请输入选项 (1-7): " choice

case $choice in
    1)
        echo "📋 查看所有日志（按 Ctrl+C 停止）..."
        adb logcat
        ;;
    2)
        echo "❌ 查看错误日志（按 Ctrl+C 停止）..."
        adb logcat *:E
        ;;
    3)
        echo "📱 查看应用相关日志（按 Ctrl+C 停止）..."
        adb logcat | grep -iE "heartsphere|capacitor|chromium|webview"
        ;;
    4)
        echo "🌐 查看网络请求日志（按 Ctrl+C 停止）..."
        adb logcat | grep -iE "network|http|api|chromium"
        ;;
    5)
        echo "🧹 清除日志..."
        adb logcat -c
        echo "✅ 日志已清除"
        echo "开始记录新日志（按 Ctrl+C 停止）..."
        adb logcat
        ;;
    6)
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        FILENAME="android_logs_${TIMESTAMP}.txt"
        echo "💾 保存日志到 $FILENAME（按 Ctrl+C 停止）..."
        adb logcat > "$FILENAME"
        echo "✅ 日志已保存到 $FILENAME"
        ;;
    7)
        echo "🔌 测试网络连接..."
        echo ""
        echo "测试 10.0.2.2:8081 (Android 模拟器访问宿主机)..."
        adb shell "curl -v http://10.0.2.2:8081/api/health 2>&1" || echo "❌ 连接失败"
        echo ""
        echo "提示: 如果使用真实设备，请使用电脑的实际 IP 地址"
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
