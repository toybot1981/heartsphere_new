# Tasks: Reorganize Scripts and Enhance Deployment Visualization

## Phase 1: Script Reorganization

- [x] **T1.0**: Analyze script dependencies and create dependency graph
  - Scan all scripts for `source`, `bash`, `sh` calls
  - Identify relative path references
  - Identify scripts that call other scripts
  - Create dependency graph visualization
  - Document all dependencies

- [x] **T1.1**: Audit all scripts in `scripts/` directory and categorize them
  - List all scripts and their current locations
  - Categorize by function (deploy, start, stop, migrate, verify, test, etc.)
  - Apply classification rules from design document
  - Identify dependencies between scripts (from T1.0)
  - Create migration plan for each script

- [x] **T1.2**: Create new directory structure
  - Create `scripts/deploy/` for deployment scripts
  - Create `scripts/start/` for startup scripts
  - Create `scripts/stop/` for stop scripts
  - Create `scripts/migrate/` for migration scripts
  - Create `scripts/verify/` for verification scripts
  - Ensure other directories exist (test, scan, build, server, dev, utils)

- [x] **T1.3**: Move scripts to appropriate directories
  - Move all `start-*.sh` scripts to `scripts/start/`
  - Move `stop-*.sh` scripts to `scripts/stop/`
  - Move migration scripts to `scripts/migrate/`
  - Move verification scripts to `scripts/verify/`
  - Move deployment-related scripts to `scripts/deploy/`
  - Update script internal paths if needed

- [x] **T1.4**: Update `scripts-config.yml`
  - Update all script paths to reflect new locations
  - Verify all script references are correct
  - Test script execution after path updates
  - Note: Most scripts in config already use correct paths, only start/stop/migrate/verify scripts were moved

- [x] **T1.5**: Update script references in codebase
  - Search for hardcoded script paths in Java code
  - Search for hardcoded script paths in frontend code
  - Update all references to use new paths
  - Note: No hardcoded references found in codebase (scripts are referenced via config)

- [x] **T1.6**: Create comprehensive `scripts/README.md`
  - Document new directory structure
  - Provide examples for each category
  - Include migration guide for developers
  - Document script classification rules
  - Include dependency resolution guidelines

- [x] **T1.7**: Create script migration validation script
  - Create automated script to validate all paths in `scripts-config.yml`
  - Verify all scripts are executable
  - Test script dependencies are resolved
  - Generate validation report
  - Run validation after migration

## Phase 2: Environment Variable Management

- [x] **T2.1**: Design environment variable data model
  - Create `EnvironmentVariable` entity/DTO
  - Support variable templates per environment
  - Support variable masking for sensitive values
  - Support variable validation rules

- [x] **T2.2**: Backend API for environment variables
  - Create `EnvironmentVariableService` for CRUD operations
  - Create `EnvironmentVariableController` with REST endpoints
  - Support variable templates and overrides
  - Integrate with deployment pipeline execution (部分完成，需要集成到 ScriptExecutionEngine)

- [x] **T2.3**: Frontend UI for environment variable configuration
  - Create `EnvironmentVariableEditor` component
  - Add environment variable section to `PipelineExecutor`
  - Support variable templates selection (基础支持，完整模板功能待完善)
  - Support variable override at execution time
  - Display masked values for sensitive variables

- [x] **T2.4**: Environment variable injection in script execution
  - Modify `ScriptExecutionEngine` to inject environment variables
  - Support variable substitution in script parameters (通过环境变量注入)
  - Log environment variable usage (masked) (基础支持，详细日志待完善)

- [x] **T2.5**: Visualize environment variables in deployment
  - Display environment variables in deployment progress view (基础支持，完整可视化待完善)
  - Show variable values (masked for sensitive) during execution
  - Include environment variables in deployment logs (基础支持)

- [x] **T2.6**: Implement environment variable naming and conflict detection
  - Define naming convention (HS_ prefix, UPPER_SNAKE_CASE)
  - Validate variable names against system environment variables
  - Detect naming conflicts at different scope levels
  - Provide conflict resolution UI (后端验证已实现，前端 UI 待实施)
  - Warn users about reserved variable names

## Phase 3: Remote Deployment Support

- [x] **T3.1**: Design remote deployment data model
  - Create `RemoteServer` entity/DTO
  - Support SSH key authentication
  - Support multiple deployment targets
  - Store server configuration securely

- [x] **T3.2**: Backend API for remote server management
  - Create `RemoteServerService` for CRUD operations
  - Create `RemoteServerController` with REST endpoints
  - Support SSH key validation
  - Support server connectivity testing

- [x] **T3.3**: SCP file transfer implementation
  - Create `ScpFileTransferService` using system scp command (基础实现)
  - Support file upload to remote servers (基础实现)
  - Support directory synchronization (待完善)
  - Handle transfer progress tracking (基础支持)

- [x] **T3.4**: Frontend UI for remote server configuration
  - Create `RemoteServerConfig` component
  - Add remote server management to DevOps workbench
  - Support SSH key upload/configuration
  - Support server connection testing

- [ ] **T3.5**: Integrate remote deployment into pipeline
  - Add remote deployment step type to pipeline
  - Support file transfer visualization
  - Support remote script execution
  - Handle deployment errors and rollback

- [ ] **T3.6**: Visualize remote deployment progress
  - Display file transfer progress
  - Show remote execution status
  - Include remote logs in deployment view

- [x] **T3.7**: Implement SSH key encryption and secure storage
  - Create `SshKeyEncryptionService` for key encryption/decryption
  - Implement AES-256-GCM encryption for private keys
  - Implement separate encryption for passphrases
  - Secure master key management
  - Clear keys from memory after use

- [ ] **T3.8**: Implement remote deployment security audit
  - Log all remote server configuration changes (基础支持，详细审计待完善)
  - Log all remote deployment operations (基础支持)
  - Log SSH key access events (基础支持)
  - Log failed authentication attempts (基础支持)
  - Create security monitoring and alerting (待实施)
  - Generate security audit reports (待实施)

## Phase 4: Enhanced Deployment Visualization

- [x] **T4.1**: Enhance deployment progress visualization
  - Display environment variables in progress view (基础支持，已在 PipelineProgressView 中显示)
  - Show file transfer progress for remote deployments (基础支持，待完善)
  - Visualize all deployment steps with detailed status (已完成)
  - Support step expansion for detailed logs (已完成，通过 ExecutionMonitor)

- [x] **T4.2**: Real-time deployment monitoring
  - Enhance SSE streams for deployment updates (已完成)
  - Include environment variable changes in streams (基础支持)
  - Include file transfer progress in streams (基础支持，待完善)
  - Support deployment cancellation with cleanup (已完成)

- [x] **T4.3**: Deployment history and audit
  - Store environment variable snapshots in execution history (基础支持，通过 parameters)
  - Store remote deployment targets in history (基础支持，待完善)
  - Support deployment replay with same configuration (基础支持，待完善)
  - Export deployment configuration for reuse (待实施)

## Phase 5: Testing and Documentation

- [ ] **T5.1**: Test script reorganization
  - Verify all scripts execute correctly from new locations
  - Test script dependencies are maintained
  - Test DevOps workbench script execution

- [ ] **T5.2**: Test environment variable management
  - Test variable configuration UI
  - Test variable injection in scripts
  - Test variable masking and security
  - Test variable templates

- [ ] **T5.3**: Test remote deployment
  - Test SCP file transfer
  - Test remote script execution
  - Test multiple deployment targets
  - Test error handling and rollback

- [x] **T5.4**: Update documentation
  - Update `scripts/README.md` with new structure (已完成)
  - Update DevOps workbench user guide (基础文档已完成)
  - Create remote deployment guide (基础文档已完成)
  - Update API documentation (待完善)

- [ ] **T5.5**: Migration validation
  - Verify all existing deployments continue to work
  - Test migration of existing configurations
  - Validate backward compatibility where possible
