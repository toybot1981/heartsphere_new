# Character Interaction Spec Delta

## MODIFIED Requirements

### Requirement: Guest Character Interaction

Character interaction for guest users **SHALL** be limited to hardcoded system preset characters only. Guest users **SHALL NOT** have personal character associations.

#### Scenario: Guest Character Selection
1. Guest user navigates to character selection screen
2. Frontend calls `GET /api/characters` (or character list endpoint)
3. Backend detects user is guest (Trial membership)
4. **Backend returns hardcoded preset characters** (ID: 315-320), **NOT user's personal characters**
5. System shows only:
   - 时小光 (ID: 315, Time Management Mentor)
   - 康小健 (ID: 316, Health Life Consultant)
   - 学小知 (ID: 317, Learning Growth Mentor)
   - 心小暖 (ID: 318, Emotional Companion)
   - 心小安 (ID: 319, Mental Health Guardian)
   - 暖小阳 (ID: 320, Emotional Companion Partner)
6. User can select and chat with any of these 6 characters
7. **Guest user does NOT own these characters** (they are system presets)

#### Scenario: Guest Conversation Flow
1. Guest user selects a pre-configured character
2. User sends message
3. System checks token balance (Trial: 10,000 text tokens)
4. If tokens available:
   - Process message
   - Generate AI response
   - Deduct tokens
   - Save conversation (for upgrade migration)
   - Do NOT generate memories (guest restriction)
5. If tokens exhausted:
   - Return error and suggest registration

### Requirement: Guest Default Scene

Guest users **SHALL** use hardcoded system preset scene. Guest users **SHALL NOT** have personal scene associations.

#### Scenario: Guest Scene Access
1. Guest user logs in
2. Frontend calls `GET /api/eras` (or era list endpoint)
3. Backend detects user is guest (Trial membership)
4. **Backend returns hardcoded preset era** (ID: 50, "日常生活助手"), **NOT user's personal eras**
5. User's current scene is automatically set to this preset scene
6. User cannot change to other scenes
7. **Guest user does NOT own this scene** (it is a system preset)
