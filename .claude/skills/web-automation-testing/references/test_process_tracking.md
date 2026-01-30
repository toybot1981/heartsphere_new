# Test Process Tracking

This document describes the test process tracking features: progress output, timeline events, and content anomaly detection.

## Overview

- **Progress output**: Real-time lines such as `[Case M/T] case_id: name` and `[Case M/T] case_id: name - Step S/T: description`, and a final status line `[Case M/T] case_id: name - ✅/❌/⏭️/⚠️`.
- **Timeline**: Events (case_started, case_completed, step_executed, page_content_anomaly, iteration_started, iteration_completed, fix_attempted) are recorded with timestamps and stored in the test result JSON and in the runner report.
- **Content anomaly detection**: After a successful verify/check step, the executor checks page content for error keywords, empty or placeholder text; if an anomaly is found, it generates a Cursor analysis artifact and marks the case as `passed_with_warnings`.

## Configuration

### Test plan (`metadata.tracking`)

| Field | Type | Default | Description |
|-------|------|--------|-------------|
| progress_output | boolean | true | Print progress to stdout. |
| content_anomaly_detection | boolean | true | Run content checks after verify/check steps. |
| timeline_detail | string | "standard" | Event detail level: "minimal", "standard", "verbose". |

### Environment variables

| Variable | Effect |
|----------|--------|
| TEST_TRACKING_VERBOSE=1 | Enables verbose executor output (e.g. status and anomaly count per case). |
| TEST_TRACKING_DISABLE_PROGRESS=1 | Disables progress output regardless of plan. |

## Result format

### Executor result JSON

- **test_cases[case_id]**:
  - `started_at`, `completed_at`, `duration_ms`
  - `content_anomalies`: `[{ "step", "anomaly_type", "details", "cursor_analysis_path" }]`
  - `status`: `passed` | `passed_with_warnings` | `failed` | `skipped`
- **steps[]**: `executed_at`, `duration_ms`
- **summary**: `passed_with_warnings` count
- **timeline**: `[{ "event", "timestamp", "metadata" }, ...]` (sorted by timestamp)

### Runner report

- **timeline**: Merged timeline from last executor result and runner events (iteration_started, iteration_completed, fix_attempted).
- **summary**: Includes `passed_with_warnings`.

## Reports

- **Markdown/HTML**: A "测试过程时间线" section lists events in time order. Cases with `passed_with_warnings` appear in a "Passed with Warnings (内容异常)" section with links to Cursor analysis artifacts.

## Usage

1. Use a test plan with default tracking (no need to set `metadata.tracking`).
2. Run the executor or runner as usual; progress and timeline are produced by default.
3. To disable progress: set `TEST_TRACKING_DISABLE_PROGRESS=1` or `metadata.tracking.progress_output: false`.
4. To get more console output: set `TEST_TRACKING_VERBOSE=1` or pass `--verbose` to the executor.
