# Access Control Spec Delta

## ADDED Requirements

### Requirement: Guest Feature Restrictions

Guest users **SHALL** be restricted from accessing certain features that require registered user status.

#### Scenario: Restricted Features for Guests
Guest users cannot access:
1. **Scene Creation**: Cannot create custom scenes/eras
2. **Character Creation**: Cannot create custom characters
3. **Shared Spaces**: Cannot access shared heart sphere features
4. **Journal Writing**: Cannot write journal entries
5. **Memory Viewing**: Cannot view memories (guests don't generate memories)
6. **Plugin Management**: Cannot install or manage plugins

#### Scenario: Feature Access Attempt
1. Guest user attempts to access restricted feature (e.g., "Create Scene")
2. System checks user's membership type
3. System detects Trial membership
4. System returns 403 Forbidden with message:
   "此功能需要注册正式用户。请先注册以解锁全部功能。"
5. Frontend displays upgrade prompt modal

#### Scenario: Allowed Features for Guests
Guest users can:
1. **Character Interaction**: Chat with pre-configured characters
2. **Conversation History**: View their conversation history
3. **Basic Settings**: Modify basic settings (nickname, avatar)

### Requirement: Pre-configured Content Access

Guest users **SHALL** only access pre-configured scenes and characters, and **SHALL NOT** modify them.

#### Scenario: Pre-configured Scene Access
1. Guest user opens scene selection
2. System only displays "日常生活助手" scene (ID: 50)
3. System hides "Add Scene" button
4. System disables scene editing/deletion

#### Scenario: Pre-configured Character Access
1. Guest user opens character selection
2. System only displays 6 pre-configured characters:
   - 时小光 (ID: 315)
   - 康小健 (ID: 316)
   - 学小知 (ID: 317)
   - 心小暖 (ID: 318)
   - 心小安 (ID: 319)
   - 暖小阳 (ID: 320)
3. System hides "Add Character" button
4. System disables character editing/deletion

#### Scenario: Content Modification Prevention
1. Guest user attempts to edit pre-configured scene/character
2. System checks user membership type
3. System detects Trial membership
4. System prevents modification and shows message:
   "预置内容无法修改。请注册正式用户以创建自定义内容。"

## MODIFIED Requirements

### Requirement: Permission Check Implementation

Permission checking **SHALL** verify membership type, not just authentication status.

#### Scenario: Permission Check Logic
1. Request arrives at protected endpoint
2. System verifies authentication (JWT token valid)
3. System loads user's membership
4. System checks membership type
5. If Trial membership and feature requires registered user:
   - Return 403 Forbidden
6. Otherwise:
   - Proceed with request
