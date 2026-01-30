## ADDED Requirements

### Requirement: Psychology Mentor Module
The system SHALL provide an independent Psychology Mentor module that offers professional mental health therapy capabilities, parallel to the mentis module.

#### Scenario: Module creation and structure
- **WHEN** the Psychology Mentor module is created
- **THEN** it is structured as an independent module parallel to mentis
- **AND** it has its own backend service (Spring Boot) and frontend service (React)
- **AND** it uses independent port configuration (backend: 8083, frontend: 3003)
- **AND** it has its own independent database (`heartsphere_psychology`)
- **AND** it follows the same technical stack and architecture patterns as other modules

#### Scenario: Module independence
- **WHEN** the Psychology Mentor module operates
- **THEN** it can be deployed and run independently
- **AND** it does not depend on other business modules
- **AND** it can communicate with other modules through HTTP API
- **AND** it maintains its own data isolation

### Requirement: Therapy Method Support
The system SHALL support five mainstream psychotherapy approaches: CBT, DBT, ACT, Psychodynamic, and Humanistic.

#### Scenario: Therapy method listing
- **WHEN** a user requests available therapy methods
- **THEN** the system returns all five therapy methods
- **AND** each therapy method includes its name, description, therapist information, and specialization areas
- **AND** each therapy method has a unique identifier

#### Scenario: Therapy method details
- **WHEN** a user requests details of a specific therapy method
- **THEN** the system returns comprehensive information including:
- **AND** therapy description and core techniques
- **AND** therapist name and avatar
- **AND** specialization areas and applicable concerns
- **AND** learning pathway (4 phases)
- **AND** system instructions for the therapy

#### Scenario: Therapy method selection
- **WHEN** a user selects a therapy method for a session
- **THEN** the system creates a therapy session with the selected method
- **AND** the system configures the AI therapist according to the selected method
- **AND** the system applies method-specific system instructions

### Requirement: Professional Therapist Characters
The system SHALL provide professional therapist characters for each therapy method, each with distinct personality and expertise.

#### Scenario: Therapist character creation
- **WHEN** the system initializes
- **THEN** five therapist characters are created:
- **AND** Dr. Cognos 🧠 (CBT specialist)
- **AND** Sage Harmony ⚖️ (DBT specialist)
- **AND** Guide River 🌊 (ACT specialist)
- **AND** Prof. Freudia 🛋️ (Psychodynamic specialist)
- **AND** Alex Beacon ❤️ (Humanistic specialist)

#### Scenario: Therapist character interaction
- **WHEN** a user interacts with a therapist character
- **THEN** the therapist responds according to its therapeutic specialization
- **AND** the therapist uses method-specific techniques and approaches
- **AND** the therapist maintains a professional and empathetic tone
- **AND** the therapist provides evidence-based interventions

### Requirement: Module API Integration
The system SHALL provide RESTful API endpoints that allow other modules to integrate with the Psychology Mentor module.

#### Scenario: Health check API
- **WHEN** another module checks the Psychology Mentor module status
- **THEN** the system provides a health check endpoint (`GET /api/psychology/health`)
- **AND** the endpoint returns service status and version information

#### Scenario: Therapy method API
- **WHEN** another module requests therapy methods
- **THEN** the system provides API endpoints to list and retrieve therapy methods
- **AND** the API follows RESTful conventions
- **AND** the API returns data in a standardized format

#### Scenario: Session management API
- **WHEN** another module needs to manage therapy sessions
- **THEN** the system provides API endpoints for session creation, message sending, and session management
- **AND** the API supports integration with multi-agent systems
- **AND** the API allows wrapping therapists as agents
