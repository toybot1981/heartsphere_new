# Design: Mentis Management in Admin Backend

## Context

The admin backend needs to provide a centralized interface for managing Mentis configurations, including MCP server configurations and agent role selections. This requires:

1. **Cross-System Integration**: Admin backend must communicate with both Mentis backend (for MCP configs) and Main backend (for agent roles)
2. **Data Consistency**: Configuration changes in admin must be immediately reflected in Mentis
3. **Rich Agent Selection**: Leverage main backend's comprehensive character database for agent selection
4. **Operational Simplicity**: Single interface for all Mentis-related configuration

## Goals / Non-Goals

### Goals
- Provide unified admin interface for Mentis configuration
- Enable selection of rich agent roles from main system
- Ensure real-time synchronization between admin and Mentis
- Maintain data consistency across systems
- Support MCP server configuration management

### Non-Goals
- Direct Mentis session management (stays in Mentis interface)
- Agent role creation (uses existing main system characters)
- MCP server implementation (only configuration management)

## Decisions

### Decision 1: Data Access Pattern

**Option A: Direct Database Access**
- Admin backend directly accesses Mentis database using existing data source configuration
- Pros: Fast, no API overhead, direct control
- Cons: Tight coupling, bypasses Mentis business logic

**Option B: API-Based Access**
- Admin backend calls Mentis backend APIs
- Pros: Loose coupling, respects business logic, better security
- Cons: Network overhead, requires Mentis backend to be running

**Chosen: Hybrid Approach**
- **MCP Configs**: Direct database access (read/write) for performance and simplicity
- **Agent Configs**: API-based (if stored in Mentis) or direct DB access (if new table)
- **Agent List**: API call to main backend (respects main system's business logic)

**Rationale**: MCP configs are simple CRUD operations, direct DB access is acceptable. Agent selection should go through main backend API to respect existing character management logic.

### Decision 2: Agent Configuration Storage

**Option A: New Table in Mentis Database**
- `mentis_agent_configs` table
- Stores agent ID, configuration, enabled status
- Pros: Clear separation, easy to query
- Cons: Additional table to maintain

**Option B: Use Existing Mentis Tables**
- Extend existing session/agent tables
- Pros: No new schema
- Cons: May not fit existing structure

**Option C: Store in Admin Database, Sync to Mentis**
- Admin database as source of truth
- Sync to Mentis on changes
- Pros: Centralized in admin
- Cons: More complex sync logic

**Chosen: Option A - New Table in Mentis Database**
- Create `mentis_agent_configs` table
- Stores: agent_id (reference to main system), configuration JSON, enabled, created_at, updated_at
- Admin backend writes directly to this table
- Mentis backend reads from this table

**Rationale**: Clear ownership, easy to query, maintains data locality with Mentis.

### Decision 3: Synchronization Mechanism

**Option A: Event-Driven**
- Admin publishes events on config changes
- Mentis subscribes and updates
- Pros: Decoupled, scalable
- Cons: Requires event infrastructure

**Option B: Direct API Call**
- Admin calls Mentis API on config changes
- Pros: Simple, immediate
- Cons: Requires Mentis to be running, tight coupling

**Option C: Polling**
- Mentis polls admin for changes
- Pros: Simple
- Cons: Latency, inefficient

**Chosen: Option B - Direct API Call with Fallback**
- Admin calls Mentis API endpoint to notify config changes
- If Mentis is unavailable, log warning and continue
- Mentis backend provides `/api/mentis/admin/reload-configs` endpoint
- Admin calls this after MCP config changes

**Rationale**: Simple, immediate, acceptable coupling for admin operations.

### Decision 4: Agent Selection Criteria

**Decision**: Filter agents from main system based on:
- `isActive = true` (only active characters)
- Rich `systemInstruction` (characters with detailed instructions)
- Non-empty `skills` or `tags` (characters with defined capabilities)
- Optional: Filter by `systemEraId` if needed

**Rationale**: Focus on well-developed characters that can serve as effective agents.

## Architecture

```
┌─────────────────┐
│  Admin Frontend │
│  (React/TS)     │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼──────────────────────────────┐
│      Admin Backend                    │
│  ┌─────────────────────────────────┐  │
│  │ MentisManagementService         │  │
│  │  - MCP Config CRUD              │  │
│  │  - Agent Config Management      │  │
│  └─────────────────────────────────┘  │
│           │              │            │
│           │              │            │
│  ┌────────▼──┐   ┌──────▼──────┐    │
│  │ Mentis DB │   │ Main Backend │    │
│  │ (Direct)  │   │   (API Call) │    │
│  └───────────┘   └─────────────┘    │
└──────────────────────────────────────┘
         │
         │ Notify on changes
         │
┌────────▼────────┐
│ Mentis Backend  │
│  - Reload configs
│  - Use agents
└─────────────────┘
```

## Data Flow

### MCP Configuration Flow
1. Admin creates/updates MCP config → Write to Mentis DB
2. Admin calls Mentis API `/api/mentis/admin/reload-configs`
3. Mentis backend reloads MCP configurations
4. New configs available in Mentis immediately

### Agent Configuration Flow
1. Admin requests available agents → Call Main Backend API
2. Main Backend returns filtered list of rich characters
3. Admin selects agents → Write to `mentis_agent_configs` table
4. Admin calls Mentis API to reload agent configs
5. Selected agents available in Mentis

## Risks / Trade-offs

### Risk 1: Data Inconsistency
- **Risk**: Admin and Mentis configs get out of sync
- **Mitigation**: 
  - Always call reload API after changes
  - Add validation in Mentis to check config validity
  - Log sync failures for monitoring

### Risk 2: Main Backend Dependency
- **Risk**: Admin depends on main backend for agent list
- **Mitigation**:
  - Cache agent list with TTL
  - Graceful degradation if main backend unavailable
  - Show cached data with warning

### Risk 3: Direct Database Access
- **Risk**: Bypassing Mentis business logic
- **Mitigation**:
  - Keep MCP config structure simple
  - Add validation in admin backend
  - Document expected data format

### Trade-off: Performance vs Coupling
- **Chosen**: Direct DB access for MCP (performance) + API for agents (correctness)
- **Acceptable**: Slight coupling for admin operations

## Migration Plan

### Phase 1: Backend APIs
1. Create MentisManagementService
2. Create REST controllers
3. Test with existing MCP configs

### Phase 2: Agent Integration
1. Enhance main backend API for agent listing
2. Create agent configuration storage
3. Implement agent selection logic

### Phase 3: Frontend
1. Create admin frontend components
2. Integrate with admin sidebar
3. Test full workflow

### Phase 4: Synchronization
1. Implement reload mechanism
2. Add monitoring and logging
3. Test end-to-end

## Open Questions

1. **Agent Configuration Format**: What specific configuration options are needed for agents in Mentis? (e.g., default model, temperature, system instructions override)
2. **Multi-Tenancy**: If Mentis supports multi-tenancy, how should agent configs be scoped? (user-level vs system-level)
3. **Agent Versioning**: Should we track which version of a character from main system is used in Mentis?
4. **Bulk Operations**: Should admin support bulk enable/disable of MCP configs or agents?
