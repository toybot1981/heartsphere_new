# Test Plan Template

## Test Plan Structure

A test plan is a JSON file with the following structure:

```json
{
  "metadata": {
    "created_at": "ISO timestamp",
    "app_url": "http://localhost:3000",
    "test_scope": "Description of what to test",
    "priority": "low|medium|high",
    "tracking": {
      "progress_output": true,
      "content_anomaly_detection": true,
      "timeline_detail": "standard"
    }
  },
  "requirements": [
    "Requirement 1",
    "Requirement 2"
  ],
  "test_cases": [
    {
      "id": "case_1",
      "name": "Test Case Name",
      "description": "Detailed description",
      "steps": [
        "navigate to http://localhost:3000",
        "click #login-button",
        "type \"username\" in #username-input",
        "verify text=Welcome"
      ],
      "expected_result": "User should be logged in successfully",
      "priority": "medium",
      "status": "pending"
    }
  ],
  "test_suites": [
    {
      "id": "suite_1",
      "name": "Authentication Suite",
      "description": "Tests for login and authentication",
      "test_cases": ["case_1", "case_2"]
    }
  ]
}
```

### Tracking configuration (optional)

Under `metadata.tracking` you can control test process tracking:

- **progress_output** (`true` | `false`, default `true`): Whether to print progress lines like `[Case M/T] case_id: name - Step S/T: description`. Overridden by env `TEST_TRACKING_DISABLE_PROGRESS=1`.
- **content_anomaly_detection** (`true` | `false`, default `true`): After successful verify/check steps, check page content for error keywords or empty/placeholder text; on anomaly, generate Cursor analysis and mark case as `passed_with_warnings`.
- **timeline_detail** (`"minimal"` | `"standard"` | `"verbose"`, default `"standard"`): Level of events recorded in the test result `timeline`.

Environment variables:

- **TEST_TRACKING_VERBOSE=1**: Enable verbose executor output (e.g. `--verbose`).
- **TEST_TRACKING_DISABLE_PROGRESS=1**: Disable progress output.

See `references/test_process_tracking.md` for full usage.

## Step Syntax

Test steps use natural language with common patterns:

- **Navigation**: `navigate to <URL>`
- **Click**: `click <selector>` or `click text=<text>`
- **Type/Fill**: `type "<value>" in <selector>` or `fill "<value>" in <selector>`
- **Wait**: `wait for <selector>` or `wait for 5 seconds`
- **Verify**: `verify text=<text>` or `check <selector>`

## Selector Strategies

1. **Text selectors**: `text=Login` or `text="Sign In"`
2. **ID selectors**: `#login-button`
3. **Class selectors**: `.btn-primary`
4. **CSS selectors**: `button[type="submit"]`
5. **Role selectors**: `role=button` (when using Playwright's role-based locators)
