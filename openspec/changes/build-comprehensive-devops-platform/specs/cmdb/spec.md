# CMDB Capability Specification

## ADDED Requirements

### Requirement: Asset Management
The system SHALL provide capabilities to manage IT assets including servers, databases, applications, services, dependencies, and configuration items.

#### Scenario: Create Asset
Given an administrator wants to register a new server asset
When they provide asset details (name, type, location, owner)
Then the system SHALL create the asset record
And the asset SHALL be assigned a unique identifier
And the asset SHALL be stored in the CMDB database
And the creation SHALL be recorded in the asset history

#### Scenario: Update Asset
Given an asset exists in the CMDB
When an administrator updates asset attributes
Then the system SHALL update the asset record
And the old values SHALL be preserved in the asset history
And the update SHALL be recorded with timestamp and user

#### Scenario: Delete Asset
Given an asset exists in the CMDB
When an administrator deletes the asset
Then the system SHALL mark the asset as deleted (soft delete)
And the deletion SHALL be recorded in the asset history
And all relationships involving the asset SHALL be marked as inactive

### Requirement: Asset Relationship Management
The system SHALL support defining and managing relationships between assets.

#### Scenario: Create Relationship
Given two assets exist in the CMDB
When an administrator creates a relationship between them (e.g., DEPENDS_ON, DEPLOYED_ON)
Then the system SHALL create the relationship record
And the relationship SHALL be bidirectional queryable
And the relationship SHALL be stored with relationship type and properties

#### Scenario: Query Relationships
Given assets with relationships exist in the CMDB
When an administrator queries relationships for an asset
Then the system SHALL return all related assets
And the system SHALL return relationship types and properties
And the system SHALL support filtering by relationship type

#### Scenario: Visualize Relationships
Given assets with relationships exist in the CMDB
When an administrator requests a relationship graph
Then the system SHALL generate a visual graph of asset relationships
And the graph SHALL be interactive
And the graph SHALL support filtering and zooming

### Requirement: Asset History and Audit
The system SHALL maintain a complete history of all asset changes and provide audit capabilities.

#### Scenario: View Asset History
Given an asset exists in the CMDB
When an administrator views the asset history
Then the system SHALL display all changes to the asset
And each change SHALL include timestamp, user, action, and value changes
And the history SHALL be ordered chronologically

#### Scenario: Audit Trail
Given asset operations occur in the CMDB
When an administrator requests an audit trail
Then the system SHALL provide a complete log of all operations
And the log SHALL include user, action, timestamp, and details
And the log SHALL be searchable and filterable

### Requirement: Asset Auto-Discovery
The system SHALL automatically discover and register assets from various sources.

#### Scenario: Discover Servers
Given SSH credentials are configured
When the auto-discovery process runs
Then the system SHALL scan for servers via SSH
And discovered servers SHALL be registered as assets
And server attributes (OS, CPU, memory, disk) SHALL be captured

#### Scenario: Discover Databases
Given database connection credentials are configured
When the auto-discovery process runs
Then the system SHALL scan for database instances
And discovered databases SHALL be registered as assets
And database attributes (type, version, size) SHALL be captured

#### Scenario: Discover Applications
Given deployment information is available
When the auto-discovery process runs
Then the system SHALL scan deployments from the pipeline
And discovered applications SHALL be registered as assets
And application attributes (name, version, environment) SHALL be captured

### Requirement: Asset Monitoring
The system SHALL monitor asset status and health, and provide alerts.

#### Scenario: Monitor Asset Status
Given assets exist in the CMDB
When the monitoring process runs
Then the system SHALL check asset status
And the system SHALL update asset status in the CMDB
And status changes SHALL trigger notifications

#### Scenario: Asset Health Check
Given assets with health check endpoints exist
When the health check process runs
Then the system SHALL perform health checks
And health check results SHALL be stored
And unhealthy assets SHALL trigger alerts

### Requirement: Asset Search and Filter
The system SHALL provide search and filter capabilities for assets.

#### Scenario: Search Assets
Given assets exist in the CMDB
When an administrator searches for assets by name or attribute
Then the system SHALL return matching assets
And the search SHALL support partial matching
And the search SHALL be case-insensitive

#### Scenario: Filter Assets
Given assets exist in the CMDB
When an administrator applies filters (type, status, owner, etc.)
Then the system SHALL return filtered assets
And multiple filters SHALL be combinable
And filter results SHALL be sortable
