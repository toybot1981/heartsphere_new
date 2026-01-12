# Add Multi-Datasource Support for Admin

## Overview

This change adds multi-datasource support to the admin application, allowing it to access multiple project databases (admin, mentis, edu) while maintaining backward compatibility with existing functionality.

**Note**: Main and company projects share the same database as admin project (`heartsphere`), so they don't need separate datasources.

## Implementation Summary

### Core Components Created

1. **DataSourceContextHolder** (`com.heartsphere.admin.config.DataSourceContextHolder`)
   - ThreadLocal-based context holder for storing the current datasource key
   - Provides methods to set, get, and clear the datasource key

2. **@DataSource Annotation** (`com.heartsphere.admin.config.DataSource`)
   - Annotation for specifying which datasource to use
   - Can be applied at method or class level
   - Default value is "admin"

3. **DataSourceAspect** (`com.heartsphere.admin.config.DataSourceAspect`)
   - AOP aspect that intercepts methods annotated with @DataSource
   - Dynamically switches datasources based on the annotation value
   - Automatically cleans up the datasource context after method execution

4. **DataSourceConfig** (`com.heartsphere.admin.config.DataSourceConfig`)
   - Configuration class that sets up multiple datasources
   - Configures admin, mentis, and edu datasources
   - Creates a routing datasource using AbstractRoutingDataSource
   - Sets admin datasource as the primary (default) datasource
   - **Note**: Main and company projects use the admin datasource (heartsphere database)

### Configuration Updates

1. **application.yml**
   - Added multi-datasource configuration sections
   - Configured HikariCP connection pool parameters for each datasource
   - Used environment variables for database names (with defaults)

### Dependencies Added

- `spring-boot-starter-aop` - Required for AOP-based datasource switching

## Usage

### Basic Usage

To use a specific datasource in a service method, simply annotate the method with `@DataSource`:

```java
@Service
public class SomeService {
    
    // Uses admin datasource (default)
    public void adminOperation() {
        // ...
    }
    
    // Uses mentis datasource
    @DataSource("mentis")
    public void mentisOperation() {
        // ...
    }
    
    // Uses edu datasource
    @DataSource("edu")
    public void eduOperation() {
        // ...
    }
}
```

### Class-Level Annotation

You can also annotate the entire class:

```java
@Service
@DataSource("edu")
public class EduService {
    // All methods in this class will use edu datasource
}
```

### Transaction Management

Each datasource operation runs in its own transaction context. Cross-datasource transactions are NOT supported.

## Database Configuration

The following datasources are configured:

- **admin**: `heartsphere` (default, also used by main and company projects)
- **mentis**: `heartsphere_mentis` (configurable via `MENTIS_DB_NAME`)
- **edu**: `heartsphere_edu` (configurable via `EDU_DB_NAME`)

**Note**: Main and company projects share the `heartsphere` database with admin project, so they use the admin datasource by default.

## Environment Variables

You can override database names using environment variables:

- `MENTIS_DB_NAME` (default: `heartsphere_mentis`)
- `EDU_DB_NAME` (default: `heartsphere_edu`)
- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `3306`)
- `DB_USER` (default: `root`)
- `DB_PASSWORD` (default: `123456`)

## Testing

To test the multi-datasource functionality:

1. Ensure all required databases exist
2. Start the admin application
3. Create service methods with `@DataSource` annotations
4. Test datasource switching by calling methods with different datasource annotations

## Known Limitations

1. **Cross-datasource transactions**: Not supported. Each datasource has its own transaction context.
2. **Dynamic datasource addition**: Currently not supported. All datasources must be configured in `application.yml`.
3. **Repository-level datasource switching**: Currently not implemented. Use service-level annotations instead.

## Next Steps

1. Add datasource health check endpoints
2. Add monitoring for datasource connections
3. Implement repository-level datasource switching if needed
4. Add integration tests for multi-datasource scenarios

## Backward Compatibility

This change is fully backward compatible. Existing code will continue to work using the admin datasource (default). New code can opt-in to use other datasources by adding the `@DataSource` annotation.
