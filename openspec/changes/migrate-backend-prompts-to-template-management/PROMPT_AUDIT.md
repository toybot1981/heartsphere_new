# 后端大模型调用与提示词审计

**变更ID**: `migrate-backend-prompts-to-template-management`  
**日期**: 2025-01-29

---

## 1. main/backend 调用点

| 调用点 | prompt 来源 | categoryCode / name | 说明 |
|--------|-------------|---------------------|------|
| ESoulLetterGenerator | 已用模板 | main-letter-generation | 已接入，确认默认值与分类即可 |
| EmotionService | 已用模板 | main-emotion-analysis | 已接入 |
| LLMMemoryExtractor.extractFacts | 已用模板 | memory + name=facts | 当前共用 categoryCode "memory"，改为按 name 区分 |
| LLMMemoryExtractor.extractPreferences | 已用模板 | memory + name=preferences | 同上 |
| LLMMemoryExtractor.extractMemories | 已用模板 | memory + name=memories | 同上 |
| LLMMemoryExtractor.extractCharacterInteractionMemories | 写死 | memory-character-interaction | 待接入 |
| LLMMemoryExtractor.extractCharacterSceneMemories | 写死 | memory-character-scene | 待接入 |
| SkillPromptBuilderImpl (Level1/2/3/Batch) | 写死 | skill-selection-level1, skill-selection-level2, skill-selection-level3, skill-selection-level2-batch, skill-selection-level3-batch | 待接入 |
| LLMBasedSkillExecutor (system + user) | 写死 | skill-execution | 待接入 |
| LLMSkillSelectorImpl | 使用 SkillPromptBuilderImpl | 同上 | 随 SkillPromptBuilderImpl 改造 |
| AIServiceController.generateText/chatCompletions | 请求体传入 | 无 | 不改造 |

---

## 2. admin/backend 调用点

| 调用点 | prompt 来源 | categoryCode | 说明 |
|--------|-------------|--------------|------|
| PromptAIGenerateService | 写死 | admin-prompt-optimize | 待接入 |
| SystemScriptService | 仅拼接字符串，不调用 LLM | - | 不改造 |

---

## 3. 多智能体

| 调用点 | prompt 来源 | categoryCode | 说明 |
|--------|-------------|--------------|------|
| AgentScopeAdapter.buildSystemPrompt | 写死 | multiagent-agent-system | 待接入（可选，动态部分可保留代码拼接） |

---

## 4. 分类/名称映射表（入库用）

| categoryCode | name | 用途 |
|--------------|------|------|
| memory | facts | 记忆-事实提取 |
| memory | preferences | 记忆-偏好提取 |
| memory | memories | 记忆-记忆提取 |
| memory-character-interaction | (单模板) | 角色交互记忆提取 |
| memory-character-scene | (单模板) | 角色场景记忆提取 |
| skill-selection-level1 | (单模板) | 技能选择 Level1 |
| skill-selection-level2 | (单模板) | 技能选择 Level2 |
| skill-selection-level2-batch | (单模板) | 技能选择 Level2 Batch |
| skill-selection-level3 | (单模板) | 技能选择 Level3 |
| skill-selection-level3-batch | (单模板) | 技能选择 Level3 Batch |
| skill-execution | (单模板) | 技能执行 system+user |
| admin-prompt-optimize | (单模板) | 管理端提示词优化 |
| multiagent-agent-system | (单模板) | 多智能体 Agent 系统提示 |
