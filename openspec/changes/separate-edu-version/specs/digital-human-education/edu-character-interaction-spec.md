# EduCharacterInteraction Entity Specification

## ADDED Requirements

### Requirement: EduCharacterInteraction Entity Structure
The education platform SHALL have `EduCharacterInteraction` entity to record interactions between students and digital human characters.

#### Scenario: EduCharacterInteraction recording
- **WHEN** a student interacts with an EduCharacter
- **THEN** `EduCharacterInteraction` entity SHALL record the interaction type (teaching_dialogue, homework_help, counseling, knowledge_explanation, practice_exercise)
- **AND** it SHALL store the student ID who initiated the interaction
- **AND** it SHALL store the EduCharacter ID involved
- **AND** it SHALL store the interaction start time and end time
- **AND** it SHALL store the total duration in minutes
- **AND** it SHALL store the conversation content (TEXT, for learning analysis)
- **AND** it SHALL store the learning topics/knowledge points discussed (JSON array)
- **AND** it SHALL store the student's comprehension level (not_understood, partially_understood, well_understood, mastered)
- **AND** it SHALL store the student's rating (1-5 stars, optional)
- **AND** it SHALL store the student's feedback (TEXT, optional)
- **AND** it SHALL store metadata (createdAt, updatedAt)

#### Scenario: EduCharacterInteraction analysis
- **WHEN** querying student learning history
- **THEN** the system SHALL return interactions grouped by EduCharacter
- **AND** it SHALL calculate total learning time per character
- **AND** it SHALL calculate average comprehension level per character
- **AND** it SHALL identify learning topics covered
- **AND** it SHALL support filtering by interaction type
- **AND** it SHALL support filtering by date range

#### Scenario: EduCharacterInteraction statistics
- **WHEN** generating learning analytics
- **THEN** the system SHALL aggregate interactions by subject
- **AND** it SHALL calculate learning progress over time
- **AND** it SHALL identify areas needing improvement based on comprehension levels
- **AND** it SHALL provide recommendations based on interaction patterns
