## ADDED Requirements

### Requirement: Port Assignment Documentation
The system SHALL maintain clear documentation of port assignments for all project services.

#### Scenario: View port assignments
- **WHEN** a developer needs to know which ports are used by which services
- **THEN** they can consult `scripts/ports.md` to see all port assignments
- **AND** the documentation lists both backend and frontend ports for each project

### Requirement: Automatic Port Conflict Resolution
The system SHALL automatically kill processes occupying required ports before starting services.

#### Scenario: Port conflict resolution on startup
- **WHEN** a startup script is executed for a service requiring port X
- **AND** port X is already occupied by another process
- **THEN** the script kills the process occupying port X
- **AND** the script then starts the requested service on port X

#### Scenario: Port available on startup
- **WHEN** a startup script is executed for a service requiring port X
- **AND** port X is not occupied
- **THEN** the script starts the service directly without killing any processes

### Requirement: Individual Project Startup Scripts
The system SHALL provide startup scripts for each project's backend and frontend services.

#### Scenario: Start main backend service
- **WHEN** a developer runs `scripts/start-backend.sh`
- **THEN** the script kills any process on port 8081
- **AND** starts the main backend service on port 8081
- **AND** the service runs in the background

#### Scenario: Start main frontend service
- **WHEN** a developer runs `scripts/start-frontend.sh`
- **THEN** the script kills any process on port 3000
- **AND** starts the main frontend service on port 3000
- **AND** the service runs in the background

#### Scenario: Start education backend service
- **WHEN** a developer runs `scripts/start-edu-backend.sh`
- **THEN** the script kills any process on port 8084
- **AND** starts the education backend service on port 8084
- **AND** the service runs in the background

#### Scenario: Start education frontend service
- **WHEN** a developer runs `scripts/start-edu-frontend.sh`
- **THEN** the script kills any process on port 3001
- **AND** starts the education frontend service on port 3001
- **AND** the service runs in the background

#### Scenario: Start admin backend service
- **WHEN** a developer runs `scripts/start-admin-backend.sh`
- **THEN** the script kills any process on port 8085
- **AND** starts the admin backend service on port 8085
- **AND** the service runs in the background

#### Scenario: Start admin frontend service
- **WHEN** a developer runs `scripts/start-admin-frontend.sh`
- **THEN** the script kills any process on port 3005
- **AND** starts the admin frontend service on port 3005
- **AND** the service runs in the background

#### Scenario: Start mentis backend service
- **WHEN** a developer runs `scripts/start-mentis-backend.sh`
- **THEN** the script kills any process on port 8082
- **AND** starts the mentis backend service on port 8082
- **AND** the service runs in the background

#### Scenario: Start mentis frontend service
- **WHEN** a developer runs `scripts/start-mentis-frontend.sh`
- **THEN** the script kills any process on port 3002
- **AND** starts the mentis frontend service on port 3002
- **AND** the service runs in the background

#### Scenario: Start company backend service
- **WHEN** a developer runs `scripts/start-company-backend.sh`
- **THEN** the script kills any process on port 8083
- **AND** starts the company backend service on port 8083
- **AND** the service runs in the background

#### Scenario: Start company frontend service
- **WHEN** a developer runs `scripts/start-company-frontend.sh`
- **THEN** the script kills any process on port 3003
- **AND** starts the company frontend service on port 3003
- **AND** the service runs in the background

### Requirement: Unified Startup Script
The system SHALL provide a unified script to start all services or selected services.

#### Scenario: Start all services
- **WHEN** a developer runs `scripts/start-all.sh`
- **THEN** the script starts all backend and frontend services
- **AND** each service is started with proper port conflict resolution
- **AND** services run in the background

#### Scenario: Stop all services
- **WHEN** a developer runs `scripts/stop-all.sh`
- **THEN** the script stops all running project services
- **AND** processes are terminated gracefully

### Requirement: Port Utility Functions
The system SHALL provide reusable utility functions for port management.

#### Scenario: Kill process on port
- **WHEN** `kill_port_process()` function is called with a port number
- **THEN** the function identifies the process using that port
- **AND** kills the process if one exists
- **AND** returns success status

#### Scenario: Check port availability
- **WHEN** `check_port_available()` function is called with a port number
- **THEN** the function checks if the port is available
- **AND** returns true if available, false if occupied
