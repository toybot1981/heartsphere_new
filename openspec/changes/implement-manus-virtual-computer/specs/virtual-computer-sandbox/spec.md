## ADDED Requirements

### Requirement: Virtual Computer Sandbox Creation
The system SHALL provide the ability to create isolated virtual computer sandboxes with a complete operating system environment.

#### Scenario: Create sandbox with default configuration
- **WHEN** a user requests to create a new sandbox
- **THEN** the system creates an E2B sandbox (Firecracker microVM) with Ubuntu 22.04 LTS, XFCE4 desktop environment, Chromium browser, VNC server, Python 3.10+, and Node.js 18+ (all pre-configured by E2B)
- **AND** the sandbox is assigned a unique ID (E2B sandbox ID)
- **AND** the sandbox is ready for use within 150ms (E2B typical startup time)

#### Scenario: Create sandbox with custom configuration
- **WHEN** a user requests to create a sandbox with custom CPU, memory, or disk limits
- **THEN** the system creates a sandbox with the specified resource limits
- **AND** the sandbox configuration is validated before creation

#### Scenario: Sandbox creation failure
- **WHEN** sandbox creation fails due to resource constraints or system errors
- **THEN** the system returns an error message with details
- **AND** no partial sandbox is left in the system

### Requirement: Sandbox Lifecycle Management
The system SHALL provide the ability to start, stop, pause, resume, and delete sandboxes.

#### Scenario: Start stopped sandbox
- **WHEN** a user requests to start a stopped sandbox
- **THEN** the E2B sandbox is started (or recreated if needed)
- **AND** the sandbox state is updated to "running"
- **AND** the sandbox is accessible within 150ms (E2B startup time)

#### Scenario: Stop running sandbox
- **WHEN** a user requests to stop a running sandbox
- **THEN** the sandbox container is gracefully stopped
- **AND** the sandbox state is updated to "stopped"
- **AND** the sandbox state is preserved for later resumption

#### Scenario: Delete sandbox
- **WHEN** a user requests to delete a sandbox
- **THEN** the E2B sandbox is deleted via E2B API
- **AND** all associated data are removed (E2B handles cleanup)
- **AND** the sandbox ID is invalidated
- **AND** any active connections to the sandbox are terminated

### Requirement: VNC Remote Desktop Access
The system SHALL provide VNC server access to sandbox desktop environments.

#### Scenario: Connect to sandbox via VNC
- **WHEN** a user requests VNC connection details for a sandbox
- **THEN** the system returns E2B VNC connection URL and credentials (provided by E2B)
- **AND** the VNC server is accessible from the network (E2B manages VNC server)
- **AND** the connection supports standard VNC protocols (WebSocket or TCP, as provided by E2B)

#### Scenario: VNC connection security
- **WHEN** a user connects to a sandbox via VNC
- **THEN** the connection requires authentication
- **AND** the connection is encrypted (TLS/SSL)
- **AND** the connection is isolated to the specific sandbox

### Requirement: Sandbox Resource Monitoring
The system SHALL provide the ability to monitor sandbox resource usage (CPU, memory, disk, network).

#### Scenario: Get sandbox resource usage
- **WHEN** a user requests sandbox resource usage information
- **THEN** the system returns current CPU, memory, disk, and network usage
- **AND** the information is updated in real-time or near real-time

#### Scenario: Resource limit enforcement
- **WHEN** a sandbox exceeds its configured resource limits
- **THEN** the system enforces the limits (e.g., CPU throttling, memory limits)
- **AND** the system notifies the user or monitoring system
- **AND** the sandbox continues to operate within limits

### Requirement: Sandbox Snapshot and Checkpoint
The system SHALL provide the ability to create and restore sandbox snapshots/checkpoints.

#### Scenario: Create sandbox checkpoint
- **WHEN** a user requests to create a checkpoint for a sandbox
- **THEN** the system creates an E2B checkpoint via E2B API (saves filesystem, running processes, etc.)
- **AND** the checkpoint is assigned a unique ID (E2B checkpoint ID)
- **AND** the checkpoint creation completes within E2B's typical time (usually < 10 seconds)

#### Scenario: Restore sandbox from checkpoint
- **WHEN** a user requests to restore a sandbox from a checkpoint
- **THEN** the system restores the E2B sandbox from the checkpoint via E2B API
- **AND** all files, processes, and configurations are restored (E2B handles restoration)
- **AND** the restoration completes within E2B's typical time (usually < 10 seconds)

#### Scenario: List sandbox checkpoints
- **WHEN** a user requests to list checkpoints for a sandbox
- **THEN** the system returns a list of all available checkpoints with timestamps
- **AND** the list includes checkpoint metadata (size, creation time, description)

### Requirement: Sandbox Isolation and Security
The system SHALL ensure sandboxes are isolated from each other and the host system.

#### Scenario: Sandbox network isolation
- **WHEN** multiple sandboxes are running
- **THEN** each E2B sandbox has isolated network namespace (E2B provides OS-level isolation)
- **AND** sandboxes cannot directly access each other's network resources (E2B enforces isolation)
- **AND** sandboxes can only access external networks through E2B's configured policies

#### Scenario: Sandbox filesystem isolation
- **WHEN** multiple sandboxes are running
- **THEN** each E2B sandbox has isolated filesystem (E2B provides OS-level isolation)
- **AND** sandboxes cannot access each other's files (E2B enforces isolation)
- **AND** sandboxes cannot access host system files (E2B provides complete isolation)

#### Scenario: Sandbox process isolation
- **WHEN** multiple sandboxes are running
- **THEN** each E2B sandbox has isolated process namespace (E2B provides OS-level isolation via Firecracker)
- **AND** sandboxes cannot see or interact with processes in other sandboxes (E2B enforces isolation)
- **AND** sandboxes cannot see or interact with host system processes (E2B provides complete isolation)
