## ADDED Requirements

### Requirement: Daily Life Assistant Scene Resource
The system SHALL provide a "日常生活助手" (Daily Life Assistant) scene resource in the resource management system with minimalist style.

#### Scenario: Add daily life assistant scene
- **WHEN** the system initializes or administrator adds the daily life assistant scene
- **THEN** the scene is created in `system_eras` table with:
  - name: "日常生活助手"
  - description: Scene description matching the scene definition
  - style: "minimalist" (极简主义)
  - All data stored with UTF-8 encoding

### Requirement: Daily Life Assistant Character Resources
The system SHALL provide six character resources under the "日常生活助手" scene, each with minimalist style prompts.

#### Scenario: Add six characters with minimalist style
- **WHEN** the system initializes or administrator adds the daily life assistant characters
- **THEN** six characters are created in `system_characters` table:
  1. 时小光 - 时间管理导师 (Time Management Mentor)
  2. 康小健 - 健康生活顾问 (Healthy Lifestyle Advisor)
  3. 学小知 - 学习成长导师 (Learning and Growth Mentor)
  4. 心小暖 - 情绪陪伴师 (Emotion Companion)
  5. 心小安 - 心理健康守护者 (Mental Health Guardian)
  6. 暖小阳 - 情感陪伴伙伴 (Emotional Companion Partner)
- **AND** each character is associated with the "日常生活助手" scene
- **AND** all character data is stored with UTF-8 encoding

### Requirement: Minimalist Style Resource Prompts
The system SHALL provide resource prompts that match minimalist style and character/scene definitions.

#### Scenario: Scene resource prompt matches minimalist style
- **WHEN** the scene resource is created
- **THEN** the prompt in `system_resources` table:
  - Reflects minimalist design principles (clean lines, simple shapes, light colors)
  - Matches the "日常生活助手" scene definition
  - Uses English description for AI generation

#### Scenario: Character resource prompts match minimalist style
- **WHEN** character resources (avatars and backgrounds) are created
- **THEN** each prompt in `system_resources` table:
  - Reflects minimalist design principles
  - Matches the character's role and scene description
  - Uses English description for AI generation

### Requirement: UTF-8 Encoding for All Data
The system SHALL store all data with UTF-8 encoding to ensure proper display of Chinese characters.

#### Scenario: Database migration uses UTF-8 encoding
- **WHEN** the database migration script is executed
- **THEN** the script includes `SET NAMES utf8mb4;` at the beginning
- **AND** the script is executed with `--default-character-set=utf8mb4` flag
- **AND** all Chinese characters are correctly stored and displayed

#### Scenario: Character data displays correctly
- **WHEN** character data is retrieved from the database
- **THEN** all Chinese characters in name, description, bio, role, and other fields are correctly displayed
- **AND** no encoding issues or garbled characters appear
