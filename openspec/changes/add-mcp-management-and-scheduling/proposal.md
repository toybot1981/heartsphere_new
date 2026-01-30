# Change: Add MCP Management and Brain Scheduling

## Why

Currently, the system has basic MCP integration but lacks:
1. **Management capabilities**: No easy way to add and configure popular MCP services
2. **Preset configurations**: No templates for mainstream MCP servers (Tavily, GitHub, Filesystem, etc.)
3. **Brain integration**: MCP tools are not fully integrated with the Brain's scheduling system
4. **Service discovery**: Limited ability to discover and register MCP services automatically

This change will:
- Enable administrators to easily add and manage popular MCP services
- Provide preset configurations for mainstream MCP servers
- Integrate MCP tools with the Brain's ToolScheduler for intelligent tool selection
- Allow the Brain to automatically discover and use MCP services during task execution

## What Changes

- **ADDED**: MCP service management system with preset configurations for popular MCP servers
- **ADDED**: Pre-configured templates for mainstream MCP services:
  - Tavily (web search)
  - GitHub (code repository operations)
  - Filesystem (file operations)
  - PostgreSQL (database operations)
  - Brave Search (web search alternative)
  - Google Drive (file storage)
  - Slack (team communication)
  - And other popular MCP servers
- **ADDED**: MCP service discovery and auto-registration
- **ADDED**: MCP service health monitoring and status tracking
- **MODIFIED**: Integrate MCP tools with Brain's ToolScheduler
- **MODIFIED**: Enhance MCPExecutor to fully support MCP tool execution
- **ADDED**: MCP service configuration UI/API for easy management
- **ADDED**: MCP service templates and quick setup wizards
- **ADDED**: Brain-based MCP tool selection and scheduling

## Impact

- **Affected specs**:
  - `mcp-management` (new capability)
  - `mcp-brain-scheduling` (new capability)
  - `tool-scheduler` (modified - add MCP tool support)
  - `brain-config-management` (modified - add MCP config management)

- **Affected code**:
  - `mentis/backend/src/main/java/com/heartsphere/mentis/service/McpConfigService.java` - Enhance with preset templates
  - `mentis/backend/src/main/java/com/heartsphere/mentis/entity/McpServerConfig.java` - Add template fields
  - `mentis/backend/src/main/java/com/heartsphere/mentis/brain/impl/ToolSchedulerImpl.java` - Integrate MCP tools
  - `mentis/backend/src/main/java/com/heartsphere/mentis/brain/executor/impl/MCPExecutor.java` - Complete implementation
  - `mentis/backend/src/main/java/com/heartsphere/mentis/tool/mcp/McpToolAdapter.java` - Enhance discovery
  - New: `mentis/backend/src/main/java/com/heartsphere/mentis/service/McpServiceManager.java`
  - New: `mentis/backend/src/main/java/com/heartsphere/mentis/service/McpServiceTemplate.java`
  - Database migration for MCP service templates

- **Breaking changes**: None

- **Migration required**: 
  - Add preset MCP service templates to database
  - Migrate existing MCP configurations to new structure (if needed)
