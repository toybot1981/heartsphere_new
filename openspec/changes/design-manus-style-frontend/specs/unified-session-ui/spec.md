## ADDED Requirements

### Requirement: Manus 风格布局结构
The system SHALL provide a three-column layout matching Manus AI's interface design.

#### Scenario: Display three-column layout
- **WHEN** a user opens the application
- **THEN** the interface displays a top bar, left sidebar, main content area, and optional right panel
- **AND** the layout matches Manus AI's visual design (white background, gray accents, modern styling)
- **AND** the layout is responsive and adapts to different screen sizes

#### Scenario: Top bar displays branding and actions
- **WHEN** a user views the top bar
- **THEN** it displays the application logo and name on the left
- **AND** it displays action buttons on the right (协作/Collaborate, 分享/Share, 设置/Settings, user avatar)
- **AND** the buttons are styled consistently with Manus's design

#### Scenario: Left sidebar displays navigation and context
- **WHEN** a user views the left sidebar
- **THEN** it displays navigation menu items (新建任务/New Task, 搜索/Search, 库/Library)
- **AND** it displays project list section with projects
- **AND** it displays task list section (dynamically shown when tasks exist)
- **AND** the sidebar is collapsible on small screens

### Requirement: Unified Session List
The system SHALL provide a unified session list in the left sidebar, displaying all user sessions.

#### Scenario: Display session list in sidebar
- **WHEN** a user views the left sidebar
- **THEN** it displays a list of all user sessions
- **AND** each session item shows session title, icon, and last update time
- **AND** the currently active session is highlighted
- **AND** sessions are sorted by last update time (most recent first)

#### Scenario: Select session from list
- **WHEN** a user clicks on a session in the list
- **THEN** the session becomes active
- **AND** the main content area displays the session content
- **AND** the session list updates to highlight the selected session
- **AND** the session content loads (messages, tasks, virtual computer state if applicable)

#### Scenario: Create new session
- **WHEN** a user clicks "新建任务" (New Task) in the navigation menu
- **THEN** a new session is created
- **AND** the new session is added to the session list
- **AND** the new session becomes active
- **AND** the main content area displays an empty conversation view

### Requirement: Main Content Area
The system SHALL provide a main content area that displays conversation, task details, or virtual computer interface based on session state.

#### Scenario: Display conversation view by default
- **WHEN** a session is active and contains only messages
- **THEN** the main content area displays the conversation view
- **AND** the conversation view shows message list and input area
- **AND** messages are displayed in chronological order
- **AND** the input area is at the bottom

#### Scenario: Display task view when tasks exist
- **WHEN** a session contains tasks (after task decomposition)
- **THEN** the main content area can display task detail view
- **AND** the task view shows task steps, progress, and execution log
- **AND** users can switch between conversation view and task view

#### Scenario: Display virtual computer view when VM is active
- **WHEN** a session requires virtual computer execution
- **THEN** the main content area can display virtual computer view
- **AND** the virtual computer view shows terminal and/or screen preview
- **AND** users can switch between conversation view and virtual computer view

### Requirement: Conversation Interface
The system SHALL provide a conversation interface for user-AI interaction.

#### Scenario: Display message list
- **WHEN** a user views the conversation interface
- **THEN** it displays all messages in the session
- **AND** user messages are displayed on the right (or distinct styling)
- **AND** AI messages are displayed on the left (or distinct styling)
- **AND** messages include timestamp and content
- **AND** the message list auto-scrolls to the latest message

#### Scenario: Display AI thinking process
- **WHEN** the AI is processing a request
- **THEN** the conversation interface displays "思考中" (Thinking) indicator
- **AND** intermediate thoughts are streamed and displayed in real-time
- **AND** the thinking process is shown in a distinct style (e.g., italic, gray text)

#### Scenario: Send message
- **WHEN** a user types a message and clicks send (or presses Enter)
- **THEN** the message is added to the message list immediately
- **AND** the message is sent to the backend API
- **AND** the input field is cleared
- **AND** a loading indicator is shown while waiting for response

#### Scenario: Input area supports multiple input types
- **WHEN** a user views the input area
- **THEN** it displays a text input field
- **AND** it displays icons for attachment (+), voice input (microphone), and send (arrow)
- **AND** users can attach files, use voice input, or type text
- **AND** all input methods send messages to the same conversation

### Requirement: Session State Management
The system SHALL manage session state uniformly, without distinguishing session types.

#### Scenario: Single session type
- **WHEN** a session is created
- **THEN** it uses a unified session model (no distinction between standard, task, or VM sessions)
- **AND** the session can contain messages, tasks, and virtual computer state
- **AND** the interface adapts based on session content, not session type

#### Scenario: Dynamic content display
- **WHEN** a session contains only messages
- **THEN** only the conversation view is displayed
- **WHEN** a session contains tasks (after decomposition)
- **THEN** the task list appears in the left sidebar, and task view becomes available
- **WHEN** a session requires virtual computer
- **THEN** the virtual computer is created automatically, and VM view becomes available

#### Scenario: Session persistence
- **WHEN** a user interacts with a session
- **THEN** session state is automatically saved
- **AND** session state includes messages, tasks, virtual computer state
- **AND** when the user returns, the session state is restored

### Requirement: Real-Time Updates
The system SHALL provide real-time updates for session content via WebSocket or SSE.

#### Scenario: Receive real-time message updates
- **WHEN** the AI generates a response
- **THEN** the response is streamed to the client in real-time
- **AND** the message appears in the conversation view as it is generated
- **AND** the message list auto-scrolls to show the latest content

#### Scenario: Receive real-time task updates
- **WHEN** a task step completes or updates
- **THEN** the task list in the sidebar updates in real-time
- **AND** the task detail view (if open) updates in real-time
- **AND** progress indicators update automatically

#### Scenario: Receive real-time VM updates
- **WHEN** virtual computer executes commands or updates screen
- **THEN** the VM terminal view updates in real-time
- **AND** the VM screen preview updates in real-time (if VNC is active)
- **AND** VM status indicators update automatically
