# EduCharacter Entity Specification

## ADDED Requirements

### Requirement: EduCharacter Entity Structure
The education platform SHALL have `EduCharacter` entity to represent digital human characters for educational purposes, with educational-specific attributes beyond the base Character concept.

#### Scenario: EduCharacter entity creation
- **WHEN** creating an education digital character
- **THEN** `EduCharacter` entity SHALL have basic character information (name, description, avatarUrl, bio)
- **AND** it SHALL have character type (teaching_assistant, learning_companion, counseling, homework_helper, subject_explainer)
- **AND** it SHALL have age group suitability (primary_6_12, secondary_13_18, or both)
- **AND** it SHALL have subject tags (math, chinese, english, science, physics, chemistry, biology, history, geography, etc.)
- **AND** it SHALL have teaching specialty description (TEXT)
- **AND** it SHALL have personality traits suitable for education (patient, encouraging, friendly, etc.)
- **AND** it SHALL have difficulty level (beginner, intermediate, advanced) for the subject
- **AND** it SHALL have language style (formal, casual, friendly) adapted to age group
- **AND** it SHALL store metadata (createdBy, createdAt, updatedAt, isEnabled)
- **AND** it SHALL have reference to Student who created it (optional, for student-created characters)
- **AND** it SHALL have reference to Teacher who created it (optional, for teacher-created characters)

#### Scenario: EduCharacter educational attributes
- **WHEN** querying an EduCharacter
- **THEN** it SHALL support filtering by character type
- **AND** it SHALL support filtering by age group suitability
- **AND** it SHALL support filtering by subject tags
- **AND** it SHALL support searching by name or description
- **AND** it SHALL support filtering by difficulty level

#### Scenario: EduCharacter usage tracking
- **WHEN** an EduCharacter is used for educational interaction
- **THEN** the system SHALL track usage statistics (total interactions, unique students, average rating)
- **AND** usage statistics SHALL be updated in real-time or near real-time
