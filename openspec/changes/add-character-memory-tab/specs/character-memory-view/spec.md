# Character Memory View Specification Delta

## ADDED Requirements

### Requirement: Character Memory Tab in Character Card
The system SHALL provide a memory tab in the character view/edit card that displays memories related to the current user for the selected character.

#### Scenario: Memory tab display
- **WHEN** user opens the character view/edit card
- **THEN** a memory tab is displayed alongside other tabs (e.g., skills tab)
- **AND** the tab is clearly labeled (e.g., "记忆" or "Memories")
- **AND** the tab is accessible on both PC and mobile platforms

#### Scenario: Memory tab activation
- **WHEN** user clicks on the memory tab
- **THEN** the memory tab content is displayed
- **AND** memories related to the current user for the selected character are loaded
- **AND** a loading indicator is shown while memories are being fetched

### Requirement: Memory Data Retrieval
The system SHALL retrieve memories for the selected character that are related to the current user.

#### Scenario: Memory retrieval by character
- **WHEN** the memory tab is activated
- **THEN** the system retrieves memories from the memory system
- **AND** memories are filtered by the selected character ID (via `metadata.characterId`)
- **AND** memories are filtered by the current user ID
- **AND** only memories related to the current user are displayed

#### Scenario: Memory retrieval error handling
- **WHEN** memory retrieval fails
- **THEN** an appropriate error message is displayed
- **AND** the user can retry the operation
- **AND** the error does not crash the character card interface

### Requirement: Memory List Display
The system SHALL display a list of memories with relevant information for each memory item.

#### Scenario: Memory list rendering
- **WHEN** memories are successfully retrieved
- **THEN** a list of memory items is displayed
- **AND** each memory item shows:
  - Memory content (main text)
  - Memory type (e.g., personal_info, emotional_experience)
  - Importance level (core, important, normal, temporary)
  - Timestamp (creation time and last used time)
  - Source (conversation, journal, behavior, etc.)
- **AND** memories are displayed in a readable and organized format

#### Scenario: Empty memory state
- **WHEN** no memories are found for the character and user
- **THEN** a friendly empty state message is displayed
- **AND** the message indicates that no memories exist yet
- **AND** the message is clear and helpful

### Requirement: Memory Item Details
The system SHALL provide detailed information for each memory item, with support for expanding and collapsing details.

#### Scenario: Memory item display
- **WHEN** a memory item is displayed
- **THEN** the memory content is clearly visible
- **AND** memory metadata (type, importance, timestamp, source) is displayed
- **AND** the information is organized in a clear hierarchy
- **AND** the display is responsive and works on both PC and mobile

#### Scenario: Memory item expansion
- **WHEN** user wants to see more details about a memory
- **THEN** the memory item can be expanded to show additional information
- **AND** expanded details include structured data (if available)
- **AND** the expansion/collapse interaction is smooth and intuitive


## MODIFIED Requirements

### Requirement: Character View/Edit Interface
The character view/edit interface SHALL include a memory tab that displays character memories related to the current user.

#### Scenario: Character card with memory tab
- **WHEN** user views or edits a character
- **THEN** the character card includes a memory tab
- **AND** the memory tab is accessible alongside other tabs (e.g., skills tab)
- **AND** the memory tab displays memories related to the current user for the selected character
- **AND** the memory tab works on both PC and mobile platforms
