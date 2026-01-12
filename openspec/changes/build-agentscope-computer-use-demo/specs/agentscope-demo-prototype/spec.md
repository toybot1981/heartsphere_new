# Spec: AgentScope Computer-Use Demo Prototype

## ADDED Requirements

### Requirement: REQ-DEMO-001 - 工具调用日志记录

The system SHALL record all tool calls made by AgentScope Agent for monitoring and demonstration purposes.

#### Scenario: REQ-DEMO-001-SCENARIO-1 - Record tool call start
Given a tool call is initiated by an AgentScope Agent
When the tool execution begins
Then the system SHALL create a ToolCallLog entry with status PENDING
And the log entry SHALL include sessionId, toolName, parameters, and startTime

#### Scenario: REQ-DEMO-001-SCENARIO-2 - Record tool call completion
Given a tool call is in progress
When the tool execution completes successfully
Then the system SHALL update the ToolCallLog entry with status SUCCESS
And the log entry SHALL include result, endTime, and duration

#### Scenario: REQ-DEMO-001-SCENARIO-3 - Record tool call error
Given a tool call is in progress
When the tool execution fails with an error
Then the system SHALL update the ToolCallLog entry with status ERROR
And the log entry SHALL include errorMessage, endTime, and duration

#### Scenario: REQ-DEMO-001-SCENARIO-4 - Query tool call logs
Given tool call logs exist in the system
When a client requests tool call logs with filters (sessionId, toolName, time range)
Then the system SHALL return matching ToolCallLog entries
And the results SHALL be paginated if the number exceeds a threshold

### Requirement: REQ-DEMO-002 - 实时工具调用监控

The system SHALL provide real-time updates of tool call status to connected clients.

#### Scenario: REQ-DEMO-002-SCENARIO-1 - Push tool call start event
Given a client is connected via WebSocket
When a tool call starts
Then the system SHALL push a tool_call_start event to all connected clients
And the event SHALL include sessionId, toolName, and parameters

#### Scenario: REQ-DEMO-002-SCENARIO-2 - Push tool call end event
Given a client is connected via WebSocket
When a tool call completes
Then the system SHALL push a tool_call_end event to all connected clients
And the event SHALL include sessionId, toolName, result, and duration

#### Scenario: REQ-DEMO-002-SCENARIO-3 - WebSocket reconnection
Given a client's WebSocket connection is lost
When the client reconnects
Then the system SHALL restore the connection
And the client SHALL receive any missed events that occurred during disconnection

### Requirement: REQ-DEMO-003 - 客户端演示界面

The system SHALL provide a client-facing demo interface that displays AgentScope Agent interactions and tool calls.

#### Scenario: REQ-DEMO-003-SCENARIO-1 - Display chat interface
Given a user accesses the client demo interface
When the page loads
Then the system SHALL display a chat interface
And the interface SHALL include a message input area and message history area

#### Scenario: REQ-DEMO-003-SCENARIO-2 - Display tool call monitor
Given a user is in the client demo interface
When a tool call occurs
Then the system SHALL display the tool call in a monitoring panel
And the tool call SHALL show its status (pending, running, success, error)
And the tool call SHALL be clickable to view details

#### Scenario: REQ-DEMO-003-SCENARIO-3 - Display VM status
Given a user has an active session
When the user views the client demo interface
Then the system SHALL display the current VM status for that session
And the VM status SHALL include VM ID, status, and creation time

#### Scenario: REQ-DEMO-003-SCENARIO-4 - Stream agent responses
Given a user sends a message to the AgentScope Agent
When the agent generates a streaming response
Then the system SHALL display the response in real-time as it streams
And the system SHALL highlight any tool calls within the response

### Requirement: REQ-DEMO-004 - 管理端演示界面

The system SHALL provide an admin-facing demo interface for monitoring and managing the demo environment.

#### Scenario: REQ-DEMO-004-SCENARIO-1 - Display tool call monitoring panel
Given an admin accesses the admin demo interface
When the admin navigates to the tool call monitoring panel
Then the system SHALL display a list of all tool calls
And the list SHALL support filtering by sessionId, toolName, and time range
And the list SHALL show statistics (total calls, success rate, average duration)

#### Scenario: REQ-DEMO-004-SCENARIO-2 - Display VM management panel
Given an admin accesses the admin demo interface
When the admin navigates to the VM management panel
Then the system SHALL display a list of all active VMs
And the list SHALL show VM status, session ID, and creation time
And the admin SHALL be able to create, view, and delete VMs

#### Scenario: REQ-DEMO-004-SCENARIO-3 - Display session management panel
Given an admin accesses the admin demo interface
When the admin navigates to the session management panel
Then the system SHALL display a list of all active sessions
And the list SHALL show session ID, VM binding, and last activity time
And the admin SHALL be able to view session details and create demo sessions

#### Scenario: REQ-DEMO-004-SCENARIO-4 - Display performance monitoring panel
Given an admin accesses the admin demo interface
When the admin navigates to the performance monitoring panel
Then the system SHALL display performance metrics and charts
And the metrics SHALL include tool call performance (average duration, success rate)
And the charts SHALL show trends over time

### Requirement: REQ-DEMO-005 - 演示场景管理

The system SHALL provide predefined demo scenarios that users can select and run.

#### Scenario: REQ-DEMO-005-SCENARIO-1 - List demo scenarios
Given a user accesses the client demo interface
When the user views the scenario selector
Then the system SHALL display a list of available demo scenarios
And each scenario SHALL show a name, description, and category

#### Scenario: REQ-DEMO-005-SCENARIO-2 - Select and load scenario
Given a user views the demo scenarios
When the user selects a scenario
Then the system SHALL populate the chat input with the example conversation
And the user SHALL be able to send the message to start the demo

#### Scenario: REQ-DEMO-005-SCENARIO-3 - Scenario categories
Given demo scenarios exist in multiple categories
When a user views the scenario selector
Then the system SHALL organize scenarios by category (command execution, script execution, GUI operations, VM lifecycle)
And the user SHALL be able to filter scenarios by category

### Requirement: REQ-DEMO-006 - 性能监控和统计

The system SHALL collect and display performance metrics for the demo environment.

#### Scenario: REQ-DEMO-006-SCENARIO-1 - Tool call performance metrics
Given tool calls have been executed
When an admin views the performance monitoring panel
Then the system SHALL display metrics including:
- Average tool call duration
- Tool call success rate
- Tool call count per tool type
- Tool call time distribution

#### Scenario: REQ-DEMO-006-SCENARIO-2 - Performance charts
Given performance data exists
When an admin views the performance monitoring panel
Then the system SHALL display charts showing:
- Tool call duration trends over time
- Success/failure rate trends
- Tool usage distribution

### Requirement: REQ-DEMO-007 - 演示环境隔离

The system SHALL ensure the demo environment is isolated from production systems.

#### Scenario: REQ-DEMO-007-SCENARIO-1 - Demo environment isolation
Given the demo prototype is running
When demo operations are performed
Then the system SHALL ensure demo operations do not affect production systems
And demo data SHALL be stored separately from production data

#### Scenario: REQ-DEMO-007-SCENARIO-2 - Admin access control
Given a user attempts to access the admin demo interface
When the user is not an administrator
Then the system SHALL deny access
And the system SHALL redirect to an appropriate page
