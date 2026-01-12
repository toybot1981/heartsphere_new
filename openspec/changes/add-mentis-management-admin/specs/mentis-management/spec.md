## ADDED Requirements

### Requirement: Mentis Management Module in Admin Backend
The admin backend SHALL provide a centralized management interface for Mentis system configurations, including MCP server configurations and agent role management.

#### Scenario: Admin accesses Mentis management
- **WHEN** an admin user navigates to the admin backend
- **THEN** a "Mentis Management" menu item is visible in the sidebar
- **AND** clicking it navigates to the Mentis management page

### Requirement: MCP Server Configuration Management
The admin backend SHALL allow administrators to manage MCP server configurations for the Mentis system.

#### Scenario: Admin views MCP configurations
- **WHEN** an admin navigates to MCP Configurations tab
- **THEN** a list of all MCP server configurations is displayed
- **AND** each configuration shows: name, server type, status, enabled/disabled state, last tested time

#### Scenario: Admin creates new MCP configuration
- **WHEN** an admin clicks "Create MCP Configuration"
- **THEN** a form dialog opens with fields: name, server type, server URL, API key, description, enabled toggle
- **AND** upon submission, the configuration is saved to the Mentis database
- **AND** the Mentis backend is notified to reload configurations
- **AND** the new configuration appears in the list

#### Scenario: Admin edits MCP configuration
- **WHEN** an admin clicks "Edit" on an MCP configuration
- **THEN** the form dialog opens pre-filled with existing values
- **AND** upon saving, the configuration is updated in the Mentis database
- **AND** the Mentis backend is notified to reload configurations
- **AND** the updated configuration is reflected in the list

#### Scenario: Admin deletes MCP configuration
- **WHEN** an admin clicks "Delete" on an MCP configuration
- **THEN** a confirmation dialog appears
- **AND** upon confirmation, the configuration is removed from the Mentis database
- **AND** the Mentis backend is notified to reload configurations
- **AND** the configuration is removed from the list

#### Scenario: Admin tests MCP connection
- **WHEN** an admin clicks "Test Connection" on an MCP configuration
- **THEN** the system attempts to connect to the MCP server
- **AND** the connection status is updated (CONNECTED, DISCONNECTED, ERROR)
- **AND** if successful, available tools are displayed
- **AND** if failed, error message is shown

#### Scenario: Admin views MCP tools
- **WHEN** an admin clicks "View Tools" on an MCP configuration
- **THEN** a dialog displays the list of available tools from that MCP server
- **AND** each tool shows: name, description, input parameters

#### Scenario: Admin enables/disables MCP configuration
- **WHEN** an admin toggles the enabled/disabled switch on an MCP configuration
- **THEN** the enabled status is updated in the database
- **AND** the Mentis backend is notified to reload configurations
- **AND** the configuration is immediately available/unavailable in Mentis

### Requirement: Agent Role Management
The admin backend SHALL allow administrators to select and configure agent roles from the main system's character database for use in Mentis.

#### Scenario: Admin views available agents
- **WHEN** an admin navigates to Agent Roles tab
- **THEN** a list of available agents from the main backend is displayed
- **AND** each agent shows: name, description, skills/tags, era information
- **AND** agents are filtered to show only active characters with rich capabilities

#### Scenario: Admin searches and filters agents
- **WHEN** an admin enters search text in the agent search field
- **THEN** the agent list is filtered to show matching agents
- **AND** filtering can be done by name, description, skills, or tags

#### Scenario: Admin views agent details
- **WHEN** an admin clicks on an agent in the available agents list
- **THEN** a detail view or dialog shows:
  - Full description and bio
  - System instructions
  - Skills and capabilities
  - Tags and metadata
  - Era information

#### Scenario: Admin configures agent for Mentis
- **WHEN** an admin selects an agent and clicks "Configure for Mentis"
- **THEN** a configuration dialog opens
- **AND** the agent configuration is saved to the Mentis database
- **AND** the agent appears in the "Configured Agents" list
- **AND** the Mentis backend is notified to reload agent configurations

#### Scenario: Admin views configured agents
- **WHEN** an admin navigates to Agent Roles tab
- **THEN** a "Configured Agents" section shows agents currently configured for Mentis
- **AND** each configured agent shows: name, configuration status, enabled/disabled state

#### Scenario: Admin removes agent configuration
- **WHEN** an admin clicks "Remove" on a configured agent
- **THEN** a confirmation dialog appears
- **AND** upon confirmation, the agent configuration is removed from Mentis
- **AND** the Mentis backend is notified to reload agent configurations
- **AND** the agent is removed from the configured agents list

#### Scenario: Admin views agent capabilities
- **WHEN** an admin clicks "View Capabilities" on an agent
- **THEN** a dialog displays the agent's skills, capabilities, and metadata
- **AND** information is fetched from the main backend system

### Requirement: Data Synchronization
Configuration changes made in the admin backend SHALL be immediately synchronized with the Mentis backend system.

#### Scenario: MCP config change synchronization
- **WHEN** an admin creates, updates, or deletes an MCP configuration
- **THEN** the change is saved to the Mentis database
- **AND** the admin backend calls the Mentis API endpoint `/api/mentis/admin/reload-configs`
- **AND** the Mentis backend reloads its MCP configurations
- **AND** the new configuration is immediately available in Mentis

#### Scenario: Agent config change synchronization
- **WHEN** an admin configures or removes an agent
- **THEN** the change is saved to the Mentis database
- **AND** the admin backend calls the Mentis API endpoint to reload agent configurations
- **AND** the agent configuration is immediately available in Mentis

#### Scenario: Synchronization failure handling
- **WHEN** a configuration change is made but Mentis backend is unavailable
- **THEN** the change is still saved to the database
- **AND** a warning is logged
- **AND** the admin is notified that synchronization failed
- **AND** the configuration will be loaded when Mentis backend restarts

### Requirement: Main Backend Integration
The admin backend SHALL fetch available agent roles from the main backend system.

#### Scenario: Fetching agents from main backend
- **WHEN** an admin navigates to Agent Roles tab
- **THEN** the admin backend calls the main backend API endpoint for character list
- **AND** the main backend returns a filtered list of active characters with rich capabilities
- **AND** the list is displayed in the admin interface

#### Scenario: Main backend unavailable
- **WHEN** the main backend is unavailable while fetching agents
- **THEN** a cached list is displayed if available
- **AND** an error message is shown to the admin
- **AND** a retry option is provided

### Requirement: Security and Access Control
Mentis management features SHALL only be accessible to authorized administrators.

#### Scenario: Unauthorized access attempt
- **WHEN** a non-admin user attempts to access Mentis management endpoints
- **THEN** access is denied with appropriate error response
- **AND** the request is logged for security auditing

#### Scenario: API key security
- **WHEN** an admin views or edits MCP configurations with API keys
- **THEN** API keys are displayed in masked format (e.g., `****-****-****-xxxx`)
- **AND** only authorized admins can view or modify API keys
