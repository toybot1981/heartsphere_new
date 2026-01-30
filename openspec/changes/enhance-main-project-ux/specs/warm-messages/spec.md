# Warm Messages Specification Delta

## MODIFIED Requirements

### Requirement: Warm Message Display in ChatWindow
The ChatWindow component SHALL display only one warm message, removing any warm messages displayed above the main content area.

#### Scenario: Single warm message in ChatWindow
- **WHEN** user views the ChatWindow
- **THEN** only one warm message is displayed
- **AND** warm messages above the main content area are removed
- **AND** the warm message is displayed in the main content area
- **AND** the warm message is clearly visible and accessible

#### Scenario: Warm message removal from top
- **WHEN** ChatWindow renders
- **THEN** warm messages previously displayed at the top are not rendered
- **AND** the top area is used for other UI elements or left empty
- **AND** the removal does not affect other functionality

### Requirement: Warm Message Display in SharedChatWindow
The SharedChatWindow component SHALL display only one warm message, removing any warm messages displayed above the main content area.

#### Scenario: Single warm message in SharedChatWindow
- **WHEN** user views the SharedChatWindow
- **THEN** only one warm message is displayed
- **AND** warm messages above the main content area are removed
- **AND** the warm message is displayed in the main content area
- **AND** the warm message is clearly visible and accessible

#### Scenario: Warm message removal from top
- **WHEN** SharedChatWindow renders
- **THEN** warm messages previously displayed at the top are not rendered
- **AND** the top area is used for other UI elements or left empty
- **AND** the removal does not affect other functionality

### Requirement: Warm Message Consistency
All chat-related screens SHALL display at most one warm message per page.

#### Scenario: Warm message count validation
- **WHEN** any chat-related screen renders
- **THEN** at most one warm message is displayed
- **AND** multiple warm messages are consolidated or removed
- **AND** the warm message is displayed in an appropriate location
- **AND** the warm message works on both PC and mobile

## REMOVED Requirements

### Requirement: Multiple Warm Messages in Chat Windows
The system SHALL NOT display multiple warm messages in ChatWindow or SharedChatWindow components.

#### Scenario: No duplicate warm messages
- **WHEN** ChatWindow or SharedChatWindow renders
- **THEN** only one warm message is displayed
- **AND** any additional warm messages are removed
- **AND** the removal does not break functionality
