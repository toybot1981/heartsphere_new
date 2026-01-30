# Tasks: 分析 HSMem 记忆类型并优化 ChatWindow 记忆集成

## 1. 记忆类型分析

- [x] 1.1 梳理 hsmem 中的记忆类型（preference, habit, personal_info, text_memory, document, general）
- [x] 1.2 梳理 Backend MemoryType 枚举中的所有类型
- [x] 1.3 建立 hsmem memory_type 与 Backend MemoryType 的映射关系
- [x] 1.4 分析图中提到的 Event, Habit, Asset, Work 类型在系统中的实现情况
- [x] 1.5 编写记忆类型映射文档（已实现 memoryTypeMapper.ts）

## 2. 长短期记忆分析

- [ ] 2.1 分析短期记忆（Short Memory）的实现和存储方式
- [ ] 2.2 分析长期记忆（Long Memory）的实现和存储方式
- [ ] 2.3 明确 hsmem 系统在长短期记忆中的定位
- [ ] 2.4 分析短期记忆如何转换为长期记忆（记忆巩固机制）
- [ ] 2.5 编写长短期记忆架构文档

## 3. ChatWindow 记忆使用优化

- [ ] 3.1 分析当前 ChatWindow 中记忆的使用方式
- [ ] 3.2 设计记忆检索策略（何时检索、检索什么类型、检索数量）
- [ ] 3.3 设计记忆注入方式（如何将记忆融入 AI 提示词）
- [ ] 3.4 优化记忆提取流程（提取时机、类型识别、重要性评分）
- [ ] 3.5 实现记忆类型自动识别（Event, Habit, Asset, Work 等）
- [ ] 3.6 实现记忆检索和注入功能
- [ ] 3.7 优化记忆提取和保存流程

## 4. 测试和验证

- [ ] 4.1 编写单元测试（记忆类型映射、记忆检索、记忆注入）
- [ ] 4.2 编写集成测试（ChatWindow 记忆使用完整流程）
- [ ] 4.3 端到端测试（对话中记忆的提取、检索、使用）
- [ ] 4.4 性能测试（记忆检索响应时间、记忆提取性能）

## 5. 文档更新

- [ ] 5.1 更新记忆系统架构文档
- [ ] 5.2 编写 ChatWindow 记忆使用指南
- [ ] 5.3 更新 API 文档（记忆类型、记忆检索接口）
