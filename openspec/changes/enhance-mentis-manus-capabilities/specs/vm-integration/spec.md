# VM Integration Specification Delta

## ADDED Requirements

### Requirement: VM-Conversation Real-time Association
Virtual machines SHALL be associated with conversations and provide real-time status updates through Server-Sent Events (SSE).

#### Scenario: VM status updates via SSE
- **WHEN** a VM's status changes (starting, running, stopped, error)
- **THEN** the system SHALL send an SSE event to the frontend
- **AND** the frontend SHALL update the VM status indicator immediately

#### Scenario: VM screen real-time viewing
- **WHEN** a user views the VM screen in a conversation
- **THEN** the system SHALL provide real-time screen updates
- **AND** updates SHALL be sent via SSE or polling at configurable intervals (default 3 seconds)

### Requirement: VM Status Indicator
The conversation view SHALL display a VM status indicator showing the current VM state.

#### Scenario: Display VM status indicator
- **WHEN** a conversation has an associated VM
- **THEN** the UI SHALL display a VM status indicator
- **AND** the indicator SHALL show one of: "未创建" (Not Created), "启动中" (Starting), "运行中" (Running), "已暂停" (Paused), "错误" (Error)

#### Scenario: VM status changes update indicator
- **WHEN** the VM status changes
- **THEN** the status indicator SHALL update immediately
- **AND** the indicator color SHALL change accordingly (green for running, yellow for paused, red for error)

### Requirement: VM Screen Viewer in Conversation
The conversation view SHALL include a VM screen viewer that displays the VM's current screen state.

#### Scenario: Display VM screen in conversation
- **WHEN** a conversation has an active VM
- **THEN** the conversation view SHALL display the VM screen
- **AND** the screen SHALL update automatically at configured intervals

#### Scenario: VM screen refresh on demand
- **WHEN** a user clicks the refresh button
- **THEN** the system SHALL immediately fetch and display the latest VM screen
- **AND** the refresh SHALL not interrupt automatic updates

## MODIFIED Requirements

### Requirement: VM Management
VM management SHALL be enhanced to provide real-time updates and better integration with conversations.

#### Scenario: VM creation triggers status update
- **WHEN** a VM is created for a conversation
- **THEN** the system SHALL send an SSE event with VM status "starting"
- **AND** when the VM is ready, send another event with status "running"

#### Scenario: VM operations send real-time updates
- **WHEN** a VM is paused, resumed, or destroyed
- **THEN** the system SHALL send SSE events immediately
- **AND** the frontend SHALL update the UI accordingly
