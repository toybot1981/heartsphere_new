# Memory System Spec Delta

## MODIFIED Requirements

### Requirement: Guest Memory Generation

The memory system **SHALL** skip memory generation for guest users (Trial membership).

#### Scenario: Guest Conversation Without Memory
1. Guest user chats with character
2. Conversation messages are processed normally
3. System checks user's membership type before memory extraction
4. If membership type is "TRIAL":
   - Skip memory extraction
   - Skip memory storage
   - Continue conversation normally
5. Conversation is still saved for potential upgrade migration

#### Scenario: Guest Memory Query
1. Guest user attempts to view memories
2. System checks membership type
3. If Trial membership:
   - Return empty list or message: "记忆功能需要注册正式用户"
   - Display upgrade prompt

#### Scenario: Registered User Memory Generation
1. Registered user (non-Trial) chats with character
2. Conversation messages processed
3. System performs memory extraction as normal
4. Memories are stored and can be queried

## ADDED Requirements

### Requirement: Memory Service Guest Check

The memory service **SHALL** explicitly check for guest users before generating memories.

#### Scenario: Memory Service Logic
1. Memory service receives conversation message
2. Service loads user's membership
3. Service checks if membership type is "TRIAL"
4. If Trial:
   - Log: "Skipping memory generation for guest user"
   - Return without processing
5. If not Trial:
   - Proceed with normal memory extraction
   - Store extracted memories
