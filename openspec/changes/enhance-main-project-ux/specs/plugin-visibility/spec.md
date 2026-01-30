# Plugin Visibility Specification Delta

## ADDED Requirements

### Requirement: Plugin Hide Button
The system SHALL provide a hide button above each plugin in the real world screen, allowing users to hide plugins to the right sidebar.

#### Scenario: Hide button display
- **WHEN** a plugin is displayed in the real world screen
- **THEN** a hide button is displayed above the plugin container
- **AND** the button uses an icon (e.g., eye-slash icon)
- **AND** the button is visible in both PC and mobile views
- **AND** the button has appropriate size for touch interaction on mobile

#### Scenario: Hide button interaction
- **WHEN** user clicks the hide button
- **THEN** the plugin is hidden with a smooth animation
- **AND** the plugin moves to the right sidebar
- **AND** the plugin state is saved (local storage or backend)
- **AND** the hide button is no longer visible

### Requirement: Plugin Hidden State
The system SHALL maintain the hidden state of plugins and display them in a narrow clickable area in the right sidebar.

#### Scenario: Hidden plugin display
- **WHEN** a plugin is hidden
- **THEN** it is displayed in the right sidebar as a narrow clickable area
- **AND** the area shows a plugin identifier (icon or name)
- **AND** the area is wide enough for touch interaction
- **AND** the area is visually distinct from other UI elements

#### Scenario: Hidden state persistence
- **WHEN** a plugin is hidden
- **THEN** the hidden state is saved to local storage or backend
- **AND** the state persists across page reloads
- **AND** the state is user-specific

### Requirement: Plugin Restore Functionality
The system SHALL provide a way to restore hidden plugins from the right sidebar.

#### Scenario: Restore button display
- **WHEN** a plugin is hidden in the right sidebar
- **THEN** a restore button or clickable area is displayed
- **AND** the button is clearly visible and accessible
- **AND** the button works on both PC and mobile

#### Scenario: Restore interaction
- **WHEN** user clicks the restore button or area
- **THEN** the plugin is restored with a smooth animation
- **AND** the plugin returns to its original position
- **AND** the hidden state is updated
- **AND** the plugin becomes fully functional again

### Requirement: Multiple Plugin Management
The system SHALL support hiding and restoring multiple plugins independently.

#### Scenario: Multiple hidden plugins
- **WHEN** multiple plugins are hidden
- **THEN** all hidden plugins are displayed in the right sidebar
- **AND** each plugin has its own restore button
- **AND** plugins can be restored independently
- **AND** the sidebar layout accommodates multiple hidden plugins

#### Scenario: Plugin state independence
- **WHEN** user hides or restores one plugin
- **THEN** other plugins are not affected
- **AND** each plugin maintains its own hidden state
- **AND** plugin positions are preserved when restored

## MODIFIED Requirements

### Requirement: Real World Screen Plugin Display
The real world screen SHALL support plugin visibility management, allowing users to hide plugins to the right sidebar.

#### Scenario: Plugin container with hide functionality
- **WHEN** plugins are displayed in the real world screen
- **THEN** each plugin container has a hide button above it
- **AND** plugins can be hidden to the right sidebar
- **AND** hidden plugins can be restored
- **AND** the functionality works on both PC and mobile
