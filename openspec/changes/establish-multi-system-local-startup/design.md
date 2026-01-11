## Context

The HeartSphere project has evolved into a multi-system architecture with multiple sub-projects:
- Main project: backend (8081) + frontend (3000)
- Education: edu/backend (8084) + edu/frontend (3001)
- Admin: admin/backend (8085) + admin/frontend (3005)
- Mentis: mentis/backend (8082) + mentis/frontend (3002)
- Company: company/backend (8083) + company/frontend (3003)
- Additional: admin-edu, frontend-edu (need port reassignment due to conflicts)

Developers currently need to manually manage port conflicts and start services individually, which is error-prone and time-consuming.

## Goals / Non-Goals

### Goals
- Provide unified startup scripts for all projects
- Automatically handle port conflicts by killing existing processes
- Document all port assignments clearly
- Support both individual project startup and unified startup
- Ensure scripts work on macOS and Linux

### Non-Goals
- Production deployment scripts (separate concern)
- Windows support (focus on Unix-like systems first)
- Service orchestration (Docker/Kubernetes - separate concern)
- Port conflict resolution strategies other than killing processes

## Decisions

### Decision: Port Conflict Resolution Strategy
- **What**: Kill processes occupying required ports before starting services
- **Why**: Simplest and most reliable approach for local development
- **Alternatives considered**:
  - Prompt user: Adds friction to startup process
  - Skip startup: Fails silently, poor developer experience
  - Auto-increment port: Changes port configuration, breaks documentation

### Decision: Script Organization
- **What**: Separate scripts per project + unified utilities + master scripts
- **Why**: Allows selective startup and maintains modularity
- **Structure**:
  ```
  scripts/
  ├── ports.md                    # Port assignment documentation
  ├── utils/
  │   └── port-utils.sh           # Shared port management functions
  ├── start-{project}-backend.sh  # Individual backend startup scripts
  ├── start-{project}-frontend.sh # Individual frontend startup scripts
  ├── start-all.sh                # Start all services
  └── stop-all.sh                 # Stop all services
  ```

### Decision: Port Assignment Resolution
- **What**: Reassign conflicting ports for admin-edu and frontend-edu
- **Resolution**:
  - admin-edu: Change from 3002 to 3006 (mentis/frontend keeps 3002)
  - frontend-edu: Change from 3001 to 3007 (edu/frontend keeps 3001)
- **Why**: Maintains consistency with existing assignments, minimizes disruption

## Risks / Trade-offs

### Risk: Killing Wrong Processes
- **Mitigation**: Use `lsof -ti:PORT` which is precise, add confirmation for safety (optional flag)
- **Trade-off**: May kill unrelated processes on the same port - acceptable for local dev

### Risk: Port Assignment Changes
- **Mitigation**: Document all changes clearly, update all configuration files
- **Trade-off**: Requires updating vite.config.ts files - necessary to resolve conflicts

## Migration Plan

1. Document current port assignments
2. Identify and resolve conflicts
3. Update configuration files for port changes
4. Create utility scripts
5. Create individual startup scripts
6. Create unified startup scripts
7. Test all scripts
8. Update documentation

## Open Questions

- Should we add a configuration file (YAML/JSON) for port assignments instead of hardcoding?
  - **Decision**: Start with hardcoded ports for simplicity, can refactor later if needed
- Should scripts support environment-specific port overrides?
  - **Decision**: Not initially - keep it simple, can add later if needed
