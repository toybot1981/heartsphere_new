# Task Management Specification Delta

## ADDED Requirements

### Requirement: Task-Message Association
Tasks SHALL be associated with the user message that triggered their creation. Each task MUST have a `messageId` field that references the `MentisMessage` entity.

#### Scenario: Task creation with message association
- **WHEN** a user sends a message that triggers task decomposition
- **THEN** all tasks created from that message SHALL have their `messageId` set to the user message's `messageId`
- **AND** the association SHALL be persisted in the database

#### Scenario: Query tasks by message
- **WHEN** querying tasks for a session
- **THEN** the system SHALL support filtering tasks by `messageId`
- **AND** the query SHALL return tasks ordered by creation time ascending

### Requirement: Current Conversation Task List
The task list displayed in the conversation view SHALL only show tasks from the most recent user message (current conversation).

#### Scenario: Display only current conversation tasks
- **WHEN** a user views the task list in a conversation
- **THEN** the system SHALL only display tasks associated with the most recent user message
- **AND** tasks from previous conversations SHALL NOT be displayed

#### Scenario: New message clears previous tasks
- **WHEN** a user sends a new message
- **THEN** the task list SHALL be cleared
- **AND** only tasks from the new message SHALL be displayed

### Requirement: Checkmark Task Display
Tasks SHALL be displayed with checkmark indicators similar to Manus AI's design, showing completion status visually.

#### Scenario: Display task with checkmark
- **WHEN** a task is displayed in the task list
- **THEN** completed tasks SHALL show a green checkmark (✓)
- **AND** pending/running tasks SHALL show an empty circle or spinner
- **AND** failed tasks SHALL show a red X mark

#### Scenario: Task completion updates checkmark
- **WHEN** a task status changes from PENDING/RUNNING to COMPLETED
- **THEN** the checkmark SHALL update to a green checkmark immediately
- **AND** the task text SHALL be displayed with strikethrough styling

## MODIFIED Requirements

### Requirement: Task List Query
The task list query SHALL be modified to filter by the most recent user message's `messageId` instead of returning all tasks for a session.

#### Scenario: Query returns only current conversation tasks
- **WHEN** `getSessionTasks` is called for a session
- **THEN** the system SHALL find the most recent user message for that session
- **AND** return only tasks associated with that message's `messageId`
- **AND** return tasks ordered by creation time ascending

#### Scenario: No tasks for current conversation
- **WHEN** the current conversation has no tasks
- **THEN** the system SHALL return an empty list
- **AND** the UI SHALL display "暂无任务" (No tasks)
