# Design: Electron 桌面应用 + 现实世界日志优化

## Context

- **Electron**：将现有 PC Web（index.html）打包为桌面应用，支持 Windows、macOS、Linux。
- **现实世界日志**：RealWorldScreen / MobileRealWorldScreen 的日记功能，作为本地办公载体率先优化，聚焦日常管理（日期筛选、分组、排序、写今日、模板等）。

两部分彼此独立：Electron 提供运行环境，日志优化提升现实世界在 Web、Mobile、**以及桌面端**的体验。

## Goals / Non-Goals

### Goals
- 提供 Electron 桌面应用及标准化构建、打包、文档。
- 现实世界日志支持日期快捷筛选、分组、排序、写今日、模板优化，PC 与 Mobile 能力一致。
- 桌面端可正常使用现实世界及优化后的日志功能。

### Non-Goals
- 不实现备忘、邮件管理；不做 Electron 插件开发；不做日志后端破坏性变更。

## Decisions

### A. Electron

- **框架**：Electron + Electron Builder，复用 Android/iOS 构建脚本风格（`build-electron.sh`、npm 脚本）。
- **主进程**：最小化，负责窗口、生命周期、安全策略（contextIsolation、nodeIntegration 关闭等）。
- **打包**：多平台安装包；代码签名可选，文档说明即可。

### B. 现实世界日志

- **日期筛选**：以前端为主，对 `entries` 按 `entryDate`/`timestamp` 过滤；与搜索、标签组合。
- **分组与排序**：按日/周分组，支持按日记日期、更新时间排序；默认按日期倒序。
- **写今日与模板**：一键写今日、从模板写今日；新建默认 `entryDate` 为当天；逻辑可抽成 hook/utils，PC/Mobile 共用。

### C. 实施顺序

- 先完成 **Electron 集成、构建、打包与文档**，保证桌面应用可运行。
- 再完成 **日志优化**（日期筛选、分组、排序、写今日、模板、默认日期），并在桌面、Web、Mobile 上验收。

## Risks / Trade-offs

- Electron 体积较大；日志大量条目时前端筛选与列表性能需关注（虚拟列表/分页）。均采用既有设计中的缓解措施。

## Migration Plan

1. **Phase 1**：Electron 集成 → 构建脚本 → Builder 配置 → 打包与文档 → 桌面运行验证。
2. **Phase 2**：日志日期筛选 → 分组与排序 → 写今日与模板 → 共享逻辑与 Mobile 适配 → 文档与验收。
3. 在桌面、Web、Mobile 上做一次完整回归，确保日志优化三者一致。

## References

- Electron / Electron Builder 官方文档；Android、iOS 适配参考（`adapt-mobile-to-android`、`adapt-mobile-to-ios`）。
- 原提案：`build-electron-desktop-app`、`optimize-realworld-journal-daily-management`（合并后可选归档）。
