#!/usr/bin/env python3
"""
Test Plan Generator
Creates structured test plans from user requirements.
"""

import json
import sys
from typing import Dict, List, Any
from datetime import datetime


def create_test_plan(
    app_url: str,
    test_scope: str,
    requirements: List[str],
    priority: str = "medium"
) -> Dict[str, Any]:
    """
    Create a structured test plan.
    
    Args:
        app_url: URL of the application to test
        test_scope: Description of what to test
        requirements: List of test requirements
        priority: Priority level (low, medium, high)
    
    Returns:
        Dictionary containing the test plan
    """
    plan = {
        "metadata": {
            "created_at": datetime.now().isoformat(),
            "app_url": app_url,
            "test_scope": test_scope,
            "priority": priority
        },
        "requirements": requirements,
        "test_cases": [],
        "test_suites": []
    }
    return plan


def add_test_suite(plan: Dict[str, Any], suite_name: str, description: str) -> str:
    """Add a test suite to the plan and return its ID."""
    suite_id = f"suite_{len(plan['test_suites']) + 1}"
    suite = {
        "id": suite_id,
        "name": suite_name,
        "description": description,
        "test_cases": []
    }
    plan["test_suites"].append(suite)
    return suite_id


def add_test_case(
    plan: Dict[str, Any],
    suite_id: str,
    name: str,
    description: str,
    steps: List[str],
    expected_result: str,
    priority: str = "medium"
) -> str:
    """Add a test case to a suite and return its ID."""
    case_id = f"case_{len(plan['test_cases']) + 1}"
    test_case = {
        "id": case_id,
        "name": name,
        "description": description,
        "steps": steps,
        "expected_result": expected_result,
        "priority": priority,
        "status": "pending"
    }
    plan["test_cases"].append(test_case)
    
    # Add to suite
    for suite in plan["test_suites"]:
        if suite["id"] == suite_id:
            suite["test_cases"].append(case_id)
            break
    
    return case_id


def save_plan(plan: Dict[str, Any], filepath: str):
    """Save test plan to JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)


def load_plan(filepath: str) -> Dict[str, Any]:
    """Load test plan from JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_planner.py <command> [args...]")
        print("Commands:")
        print("  create <app_url> <test_scope> <output_file>")
        print("  add-suite <plan_file> <suite_name> <description>")
        print("  add-case <plan_file> <suite_id> <name> <description> <expected_result>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "create":
        if len(sys.argv) < 5:
            print("Usage: create <app_url> <test_scope> <output_file>")
            sys.exit(1)
        plan = create_test_plan(sys.argv[2], sys.argv[3], [])
        save_plan(plan, sys.argv[4])
        print(f"Test plan created: {sys.argv[4]}")
    
    elif command == "add-suite":
        if len(sys.argv) < 5:
            print("Usage: add-suite <plan_file> <suite_name> <description>")
            sys.exit(1)
        plan = load_plan(sys.argv[2])
        suite_id = add_test_suite(plan, sys.argv[3], sys.argv[4])
        save_plan(plan, sys.argv[2])
        print(f"Test suite added: {suite_id}")
    
    elif command == "add-case":
        if len(sys.argv) < 7:
            print("Usage: add-case <plan_file> <suite_id> <name> <description> <expected_result>")
            sys.exit(1)
        plan = load_plan(sys.argv[2])
        case_id = add_test_case(
            plan, sys.argv[3], sys.argv[4], sys.argv[5],
            [], sys.argv[6]
        )
        save_plan(plan, sys.argv[2])
        print(f"Test case added: {case_id}")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
