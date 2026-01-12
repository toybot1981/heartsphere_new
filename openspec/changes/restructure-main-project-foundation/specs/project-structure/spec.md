## ADDED Requirements

### Requirement: 主项目目录结构
主项目 SHALL 位于 `main/` 目录下，包含 `frontend/` 和 `backend/` 子目录，与其他项目（mentis、edu、admin）保持平级结构。

#### Scenario: 项目目录结构验证
- **WHEN** 查看项目根目录结构
- **THEN** 主项目代码 SHALL 位于 `main/frontend/` 和 `main/backend/` 目录下
- **AND** `main/` 目录 SHALL 与其他项目目录（mentis/、edu/、admin/）处于同一层级
- **AND** 项目根目录下 SHALL 不再包含 `frontend/` 和 `backend/` 目录（除非是其他项目的子目录）

#### Scenario: 构建脚本路径正确
- **WHEN** 执行主项目的构建命令
- **THEN** 构建脚本 SHALL 能够正确找到 `main/frontend/` 和 `main/backend/` 目录
- **AND** 所有路径引用 SHALL 指向正确的目录位置
- **AND** 构建过程 SHALL 成功完成

### Requirement: 主项目作为基础设施服务提供者
主项目 SHALL 作为基础设施服务提供者，为其他项目（mentis、edu、admin）提供场景角色剧本、AIAgent 等底层基础服务。

#### Scenario: 基础设施服务定位明确
- **WHEN** 查看主项目的功能定位
- **THEN** 主项目 SHALL 提供场景管理、角色管理、剧本系统、AIAgent 等基础设施服务
- **AND** 主项目 SHALL 通过 RESTful API 向其他项目提供服务
- **AND** 主项目 SHALL 不包含其他项目的业务逻辑代码

#### Scenario: 其他项目通过 API 调用基础设施服务
- **WHEN** mentis、edu、admin 项目需要使用场景、角色或 AI 服务
- **THEN** 这些项目 SHALL 通过 HTTP 调用主项目提供的 RESTful API
- **AND** 这些项目 SHALL 不直接依赖主项目的业务代码（Java 类或 TypeScript 类型）
- **AND** API 调用 SHALL 使用标准的 HTTP 认证（JWT）

### Requirement: Edu 代码清理
主项目 SHALL 不包含 edu 相关的业务代码，因为 edu 已经作为独立项目存在。

#### Scenario: 主项目后端不包含 edu 代码
- **WHEN** 检查 `main/backend/` 目录
- **THEN** 该目录 SHALL 不包含 edu 相关的 Controller、Service、Repository、Entity
- **AND** 该目录 SHALL 不包含 edu 相关的配置项和路由配置
- **AND** 该目录 SHALL 仅包含基础设施服务相关的代码

#### Scenario: 主项目前端不包含 edu 代码
- **WHEN** 检查 `main/frontend/` 目录
- **THEN** 该目录 SHALL 不包含 edu 相关的页面、组件、路由
- **AND** 该目录 SHALL 不包含 edu 相关的 API 调用和服务
- **AND** 该目录 SHALL 仅包含主项目自身的功能代码

#### Scenario: 其他项目清理 edu 相关代码
- **WHEN** 检查 mentis 和 admin 项目
- **THEN** 这些项目 SHALL 不包含 edu 相关的代码（如果之前存在）
- **AND** 这些项目 SHALL 仅包含各自项目的业务逻辑代码

### Requirement: 项目间通信规范
项目间 SHALL 通过 HTTP API 进行通信，保持项目独立性。

#### Scenario: 项目间通过 API 通信
- **WHEN** mentis、edu、admin 项目需要调用主项目的基础设施服务
- **THEN** 这些项目 SHALL 通过 HTTP 调用主项目的 RESTful API
- **AND** API 调用 SHALL 使用标准的 HTTP 方法（GET、POST、PUT、DELETE 等）
- **AND** API 调用 SHALL 包含适当的认证信息（JWT Token）

#### Scenario: 禁止直接代码依赖
- **WHEN** 检查项目间的依赖关系
- **THEN** mentis、edu、admin 项目 SHALL 不直接依赖主项目的业务代码（Java 类或 TypeScript 类型）
- **AND** 项目间 SHALL 不共享业务逻辑代码
- **AND** 项目间 SHALL 仅通过 shared 模块共享公共类型定义（不含业务逻辑）

### Requirement: 路径引用更新
所有构建脚本、配置文件、文档中的路径引用 SHALL 更新为新的目录结构。

#### Scenario: 构建脚本路径正确
- **WHEN** 执行主项目的构建命令（Maven、npm 等）
- **THEN** 构建脚本中的路径引用 SHALL 指向 `main/frontend/` 或 `main/backend/`
- **AND** 构建过程 SHALL 成功完成，无路径错误

#### Scenario: 配置文件路径正确
- **WHEN** 启动主项目服务
- **THEN** 配置文件（application.yml、vite.config.ts 等）中的路径引用 SHALL 正确
- **AND** 服务 SHALL 能够正确加载配置和资源文件

#### Scenario: 文档路径引用正确
- **WHEN** 查看项目文档
- **THEN** 文档中的路径引用 SHALL 反映新的目录结构
- **AND** 文档中的示例命令和路径 SHALL 正确
