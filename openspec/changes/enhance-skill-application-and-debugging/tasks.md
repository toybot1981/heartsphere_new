# Implementation Tasks

## 1. 后端基础实现

### 1.1 数据库迁移
- [x] 1.1.1 创建数据库迁移脚本 `V*__create_skill_execution_records.sql`
  - 创建 `skill_execution_records` 表
  - 添加必要的索引
  - 添加外键约束

- [ ] 1.1.2 运行迁移验证表结构正确性

### 1.2 实体类与 DTO

- [x] 1.2.1 创建 `SkillExecutionRecord` 实体类
  - 在 `main/backend/src/main/java/com/heartsphere/ai/skill/entity/`
  - 包含所有字段定义和 JPA 注解

- [x] 1.2.2 创建 `SkillExecutionRecordDTO` 
  - 用于 API 响应

- [x] 1.2.3 创建 `SkillEvaluationResult` 模型
  - 用于封装技能评估结果（得分、原因等）

### 1.3 Repository 和 Service

- [x] 1.3.1 创建 `SkillExecutionRecordRepository`
  - 查询方法：按 conversation_id、skill_id、user_id 查询
  - 分页查询
  - 时间范围过滤

- [x] 1.3.2 创建 `SkillApplicationEngine` 类
  - 核心评分逻辑：`evaluateSkillApplicability()`
  - 技能排序和选择：`selectSkillToApply()`
  - 权限和条件检查：`checkExecutionConditions()`
  - 完整的错误处理和日志

- [x] 1.3.3 创建 `SkillExecutionRecordService`
  - 创建执行记录
  - 更新执行记录
  - 查询和过滤

### 1.4 单元测试

- [x] 1.4.1 为 `SkillApplicationEngine` 编写测试
  - 测试评分计算正确性
  - 测试权重应用
  - 测试优先级排序
  - 测试条件检查

- [x] 1.4.2 为 `SkillExecutionRecordService` 编写测试
  - 测试记录创建和查询
  - 测试时间范围过滤
  - 测试关联数据序列化

**验收标准**：
- 所有单元测试通过，代码覆盖率 > 80%
- 能成功创建和查询执行记录
- 技能评分和排序逻辑验证正确

---

## 2. 后端 API 和集成

### 2.1 REST API

- [x] 2.1.1 创建 `SkillDebugController`
  - 在 `main/backend/src/main/java/com/heartsphere/ai/skill/controller/`
  - GET `/api/v1/skill/debug/conversation/{id}/history` - 查询技能执行历史
  - GET `/api/v1/skill/debug/record/{id}` - 获取单个执行记录详情
  - GET `/api/v1/skill/debug/statistics` - 获取技能使用统计

- [x] 2.1.2 实现过滤和分页参数
  - conversation_id、skill_id、status、date range 等
  - 返回格式与项目规范一致

### 2.2 AI 响应处理流程集成

- [x] 2.2.1 定位 AI 响应处理的关键位置
  - 在 `main/backend/src/main/java/com/heartsphere/aiagent/controller/AIServiceController.java` 中找到 `chatCompletions` 方法（第 674 行）

- [x] 2.2.2 集成 `SkillApplicationEngine`
  - 在生成响应前调用引擎评估技能
  - 捕获技能执行结果
  - 将技能元数据添加到响应中
  - **注意**: 这是 BREAKING CHANGE，已使用特性开关确保向后兼容
  - 已创建 SkillApplicationConfig 配置类支持特性开关
  - 已集成到 AIServiceController.chatCompletions 方法

- [x] 2.2.3 修改聊天记录数据结构
  - 使用现有的 `metadata` 字段（JSON格式）存储技能应用信息
  - 已创建 SkillMetadataUtil 工具类处理 metadata 更新
  - 确保向后兼容（metadata 字段已存在，不会破坏现有数据）

### 2.3 异步处理

- [x] 2.3.1 创建异步记录写入机制
  - 已创建 AsyncSkillRecordService 异步服务
  - 已创建 SkillAsyncConfig 线程池配置
  - 已更新 SkillApplicationEngine 支持异步写入
  - 实现重试机制（通过 CompletableFuture 异常处理）

- [x] 2.3.2 添加监控和错误处理
  - 已创建 SkillRecordMonitor 监控服务
  - 已添加定期检查任务队列状态（每5分钟）
  - 已添加监控统计 API 端点
  - 异步任务失败告警（通过日志，可扩展为通知）

### 2.4 技能-记忆关联

- [x] 2.4.1 在技能评估时追踪内存查询
  - SkillEvaluationContext 已包含 relatedMemoryIds 字段
  - 在 createExecutionRecord 中已记录相关内存ID
  - 执行记录已包含 relatedMemoryIds 字段

- [x] 2.4.2 创建关联追踪 Service
  - 已创建 SkillMemoryCorrelationService
  - 已实现技能-记忆双向查询
  - 已实现关联统计功能
  - 已添加 3 个新的 API 端点

### 2.5 集成测试

- [x] 2.5.1 编写集成测试
  - 已创建 SkillApplicationIntegrationTest（7 个测试用例）
  - 测试完整的对话 → 技能评估 → 技能应用 → 记录流程
  - 测试技能执行记录的完整生命周期
  - 测试技能-记忆关联
  - 测试 API 端点（历史查询、统计、分页）

- [ ] 2.5.2 端到端测试
  - 测试 API 返回正确的执行历史（已在集成测试中覆盖）
  - 测试与记忆系统的协同（待完善）

**验收标准**：
- API 能正确返回技能执行记录
- 实际对话流程中能记录所有技能应用
- 性能影响 < 10%（响应延迟增加不超过 100ms）

---

## 3. 前端调试面板

### 3.1 UI 组件创建

- [x] 3.1.1 创建 `SkillDebugPanel` 主组件
  - 已创建在 `main/frontend/components/chat/debug/`
  - 支持展开/折叠
  - 响应式设计

- [x] 3.1.2 创建 `SkillActivationList` 组件
  - 已创建，显示技能激活列表
  - 支持排序和过滤

- [x] 3.1.3 创建 `SkillActivationItem` 组件
  - 已创建，显示单个技能的基本信息
  - 展开详情视图

- [x] 3.1.4 创建 `SkillDetailModal` 或展开面板
  - 已集成到 SkillActivationItem 中
  - 显示完整的执行参数和结果
  - 显示内存关联（通过 relatedMemoryIds）

### 3.2 数据获取与实时更新

- [x] 3.2.1 创建 `useSkillDebug` Hook
  - 已创建，获取技能执行历史
  - 实现实时更新（轮询方式，每5秒）
  - 处理加载和错误状态

- [ ] 3.2.2 实现实时事件监听
  - 通过 WebSocket 接收技能应用事件（可选增强功能）
  - 当前使用轮询方式实现实时更新

- [x] 3.2.3 创建技能数据缓存
  - 已在 useSkillDebug Hook 中实现状态管理
  - 避免重复查询相同数据

### 3.3 样式和交互

- [x] 3.3.1 按照 UX 设计规范实现样式
  - 已使用 CSS 变量支持主题切换
  - 已实现响应式设计
  - 已实现平滑动画效果
  - 样式与项目整体风格一致

- [x] 3.3.2 实现过滤和搜索功能
  - 已实现按状态过滤
  - 已实现按技能名称、关键词、错误信息搜索
  - 支持实时搜索

- [x] 3.3.3 实现展开/折叠动画
  - 已添加平滑的过渡效果
  - 支持展开/折叠交互

### 3.4 与记忆调试框集成

- [x] 3.4.1 修改 `DebugPanelLayout` 组件
  - 已将技能调试面板集成到 ChatWindow
  - 与记忆调试面板并列显示（通过独立状态管理）

- [x] 3.4.2 实现面板间的交互
  - 已实现从技能面板链接到相关内存（通过全局回调）
  - 已添加记忆导航的基础框架
  - 已扩展 MemoryDebugPanel 支持高亮显示（部分完成）

### 3.5 前端单元测试

- [x] 3.5.1 为 `SkillDebugPanel` 编写测试
  - 已创建 SkillDebugPanel.test.tsx（13 个测试用例）
  - 已创建 SkillUsageBadge.test.tsx（7 个测试用例）
  - 测试数据渲染正确性
  - 测试交互功能（关闭、刷新、过滤、搜索）
  - 测试错误处理和边界情况

**验收标准**：
- 调试面板能正确显示技能激活列表
- 可展开查看详细信息
- 实时更新工作正常（新技能应用时自动显示）
- 与记忆调试框配合显示无问题

---

## 4. 用户界面集成

### 4.1 响应中的技能标记

- [x] 4.1.1 创建 `SkillUsageBadge` 组件
  - 已创建 SkillUsageBadge 和 SkillUsageBadges 组件
  - 显示 AI 响应中使用的技能
  - 支持工具提示和点击查看详情（待实现链接）

- [x] 4.1.2 修改 `ChatMessage` 组件
  - 已在 MessageBubble 中添加技能使用标记
  - 从消息 metadata 提取技能信息
  - 在 AI 响应中显示使用的技能
  - 实现悬停提示

### 4.2 技能说明和反馈

- [ ] 4.2.1 创建 `SkillExplanationTooltip` 组件
  - 显示为什么选择该技能
  - 显示执行结果

- [ ] 4.2.2 实现用户反馈机制（可选）
  - 用户可标记技能选择是否恰当
  - 反馈数据保存用于改进

### 4.3 用户设置

- [ ] 4.3.1 在 `UserPreferences` 中添加调试选项
  - 启用/禁用技能调试显示
  - 调整显示详细程度

- [ ] 4.3.2 实现每个对话的覆盖设置
  - 快速启用/禁用调试

### 4.4 内存-技能关联显示

- [x] 4.4.1 创建 `SkillMemoryCorrelationView` 组件
  - 已创建 SkillMemoryCorrelationView 组件
  - 已显示影响技能决策的内存
  - 已集成到 SkillActivationItem
  - 可视化依赖链（可选功能，待实现）

- [x] 4.4.2 实现双向导航
  - 已实现从技能查看相关内存（可点击记忆链接）
  - 已实现记忆导航的基础框架
  - 已扩展 MemoryDebugPanel 支持高亮显示（部分完成）

**验收标准**：
- 用户能看到 AI 使用了哪些技能
- 用户能理解技能使用原因（通过提示）
- 调试显示可根据用户设置启用/禁用

---

## 5. 配置和优化

### 5.1 配置项定义

- [x] 5.1.1 在 `application.yml` 中添加技能应用配置
  - 已创建 `application-skill.yml.example` 配置文件示例
  - 配置项包括：enabled, scoring, execution
  - 默认 enabled = false 确保向后兼容

- [x] 5.1.2 创建配置类 `SkillApplicationConfig`
  - 已创建配置类，支持 @ConfigurationProperties
  - 支持从 application.yml 读取配置

### 5.2 监控和告警

- [x] 5.2.1 添加性能监控
  - 已添加评估延迟监控
  - 已添加执行记录写入时间监控
  - 已添加数据库查询性能监控
  - 已添加 API 响应时间统计

- [x] 5.2.2 添加告警
  - 已添加失败率告警（>10%）
  - 已添加成功率告警（<95%）
  - 已添加性能告警（评估>1s, 写入>500ms, 查询>1s）
  - 已实现定期检查（每5分钟）

### 5.3 性能优化

- [x] 5.3.1 优化评分计算
  - 已实现相似度结果缓存（最多1000条）
  - 已实现用户偏好数据缓存框架
  - 已优化评分计算性能

- [x] 5.3.2 优化数据库查询
  - 已添加 @Cacheable 注解到查询方法
  - 已实现查询结果缓存

- [x] 5.3.3 实现记录归档
  - 已创建 SkillRecordArchiveService
  - 已实现定期归档（90天，每天凌晨2点）
  - 已实现定期清理（180天，每周日凌晨3点）
  - 已实现定时任务调度

### 5.4 灰度部署

- [x] 5.4.1 实现特性开关
  - 已通过 SkillApplicationConfig.enabled 控制技能应用引擎启用/禁用
  - 默认关闭，确保向后兼容
  - 支持通过配置文件动态控制

- [x] 5.4.2 创建灰度部署计划
  - 已创建 GRAY_DEPLOYMENT_PLAN.md
  - 已定义三阶段部署计划（5% → 25% → 100%）
  - 已定义监控指标和回滚计划
  - 已定义部署检查清单

**验收标准**：
- 可通过配置管理所有主要参数
- 性能满足要求（延迟增加 < 100ms）
- 可灰度部署和快速回滚

---

## 6. 测试和验证

### 6.1 功能测试

- [ ] 6.1.1 测试技能评估和选择逻辑
- [ ] 6.1.2 测试执行记录创建和查询
- [ ] 6.1.3 测试调试 API 和前端面板
- [ ] 6.1.4 测试内存-技能关联

### 6.2 性能测试

- [ ] 6.2.1 基准性能测试
  - 1000 次对话中的技能评估性能
  - 大批量查询执行记录的性能

- [ ] 6.2.2 压力测试
  - 并发对话 + 实时技能评估
  - 并发查询执行历史

### 6.3 集成测试

- [ ] 6.3.1 完整流程测试
  - 对话创建 → 技能评估 → 应用 → 记录 → 查询 → 显示

- [ ] 6.3.2 边界情况测试
  - 无可用技能的情况
  - 所有技能都被拒绝的情况
  - 技能执行失败的情况

### 6.4 用户体验测试

- [ ] 6.4.1 调试面板可用性测试
  - 验证信息显示清晰
  - 验证交互直观

- [ ] 6.4.2 用户反馈收集
  - 收集测试用户的反馈
  - 根据反馈优化界面

**验收标准**：
- 所有功能测试通过
- 性能指标达标
- 无明显的 UX 问题

---

## 7. 文档和知识转移

### 7.1 开发文档

- [ ] 7.1.1 编写技能应用引擎文档
  - 架构设计
  - 评分算法
  - 扩展指南

- [ ] 7.1.2 编写 API 文档
  - 技能调试 API 规范
  - 请求/响应示例

- [ ] 7.1.3 编写配置指南
  - 如何调整权重
  - 如何启用/禁用功能

### 7.2 用户文档

- [ ] 7.2.1 编写用户指南
  - 如何启用技能调试
  - 如何理解技能选择

- [ ] 7.2.2 创建视频教程（可选）
  - 演示技能应用和调试

### 7.3 内部培训

- [ ] 7.3.1 组织技术分享会
  - 讲解设计决策
  - 演示新功能

**验收标准**：
- 文档完整清晰
- 开发者能独立维护系统
- 用户能有效使用调试功能

---

## 实现顺序和依赖

**关键依赖链**：
1. 数据库迁移 (1.1) → 实体和 Service (1.2-1.3) → 单元测试 (1.4) ✓
2. 后端 API (2.1-2.2) 需要依赖 ✓
3. 前端 Hook (3.2) 需要依赖后端 API ✓
4. 前端 UI 组件 (3.1) 可与 Hook 并行 
5. 用户界面集成 (4.1-4.4) 需要依赖前端组件 ✓
6. 配置和优化 (5) 可在前期插入
7. 测试和文档 (6-7) 最后进行

**建议平行工作**：
- 后端团队：1.1 → 1.2-1.3 → 2.1-2.2
- 前端团队：3.1 并行进行，3.2 在后端 API ready 后开始
- 测试团队：从 1.4 开始覆盖新模块

**预估工期**：5-6 周（2-3 人并行）

---

## 完成标志

本项目完成的标志：
- ✅ 所有任务标记为已完成 [x]
- ✅ 代码通过 Lint 检查和 PR 审查
- ✅ 单元测试覆盖率 > 80%
- ✅ 集成测试全部通过
- ✅ 性能基准测试达标
- ✅ 文档完整
- ✅ 灰度部署成功，无主要 Issue
- ✅ 收到用户正反馈

