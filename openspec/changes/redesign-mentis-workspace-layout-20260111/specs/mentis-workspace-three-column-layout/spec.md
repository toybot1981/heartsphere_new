## ADDED Requirements

### Requirement: Three-Column Layout Structure
The system SHALL provide a three-column layout for the workspace, with left sidebar, center content area, and right execution panel.

#### Scenario: Three-column layout display
- **WHEN** a user accesses the Mentis workspace
- **THEN** the system SHALL display a three-column layout
- **AND** the system SHALL show the session list in the left sidebar
- **AND** the system SHALL show the chat window in the center area
- **AND** the system SHALL show the execution panel in the right sidebar (if enabled)

#### Scenario: Column widths and proportions
- **WHEN** the workspace is displayed on a desktop screen
- **THEN** the system SHALL allocate approximately 300px for the left sidebar
- **AND** the system SHALL allocate the remaining space for the center area (with priority)
- **AND** the system SHALL allocate approximately 400px for the right execution panel (when visible)
- **AND** the system SHALL maintain minimum widths for each column to ensure usability

#### Scenario: Responsive layout adaptation
- **WHEN** the screen width is below a threshold (e.g., 1024px)
- **THEN** the system SHALL adapt to a two-column layout
- **AND** the system SHALL allow collapsing the left sidebar
- **AND** the system SHALL maintain the center and right columns

#### Scenario: Mobile layout
- **WHEN** the screen width is below a mobile threshold (e.g., 768px)
- **THEN** the system SHALL display a single-column layout
- **AND** the system SHALL provide tabs or navigation to switch between views
- **AND** the system SHALL allow users to access all functionality

### Requirement: Left Sidebar (Session List)
The system SHALL display the session list in the left sidebar.

#### Scenario: Session list display
- **WHEN** the workspace is displayed
- **THEN** the system SHALL show the session list in the left sidebar
- **AND** the system SHALL maintain all existing session list functionality (search, create, delete, etc.)
- **AND** the system SHALL highlight the currently active session

#### Scenario: Sidebar collapse
- **WHEN** a user clicks the sidebar collapse button
- **THEN** the system SHALL hide the sidebar
- **AND** the system SHALL expand the center area to fill the space
- **AND** the system SHALL provide a button to restore the sidebar

### Requirement: Center Area (Chat Window)
The system SHALL display the chat window as the primary content in the center area.

#### Scenario: Chat window as primary content
- **WHEN** a session is selected
- **THEN** the system SHALL display the chat window in the center area
- **AND** the system SHALL make the center area the primary focus
- **AND** the system SHALL allocate the majority of available space to the center area

#### Scenario: Center area layout
- **WHEN** the chat window is displayed
- **THEN** the system SHALL show the message history at the top
- **AND** the system SHALL show the input area at the bottom
- **AND** the system SHALL optimize the layout for conversation flow

### Requirement: Right Sidebar (Execution Panel)
The system SHALL display the execution panel in the right sidebar, showing VM screen, tasks, and logs.

#### Scenario: Execution panel display
- **WHEN** the execution panel is enabled
- **THEN** the system SHALL display the execution panel in the right sidebar
- **AND** the system SHALL show tabs for VM screen, task list, and execution logs
- **AND** the system SHALL allow users to switch between tabs

#### Scenario: Execution panel visibility
- **WHEN** a user toggles the execution panel
- **THEN** the system SHALL show or hide the execution panel
- **AND** the system SHALL adjust the center area width accordingly
- **AND** the system SHALL remember the user's preference
