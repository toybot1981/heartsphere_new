# Tasks: 后端大模型提示词统一交由提示词管理

**变更ID**: `migrate-backend-prompts-to-template-management`

---

## 1. 审计与分类

- [x] 1.1 列出 main/backend 中所有调用大模型的位置（AIService.generateText / 等价入口）及当前 prompt 来源（写死 / 已用模板）
- [x] 1.2 列出 admin/backend 中所有调用大模型的位置及当前 prompt 来源
- [x] 1.3 为每个仍写死 prompt 的调用点确定提示词分类代码（categoryCode）及可选模板名称（name），形成「调用点 → 分类/名称」映射表
- [x] 1.4 确认现有已接入模板的调用点（如 ESoulLetterGenerator、EmotionService、LLMMemoryExtractor 的 facts/preferences/memories）使用的分类/名称与多模板场景是否需按名称区分（如 memory-facts / memory-preferences / memory-memories）

---

## 2. 数据与编码

- [x] 2.1 确认 `prompt_templates` 及相关表、JDBC 连接、迁移脚本均使用 utf8mb4/UTF-8，不产生乱码
- [x] 2.2 编写迁移脚本或导入脚本，将当前代码中的默认提示词（按 1.3 映射）入库为对应分类/名称的模板，文件与内容均为 UTF-8
- [ ] 2.3 执行迁移/导入并校验：管理端可查看、编辑，且中文/特殊字符无乱码

---

## 3. 代码改造（main/backend）

- [x] 3.1 **SkillPromptBuilderImpl**：Level1/2/3 及 Batch 提示词改为通过 `PromptTemplateIntegrationService` 按分类（及名称）获取，取不到时使用现有 buildXxxPrompt 的返回值作为默认
- [x] 3.2 **LLMBasedSkillExecutor**：系统提示与用户提示改为通过提示词管理获取，取不到时使用现有 buildSystemInstruction / buildUserPrompt 的返回值作为默认
- [x] 3.3 **LLMMemoryExtractor**：角色交互记忆、角色场景记忆两处改为通过提示词管理获取（系统+用户），取不到时使用现有 buildCharacterXxxPrompt 与写死的 systemInstruction 作为默认
- [x] 3.4 确认 **ESoulLetterGenerator**、**EmotionService**、**LLMMemoryExtractor**（facts/preferences/memories）已正确使用模板与默认值；若当前共用一个 categoryCode，按需拆分为不同分类或按名称区分

---

## 4. 代码改造（admin/backend）

- [x] 4.1 **PromptAIGenerateService**：系统提示「你是一个提示词优化专家…」及 buildGeneratePrompt 内容改为从提示词管理获取，取不到时使用当前写死内容作为默认
- [x] 4.2 **SystemScriptService**（若含大模型调用）：相关 prompt 改为从提示词管理获取，取不到时使用默认
- [x] 4.3 其他 admin 内调用大模型且写死 prompt 的调用点，按 1.2/1.3 逐一改造

---

## 5. 多智能体与其它后端

- [x] 5.1 **AgentScopeAdapter.buildSystemPrompt**（若仍写死）：改为从提示词管理获取模板，取不到时使用现有拼接结果作为默认
- [x] 5.2 其它 main/admin 内遗漏的 LLM 调用点，按审计结果补充改造

---

## 6. 验证与测试

- [x] 6.1 单元/集成测试：改造后的调用点在「无模板」时回退到默认提示词，行为与改造前一致；「有模板」时使用库中模板
- [x] 6.2 创建 API 自动化测试方案：覆盖与提示词管理相关的关键 API（如 main 的 `/api/prompts/render`、admin 的提示词 CRUD），由 **api-automation-testing** 技能执行，资产存放于对应后端项目 `api-tests/` 下专有目录
- [ ] 6.3 手工或自动化验证：中文及特殊字符在管理端、API 响应、数据库中均无乱码（全链路 UTF-8）

---

## 后续操作（用户执行）

- **2.3**：执行迁移并在管理端校验。**方式**：启动 main 后端一次（如 `./scripts/start/start-main-backend.sh`），Flyway 会自动执行 `V20260132__insert_backend_prompt_templates.sql`；启动后在管理端打开提示词管理，确认新模板可见且中文无乱码。详见 **IMPLEMENTATION_SUMMARY.md** 的「如何执行迁移」。
- **6.3**：API 测试已包含中文变量用例（case_1_3）且通过；管理端与数据库的中文验证需在本地手工抽查。
