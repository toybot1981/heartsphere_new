## ADDED Requirements

### Requirement: Dynamic Task List Display
The system SHALL automatically display task list in the left sidebar when tasks are created through task decomposition.

#### Scenario: Task list appears after decomposition
- **WHEN** the AI decomposes a user request into tasks
- **THEN** a task list section automatically appears in the left sidebar
- **AND** the task list shows all tasks with their status (pending, in_progress, completed, failed)
- **AND** tasks are displayed in execution order
- **AND** the task list is collapsible/expandable

#### Scenario: Task list updates in real-time
- **WHEN** a task step starts, progresses, or completes
- **THEN** the task list in the sidebar updates in real-time
- **AND** task status indicators (icons, colors) update automatically
- **AND** progress bars update automatically
- **AND** completed tasks are visually distinct from pending tasks

#### Scenario: Task list hidden when no tasks
- **WHEN** a session has no tasks (pure conversation)
- **THEN** the task list section is hidden in the left sidebar
- **AND** the sidebar shows only navigation menu and project list
- **AND** when tasks are created, the task list section appears automatically

### Requirement: Task Item Display
The system SHALL display individual task items in the task list with clear status and progress indicators.

#### Scenario: Display task item with status
- **WHEN** a task exists in the session
- **THEN** the task item displays task title/description
- **AND** it displays status icon (pending, in_progress, completed, failed)
- **AND** it displays progress indicator (progress bar or percentage)
- **AND** it displays execution time (if applicable)

#### Scenario: Task item shows step count
- **WHEN** a task contains multiple steps
- **THEN** the task item displays step count (e.g., "3/5 steps completed")
- **AND** the step count updates in real-time as steps complete
- **AND** users can click to expand and see individual steps

#### Scenario: Highlight active task
- **WHEN** a task is currently being executed
- **THEN** the task item is highlighted (e.g., different background color or border)
- **AND** a "执行中" (Executing) indicator is shown
- **AND** the highlighting updates as execution moves to different tasks

### Requirement: Task Detail View
The system SHALL provide a detailed view of task execution when a task is selected.

#### Scenario: Display task detail when clicked
- **WHEN** a user clicks on a task in the task list
- **THEN** the main content area (or right panel) displays task detail view
- **AND** the task detail view shows task description, steps, progress, and execution log
- **AND** the view updates in real-time as task execution progresses

#### Scenario: Task detail shows execution steps
- **WHEN** a task detail view is displayed
- **THEN** it shows all execution steps in order
- **AND** each step displays step number, description, status, and result
- **AND** completed steps are visually distinct (checkmark, grayed out)
- **AND** current step is highlighted
- **AND** pending steps are shown but disabled

#### Scenario: Task detail shows execution log
- **WHEN** a task detail view is displayed
- **THEN** it shows execution log with tool calls and results
- **AND** the log is scrollable and shows chronological entries
- **AND** log entries include timestamp, tool name, parameters, and result
- **AND** errors are highlighted in red or distinct color

#### Scenario: Task detail shows progress summary
- **WHEN** a task detail view is displayed
- **THEN** it shows overall progress (e.g., "4/6 steps completed, 67%")
- **AND** it shows estimated time remaining (if available)
- **AND** it shows task start time and elapsed time
- **AND** progress updates in real-time

### Requirement: Task Progress Visualization
The system SHALL provide visual progress indicators for tasks.

#### Scenario: Display progress bar for task
- **WHEN** a task is in progress
- **THEN** a progress bar is displayed in the task item
- **AND** the progress bar shows completion percentage
- **AND** the progress bar updates in real-time
- **AND** the progress bar uses color coding (green for completed, blue for in progress, red for failed)

#### Scenario: Display step-by-step progress
- **WHEN** a task contains multiple steps
- **THEN** step indicators are displayed (e.g., numbered circles or checkboxes)
- **AND** completed steps show checkmark
- **AND** current step shows active indicator (spinner or highlight)
- **AND** pending steps show empty or grayed indicator

#### Scenario: Display task completion status
- **WHEN** a task completes (successfully or with error)
- **THEN** the task item shows completion status (success checkmark or error icon)
- **AND** the task detail view shows final result summary
- **AND** completion time is displayed
- **AND** users can view execution log for details

### Requirement: Task List Integration with Conversation
The system SHALL integrate task list display with conversation flow.

#### Scenario: Task creation notification in conversation
- **WHEN** tasks are created through task decomposition
- **THEN** a system message is added to the conversation
- **AND** the message indicates that tasks have been created (e.g., "已创建 5 个任务步骤")
- **AND** users can click the message to view task list

#### Scenario: Task completion notification in conversation
- **WHEN** all tasks in a session complete
- **THEN** a system message is added to the conversation
- **AND** the message summarizes task completion (e.g., "所有任务已完成")
- **AND** users can click the message to view task details

#### Scenario: Task error notification in conversation
- **WHEN** a task fails
- **THEN** an error message is added to the conversation
- **AND** the message describes the error and suggests recovery actions
- **AND** users can click the message to view error details in task view

### Requirement: Task List Persistence
The system SHALL persist task list state across sessions.

#### Scenario: Save task list state
- **WHEN** tasks are created or updated
- **THEN** task list state is saved to the backend
- **AND** task state includes task definitions, step status, progress, and execution log
- **AND** task state is associated with the session

#### Scenario: Restore task list on session load
- **WHEN** a user opens a session with existing tasks
- **THEN** the task list is restored from saved state
- **AND** task status and progress are restored
- **AND** if tasks were in progress, execution can resume (if supported by backend)
