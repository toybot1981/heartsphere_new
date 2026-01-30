## ADDED Requirements

### Requirement: Unified Build Script Framework
The system SHALL provide a unified build script framework that supports building all project modules with a single command.

#### Scenario: Build all modules
- **WHEN** developer runs `./scripts/build/build-all.sh`
- **THEN** the system builds all modules (main, admin, mentis, edu, frontend) in the correct order
- **AND** displays build progress and results for each module
- **AND** exits with error code if any module fails to build

#### Scenario: Build single module
- **WHEN** developer runs `./scripts/build/build-module.sh main`
- **THEN** the system builds only the specified module
- **AND** resolves and builds module dependencies if needed
- **AND** displays build output and results

#### Scenario: Parallel build
- **WHEN** developer runs `./scripts/build/build-all.sh --parallel`
- **THEN** the system builds independent modules in parallel
- **AND** respects dependency order (dependent modules wait for dependencies)
- **AND** limits parallel jobs to prevent resource exhaustion

### Requirement: Dependency Management
The system SHALL provide tools to check, cache, and manage project dependencies locally.

#### Scenario: Check dependencies
- **WHEN** developer runs `./scripts/build/check-dependencies.sh`
- **THEN** the system checks all required dependencies (Java, Maven, Node.js, Docker)
- **AND** verifies dependency versions meet requirements
- **AND** reports missing or incorrect dependencies

#### Scenario: Cache dependencies
- **WHEN** developer runs `./scripts/build/cache-dependencies.sh`
- **THEN** the system downloads and caches all Maven and npm dependencies to local cache
- **AND** stores cached dependencies in `.deps-cache/` directory
- **AND** supports offline build using cached dependencies

#### Scenario: Offline build
- **WHEN** developer runs build with `--offline` flag and network is unavailable
- **THEN** the system uses cached dependencies from `.deps-cache/`
- **AND** builds successfully without network access
- **AND** reports error if required dependencies are not cached

### Requirement: Build Cache System
The system SHALL provide a build cache mechanism to avoid rebuilding unchanged modules.

#### Scenario: Incremental build
- **WHEN** developer runs build after modifying only one module
- **THEN** the system detects unchanged modules using cache
- **AND** skips building unchanged modules
- **AND** only builds modified modules and their dependents

#### Scenario: Cache invalidation
- **WHEN** module source files or dependencies change
- **THEN** the system invalidates cache for that module
- **AND** rebuilds the module on next build
- **AND** updates cache with new build artifacts

#### Scenario: Cache cleanup
- **WHEN** developer runs `./scripts/build/cache-clean.sh`
- **THEN** the system removes old cache entries based on TTL (default 7 days)
- **AND** reports cache size before and after cleanup
- **AND** preserves recent cache entries

### Requirement: Build Configuration
The system SHALL support build configuration through YAML files.

#### Scenario: Load build config
- **WHEN** build script starts
- **THEN** the system loads configuration from `build-config.yml`
- **AND** reads module list, build order, and parallel settings
- **AND** validates configuration format and values

#### Scenario: Custom build config
- **WHEN** developer provides custom config file with `--config custom.yml`
- **THEN** the system uses custom configuration
- **AND** merges with default configuration
- **AND** validates merged configuration
