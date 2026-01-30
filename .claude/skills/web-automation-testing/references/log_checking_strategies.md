# Log Checking Strategies

This document describes how the web-automation-testing framework checks service logs and identifies errors.

## Overview

When tests fail, the framework automatically:
1. Identifies which services are involved (from test plan)
2. Locates log files (parsed from startup scripts)
3. Analyzes recent log entries for errors
4. Categorizes errors by type and auto-fixability
5. Suggests or applies fixes (e.g., service restart)

## Error Detection

The framework detects the following error types:

### Port In Use
**Patterns:**
- `Address already in use`
- `Port \d+ already in use`
- `bind.*address.*already in use`
- `端口.*已被占用`

**Auto-fixable:** Yes (restart service)
**Severity:** High

### Database Connection
**Patterns:**
- `Connection refused`
- `Access denied`
- `Unknown database`
- `无法连接到数据库`
- `数据库连接失败`

**Auto-fixable:** No (requires config changes)
**Severity:** High

### Configuration Error
**Patterns:**
- `Configuration error`
- `Missing property`
- `Invalid configuration`
- `配置错误`
- `缺少配置`

**Auto-fixable:** No (requires manual fix)
**Severity:** High

### Compilation Error
**Patterns:**
- `Compilation failure`
- `Cannot resolve`
- `编译错误`
- `无法解析`

**Auto-fixable:** No (code-level issue)
**Severity:** High

### Service Crash
**Patterns:**
- `Process.*exited`
- `Service.*stopped`
- `进程.*退出`
- `服务.*停止`

**Auto-fixable:** Yes (restart service)
**Severity:** Critical

### Timeout
**Patterns:**
- `Timeout`
- `Request timeout`
- `超时`

**Auto-fixable:** No
**Severity:** Medium

## Log Analysis Process

1. **Identify Services**: From test plan's base URL or services field
2. **Locate Log Files**: Parse from startup scripts or use cached paths
3. **Read Recent Lines**: Default 100 lines, configurable
4. **Pattern Matching**: Apply regex patterns to detect errors
5. **Deduplication**: Remove duplicate errors (same type and message)
6. **Severity Sorting**: Sort by severity (critical > high > medium > low)
7. **Auto-fix Detection**: Identify which errors can be auto-fixed

## Auto-Fix Strategy

Only certain errors trigger automatic fixes:

**Auto-fixable:**
- Port in use → Restart service
- Service crash → Restart service

**Not auto-fixable:**
- Database connection → Requires config changes
- Configuration error → Requires manual fix
- Compilation error → Code-level issue
- Timeout → May be transient or require investigation

## Service Restart Process

When a service needs restart:

1. **Check Status**: Verify service is running (PID file or process)
2. **Stop Service**: 
   - Send SIGTERM (graceful shutdown)
   - Wait up to 10 seconds
   - Send SIGKILL if still running
3. **Wait**: 2 second delay
4. **Start Service**: Execute startup script from `scripts/start/`
5. **Wait for Readiness**: 
   - Check process is running
   - Check log for "started", "ready", "listening" indicators
   - Maximum wait: 60 seconds

## Best Practices

1. **Monitor Logs**: Check logs regularly to understand service behavior
2. **Review Auto-fixes**: Verify service restarts resolved issues
3. **Manual Intervention**: Some errors require manual fixes (database, config)
4. **Log Rotation**: Framework reads recent lines, ensure logs are accessible
5. **Error Patterns**: Add custom error patterns if needed (extend `ERROR_PATTERNS`)

## Extending Error Detection

To add new error patterns, modify `log_analyzer.py`:

```python
ERROR_PATTERNS = {
    "custom_error": {
        "patterns": [
            r"Your error pattern here",
        ],
        "type": "custom_error",
        "auto_fixable": True,  # or False
        "severity": "high",  # critical, high, medium, low
    },
}
```
