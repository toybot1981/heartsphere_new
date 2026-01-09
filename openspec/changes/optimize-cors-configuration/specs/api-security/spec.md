## MODIFIED Requirements

### Requirement: CORS Configuration
The system SHALL configure CORS (Cross-Origin Resource Sharing) in a unified manner at the global level, and SHALL NOT use `@CrossOrigin` annotations at the Controller level.

#### Scenario: Global CORS configuration is used
- **WHEN** a request is made from a frontend application
- **THEN** the CORS policy is applied from the global configuration in `WebSecurityConfig`
- **AND** all Controllers inherit the same CORS configuration
- **AND** no Controller uses `@CrossOrigin` annotation

#### Scenario: Custom headers are supported
- **WHEN** a request includes custom headers (e.g., `X-Share-Config-Id`, `X-Shared-Mode`)
- **THEN** these headers are allowed by the global CORS configuration
- **AND** the request is not rejected due to CORS policy

#### Scenario: Environment-specific CORS configuration
- **WHEN** the application runs in development environment
- **THEN** all origins are allowed using `addAllowedOriginPattern("*")`
- **WHEN** the application runs in production environment
- **THEN** only explicitly configured origins are allowed
- **AND** the configuration is read from environment variables or application.yml
