# 🚀 Capacitor 终极快速参考

## ⚡ 30秒快速启动

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 22
cd frontend && npm run build && cd .. && npx cap sync android && npx cap open android
```

## 📋 常用命令速查表

| 命令 | 说明 | 使用频率 |
|------|------|---------|
| `nvm use 22` | 切换到 Node 22 | ⭐⭐⭐⭐⭐ |
| `npm run build` | 构建前端 | ⭐⭐⭐⭐⭐ |
| `npx cap sync` | 同步资源 | ⭐⭐⭐⭐⭐ |
| `npx cap open android` | 打开 Android Studio | ⭐⭐⭐⭐ |
| `npx cap run android` | 运行到设备 | ⭐⭐⭐⭐ |
| `npm run dev` | 开发服务器 | ⭐⭐⭐⭐ |

## 🔄 日常开发流程

```
1. 修改代码
2. npm run build
3. npx cap sync android
4. npx cap run android
```

## 🐛 快速修复

| 问题 | 命令 |
|------|------|
| 依赖问题 | `cd frontend && rm -rf node_modules package-lock.json && npm install` |
| Gradle 失败 | `cd android && ./gradlew clean && ./gradlew build` |
| 白屏 | `npm run build && npx cap sync android` |
| 找不到设备 | `adb devices` |

## 📁 关键文件

```
capacitor.config.json       # Capacitor 配置 ⭐
android/                    # Android 项目
frontend/dist/              # 构建输出 ⭐
frontend/mobile.tsx         # Mobile 入口 ⭐
```

## 🎯 环境检查清单

- [ ] Node v22.21.1: `node --version`
- [ ] Capacitor 8.0.0: `npx cap --version`
- [ ] Android Studio: 已安装
- [ ] Android SDK: 已配置
- [ ] 设备/模拟器: 已连接

## 📱 首次运行步骤

1. `npx cap open android`
2. 等待 Gradle 同步
3. 选择设备
4. 点击 Run

## 🔗 有用链接

- [完整文档](CAPACITOR_SETUP_SUMMARY.md)
- [快速指南](CAPACITOR_QUICK_START.md)
- [检查清单](CAPACITOR_CHECKLIST.md)
- [成功报告](CAPACITOR_SUCCESS_REPORT.md)

---

**提示**: 收藏此文件，随时查阅！
