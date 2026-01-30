#!/usr/bin/env python3
"""
Create or edit API test plans (JSON). Add suites and cases with HTTP steps.
"""

import json
import sys
from typing import Any, Dict, List, Optional


def create_plan(
    base_url: str,
    name: str,
    backend_service: Optional[str] = None,
    auth: str = "none",
) -> Dict[str, Any]:
    plan = {
        "name": name,
        "base_url": base_url.rstrip("/"),
        "auth": auth,
        "test_suites": [],
    }
    if backend_service:
        plan["backend_service"] = backend_service
    return plan


def add_suite(plan: Dict[str, Any], suite_id: str, name: str, description: str = "") -> str:
    plan.setdefault("test_suites", []).append({
        "id": suite_id,
        "name": name,
        "description": description,
        "test_cases": [],
    })
    return suite_id


def add_case(
    plan: Dict[str, Any],
    suite_id: str,
    case_id: str,
    name: str,
    steps: List[Dict[str, Any]],
    description: str = "",
) -> str:
    for suite in plan.get("test_suites", []):
        if suite["id"] == suite_id:
            suite.setdefault("test_cases", []).append({
                "id": case_id,
                "name": name,
                "description": description,
                "steps": steps,
            })
            return case_id
    raise ValueError(f"Suite {suite_id} not found")


def save_plan(plan: Dict[str, Any], path: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(plan, f, ensure_ascii=False, indent=2)


def load_plan(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    import argparse
    p = argparse.ArgumentParser(description="Create or edit API test plan")
    p.add_argument("action", choices=["create", "add-suite", "add-case"], help="Action")
    p.add_argument("plan_file", help="Plan JSON path")
    p.add_argument("--base-url", default="http://localhost:8085", help="Base URL (create)")
    p.add_argument("--name", help="Plan or suite/case name")
    p.add_argument("--backend", help="backend_service (create)")
    p.add_argument("--suite-id", help="Suite ID (add-suite, add-case)")
    p.add_argument("--case-id", help="Case ID (add-case)")
    p.add_argument("--description", default="", help="Description")
    p.add_argument("--steps", help="JSON array of steps (add-case); each step: method, path, expected_status [, body, expected_body_contains]")
    args = p.parse_args()

    if args.action == "create":
        plan = create_plan(args.base_url, args.name or "API Test Plan", args.backend)
        save_plan(plan, args.plan_file)
        print("Created", args.plan_file)
        return

    plan = load_plan(args.plan_file)
    if args.action == "add-suite":
        add_suite(plan, args.suite_id, args.name or args.suite_id, args.description)
        save_plan(plan, args.plan_file)
        print("Added suite", args.suite_id)
    elif args.action == "add-case":
        steps = json.loads(args.steps) if args.steps else []
        add_case(plan, args.suite_id, args.case_id, args.name or args.case_id, steps, args.description)
        save_plan(plan, args.plan_file)
        print("Added case", args.case_id)


if __name__ == "__main__":
    main()
