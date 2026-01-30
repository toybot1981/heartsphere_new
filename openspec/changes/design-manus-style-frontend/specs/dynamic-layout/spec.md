## ADDED Requirements

### Requirement: Dynamic Layout Based on Session Content
The system SHALL dynamically adjust layout and displayed components based on session content and execution state.

#### Scenario: Layout adapts to session content
- **WHEN** a session contains only messages (pure conversation)
- **THEN** the layout shows only conversation view in main content area
- **AND** task list is hidden in left sidebar
- **AND** virtual computer view is not displayed
- **WHEN** tasks are created through decomposition
- **THEN** task list automatically appears in left sidebar
- **AND** task view becomes available in main content area
- **WHEN** virtual computer is required for execution
- **THEN** virtual computer is created automatically
- **AND** VM view becomes available in main content area

#### Scenario: Multiple views available simultaneously
- **WHEN** a session contains messages, tasks, and virtual computer
- **THEN** users can switch between conversation, task, and VM views
- **AND** all views are accessible via tabs or navigation
- **AND** users can view multiple panels simultaneously (e.g., conversation + task detail in right panel)

#### Scenario: Layout updates in real-time
- **WHEN** session content changes (tasks created, VM created)
- **THEN** layout updates automatically without page refresh
- **AND** new components appear smoothly (fade-in or slide-in animation)
- **AND** users are notified of new content (e.g., "任务列表已更新")

### Requirement: Intelligent View Switching
The system SHALL intelligently switch views based on tool execution environment and user context.

#### Scenario: Auto-switch to task view when task starts
- **WHEN** task execution begins
- **THEN** the system can automatically switch to task view (if user preference allows)
- **AND** task detail is displayed showing current step
- **AND** users can switch back to conversation view if needed

#### Scenario: Auto-switch to VM view when VM operations occur
- **WHEN** virtual computer operations begin (commands executed, screen updates)
- **THEN** the system can automatically switch to VM view (if user preference allows)
- **AND** VM terminal or screen is displayed showing current activity
- **AND** users can switch back to conversation view if needed

#### Scenario: Smart view selection based on activity
- **WHEN** AI is thinking or generating response
- **THEN** conversation view is shown (most relevant)
- **WHEN** tasks are actively executing
- **THEN** task view or VM view is shown (depending on which is more active)
- **WHEN** user sends a new message
- **THEN** conversation view is shown automatically

### Requirement: Responsive Layout Design
The system SHALL provide responsive layout that adapts to different screen sizes.

#### Scenario: Desktop layout (large screens)
- **WHEN** screen width is >= 1024px
- **THEN** three-column layout is displayed (left sidebar + main + right panel)
- **AND** all panels are visible simultaneously
- **AND** panels can be resized by dragging borders

#### Scenario: Tablet layout (medium screens)
- **WHEN** screen width is 768px - 1023px
- **THEN** two-column layout is displayed (collapsible left sidebar + main)
- **AND** right panel is hidden or accessible via toggle
- **AND** left sidebar can be collapsed to show only icons

#### Scenario: Mobile layout (small screens)
- **WHEN** screen width is < 768px
- **THEN** single-column layout is displayed
- **AND** left sidebar is hidden by default (accessible via hamburger menu)
- **AND** main content area takes full width
- **AND** right panel is hidden (accessible via bottom sheet or modal)

### Requirement: View State Persistence
The system SHALL persist user's view preferences and restore them on session load.

#### Scenario: Save view preferences
- **WHEN** a user switches views or adjusts layout
- **THEN** view preferences are saved (current view, panel visibility, panel sizes)
- **AND** preferences are saved per session or globally (user choice)
- **AND** preferences are saved to local storage or backend

#### Scenario: Restore view preferences
- **WHEN** a user opens a session
- **THEN** view preferences are restored
- **AND** layout is restored to last known state
- **AND** if session content changed, layout adapts but preserves user preferences where possible

### Requirement: Smooth Transitions
The system SHALL provide smooth transitions when switching between views or updating layout.

#### Scenario: Animate view transitions
- **WHEN** a user switches between views (conversation, task, VM)
- **THEN** transition is animated (fade, slide, or similar)
- **AND** transition duration is short (< 300ms) to feel responsive
- **AND** transition does not block user interaction

#### Scenario: Animate component appearance
- **WHEN** new components appear (task list, VM view)
- **THEN** components fade in or slide in smoothly
- **AND** animation draws attention without being distracting
- **AND** animation duration is appropriate (< 500ms)

#### Scenario: Animate layout changes
- **WHEN** layout adjusts (panels resize, sidebar collapses)
- **THEN** layout changes are animated smoothly
- **AND** content does not jump or flicker
- **AND** animations are performant (60fps)

### Requirement: Context-Aware Display
The system SHALL display relevant information based on current context and user focus.

#### Scenario: Highlight relevant content
- **WHEN** a task step is executing
- **THEN** the corresponding task item in sidebar is highlighted
- **AND** if task view is open, the current step is highlighted
- **AND** if VM view is open, relevant terminal output is highlighted

#### Scenario: Show related information
- **WHEN** a user views a message mentioning a task
- **THEN** related task can be highlighted in sidebar
- **AND** users can click to jump to task view
- **WHEN** a user views a message mentioning VM operation
- **THEN** VM view can be highlighted or made accessible
- **AND** users can click to jump to VM view

#### Scenario: Contextual actions
- **WHEN** a user right-clicks on a task item
- **THEN** contextual menu appears with relevant actions (view details, cancel, retry)
- **WHEN** a user right-clicks on VM view
- **THEN** contextual menu appears with VM actions (reset, pause, screenshot)
