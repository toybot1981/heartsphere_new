# 任务清单

## 阶段 1：核心组件实现

- [x] 创建 `SkillPromptBuilder` 接口和实现类
  - [x] 实现 `buildLevel1Prompt()` 方法
  - [x] 实现 `buildLevel2Prompt()` 方法
  - [x] 实现 `buildLevel3Prompt()` 方法
  - [ ] 编写单元测试

- [x] 创建 `LLMSkillSelector` 接口和实现类
  - [x] 实现 `selectCandidatesLevel1()` 方法
  - [x] 实现 `evaluateCandidatesLevel2()` 方法
  - [x] 实现 `finalizeCandidatesLevel3()` 方法
  - [x] 实现 LLM 响应解析逻辑
  - [ ] 编写单元测试

- [x] 创建 `ProgressiveSkillLoader` 接口和实现类
  - [x] 实现 `loadLevel1()` 方法
  - [x] 实现 `loadLevel2()` 方法
  - [x] 实现 `loadLevel3()` 方法
  - [x] 实现缓存机制（使用 Spring Cache）
  - [ ] 编写单元测试

- [x] 创建 `SkillCandidate` 数据类
  - [x] 定义字段：skill, relevanceScore, reason, level, confidence
  - [x] 实现 Builder 模式

- [x] 创建 `SkillSelectionResponse` 数据类
  - [x] 定义响应结构
  - [x] 实现 JSON 序列化/反序列化

## 阶段 2：引擎重构

- [x] 创建 `LLMSkillApplicationEngine` 类
  - [x] 实现 `evaluateAndApplySkills()` 方法
  - [x] 实现三层渐进式选择流程
  - [x] 实现降级策略
  - [x] 集成现有的 `SkillApplicationEngine` 作为降级方案

- [x] 重构 `SkillApplicationEngine`
  - [x] 保持现有功能作为降级方案（无需修改，直接使用）

- [x] 创建技能选择配置类
  - [x] 定义配置参数（`SkillSelectionConfig`）
  - [x] 支持 YAML 配置（已添加到 `application.yml`）
  - [ ] 实现配置验证

## 阶段 3：缓存和性能优化

- [x] 实现 Level 1 缓存
  - [x] 使用 Spring Cache（ConcurrentMapCacheManager）
  - [x] 设置 TTL（通过配置）
  - [x] 实现缓存失效策略（通过 @Cacheable 注解）

- [x] 实现 Level 2 缓存
  - [x] 缓存技能指令（通过 @Cacheable 注解）
  - [x] 设置合适的 TTL（通过配置）

- [x] 实现 Level 3 缓存
  - [x] 缓存技能资源（通过 @Cacheable 注解）
  - [x] 设置较短的 TTL（通过配置）

- [ ] 实现 LLM 结果缓存
  - [ ] 基于用户消息和技能列表生成缓存键
  - [ ] 缓存 LLM 判断结果
  - [ ] 设置合理的 TTL

- [x] 实现批量处理优化
  - [x] 批量加载技能层级（`loadLevel2Batch`, `loadLevel3Batch`）
  - [ ] 批量调用 LLM（当前为单个调用，可优化）

## 阶段 4：集成和测试

- [ ] 集成到对话系统
  - [ ] 修改 `generateAIResponse.ts` 支持新的技能选择机制
  - [ ] 更新技能服务接口
  - [ ] 保持向后兼容

- [ ] 编写集成测试
  - [ ] 测试完整的三层渐进式流程
  - [ ] 测试降级策略
  - [ ] 测试性能

- [ ] 编写对比测试
  - [ ] LLM 驱动 vs 规则驱动的准确性对比
  - [ ] 性能对比测试
  - [ ] 成本分析

- [ ] 编写端到端测试
  - [ ] 测试真实对话场景
  - [ ] 测试技能激活准确性
  - [ ] 测试用户体验

## 阶段 5：监控和调试

- [ ] 添加详细日志
  - [ ] Level 1 选择日志
  - [ ] Level 2 评估日志
  - [ ] Level 3 决策日志
  - [ ] LLM 调用日志

- [ ] 实现调试接口
  - [ ] 查看技能选择过程
  - [ ] 查看 LLM 提示词和响应
  - [ ] 查看缓存状态

- [ ] 添加性能监控
  - [ ] LLM 调用耗时
  - [ ] 缓存命中率
  - [ ] 技能选择准确率

- [ ] 实现告警机制
  - [ ] LLM 服务异常告警
  - [ ] 性能下降告警
  - [ ] 准确率下降告警

## 阶段 6：文档和部署

- [ ] 更新技术文档
  - [ ] 架构设计文档
  - [ ] API 文档
  - [ ] 配置文档

- [ ] 编写使用指南
  - [ ] 技能选择机制说明
  - [ ] 配置参数说明
  - [ ] 故障排查指南

- [ ] 准备部署方案
  - [ ] 灰度发布计划
  - [ ] 回滚方案
  - [ ] 监控指标

- [ ] 执行灰度发布
  - [ ] 选择测试角色
  - [ ] 监控指标
  - [ ] 收集反馈

- [ ] 全面部署
  - [ ] 逐步扩大范围
  - [ ] 持续监控
  - [ ] 优化调整
