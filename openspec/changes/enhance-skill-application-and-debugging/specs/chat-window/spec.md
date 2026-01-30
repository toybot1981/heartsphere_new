## ADDED Requirements

### Requirement: Skill Debugging Panel
The system SHALL display a skill debugging panel in the chat window alongside the memory debugging panel, showing real-time information about skill activation and execution during conversations.

**Description**: The skill debugging panel is a collapsible UI component that shows:
1. Current session's active skills (being evaluated or executed)
2. Detailed information about each skill (why activated, parameters, status, results)
3. Skill execution timeline
4. Success/failure indicators
5. Links to execution records for deeper investigation

The panel is designed for developers and power users to understand AI decision-making. It appears in the same area as the memory debugging panel, with tabs or side-by-side layout.

#### Scenario: Display skill debugging panel in chat window
- **WHEN** user opens a conversation
- **THEN** skill debugging panel is visible (collapsible, next to memory panel)
- **AND** panel shows title "Skill Activation" with icon
- **AND** panel displays current conversation's skill activation history

#### Scenario: Show skill activation details
- **WHEN** AI applies a skill during conversation
- **THEN** new entry appears in skill debugging panel with:
  - Skill name and icon
  - Activation reason (keywords matched, context matched, memory triggered, etc.)
  - Applicability score (displayed as percentage or visual indicator)
  - Execution status (pending/executing/completed/failed)
  - Execution timestamp and duration
  - Result summary (if applicable)

#### Scenario: View detailed skill execution parameters
- **WHEN** user clicks on a skill entry in debugging panel
- **THEN** detail view expands showing:
  - Skill ID and version
  - Complete activation rationale with matched keywords/contexts
  - Full execution parameters (JSON format)
  - Complete execution result or error message
  - Memory correlations (which facts influenced this decision)
  - Related conversation turns (user message that triggered skill)

#### Scenario: Filter skill debug entries
- **WHEN** user has many skill entries in debugging panel
- **THEN** user can filter by:
  - Skill status (all/active/completed/failed)
  - Skill category
  - Date/time range
  - Search by skill name

#### Scenario: Toggle debug panel visibility
- **WHEN** user clicks minimize/expand button on skill debugging panel
- **THEN** panel collapses or expands smoothly
- **AND** state is persisted for current session
- **AND** memory debugging panel layout adjusts accordingly

#### Scenario: Share skill debug information
- **WHEN** user encounters interesting or problematic skill behavior
- **THEN** user can export/copy debug information including:
  - Skill execution record
  - Conversation context
  - Memory correlations
  - Timestamps and execution trace

---

### Requirement: Transparent Skill Usage Indication in Responses
The system SHALL indicate which skills were used in generating each AI response and provide users with the reasoning.

**Description**: When AI generates a response after applying one or more skills, the response includes metadata indicating skill usage. Users can click/hover to see why each skill was applied and what parameters were used.

#### Scenario: Mark skill usage in AI response
- **WHEN** AI response is generated after skill application
- **THEN** response contains subtle visual indicator (badge, icon, or annotation) showing:
  - Number of skills applied (if any)
  - Skill names/icons used
  - Option to expand details

#### Scenario: View skill reasoning tooltip
- **WHEN** user hovers over or clicks skill usage indicator
- **THEN** tooltip or modal shows:
  - Skill name and brief description
  - Why this skill was selected (keywords matched, context relevance, etc.)
  - Skill execution result summary
  - Link to detailed debug information if needed

#### Scenario: Disable skill indication for regular users
- **WHEN** user is in production mode (not debug mode)
- **THEN** skill indication is hidden or minimized
- **AND** users can enable detailed view in preferences

---

### Requirement: Memory-Skill Correlation Visualization
The system SHALL display the relationship between memory system decisions and skill applications, showing how user history influences skill selection.

**Description**: The debug panel shows explicit links between skills that were applied and the memory/profile facts that influenced those decisions. This helps users understand the reasoning chain.

#### Scenario: Show memory facts contributing to skill decision
- **WHEN** user views detailed skill execution in debug panel
- **THEN** panel displays section showing:
  - Related memory facts that influenced skill selection (with links)
  - User profile attributes that matched skill criteria
  - Conversation history excerpts that triggered evaluation

#### Scenario: Link bidirectionally between memory and skill records
- **WHEN** user views a memory record in memory debugging panel
- **THEN** panel shows which skills were influenced by this memory
- **AND** user can navigate to those skill execution records

#### Scenario: Visualize skill-memory dependency chain
- **WHEN** user requests detailed reasoning for a skill application
- **THEN** system displays a visual dependency chain showing:
  - User message → keyword/context match → memory lookup → skill selection → skill execution
  - Each step with supporting data and confidence scores

---

### Requirement: Skill Debug Mode Toggle
The system SHALL allow users to enable/disable detailed skill debugging through user preferences or conversation settings.

#### Scenario: Toggle skill debugging in preferences
- **WHEN** user opens preferences/settings
- **THEN** debugging section shows toggle for "Show Skill Activation Debug Panel"
- **AND** user can enable/disable independently of memory debugging
- **AND** preference is persisted

#### Scenario: Enable per-conversation debugging override
- **WHEN** user opens a conversation
- **THEN** user can enable debugging for this conversation only via quick toggle
- **AND** this overrides user preference for current session

#### Scenario: Auto-enable debugging on skill error
- **WHEN** skill application fails or produces unexpected result
- **THEN** skill debug panel auto-enables and highlights failure entry
- **AND** user is notified that debugging information is available

