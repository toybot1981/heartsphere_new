## REMOVED Requirements

### Requirement: Mentis Code in Main Application
**Reason**: Mentis 功能已经独立为单独的项目（`mentis/`），主应用不应再包含 mentis 相关代码。

**Migration**: 
- 所有 mentis 功能已迁移到 `mentis/backend/` 和 `mentis/frontend/`
- 主应用应通过 API 调用独立的 mentis 服务（如果需要集成）
- 访问 mentis 功能应使用独立的 mentis 应用（端口 3002 前端，8082 后端）

#### Scenario: Main application does not contain mentis code
- **WHEN** 主应用（backend）启动
- **THEN** 不应扫描 `com.heartsphere.mentis` 包
- **THEN** 不应加载 mentis 相关的 bean 或组件

#### Scenario: Main frontend does not contain mentis components
- **WHEN** 主前端（frontend）构建
- **THEN** 不应包含 `components/mentis/` 目录
- **THEN** 不应包含 `services/mentis/` 目录
- **THEN** 不应包含 `pages/MentisPage.tsx` 文件

#### Scenario: Admin frontend does not reference mentis
- **WHEN** admin 前端需要访问 mentis 功能
- **THEN** 应通过独立的 mentis 应用或 API 访问
- **THEN** 不应在 admin 前端中嵌入 mentis 组件（除非是管理功能需要）
