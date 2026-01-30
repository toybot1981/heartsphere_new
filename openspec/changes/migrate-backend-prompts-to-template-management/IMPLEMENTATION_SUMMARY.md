# 实施摘要：后端大模型提示词统一交由提示词管理

**变更ID**: `migrate-backend-prompts-to-template-management`  
**实施日期**: 2025-01-29

---

## 已完成

### 1. 审计与分类
- **PROMPT_AUDIT.md**：列出 main/admin 大模型调用点及「调用点 → categoryCode/name」映射。

### 2. 数据与编码
- **shared**：`PromptTemplateIntegrationService` 新增 `getPromptsByCategoryAndName`，支持按分类+名称取模板并带默认回退。
- **迁移脚本**：`main/backend/src/main/resources/db/migration/V20260132__insert_backend_prompt_templates.sql`（UTF-8，SET NAMES utf8mb4），插入 memory+facts/preferences/memories、memory-character-interaction、memory-character-scene、skill-selection-level1/2/3 及 batch、skill-execution、admin-prompt-optimize、multiagent-agent-system 等默认模板。

### 3. main/backend 代码改造
- **SkillPromptBuilderImpl**：注入 `PromptTemplateIntegrationService`，Level1/2/3 及 Batch 均先按分类取模板，取不到时用 buildXxxPromptDefault。
- **LLMBasedSkillExecutor**：注入 `PromptTemplateIntegrationService`，系统/用户提示从 `skill-execution` 获取，取不到时用 buildSystemInstruction/buildUserPrompt；新增 buildSkillExecutionVariables、extractInstructionPart。
- **LLMMemoryExtractor**：facts/preferences/memories 使用 getPromptsByCategoryAndName("memory", "facts"|"preferences"|"memories")；角色交互/场景记忆使用 getPrompts("memory-character-interaction"|"memory-character-scene", variables, defaultSystem, defaultUser)。

### 4. admin/backend 代码改造
- **PromptAIGenerateService**：注入 `PromptTemplateIntegrationService`（required=false），系统与用户提示从 `admin-prompt-optimize` 获取，取不到时用原有写死内容。

### 5. 多智能体
- **AgentScopeAdapter**：增加 `PromptTemplateIntegrationService` 参数；buildSystemPrompt 优先从 `multiagent-agent-system` 模板取，取不到时用 buildSystemPromptDefault。
- **AgentScopeConfig**：agentScopeAdapter Bean 注入 PromptTemplateIntegrationService 并传入 AgentScopeAdapter。

### 6. 验证与测试
- **API 自动化测试**：`main/backend/api-tests/prompt-management/` 下 api_test_plan.json、README.md、REQUIREMENTS.md、report.md；3 个用例（含中文变量无乱码）已执行通过。
- **3.4 已确认**：ESoulLetterGenerator 使用 `main-letter-generation`，EmotionService 使用 `main-emotion-analysis`，LLMMemoryExtractor 的 facts/preferences/memories 已改为 getPromptsByCategoryAndName("memory", "facts"|"preferences"|"memories")，分类/名称区分正确。

---

## 待用户执行

- **2.3**：执行迁移并在管理端校验（见下方「如何执行迁移」）。
- **6.3**：管理端与数据库的中文/特殊字符抽查（API 已含中文用例并通过）。

---

## 如何执行迁移（2.3）

1. **方式一（推荐）**：启动 main 后端一次（如 `./scripts/start/start-main-backend.sh` 或 IDE 运行 `HeartSphereApplication`）。Flyway 会在启动时自动执行 `V20260132__insert_backend_prompt_templates.sql`。
2. **方式二**：若使用 Flyway CLI，在项目根或 main/backend 下执行：`mvn flyway:migrate`（需配置 `application.yml` 中的数据库连接）。
3. **校验**：启动后在管理端打开提示词管理页面，确认新插入的模板（如 skill-selection-level1、memory-character-interaction 等）可见、可编辑，且中文无乱码。
