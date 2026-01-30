# Change: 增强角色长期学习系统 - 使数字生命越来越聪明

## Why

当前记忆系统只支持**个体学习**（单个角色与单个用户的交互），缺乏**集体成长**的能力。数字生命需要能够：

1. **从多个用户的交互中学习**：一个角色在与不同用户的对话中积累知识和经验
2. **跨对话的知识沉淀**：将频繁出现的知识、技能、经验模式保存为角色的永久资产
3. **持续进化**：如同实习生成长为资深员工，角色应该通过交互变得更聪明、更有洞察力

这要求对记忆系统进行结构化升级，区分**用户专属记忆**（个体信息）和**角色通用资产**（集体经验）。

## What Changes

### 1. 记忆分层架构升级
- **第1层（短期）**：会话上下文（当前对话的临时信息）- **保持不变**
- **第2层（个体长期）**：用户专属记忆（当前角色与用户的私有信息）- **已有**
- **第3层（角色资产）** 🆕：角色通用资产（跨用户、跨对话的知识积累）
  - 领域知识（某个主题的专业见解）
  - 交互技巧（与不同用户类型有效沟通的方式）
  - 决策规则（在重复问题中的最佳实践）
  - 经验模式（曾经成功或失败的案例）

### 2. 知识提升流程
- **实时提升**：在对话中识别可以提升为"角色资产"的知识
- **周期沉淀**：每次对话完成后，分析和优化已有的角色资产
- **质量评估**：评估每个资产的有效性和可信度
- **版本管理**：追踪资产的演变过程

### 3. 记忆检索优化
- **个体模式匹配**：先检索该用户与角色的专属记忆
- **通用资产检索**：再检索所有用户共享的角色资产
- **优先级排序**：按相关性和置信度排序，动态调整注入

### 4. 特性实现
- **角色经验值系统** 🆕：追踪角色的学习进度和成长阶段
- **知识库管理** 🆕：集中管理角色的通用知识资产
- **交互质量反馈** 🆕：用户反馈帮助角色改进
- **对话贡献分析** 🆕：识别哪些对话对角色成长最有帮助

## Impact

- **Affected specs**: 
  - 新增 `character-long-term-learning` capability
  - 修改现有的 `chat-memory-integration` capability
  - 可能涉及 `character-management` capability

- **Affected code**:
  - `main/frontend/components/chat/ChatWindow.tsx`
  - `main/frontend/components/chat/utils/generateAIResponse.ts`
  - `main/frontend/components/chat/hooks/useSystemIntegration.ts`
  - `main/frontend/services/api/memory/memory.ts`
  - `main/backend/src/main/java/com/heartsphere/memory/controller/MemoryController.java`
  - `main/backend/src/main/java/com/heartsphere/character/entity/Character.java`
  - `main/backend/src/main/java/com/heartsphere/character/service/CharacterService.java`
  - `hsmem/rest_api_server.py`（可能需要增强）

- **Breaking changes**: 无直接的 breaking change，但是会改变 AI 生成的提示词结构

- **Data model changes**:
  - Character 表新增字段：`experience_level`, `knowledge_asset_count`, `last_learning_update`
  - 新增 `character_knowledge_assets` 表：存储角色的通用知识资产
  - 新增 `character_learning_history` 表：追踪每次学习/沉淀事件
