# 后端提示词统一管理

**变更ID**: `migrate-backend-prompts-to-template-management`  
**能力**: `backend-prompt-management`  
**创建日期**: 2025-01-29

---

## ADDED Requirements

### Requirement: 后端大模型调用使用提示词管理

后端所有调用大模型服务的入口 **MUST** 从提示词管理（模板库）获取 prompt；库中无法获取时 **MUST** 使用代码内提供的默认提示词，不得仅依赖写死在代码中的 prompt 且无法被管理端覆盖。

#### Scenario: 调用时库中有对应模板

- **GIVEN** 提示词库中存在某调用点对应的模板（按 categoryCode 或 categoryCode+name）
- **WHEN** 该调用点发起大模型请求
- **THEN** 使用库中该模板渲染后的 system/user prompt 调用大模型
- **AND** 不使用代码内写死的同一用途的字符串作为本次请求的 prompt

#### Scenario: 调用时库中无对应模板

- **GIVEN** 提示词库中不存在该调用点对应的模板或查询失败
- **WHEN** 该调用点发起大模型请求
- **THEN** 使用代码内定义的默认提示词（当前写死的逻辑或常量）作为 system/user prompt
- **AND** 行为与「未接入提示词管理前」一致，功能可用

---

### Requirement: 提示词入库与分类

所有由后端大模型调用使用的提示词 **MUST** 可被纳入提示词管理（入库）；每个用途 **MUST** 对应明确的分类代码（categoryCode），必要时 **MUST** 通过模板名称（name）区分同一分类下多模板。

#### Scenario: 新调用点接入时入库

- **GIVEN** 某后端调用点原使用写死 prompt，现接入提示词管理
- **WHEN** 完成改造与数据迁移
- **THEN** 该用途的默认提示词已写入 `prompt_templates`（或等价表）且与 categoryCode/name 对应
- **AND** 在管理端可查看、编辑该模板

#### Scenario: 多用途同一分类时的区分

- **GIVEN** 同一业务模块下存在多种 prompt 用途（如记忆：事实/偏好/记忆）
- **WHEN** 接入提示词管理
- **THEN** 通过不同 categoryCode 或通过 categoryCode+name 区分各用途
- **AND** 调用点查询时使用与用途一致的 categoryCode（及 name），不会串用其他用途的模板

---

### Requirement: 全链路 UTF-8 无乱码

提示词从入库、存储、API 返回到后端使用的全链路 **MUST** 使用 UTF-8 编码；**MUST NOT** 因编码或字符集配置不当导致中文或特殊字符出现乱码。

#### Scenario: 入库与存储为 UTF-8

- **GIVEN** 迁移脚本或导入逻辑将提示词写入数据库
- **WHEN** 脚本与表均按 utf8mb4/UTF-8 配置
- **THEN** 中文及常见特殊字符在表中正确存储与检索
- **AND** 管理端展示与编辑时无乱码

#### Scenario: API 与响应为 UTF-8

- **GIVEN** 前端或其它服务通过 API 获取提示词（如 main 的 `/api/prompts/render`）
- **WHEN** 响应 Content-Type 为 `application/json;charset=UTF-8` 且内容为 UTF-8
- **THEN** 返回的 prompt 文本中中文及特殊字符正确显示
- **AND** 无乱码或替换字符
