# Chat Memory Integration Specification

## ADDED Requirements

### Requirement: HSMem Memory Type Mapping
The system SHALL provide a mapping mechanism between hsmem memory types and Backend MemoryType enum values.

#### Scenario: Memory type conversion
- **WHEN** a memory is retrieved from hsmem with memory_type "preference"
- **THEN** it SHALL be converted to Backend MemoryType.PREFERENCE for internal processing

#### Scenario: Extended memory types support
- **WHEN** hsmem extracts a memory with type "event", "habit", "asset", or "work"
- **THEN** it SHALL be mapped to appropriate Backend MemoryType values (IMPORTANT_MOMENT, HABIT, PERSONAL_INFO, CONVERSATION_TOPIC)

### Requirement: Long-term Memory Retrieval in ChatWindow
The ChatWindow SHALL retrieve relevant long-term memories before generating AI responses.

#### Scenario: Retrieve memories before response generation
- **WHEN** a user sends a message in ChatWindow
- **THEN** the system SHALL retrieve up to 5 relevant long-term memories based on the user's input
- **AND** the memories SHALL be filtered by user_id and relevance score

#### Scenario: Memory retrieval failure handling
- **WHEN** memory retrieval fails or returns no results
- **THEN** the system SHALL continue with response generation without memories
- **AND** the failure SHALL be logged but not block the main conversation flow

### Requirement: Memory Injection into AI Context
The system SHALL inject retrieved long-term memories into the AI system prompt as context.

#### Scenario: Inject memories into system prompt
- **WHEN** relevant memories are retrieved for a user message
- **THEN** the memories SHALL be formatted and added to the system prompt
- **AND** the memories SHALL be organized by type (preference, habit, personal_info, etc.)
- **AND** the total memory context SHALL not exceed a configurable token limit

#### Scenario: Memory formatting for AI consumption
- **WHEN** memories are injected into the system prompt
- **THEN** each memory SHALL be formatted as: "Memory Type: [type] | Content: [summary]"
- **AND** memories SHALL be sorted by importance (core > important > normal)

### Requirement: Memory Type Auto-Identification
The system SHALL automatically identify memory types from conversation content.

#### Scenario: Identify preference memories
- **WHEN** a conversation contains keywords like "喜欢", "爱", "prefer", "like"
- **THEN** the extracted memory SHALL be classified as "preference" type

#### Scenario: Identify habit memories
- **WHEN** a conversation contains keywords like "每天", "经常", "习惯", "always"
- **THEN** the extracted memory SHALL be classified as "habit" type

#### Scenario: Identify event memories
- **WHEN** a conversation mentions specific dates, events, or milestones
- **THEN** the extracted memory SHALL be classified as "event" type (mapped to IMPORTANT_MOMENT)

#### Scenario: Identify asset memories
- **WHEN** a conversation mentions user assets, resources, or possessions
- **THEN** the extracted memory SHALL be classified as "asset" type (mapped to PERSONAL_INFO)

#### Scenario: Identify work memories
- **WHEN** a conversation mentions work, career, or professional information
- **THEN** the extracted memory SHALL be classified as "work" type (mapped to CONVERSATION_TOPIC)

### Requirement: Memory Extraction After Conversation
The system SHALL extract and save memories to hsmem after each conversation turn completes.

#### Scenario: Extract memories after AI response
- **WHEN** an AI response is generated and the conversation turn completes
- **THEN** the system SHALL extract memories from the conversation (user message + AI response)
- **AND** the extracted memories SHALL be saved to hsmem via the backend API
- **AND** the extraction SHALL include memory type, summary, and categories

#### Scenario: Memory extraction with agent context
- **WHEN** a conversation involves a specific character/agent
- **THEN** the extracted memories SHALL include agent_id in the metadata
- **AND** the memories SHALL be associated with the character for future retrieval

### Requirement: Short-term vs Long-term Memory Distinction
The system SHALL clearly distinguish between short-term memory (session context) and long-term memory (persistent user information).

#### Scenario: Short-term memory usage
- **WHEN** a conversation is in progress
- **THEN** the system SHALL use short-term memory (Redis) for session context
- **AND** short-term memory SHALL contain the last 20-50 messages for context window

#### Scenario: Long-term memory usage
- **WHEN** retrieving user information across sessions
- **THEN** the system SHALL use long-term memory (MySQL + hsmem)
- **AND** long-term memory SHALL contain user facts, preferences, habits, and important moments

#### Scenario: Memory consolidation
- **WHEN** important information is identified in short-term memory
- **THEN** the system SHALL consolidate it to long-term memory
- **AND** the consolidation SHALL happen automatically based on importance score

## MODIFIED Requirements

### Requirement: ChatWindow Memory Integration
The ChatWindow SHALL integrate both short-term and long-term memory systems for enhanced conversation quality.

#### Scenario: Unified memory retrieval
- **WHEN** generating an AI response
- **THEN** the system SHALL retrieve both short-term context (recent messages) and long-term memories (user preferences, habits)
- **AND** both memory types SHALL be combined in the system prompt

#### Scenario: Memory-aware response generation
- **WHEN** relevant long-term memories are available
- **THEN** the AI response SHALL reference and utilize these memories naturally
- **AND** the response SHALL demonstrate awareness of user preferences and history
