## REMOVED Requirements

### Requirement: Company Website Frontend Pages

The main frontend application SHALL NOT provide company website pages. These pages have been migrated to the independent `company/` subproject.

#### Scenario: Accessing company website routes from main application
- **WHEN** a user accesses `/company` or any `/company/*` route from the main frontend application
- **THEN** the application SHALL return a 404 error or appropriate error page
- **AND** the application SHALL NOT render any company website components or pages

#### Scenario: Company website routes are not registered in main application
- **WHEN** the main frontend application starts
- **THEN** no routes matching `/company` or `/company/*` SHALL be registered
- **AND** the application SHALL NOT import or load any company-related components from `pages/company/` or `components/company/`

## REMOVED Requirements

### Requirement: Company Website Components in Main Frontend

The main frontend application SHALL NOT include company website components. These components have been migrated to the independent `company/` subproject.

#### Scenario: Company components are not available in main application
- **WHEN** the main frontend application builds or runs
- **THEN** no components from `components/company/` directory SHALL be imported or used
- **AND** the application SHALL NOT include any company-related components in its bundle

## REMOVED Requirements

### Requirement: Company Website Route Configuration in Main Frontend

The main frontend application SHALL NOT include company website route configuration. Route configuration has been migrated to the independent `company/` subproject.

#### Scenario: Company routes are not configured in main application
- **WHEN** the main frontend application initializes its routing
- **THEN** no route configuration for `/company` paths SHALL be present in `routes/company.tsx` or `App.tsx`
- **AND** the application SHALL NOT reference `CompanyRoutes` component
