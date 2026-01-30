# Resource Management Capability

## ADDED Requirements

### Requirement: Minimalist Resources for Daily Life Assistant Scenario
The system SHALL provide minimalist-style image resources for the Daily Life Assistant scenario and its 6 characters.

#### Scenario: Add era resource
- **WHEN** the migration script is executed
- **THEN** the script SHALL:
  - Insert a minimalist-style image resource for "日常生活助手" era
  - Use category 'era'
  - Include minimalist design description and prompt
  - Update the system_eras table to reference the new resource URL

#### Scenario: Add character avatar resources
- **WHEN** the migration script is executed
- **THEN** the script SHALL:
  - Insert 6 minimalist-style avatar resources, one for each character:
    - 时小光 (Time Management Mentor)
    - 康小健 (Health Life Consultant)
    - 学小知 (Learning Growth Mentor)
  - 心小暖 (Emotional Companion)
  - 心小安 (Mental Health Guardian)
  - 暖小阳 (Emotional Companion Partner)
  - Use category 'character' or appropriate category
  - Include minimalist design description and prompt
  - Update the system_characters table to reference the new avatar URLs

#### Scenario: Add character background resources
- **WHEN** the migration script is executed
- **THEN** the script SHALL:
  - Insert 6 minimalist-style background resources, one for each character's scene:
    - 效率工作室 (Efficiency Studio) for 时小光
    - 健康生活馆 (Wellness Center) for 康小健
    - 智慧书房 (Wisdom Study) for 学小知
    - 温暖小屋 (Cozy Corner) for 心小暖
    - 心理健康中心 (Mental Wellness Center) for 心小安
    - 阳光客厅 (Sunny Living Room) for 暖小阳
  - Use category 'character' or appropriate category
  - Include minimalist design description and prompt
  - Update the system_characters table to reference the new background URLs

#### Scenario: Minimalist design requirements
- **WHEN** resources are created
- **THEN** all resources SHALL:
  - Follow minimalist design principles (clean lines, simple shapes, minimal decoration)
  - Use clean color schemes (light colors, soft tones)
  - Prioritize functionality and clarity
  - Convey modern and professional aesthetics
  - Match the character's personality and scene description
