# Task Execution Capability

## ADDED Requirements

### Requirement: AgentScope-Enhanced Task Decomposition
The system SHALL use AgentScope multi-agent capabilities to decompose complex user tasks into executable sub-tasks.

#### Scenario: Decompose complex task
- **WHEN** a user requests a complex task (e.g., "收集北京旅游信息和最新资讯，然后编写详细的旅行行程规划文档")
- **THEN** the system uses AgentScope multi-agent collaboration to decompose the task into multiple executable steps
- **AND** each step has a clear description, task type, and execution order
- **AND** dependencies between steps are identified and respected

#### Scenario: Task decomposition with multiple agents
- **WHEN** task decomposition is requested
- **THEN** multiple AgentScope agents collaborate (planner, executor, validator)
- **AND** the decomposition result is validated and optimized
- **AND** the result includes step dependencies and execution order

### Requirement: Virtual Machine Task Execution
The system SHALL execute task steps in isolated virtual machines, supporting command execution, script execution, and GUI operations.

#### Scenario: Execute command in VM
- **WHEN** a task step requires command execution
- **THEN** the system creates or retrieves a VM for the session
- **AND** executes the command in the VM
- **AND** returns the execution result (stdout, stderr, exit code)

#### Scenario: Execute script in VM
- **WHEN** a task step requires script execution (Python, JavaScript, etc.)
- **THEN** the system executes the script in the VM
- **AND** captures script output and errors
- **AND** returns execution results

#### Scenario: Perform GUI operation in VM
- **WHEN** a task step requires GUI operation (e.g., browser automation)
- **THEN** the system performs the GUI action in the VM
- **AND** captures screenshots or screen state
- **AND** returns operation results

### Requirement: Real-time Task Progress Tracking
The system SHALL provide real-time task progress tracking, including step status, execution time, and VM screenshots.

#### Scenario: Track task execution progress
- **WHEN** a task is being executed
- **THEN** the system tracks the current step, total steps, and progress percentage
- **AND** updates step status (PENDING, RUNNING, COMPLETED, FAILED) in real-time
- **AND** records execution time for each step

#### Scenario: Provide VM screen preview
- **WHEN** a task is executing in a VM
- **THEN** the system captures VM screen screenshots periodically
- **AND** provides API endpoints to retrieve the latest screenshot
- **AND** supports real-time screen preview via SSE or polling

#### Scenario: Query task execution status
- **WHEN** a client queries task execution status
- **THEN** the system returns current step, progress, and detailed status
- **AND** includes execution logs and error messages if available

### Requirement: Multi-Agent Task Collaboration
The system SHALL support multi-agent collaboration for task decomposition and execution using AgentScope.

#### Scenario: Multi-agent task decomposition
- **WHEN** a complex task requires decomposition
- **THEN** multiple AgentScope agents collaborate to analyze and decompose the task
- **AND** each agent contributes based on its role (planner, executor, validator)
- **AND** the final decomposition is a consensus result from all agents

#### Scenario: Agent role assignment
- **WHEN** task decomposition starts
- **THEN** the system assigns appropriate roles to agents (e.g., research agent, writing agent, validation agent)
- **AND** each agent processes its assigned part of the task
- **AND** results are aggregated and validated

### Requirement: Task Execution Logging
The system SHALL log all task execution activities, including step execution, VM operations, and agent interactions.

#### Scenario: Log task execution
- **WHEN** a task step is executed
- **THEN** the system logs the step details, execution time, and results
- **AND** logs VM operations (commands, scripts, GUI actions)
- **AND** logs agent interactions and decisions

#### Scenario: Query execution logs
- **WHEN** a client queries execution logs
- **THEN** the system returns logs filtered by task, step, or time range
- **AND** includes log levels (INFO, WARN, ERROR) and timestamps

### Requirement: Task Progress UI
The system SHALL provide a user interface to monitor task progress, similar to Manus interface, showing task steps, progress, and VM screen preview.

#### Scenario: Display task progress
- **WHEN** a user views task execution
- **THEN** the UI displays a task progress card showing current step (e.g., "1/3")
- **AND** shows a list of task steps with status indicators
- **AND** displays execution time for the current step

#### Scenario: Display VM screen preview
- **WHEN** a task is executing in a VM
- **THEN** the UI displays a VM screen preview card
- **AND** shows the current VM activity (e.g., "Manus 正在使用浏览器")
- **AND** provides controls to refresh the screen preview
- **AND** updates the preview periodically

#### Scenario: Task step details
- **WHEN** a user views a task step
- **THEN** the UI displays step description, status, and execution time
- **AND** shows execution logs if available
- **AND** displays step dependencies and order
