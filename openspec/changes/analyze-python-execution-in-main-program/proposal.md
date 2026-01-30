# Change: 分析主程序中 Python 执行机制

**变更ID**: `analyze-python-execution-in-main-program`  
**状态**: 提案中

## Why

当前系统中存在多种 Python 执行方式，分散在不同的模块中，缺乏统一的分析和优化。需要全面分析现有实现，识别问题并提出改进方案：

1. **执行方式分散**：Python 执行逻辑分布在多个模块（mentis、main、技能系统），缺乏统一管理
2. **实现不一致**：不同模块使用不同的执行策略（直接执行、虚拟机执行、模拟执行），行为不一致
3. **缺乏统一接口**：各模块自行实现 Python 执行，没有统一的抽象层
4. **性能和安全问题**：直接执行可能存在安全风险，虚拟机执行可能有性能开销
5. **维护困难**：代码重复，修改需要同步多个地方

## What Changes

本提案将进行全面的分析和设计，包括：

- **现状分析**：
  - 梳理所有 Python 执行相关的代码和实现方式
  - 分析各执行方式的优缺点、使用场景和限制
  - 识别代码重复、不一致和潜在问题

- **架构设计**：
  - 设计统一的 Python 执行抽象层
  - 定义执行策略选择机制（直接执行 vs 虚拟机执行）
  - 设计安全机制和资源限制

- **改进方案**：
  - 提出代码重构建议，消除重复代码
  - 提出性能优化方案
  - 提出安全加固方案
  - 提出统一配置管理方案

- **实施计划**：
  - 制定分阶段实施计划
  - 识别迁移风险和缓解措施

## Impact

- **影响的规范**：
  - `python-execution` - Python 执行能力（新增，用于规范 Python 执行机制）

- **影响的代码**：
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/computeruse/impl/PythonScriptExecutor.java`
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/computeruse/impl/VmPythonScriptExecutor.java`
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/impl/VmScriptExecutor.java`
  - `main/backend/src/main/java/com/heartsphere/skill/service/executor/ScriptSkillExecutor.java`
  - `mentis/backend/src/main/java/com/heartsphere/mentis/tool/code/PythonRunTool.java`
  - 其他使用 Python 执行的工具类

- **数据库**：
  - 可能需要新增配置表用于管理 Python 执行策略和参数

## Benefits

1. **统一管理**：所有 Python 执行通过统一接口，便于维护和扩展
2. **性能优化**：根据场景选择最优执行策略，提升执行效率
3. **安全加固**：统一的安全检查和资源限制，降低安全风险
4. **代码质量**：消除重复代码，提高代码可维护性
5. **可扩展性**：统一的抽象层便于添加新的执行方式（如容器执行）

## Risks

- **迁移风险**：重构可能影响现有功能，需要充分测试
- **性能影响**：统一抽象层可能引入额外开销，需要优化
- **兼容性**：需要确保现有调用方式继续工作

## Migration Plan

1. **分析阶段**：全面梳理现有实现，识别问题和改进点
2. **设计阶段**：设计统一架构和接口，制定重构方案
3. **实施阶段**：分阶段重构，先统一接口，再迁移实现
4. **测试阶段**：全面测试，确保功能正常
5. **优化阶段**：性能优化和安全加固
