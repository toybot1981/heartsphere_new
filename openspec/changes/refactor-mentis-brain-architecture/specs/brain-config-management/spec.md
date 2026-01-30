## ADDED Requirements

### Requirement: Brain Configuration Storage
The system SHALL store brain configurations in the database for management and versioning.

#### Scenario: Configuration table creation
- **WHEN** the system initializes
- **THEN** it SHALL create `mentis_brain_configs` table if it doesn't exist
- **AND** it SHALL create `mentis_brain_config_items` table for configuration items
- **AND** tables SHALL support versioning and history tracking

#### Scenario: Configuration structure
- **WHEN** a brain configuration is stored
- **THEN** it SHALL include: id, name, description, version, enabled status, created/updated timestamps
- **AND** configuration items SHALL include: config_id, item_type (LLM/MEMORY/PROMPT/SKILL/MCP), item_key, item_value (JSON), priority

### Requirement: LLM Configuration Management
The system SHALL support storing and managing LLM configurations for the brain.

#### Scenario: LLM configuration storage
- **WHEN** an LLM configuration is created
- **THEN** it SHALL be stored as a configuration item with type "LLM"
- **AND** it SHALL include: provider, model_name, api_key, base_url, model_params, temperature, max_tokens
- **AND** it SHALL support multiple LLM configurations per brain

#### Scenario: LLM configuration retrieval
- **WHEN** the brain needs LLM service
- **THEN** it SHALL load LLM configuration from database
- **AND** it SHALL use the configured LLM provider and model
- **AND** it SHALL apply model parameters from configuration

### Requirement: Memory System Configuration Management
The system SHALL support storing and managing memory system configurations.

#### Scenario: Memory configuration storage
- **WHEN** a memory configuration is created
- **THEN** it SHALL be stored as a configuration item with type "MEMORY"
- **AND** it SHALL include: memory_type (short/long), storage_type (redis/mongodb), retention_policy, compression_settings
- **AND** it SHALL support memory system customization

#### Scenario: Memory configuration usage
- **WHEN** the brain accesses memory
- **THEN** it SHALL use configured memory settings
- **AND** it SHALL respect retention and compression policies

### Requirement: Prompt Configuration Management
The system SHALL support storing and managing prompt templates for the brain.

#### Scenario: Prompt configuration storage
- **WHEN** a prompt configuration is created
- **THEN** it SHALL be stored as a configuration item with type "PROMPT"
- **AND** it SHALL include: prompt_name, prompt_template, variables, context_requirements
- **AND** it SHALL support multiple prompt templates per brain

#### Scenario: Prompt template usage
- **WHEN** the brain generates instructions
- **THEN** it SHALL use configured prompt templates
- **AND** it SHALL substitute variables with actual values
- **AND** it SHALL apply context requirements

### Requirement: Skill Configuration Management
The system SHALL support storing and managing skill configurations for the brain.

#### Scenario: Skill configuration storage
- **WHEN** a skill configuration is created
- **THEN** it SHALL be stored as a configuration item with type "SKILL"
- **AND** it SHALL include: skill_name, skill_type, skill_config (JSON), enabled status
- **AND** it SHALL support enabling/disabling specific skills

#### Scenario: Skill usage
- **WHEN** the brain encounters a task requiring a skill
- **THEN** it SHALL check if the skill is enabled in configuration
- **AND** it SHALL use skill configuration for execution
- **AND** it SHALL load skill-specific settings

### Requirement: MCP Configuration Management
The system SHALL support storing and managing MCP server configurations for the brain.

#### Scenario: MCP configuration reference
- **WHEN** a brain configuration references MCP servers
- **THEN** it SHALL reference existing `mcp_server_configs` table entries
- **AND** it SHALL store MCP server IDs in configuration items
- **AND** it SHALL support multiple MCP servers per brain

#### Scenario: MCP server usage
- **WHEN** the brain needs external tools
- **THEN** it SHALL load MCP server configurations from referenced entries
- **AND** it SHALL connect to enabled MCP servers
- **AND** it SHALL use MCP tools based on configuration

### Requirement: Configuration Management API
The system SHALL provide REST API endpoints for managing brain configurations.

#### Scenario: Create configuration
- **WHEN** an administrator creates a brain configuration via API
- **THEN** the system SHALL validate configuration data
- **AND** it SHALL save configuration to database
- **AND** it SHALL return created configuration with ID

#### Scenario: Update configuration
- **WHEN** an administrator updates a brain configuration via API
- **THEN** the system SHALL validate updated data
- **AND** it SHALL update configuration in database
- **AND** it SHALL maintain configuration history

#### Scenario: List configurations
- **WHEN** an administrator requests brain configurations via API
- **THEN** the system SHALL return list of configurations
- **AND** it SHALL support filtering by enabled status, name, or type
- **AND** it SHALL support pagination

#### Scenario: Delete configuration
- **WHEN** an administrator deletes a brain configuration via API
- **THEN** the system SHALL mark configuration as deleted (soft delete)
- **AND** it SHALL preserve configuration history
- **AND** it SHALL prevent deletion if configuration is in use

### Requirement: Configuration Validation
The system SHALL validate brain configurations before saving.

#### Scenario: Format validation
- **WHEN** a configuration is saved
- **THEN** the system SHALL validate JSON format for configuration items
- **AND** it SHALL validate required fields
- **AND** it SHALL return validation errors if invalid

#### Scenario: Reference validation
- **WHEN** a configuration references MCP servers or other resources
- **THEN** the system SHALL validate that referenced resources exist
- **AND** it SHALL return error if reference is invalid

### Requirement: Configuration Versioning
The system SHALL support configuration versioning and history.

#### Scenario: Version tracking
- **WHEN** a configuration is updated
- **THEN** the system SHALL create a new version
- **AND** it SHALL preserve previous version
- **AND** it SHALL track version history

#### Scenario: Version rollback
- **WHEN** an administrator rolls back to a previous version
- **THEN** the system SHALL restore previous configuration
- **AND** it SHALL create a new version with rolled-back data
