## ADDED Requirements

### Requirement: DevOps 独立项目结构
项目 SHALL 包含一个独立的 `devops/` 项目，作为基础设施服务，为其他项目提供统一的部署、运维、监控等能力。

#### Scenario: DevOps 项目目录结构
- **WHEN** 查看项目结构
- **THEN** 应该包含 `devops/` 项目目录
- **AND** `devops/` 目录应该包含 `backend/` 子目录（DevOps 后端服务）
- **AND** `devops/` 目录应该包含 `frontend/` 子目录（DevOps 前端界面）
- **AND** `devops/` 目录应该包含 `scripts/` 子目录（DevOps 相关脚本）
- **AND** `devops/` 目录应该包含 `docs/` 子目录（DevOps 项目文档）

#### Scenario: DevOps 项目独立性
- **WHEN** DevOps 项目构建和部署
- **THEN** 应该可以独立构建和运行
- **AND** 应该使用独立的数据库或 schema
- **AND** 应该提供独立的 API 接口
- **AND** 应该不依赖其他业务项目的代码
- **AND** 应该可以独立部署和扩展

#### Scenario: DevOps 项目定位
- **WHEN** DevOps 项目作为基础设施服务
- **THEN** 应该为其他项目（main、mentis、edu、admin）提供统一的部署和运维能力
- **AND** 应该提供统一的 API 接口供其他项目调用
- **AND** 应该支持多项目复用
- **AND** 应该明确作为基础设施服务的定位

## MODIFIED Requirements

### Requirement: 项目整体结构
项目 SHALL 采用模块化结构，包含主项目（main）、业务项目（mentis、edu、company）、管理后台（admin）、DevOps 平台（devops）和共享模块（shared）。

#### Scenario: 项目结构组织
- **WHEN** 查看项目整体结构
- **THEN** 应该包含以下主要项目：
  - `main/` - 主项目（基础设施服务）
  - `mentis/` - 心理健康项目
  - `edu/` - 教育版项目
  - `company/` - 公司官网项目
  - `admin/` - 统一管理后台
  - `devops/` - DevOps 平台（独立的基础设施服务）
  - `shared/` - 共享模块
- **AND** 每个项目应该可以独立构建和部署
- **AND** 项目之间应该通过 API 进行通信

#### Scenario: DevOps 项目与其他项目的关系
- **WHEN** 其他项目需要执行部署或运维操作
- **THEN** 应该通过 API 调用 DevOps 平台
- **AND** DevOps 平台应该提供统一的 API 接口
- **AND** DevOps 平台应该支持 API Token 认证
- **AND** DevOps 平台不应该依赖其他业务项目的代码
