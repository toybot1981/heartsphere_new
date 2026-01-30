# Deployment Visualization Specification

## ADDED Requirements

### Requirement: Script Directory Organization
**SHALL** organize all scripts in the `scripts/` directory into logical subdirectories based on their function.

#### Scenario: Developer discovers deployment script
- **Given** a developer wants to find a deployment script
- **When** they browse the `scripts/` directory
- **Then** they find all deployment scripts in `scripts/deploy/`
- **And** the scripts are clearly named and documented

#### Scenario: Script execution after reorganization
- **Given** a script has been moved to a new subdirectory
- **When** the DevOps workbench executes the script
- **Then** the script executes successfully from its new location
- **And** all script dependencies are resolved correctly

### Requirement: Environment Variable Configuration UI
系统 **SHALL** 在部署流程执行过程中提供环境变量配置 UI。

#### Scenario: User configures environment variables
- **Given** a user is executing a deployment pipeline
- **When** they reach the environment variable configuration step
- **Then** they see a form to configure environment variables
- **And** they can select from predefined templates
- **And** they can override individual variables
- **And** sensitive variables are masked in the UI
- **And** they can see variable scope (GLOBAL, PROJECT, MODULE, PIPELINE)
- **And** they can see variable resolution order and conflicts

#### Scenario: Environment variable template selection
- **Given** environment variable templates exist for dev, test, and prod
- **When** a user selects a deployment environment
- **Then** the corresponding template is automatically loaded
- **And** the user can modify variables before execution
- **And** variables from different scopes are merged according to precedence rules

#### Scenario: Environment variable naming validation
- **Given** a user tries to create an environment variable
- **When** they enter a variable name
- **Then** the system validates the name against naming convention (HS_ prefix, UPPER_SNAKE_CASE)
- **And** the system checks for conflicts with system environment variables
- **And** if invalid or conflicting, an error message is displayed
- **And** if valid, the variable is saved

### Requirement: Environment Variable Injection
**SHALL** inject configured environment variables into script execution processes.

#### Scenario: Script receives environment variables
- **Given** environment variables are configured for a deployment
- **When** a script is executed as part of the deployment
- **Then** the script process has access to all configured environment variables
- **And** variables are available as standard environment variables (e.g., `$VAR_NAME`)

#### Scenario: Environment variable substitution
- **Given** a script parameter contains an environment variable reference (e.g., `$DEPLOY_PATH`)
- **When** the script is executed
- **Then** the variable is substituted with its actual value
- **And** the substitution happens before script execution

### Requirement: Environment Variable Visualization
**SHALL** display environment variables during deployment execution with appropriate masking for sensitive values.

#### Scenario: User views deployment progress
- **Given** a deployment is in progress
- **When** a user views the deployment progress
- **Then** they see all environment variables used in the deployment
- **And** sensitive variables are masked (e.g., `****`)
- **And** authorized users can toggle to view unmasked values

#### Scenario: Environment variables in deployment logs
- **Given** a deployment has completed
- **When** a user views the deployment logs
- **Then** environment variables are included in the logs
- **And** sensitive variables remain masked in the logs

### Requirement: Remote Server Configuration
系统 **SHALL** 提供 UI 用于配置远程部署服务器，支持 SSH 密钥认证。

#### Scenario: Admin configures remote server
- **Given** an admin with SUPER_ADMIN role wants to configure a remote deployment server
- **When** they access the remote server configuration UI
- **Then** they can enter server details (host, port, username)
- **And** they can upload or specify an SSH private key
- **And** they can enter key passphrase (optional)
- **And** they can test the connection
- **And** the configuration is saved securely with encrypted keys
- **And** the operation is logged in audit log

#### Scenario: SSH key validation and encryption
- **Given** an admin uploads an SSH private key
- **When** they save the remote server configuration
- **Then** the system validates the key format
- **And** if invalid, an error message is displayed
- **And** if valid, the key is encrypted using AES-256
- **And** the encrypted key is stored securely
- **And** the key passphrase (if provided) is encrypted separately
- **And** the master encryption key is never exposed

#### Scenario: Remote server access control
- **Given** a user without SUPER_ADMIN role tries to configure a remote server
- **When** they attempt to create or modify a remote server
- **Then** access is denied
- **And** an error message indicates insufficient permissions
- **And** the attempt is logged in audit log

### Requirement: Remote File Transfer via SCP
系统 **SHALL** 支持使用 SCP 协议向远程服务器传输文件。

#### Scenario: Deploy files to remote server
- **Given** a deployment includes file transfer to a remote server
- **When** the deployment step executes
- **Then** files are transferred via SCP to the configured remote server
- **And** transfer progress is displayed in real-time (bytes transferred, speed)
- **And** transfer completion is confirmed
- **And** the operation is logged in audit log
- **And** SSH key is decrypted only during transfer and cleared after

#### Scenario: Directory synchronization
- **Given** a deployment needs to sync a directory to a remote server
- **When** the deployment step executes
- **Then** the entire directory is transferred recursively
- **And** file permissions are preserved
- **And** only changed files are transferred (if supported)
- **And** transfer errors are handled gracefully with retry logic

#### Scenario: Remote file transfer security
- **Given** a remote file transfer is initiated
- **When** the transfer executes
- **Then** SSH host key is validated to prevent MITM attacks
- **And** connection is established using encrypted SSH key
- **And** transfer is logged with source, target, and user information
- **And** failed transfers are logged with error details

### Requirement: Remote Deployment Visualization
**SHALL** visualize remote deployment progress including file transfer status and remote execution logs.

#### Scenario: User monitors remote deployment
- **Given** a remote deployment is in progress
- **When** a user views the deployment progress
- **Then** they see file transfer progress (bytes transferred, speed)
- **And** they see remote execution status
- **And** they see remote execution logs in real-time
- **And** errors are clearly displayed

#### Scenario: Remote deployment failure
- **Given** a remote deployment fails
- **When** a user views the deployment details
- **Then** they see the failure reason
- **And** they see which step failed (transfer or execution)
- **And** they see error logs from the remote server

### Requirement: Deployment Process Visualization
**SHALL** provide complete visualization of the deployment process including all steps, environment variables, and file transfers.

#### Scenario: User views deployment execution
- **Given** a deployment is executing
- **When** a user views the deployment progress
- **Then** they see all deployment steps with status
- **And** they see environment variables used
- **And** they see file transfers (if any)
- **And** they see real-time logs for each step
- **And** they can expand steps for detailed information

#### Scenario: Deployment completion summary
- **Given** a deployment has completed
- **When** a user views the deployment summary
- **Then** they see all steps with final status
- **And** they see total execution time
- **And** they see environment variables used (masked)
- **And** they see file transfers completed
- **And** they can download complete deployment logs

## MODIFIED Requirements

### Requirement: Script Configuration Update
系统 **SHALL** 更新 `scripts-config.yml` 以引用新组织位置的脚本。

#### Scenario: Script configuration loads after reorganization
- **Given** scripts have been reorganized into new directories
- **When** the DevOps workbench loads script configurations
- **Then** all script paths in `scripts-config.yml` are valid
- **And** all scripts can be executed successfully
- **And** no script references are broken
- **And** all script dependencies are resolved correctly

#### Scenario: Script dependency resolution after migration
- **Given** scripts have been moved to new directories
- **When** a script that depends on other scripts is executed
- **Then** all dependencies are resolved using updated paths
- **And** shared utility scripts are accessible
- **And** relative paths in scripts are updated correctly
