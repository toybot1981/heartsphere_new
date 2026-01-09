# 数字人 Skill 系统开发执行清单

## 快速开始

**技术选型**：Function Calling（暂不使用 MCP）  
**开发周期**：12 周（3 个月）  
**核心目标**：让角色可以装备和使用技能

---

## 阶段一：基础框架（2-3周）

### ✅ 数据库设计

- [ ] 创建数据库迁移脚本 `V20250104__create_skill_system.sql`
- [ ] 扩展 `skill_definitions` 表（添加 function_schema 等字段）
- [ ] 创建 `skill_executions` 表
- [ ] 创建 `character_skill_bindings` 表（如果不存在）
- [ ] 编写数据库初始化脚本
- [ ] 测试数据库迁移

### ✅ 后端核心服务

- [ ] 创建 `SkillDefinition` 实体类
- [ ] 创建 `SkillDefinitionRepository`
- [ ] 创建 `CharacterSkillBinding` 实体类
- [ ] 创建 `CharacterSkillBindingRepository`
- [ ] 创建 `SkillExecution` 实体类
- [ ] 创建 `SkillExecutionRepository`
- [ ] 实现 `SkillRegistry` 服务
  - [ ] 技能缓存机制
  - [ ] 角色技能查询
  - [ ] Function Definition 转换
- [ ] 实现 `SkillExecutor` 服务
  - [ ] 技能执行主逻辑
  - [ ] 参数验证
  - [ ] 权限检查
  - [ ] 执行记录
- [ ] 实现 `ScriptSkillExecutor`
- [ ] 实现 `ApiSkillExecutor`
- [ ] 实现 `GraphSkillExecutor`
- [ ] 实现 `DatabaseSkillExecutor`

### ✅ 技能转换服务

- [ ] 创建 `SkillConverter` 服务
- [ ] 实现技能定义转 Function Definition
- [ ] 实现 Function Call 转技能参数
- [ ] 实现技能结果格式化

---

## 阶段二：AI 集成（2-3周）

### ✅ Function Calling 支持

- [ ] 扩展 `AIService` 接口
  - [ ] 添加 `generateTextStreamWithFunctions` 方法
- [ ] 扩展 `AIServiceImpl`
  - [ ] 实现 `generateTextStreamWithFunctions`
- [ ] 扩展 `OpenAIAdapter`
  - [ ] 支持 function calling
  - [ ] 处理 function call 响应
- [ ] 扩展 `ClaudeAdapter`（如果使用）
- [ ] 扩展 `GeminiAdapter`（如果使用）
- [ ] 实现 Function Definition 格式转换

### ✅ 对话系统集成

- [ ] 修改 `generateAIResponse.ts`
  - [ ] 获取角色技能列表
  - [ ] 转换为 Function Definitions
  - [ ] 调用 AI（支持 function calling）
  - [ ] 处理 function call
  - [ ] 执行技能
  - [ ] 注入结果到 AI 上下文
- [ ] 创建 `SkillFunctionCallHandler.ts`
- [ ] 实现错误处理和重试
- [ ] 实现技能执行超时处理

### ✅ 前端技能服务

- [ ] 创建 `SkillService.ts`
  - [ ] `getCharacterSkills(characterId)`
  - [ ] `toFunctionDefinitions(skills)`
  - [ ] `executeSkill(skillId, parameters, characterId)`
  - [ ] `findAutoTriggerSkills(characterId, userInput)`
- [ ] 创建 `skillApi.ts`
  - [ ] GET `/api/skills/character/{characterId}`
  - [ ] POST `/api/skills/{skillId}/execute`
  - [ ] POST `/api/skills/auto-trigger`
- [ ] 实现技能缓存机制

---

## 阶段三：角色技能装备（1-2周）

### ✅ 后端 API

- [ ] 创建 `CharacterSkillController`
  - [ ] GET `/api/characters/{characterId}/skills` - 获取已装备技能
  - [ ] POST `/api/characters/{characterId}/skills/{skillId}/equip` - 装备技能
  - [ ] DELETE `/api/characters/{characterId}/skills/{skillId}/unequip` - 卸载技能
  - [ ] GET `/api/characters/{characterId}/skills/available` - 获取可用技能
- [ ] 创建 `CharacterSkillService`
  - [ ] 装备技能逻辑
  - [ ] 卸载技能逻辑
  - [ ] 前置条件检查
  - [ ] 冲突检查
  - [ ] 优先级管理
- [ ] 实现技能推荐服务
  - [ ] 基于角色类型推荐
  - [ ] 基于场景推荐
  - [ ] 兼容性检查

### ✅ 前端界面

- [ ] 创建 `CharacterSkillManagement.tsx`
  - [ ] 显示已装备技能列表
  - [ ] 显示可用技能列表
  - [ ] 装备/卸载操作
- [ ] 创建 `SkillEquipDialog.tsx`
  - [ ] 技能详情展示
  - [ ] 装备确认
  - [ ] 参数配置（如果需要）
- [ ] 创建 `SkillList.tsx` 组件
  - [ ] 技能卡片展示
  - [ ] 技能搜索和筛选
- [ ] 集成到角色管理页面

---

## 阶段四：技能库建设（持续）

### ✅ 迁移现有技能

- [ ] 迁移 `crisis-intervention`
  - [ ] 创建技能定义
  - [ ] 配置 function_schema
  - [ ] 配置 execution_config
  - [ ] 测试功能
- [ ] 迁移 `patient-record`
- [ ] 迁移 `assessment-scale`
- [ ] 迁移 `emotion-analysis`
- [ ] 迁移 `treatment-plan`
- [ ] 迁移 `session-record`
- [ ] 编写技能使用文档

### ✅ 创建新技能

- [ ] 学习类技能
  - [ ] `study-plan-creator` - 学习计划生成
  - [ ] `knowledge-quiz` - 知识问答
  - [ ] `progress-tracker` - 进度跟踪
- [ ] 创作类技能
  - [ ] `story-generator` - 故事生成
  - [ ] `poem-creator` - 诗歌创作
- [ ] 生活类技能
  - [ ] `weather-query` - 天气查询
  - [ ] `schedule-manager` - 日程管理

---

## 阶段五：Graph 流程集成（1-2周）

### ✅ SkillNode 实现

- [ ] 创建 `SkillNode.java`
  - [ ] 节点执行逻辑
  - [ ] 技能调用
  - [ ] 结果处理
- [ ] 集成到 Graph 流程编辑器
  - [ ] 添加 SkillNode 类型
  - [ ] 配置界面
- [ ] 实现错误处理

### ✅ 技能触发机制

- [ ] 实现自动触发服务
- [ ] 实现条件触发服务
- [ ] 增强 SkillCheckNode

---

## 阶段六：管理和监控（1周）

### ✅ 管理界面

- [ ] 创建 `AdminSkillManagement.tsx`
  - [ ] 技能列表
  - [ ] 技能创建/编辑
  - [ ] 技能删除
- [ ] 创建 `SkillEditor.tsx`
  - [ ] 技能定义表单
  - [ ] Function Schema 编辑器
  - [ ] Execution Config 编辑器
- [ ] 创建 `SkillTestDialog.tsx`
  - [ ] 技能测试功能
  - [ ] 参数输入
  - [ ] 结果展示

### ✅ 监控和日志

- [ ] 实现技能执行日志记录
- [ ] 实现技能使用统计
- [ ] 实现性能监控
- [ ] 创建统计报表界面

---

## 测试清单

### 单元测试

- [ ] SkillRegistry 测试
- [ ] SkillExecutor 测试
- [ ] SkillConverter 测试
- [ ] ScriptSkillExecutor 测试
- [ ] ApiSkillExecutor 测试

### 集成测试

- [ ] Function Calling 集成测试
- [ ] 技能执行流程测试
- [ ] 角色技能装备测试
- [ ] 技能自动触发测试

### 端到端测试

- [ ] 完整对话流程测试
- [ ] 多技能组合测试
- [ ] 技能错误处理测试

---

## 文档清单

- [ ] 数据库设计文档
- [ ] API 接口文档
- [ ] 技能开发指南
- [ ] 技能使用文档
- [ ] 部署文档

---

## 里程碑检查点

### 里程碑 1：基础框架（3周后）

检查项：
- [ ] 数据库表创建完成
- [ ] 核心服务实现完成
- [ ] 单元测试通过率 > 80%

### 里程碑 2：AI 集成（6周后）

检查项：
- [ ] Function Calling 支持完成
- [ ] 对话系统集成完成
- [ ] 至少 1 个技能可以正常调用

### 里程碑 3：角色装备（8周后）

检查项：
- [ ] 角色技能装备功能完成
- [ ] 技能管理界面完成
- [ ] 用户可以成功装备技能

### 里程碑 4：技能库（12周后）

检查项：
- [ ] 至少 10 个技能可用
- [ ] 技能文档完成
- [ ] 系统稳定运行

---

## 快速参考

### 关键文件路径

**后端**：
- `backend/src/main/java/com/heartsphere/aiagent/skill/SkillRegistry.java`
- `backend/src/main/java/com/heartsphere/aiagent/skill/SkillExecutor.java`
- `backend/src/main/java/com/heartsphere/aiagent/controller/SkillController.java`

**前端**：
- `frontend/services/skill/SkillService.ts`
- `frontend/components/chat/utils/generateAIResponse.ts`
- `frontend/components/character/CharacterSkillManagement.tsx`

**数据库**：
- `backend/src/main/resources/db/migration/V20250104__create_skill_system.sql`

### 关键 API

- `GET /api/skills/character/{characterId}` - 获取角色技能
- `POST /api/skills/{skillId}/execute` - 执行技能
- `POST /api/characters/{characterId}/skills/{skillId}/equip` - 装备技能
- `DELETE /api/characters/{characterId}/skills/{skillId}/unequip` - 卸载技能

---

**最后更新**：2025-01-03
