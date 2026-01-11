# Change: Establish Multi-System Local Startup

## Why

Currently, the project contains multiple sub-projects (backend, frontend, edu, admin, mentis, company, etc.), each requiring independent port configuration for frontend and backend services. Developers need a unified local startup solution that:

1. Manages port assignments for all projects systematically
2. Automatically kills processes occupying required ports before startup
3. Provides clear documentation of port assignments for all projects
4. Ensures no port conflicts between projects

This change will improve developer experience by providing a consistent, reliable local development environment setup.

## What Changes

- **ADDED**: Unified local startup script that manages multiple project services
- **ADDED**: Port configuration mapping for all projects (backend and frontend)
- **ADDED**: Port conflict detection and automatic process termination
- **ADDED**: Documentation of port assignments per project
- **ADDED**: Startup scripts for individual projects with port management

## Impact

- **Affected specs**: New capability - `local-development-startup`
- **Affected code**: 
  - New scripts in `scripts/` directory
  - Port configuration documentation
- **Breaking changes**: None - this is a new development tooling feature
