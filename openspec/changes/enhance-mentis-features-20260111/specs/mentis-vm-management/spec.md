## MODIFIED Requirements

### Requirement: VM Management
The system SHALL provide comprehensive virtual machine management capabilities for Mentis super agent VM operations.

#### Scenario: VM template creation
- **WHEN** a user creates a VM template with name, description, image, configuration (CPU, memory, disk), and startup scripts
- **THEN** the system SHALL save the template
- **AND** the system SHALL assign a unique template ID

#### Scenario: VM template usage
- **WHEN** a user creates a VM from a template
- **THEN** the system SHALL create a VM instance with template configuration
- **AND** the system SHALL start the VM with template startup scripts

#### Scenario: VM resource monitoring
- **WHEN** a user requests VM resource monitoring
- **THEN** the system SHALL return real-time resource usage including CPU usage, memory usage, disk usage, and network traffic
- **AND** the system SHALL support historical resource data queries

#### Scenario: VM snapshot creation
- **WHEN** a user creates a VM snapshot with name and description
- **THEN** the system SHALL create a snapshot of the current VM state
- **AND** the system SHALL assign a unique snapshot ID and version number
- **AND** the system SHALL save snapshot metadata

#### Scenario: VM snapshot restoration
- **WHEN** a user restores a VM from a snapshot
- **THEN** the system SHALL restore the VM to the snapshot state
- **AND** the system SHALL preserve snapshot history

#### Scenario: VM lifecycle management
- **WHEN** a user starts a stopped VM
- **THEN** the system SHALL start the VM
- **AND** the system SHALL update VM status to running

- **WHEN** a user stops a running VM
- **THEN** the system SHALL stop the VM gracefully
- **AND** the system SHALL update VM status to stopped

- **WHEN** a user restarts a running VM
- **THEN** the system SHALL restart the VM
- **AND** the system SHALL preserve VM state

- **WHEN** a user pauses a running VM
- **THEN** the system SHALL pause the VM
- **AND** the system SHALL update VM status to paused

#### Scenario: VM resource quota management
- **WHEN** a user sets resource quotas for a VM (CPU, memory, disk, network)
- **THEN** the system SHALL enforce the quotas
- **AND** the system SHALL prevent resource usage exceeding quotas
- **AND** the system SHALL notify users when quotas are approaching limits
