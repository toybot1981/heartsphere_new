# API Automation Testing Examples

## Example plan

`example_api_test_plan.json` targets admin-backend at `http://localhost:8085` with a single health-check case. Adjust `path` to match your actual admin health endpoint (e.g. `/actuator/health` or `/api/admin/health`).

## Run from project root

```bash
# Ensure admin-backend is running (e.g. ./scripts/start/start-admin-backend.sh)

cd /path/to/project/root
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  .claude/skills/api-automation-testing/examples/example_api_test_plan.json \
  --output .claude/skills/api-automation-testing/examples/results.json
```

On failure, open `agent_failure_summary.md` and `test_run_state.json` in the same directory as `results.json` (here: `examples/`). Then fix backend, restart with:

```bash
python .claude/skills/api-automation-testing/scripts/restart_backend.py admin-backend
```

Re-run with resume:

```bash
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  .claude/skills/api-automation-testing/examples/example_api_test_plan.json \
  --output .claude/skills/api-automation-testing/examples/results.json \
  --resume-from .claude/skills/api-automation-testing/examples/test_run_state.json
```

Generate report:

```bash
python .claude/skills/api-automation-testing/scripts/report_generator.py \
  .claude/skills/api-automation-testing/examples/results.json \
  markdown .claude/skills/api-automation-testing/examples/report.md
```
