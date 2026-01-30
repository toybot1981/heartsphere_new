# Service Configuration

This document describes how the web-automation-testing framework manages service configuration, including log paths and startup scripts.

## Overview

The framework automatically detects and manages services based on your test plan. It:
1. Parses log paths from startup scripts in `scripts/start/`
2. Maps services to their startup scripts
3. Checks service logs when tests fail
4. Restarts services using standard startup scripts

## Service Detection

Services are automatically detected from the test plan's `base_url`:

| Base URL Pattern | Services Detected |
|-----------------|-------------------|
| `localhost:8081` or contains `main` | `main-backend`, `main-frontend` |
| `localhost:8085` or contains `admin` | `admin-backend`, `admin-frontend` |
| `localhost:8084` or contains `edu` | `edu-backend`, `edu-frontend` |
| `localhost:8083` or contains `company` | `company-backend`, `company-frontend` |
| `localhost:8082` or contains `mentis` | `mentis-backend`, `mentis-frontend` |

## Log Path Patterns

Different projects use different log path patterns. The framework automatically parses these from startup scripts:

### Main Project
- Backend: `main/backend-backend.log` (from `$PROJECT_ROOT/main/backend-backend.log`)
- Frontend: `main/frontend-frontend.log` (from `$PROJECT_ROOT/main/frontend-frontend.log`)

### Admin Project
- Backend: `admin-backend.log` (from `$PROJECT_ROOT/admin-backend.log`)
- Frontend: `admin-frontend.log` (from `$PROJECT_ROOT/admin-frontend.log`)

### Edu Project
- Backend: `edu-backend.log` (from `$PROJECT_ROOT/edu-backend.log`)
- Frontend: `edu-frontend.log` (from `$PROJECT_ROOT/edu-frontend.log`)

### Company Project
- Backend: `company-backend.log` (from `$PROJECT_ROOT/company-backend.log`)
- Frontend: `company-frontend.log` (from `$PROJECT_ROOT/company-frontend.log`)

### Mentis Project
- Backend: `mentis-backend.log` (from `$PROJECT_ROOT/mentis-backend.log`)
- Frontend: `mentis-frontend.log` (from `$PROJECT_ROOT/mentis-frontend.log`)

## Log Path Parsing

The framework parses log paths from startup scripts using regex patterns:

1. **Pattern 1**: `> "$PROJECT_ROOT/path/to/log.log"`
2. **Pattern 2**: `> '$PROJECT_ROOT/path/to/log.log'`
3. **Pattern 3**: `> "path/to/log.log"` (relative to project root)
4. **Pattern 4**: `> 'path/to/log.log'` (relative to project root)

The `$PROJECT_ROOT` variable is automatically replaced with the actual project root directory.

## Startup Scripts

Startup scripts are located in `scripts/start/` and follow the naming pattern:
- `start-{service-name}.sh`

For example:
- `start-main-backend.sh`
- `start-main-frontend.sh`
- `start-admin-backend.sh`

## Service Management

The framework can:
- **Check service status**: Via PID files or process detection
- **Stop services**: Graceful shutdown (SIGTERM) then force kill (SIGKILL) if needed
- **Start services**: Using standard startup scripts
- **Restart services**: Stop then start, with readiness checks
- **Wait for readiness**: Checks logs for "started", "ready", "listening" indicators

## Configuration

Service configuration is managed by `service_config.py`:
- Maintains service-to-script mappings
- Caches parsed log paths
- Supports custom project root detection

## Troubleshooting

**Log file not found:**
- Verify startup script exists and contains log path redirect
- Check if log file is in expected location
- Framework will skip log checking if file doesn't exist

**Service restart fails:**
- Verify startup script exists and is executable
- Check script permissions: `chmod +x scripts/start/start-*.sh`
- Verify project root is correctly detected

**Wrong service detected:**
- Check test plan's `base_url` field
- Manually specify services in test plan's `services` field (if supported)
