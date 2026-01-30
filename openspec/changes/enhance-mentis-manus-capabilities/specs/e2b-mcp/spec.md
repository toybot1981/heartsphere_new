# E2B MCP Integration Specification Delta

## ADDED Requirements

### Requirement: E2B MCP Gateway Integration
The system SHALL integrate with E2B's MCP Gateway to access MCP servers running inside sandboxes.

#### Scenario: Get MCP URL and token
- **WHEN** a sandbox is created
- **THEN** the system SHALL obtain the MCP URL via `sandbox.getMcpUrl()`
- **AND** obtain the MCP token via `sandbox.getMcpToken()`
- **AND** store them for MCP client connections

#### Scenario: MCP Gateway availability
- **WHEN** checking MCP Gateway availability
- **THEN** the system SHALL verify the Gateway is accessible
- **AND** handle connection errors gracefully

### Requirement: MCP Client Connection
The system SHALL establish connections to MCP servers using the MCP client SDK.

#### Scenario: Connect to MCP server
- **WHEN** connecting to an MCP server
- **THEN** the system SHALL use `StreamableHTTPClientTransport` with the MCP URL
- **AND** include the Authorization header with the MCP token
- **AND** establish a connection using the MCP Client SDK

#### Scenario: MCP connection error handling
- **WHEN** MCP connection fails
- **THEN** the system SHALL log the error
- **AND** provide a fallback mechanism
- **AND** notify the user of the connection failure

### Requirement: MCP Server Support
The system SHALL support multiple MCP servers including Browserbase, Exa, and Notion.

#### Scenario: Configure Browserbase MCP server
- **WHEN** configuring the Browserbase MCP server
- **THEN** the system SHALL require Browserbase API key, Gemini API key, and Project ID
- **AND** register the server in the MCP Gateway configuration

#### Scenario: Configure Exa MCP server
- **WHEN** configuring the Exa MCP server
- **THEN** the system SHALL require Exa API key
- **AND** register the server in the MCP Gateway configuration

#### Scenario: Configure Notion MCP server
- **WHEN** configuring the Notion MCP server
- **THEN** the system SHALL require Notion internal integration token
- **AND** register the server in the MCP Gateway configuration

### Requirement: MCP Tool Discovery
The system SHALL discover and list available tools from MCP servers.

#### Scenario: List MCP tools
- **WHEN** querying available MCP tools
- **THEN** the system SHALL call `client.listTools()`
- **AND** return a list of available tools with their names and descriptions

#### Scenario: Cache MCP tools
- **WHEN** listing MCP tools
- **THEN** the system SHALL cache the tool list for 5 minutes
- **AND** refresh the cache when tools change

### Requirement: MCP Tool Execution
The system SHALL execute MCP tools and handle their results.

#### Scenario: Execute MCP tool
- **WHEN** executing an MCP tool
- **THEN** the system SHALL call `client.callTool()` with tool name and parameters
- **AND** return the tool execution result

#### Scenario: MCP tool execution error handling
- **WHEN** an MCP tool execution fails
- **THEN** the system SHALL catch and handle the error
- **AND** return a structured error response
- **AND** log the error for debugging

### Requirement: MCP Tool Registration
MCP tools SHALL be registered in the tool system and available for task execution.

#### Scenario: Register MCP tools
- **WHEN** MCP tools are discovered
- **THEN** the system SHALL register them in the `ToolRegistry`
- **AND** make them available for task planning and execution

#### Scenario: MCP tool naming
- **WHEN** registering MCP tools
- **THEN** the system SHALL prefix tool names with "mcp_" (e.g., "mcp_browserbase_search")
- **AND** ensure unique naming across all tools

### Requirement: MCP Inspector Integration
The system SHALL provide integration with MCP Inspector for debugging and testing.

#### Scenario: Launch MCP Inspector
- **WHEN** a user requests MCP Inspector
- **THEN** the system SHALL provide the command to launch the inspector
- **AND** include the MCP URL and token in the command

#### Scenario: MCP Inspector debugging
- **WHEN** using MCP Inspector
- **THEN** users SHALL be able to browse available tools
- **AND** test tool calls with different parameters
- **AND** inspect request/response payloads

## MODIFIED Requirements

### Requirement: E2B Bridge Service
The E2B Bridge Service SHALL be enhanced to support MCP Gateway functionality.

#### Scenario: Bridge Service MCP support
- **WHEN** creating a sandbox via Bridge Service
- **THEN** the Bridge Service SHALL configure MCP servers if API keys are provided
- **AND** return MCP URL and token in the sandbox creation response

#### Scenario: Bridge Service MCP endpoints
- **WHEN** accessing MCP functionality
- **THEN** the Bridge Service SHALL provide endpoints for MCP URL and token retrieval
- **AND** handle MCP Gateway configuration
