# Change: Electron 桌面应用 + 现实世界日志优化（合并提案）

## Why

1. **Electron 桌面应用**：心域已有完整 PC Web 版本，需要提供桌面客户端，便于用户像原生应用一样安装、使用，并作为日常办公的稳定入口。直接适配、不二次开发，复用 Android/iOS 构建经验。

2. **现实世界日志优化**：心域中的「现实世界」将作为用户本地办公的主要载体（日志、备忘、邮件等）。当前先不实现备忘与邮件，**优先优化日志功能**，便于在日常工作中快速记录、检索与管理日记，提升现实世界作为个人管理中心的可用性。

本变更将上述两部分合并为一条链路：**先提供 Electron 桌面应用**，**再在桌面与 Web/Mobile 上同步优化现实世界日志**，使桌面端成为日常管理的高效载体。

## What Changes

### A. Electron 桌面应用

- **Electron 集成**：安装配置 Electron、主/渲染进程，窗口、菜单、系统托盘等基础能力。
- **构建与打包**：构建脚本、Electron Builder、多平台安装包（Windows、macOS、Linux），应用图标与元数据。
- **文档**：Electron 构建指南、快速开始、多平台打包与代码签名说明。

### B. 现实世界日志优化

- **日期快捷筛选**：「今日」「本周」「本月」及可选自定义范围，与关键词、标签组合使用。
- **列表展示与排序**：按日/周分组，按日记日期或更新时间排序，大量条目时虚拟列表或分页。
- **快捷写今日**：「写今日」入口、从模板写今日，新建默认 `entryDate` 为当天。
- **模板与创建体验**：优化模板入口，PC 与 Mobile 能力对齐。

## Impact

- **影响的代码**：
  - Electron：`main/frontend/electron/`、`scripts/build-electron.sh`、`electron.config.js`、`package.json`。
  - 日志：`RealWorldScreen.tsx`、`MobileRealWorldScreen.tsx`、`useJournalHandlers`、`journalTemplates`，及可能的 `components/realworld/` 子组件。

- **影响的文档**：
  - `docs/ELECTRON_BUILD_GUIDE.md`，`docs/14-部署运维/有价值文档/ELECTRON_DESKTOP_*`。
  - 现实世界/日志使用说明（若有），补充日期筛选、写今日、排序与分组。

- **不改变**：PC React 业务逻辑与 API 语义保持稳定；备忘、邮件管理不在本次范围。

## Notes

- Electron 仅做打包与配置，不改业务代码；日志优化为前端增强，优先前端筛选与排序。
- 两部分可分批实施：先完成 Electron 构建与桌面运行，再落地日志优化；验收时需在桌面、Web、Mobile 上均验证日志能力。
