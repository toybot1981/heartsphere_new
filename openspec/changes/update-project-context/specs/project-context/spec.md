## ADDED Requirements

### Requirement: Project Context Documentation
The project SHALL maintain a comprehensive project context document (`openspec/project.md`) that provides essential information for AI assistants and developers to understand the project's purpose, technical stack, conventions, and constraints.

#### Scenario: AI assistant reads project context
- **WHEN** an AI assistant needs to create a change proposal
- **THEN** it can reference `openspec/project.md` to understand project conventions, tech stack, and domain context
- **AND** it can make decisions aligned with project standards

#### Scenario: Developer reviews project context
- **WHEN** a developer needs to understand project conventions
- **THEN** they can read `openspec/project.md` for quick reference
- **AND** they can find links to detailed specification documents
