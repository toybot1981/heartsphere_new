# Change: Refactor Mentis Brain Architecture

## Why

Currently, E2B virtual computers cannot effectively execute tasks according to plans. The responsibilities between planning and execution are not clearly separated, leading to poor task execution quality. We need to establish a clear division of responsibilities:

- **Mentis**: Responsible for planning, issuing instructions, receiving feedback, making decisions, and issuing new instructions (the "brain")
- **E2B**: Only responsible for executing instructions and returning results (the "executor")

This refactoring will create a powerful "super agent" brain in Mentis that combines:
- LLM capabilities
- Memory system
- Prompt engineering
- Skills
- MCP configuration

E2B will become a pure execution environment that receives instructions and completes tasks without decision-making logic.

## What Changes

- **BREAKING**: Restructure Mentis architecture to separate planning/decision-making from execution
- **ADDED**: Create `MentisBrain` component that orchestrates planning, decision-making, and feedback loops
- **ADDED**: Create `ToolScheduler` component that coordinates all tools, memory, and skills
- **ADDED**: Support task-specific planning configurations for different task types (weather_query, stock_query, travel_planning, etc.)
- **ADDED**: Implement tool execution configuration that determines how brain commands E2B
- **ADDED**: Support multi-modal task execution: direct prompts, MCP tools, E2B tools, or combinations
- **ADDED**: Implement execution mode selection and coordination for complex tasks
- **ADDED**: Generate skill configurations and prompts for 27 Manus tools (browser, terminal, file, code, system)
- **ADDED**: Integrate LLM, memory system, prompts, skills, and MCP configuration into the brain
- **ADDED**: Create database tables for storing and managing brain configurations (LLM, memory, prompts, skills, MCP)
- **ADDED**: Implement configuration management system for brain components
- **MODIFIED**: Refactor `ExecutionEngine` to be a simple instruction executor that delegates to E2B
- **MODIFIED**: Simplify E2B integration to only handle command execution and result reporting
- **ADDED**: Implement feedback loop mechanism where brain receives execution results and makes decisions
- **ADDED**: Create instruction generation system that converts plans into executable commands
- **MODIFIED**: Update task planning to be more iterative with feedback-based refinement

## Impact

- **Affected specs**: 
  - `mentis-brain` (new capability)
  - `multi-modal-execution` (new capability)
  - `tool-scheduler` (new capability)
  - `task-planning-config` (new capability)
  - `brain-config-management` (new capability)
  - `e2b-executor` (modified capability)
  - Task planning and execution capabilities
  
- **Affected code**:
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/` - Refactor execution engine
  - `mentis/backend/src/main/java/com/heartsphere/mentis/brain/` - New brain component
  - `mentis/backend/src/main/java/com/heartsphere/mentis/config/` - Configuration management
  - `mentis/backend/src/main/java/com/heartsphere/mentis/entity/` - Configuration and task template entities
  - `mentis/backend/src/main/java/com/heartsphere/mentis/repository/` - Configuration and task template repositories
  - `mentis/backend/src/main/java/com/heartsphere/mentis/service/` - Configuration and task template services
  - `mentis/backend/src/main/java/com/heartsphere/mentis/vm/e2b/` - Simplify E2B integration
  - `mentis/e2b-bridge/index.js` - Keep as simple executor bridge
  - `mentis/backend/src/main/resources/db/migration/` - Database migration scripts
  
- **Breaking changes**:
  - ExecutionEngine interface changes to accept instructions instead of plans
  - Task planning becomes iterative with feedback loops
  - E2B integration simplified to command execution only
