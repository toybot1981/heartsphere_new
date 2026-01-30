## MODIFIED Requirements

### Requirement: Execution Engine Simplification
The execution engine SHALL be simplified to only execute instructions and return results, without decision-making logic.

#### Scenario: Instruction-based execution
- **WHEN** the execution engine receives an instruction
- **THEN** it SHALL execute the instruction via E2B executor
- **AND** it SHALL return execution results (success, output, error)
- **AND** it SHALL NOT make decisions about next actions

#### Scenario: Instruction format
- **WHEN** the execution engine receives an instruction
- **THEN** the instruction SHALL contain: command (string), cwd (optional string), timeout (optional number)
- **AND** the execution engine SHALL validate the instruction format

#### Scenario: E2B command execution
- **WHEN** the execution engine executes an instruction
- **THEN** it SHALL call E2B API client with the command
- **AND** it SHALL pass working directory and timeout if specified
- **AND** it SHALL return E2B execution results

#### Scenario: Error handling
- **WHEN** E2B execution fails
- **THEN** the execution engine SHALL return error information
- **AND** it SHALL NOT attempt to recover or retry (brain handles this)
- **AND** it SHALL provide detailed error context

### Requirement: E2B Integration
E2B integration SHALL remain simple and focused on command execution only.

#### Scenario: Command execution
- **WHEN** E2B executor receives a command
- **THEN** it SHALL execute the command in the E2B sandbox
- **AND** it SHALL return stdout, stderr, and exit code
- **AND** it SHALL NOT interpret or analyze results

#### Scenario: Sandbox management
- **WHEN** a command needs to be executed
- **THEN** E2B executor SHALL ensure sandbox exists
- **AND** it SHALL create sandbox if needed
- **AND** it SHALL manage sandbox lifecycle

#### Scenario: Result reporting
- **WHEN** command execution completes
- **THEN** E2B executor SHALL return structured result
- **AND** result SHALL include: success (boolean), output (string), error (optional string)
- **AND** result SHALL be suitable for brain evaluation

## REMOVED Requirements

### Requirement: Decision Logic in Execution Engine
**Reason**: Decision-making is now the responsibility of MentisBrain. Execution engine should only execute instructions.

**Migration**: All decision logic has been moved to MentisBrain. ExecutionEngine now only executes instructions and returns results.

### Requirement: Plan-Based Execution
**Reason**: Execution engine now accepts simple instructions instead of complex plans. Plans are converted to instructions by the brain.

**Migration**: Use InstructionGenerator in MentisBrain to convert plans to instructions before execution.
