# Reorganize Scripts and Enhance Deployment Visualization

## Summary

This change reorganizes the scripts directory structure to align with DevOps capabilities, enhances deployment visualization with environment variable management in the UI, and adds remote deployment support via SCP file transfer.

## Why

Currently, the `scripts/` directory contains 52+ shell scripts scattered across the root and various subdirectories, making it difficult to:
- Understand script organization and purpose
- Maintain and discover scripts
- Integrate scripts with the DevOps workbench

Additionally, the deployment process lacks:
- Visual environment variable configuration in the UI
- Remote deployment capabilities via SCP
- Complete deployment process visualization

## What Changes

This change introduces three major enhancements to the DevOps workbench:

### 1. Script Reorganization
- Categorize and move scripts into logical subdirectories:
  - `scripts/deploy/` - Deployment scripts (remote and local)
  - `scripts/start/` - Service startup scripts (consolidate all `start-*.sh`)
  - `scripts/stop/` - Service stop scripts
  - `scripts/migrate/` - Database and data migration scripts
  - `scripts/verify/` - Verification and validation scripts
  - `scripts/test/` - Test scripts (already exists, expand)
  - `scripts/scan/` - Code scanning scripts (already exists)
  - `scripts/build/` - Build scripts (already exists)
  - `scripts/server/` - Server management scripts (already exists)
  - `scripts/dev/` - Development tools (already exists)
  - `scripts/utils/` - Utility scripts (already exists)
- Update all script references in `scripts-config.yml`
- Create a comprehensive `scripts/README.md` documenting the new structure

### 2. Deployment Visualization Enhancement
- Add environment variable configuration UI in the deployment pipeline executor
- Support environment variable templates per deployment environment (dev, test, prod)
- Visualize environment variable values during deployment (masked for sensitive values)
- Allow environment variable override at execution time
- Display environment variable usage in deployment logs

### 3. Remote Deployment Support
- Add SCP-based file transfer capability for remote deployments
- Support SSH key authentication for remote servers
- Configure remote server targets (host, port, user, key path) in the UI
- Visualize file transfer progress during deployment
- Support deployment to multiple remote targets

## Impact

### Affected Systems
- **Scripts Directory**: Complete reorganization of script files
- **DevOps Workbench**: Enhanced UI for environment variables and remote deployment
- **Script Execution Engine**: Support for environment variable injection and remote execution
- **Deployment Pipeline**: Integration with remote deployment capabilities

### Breaking Changes
- Script paths in `scripts-config.yml` will change (requires migration)
- Any external references to scripts will need updating

### Migration Strategy
1. Create new directory structure
2. Move scripts to new locations
3. Update `scripts-config.yml` with new paths
4. Update any hardcoded script references in code
5. Provide migration script to update existing configurations

## Acceptance Criteria

1. ✅ All scripts are organized into logical subdirectories
2. ✅ `scripts-config.yml` references updated scripts correctly
3. ✅ Environment variables can be configured in the deployment UI
4. ✅ Environment variables are visible during deployment execution
5. ✅ Remote deployment via SCP is functional
6. ✅ Deployment process is fully visualized with all steps and environment variables
7. ✅ All existing DevOps functionality continues to work
8. ✅ Documentation updated to reflect new structure
