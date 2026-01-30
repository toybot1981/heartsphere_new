# migrate-backend-prompts-to-template-management

**变更ID**: `migrate-backend-prompts-to-template-management`  
**目标**: 后端所有调用大模型的地方从提示词管理（库）获取 prompt，库中取不到时使用默认提示词；全链路 UTF-8 无乱码。

---

## 本目录文件说明

| 文件 | 说明 |
|------|------|
| **proposal.md** | 变更背景、目标、影响范围 |
| **design.md** | 技术决策、分类/名称映射、UTF-8、迁移计划 |
| **tasks.md** | 任务清单（审计、迁移、代码改造、验证）；未勾选项见「后续操作」 |
| **PROMPT_AUDIT.md** | 调用点审计与「调用点 → categoryCode/name」映射表 |
| **IMPLEMENTATION_SUMMARY.md** | 实施摘要、已完成项、**如何执行迁移（2.3）**、待用户执行项 |
| **完成与归档说明.md** | 实施状态、归档时机与命令 |
| **specs/backend-prompt-management/spec.md** | 能力 delta（后端提示词统一管理、入库与分类、UTF-8 无乱码） |

---

## 下一步

1. **执行迁移（2.3）**：按 **IMPLEMENTATION_SUMMARY.md** 的「如何执行迁移」启动 main 后端一次，在管理端确认新模板可见且中文无乱码。
2. **可选 6.3**：在管理端与数据库中抽查中文/特殊字符。
3. **部署后归档**：按 **完成与归档说明.md** 执行 `openspec archive migrate-backend-prompts-to-template-management --yes`（或 `--skip-specs --yes`）。

---

## 相关代码与测试

- **迁移脚本**: `main/backend/src/main/resources/db/migration/V20260132__insert_backend_prompt_templates.sql`
- **API 测试**: `main/backend/api-tests/prompt-management/`（api_test_plan.json、REQUIREMENTS.md、report.md；3 用例已通过）
