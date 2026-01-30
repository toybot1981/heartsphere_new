## MODIFIED Requirements

### Requirement: 统一管理后台
系统 SHALL 提供一个统一的管理后台（admin），用于管理所有客户端产品（client、edu、mentis、company）的配置、用户、数据和系统。**注意：DevOps 工作台功能已迁移到独立的 DevOps 平台项目，不再包含在管理后台中。**

#### Scenario: 统一管理入口
- **WHEN** 访问管理后台
- **THEN** 应该提供一个统一的管理入口
- **AND** 该入口应该能够管理所有客户端产品
- **AND** 该入口应该提供统一的管理界面和导航
- **AND** 该入口不应该包含 DevOps 工作台功能（DevOps 功能应通过独立的 DevOps 平台访问）

#### Scenario: 产品管理功能
- **WHEN** 管理员查看产品管理页面
- **THEN** 应该能够查看所有客户端产品（client、edu、mentis、company）的列表
- **AND** 应该能够查看每个产品的运行状态和统计信息
- **AND** 应该能够配置和更新每个产品的设置
- **AND** 应该能够启用或禁用某个产品

#### Scenario: 用户和权限管理功能
- **WHEN** 管理员查看用户和权限管理页面
- **THEN** 应该能够统一管理所有产品的用户
- **AND** 应该能够分配用户权限和角色
- **AND** 应该能够查看用户行为分析和统计
- **AND** 应该能够跨产品管理用户权限

#### Scenario: 数据管理功能
- **WHEN** 管理员查看数据管理页面
- **THEN** 应该能够统一查看和管理各产品的数据
- **AND** 应该能够导出和备份各产品的数据
- **AND** 应该能够查看数据统计和分析
- **AND** 应该能够跨产品查询和统计数据

#### Scenario: 系统管理功能
- **WHEN** 管理员查看系统管理页面
- **THEN** 应该能够管理系统配置和参数
- **AND** 应该能够查看系统日志和监控信息
- **AND** 应该能够监控系统性能和告警
- **AND** 应该能够管理各产品的系统配置
- **AND** 不应该包含 DevOps 工作台功能（DevOps 功能应通过独立的 DevOps 平台访问）

## REMOVED Requirements

### Requirement: DevOps 工作台
**Reason**: DevOps 工作台功能已迁移到独立的 DevOps 平台项目，不再作为管理后台的模块。

**Migration**: 
- DevOps 工作台功能现在通过独立的 DevOps 平台项目访问
- DevOps 平台提供独立的 API 接口（`/api/devops/*`）
- 管理员可以通过 DevOps 平台独立访问 DevOps 功能
- 其他项目可以通过 API 调用 DevOps 平台的功能
