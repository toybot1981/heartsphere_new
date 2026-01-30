# Skill Execution Engine — Spec Delta

## ADDED Requirements

### Requirement: Layered Progressive Execution Model

The skill execution engine SHALL follow a three-phase layered execution model aligned with Claude Skill's Progressive Disclosure: Phase 1 (L1 resolve and validate), Phase 2 (L2 load and apply instruction), Phase 3 (L3 load and use resources then execute). Each phase SHALL have a well-defined responsibility and SHALL not load the next layer until the previous phase succeeds.

#### Scenario: Execute skill with all phases succeeding

- **GIVEN** a valid skillId, parameters, and execution context
- **WHEN** the engine executes the skill
- **THEN** Phase 1 resolves and validates the skill definition and permissions
- **AND** Phase 2 loads Level 2 instruction (e.g. skill_content or skill_instructions) and makes it available to the handler
- **AND** Phase 3 loads Level 3 resources (e.g. scripts/references/assets) as required by the execution type and invokes the appropriate handler with skill, instructions, resources, parameters, and context
- **AND** the result is returned in the same shape as the current SkillExecutionResult

#### Scenario: Phase 1 failure prevents L2/L3 load

- **GIVEN** a skillId that does not exist or context that fails permission checks
- **WHEN** the engine executes the skill
- **THEN** Phase 1 fails (e.g. SkillNotFoundException or permission denied)
- **AND** Level 2 and Level 3 are not loaded
- **AND** the engine returns a failure result without performing instruction or resource load

### Requirement: Reuse of ProgressiveSkillLoader for L2 and L3

The execution engine SHALL use the existing ProgressiveSkillLoader (or equivalent) for loading Level 2 instruction and Level 3 resources. It SHALL NOT duplicate loading logic that already exists for skill selection (e.g. loadLevel2(skillId), loadLevel3(skillId) or their batch variants).

#### Scenario: L2 and L3 loaded via ProgressiveSkillLoader

- **GIVEN** Phase 1 has completed successfully for a skillId
- **WHEN** the engine proceeds to Phase 2 and Phase 3
- **THEN** Level 2 content is obtained via ProgressiveSkillLoader.loadLevel2(skillId) or equivalent
- **AND** Level 3 content is obtained via ProgressiveSkillLoader.loadLevel3(skillId) or equivalent
- **AND** no separate repository or ad-hoc query is used for the same data

### Requirement: Handler Contract Compatibility

The execution engine SHALL preserve the existing SkillExecutionHandler contract: handlers SHALL continue to receive (skill, instructions, resources, parameters, context) and SHALL return the same execution result type. The public API execute(skillId, parameters, context) SHALL remain unchanged in signature and observable behavior.

#### Scenario: Existing handlers work without change

- **GIVEN** a RULE_BASED, SCRIPT, API, GRAPH, or DATABASE skill and its handler registered
- **WHEN** the engine runs through Phase 1–3 and invokes the handler
- **THEN** the handler receives the same argument types and structure as today (skill, instructions, resources, parameters, context)
- **AND** the handler’s return value is used to build SkillExecutionResult as today
- **AND** no handler code change is required for the layered execution model

### Requirement: Phase Observability

The execution engine SHALL provide sufficient observability to distinguish which phase (L1/L2/L3) failed or succeeded. Logging or metrics SHALL allow operators to identify phase boundaries and failures without requiring code inspection.

#### Scenario: Phase failure is identifiable in logs

- **GIVEN** an execution that fails during Phase 2 (e.g. instruction load error)
- **WHEN** the failure is logged or reported
- **THEN** the log or metric indicates that the failure occurred in Phase 2 (L2)
- **AND** Phase 1 is indicated as completed (or not started) so that the failure point is unambiguous
