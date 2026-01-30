# Design: 后端大模型提示词统一交由提示词管理

**变更ID**: `migrate-backend-prompts-to-template-management**

---

## Context

- 项目已有 **提示词管理**：shared 中 `PromptTemplateIntegrationService`、`PromptRenderService`，admin 中提示词 CRUD 与分类，main 中 `PromptTemplateController` 暴露 `/api/prompts/render`。
- 部分调用点已接入（如 ESoulLetterGenerator、EmotionService、LLMMemoryExtractor 的 facts/preferences/memories），但 **SkillPromptBuilderImpl**、**LLMBasedSkillExecutor**、**LLMMemoryExtractor** 的角色交互/场景记忆、**admin PromptAIGenerateService** 等仍写死 prompt。
- 用户要求：检查后端所有调用大模型的地方，将写死的 prompt 全部交给提示词管理，入库；库中无法获取时再使用默认提示词；**全链路使用 UTF-8，不产生乱码**。

---

## Goals / Non-Goals

- **Goals**:
  - 后端所有调用大模型的入口，其 prompt 均从提示词管理（库）获取，仅当库中无可用模板时使用代码内默认值。
  - 默认提示词与库中模板内容均持久化到数据库，且全链路 UTF-8（库、API、文件）。
- **Non-Goals**:
  - 不改变提示词管理现有数据模型与 API 契约（仅扩展使用范围）。
  - 不负责前端页面功能，故不包含 Web 自动化测试方案。

---

## Decisions

### 1. 调用点与分类/名称的对应方式

- **已接入**：ESoulLetterGenerator（`main-letter-generation`）、EmotionService（`main-emotion-analysis`）、LLMMemoryExtractor 的 extractFacts/extractPreferences/extractMemories 目前共用 categoryCode `memory`，但默认 prompt 不同。建议为三者分别使用不同 categoryCode（如 `memory-facts`、`memory-preferences`、`memory-memories`）或使用 `getTemplateByCategoryAndName("memory", "facts")` 等，以便每个用途对应一条模板。
- **待接入**：
  - 技能选择：`skill-selection-level1`、`skill-selection-level2`、`skill-selection-level3`，及对应 Batch 变体（或同一分类下不同 name）。
  - 技能执行：`skill-execution-system`、`skill-execution-user`（或单条模板含 system/user 双段）。
  - 记忆提取：`memory-character-interaction`、`memory-character-scene`。
  - Admin：`admin-prompt-optimize`（PromptAIGenerateService）、剧本/脚本生成若调用 LLM 则单独分类。
  - 多智能体：`multiagent-agent-system`（AgentScopeAdapter）等。
- 实现时统一使用 `PromptTemplateIntegrationService.getPrompts(categoryCode, variables, defaultSystemPrompt, defaultUserPrompt)` 或 `getTemplateByCategoryAndName` + render，取不到时用代码内默认值。

### 2. UTF-8 与乱码防护

- **数据库**：表 `prompt_templates` 等已按 project.md 使用 utf8mb4/utf8mb4_unicode_ci；JDBC URL 含 `characterEncoding=UTF-8` 等。
- **API**：响应 `Content-Type: application/json;charset=UTF-8`；请求体解析使用 UTF-8。
- **迁移/导入脚本**：文件保存为 UTF-8（无 BOM）；脚本内字符串与 SQL 插入内容为 UTF-8；执行环境 locale/encoding 为 UTF-8，避免乱码。

### 3. 默认提示词保留位置

- 每个调用点在改为「先查库再回退」时，**保留当前写死的提示词逻辑**为 fallback：即 `getPrompts(..., defaultSystem, defaultUser)` 中的 default 仍由现有 private 方法（如 `buildFactExtractionPrompt`）或内联字符串提供，确保库中无数据时行为与改造前一致。

### 4. Admin 与 Main 的共享

- Admin 与 main 均使用 shared 的 `PromptTemplateIntegrationService` 与同一套表（或各自库中同一 schema），模板按 categoryCode/name 区分；admin 后台管理同一批模板，main 运行时只读获取。不引入新的 RPC，仅读 DB。

---

## Risks / Trade-offs

- **风险**：同一 categoryCode 下若存在多条启用模板，当前 `getTemplateByCategory` 只取第一条，可能不符合「按用途区分」的预期。  
  **缓解**：为不同用途使用不同 categoryCode 或使用 `getTemplateByCategoryAndName`，避免多用途共用一个 code。
- **性能**：每次调用都查库可能增加延迟。  
  **缓解**：若后续需要，可在 shared 或各模块内对「按 categoryCode/name 读取」做短期缓存（本变更不强制实现缓存）。

---

## Migration Plan

1. 审计并定稿「调用点 → categoryCode/name」映射；确认 UTF-8 配置。
2. 编写并执行迁移/导入脚本（UTF-8），将默认提示词入库。
3. 按 tasks.md 顺序改造 main/backend、admin/backend、多智能体等调用点，逐模块测试回退与模板生效。
4. 补充/执行 API 自动化测试方案，验证提示词相关 API 与 UTF-8 展示无乱码。

---

## Open Questions

- 技能选择 Level2/Level3 Batch 是否与单条共用同一模板（仅变量不同），由实现时根据模板变量能力决定。
- AgentScopeAdapter 的 buildSystemPrompt 若强依赖 agent 动态字段，可仅将「固定前缀/后缀」放入模板，动态部分仍由代码拼接。
