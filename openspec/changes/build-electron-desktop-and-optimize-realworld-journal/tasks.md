## 一、Electron 桌面应用

### 1. 集成 Electron 框架

- [ ] 1.1 安装 Electron 依赖
  - [ ] 安装 `electron` 和 `electron-builder`
  - [ ] 验证安装成功，检查版本兼容性

- [ ] 1.2 创建 Electron 主进程
  - [ ] 创建 `electron/main.js` 主进程入口
  - [ ] 配置窗口创建与管理、应用生命周期
  - [ ] 配置安全策略（contextIsolation、nodeIntegration 等）

- [ ] 1.3 配置 Electron 项目结构
  - [ ] 创建 `electron/`、`electron/icons/`
  - [ ] 验证项目结构

### 2. 创建 Electron 构建脚本

- [ ] 2.1 创建 `scripts/build-electron.sh`
  - [ ] 参考 Android/iOS 构建脚本逻辑
  - [ ] 实现构建 → 配置 Electron → 打包流程

- [ ] 2.2 完善构建脚本
  - [ ] 环境检查（Node、Electron 等）、错误处理与进度提示

- [ ] 2.3 添加 npm 脚本
  - [ ] `electron:dev`、`electron:build`、`electron:pack`
  - [ ] 验证可执行

### 3. 配置 Electron Builder

- [x] 3.1 创建 Electron Builder 配置
  - [x] 在 `package.json` 的 `build` 字段配置应用信息

- [x] 3.2 多平台打包
  - [x] Windows（.exe / .msi）、macOS（.dmg / .pkg）、Linux（.AppImage / .deb / .rpm）配置

- [x] 3.3 应用资源
  - [x] 图标目录已创建（`electron/icons/`），图标文件可选

### 4. 配置主进程功能

- [x] 4.1 窗口管理（大小、标题、图标等）
- [ ] 4.2 菜单栏（可选，暂不实现）
- [ ] 4.3 系统托盘（可选，暂不实现）

### 5. 测试 Electron 构建流程

- [x] 5.1 本地构建与脚本逻辑验证（脚本已创建并通过语法检查）
- [ ] 5.2 开发模式 `electron:dev` 与窗口加载 index.html（需要实际运行测试）
- [ ] 5.3 打包并验证安装包可安装、可运行（需要实际运行测试）

### 6. Electron 文档完善

- [x] 6.1 创建 `docs/ELECTRON_BUILD_GUIDE.md`、`ELECTRON_DESKTOP_BUILD_GUIDE.md`
- [x] 6.2 创建 `ELECTRON_DESKTOP_QUICK_START.md`
- [x] 6.3 多平台打包与代码签名说明（已包含在构建指南中）

### 7. Electron 验证与验收

- [x] 7.1 构建流程与脚本验收（代码层面已完成，待实际运行验证）
- [ ] 7.2 Windows / macOS / Linux 运行验证（需要实际环境测试）
- [ ] 7.3 启动、加载、基础交互与性能检查（需要实际环境测试）

---

## 二、现实世界日志优化

### 8. 日期快捷筛选

- [ ] 8.1 定义 `dateRange` 类型与状态（今日 / 本周 / 本月 / 自定义可选）
- [ ] 8.2 实现 `filterEntriesByDateRange`，与关键词、标签组合
- [ ] 8.3 RealWorldScreen 筛选区增加「今日」「本周」「本月」等 UI
- [ ] 8.4 MobileRealWorldScreen 日期筛选适配（折叠/横滑/弹层等）

### 9. 列表展示与排序

- [x] 9.1 排序选项（按日记日期、按更新时间），默认按日期倒序
- [x] 9.2 `groupEntriesByDate`（按日 / 按周）及展示结构
- [ ] 9.3 大量条目时虚拟列表或分页（按需，当前未实现，待性能测试后决定）
- [x] 9.4 Mobile 排序与分组能力对齐

### 10. 快捷写今日与模板

- [ ] 10.1 「写今日」入口，`entryDate` 当天，标题可预填
- [ ] 10.2 「从模板写今日」，与 `journalTemplates` 集成
- [ ] 10.3 所有新建默认 `entryDate` 为当天（`useJournalHandlers` 或调用方统一）
- [ ] 10.4 模板选择入口与展示优化，PC/Mobile 可用

### 11. 共享逻辑与组件化

- [x] 11.1 日期筛选、排序、分组、默认 `entryDate` 抽成 `utils/journalFilters.ts`，PC/Mobile 复用
- [ ] 11.2 可选抽取 `DateRangeFilter`、`JournalListGrouped` 等至 `components/realworld/`（当前使用内联实现，满足需求）

### 12. 日志文档与验收

- [x] 12.1 更新现实世界/日志使用说明（已在实施总结中记录使用说明）
- [ ] 12.2 在 **桌面、Web、Mobile** 上验收：日期筛选、排序、分组、写今日、模板、默认日期（需要实际测试）
- [ ] 12.3 回归现有日志 CRUD、标签、搜索、镜面洞察无回归（需要实际测试）
