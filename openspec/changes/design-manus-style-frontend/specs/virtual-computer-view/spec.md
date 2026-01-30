## ADDED Requirements

### Requirement: Automatic Virtual Computer Creation
The system SHALL automatically create and display virtual computer interface when VM execution is required.

#### Scenario: VM created when tool requires it
- **WHEN** a tool execution requires virtual computer environment (e.g., terminal_exec, file operations)
- **THEN** a virtual computer is automatically created via E2B API
- **AND** the virtual computer view appears in the main content area
- **AND** the VM status is displayed (creating, ready, running)
- **AND** users are notified that VM is being created

#### Scenario: VM view appears automatically
- **WHEN** virtual computer is created
- **THEN** the virtual computer view becomes available in the main content area
- **AND** users can switch to VM view to see terminal and screen
- **AND** the VM view shows connection status and controls

#### Scenario: VM persists across session
- **WHEN** a virtual computer is created for a session
- **THEN** the VM persists for the session duration (up to 14 days)
- **AND** when user returns to the session, the VM is restored (if still active)
- **AND** VM state (files, processes) is preserved

### Requirement: Virtual Computer Terminal View
The system SHALL provide a terminal view showing real-time command execution in the virtual computer.

#### Scenario: Display terminal output
- **WHEN** commands are executed in the virtual computer
- **THEN** the terminal view displays command input and output in real-time
- **AND** commands are shown with prompt (e.g., `ubuntu@sandbox:~$`)
- **AND** output is displayed immediately after command execution
- **AND** terminal supports scrolling to view history

#### Scenario: Terminal shows execution status
- **WHEN** a command is being executed
- **THEN** the terminal displays "正在执行命令" (Executing command) indicator
- **AND** the command is highlighted or shown with spinner
- **AND** when command completes, output is displayed
- **AND** exit code is shown (if applicable)

#### Scenario: Terminal supports command history
- **WHEN** a user views the terminal
- **THEN** previous commands are visible in scrollable history
- **AND** users can scroll up to view past commands and outputs
- **AND** terminal auto-scrolls to latest output

### Requirement: Virtual Computer Screen Preview
The system SHALL provide a screen preview showing the virtual computer desktop.

#### Scenario: Display VNC screen preview
- **WHEN** virtual computer is active and VNC is available
- **THEN** the screen preview displays the virtual computer desktop in real-time
- **AND** the screen preview uses VNC connection (noVNC or similar)
- **AND** the screen preview is interactive (users can see mouse movements, window changes)
- **AND** the screen preview updates in real-time

#### Scenario: Display screenshot preview (fallback)
- **WHEN** VNC is not available or as fallback option
- **THEN** the screen preview displays periodic screenshots
- **AND** screenshots are updated at regular intervals (e.g., every 2-5 seconds)
- **AND** screenshots show current desktop state
- **AND** users can refresh to get latest screenshot

#### Scenario: Switch between terminal and screen view
- **WHEN** virtual computer view is displayed
- **THEN** users can switch between terminal view and screen preview
- **AND** both views can be displayed simultaneously (split view)
- **AND** switching is instant and preserves state

### Requirement: Virtual Computer Controls
The system SHALL provide controls for virtual computer management.

#### Scenario: Display VM control buttons
- **WHEN** virtual computer view is displayed
- **THEN** control buttons are available (重置/Reset, 暂停/Pause, 恢复/Resume, 销毁/Destroy)
- **AND** buttons are clearly labeled and styled consistently
- **AND** destructive actions (销毁) require confirmation

#### Scenario: Reset virtual computer
- **WHEN** a user clicks "重置" (Reset) button
- **THEN** a confirmation dialog is shown
- **AND** if confirmed, the virtual computer is reset to initial state
- **AND** VM state is cleared (files, processes reset)
- **AND** terminal and screen preview are cleared
- **AND** users are notified of reset completion

#### Scenario: Pause and resume virtual computer
- **WHEN** a user clicks "暂停" (Pause) button
- **THEN** the virtual computer is paused (execution stops)
- **AND** VM state is preserved
- **AND** terminal and screen preview show paused state
- **WHEN** a user clicks "恢复" (Resume) button
- **THEN** the virtual computer resumes from paused state
- **AND** execution continues from where it was paused

#### Scenario: Destroy virtual computer
- **WHEN** a user clicks "销毁" (Destroy) button
- **THEN** a confirmation dialog is shown with warning
- **AND** if confirmed, the virtual computer is destroyed
- **AND** all VM data is deleted
- **AND** VM view is removed from interface
- **AND** users are notified of destruction

### Requirement: Virtual Computer Status Display
The system SHALL display virtual computer status and resource usage.

#### Scenario: Display VM status
- **WHEN** virtual computer view is displayed
- **THEN** VM status is shown (creating, ready, running, paused, error)
- **AND** status is displayed with icon and text
- **AND** status updates in real-time

#### Scenario: Display VM resource usage
- **WHEN** virtual computer is running
- **THEN** resource usage is displayed (CPU, memory, disk usage)
- **AND** resource usage is shown as percentages or bars
- **AND** resource usage updates in real-time (if available from E2B)

#### Scenario: Display VM connection status
- **WHEN** virtual computer view is displayed
- **THEN** connection status is shown (connected, disconnected, reconnecting)
- **AND** connection status updates automatically
- **AND** if disconnected, reconnection is attempted automatically

### Requirement: Virtual Computer Integration with Conversation
The system SHALL integrate virtual computer operations with conversation flow.

#### Scenario: VM creation notification in conversation
- **WHEN** virtual computer is created
- **THEN** a system message is added to the conversation
- **AND** the message indicates that VM is being created (e.g., "正在创建虚拟机...")
- **AND** when VM is ready, message is updated (e.g., "虚拟机已就绪")

#### Scenario: VM operation notifications in conversation
- **WHEN** significant VM operations occur (reset, pause, resume, destroy)
- **THEN** system messages are added to the conversation
- **AND** messages describe the operation and result
- **AND** users can click messages to view VM details

#### Scenario: VM error notifications in conversation
- **WHEN** virtual computer encounters errors
- **THEN** error messages are added to the conversation
- **AND** messages describe the error and suggest recovery actions
- **AND** users can click messages to view error details in VM view

### Requirement: Virtual Computer View Persistence
The system SHALL persist virtual computer state and restore it when session is reopened.

#### Scenario: Save VM state
- **WHEN** virtual computer is active
- **THEN** VM state is saved (VM ID, connection info, last screenshot)
- **AND** VM state is associated with the session
- **AND** VM state is saved periodically or on session close

#### Scenario: Restore VM view on session load
- **WHEN** a user opens a session with active virtual computer
- **THEN** VM view is restored
- **AND** VM connection is re-established (if VM is still active)
- **AND** last known state is displayed
- **AND** if VM is no longer active, users are notified
