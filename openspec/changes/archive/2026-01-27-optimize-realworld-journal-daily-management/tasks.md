## 1. 日期快捷筛选

- [ ] 1.1 定义日期范围类型与状态
  - [ ] 定义 `dateRange` 类型：今日 / 本周 / 本月 / 自定义（可选）
  - [ ] 在 RealWorldScreen 中维护 `dateRange` 及可选 `customStart`、`customEnd`
  - [ ] 与现有 `searchQuery`、`selectedTag` 并存

- [ ] 1.2 实现日期过滤逻辑
  - [ ] 实现 `filterEntriesByDateRange(entries, dateRange, custom?)` 工具函数
  - [ ] 在列表展示前对 `entries` 先做关键词、标签筛选，再做日期范围筛选
  - [ ] 今日 / 本周 / 本月按本地时区计算

- [ ] 1.3 添加日期筛选 UI（PC）
  - [ ] 在 RealWorldScreen 筛选区增加「今日」「本周」「本月」等快捷按钮
  - [ ] 可选：自定义日期范围（日期选择器），若首版不做则留扩展点
  - [ ] 与搜索框、标签筛选区协调布局

- [ ] 1.4 日期筛选 UI 在 Mobile 的适配
  - [ ] 在 MobileRealWorldScreen 增加同等日期快捷筛选
  - [ ] 依移动端空间采用折叠、横滑或弹层等方式，与现有筛选 UI 整合

## 2. 列表展示与排序

- [ ] 2.1 排序选项
  - [ ] 支持「按日记日期倒序」「按更新时间倒序」
  - [ ] 默认按日记日期倒序；在 RealWorldScreen 中增加排序切换（下拉或分段控制）
  - [ ] 确保 `JournalEntry` 映射中 `updatedAt` 可用（若后端有）；若无则暂只支持按日期

- [ ] 2.2 按日期分组展示
  - [ ] 实现 `groupEntriesByDate(entries, groupBy: 'day' | 'week')` 及展示结构
  - [ ] 列表按「按日」或「按周」分组展示，组内按当前排序规则排列
  - [ ] 分组标题格式（如「2025-01-15」「2025-W03」）与现有设计统一

- [ ] 2.3 大量条目时的性能
  - [ ] 评估列表长度阈值（如 > 50 条）；若需则引入虚拟列表或分页
  - [ ] 避免一次性渲染过多 DOM，保持滚动流畅

- [ ] 2.4 Mobile 列表与排序
  - [ ] MobileRealWorldScreen 同步支持相同排序与分组能力
  - [ ] 移动端列表布局与分组样式适配

## 3. 快捷写今日与模板

- [ ] 3.1 「写今日」入口
  - [ ] 在 RealWorldScreen 增加「写今日」按钮/入口
  - [ ] 点击后进入创建态，`entryDate` 固定为当天，标题可预填「今日」或空

- [ ] 3.2 「从模板写今日」
  - [ ] 支持选择模板后，以「今日」为日期、模板 prefilled 标题/内容创建日记
  - [ ] 与现有 `journalTemplates`、`getTemplateById` 集成

- [ ] 3.3 新建默认 `entryDate`
  - [ ] 所有新建日记（包括普通「新建」）默认 `entryDate` 为当天
  - [ ] 在 `useJournalHandlers` 或调用方统一处理，避免多处分散逻辑

- [ ] 3.4 模板入口优化
  - [ ] 优化模板选择入口与展示（如列表、弹层），便于在创建/编辑时快速选用
  - [ ] PC 与 Mobile 均可用到模板快捷能力

## 4. 共享逻辑与组件化

- [ ] 4.1 抽取共享逻辑
  - [ ] 将日期筛选、排序、分组、默认 `entryDate` 等抽成 hook 或 utils，供 PC/Mobile 复用
  - [ ] 保持与现有 `useJournalHandlers`、`journalApi` 的集成方式

- [ ] 4.2 可选组件抽取
  - [ ] 若有助于复用，可抽取 `DateRangeFilter`、`JournalListGrouped` 等组件到 `components/realworld/`
  - [ ] 不强制大重构，以可维护、可测为准

## 5. 文档与验收

- [ ] 5.1 更新使用说明
  - [ ] 若有现实世界/日志的使用文档，补充日期筛选、快捷写今日、排序与分组说明
  - [ ] 标注 PC 与 Mobile 能力一致

- [ ] 5.2 验收与回归
  - [ ] 在 PC 与 Mobile 上验证：日期筛选、排序、分组、「写今日」、模板、新建默认日期
  - [ ] 回归现有日志 CRUD、标签、搜索、镜面洞察等无回归
