# Design: MCP Management and Brain Scheduling

## Overview

This design adds comprehensive MCP service management and integrates MCP tools with the Brain's scheduling system.

## Architecture

### 1. MCP Service Management

**Components**:
- `McpServiceManager`: Manages MCP services, templates, and configurations
- `McpServiceTemplate`: Defines preset configurations for popular MCP servers
- `McpServiceDiscovery`: Discovers and registers MCP services automatically
- `McpHealthMonitor`: Monitors MCP service health and connection status

**Data Model**:
- Extend `McpServerConfig` with template reference and metadata
- Add `mcp_service_templates` table for preset configurations
- Add service health tracking fields

### 2. Brain Integration

**Components**:
- Enhance `ToolScheduler` to recognize and prioritize MCP tools
- Complete `MCPExecutor` implementation
- Integrate MCP tools with `MultiModalExecutor`
- Add MCP tool selection logic to `ExecutionModeSelector`

**Flow**:
```
Brain Planning
  ↓
ToolScheduler selects tools (including MCP tools)
  ↓
ExecutionModeSelector chooses MCP mode
  ↓
MCPExecutor executes MCP tool
  ↓
Result returned to Brain
  ↓
Feedback loop processes result
```

## Design Decisions

### Decision 1: MCP Service Templates

**What**: Create preset templates for popular MCP servers.

**Why**:
- Reduces configuration complexity for users
- Ensures correct configuration for known services
- Provides quick setup for common use cases

**Implementation**:
- Store templates in database (`mcp_service_templates` table)
- Templates include: server type, default URL, required parameters, description
- Users can create configs from templates with minimal input (just API keys)

### Decision 2: Service Discovery

**What**: Automatically discover MCP services from E2B Gateway and register them.

**Why**:
- Reduces manual configuration
- Keeps tool registry up-to-date
- Supports dynamic MCP service addition

**Implementation**:
- Query E2B Gateway for available MCP servers
- Auto-register discovered services
- Update tool registry with discovered tools

### Decision 3: Brain Scheduling Integration

**What**: Integrate MCP tools with Brain's ToolScheduler.

**Why**:
- Enables intelligent tool selection
- Allows Brain to choose between E2B tools and MCP tools
- Supports multi-modal execution

**Implementation**:
- Register MCP tools in ToolRegistry with `mcp_` prefix
- ToolScheduler recognizes MCP tools by category
- ExecutionModeSelector considers MCP as execution mode
- MCPExecutor executes MCP tools via McpClientService

### Decision 4: Health Monitoring

**What**: Monitor MCP service health and connection status.

**Why**:
- Prevents using unavailable services
- Provides visibility into service status
- Enables automatic retry with alternative services

**Implementation**:
- Periodic health checks for enabled MCP services
- Track connection status and last error
- Update status in real-time
- ToolScheduler filters out unhealthy services

## Implementation Details

### MCP Service Templates

Popular MCP servers to include:
1. **Tavily**: Web search (`tavily_search`)
2. **GitHub**: Code repository operations (`github_*`)
3. **Filesystem**: File operations (`filesystem_*`)
4. **PostgreSQL**: Database operations (`postgres_*`)
5. **Brave Search**: Alternative web search (`brave_search`)
6. **Google Drive**: File storage (`gdrive_*`)
7. **Slack**: Team communication (`slack_*`)
8. **Puppeteer**: Browser automation (`puppeteer_*`)
9. **SQLite**: Database operations (`sqlite_*`)
10. **Memory**: Context memory (`memory_*`)

Each template includes:
- Server type identifier
- Default connection URL/endpoint
- Required configuration parameters
- Optional parameters with defaults
- Tool descriptions and examples
- Setup instructions

### Brain Integration Points

1. **ToolScheduler**:
   - Recognize MCP tools by `mcp_` prefix or category
   - Include MCP tools in tool selection logic
   - Support MCP tool dependencies

2. **ExecutionModeSelector**:
   - Consider MCP mode when task requires external data/services
   - Evaluate MCP vs E2B vs PROMPT based on task requirements

3. **MCPExecutor**:
   - Complete implementation using McpClientService
   - Handle MCP tool execution errors
   - Convert MCP results to Brain ExecutionResult format

4. **MultiModalExecutor**:
   - Support MCP execution mode
   - Coordinate MCP + E2B + PROMPT execution

## Risks / Trade-offs

### Risk 1: MCP Service Availability
**Mitigation**: Health monitoring and fallback to alternative services

### Risk 2: Configuration Complexity
**Mitigation**: Templates and wizards simplify setup

### Risk 3: Performance Overhead
**Mitigation**: Async health checks, connection pooling

## Migration Plan

1. Create database migration for `mcp_service_templates` table
2. Seed database with popular MCP service templates
3. Enhance McpConfigService with template support
4. Complete MCPExecutor implementation
5. Integrate MCP tools with ToolScheduler
6. Add health monitoring
7. Update UI/API for MCP management
