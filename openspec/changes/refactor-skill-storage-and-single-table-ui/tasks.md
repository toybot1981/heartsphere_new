## 1. 规范与文档

- [x] 1.1 在 `openspec/project.md` 的「提案与前端自动化测试」中补充：技能执行时**先对目标模块/功能点进行需求分析，再围绕需求开展用例编写**；与 web-automation-testing 技能中的「编写用例流程」保持一致
- [x] 1.2 如需，在 `.claude/skills/web-automation-testing/SKILL.md` 中强化「需求分析 → 围绕需求编写用例」的说明，并与 project.md 表述一致

## 2. 后端与存储（文档与 API）

- [x] 2.1 在开发/运维文档或 API 注释中明确：skill_definitions 对应 SKILL.md（metadata + skill_content），skill_resources 对应 Bundled Resources（resource_type: SCRIPT/REFERENCE/ASSET），关联为 skill_id
- [x] 2.2 若前端单表视图需要「技能主信息 + 资源列表」一次性加载，扩展 Admin 技能查询 API 或 DTO，返回技能及关联的 skill_resources 列表

## 3. 前端：单表展示与编辑统一

- [x] 3.1 实现单表/单视图组件：展示技能元数据、skill_content 及 Bundled Resources 列表（scripts、references、assets），支持在同一视图内编辑并保存
- [x] 3.2 调整 AI 生成流程：生成完成后直接进入上述单表视图并填入生成结果，不再经多步向导展示
- [x] 3.3 调整技能编辑入口：从列表或其它入口进入「编辑」时，使用与生成结果相同的单表视图加载并编辑该技能
- [x] 3.4 保存逻辑：在单表视图中保存时，持久化 skill_definitions 及关联的 skill_resources，行为与现有创建/更新一致

## 4. 集成与验证

- [x] 4.1 验证 AI 生成 → 单表展示 → 编辑 → 保存 全流程
- [x] 4.2 验证从列表进入编辑时，单表视图与生成结果页布局与交互一致

## 5. 自动化测试方案（涉及前端页面功能）

- [x] 5.1 提供技能管理（创建/生成/编辑/单表视图）的自动化测试方案，由 **web-automation-testing** 技能完成
- [x] 5.2 执行时先对技能创建器与单表展示/编辑模块做**需求分析**，再围绕需求编写用例
- [x] 5.3 测试方案资产保存在对应前端项目专有目录（如 `admin/frontend/e2e/skill-management/` 或 `admin/frontend/e2e/skill-creator/`）
