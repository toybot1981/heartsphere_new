# Skill Selection Specification

## ADDED Requirements

### Requirement: LLM-Driven Skill Selection

The system SHALL use LLM to evaluate and select skills based on user messages and conversation context, instead of relying solely on rule-based keyword matching.

#### Scenario: LLM selects relevant skills
**Given** a user message "我最近感觉很绝望，觉得活着没意思"
**When** the system evaluates available skills
**Then** the system SHALL use LLM to analyze the message
**And** the LLM SHALL select skills that are semantically relevant (e.g., crisis_intervention)
**And** the selection SHALL be based on semantic understanding, not just keyword matching

#### Scenario: LLM handles synonyms
**Given** a user message "我需要时间管理方面的帮助"
**When** the system evaluates skills including "时间规划" skill
**Then** the LLM SHALL recognize that "时间管理" and "时间规划" are semantically similar
**And** the LLM SHALL select the "时间规划" skill even if the exact keyword is not present

### Requirement: Progressive Three-Level Loading

The system SHALL implement progressive loading of skill information across three levels (Level 1: metadata, Level 2: instructions, Level 3: resources), with each level being provided to the LLM for evaluation.

#### Scenario: Level 1 initial screening
**Given** a list of available skills for a character
**When** the system starts skill selection
**Then** the system SHALL load Level 1 (metadata) for all skills
**And** the system SHALL build a Level 1 prompt containing skill metadata
**And** the system SHALL send the prompt to LLM for initial screening
**And** the LLM SHALL return a list of candidate skills (e.g., top 10)

#### Scenario: Level 2 deep evaluation
**Given** candidate skills from Level 1 screening
**When** the system performs deep evaluation
**Then** the system SHALL load Level 2 (instructions) for candidate skills
**And** the system SHALL build a Level 2 prompt containing Level 1 + Level 2 information
**And** the system SHALL send the prompt to LLM for deep evaluation
**And** the LLM SHALL return a refined list of candidate skills (e.g., top 5)

#### Scenario: Level 3 final decision (optional)
**Given** refined candidate skills from Level 2 evaluation
**When** Level 3 is enabled
**Then** the system SHALL load Level 3 (resources) for final candidates
**And** the system SHALL build a Level 3 prompt containing Level 1 + Level 2 + Level 3 information
**And** the system SHALL send the prompt to LLM for final decision
**And** the LLM SHALL return the final list of skills to activate

### Requirement: Standardized Prompt Structure

The system SHALL use standardized prompt templates for each level, ensuring consistent format and clear instructions for the LLM.

#### Scenario: Level 1 prompt structure
**Given** a list of skills and user context
**When** building Level 1 prompt
**Then** the prompt SHALL include:
  - User message
  - Conversation history (if available)
  - List of skills with metadata (ID, name, description, category)
  - Clear instructions for LLM to select relevant skills
  - Expected JSON response format

#### Scenario: Level 2 prompt structure
**Given** candidate skills from Level 1
**When** building Level 2 prompt
**Then** the prompt SHALL include:
  - User message and conversation context
  - Level 1 metadata for each candidate skill
  - Level 2 instructions for each candidate skill
  - Instructions for deep evaluation
  - Expected JSON response format

#### Scenario: Level 3 prompt structure
**Given** refined candidates from Level 2
**When** building Level 3 prompt
**Then** the prompt SHALL include:
  - User message and conversation context
  - Complete skill information (Level 1 + 2 + 3)
  - Instructions for final decision and prioritization
  - Expected JSON response format

### Requirement: Fallback to Rule-Based Selection

The system SHALL provide a fallback mechanism to rule-based skill selection when LLM service is unavailable or fails.

#### Scenario: LLM service unavailable
**Given** LLM service is down or unreachable
**When** the system attempts to select skills
**Then** the system SHALL automatically fallback to rule-based selection
**And** the system SHALL log the fallback event
**And** the system SHALL continue normal operation

#### Scenario: LLM response parsing failure
**Given** LLM returns an invalid or unparseable response
**When** the system attempts to parse the response
**Then** the system SHALL catch the parsing error
**And** the system SHALL fallback to rule-based selection
**And** the system SHALL log the error for debugging

### Requirement: Caching for Performance

The system SHALL implement caching mechanisms to optimize performance and reduce LLM API calls.

#### Scenario: Level 1 cache hit
**Given** Level 1 data for skills is cached
**When** the system needs to load Level 1
**Then** the system SHALL return cached data
**And** the system SHALL not query the database

#### Scenario: LLM result cache hit
**Given** a previous LLM evaluation with the same user message and skill list
**When** the system needs to evaluate skills
**Then** the system SHALL return cached LLM result
**And** the system SHALL not call LLM API

#### Scenario: Cache expiration
**Given** cached data has expired (TTL exceeded)
**When** the system needs the data
**Then** the system SHALL refresh the cache
**And** the system SHALL update the cache with new data

### Requirement: Configurable Selection Strategy

The system SHALL support configuration to enable/disable LLM-driven selection and adjust selection parameters.

#### Scenario: Enable LLM-driven selection
**Given** configuration `skill.selection.llm-driven.enabled=true`
**When** the system selects skills
**Then** the system SHALL use LLM-driven selection

#### Scenario: Disable LLM-driven selection
**Given** configuration `skill.selection.llm-driven.enabled=false`
**When** the system selects skills
**Then** the system SHALL use rule-based selection only

#### Scenario: Configure candidate limits
**Given** configuration `skill.selection.llm-driven.level1-candidates=15`
**When** Level 1 screening completes
**Then** the system SHALL return at most 15 candidate skills

### Requirement: Monitoring and Debugging

The system SHALL provide monitoring and debugging capabilities for skill selection process.

#### Scenario: Log selection process
**Given** skill selection is performed
**When** each level completes
**Then** the system SHALL log:
  - Level 1 candidates and scores
  - Level 2 evaluation results
  - Level 3 final decisions (if enabled)
  - LLM prompts and responses
  - Processing time for each level

#### Scenario: Debug interface
**Given** a debug endpoint is available
**When** a developer requests skill selection details
**Then** the system SHALL return:
  - Complete selection process
  - LLM prompts used
  - LLM responses received
  - Cache status
  - Performance metrics

## MODIFIED Requirements

### Requirement: Skill Selection Mechanism

The system SHALL use LLM-driven selection as the primary method for skill selection, with rule-based selection as fallback when LLM service is unavailable.

#### Scenario: Primary LLM selection
**Given** LLM service is available
**When** the system selects skills
**Then** the system SHALL use LLM-driven selection
**And** the system SHALL provide Level 1/2/3 information to LLM
**And** the system SHALL use LLM's semantic understanding for selection

#### Scenario: Fallback to rules
**Given** LLM service is unavailable
**When** the system selects skills
**Then** the system SHALL fallback to rule-based selection
**And** the system SHALL maintain existing rule-based behavior

## RENAMED Requirements

None

## REMOVED Requirements

None
