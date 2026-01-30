# Change: 后端大模型调用提示词统一交由提示词管理

**变更ID**: `migrate-backend-prompts-to-template-management`  
**创建日期**: 2025-01-29

---

## Why

后端多处调用大模型时仍使用写死在代码中的 prompt，导致：

1. **难以统一运维**：改一句提示词就要改代码、发版
2. **无法在管理端调优**：提示词管理功能已存在，但不少调用点未接入
3. **易产生乱码**：若入库与读取编码不统一，会出现乱码，需统一 UTF-8

因此需要：**检查后端所有调用大模型的地方，将写死的 prompt 全部交给提示词管理（入库），库中取不到时再使用默认提示词**；并保证全链路使用 **UTF-8**，避免乱码。

---

## What Changes

- **审计**：梳理 main/backend、admin/backend 中所有调用大模型的位置，列出仍写死 prompt 的调用点
- **分类与入库**：为每个调用点确定提示词分类/名称，将当前写死的提示词作为模板入库（表与连接使用 utf8mb4/UTF-8）
- **代码改造**：上述调用点改为通过 `PromptTemplateIntegrationService`（或等价能力）按分类/名称取提示词，取不到时使用当前代码中的默认提示词
- **编码与存储**：所有提示词相关读写、API、数据库字段均使用 UTF-8（含 Content-Type、JDBC、表字符集），不产生乱码
- **验证**：提供/补充 API 自动化测试方案，覆盖与提示词管理相关的关键 API（若存在）

不涉及前端页面功能，故不要求 Web 自动化测试方案。

---

## Impact

- **Affected specs**: 新增能力 `backend-prompt-management`（本变更内以 delta 形式定义）
- **Affected code**:
  - **main/backend**: `SkillPromptBuilderImpl`、`LLMBasedSkillExecutor`、`LLMMemoryExtractor`（角色交互/场景记忆两处）、`ESoulLetterGenerator`（已接入，需确认默认值与分类）、`EmotionService`（已接入，需确认）
  - **admin/backend**: `PromptAIGenerateService`、`SystemScriptService`（若含大模型调用与写死 prompt）
  - **shared/backend**: 仅使用现有 `PromptTemplateIntegrationService`/`PromptRenderService`，必要时扩展「按名称取模板」的用法
  - 数据库：`prompt_templates` 等表已存在，确保迁移脚本与内容为 UTF-8
