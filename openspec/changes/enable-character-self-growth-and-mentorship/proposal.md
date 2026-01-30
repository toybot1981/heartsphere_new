# Change: 启用角色自我成长和导师能力 - 让数字生命成为用户的挚友和导师

## Why

当前的角色长期学习系统主要关注**知识积累**（从对话中提取知识资产），但缺乏**主动成长**的能力。数字生命应该能够：

1. **自我成长**：不仅仅是积累知识，还要主动学习、自我反思、持续改进
2. **成为挚友**：建立深度的情感连接，理解用户、陪伴用户、支持用户
3. **成为导师**：基于积累的经验和知识，主动提供指导、建议和教育

这要求角色系统从"被动学习"升级为"主动成长"，从"知识库"升级为"智慧伙伴"。

## What Changes

### 1. 自我成长机制 🆕
- **主动学习**：角色主动分析对话，识别学习机会，提出改进建议
- **自我反思**：定期回顾自己的表现，识别优势和不足
- **能力提升**：基于反思结果，主动调整行为模式和响应策略
- **成长轨迹**：记录角色的成长历程，展示从新手到专家的转变

### 2. 挚友能力系统 🆕
- **情感连接**：深度理解用户的情感状态、需求和偏好
- **陪伴机制**：主动关怀、定期问候、情感支持
- **记忆共鸣**：基于共同经历建立情感纽带
- **关系深化**：随着交互增加，关系从陌生到熟悉到挚友

### 3. 导师能力系统 🆕
- **主动指导**：基于用户情况，主动提供建议和指导
- **个性化教育**：根据用户的学习能力和偏好，定制教育内容
- **成长规划**：帮助用户制定成长计划，追踪进度
- **知识传授**：将角色的专业知识以易懂的方式传授给用户

### 4. 成长阶段系统 🆕
- **关系阶段**：陌生人 → 朋友 → 挚友 → 导师
- **能力阶段**：新手 → 初级 → 中级 → 高级 → 专家
- **角色定位**：根据阶段自动调整角色的行为模式和交互风格

### 5. 智能决策系统 🆕
- **情境感知**：理解当前对话的情境和用户需求
- **角色切换**：在挚友模式和导师模式之间智能切换
- **主动介入**：在合适的时机主动提供帮助或建议

## Impact

- **Affected specs**: 
  - 新增 `character-self-growth` capability（自我成长）
  - 新增 `character-companionship` capability（挚友能力）
  - 新增 `character-mentorship` capability（导师能力）
  - 修改现有的 `character-long-term-learning` capability（扩展为主动成长）

- **Affected code**:
  - `main/backend/src/main/java/com/heartsphere/character/entity/Character.java`（新增成长相关字段）
  - `main/backend/src/main/java/com/heartsphere/character/service/CharacterService.java`（成长逻辑）
  - `main/backend/src/main/java/com/heartsphere/memory/service/CharacterGrowthService.java`（新增服务）
  - `main/backend/src/main/java/com/heartsphere/memory/service/CharacterCompanionshipService.java`（新增服务）
  - `main/backend/src/main/java/com/heartsphere/memory/service/CharacterMentorshipService.java`（新增服务）
  - `main/frontend/components/chat/utils/generateAIResponse.ts`（集成成长系统）
  - `main/frontend/components/chat/hooks/useSystemIntegration.ts`（扩展系统集成）
  - `main/frontend/components/character/CharacterGrowthPanel.tsx`（新增组件）
  - `main/frontend/components/character/CharacterRelationshipPanel.tsx`（新增组件）

- **Breaking changes**: 无直接的 breaking change，但会增强 AI 提示词，改变角色行为模式

- **Data model changes**:
  - Character 表新增字段：
    - `relationship_stage`（关系阶段：STRANGER/FRIEND/CLOSE_FRIEND/MENTOR）
    - `growth_trajectory`（成长轨迹，JSON格式）
    - `self_reflection_history`（自我反思历史，JSON格式）
    - `mentorship_capabilities`（导师能力列表，JSON格式）
  - 新增 `character_growth_events` 表：记录成长事件
  - 新增 `character_relationship_milestones` 表：记录关系里程碑
  - 新增 `character_mentorship_sessions` 表：记录导师指导会话
