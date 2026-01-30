# Tasks: Refactor Mentis Brain Architecture

## 1. Brain Component Implementation

- [ ] 1.1 Create `MentisBrain` interface with planning, instruction generation, and decision methods
- [ ] 1.2 Implement `MentisBrainImpl` with basic structure
- [ ] 1.3 Create `PlanningModule` that uses existing `TaskPlanner`
- [ ] 1.4 Create `InstructionGenerator` that converts plans to executable commands
- [ ] 1.5 Create `DecisionModule` for evaluating results and making decisions
- [ ] 1.6 Create `FeedbackProcessor` for processing execution results
- [ ] 1.7 Create `ToolScheduler` interface for tool coordination
- [ ] 1.8 Implement `ToolSchedulerImpl` with tool registry and selection logic
- [ ] 1.9 Create `ExecutionModeSelector` interface for execution mode decision
- [ ] 1.10 Implement `ExecutionModeSelectorImpl` with mode selection logic
- [ ] 1.11 Create `MultiModalExecutor` for coordinating multiple execution modes
- [ ] 1.12 Create `BrainOrchestrator` that coordinates the planning-execution-feedback loop
- [ ] 1.13 Add unit tests for brain components

## 2. Execution Engine Refactoring

- [ ] 2.1 Create `Instruction` data class (command, cwd, timeout)
- [ ] 2.2 Refactor `ExecutionEngine` interface to accept `Instruction` instead of `TaskPlan`
- [ ] 2.3 Simplify `ExecutionEngineImpl` to only execute instructions via E2B
- [ ] 2.4 Remove decision logic from `ExecutionEngineImpl`
- [ ] 2.5 Update `ExecutionResult` to include structured feedback
- [ ] 2.6 Add unit tests for simplified execution engine

## 3. E2B Integration Simplification

- [ ] 3.1 Review E2B API client to ensure it only handles command execution
- [ ] 3.2 Update E2B integration to use instruction format
- [ ] 3.3 Ensure E2B bridge service remains simple (no changes needed)
- [ ] 3.4 Add error handling for E2B execution failures

## 4. Feedback Loop Implementation

- [ ] 4.1 Implement result evaluation logic in `DecisionModule`
- [ ] 4.2 Implement decision logic (continue/retry/refine/complete)
- [ ] 4.3 Create feedback loop orchestrator that manages iterations
- [ ] 4.4 Add maximum iteration limits and timeout handling
- [ ] 4.5 Add unit tests for feedback loop

## 5. Tool Scheduler Implementation

- [ ] 5.1 Create `ToolScheduler` interface with tool selection and coordination methods
- [ ] 5.2 Implement `ToolSchedulerImpl` with tool registry
- [ ] 5.3 Implement tool selection logic based on task requirements
- [ ] 5.4 Implement tool execution coordination (sequential and parallel)
- [ ] 5.5 Implement tool resource management
- [ ] 5.6 Integrate ToolScheduler with memory system
- [ ] 5.7 Integrate ToolScheduler with skills system
- [ ] 5.8 Add unit tests for ToolScheduler

## 6. Task-Specific Planning Configuration

- [ ] 6.1 Create database migration for `mentis_task_templates` table
- [ ] 6.2 Create `TaskTemplate` entity class
- [ ] 6.3 Create `TaskTemplateRepository` interface
- [ ] 6.4 Create `TaskTemplateService` for CRUD operations
- [ ] 6.5 Implement task type identification logic
- [ ] 6.6 Implement task template matching algorithm
- [ ] 6.7 Create task template for weather_query
- [ ] 6.8 Create task template for stock_query
- [ ] 6.9 Create task template for travel_planning
- [ ] 6.10 Create task template for web_research
- [ ] 6.11 Create task template for data_analysis
- [ ] 6.12 Create task template for code_generation
- [ ] 6.13 Create task template for document_creation
- [ ] 6.14 Create task template for email_management
- [ ] 6.15 Create task template for calendar_management
- [ ] 6.16 Create task template for shopping_assistant
- [ ] 6.17 Create task template for news_summary
- [ ] 6.18 Create task template for translation
- [ ] 6.19 Create task template for image_processing
- [ ] 6.20 Create task template for file_management
- [ ] 6.21 Create task template for api_integration
- [ ] 6.22 Create task template for database_query
- [ ] 6.23 Create task template for report_generation
- [ ] 6.24 Create task template management API
- [ ] 6.25 Implement task-specific planning strategy execution
- [ ] 6.26 Add unit tests for task template system

## 7. Tool Execution Configuration for E2B

- [ ] 7.1 Create tool execution configuration data model
- [ ] 7.2 Implement E2B command generation from tool configuration
- [ ] 7.3 Implement parameter mapping from tool to E2B commands
- [ ] 7.4 Implement error handling based on tool configuration
- [ ] 7.5 Implement output format parsing based on tool configuration
- [ ] 7.6 Create E2B command templates for each tool
- [ ] 7.7 Integrate tool execution configuration with task templates
- [ ] 7.8 Add unit tests for E2B command generation

## 8. Multi-Modal Execution Implementation

- [ ] 8.1 Create `ExecutionMode` enum (PROMPT, MCP, E2B)
- [ ] 8.2 Create `ExecutionModeSelector` interface
- [ ] 8.3 Implement `ExecutionModeSelectorImpl` with decision logic
- [ ] 8.4 Create `PromptExecutor` for direct prompt-based execution
- [ ] 8.5 Create `MCPExecutor` for MCP tool execution
- [ ] 8.6 Create `E2BExecutor` wrapper for E2B tool execution
- [ ] 8.7 Create `MultiModalExecutor` for coordinating combined execution
- [ ] 8.8 Implement sequential execution coordination
- [ ] 8.9 Implement parallel execution coordination
- [ ] 8.10 Implement data flow management between execution modes
- [ ] 8.11 Implement error recovery for multi-modal execution
- [ ] 8.12 Create execution mode configuration management
- [ ] 8.13 Add unit tests for multi-modal execution

## 9. Manus 27 Tools Skill Configuration

- [ ] 6.1 Create skill configuration data model for tools
- [ ] 6.2 Generate skill configurations for 10 browser tools
- [ ] 6.3 Generate skill configurations for 5 terminal tools
- [ ] 6.4 Generate skill configurations for 4 file system tools
- [ ] 6.5 Generate skill configurations for 3 code execution tools
- [ ] 6.6 Generate skill configurations for 5 system tools
- [ ] 6.7 Generate prompt templates for all 27 tools
- [ ] 6.8 Create database migration to seed 27 tool skill configurations
- [ ] 6.9 Create tool skill configuration management API
- [ ] 6.10 Add unit tests for skill configuration generation

## 10. Configuration Management

- [ ] 5.1 Create database migration for `mentis_brain_configs` table
- [ ] 5.2 Create database migration for `mentis_brain_config_items` table
- [ ] 5.3 Create `BrainConfig` entity class
- [ ] 5.4 Create `BrainConfigItem` entity class
- [ ] 5.5 Create `BrainConfigRepository` interface
- [ ] 5.6 Create `BrainConfigService` for CRUD operations
- [ ] 5.7 Implement configuration validation logic
- [ ] 5.8 Implement configuration versioning
- [ ] 5.9 Create REST API endpoints for configuration management
- [ ] 5.10 Add unit tests for configuration management

## 11. Integration with Existing Systems

- [ ] 6.1 Integrate brain with LLM service using database configuration
- [ ] 6.2 Integrate brain with memory system using database configuration
- [ ] 6.3 Integrate brain with prompt system using database configuration
- [ ] 6.4 Integrate brain with skills system using database configuration
- [ ] 6.5 Integrate brain with MCP configuration from database
- [ ] 6.6 Implement configuration loading on brain initialization
- [ ] 6.7 Add integration tests

## 12. Task Planning Updates

- [ ] 6.1 Update `TaskPlanner` to work with brain (if needed)
- [ ] 6.2 Update task planning flow to use brain orchestrator
- [ ] 6.3 Add iterative planning support
- [ ] 6.4 Update task validation to work with feedback loop

## 13. API and Service Updates

- [ ] 7.1 Update `MentisAgentService` to use `MentisBrain` instead of direct execution
- [ ] 7.2 Update REST API endpoints if needed
- [ ] 7.3 Update SSE streaming to support feedback loop updates
- [ ] 7.4 Add API documentation

## 14. Testing and Validation

- [ ] 8.1 Write unit tests for all new components
- [ ] 8.2 Write integration tests for brain-executor interaction
- [ ] 8.3 Write end-to-end tests for complete task execution flow
- [ ] 8.4 Test error scenarios and recovery
- [ ] 8.5 Test feedback loop with various execution results
- [ ] 8.6 Performance testing for feedback loop overhead

## 15. Documentation

- [ ] 9.1 Document brain architecture and design decisions
- [ ] 9.2 Document instruction format and execution flow
- [ ] 9.3 Document feedback loop mechanism
- [ ] 9.4 Update API documentation
- [ ] 9.5 Create migration guide for existing code

## 16. Cleanup

- [ ] 10.1 Remove old planning logic from ExecutionEngine
- [ ] 10.2 Deprecate old interfaces (if any)
- [ ] 10.3 Update code comments and JavaDoc
- [ ] 10.4 Remove unused code
