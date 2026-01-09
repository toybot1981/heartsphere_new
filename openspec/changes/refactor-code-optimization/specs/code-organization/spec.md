## ADDED Requirements

### Requirement: 代码文件大小限制
系统 SHALL 限制单个代码文件的最大行数，确保代码可维护性。

#### Scenario: 文件行数检查
- **WHEN** 创建或修改代码文件
- **THEN** 单个文件的行数不得超过500行
- **AND** 如果文件超过500行，必须拆分为多个文件

#### Scenario: 大文件重构
- **WHEN** 发现现有文件超过500行
- **THEN** 必须制定重构计划
- **AND** 按职责拆分文件
- **AND** 确保拆分后每个文件职责单一

### Requirement: 单一职责原则
系统 SHALL 确保每个类、组件或模块只负责一个功能，遵循单一职责原则。

#### Scenario: Controller职责划分
- **WHEN** 创建Controller类
- **THEN** 每个Controller只负责一个资源类型的API端点
- **AND** 相关资源使用统一的命名和路径规范

#### Scenario: Service职责划分
- **WHEN** 创建Service类
- **THEN** 每个Service只负责一个实体类型的业务逻辑
- **AND** 通用CRUD操作通过基类或接口提供

#### Scenario: 组件职责划分
- **WHEN** 创建React组件
- **THEN** 每个组件只负责一个UI功能
- **AND** 复杂组件必须拆分为多个子组件

### Requirement: 代码复用机制
系统 SHALL 提供统一的代码复用机制，减少重复代码。

#### Scenario: 通用基类提取
- **WHEN** 发现多个类有相同的代码逻辑
- **THEN** 必须提取为基类或工具类
- **AND** 基类提供通用的方法实现
- **AND** 子类继承或使用基类功能

#### Scenario: 通用组件提取
- **WHEN** 发现多个组件有相同的UI或逻辑
- **THEN** 必须提取为可复用的组件或Hook
- **AND** 通过参数配置实现不同场景的复用

### Requirement: 统一异常处理
系统 SHALL 提供统一的异常处理机制，确保错误响应格式一致。

#### Scenario: 全局异常处理
- **WHEN** 后端抛出异常
- **THEN** 必须通过@ControllerAdvice统一处理
- **AND** 返回统一的错误响应格式
- **AND** 记录异常日志

#### Scenario: 前端错误处理
- **WHEN** API请求失败
- **THEN** 必须通过统一的错误处理机制处理
- **AND** 显示用户友好的错误信息
- **AND** 记录错误日志

### Requirement: 统一响应格式
系统 SHALL 使用统一的API响应格式，确保前后端交互一致性。

#### Scenario: 成功响应格式
- **WHEN** API请求成功
- **THEN** 返回格式必须包含code、message、data、timestamp字段
- **AND** code为200表示成功
- **AND** data包含响应数据

#### Scenario: 错误响应格式
- **WHEN** API请求失败
- **THEN** 返回格式必须包含code、message、data、timestamp字段
- **AND** code为非200表示失败
- **AND** message包含错误描述

## MODIFIED Requirements

### Requirement: 代码组织规范
系统 SHALL 遵循统一的代码组织规范，确保代码结构清晰、易于维护。

#### Scenario: 后端代码组织
- **WHEN** 创建后端代码文件
- **THEN** 必须按照功能模块组织（controller、service、repository、entity、dto）
- **AND** 每个模块包含完整的层次结构
- **AND** 文件大小不超过500行
- **AND** 遵循单一职责原则

#### Scenario: 前端代码组织
- **WHEN** 创建前端代码文件
- **THEN** 必须按照功能类型组织（components、services、hooks、utils、types）
- **AND** 组件按功能模块分组
- **AND** 文件大小不超过500行
- **AND** 遵循单一职责原则

#### Scenario: 代码拆分
- **WHEN** 文件超过500行或职责不清
- **THEN** 必须拆分为多个文件
- **AND** 每个文件职责单一
- **AND** 保持文件间的依赖关系清晰

### Requirement: 测试覆盖率要求
系统 SHALL 确保关键代码有足够的测试覆盖，保证代码质量。

#### Scenario: 单元测试覆盖率
- **WHEN** 提交代码
- **THEN** 单元测试覆盖率必须达到80%以上
- **AND** 所有Service层核心业务逻辑必须有测试
- **AND** 所有Controller层API端点必须有测试

#### Scenario: 集成测试要求
- **WHEN** 实现新功能或重构代码
- **THEN** 必须添加集成测试
- **AND** 测试覆盖关键业务流程
- **AND** 测试覆盖API端点

#### Scenario: 测试维护
- **WHEN** 修改代码
- **THEN** 必须同步更新相关测试
- **AND** 确保所有测试通过
- **AND** 修复测试失败
