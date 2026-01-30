# Result Presentation Specification Delta

## ADDED Requirements

### Requirement: Text Result Viewer
The system SHALL provide a text result viewer component for displaying plain text results.

#### Scenario: Display text result
- **WHEN** a task result contains plain text
- **THEN** the system SHALL render it using the text viewer component
- **AND** the text SHALL be formatted with proper line breaks and spacing

#### Scenario: Long text handling
- **WHEN** text result exceeds a certain length (e.g., 1000 characters)
- **THEN** the system SHALL provide a "展开" (Expand) button
- **AND** allow users to expand/collapse the full text

### Requirement: List Result Viewer
The system SHALL provide a list result viewer component for displaying structured list data.

#### Scenario: Display list result
- **WHEN** a task result contains a list of items
- **THEN** the system SHALL render it as a bulleted or numbered list
- **AND** each item SHALL be displayed on a separate line

#### Scenario: Nested list support
- **WHEN** a list contains nested sub-lists
- **THEN** the system SHALL render nested lists with proper indentation
- **AND** maintain visual hierarchy

### Requirement: Table Result Viewer
The system SHALL provide a table result viewer component for displaying tabular data.

#### Scenario: Display table result
- **WHEN** a task result contains tabular data
- **THEN** the system SHALL render it as a table
- **AND** the table SHALL include headers and rows

#### Scenario: Large table handling
- **WHEN** a table has many rows (e.g., >50)
- **THEN** the system SHALL provide pagination
- **AND** allow users to navigate between pages

#### Scenario: Table sorting
- **WHEN** displaying a table
- **THEN** the system SHALL allow sorting by column
- **AND** clicking a column header SHALL toggle sort order

### Requirement: Chart Result Viewer
The system SHALL provide a chart result viewer component for displaying various chart types.

#### Scenario: Display line chart
- **WHEN** a task result contains time-series data
- **THEN** the system SHALL render it as a line chart
- **AND** the chart SHALL include axes labels and legend

#### Scenario: Display bar chart
- **WHEN** a task result contains categorical data
- **THEN** the system SHALL render it as a bar chart
- **AND** the chart SHALL be properly labeled

#### Scenario: Display pie chart
- **WHEN** a task result contains proportional data
- **THEN** the system SHALL render it as a pie chart
- **AND** the chart SHALL show percentages

#### Scenario: Display scatter plot
- **WHEN** a task result contains two-dimensional data
- **THEN** the system SHALL render it as a scatter plot
- **AND** the chart SHALL include axis labels

### Requirement: Image Result Viewer
The system SHALL provide an image result viewer component for displaying images.

#### Scenario: Display image result
- **WHEN** a task result contains an image (base64 or URL)
- **THEN** the system SHALL render it using the image viewer component
- **AND** the image SHALL be properly sized and centered

#### Scenario: Image zoom
- **WHEN** displaying an image
- **THEN** the system SHALL allow users to click to zoom
- **AND** provide a zoomed view with pan capability

#### Scenario: Multiple images
- **WHEN** a task result contains multiple images
- **THEN** the system SHALL display them in a grid layout
- **AND** allow users to click each image to view full size

### Requirement: Result Format Auto-detection
The system SHALL automatically detect the result format and select the appropriate viewer component.

#### Scenario: Auto-detect text format
- **WHEN** a task result is a plain string
- **THEN** the system SHALL use the text viewer component

#### Scenario: Auto-detect list format
- **WHEN** a task result is an array of strings
- **THEN** the system SHALL use the list viewer component

#### Scenario: Auto-detect table format
- **WHEN** a task result is an array of objects with consistent keys
- **THEN** the system SHALL use the table viewer component

#### Scenario: Auto-detect chart format
- **WHEN** a task result contains chart metadata (type, data, labels)
- **THEN** the system SHALL use the chart viewer component

#### Scenario: Auto-detect image format
- **WHEN** a task result contains image data (base64 or URL)
- **THEN** the system SHALL use the image viewer component

### Requirement: Mixed Format Support
The system SHALL support displaying results that contain multiple formats.

#### Scenario: Display mixed format result
- **WHEN** a task result contains both text and a table
- **THEN** the system SHALL render both components
- **AND** maintain proper spacing between components

#### Scenario: Display result with multiple charts
- **WHEN** a task result contains multiple charts
- **THEN** the system SHALL render all charts
- **AND** arrange them in a grid layout
