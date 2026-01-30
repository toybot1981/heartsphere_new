# 部署流程 API 测试规范

## ADDED Requirements

### Requirement: 流程模板管理 API 测试覆盖

系统 **MUST** 为部署流程模板的 CRUD 操作（创建、读取、更新、删除）编写完整的测试用例，确保所有 API 端点都能正常工作，包括正常场景、异常场景和边界情况。

#### Scenario: 测试获取流程模板列表 API
- **Given**: 系统中存在多个流程模板（不同环境、不同项目）
- **When**: 调用 `GET /api/admin/devops/pipelines`
- **Then**: 
  - 返回所有流程模板列表
  - 状态码为 200
  - 响应格式正确

#### Scenario: 测试按环境过滤流程模板
- **Given**: 系统中存在多个环境的流程模板
- **When**: 调用 `GET /api/admin/devops/pipelines?environment=test`
- **Then**: 
  - 只返回测试环境的流程模板
  - 状态码为 200

#### Scenario: 测试按项目过滤流程模板
- **Given**: 系统中存在多个项目的流程模板
- **When**: 调用 `GET /api/admin/devops/pipelines?project=main`
- **Then**: 
  - 只返回 main 项目的流程模板
  - 状态码为 200

#### Scenario: 测试组合过滤流程模板
- **Given**: 系统中存在多个流程模板
- **When**: 调用 `GET /api/admin/devops/pipelines?environment=test&project=main`
- **Then**: 
  - 只返回测试环境且 main 项目的流程模板
  - 状态码为 200

#### Scenario: 测试获取流程模板详情
- **Given**: 系统中存在流程模板 ID=1
- **When**: 调用 `GET /api/admin/devops/pipelines/1`
- **Then**: 
  - 返回流程模板详情（包含步骤信息）
  - 状态码为 200

#### Scenario: 测试获取不存在的流程模板
- **Given**: 系统中不存在流程模板 ID=999
- **When**: 调用 `GET /api/admin/devops/pipelines/999`
- **Then**: 
  - 返回 404 状态码
  - 错误信息明确

#### Scenario: 测试创建流程模板
- **Given**: 有效的流程模板数据
- **When**: 调用 `POST /api/admin/devops/pipelines` 创建流程
- **Then**: 
  - 流程模板创建成功
  - 返回创建的流程模板信息
  - 状态码为 200 或 201
  - 可以通过 GET API 查询到新创建的流程

#### Scenario: 测试创建包含步骤的流程模板
- **Given**: 流程模板数据和步骤列表
- **When**: 调用 `POST /api/admin/devops/pipelines` 创建流程
- **Then**: 
  - 流程模板和步骤都创建成功
  - 步骤顺序正确
  - 可以通过 GET API 查询到流程和步骤

#### Scenario: 测试更新流程模板
- **Given**: 系统中存在流程模板 ID=1
- **When**: 调用 `PUT /api/admin/devops/pipelines/1` 更新流程
- **Then**: 
  - 流程模板更新成功
  - 返回更新后的流程模板信息
  - 状态码为 200
  - 可以通过 GET API 查询到更新后的流程

#### Scenario: 测试删除流程模板
- **Given**: 系统中存在流程模板 ID=1
- **When**: 调用 `DELETE /api/admin/devops/pipelines/1` 删除流程
- **Then**: 
  - 流程模板删除成功
  - 状态码为 200 或 204
  - 通过 GET API 查询不到该流程（返回 404）

### Requirement: 流程执行 API 测试覆盖

系统 **MUST** 为流程执行相关的 API（执行、查询状态、查询详情、取消、列表查询）编写完整的测试用例，确保流程执行功能正常工作，包括执行生命周期管理、参数传递、状态更新等。

#### Scenario: 测试执行流程
- **Given**: 系统中存在有效的流程模板（包含步骤）
- **When**: 调用 `POST /api/admin/devops/pipelines/{pipelineId}/execute` 执行流程
- **Then**: 
  - 流程执行记录创建成功
  - 返回执行 ID 和初始状态
  - 状态码为 200
  - 执行状态为 RUNNING

#### Scenario: 测试执行流程时传递全局参数
- **Given**: 流程模板支持参数
- **When**: 调用执行 API 并传递全局参数
- **Then**: 
  - 参数正确传递给步骤执行
  - 执行记录包含参数信息

#### Scenario: 测试执行流程时传递环境变量
- **Given**: 流程模板需要环境变量
- **When**: 调用执行 API 并传递环境变量
- **Then**: 
  - 环境变量正确传递给步骤执行
  - 脚本执行时可以使用环境变量

#### Scenario: 测试执行不存在的流程
- **Given**: 系统中不存在流程模板 ID=999
- **When**: 调用 `POST /api/admin/devops/pipelines/999/execute`
- **Then**: 
  - 返回 404 状态码
  - 错误信息明确

#### Scenario: 测试执行无步骤的流程
- **Given**: 系统中存在无步骤的流程模板
- **When**: 调用执行 API
- **Then**: 
  - 返回错误或警告信息
  - 创建错误步骤执行记录（如果支持）

#### Scenario: 测试获取执行状态
- **Given**: 存在执行记录 ID=1
- **When**: 调用 `GET /api/admin/devops/pipelines/executions/1`
- **Then**: 
  - 返回执行状态信息
  - 状态码为 200
  - 包含执行 ID、状态、进度等信息

#### Scenario: 测试获取执行详情
- **Given**: 存在执行记录 ID=1（包含步骤执行）
- **When**: 调用 `GET /api/admin/devops/pipelines/executions/1/detail`
- **Then**: 
  - 返回执行详情（包含步骤执行列表）
  - 状态码为 200
  - 步骤执行信息完整

#### Scenario: 测试取消执行
- **Given**: 存在运行中的执行记录 ID=1
- **When**: 调用 `POST /api/admin/devops/pipelines/executions/1/cancel`
- **Then**: 
  - 执行被取消
  - 状态码为 200
  - 执行状态更新为 CANCELLED

#### Scenario: 测试取消已完成的执行
- **Given**: 存在已完成的执行记录 ID=1
- **When**: 调用取消 API
- **Then**: 
  - 返回错误或提示信息
  - 执行状态不变

#### Scenario: 测试获取执行列表
- **Given**: 系统中存在多个执行记录
- **When**: 调用 `GET /api/admin/devops/pipelines/executions`
- **Then**: 
  - 返回执行列表
  - 状态码为 200
  - 支持分页（如果实现）

#### Scenario: 测试按流程 ID 过滤执行列表
- **Given**: 系统中存在多个流程的执行记录
- **When**: 调用 `GET /api/admin/devops/pipelines/executions?pipelineId=1`
- **Then**: 
  - 只返回流程 ID=1 的执行记录
  - 状态码为 200

### Requirement: 日志和流式传输 API 测试覆盖

系统 **MUST** 为日志下载和 SSE 流式传输 API 编写完整的测试用例，确保日志可以正确下载，SSE 连接可以正常建立和接收事件更新。

#### Scenario: 测试下载执行日志
- **Given**: 存在执行记录 ID=1（包含步骤执行和日志）
- **When**: 调用 `GET /api/admin/devops/pipelines/executions/1/log/download`
- **Then**: 
  - 返回日志文件
  - 状态码为 200
  - Content-Type 为 text/plain
  - 日志内容包含步骤执行信息

#### Scenario: 测试下载无步骤执行的日志
- **Given**: 存在执行记录 ID=1（无步骤执行）
- **When**: 调用日志下载 API
- **Then**: 
  - 返回包含基本信息的日志文件
  - 状态码为 200
  - 日志包含执行基本信息

#### Scenario: 测试 SSE 流式传输连接
- **Given**: 存在执行记录 ID=1
- **When**: 建立 SSE 连接到 `/api/admin/devops/pipelines/executions/1/stream`
- **Then**: 
  - 连接成功建立
  - 可以接收到状态更新事件

#### Scenario: 测试 SSE 状态更新推送
- **Given**: SSE 连接已建立，执行正在进行
- **When**: 执行状态发生变化
- **Then**: 
  - 接收到状态更新事件
  - 事件格式正确
  - 事件数据包含最新状态

#### Scenario: 测试 SSE 步骤状态更新推送
- **Given**: SSE 连接已建立，流程包含多个步骤
- **When**: 步骤执行状态发生变化
- **Then**: 
  - 接收到步骤状态更新事件
  - 事件包含步骤 ID 和状态信息

### Requirement: 端到端流程执行测试覆盖

系统 **MUST** 编写端到端测试用例，测试从创建流程模板到成功执行完整流程的整个生命周期，包括步骤执行、错误处理、并发执行等场景。

#### Scenario: 测试完整流程执行生命周期
- **Given**: 创建包含多个步骤的流程模板
- **When**: 执行流程并等待完成
- **Then**: 
  - 所有步骤按顺序执行
  - 每个步骤状态正确更新
  - 流程最终状态为 SUCCESS 或 FAILED
  - 日志完整收集

#### Scenario: 测试必需步骤失败时的流程终止
- **Given**: 流程包含必需步骤，步骤执行失败
- **When**: 执行流程
- **Then**: 
  - 流程在失败步骤后终止
  - 流程状态为 FAILED
  - 后续步骤不执行

#### Scenario: 测试可选步骤失败时的流程继续
- **Given**: 流程包含可选步骤，步骤执行失败
- **When**: 执行流程
- **Then**: 
  - 流程继续执行后续步骤
  - 失败步骤标记为 FAILED
  - 流程最终可能为 SUCCESS（如果后续步骤成功）

#### Scenario: 测试并发执行多个流程
- **Given**: 系统中存在多个流程模板
- **When**: 同时执行多个流程
- **Then**: 
  - 所有流程都能正常执行
  - 执行记录正确隔离
  - 无资源竞争问题

### Requirement: 错误处理和边界情况测试覆盖

系统 **MUST** 编写错误处理和边界情况的测试用例，包括认证失败、参数验证失败、数据库连接失败等异常场景，确保系统能够正确处理各种错误情况。

#### Scenario: 测试认证失败场景
- **Given**: 无效的认证 Token
- **When**: 调用任何 API
- **Then**: 
  - 返回 401 状态码
  - 错误信息明确

#### Scenario: 测试参数验证失败
- **Given**: 无效的请求参数
- **When**: 调用创建或更新 API
- **Then**: 
  - 返回 400 状态码
  - 错误信息包含验证失败详情

#### Scenario: 测试数据库连接失败
- **Given**: 数据库连接不可用
- **When**: 调用需要数据库的 API
- **Then**: 
  - 返回 500 状态码
  - 错误信息明确（不暴露敏感信息）

## MODIFIED Requirements

### Requirement: 测试基础设施改进

系统 **SHALL** 改进测试基础设施，包括配置测试数据库、创建测试数据构建器、优化测试执行环境等，确保测试可以高效、可靠地运行。

#### Scenario: 配置测试数据库
- **Given**: 项目使用 MySQL 数据库
- **When**: 运行集成测试
- **Then**: 
  - 使用独立的测试数据库（H2 或 TestContainers）
  - 测试数据正确加载和清理
  - 测试之间数据隔离

#### Scenario: 创建测试数据构建器
- **Given**: 需要创建测试数据
- **When**: 使用测试数据构建器
- **Then**: 
  - 可以快速创建标准测试数据
  - 支持自定义字段
  - 数据格式正确

## 测试验证标准

### 代码覆盖率要求
- Controller 层: 100% 方法覆盖
- Service 层: > 90% 代码覆盖
- Repository 层: > 80% 代码覆盖
- 整体覆盖率: > 80%

### 测试执行要求
- 所有测试用例必须通过
- 测试执行时间合理（单元测试 < 1秒，集成测试 < 5秒）
- 测试可以独立运行，不依赖执行顺序
- 测试数据自动清理，不影响其他测试

### 测试文档要求
- 每个测试用例有清晰的注释说明
- 测试用例文档完整
- 测试执行指南清晰
- 问题排查文档完善
