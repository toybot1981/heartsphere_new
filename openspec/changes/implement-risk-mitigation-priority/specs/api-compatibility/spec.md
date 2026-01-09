## ADDED Requirements

### Requirement: API 路径兼容层
系统 SHALL 提供 API 路径兼容层，支持旧 API 路径重定向到新路径，在迁移过渡期保持 API 兼容性。

#### Scenario: API 路径兼容层实现
- **WHEN** API 路径从旧路径（如 `/api/xxx`）迁移到新路径（如 `/api/client/xxx`）
- **THEN** 系统应该支持旧路径和新路径同时访问
- **AND** 旧路径应该自动重定向到新路径
- **AND** 兼容层应该不影响 API 功能
- **AND** 兼容层应该不影响 API 性能（性能影响 < 5%）

#### Scenario: API 路径映射
- **WHEN** 需要迁移 API 路径
- **THEN** 应该创建 API 路径映射表
- **AND** 映射表应该记录旧路径到新路径的映射关系
- **AND** 映射表应该保存在配置文件中
- **AND** 映射表应该易于维护和更新

#### Scenario: API 兼容层使用
- **WHEN** Controller 需要支持路径兼容
- **THEN** 应该使用 Spring Boot 的 @RequestMapping 支持多个路径
- **AND** 示例：`@RequestMapping({"/api/old-path", "/api/client/new-path"})`
- **AND** 兼容层应该易于添加和移除

### Requirement: API 路径迁移工具
系统 SHALL 提供 API 路径迁移工具，自动更新前端代码中的 API 调用路径。

#### Scenario: API 路径迁移脚本
- **WHEN** 需要迁移前端 API 调用路径
- **THEN** 应该提供 API 路径迁移脚本（`scripts/migrate-api-paths.sh`）
- **AND** 脚本应该能够扫描前端代码，查找所有 API 调用
- **AND** 脚本应该能够根据映射表自动更新 API 路径
- **AND** 脚本应该支持正则表达式匹配

#### Scenario: API 路径迁移备份
- **WHEN** 运行 API 路径迁移脚本
- **THEN** 脚本应该在迁移前备份原文件
- **AND** 备份文件应该保存在备份目录中
- **AND** 备份文件应该包含时间戳

#### Scenario: API 路径迁移审查
- **WHEN** API 路径迁移完成
- **THEN** 脚本应该生成变更报告
- **AND** 变更报告应该列出所有修改的文件和路径
- **AND** 变更报告应该支持人工审查
- **AND** 审查通过后，变更应该生效
