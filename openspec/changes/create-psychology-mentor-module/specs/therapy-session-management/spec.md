## ADDED Requirements

### Requirement: Therapy Session Management
The system SHALL provide comprehensive therapy session management including pre-session assessment, real-time conversation, and session summarization.

#### Scenario: Session creation with pre-assessment
- **WHEN** a user wants to start a therapy session
- **THEN** the system collects pre-session assessment information:
- **AND** mood score (1-10)
- **AND** stress level (1-10)
- **AND** sleep quality (1-10)
- **AND** primary concern (text description)
- **AND** therapy goals (list of goals)
- **AND** selected therapy method
- **AND** previous therapy history (if applicable)
- **AND** the system creates a therapy session with a unique session ID
- **AND** the system stores the assessment information

#### Scenario: Real-time conversation
- **WHEN** a user sends a message during a therapy session
- **THEN** the system processes the message through the AI therapist
- **AND** the system maintains conversation context
- **AND** the system provides a response from the therapist
- **AND** the system supports streaming responses (SSE or WebSocket)
- **AND** the system stores all messages in the session

#### Scenario: Session summarization
- **WHEN** a therapy session ends
- **THEN** the system automatically generates a session summary
- **AND** the summary includes key issues identified
- **AND** the summary includes learned techniques
- **AND** the summary includes recommendations for next session
- **AND** the summary is stored with the session record

#### Scenario: Session history retrieval
- **WHEN** a user requests session history
- **THEN** the system returns all sessions for the user
- **AND** each session includes session ID, therapy method, start time, end time, and status
- **AND** the system allows retrieving detailed session information including all messages

### Requirement: Psychology Fact Extraction
The system SHALL automatically extract psychological facts from conversations, including emotion patterns, cognitive distortions, and coping strategies.

#### Scenario: Emotion pattern identification
- **WHEN** a user converses with the therapist
- **THEN** the system identifies emotions mentioned (anxiety, depression, anger, fear, sadness, etc.)
- **AND** the system records emotion triggers
- **AND** the system tracks emotion intensity and frequency
- **AND** the system creates an emotional profile over time

#### Scenario: Cognitive distortion identification
- **WHEN** the system analyzes user messages
- **THEN** it identifies cognitive distortions from 12 types:
- **AND** catastrophizing, black-and-white thinking, overgeneralization, mental filter
- **AND** disqualifying the positive, mind reading, fortune telling, magnification/minimization
- **AND** emotional reasoning, should statements, labeling, etc.
- **AND** the system records identified distortions with context

#### Scenario: Coping strategy identification
- **WHEN** the system analyzes user messages
- **THEN** it identifies coping strategies (both positive and negative)
- **AND** positive strategies: exercise, meditation, social support
- **AND** negative strategies: avoidance, procrastination, withdrawal
- **AND** the system records strategies for therapeutic analysis

#### Scenario: Trigger factor identification
- **WHEN** the system analyzes user messages
- **THEN** it identifies trigger factors (work stress, exams, social situations, conflicts, criticism, rejection, etc.)
- **AND** the system records triggers with context
- **AND** the system builds a trigger profile for the user

### Requirement: User Profile Management
The system SHALL maintain and update user psychological profiles based on therapy sessions and extracted facts.

#### Scenario: Profile creation
- **WHEN** a user starts their first therapy session
- **THEN** the system creates a user profile
- **AND** the profile includes basic information (age, occupation, marital status, education, family situation)
- **AND** the profile is stored in long-term memory (MongoDB)

#### Scenario: Profile updates
- **WHEN** new psychological facts are extracted from sessions
- **THEN** the system updates the user profile
- **AND** emotion patterns are updated
- **AND** cognitive distortions are recorded
- **AND** coping strategies are tracked
- **AND** trigger factors are identified

#### Scenario: Profile retrieval
- **WHEN** a therapist needs user context
- **THEN** the system retrieves the user profile from long-term memory
- **AND** the profile provides comprehensive psychological information
- **AND** the profile informs therapeutic interventions

### Requirement: Therapy Recommendation
The system SHALL intelligently recommend therapy methods based on user concerns and psychological profile.

#### Scenario: Therapy recommendation based on concern
- **WHEN** a user provides their primary concern
- **THEN** the system analyzes the concern
- **AND** the system matches the concern with appropriate therapy methods
- **AND** the system returns recommended therapy methods ranked by relevance
- **AND** each recommendation includes rationale

#### Scenario: Therapy recommendation based on profile
- **WHEN** a user has an existing psychological profile
- **THEN** the system considers the profile when recommending therapies
- **AND** the system matches identified issues (emotions, distortions, triggers) with therapy specializations
- **AND** the system provides personalized recommendations

#### Scenario: Multi-therapy recommendation
- **WHEN** a user's concerns span multiple areas
- **THEN** the system can recommend multiple therapy methods
- **AND** recommendations are ranked by priority
- **AND** the system explains why each therapy is recommended
