# Web Automation Testing - Examples

This directory contains examples demonstrating how to use the web automation testing framework.

## Files

- `example_test_plan.json` - A complete example test plan in JSON format
- `create_example_plan.py` - Python script showing how to create a test plan programmatically

## Quick Start Example

### 1. Create a Test Plan

**Option A: Use the example JSON file**
```bash
# Copy the example plan
cp examples/example_test_plan.json my_test_plan.json

# Edit it to match your application
# Update app_url, selectors, and test steps
```

**Option B: Create programmatically**
```bash
python examples/create_example_plan.py
```

**Option C: Use the planner script**
```bash
# Create base plan
python scripts/test_planner.py create http://localhost:3000 "My Test Scope" my_plan.json

# Add test suite
python scripts/test_planner.py add-suite my_plan.json "Login Tests" "Authentication tests"

# Add test case
python scripts/test_planner.py add-case my_plan.json suite_1 "Login Test" "Test login" "User logged in"
```

### 2. Run Tests

**Complete workflow (recommended):**
```bash
python scripts/test_runner.py my_test_plan.json --max-iterations 5 --report test_report.json
```

**With server management:**
```bash
python scripts/run_with_server.py my_test_plan.json --server "npm run dev" --port 3000
```

### 3. Generate Report

```bash
# Generate HTML report
python scripts/report_generator.py test_report.json html test_report.html

# Generate Markdown report
python scripts/report_generator.py test_report.json markdown test_report.md
```

## Example Test Plan Structure

The example test plan includes:

1. **Authentication Suite**
   - Valid Login Test
   - Invalid Login Test
   - Logout Test

2. **Navigation Suite**
   - Navigation Test

## Customizing for Your Application

To adapt the example for your application:

1. **Update the app URL** in `metadata.app_url`
2. **Modify selectors** to match your HTML elements:
   - IDs: `#username-input` → your actual ID
   - Text: `text=Dashboard` → your actual text
   - Classes: `.btn-primary` → your actual class
3. **Adjust test steps** to match your application flow
4. **Update expected results** to match your application behavior

## Test Step Examples

```json
{
  "steps": [
    "navigate to http://localhost:3000/login",
    "wait for #username-input",
    "type \"testuser\" in #username-input",
    "click #login-button",
    "wait for navigation",
    "verify text=Dashboard"
  ]
}
```

## Common Patterns

See `references/test_case_patterns.md` for more examples of:
- Login flows
- Form submissions
- Navigation tests
- Search functionality
- Data display tests
- Chinese UI patterns
- SPA navigation (no URL change)

## Real-World Journal + Memory Example (心域 main 工程)

A full test plan for the main project's **现实世界日记** (RealWorld Screen) and **记忆提取** (Journal Memory) features is maintained in the main repo:

- **Location**: `main/frontend/e2e/realworld-journal-memory/`
- **Test plan**: `test_plan.json` (app_url: http://localhost:3000)
- **Docs**: `README.md`, `EXECUTION_GUIDE.md`, `TEST_PLAN_DETAILED.md`

This example demonstrates:
- Chinese UI selectors (`text=进入现实`, `text=写今日`, etc.)
- SPA navigation without URL changes (verify by feature text)
- Service startup via `scripts/start/` and log checking on failure

To run it from the project root:
```bash
python .claude/skills/web-automation-testing/scripts/test_runner.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --report main/frontend/e2e/realworld-journal-memory/report.json
```

See also `references/chinese_ui_testing.md` and `references/spa_navigation_testing.md`.
