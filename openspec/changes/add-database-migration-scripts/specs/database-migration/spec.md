# Database Migration Capability

## ADDED Requirements

### Requirement: Database Schema Comparison
The system SHALL compare database schemas between local and remote databases to identify differences in tables, columns, and indexes.

#### Scenario: Compare local and remote schemas
- **WHEN** the migration script is executed with comparison mode
- **THEN** the script SHALL:
  - Export table structures from both local and remote databases
  - Compare table definitions, column definitions, and index definitions
  - Generate a diff report showing missing tables, missing columns, and missing indexes
  - Save the report to a file for review

#### Scenario: Handle connection failures
- **WHEN** the script cannot connect to local or remote database
- **THEN** the script SHALL:
  - Display a clear error message with connection details
  - Exit with a non-zero status code
  - Not proceed with migration

### Requirement: Table Structure Synchronization
The system SHALL synchronize table structures from local to remote database by creating missing tables and adding missing columns and indexes.

#### Scenario: Create missing tables
- **WHEN** a table exists in local database but not in remote database
- **THEN** the script SHALL:
  - Export the table creation statement from local database
  - Execute the creation statement on remote database
  - Verify the table was created successfully
  - Log the operation

#### Scenario: Add missing columns
- **WHEN** a table exists in both databases but has missing columns in remote database
- **THEN** the script SHALL:
  - Identify missing columns by comparing column definitions
  - Generate ALTER TABLE statements to add missing columns
  - Execute ALTER TABLE statements on remote database
  - Verify columns were added successfully
  - Log the operation

#### Scenario: Add missing indexes
- **WHEN** a table exists in both databases but has missing indexes in remote database
- **THEN** the script SHALL:
  - Identify missing indexes by comparing index definitions
  - Generate CREATE INDEX statements for missing indexes
  - Execute CREATE INDEX statements on remote database
  - Verify indexes were created successfully
  - Log the operation

#### Scenario: Preserve existing data
- **WHEN** adding columns or indexes to existing tables
- **THEN** the script SHALL:
  - Not delete or modify existing columns
  - Not delete existing indexes
  - Preserve all existing data in the table

### Requirement: System Data Synchronization
The system SHALL completely synchronize system configuration data from local to remote database.

#### Scenario: Sync system configuration tables
- **WHEN** system tables (tables with `system_` prefix) exist in both databases
- **THEN** the script SHALL:
  - Export all data from local system tables
  - Use INSERT ... ON DUPLICATE KEY UPDATE to sync data to remote tables
  - Update existing records and insert new records
  - Verify data count matches between local and remote after sync

#### Scenario: Sync system preset data
- **WHEN** system preset tables (e.g., `system_eras`, `system_characters`, `system_worlds`) need synchronization
- **THEN** the script SHALL:
  - Export data from local system preset tables
  - Sync to remote using INSERT ... ON DUPLICATE KEY UPDATE
  - Preserve existing data if no changes detected
  - Log all insertions and updates

### Requirement: User Data Partial Synchronization
The system SHALL partially synchronize user data by only updating image-related fields.

#### Scenario: Update user image URLs
- **WHEN** user tables contain image-related fields (avatar_url, image_url, background_url, etc.)
- **THEN** the script SHALL:
  - Identify all image-related columns in user tables
  - Compare image URLs between local and remote for the same records
  - Update remote image URLs to match local values
  - Log all updates

#### Scenario: Skip non-image user data
- **WHEN** user tables contain non-image fields
- **THEN** the script SHALL:
  - Not modify non-image user data fields
  - Preserve all user data except image-related fields
  - Log skipped fields

### Requirement: Migration Safety
The system SHALL ensure migration safety by providing backup, dry-run, and rollback capabilities.

#### Scenario: Pre-migration backup
- **WHEN** migration script is executed
- **THEN** the script SHALL:
  - Create a backup of remote database before any changes
  - Save backup to a timestamped file
  - Verify backup was created successfully
  - Log backup location

#### Scenario: Dry-run mode
- **WHEN** migration script is executed with --dry-run flag
- **THEN** the script SHALL:
  - Perform all comparison and analysis
  - Generate a report of operations that would be performed
  - Not execute any actual database modifications
  - Display the report to user

#### Scenario: Migration logging
- **WHEN** migration script performs any operation
- **THEN** the script SHALL:
  - Log all operations to a log file
  - Include timestamps, operation type, and affected tables
  - Log errors with full error messages
  - Save log file for review

### Requirement: Configuration Management
The system SHALL support configuration for local and production database connections.

#### Scenario: Read database configuration
- **WHEN** migration script is executed
- **THEN** the script SHALL:
  - Read database connection settings from configuration file or environment variables
  - Support local database: localhost:3306, user: root, password: 123456
  - Support production database: rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com:3306, user: heartsphere, database: heartsphere
  - Prompt for password if not provided in configuration

#### Scenario: Environment variable override
- **WHEN** environment variables are set for database connection
- **THEN** the script SHALL:
  - Use environment variable values over configuration file values
  - Allow password to be provided via environment variable or interactive prompt
  - Not store passwords in log files
