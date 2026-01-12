# Change: Admin项目支持多数据源

## Why

当前admin项目只能访问自己的数据库（heartsphere），但作为统一管理后台，需要能够访问和管理其他项目的数据库。各个子项目（mentis、edu、company、main等）应该拥有自己的独立数据库，admin项目需要支持多数据源配置，能够同时访问admin数据库和其他项目的数据库。

## What Changes

- **ADDED**: Admin项目多数据源配置
  - 配置admin主数据源（admin数据库，也是main和company项目使用的数据库）
  - 配置其他项目的数据源（mentis、edu项目的独立数据库）
  - 创建多数据源配置类，支持动态切换数据源
  - 为不同数据源配置独立的EntityManagerFactory和TransactionManager
  - **Note**: main和company项目直接使用heartsphere数据库（admin数据源），不需要单独配置

- **MODIFIED**: Admin项目的数据库访问
  - 更新Repository配置，支持指定数据源
  - 更新Service层，支持跨数据源查询
  - 更新配置，添加多数据源连接配置

- **ADDED**: 多数据源管理功能
  - 添加数据源切换注解或配置
  - 添加数据源健康检查
  - 添加数据源连接池配置

## Impact

- **Affected specs**: 
  - `admin-database-configuration` (新增规范)

- **Affected code**:
  - 后端：
    - `admin/backend/src/main/java/com/heartsphere/admin/config/DataSourceConfig.java` - 多数据源配置类（新增）
    - `admin/backend/src/main/java/com/heartsphere/admin/config/JpaConfig.java` - JPA多数据源配置（新增或修改）
    - `admin/backend/src/main/resources/application.yml` - 添加多数据源配置
    - Repository接口 - 可能需要添加数据源注解

- **New dependencies**:
  - 可能需要添加动态数据源路由库（如果使用动态数据源）

- **Configuration**:
  - 需要在application.yml中配置多个数据源连接信息
  - 需要配置各个项目的数据库名称和连接参数

- **Breaking changes**: 
  - 无（向后兼容，现有功能继续使用admin主数据源）

## Notes

- 当前各项目数据库情况：
  - admin: `heartsphere`（主数据源，默认）
  - edu: `heartsphere_edu`（独立数据库，已有）
  - mentis: `heartsphere_mentis`（需要创建独立数据库）
  - company: `heartsphere`（共享admin数据库，不需要单独配置）
  - main: `heartsphere`（共享admin数据库，不需要单独配置）
- 建议使用Spring的AbstractRoutingDataSource或第三方动态数据源库来实现多数据源
- 需要考虑事务管理，确保跨数据源操作的一致性
