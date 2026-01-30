## ADDED Requirements

### Requirement: Psychology Knowledge Base
The system SHALL maintain a comprehensive psychology knowledge base including therapy theories, intervention techniques, clinical cases, and assessment tools.

#### Scenario: Knowledge base content coverage
- **WHEN** the knowledge base is queried
- **THEN** it contains information about five therapy approaches (CBT, DBT, ACT, Psychodynamic, Humanistic)
- **AND** it contains evidence-based intervention techniques
- **AND** it contains standardized assessment tools and scales
- **AND** it contains clinical case examples (17 cases)
- **AND** it contains therapy theory and academic knowledge

#### Scenario: Deep knowledge generation
- **WHEN** a user requests deep knowledge about a therapy topic
- **THEN** the system generates comprehensive academic content (1000+ words)
- **AND** the content includes theoretical origins and philosophical background
- **AND** the content includes neuroscience mechanisms
- **AND** the content includes practical applications
- **AND** the content is professionally written and academically sound

#### Scenario: Knowledge base organization
- **WHEN** knowledge is stored in the knowledge base
- **THEN** knowledge is organized by categories (therapy approach, intervention type, assessment type, etc.)
- **AND** knowledge is tagged with relevant metadata
- **AND** knowledge entries include source information and credibility indicators
- **AND** knowledge can be retrieved by category, tag, or content

### Requirement: Clinical Case Library
The system SHALL provide a library of 17 real clinical cases covering various psychological issues.

#### Scenario: Case library access
- **WHEN** a user requests clinical cases
- **THEN** the system returns available cases
- **AND** cases are organized by categories (intimate relationships, emotional disorders, workplace and self, anxiety disorders, family of origin, etc.)
- **AND** each case includes case ID, category, therapist, treatment duration, client information, main issues, techniques used, and treatment outcomes

#### Scenario: Case details retrieval
- **WHEN** a user requests details of a specific case
- **THEN** the system returns comprehensive case information:
- **AND** typical manifestations
- **AND** psychological origins
- **AND** treatment prescription
- **AND** recommended therapy methods
- **AND** difficulty level

#### Scenario: Case-based therapy recommendation
- **WHEN** a user's situation matches a clinical case
- **THEN** the system can recommend relevant cases for reference
- **AND** the system explains how the case relates to the user's situation
- **AND** the system provides insights from the case

### Requirement: Learning Pathway Management
The system SHALL provide structured learning pathways for each therapy method, consisting of 4 phases.

#### Scenario: Learning pathway structure
- **WHEN** a user selects a therapy method
- **THEN** the system provides a learning pathway with 4 phases
- **AND** each phase has a title, description, and duration (in weeks)
- **AND** phases are sequential and build upon each other
- **AND** the system tracks the user's progress through phases

#### Scenario: Phase content delivery
- **WHEN** a user is in a specific phase
- **THEN** the system delivers phase-appropriate content
- **AND** the system provides phase-specific interventions
- **AND** the system tracks phase completion
- **AND** the system advances to the next phase when appropriate

#### Scenario: Learning pathway customization
- **WHEN** a user's needs require adaptation
- **THEN** the system can adjust the learning pathway
- **AND** the system can extend or compress phase durations
- **AND** the system can provide additional support for challenging phases

### Requirement: Assessment Tools and Scales
The system SHALL provide standardized psychological assessment tools and scales for evaluation.

#### Scenario: Assessment tool availability
- **WHEN** assessment is needed
- **THEN** the system provides access to standardized scales:
- **AND** BDI-II (Beck Depression Inventory)
- **AND** GAD-7 (Generalized Anxiety Disorder)
- **AND** Y-BOCS (Yale-Brown Obsessive Compulsive Scale)
- **AND** other relevant assessment tools

#### Scenario: Assessment administration
- **WHEN** an assessment is administered
- **THEN** the system presents assessment questions
- **AND** the system collects user responses
- **AND** the system calculates assessment scores
- **AND** the system interprets results professionally

#### Scenario: Assessment result tracking
- **WHEN** assessments are completed over time
- **THEN** the system tracks assessment results
- **AND** the system shows progress or changes
- **AND** the system uses results to inform therapy recommendations

### Requirement: Memory System Integration
The system SHALL integrate with memory systems (Redis for short-term, MongoDB for long-term) to maintain conversation context and user profiles.

#### Scenario: Short-term memory (Redis)
- **WHEN** a therapy session is active
- **THEN** conversation context is stored in Redis
- **AND** the context includes recent messages and session state
- **AND** the context is used to maintain conversation continuity
- **AND** the context expires when the session ends

#### Scenario: Long-term memory (MongoDB)
- **WHEN** psychological facts are extracted
- **THEN** facts are stored in MongoDB as long-term memory
- **AND** facts include emotion patterns, cognitive distortions, coping strategies, triggers, and values
- **AND** facts are associated with user ID and timestamp
- **AND** facts can be retrieved for future sessions

#### Scenario: Memory retrieval for context
- **WHEN** a therapist needs user context
- **THEN** the system retrieves relevant information from both short-term and long-term memory
- **AND** the system combines memories to provide comprehensive context
- **AND** the context informs therapeutic responses
