# Conversation UI Specification Delta

## ADDED Requirements

### Requirement: Task Progress Panel Display
The conversation view SHALL display a collapsible task progress panel above the message input area. The panel SHALL show a list of tasks associated with the current session, including their status and progress.

#### Scenario: Panel visibility toggle
- **WHEN** user views the conversation
- **THEN** a collapsible task progress panel is displayed above the message input
- **AND** the panel can be expanded or collapsed via a toggle button
- **AND** the panel state persists during the session

#### Scenario: Task list display
- **WHEN** tasks exist for the current session
- **THEN** the panel displays a list of tasks with their descriptions
- **AND** each task shows its current status (PENDING, RUNNING, COMPLETED, FAILED)
- **AND** tasks are ordered by creation time (newest first or oldest first)

#### Scenario: Real-time task status updates
- **WHEN** a task status changes (e.g., PENDING → RUNNING → COMPLETED)
- **THEN** the task list updates in real-time without page refresh
- **AND** the status badge reflects the current state
- **AND** completed tasks are visually marked with strikethrough styling

#### Scenario: Task completion visual indicator
- **WHEN** a task status changes to COMPLETED
- **THEN** the task description text is displayed with strikethrough styling
- **AND** the task status badge shows "COMPLETED"
- **AND** the task item may use muted colors to indicate completion

#### Scenario: Empty state
- **WHEN** no tasks exist for the current session
- **THEN** the panel displays an empty state message
- **OR** the panel is automatically collapsed

#### Scenario: New task creation
- **WHEN** a user sends a message that triggers task decomposition
- **THEN** new tasks appear in the task progress panel
- **AND** the panel automatically expands if collapsed
- **AND** tasks are added to the list in real-time

### Requirement: Task Progress Panel Integration
The task progress panel SHALL be integrated into the ConversationView component and SHALL receive real-time updates via the existing SSE infrastructure.

#### Scenario: Component integration
- **WHEN** ConversationView renders
- **THEN** TaskProgressPanel is rendered above MessageInput
- **AND** TaskProgressPanel receives sessionId as a prop
- **AND** TaskProgressPanel subscribes to real-time task updates

#### Scenario: Real-time update subscription
- **WHEN** TaskProgressPanel mounts
- **THEN** it subscribes to task-related SSE events for the current session
- **AND** it updates the task list when receiving `task_created` events
- **AND** it updates task status when receiving `task_status_changed` events
- **AND** it handles connection errors gracefully

## MODIFIED Requirements

### Requirement: Conversation View Layout
The conversation view SHALL display messages, task progress, and message input in a vertical layout. The task progress panel SHALL be positioned between the message list and the message input area.

#### Scenario: Layout structure
- **WHEN** user views the conversation
- **THEN** the layout displays MessageListManus at the top
- **AND** TaskProgressPanel is displayed below the message list
- **AND** MessageInput is displayed at the bottom
- **AND** all components are contained within ConversationView
