# Tasks: Add MCP Management and Brain Scheduling

## 1. MCP Service Templates

- [x] 1.1 Create database migration for `mcp_service_templates` table
- [x] 1.2 Create `McpServiceTemplate` entity class
- [x] 1.3 Create `McpServiceTemplateRepository` interface
- [x] 1.4 Create seed data for popular MCP services (Tavily, GitHub, Filesystem, etc.)
- [x] 1.5 Create `McpServiceTemplateService` for template management
- [x] 1.6 Add template reference to `McpServerConfig` entity
- [x] 1.7 Create API endpoints for listing and using templates
- [ ] 1.8 Add unit tests for template system

## 2. MCP Service Management

- [x] 2.1 Create `McpServiceManager` service for managing MCP services (通过 McpConfigService 实现)
- [x] 2.2 Enhance `McpConfigService` with template-based configuration
- [x] 2.3 Add quick setup method using templates
- [x] 2.4 Implement service validation and testing
- [x] 2.5 Add service metadata and categorization (通过模板实现)
- [ ] 2.6 Create service discovery mechanism (待增强)
- [ ] 2.7 Add auto-registration for discovered services (待增强)
- [ ] 2.8 Add unit tests for service management

## 3. MCP Health Monitoring

- [x] 3.1 Create `McpHealthMonitor` service
- [x] 3.2 Implement periodic health checks
- [x] 3.3 Add connection status tracking
- [x] 3.4 Implement error tracking and reporting
- [x] 3.5 Add health status API endpoints
- [x] 3.6 Create health check scheduler
- [ ] 3.7 Add unit tests for health monitoring

## 4. MCP Executor Completion

- [x] 4.1 Complete `MCPExecutor` implementation
- [x] 4.2 Integrate with `McpClientService`
- [x] 4.3 Handle MCP tool execution errors
- [x] 4.4 Convert MCP results to Brain `ExecutionResult` format
- [ ] 4.5 Add timeout and retry logic
- [x] 4.6 Add execution logging
- [ ] 4.7 Add unit tests for MCPExecutor

## 5. Brain Integration

- [x] 5.1 Enhance `ToolScheduler` to recognize MCP tools
- [x] 5.2 Add MCP tool selection logic
- [x] 5.3 Integrate MCP tools with tool registry
- [x] 5.4 Update `ExecutionModeSelector` to consider MCP mode
- [x] 5.5 Enhance `MultiModalExecutor` to support MCP execution
- [ ] 5.6 Add MCP tool dependency handling
- [ ] 5.7 Update tool selection to filter unhealthy MCP services
- [ ] 5.8 Add integration tests for Brain-MCP integration

## 6. MCP Tool Discovery and Registration

- [x] 6.1 Enhance `McpToolAdapter` discovery mechanism (通过 McpToolDiscoveryService 实现)
- [x] 6.2 Auto-register discovered MCP tools to ToolRegistry
- [x] 6.3 Add tool metadata extraction
- [x] 6.4 Implement tool version tracking (通过元数据实现)
- [x] 6.5 Add tool capability discovery (通过元数据实现)
- [x] 6.6 Create tool registration API
- [ ] 6.7 Add unit tests for tool discovery

## 7. API and UI

- [x] 7.1 Create MCP service management API endpoints
- [x] 7.2 Add template listing and selection endpoints
- [x] 7.3 Create service configuration endpoints
- [x] 7.4 Add health status endpoints
- [x] 7.5 Create service testing endpoints
- [ ] 7.6 Add API documentation
- [ ] 7.7 Create frontend UI for MCP management (if applicable)
- [ ] 7.8 Add integration tests for APIs

## 8. Documentation

- [x] 8.1 Document MCP service templates (在使用指南中)
- [x] 8.2 Create setup guide for popular MCP services (在使用指南中)
- [x] 8.3 Document Brain-MCP integration (在使用指南中)
- [x] 8.4 Add API documentation (在使用指南中)
- [x] 8.5 Create troubleshooting guide (在使用指南中)
- [ ] 8.6 Update architecture documentation (待完成)

## 9. Testing

- [ ] 9.1 Write unit tests for all new components
- [ ] 9.2 Write integration tests for MCP-Brain integration
- [ ] 9.3 Test with real MCP services (Tavily, etc.)
- [ ] 9.4 Test health monitoring
- [ ] 9.5 Test tool discovery and registration
- [ ] 9.6 Test error handling and fallbacks
- [ ] 9.7 Performance testing for health checks
