## ADDED Requirements

### Requirement: Multi-Datasource Support
The admin application SHALL support multiple datasources to access different project databases.

#### Scenario: Admin accesses its own database
- **Given** the admin application is running
- **When** accessing admin-specific data (e.g., admin users, API keys)
- **Then** it MUST use the admin datasource (default datasource)
- **And** the connection MUST be to the `heartsphere` database

#### Scenario: Admin accesses mentis project database
- **Given** the admin application has mentis datasource configured
- **When** a service method is annotated with `@DataSource("mentis")`
- **Then** it MUST switch to the mentis datasource
- **And** the connection MUST be to the `heartsphere_mentis` database
- **And** after the method completes, it MUST switch back to the admin datasource

#### Scenario: Admin accesses edu project database
- **Given** the admin application has edu datasource configured
- **When** a service method is annotated with `@DataSource("edu")`
- **Then** it MUST switch to the edu datasource
- **And** the connection MUST be to the `heartsphere_edu` database
- **And** after the method completes, it MUST switch back to the admin datasource

#### Scenario: Admin accesses main project data
- **Given** the admin application needs to access main project data
- **When** accessing main project data
- **Then** it MUST use the admin datasource (default datasource)
- **And** the connection MUST be to the `heartsphere` database
- **Note**: Main project shares the same database as admin project, no separate datasource needed

#### Scenario: Admin accesses company project data
- **Given** the admin application needs to access company project data
- **When** accessing company project data
- **Then** it MUST use the admin datasource (default datasource)
- **And** the connection MUST be to the `heartsphere` database
- **Note**: Company project shares the same database as admin project, no separate datasource needed

### Requirement: Datasource Configuration
The admin application SHALL support configuring multiple datasources in `application.yml`.

#### Scenario: Multiple datasources are configured
- **Given** the admin application configuration file
- **When** multiple datasources are defined (admin, mentis, edu, company, main)
- **Then** each datasource MUST have its own configuration section
- **And** each datasource MUST specify `url`, `username`, and `password`
- **And** the admin datasource MUST be marked as the primary datasource

### Requirement: Datasource Routing
The admin application SHALL support dynamic datasource routing using thread-local context.

#### Scenario: Datasource routing based on annotation
- **Given** a service method annotated with `@DataSource("mentis")`
- **When** the method is called
- **Then** the datasource router MUST detect the annotation
- **And** it MUST set the datasource key in thread-local context
- **And** it MUST route the connection to the mentis datasource
- **And** after the method completes, it MUST clear the thread-local context

#### Scenario: Default datasource when no annotation
- **Given** a service method without `@DataSource` annotation
- **When** the method is called
- **Then** it MUST use the admin datasource (default)
- **And** no datasource switching MUST occur

### Requirement: Transaction Management
Each datasource SHALL have its own transaction manager, and cross-datasource transactions are NOT supported.

#### Scenario: Transaction within single datasource
- **Given** a service method annotated with `@DataSource("edu")`
- **And** the method is also annotated with `@Transactional`
- **When** the method executes database operations
- **Then** all operations MUST use the edu datasource
- **And** the transaction MUST be managed by the edu transaction manager

#### Scenario: No cross-datasource transactions
- **Given** two service methods using different datasources
- **When** both methods are called in the same transaction context
- **Then** each method MUST use its own datasource
- **And** transactions MUST NOT span across datasources
