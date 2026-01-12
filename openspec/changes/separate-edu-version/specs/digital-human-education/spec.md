# Digital Human Education Application Specification

## ADDED Requirements

### Requirement: Education Digital Character Entity
The education platform SHALL have `EduCharacter` entity to represent digital human characters for educational purposes.

#### Scenario: EduCharacter entity structure
- **WHEN** creating an education digital character
- **THEN** `EduCharacter` entity SHALL have basic character information (name, avatar, description)
- **AND** it SHALL have character type (teaching_assistant, learning_companion, counseling, homework_helper, subject_explainer)
- **AND** it SHALL have age group suitability (primary_6_12, secondary_13_18, or both)
- **AND** it SHALL have subject tags (math, chinese, english, science, etc.)
- **AND** it SHALL have teaching specialty description
- **AND** it SHALL store creation metadata (created_by, created_at, updated_at)

#### Scenario: EduCharacter database table
- **WHEN** database migration runs
- **THEN** `edu_characters` table SHALL be created
- **AND** table SHALL have columns: id, name, avatar_url, description, character_type, age_group, subject_tags (JSON), specialty, created_by, created_at, updated_at, deleted_at
- **AND** table SHALL have indexes on character_type, age_group, and created_by
- **AND** table SHALL support soft delete

### Requirement: Digital Character Interaction Record
The education platform SHALL record interactions between students and digital characters.

#### Scenario: EduCharacterInteraction entity structure
- **WHEN** a student interacts with a digital character
- **THEN** `EduCharacterInteraction` entity SHALL record interaction type (teaching_dialogue, homework_guidance, counseling, knowledge_explanation)
- **AND** it SHALL record student ID and character ID
- **AND** it SHALL record interaction content (conversation messages)
- **AND** it SHALL record learning topics/knowledge points covered
- **AND** it SHALL record interaction duration
- **AND** it SHALL record understanding level assessment (if applicable)
- **AND** it SHALL store interaction metadata (created_at, updated_at)

#### Scenario: EduCharacterInteraction database table
- **WHEN** database migration runs
- **THEN** `edu_character_interactions` table SHALL be created
- **AND** table SHALL have columns: id, student_id, character_id, interaction_type, content (JSON/TEXT), learning_topics (JSON), duration_seconds, understanding_level, created_at, updated_at
- **AND** table SHALL have foreign key constraints on student_id and character_id
- **AND** table SHALL have indexes on student_id, character_id, interaction_type, and created_at

### Requirement: Digital Human Service
The education platform SHALL provide `DigitalHumanService` for managing digital characters and interactions.

#### Scenario: Create education digital character
- **WHEN** creating a new education digital character
- **THEN** `DigitalHumanService.createCharacter()` SHALL accept character information
- **AND** it SHALL validate character type, age group, and subject tags
- **AND** it SHALL create `EduCharacter` entity
- **AND** it SHALL save to database
- **AND** it SHALL return created character with ID

#### Scenario: Get digital characters by criteria
- **WHEN** requesting digital characters
- **THEN** `DigitalHumanService.getCharacters()` SHALL support filtering by character type
- **AND** it SHALL support filtering by age group
- **AND** it SHALL support filtering by subject tags
- **AND** it SHALL support pagination
- **AND** it SHALL return list of matching `EduCharacter` entities

#### Scenario: Recommend digital characters for student
- **WHEN** requesting character recommendations for a student
- **THEN** `DigitalHumanService.recommendCharacters()` SHALL accept student ID
- **AND** it SHALL retrieve student's age and interests/preferences
- **AND** it SHALL match characters based on age group suitability
- **AND** it SHALL match characters based on student's subject interests
- **AND** it SHALL consider student's previous interaction history (prefer characters student interacted well with)
- **AND** it SHALL return ordered list of recommended characters

#### Scenario: Record character interaction
- **WHEN** student completes interaction with digital character
- **THEN** `DigitalHumanService.recordInteraction()` SHALL accept interaction details
- **AND** it SHALL validate student ID and character ID exist
- **AND** it SHALL create `EduCharacterInteraction` entity
- **AND** it SHALL save interaction content and learning topics
- **AND** it SHALL calculate and save interaction duration
- **AND** it SHALL return created interaction record

#### Scenario: Get student interaction history
- **WHEN** requesting student's interaction history
- **THEN** `DigitalHumanService.getStudentInteractions()` SHALL accept student ID
- **AND** it SHALL support filtering by character ID
- **AND** it SHALL support filtering by interaction type
- **AND** it SHALL support filtering by date range
- **AND** it SHALL support pagination
- **AND** it SHALL return list of `EduCharacterInteraction` entities ordered by created_at desc

### Requirement: Digital Character API Endpoints
The education backend SHALL provide REST API endpoints for digital character management.

#### Scenario: Create character API
- **WHEN** POST request to `/api/edu/characters`
- **THEN** API SHALL accept character creation request (DTO)
- **AND** it SHALL validate request data
- **AND** it SHALL call `DigitalHumanService.createCharacter()`
- **AND** it SHALL return created character data
- **AND** it SHALL require authentication and appropriate permissions

#### Scenario: List characters API
- **WHEN** GET request to `/api/edu/characters`
- **THEN** API SHALL accept query parameters: type, age_group, subject, page, size
- **AND** it SHALL call `DigitalHumanService.getCharacters()` with filters
- **AND** it SHALL return paginated list of characters
- **AND** it SHALL be accessible to authenticated users

#### Scenario: Get character recommendations API
- **WHEN** GET request to `/api/edu/characters/recommendations`
- **THEN** API SHALL accept student_id as query parameter
- **AND** it SHALL call `DigitalHumanService.recommendCharacters()` for the student
- **AND** it SHALL return ordered list of recommended characters
- **AND** it SHALL require student authentication or appropriate permissions

#### Scenario: Record interaction API
- **WHEN** POST request to `/api/edu/character-interactions`
- **THEN** API SHALL accept interaction data (DTO)
- **AND** it SHALL validate request data
- **AND** it SHALL call `DigitalHumanService.recordInteraction()`
- **AND** it SHALL return created interaction record
- **AND** it SHALL require student authentication

#### Scenario: Get interaction history API
- **WHEN** GET request to `/api/edu/character-interactions`
- **THEN** API SHALL accept query parameters: student_id, character_id, type, start_date, end_date, page, size
- **AND** it SHALL call `DigitalHumanService.getStudentInteractions()` with filters
- **AND** it SHALL return paginated list of interactions
- **AND** it SHALL require authentication (students can only see their own, teachers/parents can see their students')

### Requirement: Age-Based Content Filtering
The education platform SHALL automatically filter and recommend digital characters based on student age.

#### Scenario: Primary school character filtering
- **WHEN** a student aged 6-12 requests digital characters
- **THEN** system SHALL only return characters with age_group including "primary_6_12"
- **AND** character content SHALL be appropriate for primary school level
- **AND** complex subjects SHALL be simplified or excluded

#### Scenario: Secondary school character filtering
- **WHEN** a student aged 13-18 requests digital characters
- **THEN** system SHALL only return characters with age_group including "secondary_13_18"
- **AND** character content SHALL be appropriate for secondary school level
- **AND** advanced subjects SHALL be available

### Requirement: Learning Progress Tracking
The education platform SHALL track student learning progress through digital character interactions.

#### Scenario: Record learning progress
- **WHEN** student interacts with digital character for learning
- **THEN** system SHALL record learning topics covered in the interaction
- **AND** system SHALL update student's learning progress for those topics
- **AND** progress SHALL be stored with topic ID, understanding level, and timestamp

#### Scenario: Get learning progress
- **WHEN** requesting student's learning progress
- **THEN** system SHALL return progress by subject/topic
- **AND** it SHALL show topics covered, understanding levels, and last interaction time
- **AND** it SHALL support filtering by subject and date range

### Requirement: Digital Character Frontend Components
The education frontend SHALL provide components for digital character interaction.

#### Scenario: Character list display
- **WHEN** student views available digital characters
- **THEN** `DigitalCharacterList` component SHALL display character cards
- **AND** each card SHALL show character avatar, name, type, and subject tags
- **AND** cards SHALL be filterable by type and subject
- **AND** clicking a card SHALL navigate to character detail page

#### Scenario: Character recommendation display
- **WHEN** student views recommended characters
- **THEN** `CharacterRecommendation` component SHALL display recommended characters
- **AND** recommendations SHALL be ordered by relevance
- **AND** component SHALL show recommendation reason (e.g., "Matches your interests", "Popular for your age")
- **AND** student SHALL be able to start interaction from recommendation view

#### Scenario: Interaction history display
- **WHEN** student views interaction history
- **THEN** `InteractionHistory` component SHALL display past interactions
- **AND** interactions SHALL be grouped by character or date
- **AND** component SHALL show interaction type, duration, and topics covered
- **AND** student SHALL be able to view detailed interaction content
- **AND** component SHALL support filtering and pagination

#### Scenario: Learning progress visualization
- **WHEN** student views learning progress
- **THEN** `LearningProgress` component SHALL display progress by subject
- **AND** it SHALL show topics covered and understanding levels
- **AND** it SHALL visualize progress using charts or progress bars
- **AND** it SHALL show recent learning activities

### Requirement: Parent Access to Digital Character Interactions
Parents SHALL be able to view their children's digital character interaction records.

#### Scenario: Parent views child's interactions
- **WHEN** parent requests child's interaction history
- **THEN** system SHALL verify parent-child relationship
- **AND** parent SHALL see all interactions of their child
- **AND** parent SHALL see interaction type, character, duration, and topics covered
- **AND** parent SHALL see summary statistics (total interactions, favorite characters, subjects studied)

#### Scenario: Parent views learning progress
- **WHEN** parent requests child's learning progress
- **THEN** system SHALL verify parent-child relationship
- **AND** parent SHALL see child's progress by subject
- **AND** parent SHALL see topics covered and understanding levels
- **AND** parent SHALL see time spent on each subject
