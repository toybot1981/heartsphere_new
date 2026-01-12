# Change: Add Mentis Management Module in Admin Backend

## Why

Currently, Mentis configuration (MCP servers, agent roles) can only be managed through Mentis's own interface or direct database access. Administrators need a centralized management interface in the admin backend to:

1. **Centralized Configuration**: Manage all Mentis-related configurations (MCP servers, agent roles) from a single admin interface
2. **Integration with Main System**: Select and configure agent roles from the main system's rich character database, leveraging existing well-developed characters
3. **Tight Coupling**: Ensure configuration changes in admin backend are immediately reflected in Mentis system
4. **Operational Efficiency**: Reduce the need to switch between different systems for configuration management

## What Changes

- **ADDED**: New "Mentis Management" section in admin backend sidebar
- **ADDED**: MCP Server Configuration management interface in admin backend
  - List, create, edit, delete MCP server configurations
  - Test MCP server connections
  - View available tools from MCP servers
  - Enable/disable MCP configurations
- **ADDED**: Multi-Agent Configuration management interface
  - Fetch available agent roles from main backend service
  - Select and configure agent roles for Mentis
  - View agent capabilities and skills
  - Link agent roles to Mentis sessions
- **ADDED**: Admin backend API endpoints for Mentis management
  - MCP configuration CRUD operations
  - Agent role selection and configuration
  - Real-time synchronization with Mentis backend
- **ADDED**: Data synchronization mechanism between admin and Mentis
  - Configuration changes trigger updates in Mentis
  - Bidirectional data flow for consistency
- **MODIFIED**: Admin backend data source configuration to access Mentis database
  - Already configured, but ensure proper access patterns

## Impact

- **Affected specs**: New capability `mentis-management`
- **Affected code**:
  - `admin/backend/src/main/java/com/heartsphere/admin/controller/` - New MentisManagementController
  - `admin/backend/src/main/java/com/heartsphere/admin/service/` - New MentisManagementService
  - `admin/backend/src/main/java/com/heartsphere/admin/entity/` - May need DTOs for Mentis entities
  - `admin/frontend/src/components/` - New MentisManagement components
  - `admin/frontend/src/pages/` - New MentisManagementPage
  - `admin/frontend/src/services/api/admin/` - New mentis management API service
  - `main/backend/src/main/java/com/heartsphere/controller/PresetCharacterController.java` - May need enhancement for admin access
  - `mentis/backend/src/main/java/com/heartsphere/mentis/service/McpConfigService.java` - May need admin-specific methods
- **Database**: Uses existing `mcp_server_configs` table in Mentis database
- **Integration**: Requires communication between admin backend and main backend for agent roles
