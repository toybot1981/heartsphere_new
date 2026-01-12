# Education Platform Code Separation Specification

## ADDED Requirements

### Requirement: Independent Education Platform Structure
The education platform SHALL be a fully independent client system, with separate frontend and backend directories under `edu/`.

#### Scenario: Education platform directory structure
- **WHEN** the education platform is deployed
- **THEN** it SHALL have the structure `edu/frontend/` and `edu/backend/`
- **AND** the frontend SHALL be independently buildable and deployable
- **AND** the backend SHALL be independently runnable

#### Scenario: Code migration from frontend-edu
- **WHEN** migrating code from `frontend-edu/` directory
- **THEN** all source files SHALL be moved to `edu/frontend/src/`
- **AND** all configuration files (package.json, vite.config.ts, etc.) SHALL be updated
- **AND** all import paths SHALL be corrected to reflect the new structure
- **AND** the application SHALL compile and run successfully after migration

#### Scenario: Admin edu code integration
- **WHEN** integrating `admin-edu/` code
- **THEN** pages SHALL be moved to `admin/frontend/src/pages/edu/`
- **AND** components SHALL be moved to `admin/frontend/src/components/edu/`
- **AND** routes SHALL be added to admin frontend routing system
- **AND** navigation menu SHALL include edu management items

### Requirement: Database Isolation
The education platform SHALL use a completely independent database `heartsphere_edu`, isolated from the main system database.

#### Scenario: Independent database connection
- **WHEN** the education backend starts
- **THEN** it SHALL connect to the `heartsphere_edu` database
- **AND** it SHALL NOT access the main system database
- **AND** database connection configuration SHALL be separate from main system

#### Scenario: Database table naming
- **WHEN** creating tables in the education database
- **THEN** all table names SHALL use the `edu_` prefix (e.g., `edu_students`, `edu_teachers`)
- **AND** table structures SHALL follow the same conventions as main system tables

#### Scenario: Database migration management
- **WHEN** managing database schema changes
- **THEN** Flyway migration scripts SHALL be located in `edu/backend/src/main/resources/db/migration/`
- **AND** migration scripts SHALL follow naming convention `V{version}__{description}.sql`
- **AND** migrations SHALL be independent of main system migrations

### Requirement: Code Separation Strategy
The education platform SHALL have clear separation between independent code and shared code.

#### Scenario: Independent education-specific code
- **WHEN** implementing education-specific features
- **THEN** business entities SHALL be located in `edu/backend/src/main/java/com/heartsphere/edu/entity/`
- **AND** business services SHALL be located in `edu/backend/src/main/java/com/heartsphere/edu/service/`
- **AND** controllers SHALL be located in `edu/backend/src/main/java/com/heartsphere/edu/controller/`
- **AND** frontend pages and components SHALL be located in `edu/frontend/src/`

#### Scenario: Shared module usage
- **WHEN** using shared functionality
- **THEN** AI service interfaces SHALL be accessed through `shared/backend` module
- **AND** authentication framework SHALL use shared JWT and Spring Security configuration
- **AND** common DTOs and utilities SHALL be accessed through `shared/backend` or `shared/frontend` modules
- **AND** file upload and storage services SHALL use shared implementations

#### Scenario: No business logic in shared modules
- **WHEN** defining interfaces in shared modules
- **THEN** shared modules SHALL NOT contain education-specific business logic
- **AND** shared modules SHALL only define interfaces, DTOs, and utility functions
- **AND** business logic implementation SHALL remain in `edu/backend` or `edu/frontend`

### Requirement: Independent Deployment
The education platform SHALL be independently deployable without requiring the main system.

#### Scenario: Frontend independent deployment
- **WHEN** deploying education frontend
- **THEN** it SHALL be buildable using `npm run build` in `edu/frontend/`
- **AND** it SHALL run on port 3001 (configurable)
- **AND** it SHALL NOT require main system frontend to be running

#### Scenario: Backend independent deployment
- **WHEN** deploying education backend
- **THEN** it SHALL be buildable using `mvn clean install` in `edu/backend/`
- **AND** it SHALL run on port 8084 (configurable)
- **AND** it SHALL NOT require main system backend to be running
- **AND** it SHALL connect to independent `heartsphere_edu` database

#### Scenario: Configuration independence
- **WHEN** configuring education platform
- **THEN** configuration files SHALL be located in `edu/backend/src/main/resources/application.yml`
- **AND** environment variables SHALL be independent from main system
- **AND** API base URLs SHALL be configurable separately

### Requirement: Code Cleanup
After migration, deprecated directories SHALL be marked and eventually removed.

#### Scenario: Deprecated directory marking
- **WHEN** code migration is complete
- **THEN** `frontend-edu/` directory SHALL be marked with `.deprecated` file
- **AND** `admin-edu/` directory SHALL be marked with `.deprecated` file
- **AND** README files in deprecated directories SHALL indicate they are deprecated

#### Scenario: Deprecated directory removal
- **WHEN** migration is verified and stable (after Phase 1 completion)
- **THEN** deprecated directories SHALL be removed or archived
- **AND** Git history SHALL preserve the original code
- **AND** removal SHALL be documented in project README
