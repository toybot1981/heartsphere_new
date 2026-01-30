#!/usr/bin/env python3
"""
Execute API test plan: send HTTP requests, assert status/body. On failure write agent_failure_summary.md
(including backend log tail) and test_run_state.json; support --resume-from.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Run from scripts dir so local imports work
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import requests
from service_config import ServiceConfig, detect_project_root
from log_fetcher import get_backend_log_tail

BACKEND_TAIL_LINES = 200


def get_backend_service(plan: Dict[str, Any]) -> Optional[str]:
    if plan.get("backend_service"):
        return plan["backend_service"]
    base = plan.get("base_url", "")
    cfg = ServiceConfig(str(detect_project_root()))
    return cfg.backend_from_base_url(base)


def get_headers(plan: Dict[str, Any], saved_token: Optional[str] = None) -> Dict[str, str]:
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    token = saved_token
    if not token and plan.get("auth") == "bearer":
        token = os.environ.get("API_TEST_TOKEN", "")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def extract_value_from_response(response: requests.Response, path: str) -> Optional[str]:
    """从响应 JSON 中按路径提取值，如 data.token。返回字符串或转为字符串。"""
    try:
        data = response.json()
    except Exception:
        return None
    keys = path.split(".")
    cur = data
    for k in keys:
        cur = cur.get(k) if isinstance(cur, dict) else None
        if cur is None:
            return None
    return str(cur) if cur is not None else None


def run_step(base_url: str, headers: Dict[str, str], step: Dict[str, Any]) -> Tuple[Optional[requests.Response], Optional[str]]:
    method = (step.get("method") or "GET").upper()
    path = (step.get("path") or "").strip()
    if not path.startswith("/"):
        path = "/" + path
    url = base_url.rstrip("/") + path
    body = step.get("body")
    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            r = requests.post(url, json=body, headers=headers, timeout=30)
        elif method == "PUT":
            r = requests.put(url, json=body, headers=headers, timeout=30)
        elif method == "PATCH":
            r = requests.patch(url, json=body, headers=headers, timeout=30)
        elif method == "DELETE":
            r = requests.delete(url, headers=headers, timeout=30)
        else:
            return None, f"Unsupported method: {method}"
    except requests.RequestException as e:
        return None, str(e)
    return r, None


def assert_step(step: Dict[str, Any], response: requests.Response) -> Optional[str]:
    expected_status = step.get("expected_status")
    if expected_status is not None and response.status_code != expected_status:
        return f"Expected status {expected_status}, got {response.status_code}"
    contains = step.get("expected_body_contains")
    if not contains:
        return None
    try:
        data = response.json()
    except Exception:
        data = response.text
    if isinstance(contains, str):
        if "." in contains:
            keys = contains.split(".")
            cur = data
            for k in keys:
                cur = cur.get(k) if isinstance(cur, dict) else None
                if cur is None:
                    return f"expected_body_contains path '{contains}' not found"
            return None
        if isinstance(data, dict):
            text = json.dumps(data, ensure_ascii=False)
        else:
            text = str(data)
        if contains not in text:
            return f"Response body does not contain: {contains!r}"
    return None


def collect_cases(plan: Dict[str, Any]) -> List[tuple[str, str, Dict[str, Any], List[Dict]]]:
    out = []
    for suite in plan.get("test_suites", []):
        sid = suite.get("id", "")
        for case in suite.get("test_cases", []):
            cid = case.get("id", "")
            steps = case.get("steps", [])
            out.append((sid, cid, case, steps))
    return out


def write_failure_summary(
    output_dir: Path,
    plan: Dict[str, Any],
    case_id: str,
    case_name: str,
    step_index: int,
    step: Dict[str, Any],
    response: Optional[requests.Response],
    error: str,
    backend_service: Optional[str],
    backend_log_path_override: Optional[str] = None,
) -> None:
    lines = [
        "# API Test Failure Summary",
        "",
        "## Failed case",
        f"- Case ID: {case_id}",
        f"- Case name: {case_name}",
        f"- Step index: {step_index} (0-based)",
        "",
        "## Step",
        f"- Method: {step.get('method', 'GET')}",
        f"- Path: {step.get('path', '')}",
        f"- Body: {json.dumps(step.get('body'), ensure_ascii=False) if step.get('body') else '(none)'}",
        "",
        "## Error",
        error,
        "",
    ]
    if response is not None:
        lines.extend([
            "## Response",
            f"- Status: {response.status_code}",
            f"- Body (excerpt): {response.text[:2000]}",
            "",
        ])
    log_tail = ""
    if backend_service:
        log_tail = get_backend_log_tail(
            backend_service,
            tail_lines=BACKEND_TAIL_LINES,
            log_path_override=backend_log_path_override,
        )
    if log_tail:
        lines.extend(["## Backend log (last lines)", "", "```", log_tail, "```", ""])
    else:
        lines.extend(["## Backend log", "", "Log file not available or empty.", ""])
    out_path = output_dir / "agent_failure_summary.md"
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out_path}", file=sys.stderr)


def run_plan(
    plan_path: str,
    output_path: str,
    resume_from: Optional[str] = None,
    backend_log_path_override: Optional[str] = None,
) -> int:
    with open(plan_path, "r", encoding="utf-8") as f:
        plan = json.load(f)
    base_url = plan.get("base_url", "")
    backend_service = get_backend_service(plan)
    saved_token: Optional[str] = None
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    skip_passed = set()
    if resume_from and Path(resume_from).exists():
        with open(resume_from, "r", encoding="utf-8") as f:
            state = json.load(f)
        skip_passed = set(state.get("passed_case_ids", []))

    results = {
        "plan_file": plan_path,
        "base_url": base_url,
        "started_at": datetime.now().isoformat(),
        "summary": {"total": 0, "passed": 0, "failed": 0, "skipped": 0},
        "cases": [],
    }
    cases = collect_cases(plan)
    results["summary"]["total"] = len(cases)
    passed_ids = []
    failed_case_id = None
    failed_case_name = None
    failed_step_index = None
    failed_step = None
    failed_response = None
    failed_error = None

    for suite_id, case_id, case_data, steps in cases:
        if case_id in skip_passed:
            results["cases"].append({
                "suite_id": suite_id,
                "case_id": case_id,
                "name": case_data.get("name", ""),
                "status": "skipped",
                "reason": "resume-from",
            })
            results["summary"]["skipped"] += 1
            continue

        case_ok = True
        step_results = []
        for i, step in enumerate(steps):
            headers = get_headers(plan, saved_token)
            resp, err = run_step(base_url, headers, step)
            if err:
                case_ok = False
                failed_case_id = case_id
                failed_case_name = case_data.get("name", "")
                failed_step_index = i
                failed_step = step
                failed_response = resp
                failed_error = err
                step_results.append({"step_index": i, "status": "failed", "error": err})
                break
            assert_err = assert_step(step, resp)
            if assert_err:
                case_ok = False
                failed_case_id = case_id
                failed_case_name = case_data.get("name", "")
                failed_step_index = i
                failed_step = step
                failed_response = resp
                failed_error = assert_err
                step_results.append({"step_index": i, "status": "failed", "error": assert_err})
                break
            if step.get("save_token_path") and resp and 200 <= resp.status_code < 300:
                extracted = extract_value_from_response(resp, step["save_token_path"])
                if extracted:
                    saved_token = extracted
            step_results.append({"step_index": i, "status": "passed"})

        if case_ok:
            results["cases"].append({
                "suite_id": suite_id,
                "case_id": case_id,
                "name": case_data.get("name", ""),
                "status": "passed",
                "steps": step_results,
            })
            results["summary"]["passed"] += 1
            passed_ids.append(case_id)
        else:
            results["cases"].append({
                "suite_id": suite_id,
                "case_id": case_id,
                "name": case_data.get("name", ""),
                "status": "failed",
                "steps": step_results,
            })
            results["summary"]["failed"] += 1
            results["completed_at"] = datetime.now().isoformat()
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            write_failure_summary(
                output_dir,
                plan,
                failed_case_id,
                failed_case_name or failed_case_id,
                failed_step_index,
                failed_step,
                failed_response,
                failed_error,
                backend_service,
                backend_log_path_override,
            )
            state = {
                "results_file": output_path,
                "passed_case_ids": passed_ids,
                "failed_case_id": failed_case_id,
                "plan_file": plan_path,
            }
            state_path = output_dir / "test_run_state.json"
            with open(state_path, "w", encoding="utf-8") as f:
                json.dump(state, f, ensure_ascii=False, indent=2)
            print(f"Failure: case {failed_case_id}, step {failed_step_index}. See {output_dir / 'agent_failure_summary.md'}", file=sys.stderr)
            return 1

    results["completed_at"] = datetime.now().isoformat()
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    state = {
        "results_file": output_path,
        "passed_case_ids": [c["case_id"] for c in results["cases"] if c["status"] == "passed"],
        "failed_case_id": None,
        "plan_file": plan_path,
    }
    state_path = output_dir / "test_run_state.json"
    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    print(f"All {results['summary']['passed']} cases passed.")
    return 0


def main():
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("plan_file", help="API test plan JSON")
    p.add_argument("--output", "-o", required=True, help="Results JSON path")
    p.add_argument("--resume-from", help="test_run_state.json to resume from")
    p.add_argument("--backend-log-path", help="Override backend log path (absolute or relative to project root)")
    args = p.parse_args()
    sys.exit(run_plan(args.plan_file, args.output, args.resume_from, args.backend_log_path))


if __name__ == "__main__":
    main()
