# Design: Mentis Brain Architecture Refactoring

## Context

The current Mentis system has a linear flow: TaskPlanner creates a plan → ExecutionEngine executes it → Results are returned. This approach has limitations:

1. **No feedback loop**: Execution results don't inform planning decisions
2. **Rigid execution**: Plans are executed as-is without adaptation
3. **Mixed responsibilities**: ExecutionEngine contains decision logic
4. **Poor error recovery**: Failures require manual intervention

The goal is to create a "super agent" brain that:
- Plans tasks intelligently
- Issues executable instructions
- Receives execution feedback
- Makes decisions based on results
- Iteratively refines plans

## Goals / Non-Goals

### Goals
- Clear separation: Brain (planning/decision) vs Executor (execution)
- Iterative planning with feedback loops
- Intelligent decision-making based on execution results
- Integration of LLM, memory, prompts, skills, and MCP
- Simple, focused E2B executor

### Non-Goals
- Complete rewrite of existing components
- Changing E2B bridge service (keep it simple)
- Modifying memory system architecture (use existing)
- Changing LLM integration (use existing)

## Decisions

### Decision 1: Brain Component Architecture

**What**: Create a new `MentisBrain` component that orchestrates the planning-execution-feedback loop.

**Why**: 
- Centralizes all decision-making logic
- Provides clear interface for planning and instruction generation
- Enables feedback-based iteration

**Alternatives considered**:
- Extend existing TaskPlanner: Would mix planning with decision-making
- Create separate DecisionEngine: Would add unnecessary complexity
- Use existing ExecutionEngine: Would violate separation of concerns

**Implementation**:
```
MentisBrain
├── PlanningModule (uses TaskPlanner)
├── InstructionGenerator (converts plans to commands)
├── DecisionModule (evaluates results, makes decisions)
├── FeedbackProcessor (processes execution results)
├── ToolScheduler (coordinates tools, memory, skills)
└── Orchestrator (coordinates the loop)
```

### Decision 2: Instruction-Based Execution

**What**: ExecutionEngine accepts simple instructions (commands) instead of complex plans.

**Why**:
- Simplifies executor responsibility
- Makes E2B integration straightforward
- Enables better error handling

**Alternatives considered**:
- Keep plan-based execution: Too complex for executor
- Use high-level actions: Would require translation layer

**Implementation**:
- Instruction = { command: string, cwd?: string, timeout?: number }
- Executor returns: { success: boolean, output: string, error?: string }

### Decision 3: Feedback Loop Mechanism

**What**: Brain receives execution results, evaluates them, and decides next action.

**Why**:
- Enables adaptive planning
- Improves error recovery
- Supports iterative refinement

**Alternatives considered**:
- One-shot execution: No adaptation
- Manual intervention: Not scalable

**Implementation**:
```
Loop:
  1. Brain generates instruction
  2. Executor executes instruction
  3. Brain receives result
  4. Brain evaluates result
  5. Brain decides: continue/retry/refine/complete
```

### Decision 4: Integration Points

**What**: Brain integrates with existing systems:
- LLM: For planning and decision-making
- Memory: For context and history
- Prompts: For instruction generation
- Skills: For specialized capabilities
- MCP: For external tool access

**Why**: Leverage existing infrastructure without duplication.

**Implementation**:
- Brain uses existing services via dependency injection
- No new storage or infrastructure needed

### Decision 5: Configuration Management

**What**: Store brain configurations (LLM, memory, prompts, skills, MCP) in database for management.

**Why**:
- Enables dynamic configuration without code changes
- Supports multiple brain configurations
- Allows configuration versioning and history
- Provides management interface for administrators

**Alternatives considered**:
- Hard-coded configurations: Not flexible, requires code changes
- File-based configurations: Harder to manage and version
- Use existing `mentis_agent_configs`: Too generic, doesn't support structured configs

**Implementation**:
- Create `mentis_brain_configs` table for brain-level configurations
- Create `mentis_brain_config_items` table for individual config items (LLM, memory, prompt, skill, MCP)
- Support configuration inheritance and overrides
- Provide REST API for configuration management
- Store configurations as structured JSON with validation

### Decision 6: Tool Scheduler

**What**: Create a dedicated `ToolScheduler` component that coordinates all tools, memory, and skills for the brain.

**Why**:
- Centralizes tool selection and scheduling logic
- Enables intelligent tool selection based on task requirements
- Supports tool chaining and parallel execution
- Manages tool lifecycle and resource allocation

**Alternatives considered**:
- Direct tool calls from brain: Would scatter tool logic
- Separate scheduler service: Adds unnecessary complexity
- Tool registry only: Doesn't handle scheduling and coordination

**Implementation**:
- ToolScheduler maintains registry of all available tools (27 Manus tools + custom tools)
- ToolScheduler selects appropriate tools based on task requirements
- ToolScheduler coordinates tool execution order and dependencies
- ToolScheduler manages tool resources and lifecycle

### Decision 7: Skill Configuration and Prompt Generation

**What**: Generate skill configurations and prompts for the 27 Manus tools, stored in database.

**Why**:
- Provides structured skill definitions for tool usage
- Enables prompt templates for each tool
- Supports skill-based tool selection
- Allows skill customization and extension

**Alternatives considered**:
- Hard-coded skill definitions: Not flexible
- External skill files: Harder to manage
- No skill abstraction: Would require tool-specific logic everywhere

**Implementation**:
- Create skill definitions for 27 Manus tools:
  - Browser tools (10): browser_goto, browser_click, browser_type, browser_scroll, browser_screenshot, browser_back, browser_forward, browser_refresh, browser_search, browser_extract
  - Terminal tools (5): terminal_exec, terminal_write, terminal_read, terminal_cd, terminal_ls
  - File system tools (4): file_create, file_delete, file_copy, file_move
  - Code execution tools (3): python_run, node_run, bash_run
  - System tools (5): system_info, system_snapshot, system_restore, system_wait, system_log
- Generate prompt templates for each skill
- Store skill configurations in `mentis_brain_config_items` with type "SKILL"
- Support skill metadata: name, description, category, parameters, examples, usage scenarios

### Decision 8: Task-Specific Planning Configuration

**What**: Support task-specific planning configurations for different task types (weather query, stock query, travel planning, etc.).

**Why**:
- Different tasks require different planning strategies
- Task-specific configurations enable optimized planning for common scenarios
- Reduces planning time and improves accuracy
- Enables reusable task templates

**Alternatives considered**:
- Generic planning for all tasks: Less efficient, may miss task-specific optimizations
- Hard-coded task handlers: Not flexible, requires code changes for new tasks
- External task configuration files: Harder to manage and version

**Implementation**:
- Create `mentis_task_templates` table for task-specific planning configurations
- Support comprehensive task types:
  - Information queries: weather_query, stock_query, news_summary
  - Planning tasks: travel_planning, shopping_assistant
  - Research tasks: web_research, data_analysis
  - Content creation: code_generation, document_creation, report_generation
  - Management tasks: email_management, calendar_management, file_management
  - Processing tasks: translation, image_processing
  - Integration tasks: api_integration, database_query
- Each task template includes:
  - Task type and name
  - Planning strategy (steps, tool sequence, expected outputs)
  - Tool configuration (which tools to use, how to use them)
  - E2B execution instructions (how brain should command E2B)
  - Validation rules and success criteria
- Task templates stored in database, manageable via API

### Decision 9: Tool Execution Configuration for E2B

**What**: Tool configurations determine how the brain commands E2B during tool execution.

**Why**:
- Different tools require different E2B command strategies
- Tool configuration provides execution instructions for the brain
- Enables consistent and optimized E2B command generation
- Supports tool-specific error handling and retry strategies

**Alternatives considered**:
- Generic E2B commands for all tools: Less efficient, may not leverage tool capabilities
- Hard-coded execution logic: Not flexible, requires code changes
- Tool-specific execution handlers: Too complex, hard to maintain

**Implementation**:
- Each tool configuration includes E2B execution instructions:
  - Command generation template
  - Parameter mapping rules
  - Expected output format
  - Error handling strategy
  - Retry configuration
- Brain uses tool configuration to generate appropriate E2B commands
- Tool execution configuration stored in `mentis_brain_config_items` with type "TOOL_EXECUTION"

### Decision 10: Multi-Modal Task Execution

**What**: Brain supports multiple execution modes for tasks: direct prompts, MCP tools, E2B tools, or combinations.

**Why**:
- Different tasks require different execution approaches
- Some tasks can be solved with LLM knowledge alone (faster, cheaper)
- Some tasks need external tools via MCP (real-time data, specialized services)
- Some tasks need virtual machine operations via E2B (browser, terminal, file operations)
- Complex tasks may need combination of modes for optimal results

**Alternatives considered**:
- Always use tools: Inefficient for simple tasks, higher cost
- Always use prompts: Limited capabilities, can't access external resources
- Fixed execution mode: Not flexible, can't adapt to task requirements

**Implementation**:
- Brain includes execution mode selector that evaluates:
  - Task complexity and requirements
  - Available execution modes (prompt, MCP, E2B)
  - Cost and performance trade-offs
  - User preferences
- Brain supports three execution modes:
  1. **Prompt-based**: Direct LLM response, no tool calls
  2. **MCP-based**: External tools via MCP servers
  3. **E2B-based**: Virtual machine tools (browser, terminal, file, code, system)
- Brain supports combined execution:
  - Sequential: Use one mode, then another based on results
  - Parallel: Use multiple modes simultaneously when appropriate
  - Hybrid: Use prompts for reasoning, tools for execution
- Execution mode decision stored in task plan
- Brain orchestrates multi-modal execution with proper coordination

## Risks / Trade-offs

### Risk 1: Increased Complexity
**Mitigation**: 
- Keep executor simple (single responsibility)
- Use clear interfaces between components
- Comprehensive testing

### Risk 2: Performance Overhead
**Mitigation**:
- Cache planning results when appropriate
- Optimize feedback loop (don't re-plan unnecessarily)
- Use async execution where possible

### Risk 3: Migration Complexity
**Mitigation**:
- Implement alongside existing system
- Gradual migration path
- Backward compatibility where possible

## Migration Plan

### Phase 1: Create Brain Component
- Implement MentisBrain interface
- Create basic planning and instruction generation
- Keep existing ExecutionEngine working

### Phase 2: Refactor ExecutionEngine
- Simplify to instruction executor
- Remove decision logic
- Update to use E2B executor directly

### Phase 3: Implement Feedback Loop
- Add result evaluation
- Add decision-making logic
- Integrate with brain orchestrator

### Phase 4: Integration
- Connect brain to existing services (LLM, memory, etc.)
- Update task planning to use brain
- Test end-to-end flows

### Phase 5: Cleanup
- Remove old planning logic from ExecutionEngine
- Update documentation
- Deprecate old interfaces

## Open Questions

1. How many feedback iterations should be allowed before giving up?
2. Should the brain cache execution results for similar tasks?
3. How to handle partial execution results (e.g., multi-step commands)?
4. Should the brain support parallel instruction execution?
