## 1. Backend API Development

### 1.1 Admin Backend - Mentis Management Service
- [x] 1.1.1 Create `MentisManagementService` interface and implementation
  - Methods: getMcpConfigs, createMcpConfig, updateMcpConfig, deleteMcpConfig, testMcpConnection, getMcpTools
  - Access Mentis database using existing data source configuration
- [x] 1.1.2 Create `MentisAgentService` for agent role management
  - Method: fetchAvailableAgents() - calls main backend API
  - Method: configureAgentForMentis() - link agent to Mentis
  - Method: getAgentCapabilities() - get agent skills and capabilities
- [x] 1.1.3 Create DTOs for Mentis management
  - `McpConfigDTO` - for MCP configuration data transfer
  - `AgentRoleDTO` - for agent role information
  - `MentisAgentConfigDTO` - for agent configuration

### 1.2 Admin Backend - REST Controllers
- [x] 1.2.1 Create `MentisManagementController`
  - `GET /api/admin/mentis/mcp/configs` - List all MCP configurations
  - `POST /api/admin/mentis/mcp/configs` - Create new MCP configuration
  - `PUT /api/admin/mentis/mcp/configs/{id}` - Update MCP configuration
  - `DELETE /api/admin/mentis/mcp/configs/{id}` - Delete MCP configuration
  - `POST /api/admin/mentis/mcp/configs/{id}/test` - Test MCP connection
  - `GET /api/admin/mentis/mcp/configs/{id}/tools` - Get available tools
- [x] 1.2.2 Create `MentisAgentController`
  - `GET /api/admin/mentis/agents/available` - Fetch available agents from main backend
  - `GET /api/admin/mentis/agents/configured` - Get configured agents for Mentis
  - `POST /api/admin/mentis/agents/configure` - Configure agent for Mentis
  - `DELETE /api/admin/mentis/agents/{id}` - Remove agent configuration
  - `GET /api/admin/mentis/agents/{id}/capabilities` - Get agent capabilities
  - `PUT /api/admin/mentis/agents/{id}/toggle` - Enable/disable agent

### 1.3 Main Backend Integration
- [x] 1.3.1 Use existing `PresetCharacterController` endpoint
  - `GET /api/preset-characters` - Already provides character details including skills, tags, systemInstruction
  - Admin backend filters results to show only rich agents
- [x] 1.3.2 Agent filtering implemented in `MentisAgentServiceImpl`
  - Method: isRichAgent() - filters characters with rich capabilities
  - Criteria: isActive=true, has systemInstruction, has skills or tags

### 1.4 Data Synchronization
- [x] 1.4.1 Implement configuration change notification mechanism
  - When admin updates MCP config, notify Mentis backend (via event or direct API call)
  - Ensure Mentis backend reloads configurations
- [x] 1.4.2 Create synchronization service
  - `MentisSyncService` - handles bidirectional sync
  - Cache invalidation for Mentis when configs change

## 2. Frontend Development

### 2.1 Admin Frontend - API Services
- [x] 2.1.1 Create `mentisApi.ts` in `admin/frontend/src/services/api/admin/`
  - Methods for MCP configuration management
  - Methods for agent role management
  - Error handling and type definitions

### 2.2 Admin Frontend - Components
- [x] 2.2.1 Create `MentisManagementPage.tsx` - Main page component
  - Tab-based layout: MCP Configurations, Agent Roles
  - Integration with admin sidebar
- [x] 2.2.2 Create `McpConfigManagement.tsx` component
  - List view with table/grid
  - Create/Edit dialog
  - Test connection button
  - Enable/disable toggle
  - View tools button (integrated in form)
- [x] 2.2.3 Create `AgentRoleManagement.tsx` component
  - Available agents list (from main backend)
  - Configured agents list (for Mentis)
  - Agent selection and configuration dialog
  - Agent capabilities display
- [x] 2.2.4 Create `McpConfigForm.tsx` - Form component for MCP configuration
  - Fields: name, serverType, serverUrl, apiKey, description, enabled
  - Validation
  - API key encryption display (masked)
- [x] 2.2.5 Agent selection functionality integrated in `AgentRoleManagement.tsx`
  - Search and filter agents
  - Display agent details (name, description, skills)
  - Single-select with configuration

### 2.3 Admin Frontend - Integration
- [x] 2.3.1 Add "Mentis Management" to admin sidebar
  - New menu item in `AdminSidebar.tsx`
  - Route configuration in `AdminScreen.tsx`
- [x] 2.3.2 Update routing
  - Add route for `mentis-management` section in AdminScreen
  - Handle navigation and state

## 3. Database and Data Access

### 3.1 Data Source Configuration
- [ ] 3.1.1 Verify Mentis data source configuration in admin backend
  - Ensure `mcp_server_configs` table is accessible
  - Test database connection
- [ ] 3.1.2 Create repository interfaces if needed
  - `McpConfigRepository` - for direct database access (if needed)
  - Or use existing Mentis service via API

### 3.2 Agent Configuration Storage
- [x] 3.2.1 Design agent configuration storage
  - Option A: New table in Mentis database `mentis_agent_configs` (chosen)
  - Option B: Use existing Mentis session/agent tables
  - Option C: Store in admin database and sync to Mentis
- [x] 3.2.2 Create migration script if new table needed
  - Flyway migration for agent configuration table

## 4. Testing and Validation

### 4.1 Backend Testing
- [ ] 4.1.1 Unit tests for `MentisManagementService`
  - Test MCP config CRUD operations
  - Test agent fetching and configuration
- [ ] 4.1.2 Integration tests for API endpoints
  - Test all REST endpoints
  - Test data synchronization
- [ ] 4.1.3 Test main backend integration
  - Test agent fetching from main backend
  - Test error handling

### 4.2 Frontend Testing
- [ ] 4.2.1 Component testing
  - Test MCP config management component
  - Test agent role management component
- [ ] 4.2.2 Integration testing
  - Test full workflow: create config → test → enable
  - Test agent selection and configuration

### 4.3 End-to-End Testing
- [ ] 4.3.1 Test configuration flow
  - Admin creates MCP config → Mentis can use it
  - Admin configures agent → Agent available in Mentis
- [ ] 4.3.2 Test synchronization
  - Changes in admin reflect in Mentis immediately
  - Verify data consistency

## 5. Documentation

### 5.1 API Documentation
- [x] 5.1.1 Document all new API endpoints
  - Added Swagger/OpenAPI annotations (@Operation, @Tag)
  - Controllers documented with descriptions

### 5.2 User Documentation
- [ ] 5.2.1 Create admin user guide for Mentis management
  - How to configure MCP servers
  - How to select and configure agents
  - Troubleshooting guide

### 5.3 Technical Documentation
- [ ] 5.3.1 Document architecture decisions
  - Why direct database access vs API calls
  - Synchronization mechanism
  - Agent selection criteria
