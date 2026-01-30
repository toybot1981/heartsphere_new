## ADDED Requirements

### Requirement: Task-Specific Planning Configuration
The system SHALL support task-specific planning configurations for different task types stored in the database.

#### Scenario: Task template creation
- **WHEN** an administrator creates a task template
- **THEN** it SHALL be stored in `mentis_task_templates` table
- **AND** it SHALL include: task_type, task_name, planning_strategy, tool_sequence, validation_rules
- **AND** it SHALL support multiple task types (weather_query, stock_query, travel_planning, etc.)

#### Scenario: Task type identification
- **WHEN** the brain receives a user request
- **THEN** it SHALL identify the task type (weather_query, stock_query, etc.)
- **AND** it SHALL match the request to an appropriate task template
- **AND** it SHALL use the task template for planning if a match is found

#### Scenario: Task-specific planning
- **WHEN** a task template is matched
- **THEN** the brain SHALL use the template's planning strategy
- **AND** it SHALL follow the template's tool sequence
- **AND** it SHALL apply template's validation rules

### Requirement: Weather Query Task Configuration
The system SHALL provide a task template for weather query tasks.

#### Scenario: Weather query planning
- **WHEN** user requests weather information
- **THEN** the brain SHALL identify it as weather_query task type
- **AND** it SHALL use weather_query task template
- **AND** it SHALL plan steps: extract location → query weather API → format response

#### Scenario: Weather query tool configuration
- **WHEN** executing weather query task
- **THEN** the brain SHALL use configured tools (browser_search or API call)
- **AND** it SHALL follow tool execution configuration for E2B commands
- **AND** it SHALL format weather data appropriately

### Requirement: Stock Query Task Configuration
The system SHALL provide a task template for stock query tasks.

#### Scenario: Stock query planning
- **WHEN** user requests stock information
- **THEN** the brain SHALL identify it as stock_query task type
- **AND** it SHALL use stock_query task template
- **AND** it SHALL plan steps: extract stock symbol → query stock API → format response

#### Scenario: Stock query tool configuration
- **WHEN** executing stock query task
- **THEN** the brain SHALL use configured tools (browser_search or API call)
- **AND** it SHALL follow tool execution configuration for E2B commands
- **AND** it SHALL format stock data appropriately

### Requirement: Travel Planning Task Configuration
The system SHALL provide a task template for travel planning tasks.

#### Scenario: Travel planning task identification
- **WHEN** user requests travel planning
- **THEN** the brain SHALL identify it as travel_planning task type
- **AND** it SHALL use travel_planning task template
- **AND** it SHALL plan steps: extract requirements → search destinations → find flights/hotels → create itinerary

#### Scenario: Travel planning tool sequence
- **WHEN** executing travel planning task
- **THEN** the brain SHALL follow template's tool sequence:
  - browser_search for destinations
  - browser_search for flights
  - browser_search for hotels
  - file_create for itinerary
- **AND** it SHALL coordinate tool execution based on template configuration

### Requirement: Web Research Task Configuration
The system SHALL provide a task template for web research and information gathering tasks.

#### Scenario: Web research task identification
- **WHEN** user requests web research or information gathering
- **THEN** the brain SHALL identify it as web_research task type
- **AND** it SHALL use web_research task template
- **AND** it SHALL plan steps: extract research topic → search multiple sources → extract information → synthesize results

#### Scenario: Web research tool sequence
- **WHEN** executing web research task
- **THEN** the brain SHALL follow template's tool sequence:
  - browser_search for multiple sources
  - browser_extract for content extraction
  - python_run for data analysis and synthesis
  - file_create for research report
- **AND** it SHALL coordinate parallel searches when possible

### Requirement: Data Analysis Task Configuration
The system SHALL provide a task template for data analysis tasks.

#### Scenario: Data analysis task identification
- **WHEN** user requests data analysis
- **THEN** the brain SHALL identify it as data_analysis task type
- **AND** it SHALL use data_analysis task template
- **AND** it SHALL plan steps: load data → clean data → analyze → visualize → generate report

#### Scenario: Data analysis tool sequence
- **WHEN** executing data analysis task
- **THEN** the brain SHALL follow template's tool sequence:
  - file_read or terminal_exec to load data
  - python_run for data cleaning and analysis
  - python_run for visualization generation
  - file_create for analysis report
- **AND** it SHALL use appropriate Python libraries (pandas, matplotlib, etc.)

### Requirement: Code Generation Task Configuration
The system SHALL provide a task template for code generation tasks.

#### Scenario: Code generation task identification
- **WHEN** user requests code generation
- **THEN** the brain SHALL identify it as code_generation task type
- **AND** it SHALL use code_generation task template
- **AND** it SHALL plan steps: analyze requirements → generate code → test code → save file

#### Scenario: Code generation tool sequence
- **WHEN** executing code generation task
- **THEN** the brain SHALL follow template's tool sequence:
  - LLM-based code generation
  - file_create for code file
  - python_run or node_run for code testing
  - file_write for code updates if needed
- **AND** it SHALL validate code syntax and structure

### Requirement: Document Creation Task Configuration
The system SHALL provide a task template for document creation tasks.

#### Scenario: Document creation task identification
- **WHEN** user requests document creation
- **THEN** the brain SHALL identify it as document_creation task type
- **AND** it SHALL use document_creation task template
- **AND** it SHALL plan steps: gather content → structure document → format → save

#### Scenario: Document creation tool sequence
- **WHEN** executing document creation task
- **THEN** the brain SHALL follow template's tool sequence:
  - browser_search or memory retrieval for content
  - python_run or node_run for document generation
  - file_create for document file
  - file_write for document updates
- **AND** it SHALL support multiple document formats (markdown, HTML, PDF, etc.)

### Requirement: Email Management Task Configuration
The system SHALL provide a task template for email management tasks.

#### Scenario: Email management task identification
- **WHEN** user requests email operations
- **THEN** the brain SHALL identify it as email_management task type
- **AND** it SHALL use email_management task template
- **AND** it SHALL plan steps: authenticate → read/compose → send/manage

#### Scenario: Email management tool sequence
- **WHEN** executing email management task
- **THEN** the brain SHALL follow template's tool sequence:
  - browser_goto for email service
  - browser_type for email composition
  - browser_click for sending/managing
  - browser_screenshot for confirmation
- **AND** it SHALL handle email authentication securely

### Requirement: Calendar Management Task Configuration
The system SHALL provide a task template for calendar management tasks.

#### Scenario: Calendar management task identification
- **WHEN** user requests calendar operations
- **THEN** the brain SHALL identify it as calendar_management task type
- **AND** it SHALL use calendar_management task template
- **AND** it SHALL plan steps: authenticate → view calendar → create/update events

#### Scenario: Calendar management tool sequence
- **WHEN** executing calendar management task
- **THEN** the brain SHALL follow template's tool sequence:
  - browser_goto for calendar service
  - browser_click for event creation
  - browser_type for event details
  - browser_click for saving
- **AND** it SHALL extract event information from user request

### Requirement: Shopping Assistant Task Configuration
The system SHALL provide a task template for shopping assistant tasks.

#### Scenario: Shopping assistant task identification
- **WHEN** user requests shopping assistance
- **THEN** the brain SHALL identify it as shopping_assistant task type
- **AND** it SHALL use shopping_assistant task template
- **AND** it SHALL plan steps: extract product requirements → search products → compare prices → generate recommendations

#### Scenario: Shopping assistant tool sequence
- **WHEN** executing shopping assistant task
- **THEN** the brain SHALL follow template's tool sequence:
  - browser_search for products
  - browser_extract for product information
  - python_run for price comparison
  - file_create for shopping list or recommendations
- **AND** it SHALL compare multiple sources

### Requirement: News Summary Task Configuration
The system SHALL provide a task template for news summary tasks.

#### Scenario: News summary task identification
- **WHEN** user requests news summary
- **THEN** the brain SHALL identify it as news_summary task type
- **AND** it SHALL use news_summary task template
- **AND** it SHALL plan steps: search news → extract articles → summarize → format output

#### Scenario: News summary tool sequence
- **WHEN** executing news summary task
- **THEN** the brain SHALL follow template's tool sequence:
  - browser_search for news sources
  - browser_extract for article content
  - python_run or LLM for summarization
  - file_create for summary document
- **AND** it SHALL aggregate multiple news sources

### Requirement: Translation Task Configuration
The system SHALL provide a task template for translation tasks.

#### Scenario: Translation task identification
- **WHEN** user requests translation
- **THEN** the brain SHALL identify it as translation task type
- **AND** it SHALL use translation task template
- **AND** it SHALL plan steps: extract text → identify languages → translate → format output

#### Scenario: Translation tool sequence
- **WHEN** executing translation task
- **THEN** the brain SHALL follow template's tool sequence:
  - file_read or browser_extract for source text
  - LLM or API call for translation
  - file_create for translated document
- **AND** it SHALL preserve formatting and context

### Requirement: Image Processing Task Configuration
The system SHALL provide a task template for image processing tasks.

#### Scenario: Image processing task identification
- **WHEN** user requests image processing
- **THEN** the brain SHALL identify it as image_processing task type
- **AND** it SHALL use image_processing task template
- **AND** it SHALL plan steps: load image → process → save result

#### Scenario: Image processing tool sequence
- **WHEN** executing image processing task
- **THEN** the brain SHALL follow template's tool sequence:
  - file_read or browser_download for image loading
  - python_run with image processing libraries (PIL, OpenCV)
  - file_create for processed image
- **AND** it SHALL support various image operations (resize, filter, convert, etc.)

### Requirement: File Management Task Configuration
The system SHALL provide a task template for file management tasks.

#### Scenario: File management task identification
- **WHEN** user requests file operations
- **THEN** the brain SHALL identify it as file_management task type
- **AND** it SHALL use file_management task template
- **AND** it SHALL plan steps: identify operation → execute → verify

#### Scenario: File management tool sequence
- **WHEN** executing file management task
- **THEN** the brain SHALL follow template's tool sequence:
  - terminal_ls for file listing
  - file_create, file_delete, file_copy, file_move as needed
  - terminal_exec for advanced operations
- **AND** it SHALL validate file operations

### Requirement: API Integration Task Configuration
The system SHALL provide a task template for API integration tasks.

#### Scenario: API integration task identification
- **WHEN** user requests API operations
- **THEN** the brain SHALL identify it as api_integration task type
- **AND** it SHALL use api_integration task template
- **AND** it SHALL plan steps: authenticate → call API → process response → format output

#### Scenario: API integration tool sequence
- **WHEN** executing API integration task
- **THEN** the brain SHALL follow template's tool sequence:
  - python_run or node_run for API calls
  - python_run for response processing
  - file_create for API response storage
- **AND** it SHALL handle authentication and error cases

### Requirement: Database Query Task Configuration
The system SHALL provide a task template for database query tasks.

#### Scenario: Database query task identification
- **WHEN** user requests database operations
- **THEN** the brain SHALL identify it as database_query task type
- **AND** it SHALL use database_query task template
- **AND** it SHALL plan steps: connect → query → process results → format output

#### Scenario: Database query tool sequence
- **WHEN** executing database query task
- **THEN** the brain SHALL follow template's tool sequence:
  - python_run for database connection
  - python_run for SQL query execution
  - python_run for result processing
  - file_create for query results
- **AND** it SHALL handle database credentials securely

### Requirement: Report Generation Task Configuration
The system SHALL provide a task template for report generation tasks.

#### Scenario: Report generation task identification
- **WHEN** user requests report generation
- **THEN** the brain SHALL identify it as report_generation task type
- **AND** it SHALL use report_generation task template
- **AND** it SHALL plan steps: gather data → analyze → format → generate report

#### Scenario: Report generation tool sequence
- **WHEN** executing report generation task
- **THEN** the brain SHALL follow template's tool sequence:
  - data collection (browser_search, file_read, database_query)
  - python_run for data analysis
  - python_run for report formatting
  - file_create for report document
- **AND** it SHALL support multiple report formats

### Requirement: Task Template Management
The system SHALL provide management capabilities for task templates.

#### Scenario: Template creation
- **WHEN** an administrator creates a new task template
- **THEN** the system SHALL validate template structure
- **AND** it SHALL store template in database
- **AND** it SHALL assign a unique template ID

#### Scenario: Template update
- **WHEN** an administrator updates a task template
- **THEN** the system SHALL validate updated template
- **AND** it SHALL update template in database
- **AND** it SHALL maintain template version history

#### Scenario: Template query
- **WHEN** the brain needs a task template
- **THEN** it SHALL query templates by task_type
- **AND** it SHALL return matching templates
- **AND** it SHALL support template priority and selection

### Requirement: Tool Execution Configuration
Tool configurations SHALL determine how the brain commands E2B during tool execution.

#### Scenario: E2B command generation
- **WHEN** the brain needs to execute a tool
- **THEN** it SHALL load tool execution configuration
- **AND** it SHALL use configuration's command generation template
- **AND** it SHALL map tool parameters to E2B command format

#### Scenario: Parameter mapping
- **WHEN** generating E2B commands
- **THEN** the brain SHALL use tool configuration's parameter mapping rules
- **AND** it SHALL convert tool parameters to E2B command parameters
- **AND** it SHALL validate parameter format

#### Scenario: Error handling configuration
- **WHEN** tool execution fails
- **THEN** the brain SHALL use tool configuration's error handling strategy
- **AND** it SHALL apply retry configuration if specified
- **AND** it SHALL handle errors according to tool-specific rules

#### Scenario: Output format configuration
- **WHEN** tool execution completes
- **THEN** the brain SHALL use tool configuration's expected output format
- **AND** it SHALL parse E2B output according to configuration
- **AND** it SHALL validate output format

### Requirement: Task Template Structure
Task templates SHALL have a structured format for planning and execution.

#### Scenario: Template structure
- **WHEN** a task template is created
- **THEN** it SHALL include:
  - task_type: unique identifier (weather_query, stock_query, etc.)
  - task_name: human-readable name
  - planning_strategy: JSON structure defining planning steps
  - tool_sequence: ordered list of tools to use
  - tool_configurations: tool-specific execution configurations
  - validation_rules: success criteria and validation logic
  - e2b_instructions: how brain should command E2B

#### Scenario: Planning strategy format
- **WHEN** a task template defines planning strategy
- **THEN** it SHALL include:
  - required_inputs: what information is needed
  - planning_steps: sequence of planning actions
  - tool_selection_rules: how to select tools
  - expected_outputs: what results are expected

#### Scenario: Tool sequence format
- **WHEN** a task template defines tool sequence
- **THEN** it SHALL include:
  - ordered list of tools
  - tool dependencies
  - parallel execution opportunities
  - data flow between tools

### Requirement: E2B Command Instructions
Task templates SHALL include instructions for how the brain should command E2B.

#### Scenario: Command template
- **WHEN** a task template includes E2B instructions
- **THEN** it SHALL provide command templates for each tool
- **AND** templates SHALL include parameter placeholders
- **AND** templates SHALL specify command format

#### Scenario: Command generation
- **WHEN** the brain generates E2B commands
- **THEN** it SHALL use task template's E2B instructions
- **AND** it SHALL substitute parameters from tool execution
- **AND** it SHALL format commands according to template

#### Scenario: Command validation
- **WHEN** E2B commands are generated
- **THEN** the brain SHALL validate commands against template
- **AND** it SHALL ensure required parameters are present
- **AND** it SHALL check command format correctness
