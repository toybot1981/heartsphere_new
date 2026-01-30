# Design: Reorganize Scripts and Enhance Deployment Visualization

## Architecture Overview

This change enhances the DevOps workbench with script reorganization, environment variable management, and remote deployment capabilities while maintaining backward compatibility where possible.

## Script Reorganization

### Directory Structure

```
scripts/
├── deploy/          # Deployment scripts (local and remote)
│   ├── deploy-local.sh
│   ├── deploy-remote.sh
│   └── deploy-module.sh
├── start/           # Service startup scripts
│   ├── start-all.sh
│   ├── start-main-backend.sh
│   ├── start-admin-backend.sh
│   └── ...
├── stop/            # Service stop scripts
│   ├── stop-all.sh
│   └── ...
├── migrate/         # Database and data migration scripts
│   ├── execute-guest-mode-migration.sh
│   ├── execute_audio_models_migration.sh
│   └── ...
├── verify/          # Verification and validation scripts
│   ├── verify-prompt-management.sh
│   ├── verify_skills_system.sh
│   └── ...
├── test/            # Test scripts (existing)
├── scan/            # Code scanning scripts (existing)
├── build/           # Build scripts (existing)
├── server/          # Server management scripts (existing)
├── dev/             # Development tools (existing)
└── utils/           # Utility scripts (existing)
```

### Script Classification Rules

#### Directory Responsibilities

1. **`scripts/deploy/`** - Deployment Operations
   - **Purpose**: Scripts that deploy applications, services, or artifacts to target environments
   - **Examples**: `deploy-local.sh`, `deploy-remote.sh`, `deploy-module.sh`
   - **Criteria**: Scripts that copy files, configure services, or activate deployments
   - **Not included**: Service management (start/stop), which goes to `start/` or `stop/`

2. **`scripts/start/`** - Service Startup
   - **Purpose**: Scripts that start services, applications, or processes
   - **Examples**: `start-all.sh`, `start-main-backend.sh`, `start-admin-frontend.sh`
   - **Criteria**: Scripts that launch services, typically using `nohup`, `screen`, or systemd
   - **Pattern**: Usually named `start-*.sh`

3. **`scripts/stop/`** - Service Shutdown
   - **Purpose**: Scripts that stop services, applications, or processes
   - **Examples**: `stop-all.sh`, `stop-databases.sh`
   - **Criteria**: Scripts that terminate services, typically using `kill` or systemd
   - **Pattern**: Usually named `stop-*.sh`

4. **`scripts/migrate/`** - Data and Schema Migration
   - **Purpose**: Scripts that migrate database schemas, data, or system configurations
   - **Examples**: `execute-guest-mode-migration.sh`, `execute_audio_models_migration.sh`
   - **Criteria**: Scripts that modify database structure or data, typically one-time operations
   - **Not included**: Verification scripts (goes to `verify/`)

5. **`scripts/verify/`** - Verification and Validation
   - **Purpose**: Scripts that verify system state, data integrity, or configuration correctness
   - **Examples**: `verify-prompt-management.sh`, `verify_skills_system.sh`, `verify_import.sh`
   - **Criteria**: Scripts that check, validate, or verify without modifying data
   - **Not included**: Tests (goes to `test/`), migrations (goes to `migrate/`)

6. **`scripts/test/`** - Testing Scripts
   - **Purpose**: Scripts that run automated tests (unit, integration, E2E)
   - **Examples**: `run-unit-tests.sh`, `run-integration-tests.sh`, `test-all.sh`
   - **Criteria**: Scripts that execute test suites and report results
   - **Pattern**: Usually named `test-*.sh` or `run-*-tests.sh`

7. **`scripts/scan/`** - Code Scanning
   - **Purpose**: Scripts that scan code for quality, security, or style issues
   - **Examples**: `eslint-scan.sh`, `sonar-scan.sh`, `security-scan.sh`
   - **Criteria**: Static analysis, code quality checks, security scanning

8. **`scripts/build/`** - Build Scripts
   - **Purpose**: Scripts that compile, package, or build artifacts
   - **Examples**: `build-all.sh`, `build-module.sh`, `build-backend.sh`
   - **Criteria**: Scripts that transform source code into deployable artifacts

9. **`scripts/server/`** - Server Management
   - **Purpose**: Scripts that manage server operations (health checks, status, logs)
   - **Examples**: `health-check.sh`, `server-status.sh`, `view-logs.sh`
   - **Criteria**: Scripts that interact with running services (not starting/stopping)
   - **Not included**: Start/stop scripts (goes to `start/` or `stop/`)

10. **`scripts/dev/`** - Development Tools
    - **Purpose**: Scripts that assist in development workflow
    - **Examples**: `setup-local-env.sh`, `generate-code.sh`, `check-env.sh`
    - **Criteria**: Development-time utilities, local environment setup

11. **`scripts/utils/`** - Utility Scripts
    - **Purpose**: Shared utility functions and helper scripts
    - **Examples**: `port-utils.sh`, `common.sh` (if moved from build/)
    - **Criteria**: Reusable functions, helper utilities used by other scripts

### Script Dependency Analysis

#### Dependency Types

1. **Direct Dependencies**: Scripts that call other scripts
   - Example: `start-all.sh` calls individual `start-*.sh` scripts
   - **Handling**: Update relative paths after reorganization

2. **Shared Utilities**: Scripts that source common functions
   - Example: Scripts that `source scripts/build/common.sh`
   - **Handling**: Ensure utility scripts are accessible from new locations

3. **Path Dependencies**: Scripts that reference files by relative path
   - Example: Scripts that reference `../sql/` or `../../target/`
   - **Handling**: Update relative paths or use absolute paths from project root

#### Dependency Resolution Strategy

1. **Before Migration**: 
   - Analyze all scripts for `source`, `bash`, `sh` calls
   - Identify relative path references
   - Create dependency graph

2. **During Migration**:
   - Move utility scripts to `scripts/utils/` first
   - Update all `source` statements to use new paths
   - Use project root-relative paths where possible

3. **After Migration**:
   - Verify all dependencies resolve correctly
   - Test script execution from new locations
   - Update documentation with new paths

### Migration Strategy

#### Phase 1: Preparation
1. **Dependency Analysis** (T1.0 - New Task)
   - Scan all scripts for dependencies
   - Create dependency graph
   - Identify scripts that need path updates

2. **Create Directory Structure**
   - Create all new directories
   - Preserve existing directories

3. **Backup Current State**
   - Create backup of current `scripts/` directory
   - Create backup of `scripts-config.yml`
   - Document current script locations

#### Phase 2: Migration Execution
1. **Move Utility Scripts First**
   - Move shared utilities to `scripts/utils/`
   - Update all scripts that reference them

2. **Move Scripts by Category**
   - Move scripts to appropriate directories
   - Update internal paths in moved scripts
   - Update `scripts-config.yml` paths

3. **Update Code References**
   - Search codebase for hardcoded paths
   - Update all references
   - Test script execution

#### Phase 3: Validation
1. **Automated Validation** (T1.7 - New Task)
   - Create validation script to check all paths
   - Verify all scripts are executable
   - Test script dependencies

2. **Manual Testing**
   - Test critical scripts manually
   - Verify DevOps workbench integration
   - Check execution history

#### Phase 4: Rollback Plan
1. **Rollback Triggers**
   - Script execution failures
   - Path resolution errors
   - Dependency breakage

2. **Rollback Procedure**
   - Restore `scripts/` directory from backup
   - Restore `scripts-config.yml` from backup
   - Revert code changes
   - Restart services

3. **Backward Compatibility** (Optional)
   - Create symlinks from old paths to new paths (transition period)
   - Deprecate old paths with warnings
   - Remove symlinks after migration period

### Script Path Resolution

The `ScriptExecutionEngine` already supports relative paths from the project root. We'll maintain this behavior:
- Scripts referenced as `scripts/deploy/deploy-local.sh` will be resolved relative to project root
- Absolute paths continue to work
- Scripts can reference each other using relative paths within the scripts directory

## Environment Variable Management

### Data Model

```java
@Entity
public class EnvironmentVariable {
    private Long id;
    private String name;
    private String value;
    private String scope; // GLOBAL, PROJECT, MODULE, PIPELINE
    private String project; // null for GLOBAL, project name for PROJECT/MODULE
    private String module; // null for GLOBAL/PROJECT, module name for MODULE
    private Long pipelineId; // null for GLOBAL/PROJECT/MODULE, pipeline ID for PIPELINE
    private String environment; // dev, test, prod
    private boolean sensitive; // Should be masked in UI/logs
    private String description;
    private String validationRule; // Optional regex or validation
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
}

@Entity
public class EnvironmentVariableTemplate {
    private Long id;
    private String name;
    private String description;
    private String environment; // dev, test, prod
    private String scope; // GLOBAL, PROJECT, MODULE
    private String project; // null for GLOBAL, project name for PROJECT/MODULE
    private String module; // null for GLOBAL/PROJECT, module name for MODULE
    private List<EnvironmentVariable> variables;
    private boolean isDefault;
    private LocalDateTime createdAt;
    private String createdBy;
}
```

### Environment Variable Scope

#### Scope Levels

1. **GLOBAL** - System-wide variables
   - **Use Case**: Common variables used across all projects
   - **Examples**: `JAVA_HOME`, `MAVEN_HOME`, `NODE_PATH`
   - **Access**: All projects and pipelines
   - **Precedence**: Lowest (can be overridden by project/module/pipeline)

2. **PROJECT** - Project-specific variables
   - **Use Case**: Variables specific to a project (main, admin, company, etc.)
   - **Examples**: `MAIN_DB_URL`, `ADMIN_API_KEY`
   - **Access**: All pipelines within the project
   - **Precedence**: Medium (overrides GLOBAL, can be overridden by MODULE/PIPELINE)

3. **MODULE** - Module-specific variables
   - **Use Case**: Variables specific to a module within a project
   - **Examples**: `MAIN_BACKEND_PORT`, `ADMIN_FRONTEND_PORT`
   - **Access**: Pipelines for the specific module
   - **Precedence**: High (overrides GLOBAL/PROJECT, can be overridden by PIPELINE)

4. **PIPELINE** - Pipeline-specific variables
   - **Use Case**: Variables specific to a deployment pipeline
   - **Examples**: `DEPLOY_VERSION`, `DEPLOY_TARGET`
   - **Access**: Only the specific pipeline
   - **Precedence**: Highest (overrides all other scopes)

#### Variable Resolution Order

When a script executes, environment variables are resolved in this order:
1. Pipeline-specific variables (highest precedence)
2. Module-specific variables
3. Project-specific variables
4. Global variables (lowest precedence)

If a variable exists at multiple levels, the most specific level takes precedence.

#### Variable Naming Convention

To avoid conflicts with system environment variables:
- **Prefix**: Use `HS_` prefix for HeartSphere-specific variables (e.g., `HS_DEPLOY_PATH`)
- **Format**: UPPER_SNAKE_CASE (e.g., `HS_DB_PASSWORD`)
- **Reserved**: Do not use system variable names (e.g., `PATH`, `HOME`, `USER`)
- **Validation**: Check against system environment variables before saving

### Variable Lifecycle

1. **Creation**: Variables can be created at any scope level
2. **Template Assignment**: Variables can be assigned to templates
3. **Pipeline Execution**: Variables are resolved and injected at execution time
4. **Override**: Pipeline execution allows temporary overrides
5. **Audit**: All variable access and changes are logged

### UI Components

1. **EnvironmentVariableEditor**: Component for editing environment variables
   - Variable name, value, description
   - Sensitive flag toggle
   - Validation rule input
   - Environment selection

2. **EnvironmentVariableSelector**: Component for selecting variable templates
   - List of available templates
   - Template preview
   - Custom variable override

3. **EnvironmentVariableDisplay**: Component for displaying variables during execution
   - Show variable names and masked values
   - Expandable to show full values (with permission)
   - Real-time updates during deployment

### Integration Points

1. **ScriptExecutionEngine**: Inject environment variables as process environment
2. **PipelineExecutionEngine**: Pass environment variables to step executions
3. **DeploymentPipeline**: Store environment variable templates per pipeline

## Remote Deployment Support

### Data Model

```java
@Entity
public class RemoteServer {
    private Long id;
    private String name;
    private String host;
    private Integer port; // Default 22
    private String username;
    private String keyPath; // SSH private key path
    private String keyPassword; // Optional key passphrase (encrypted)
    private String description;
    private String environment; // dev, test, prod
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Entity
public class RemoteDeployment {
    private Long id;
    private Long pipelineExecutionId;
    private Long remoteServerId;
    private String sourcePath;
    private String targetPath;
    private String status; // PENDING, TRANSFERRING, SUCCESS, FAILED
    private Long bytesTransferred;
    private Long totalBytes;
    private String error;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}
```

### SCP Implementation

Using JSch library for SSH/SCP operations:

```java
@Service
public class ScpFileTransferService {
    public void transferFile(String sourcePath, String targetPath, RemoteServer server) {
        // Establish SSH connection
        // Transfer file with progress tracking
        // Handle errors and retries
    }
    
    public void transferDirectory(String sourceDir, String targetDir, RemoteServer server) {
        // Recursively transfer directory
        // Preserve permissions and timestamps
    }
    
    public void executeRemoteCommand(String command, RemoteServer server) {
        // Execute command on remote server
        // Capture output and return
    }
}
```

### UI Components

1. **RemoteServerConfig**: Component for configuring remote servers
   - Server name, host, port
   - Username and SSH key upload
   - Connection test button
   - Environment assignment

2. **RemoteDeploymentStep**: Component for configuring remote deployment steps
   - Source and target path selection
   - Remote server selection
   - File transfer options

3. **FileTransferProgress**: Component for displaying transfer progress
   - Progress bar with bytes transferred
   - Transfer speed
   - Error display

### Security Considerations

#### SSH Key Storage and Encryption

1. **Key Storage Format**
   - Store SSH private keys encrypted at rest using AES-256
   - Use separate encryption key stored in secure configuration
   - Never store keys in plain text

2. **Key Encryption Implementation**
   ```java
   @Service
   public class SshKeyEncryptionService {
       private static final String ALGORITHM = "AES/GCM/NoPadding";
       private static final int KEY_SIZE = 256;
       
       public String encryptKey(String privateKey, String passphrase) {
           // Generate encryption key from master key
           // Encrypt private key
           // Store encrypted key and IV separately
       }
       
       public String decryptKey(String encryptedKey) {
           // Decrypt using master key
           // Return decrypted key for use
       }
   }
   ```

3. **Key Passphrase Handling**
   - Encrypt passphrases separately using different key
   - Never log passphrases
   - Clear passphrase from memory after use

4. **Master Key Management**
   - Master key stored in secure vault or environment variable
   - Rotate master key periodically
   - Use key derivation function (PBKDF2) for key generation

#### Access Control

1. **Remote Server Configuration**
   - Only `SUPER_ADMIN` role can create/modify/delete remote servers
   - `ADMIN` role can view and use configured servers
   - All operations require authentication

2. **Remote Deployment Execution**
   - Only authorized users can execute remote deployments
   - Permission check before each deployment
   - Audit log all deployment attempts (success and failure)

3. **SSH Key Access**
   - Keys are decrypted only when needed for deployment
   - Keys are never exposed in API responses
   - Keys are cleared from memory immediately after use

#### Remote Execution Security

1. **Command Whitelist**
   - Only allow execution of predefined safe commands
   - Block dangerous commands (rm -rf, format, etc.)
   - Validate command parameters

2. **Execution Sandbox**
   - Execute commands in restricted environment
   - Limit file system access
   - Monitor resource usage (CPU, memory)

3. **Network Security**
   - Support SSH key-based authentication only (no passwords)
   - Require SSH key passphrase for additional security
   - Support SSH key rotation
   - Validate server host keys to prevent MITM attacks

#### Audit and Monitoring

1. **Audit Logging**
   - Log all remote server configuration changes
   - Log all remote deployment operations
   - Log SSH key access (decryption events)
   - Log failed authentication attempts
   - Include user, timestamp, operation, and result

2. **Security Monitoring**
   - Alert on suspicious deployment patterns
   - Monitor for unauthorized access attempts
   - Track key usage and rotation
   - Generate security reports

3. **Compliance**
   - All operations comply with security policies
   - Support compliance reporting
   - Maintain audit trail for regulatory requirements

## Deployment Visualization Enhancements

### Enhanced Progress View

1. **Step Details**: Expandable step cards showing:
   - Environment variables used
   - File transfers (for remote deployments)
   - Script output
   - Error details

2. **Real-time Updates**: SSE streams include:
   - Step status changes
   - Environment variable values (masked)
   - File transfer progress
   - Log output

3. **Deployment Timeline**: Visual timeline showing:
   - Step execution order
   - Dependencies
   - Parallel execution
   - Duration

### Environment Variable Display

- Show all environment variables at deployment start
- Display variable values (masked for sensitive)
- Allow authorized users to view unmasked values
- Show variable changes during execution
- Include variables in deployment logs (masked)

## Integration with Existing Systems

### DevOps Workbench Integration

1. **Script Configuration**: Update `scripts-config.yml` loader to handle new paths
2. **Pipeline Execution**: Integrate environment variables and remote deployment
3. **Execution History**: Store environment variable snapshots and remote deployment records

### Script Execution Engine

1. **Environment Injection**: Modify `ScriptExecutionEngine.execute()` to inject environment variables
2. **Remote Execution**: Add support for remote script execution via SSH
3. **Progress Tracking**: Enhance progress tracking for remote operations

## Error Handling

1. **Script Not Found**: Clear error message with suggested path
2. **Environment Variable Missing**: Validation before execution
3. **Remote Connection Failure**: Retry logic and clear error messages
4. **File Transfer Failure**: Partial transfer cleanup and retry options
5. **SSH Authentication Failure**: Clear error with troubleshooting steps

## Performance Considerations

1. **Remote Deployment**: Async file transfers with progress updates
2. **Environment Variable Loading**: Cache templates for quick access
3. **SSE Streams**: Efficient streaming for real-time updates
4. **File Transfer**: Chunked transfers for large files

## Security Considerations Summary

This section summarizes the security considerations detailed in the Remote Deployment Support section above. Key security measures include:

1. **Environment Variables**: Encrypt sensitive values at rest using AES-256-GCM
2. **SSH Keys**: Secure storage with AES-256-GCM encryption and master key management
3. **Remote Access**: Comprehensive audit logging for all remote operations
4. **Variable Masking**: Proper masking in logs and UI with audit trail
5. **Access Control**: Role-based access control with scope-based permissions
6. **Command Security**: Command whitelist and execution sandbox for remote commands
7. **Network Security**: SSH key-based authentication with host key validation
8. **Security Monitoring**: Real-time monitoring and alerting for security events

For detailed security design, see the "Remote Deployment Support" section above.
