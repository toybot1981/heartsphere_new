## ADDED Requirements

### Requirement: Mentis Brain Component
The system SHALL provide a `MentisBrain` component that orchestrates task planning, instruction generation, decision-making, and feedback processing.

#### Scenario: Brain initialization
- **WHEN** the brain component is initialized
- **THEN** it SHALL integrate with LLM service, memory system, prompt system, skills system, and MCP configuration
- **AND** it SHALL be ready to process task requests

#### Scenario: Task planning
- **WHEN** the brain receives a user task request
- **THEN** it SHALL identify the task type (weather_query, stock_query, etc.)
- **AND** it SHALL match the request to a task template if available
- **AND** it SHALL use task-specific planning strategy or generic planning
- **AND** it SHALL consider context from memory system
- **AND** it SHALL use LLM for intelligent planning

### Requirement: Instruction Generation
The brain SHALL convert task plans into executable instructions for the executor.

#### Scenario: Plan to instruction conversion
- **WHEN** the brain has a task plan
- **THEN** it SHALL generate executable instructions (commands) for each step
- **AND** instructions SHALL include command, working directory, and timeout
- **AND** instructions SHALL be optimized for E2B execution

#### Scenario: Instruction validation
- **WHEN** the brain generates an instruction
- **THEN** it SHALL validate the instruction format
- **AND** it SHALL ensure the instruction is executable

### Requirement: Decision Making
The brain SHALL evaluate execution results and make decisions about next actions.

#### Scenario: Result evaluation
- **WHEN** the brain receives an execution result
- **THEN** it SHALL evaluate the result (success/failure/partial)
- **AND** it SHALL determine if the task is complete
- **AND** it SHALL identify any errors or issues

#### Scenario: Decision types
- **WHEN** the brain evaluates a result
- **THEN** it SHALL decide one of: continue (next instruction), retry (same instruction), refine (modify plan), or complete (task done)
- **AND** the decision SHALL be based on result analysis and context

### Requirement: Feedback Loop
The brain SHALL implement a feedback loop that iteratively refines plans based on execution results.

#### Scenario: Iterative execution
- **WHEN** the brain executes a task
- **THEN** it SHALL follow this loop: generate instruction → execute → receive result → evaluate → decide → (continue/retry/refine/complete)
- **AND** it SHALL continue until task completion or failure

#### Scenario: Maximum iterations
- **WHEN** the feedback loop exceeds maximum iterations
- **THEN** the brain SHALL stop execution
- **AND** it SHALL return an error indicating too many iterations

#### Scenario: Timeout handling
- **WHEN** task execution exceeds timeout
- **THEN** the brain SHALL stop execution
- **AND** it SHALL return timeout error

### Requirement: Integration with Existing Systems
The brain SHALL integrate with existing Mentis systems.

#### Scenario: LLM integration
- **WHEN** the brain needs to plan or make decisions
- **THEN** it SHALL use the LLM service for intelligent reasoning
- **AND** it SHALL pass relevant context to the LLM

#### Scenario: Memory integration
- **WHEN** the brain processes a task
- **THEN** it SHALL retrieve relevant context from memory system
- **AND** it SHALL store execution results in memory for future reference

#### Scenario: Prompt integration
- **WHEN** the brain generates instructions
- **THEN** it SHALL use prompt templates for instruction formatting
- **AND** it SHALL customize prompts based on task type

#### Scenario: Skills integration
- **WHEN** the brain encounters a specialized task
- **THEN** it SHALL use appropriate skills from the skills system
- **AND** it SHALL leverage skill-specific capabilities

#### Scenario: MCP integration
- **WHEN** the brain needs external tools
- **THEN** it SHALL use MCP configuration to access external tools
- **AND** it SHALL format tool calls appropriately

### Requirement: Multi-Modal Task Execution
The brain SHALL support multiple execution modes for tasks: direct prompt-based execution, MCP tool calls, E2B virtual machine tools, or combinations thereof.

#### Scenario: Execution mode selection
- **WHEN** the brain plans a task
- **THEN** it SHALL evaluate available execution modes:
  - Direct prompt-based execution (LLM direct response)
  - MCP tool execution (external tools via MCP)
  - E2B tool execution (virtual machine tools)
  - Combined execution (multiple modes)
- **AND** it SHALL select the most appropriate mode(s) based on task requirements

#### Scenario: Direct prompt execution
- **WHEN** a task can be completed with LLM knowledge alone
- **THEN** the brain SHALL use direct prompt-based execution
- **AND** it SHALL generate appropriate prompts
- **AND** it SHALL return LLM response directly without tool calls

#### Scenario: MCP tool execution
- **WHEN** a task requires external tools or services
- **THEN** the brain SHALL use MCP tool execution
- **AND** it SHALL select appropriate MCP servers
- **AND** it SHALL call MCP tools with proper parameters
- **AND** it SHALL process MCP tool responses

#### Scenario: E2B tool execution
- **WHEN** a task requires virtual machine operations
- **THEN** the brain SHALL use E2B tool execution
- **AND** it SHALL select appropriate E2B tools (browser, terminal, file, code, system)
- **AND** it SHALL generate E2B commands based on tool configuration
- **AND** it SHALL execute commands via E2B executor

#### Scenario: Combined execution
- **WHEN** a complex task requires multiple execution modes
- **THEN** the brain SHALL coordinate multiple execution modes:
  - Use prompts for reasoning and decision-making
  - Use MCP tools for external data/services
  - Use E2B tools for virtual machine operations
- **AND** it SHALL manage execution order and data flow
- **AND** it SHALL merge results from different modes

#### Scenario: Execution mode decision
- **WHEN** the brain needs to choose execution mode
- **THEN** it SHALL consider:
  - Task complexity and requirements
  - Available tools and capabilities
  - Cost and performance considerations
  - User preferences and constraints
- **AND** it SHALL make optimal execution mode selection

### Requirement: Tool Scheduler
The brain SHALL include a dedicated `ToolScheduler` component that coordinates all tools, memory, and skills.

#### Scenario: Tool coordination
- **WHEN** the brain needs to execute a task
- **THEN** the ToolScheduler SHALL select appropriate tools based on task requirements
- **AND** it SHALL coordinate tool execution order and dependencies
- **AND** it SHALL manage tool resources and lifecycle

#### Scenario: Tool selection
- **WHEN** the brain needs to choose a tool for a task
- **THEN** the ToolScheduler SHALL evaluate available tools
- **AND** it SHALL select the most appropriate tool based on task type, tool capabilities, and context
- **AND** it SHALL consider tool availability and resource constraints

#### Scenario: Tool chaining
- **WHEN** a task requires multiple tools
- **THEN** the ToolScheduler SHALL determine tool execution order
- **AND** it SHALL handle tool dependencies
- **AND** it SHALL pass data between tools appropriately

#### Scenario: Parallel tool execution
- **WHEN** multiple tools can execute in parallel
- **THEN** the ToolScheduler SHALL identify parallel execution opportunities
- **AND** it SHALL coordinate parallel execution
- **AND** it SHALL merge results appropriately

## MODIFIED Requirements

### Requirement: Task Planning Flow
The task planning flow SHALL be updated to use the brain orchestrator instead of direct execution.

#### Scenario: Brain-based planning
- **WHEN** a user submits a task request
- **THEN** the system SHALL route the request to MentisBrain
- **AND** the brain SHALL handle planning, execution, and feedback
- **AND** the system SHALL return results from the brain

#### Scenario: Iterative planning
- **WHEN** execution results indicate plan refinement is needed
- **THEN** the brain SHALL refine the plan based on feedback
- **AND** it SHALL generate new instructions for the refined plan

### Requirement: Configuration Management
The brain SHALL support configuration management for LLM, memory system, prompts, skills, and MCP settings stored in the database.

#### Scenario: Configuration storage
- **WHEN** a brain configuration is created or updated
- **THEN** it SHALL be stored in the `mentis_brain_configs` database table
- **AND** configuration items (LLM, memory, prompts, skills, MCP) SHALL be stored in `mentis_brain_config_items` table
- **AND** configurations SHALL support versioning and history

#### Scenario: Configuration retrieval
- **WHEN** the brain initializes
- **THEN** it SHALL load configurations from the database
- **AND** it SHALL validate configuration format
- **AND** it SHALL use default configurations if none are found

#### Scenario: Configuration management API
- **WHEN** an administrator creates or updates a brain configuration
- **THEN** the system SHALL provide REST API endpoints for CRUD operations
- **AND** it SHALL validate configuration data before saving
- **AND** it SHALL support configuration activation/deactivation

#### Scenario: Configuration inheritance
- **WHEN** a brain configuration references another configuration
- **THEN** it SHALL inherit base configuration settings
- **AND** it SHALL allow overriding specific settings
- **AND** it SHALL merge configurations appropriately
