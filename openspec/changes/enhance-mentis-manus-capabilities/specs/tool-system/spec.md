# Tool System Specification Delta

## ADDED Requirements

### Requirement: Tool Interface
The system SHALL provide a unified `Tool` interface that all tools MUST implement.

#### Scenario: Tool interface definition
- **WHEN** defining a new tool
- **THEN** the tool SHALL implement the `Tool` interface
- **AND** the interface SHALL define: `name`, `description`, `parameters`, and `execute` method

### Requirement: Tool Registry
The system SHALL maintain a `ToolRegistry` that manages all available tools.

#### Scenario: Register a tool
- **WHEN** a tool is implemented
- **THEN** it SHALL be registered in the `ToolRegistry`
- **AND** the registry SHALL allow querying tools by name or type

#### Scenario: List available tools
- **WHEN** querying available tools
- **THEN** the system SHALL return all registered tools
- **AND** each tool SHALL include its name, description, and parameter schema

### Requirement: Browser Tools (10 types)
The system SHALL provide 10 browser-related tools for web automation.

#### Scenario: browser_goto tool
- **WHEN** executing `browser_goto` with a URL
- **THEN** the system SHALL open the URL in the VM's browser
- **AND** return the page title, current URL, and screenshot

#### Scenario: browser_click tool
- **WHEN** executing `browser_click` with a selector
- **THEN** the system SHALL click the element matching the selector
- **AND** return the action result and updated screenshot

#### Scenario: browser_type tool
- **WHEN** executing `browser_type` with text and selector
- **THEN** the system SHALL type the text into the element
- **AND** return the action result

#### Scenario: browser_scroll tool
- **WHEN** executing `browser_scroll` with direction and amount
- **THEN** the system SHALL scroll the page accordingly
- **AND** return the updated screenshot

#### Scenario: browser_screenshot tool
- **WHEN** executing `browser_screenshot`
- **THEN** the system SHALL capture the current browser screen
- **AND** return the screenshot as base64 encoded image

#### Scenario: browser_back tool
- **WHEN** executing `browser_back`
- **THEN** the system SHALL navigate back in browser history
- **AND** return the new page URL and screenshot

#### Scenario: browser_forward tool
- **WHEN** executing `browser_forward`
- **THEN** the system SHALL navigate forward in browser history
- **AND** return the new page URL and screenshot

#### Scenario: browser_refresh tool
- **WHEN** executing `browser_refresh`
- **THEN** the system SHALL refresh the current page
- **AND** return the updated screenshot

#### Scenario: browser_search tool
- **WHEN** executing `browser_search` with a query
- **THEN** the system SHALL perform a web search
- **AND** return search results and screenshot

#### Scenario: browser_extract tool
- **WHEN** executing `browser_extract` with a selector
- **THEN** the system SHALL extract text content from matching elements
- **AND** return the extracted content

### Requirement: Terminal Tools (5 types)
The system SHALL provide 5 terminal-related tools for command execution.

#### Scenario: terminal_exec tool
- **WHEN** executing `terminal_exec` with a command
- **THEN** the system SHALL execute the command in the VM's terminal
- **AND** return stdout, stderr, and exit code

#### Scenario: terminal_write tool
- **WHEN** executing `terminal_write` with file path and content
- **THEN** the system SHALL write content to the file
- **AND** return success status

#### Scenario: terminal_read tool
- **WHEN** executing `terminal_read` with a file path
- **THEN** the system SHALL read and return the file content
- **AND** handle file not found errors gracefully

#### Scenario: terminal_cd tool
- **WHEN** executing `terminal_cd` with a directory path
- **THEN** the system SHALL change the current working directory
- **AND** return the new directory path

#### Scenario: terminal_ls tool
- **WHEN** executing `terminal_ls` with optional directory path
- **THEN** the system SHALL list files and directories
- **AND** return file names, sizes, and permissions

### Requirement: File System Tools (4 types)
The system SHALL provide 4 file system tools for file operations.

#### Scenario: file_create tool
- **WHEN** executing `file_create` with path and content
- **THEN** the system SHALL create the file with the specified content
- **AND** return success status

#### Scenario: file_delete tool
- **WHEN** executing `file_delete` with a file path
- **THEN** the system SHALL delete the file
- **AND** handle file not found errors gracefully

#### Scenario: file_copy tool
- **WHEN** executing `file_copy` with source and destination paths
- **THEN** the system SHALL copy the file
- **AND** return success status

#### Scenario: file_move tool
- **WHEN** executing `file_move` with source and destination paths
- **THEN** the system SHALL move the file
- **AND** return success status

### Requirement: Code Execution Tools (3 types)
The system SHALL provide 3 code execution tools for running scripts.

#### Scenario: python_run tool
- **WHEN** executing `python_run` with Python code
- **THEN** the system SHALL execute the code in a Python interpreter
- **AND** return stdout, stderr, and execution result

#### Scenario: node_run tool
- **WHEN** executing `node_run` with JavaScript code
- **THEN** the system SHALL execute the code in a Node.js interpreter
- **AND** return stdout, stderr, and execution result

#### Scenario: bash_run tool
- **WHEN** executing `bash_run` with Bash script
- **THEN** the system SHALL execute the script in a Bash shell
- **AND** return stdout, stderr, and exit code

### Requirement: System Tools (5 types)
The system SHALL provide 5 system-level tools for VM management.

#### Scenario: system_info tool
- **WHEN** executing `system_info`
- **THEN** the system SHALL return VM system information (OS, CPU, memory, disk)
- **AND** return the information in structured format

#### Scenario: system_snapshot tool
- **WHEN** executing `system_snapshot` with a snapshot name
- **THEN** the system SHALL create a VM snapshot
- **AND** return snapshot ID and creation time

#### Scenario: system_restore tool
- **WHEN** executing `system_restore` with a snapshot ID
- **THEN** the system SHALL restore the VM to the snapshot state
- **AND** return success status

#### Scenario: system_wait tool
- **WHEN** executing `system_wait` with duration in seconds
- **THEN** the system SHALL wait for the specified duration
- **AND** return after the wait completes

#### Scenario: system_log tool
- **WHEN** executing `system_log` with optional log file path
- **THEN** the system SHALL return log entries
- **AND** support filtering by log level and time range

### Requirement: Tool Execution Engine
The system SHALL provide a tool execution engine that executes tools and handles errors.

#### Scenario: Execute a tool
- **WHEN** executing a tool with parameters
- **THEN** the engine SHALL validate parameters
- **AND** execute the tool in the VM context
- **AND** return the execution result

#### Scenario: Tool execution timeout
- **WHEN** a tool execution exceeds the timeout
- **THEN** the engine SHALL cancel the execution
- **AND** return a timeout error

#### Scenario: Tool execution error handling
- **WHEN** a tool execution fails
- **THEN** the engine SHALL catch the error
- **AND** return a structured error response
- **AND** log the error for debugging
