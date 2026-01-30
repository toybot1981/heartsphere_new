## ADDED Requirements

### Requirement: SSE Stream Hook
The system SHALL provide a unified React Hook for consuming SSE streams with automatic reconnection and error handling.

#### Scenario: Using SSE Hook
- **WHEN** a component needs to consume SSE stream
- **THEN** the component uses `useSseStream<T>(options)` Hook
- **AND** the Hook manages EventSource connection lifecycle
- **AND** the Hook automatically reconnects on connection loss
- **AND** the Hook provides connection status (connecting, connected, disconnected, error)

#### Scenario: Event handling
- **WHEN** SSE events are received
- **THEN** the Hook calls appropriate event handlers based on event type
- **AND** event handlers are defined in `options.eventHandlers` object
- **AND** event data is typed according to generic type `T`
- **AND** unknown event types are logged but not cause errors

#### Scenario: Automatic reconnection
- **WHEN** SSE connection is lost
- **THEN** the Hook automatically attempts to reconnect
- **AND** reconnection attempts are limited (configurable, default 5)
- **AND** reconnection uses exponential backoff
- **AND** reconnection can be disabled via `autoReconnect: false`

#### Scenario: Connection state management
- **WHEN** using SSE Hook
- **THEN** the Hook provides connection state:
- **AND** `isConnecting` - connection is being established
- **AND** `isConnected` - connection is active
- **AND** `isDisconnected` - connection is closed
- **AND** `error` - connection error (if any)
- **AND** `reconnectAttempts` - number of reconnection attempts

#### Scenario: Enabling/disabling connection
- **WHEN** `enabled` option is false
- **THEN** the Hook does not establish connection
- **AND** existing connection is closed if `enabled` changes to false
- **AND** connection is established when `enabled` changes to true

### Requirement: SSE Client Utility
The system SHALL provide utility functions for SSE client operations.

#### Scenario: Creating SSE connection
- **WHEN** creating an SSE connection manually
- **THEN** the system provides `createSseConnection(url, options)` function
- **AND** the function returns an EventSource with configured options
- **AND** the function handles URL construction and authentication

#### Scenario: Parsing SSE events
- **WHEN** receiving SSE events
- **THEN** the system provides `parseSseEvent(event)` function
- **AND** the function parses standard event format
- **AND** the function handles malformed events gracefully

### Requirement: SSE Type Definitions
The system SHALL provide TypeScript type definitions for SSE events and configurations.

#### Scenario: Type-safe SSE events
- **WHEN** using SSE Hook or client
- **THEN** event data is typed according to `SseEvent<T>` interface
- **AND** event types are defined in `SseEventType` enum
- **AND** configuration options are typed in `SseStreamOptions<T>` interface

#### Scenario: Standard event format
- **WHEN** receiving SSE events
- **THEN** events conform to `SseEvent<T>` interface:
- **AND** `type: string` - event type
- **AND** `timestamp: number` - event timestamp
- **AND** `data: T` - event data (generic type)
- **AND** `id?: string` - optional event ID
