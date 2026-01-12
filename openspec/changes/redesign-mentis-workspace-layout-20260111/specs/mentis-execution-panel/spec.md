## ADDED Requirements

### Requirement: Execution Panel Component
The system SHALL provide a unified execution panel component that displays VM screen, task list, and execution logs.

#### Scenario: Execution panel tabs
- **WHEN** the execution panel is displayed
- **THEN** the system SHALL show tabs for "VM 屏幕" (VM Screen), "任务" (Tasks), and "日志" (Logs)
- **AND** the system SHALL allow users to switch between tabs
- **AND** the system SHALL remember the selected tab

#### Scenario: VM screen tab
- **WHEN** a user selects the VM screen tab
- **THEN** the system SHALL display the VM screen viewer
- **AND** the system SHALL show the current VM status
- **AND** the system SHALL allow users to interact with the VM (if applicable)

#### Scenario: Tasks tab
- **WHEN** a user selects the tasks tab
- **THEN** the system SHALL display the task list for the current session
- **AND** the system SHALL show task status, progress, and details
- **AND** the system SHALL allow users to view task details

#### Scenario: Logs tab
- **WHEN** a user selects the logs tab
- **THEN** the system SHALL display the execution logs for the current session
- **AND** the system SHALL show log entries with timestamps and levels
- **AND** the system SHALL allow users to filter and search logs

### Requirement: Execution Status Indicator
The system SHALL display the current execution status in the execution panel.

#### Scenario: Execution status display
- **WHEN** a task or VM operation is in progress
- **THEN** the system SHALL display an execution status indicator
- **AND** the system SHALL show the current operation and progress
- **AND** the system SHALL provide visual feedback (spinner, progress bar, etc.)

#### Scenario: Execution status updates
- **WHEN** the execution status changes
- **THEN** the system SHALL update the status indicator in real-time
- **AND** the system SHALL notify users of status changes (if significant)

### Requirement: Execution Panel Controls
The system SHALL provide controls for managing the execution panel.

#### Scenario: Panel controls
- **WHEN** the execution panel is displayed
- **THEN** the system SHALL provide a close button to hide the panel
- **AND** the system SHALL provide a minimize button to collapse the panel
- **AND** the system SHALL provide a maximize button to expand the panel
- **AND** the system SHALL provide an independent view button to open in a separate window

#### Scenario: Panel state persistence
- **WHEN** a user changes the execution panel state (open/closed, minimized/maximized)
- **THEN** the system SHALL save the state to localStorage
- **AND** the system SHALL restore the state on next visit

### Requirement: Execution Panel Standalone View
The system SHALL support viewing the execution panel in a standalone window or route.

#### Scenario: Independent execution window
- **WHEN** a user clicks the independent view button
- **THEN** the system SHALL open the execution panel in a new route (`/mentis/workspace/:sessionId/execution`)
- **AND** the system SHALL display the execution panel in full-screen mode
- **AND** the system SHALL provide a button to return to the workspace

#### Scenario: Execution panel full-screen mode
- **WHEN** a user clicks the full-screen button
- **THEN** the system SHALL display the execution panel in full-screen mode
- **AND** the system SHALL hide other UI elements
- **AND** the system SHALL provide a button to exit full-screen mode

#### Scenario: Execution panel modal mode
- **WHEN** a user clicks the modal button (optional)
- **THEN** the system SHALL display the execution panel in a modal dialog
- **AND** the system SHALL allow users to interact with the panel while keeping the workspace visible
- **AND** the system SHALL provide a button to close the modal

#### Scenario: State synchronization
- **WHEN** the execution panel is displayed in standalone mode
- **THEN** the system SHALL synchronize state with the main workspace
- **AND** the system SHALL reflect changes made in either view
- **AND** the system SHALL handle concurrent updates gracefully
