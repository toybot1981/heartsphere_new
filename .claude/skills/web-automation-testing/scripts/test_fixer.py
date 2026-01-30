#!/usr/bin/env python3
"""
Test Fixer
Analyzes test failures and attempts automatic fixes.
"""

import json
import sys
import re
from typing import Dict, List, Any, Optional
from pathlib import Path
from log_analyzer import LogAnalyzer
from service_manager import ServiceManager


class TestFixer:
    def __init__(self, plan_file: str, results_file: str, project_root: Optional[str] = None):
        self.plan = self._load_json(plan_file)
        self.results = self._load_json(results_file)
        self.fixes_applied = []
        self.service_fixes = []
        self.log_analyzer = LogAnalyzer(project_root)
        self.service_manager = ServiceManager(project_root)
    
    def _load_json(self, filepath: str) -> Dict[str, Any]:
        """Load JSON file."""
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _save_json(self, data: Dict[str, Any], filepath: str):
        """Save JSON file."""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def _extract_services_from_plan(self) -> List[str]:
        """Extract service names from test plan."""
        services = []
        
        # Check if plan has services specified
        if "services" in self.plan:
            services.extend(self.plan["services"])
        
        # Try to infer from base_url or other fields
        base_url = self.plan.get("base_url", "")
        if "localhost:8081" in base_url or "main" in base_url.lower():
            services.append("main-backend")
            services.append("main-frontend")
        elif "localhost:8085" in base_url or "admin" in base_url.lower():
            services.append("admin-backend")
            services.append("admin-frontend")
        elif "localhost:8084" in base_url or "edu" in base_url.lower():
            services.append("edu-backend")
            services.append("edu-frontend")
        elif "localhost:8083" in base_url or "company" in base_url.lower():
            services.append("company-backend")
            services.append("company-frontend")
        elif "localhost:8082" in base_url or "mentis" in base_url.lower():
            services.append("mentis-backend")
            services.append("mentis-frontend")
        
        return list(set(services))  # Remove duplicates
    
    def check_service_logs(self) -> Dict[str, Any]:
        """Check service logs for errors."""
        services = self._extract_services_from_plan()
        
        if not services:
            return {"checked": False, "reason": "No services found in test plan"}
        
        print(f"\nChecking logs for services: {', '.join(services)}")
        log_analysis = self.log_analyzer.analyze_service_logs(services, lines=100)
        
        service_issues = []
        needs_restart = []
        
        for service_name, analysis in log_analysis.items():
            if analysis.get("errors"):
                service_issues.append({
                    "service": service_name,
                    "log_path": analysis.get("log_path"),
                    "errors": analysis.get("errors", []),
                    "needs_restart": analysis.get("needs_restart", False),
                })
                
                if analysis.get("needs_restart"):
                    needs_restart.append(service_name)
        
        return {
            "checked": True,
            "services_analyzed": services,
            "service_issues": service_issues,
            "needs_restart": needs_restart,
        }
    
    def fix_service_issues(self, service_issues: Dict[str, Any]) -> Dict[str, Any]:
        """Fix service issues by restarting services."""
        needs_restart = service_issues.get("needs_restart", [])
        
        if not needs_restart:
            return {"fixed": False, "reason": "No services need restart"}
        
        restart_results = {}
        for service_name in needs_restart:
            print(f"\nAttempting to restart service: {service_name}")
            success = self.service_manager.restart_service(service_name)
            restart_results[service_name] = success
            
            if success:
                self.service_fixes.append({
                    "service": service_name,
                    "action": "restart",
                    "success": True,
                })
            else:
                self.service_fixes.append({
                    "service": service_name,
                    "action": "restart",
                    "success": False,
                })
        
        return {
            "fixed": any(restart_results.values()),
            "restart_results": restart_results,
        }
    
    def analyze_failures(self) -> List[Dict[str, Any]]:
        """Analyze test failures and suggest fixes."""
        failures = []
        
        for case_id, result in self.results["test_cases"].items():
            if result["status"] == "failed":
                failure = {
                    "case_id": case_id,
                    "name": result["name"],
                    "error": result.get("error", "Unknown error"),
                    "failed_step": None,
                    "suggested_fixes": []
                }
                
                # Find failed step
                for step in result.get("steps", []):
                    if step["status"] == "failed":
                        failure["failed_step"] = step
                        break
                
                # Analyze error and suggest fixes
                error_msg = failure["error"].lower()
                
                if "not found" in error_msg or "element" in error_msg:
                    failure["suggested_fixes"].append({
                        "type": "selector_update",
                        "description": "Selector may be incorrect or element may have changed",
                        "action": "Update selector or add wait condition"
                    })
                
                if "timeout" in error_msg:
                    failure["suggested_fixes"].append({
                        "type": "wait_condition",
                        "description": "Element may need more time to appear",
                        "action": "Add explicit wait or increase timeout"
                    })
                
                if "click" in error_msg or "interact" in error_msg:
                    failure["suggested_fixes"].append({
                        "type": "interaction_fix",
                        "description": "Element may not be clickable or visible",
                        "action": "Add scroll into view or wait for element to be visible"
                    })
                
                failures.append(failure)
        
        return failures
    
    def apply_fix(self, case_id: str, fix_type: str) -> bool:
        """Apply a fix to a test case."""
        test_case = None
        for case in self.plan["test_cases"]:
            if case["id"] == case_id:
                test_case = case
                break
        
        if not test_case:
            return False
        
        original_steps = test_case["steps"].copy()
        
        if fix_type == "selector_update":
            # Try to improve selectors
            for i, step in enumerate(test_case["steps"]):
                # Replace generic selectors with more specific ones
                if "click" in step.lower() and not any(x in step for x in ["text=", "#", ".", "[", "role="]):
                    # Try to make selector more specific
                    test_case["steps"][i] = step.replace("click", "click text=")
        
        elif fix_type == "wait_condition":
            # Add wait conditions before interactions
            new_steps = []
            for step in test_case["steps"]:
                step_lower = step.lower()
                if "click" in step_lower or "type" in step_lower or "fill" in step_lower:
                    # Extract selector
                    selector = self._extract_selector(step)
                    if selector:
                        new_steps.append(f"wait for {selector}")
                new_steps.append(step)
            test_case["steps"] = new_steps
        
        elif fix_type == "interaction_fix":
            # Add scroll and visibility checks
            new_steps = []
            for step in test_case["steps"]:
                step_lower = step.lower()
                if "click" in step_lower:
                    selector = self._extract_selector(step)
                    if selector:
                        new_steps.append(f"wait for {selector} to be visible")
                new_steps.append(step)
            test_case["steps"] = new_steps
        
        # Check if steps changed
        if test_case["steps"] != original_steps:
            self.fixes_applied.append({
                "case_id": case_id,
                "fix_type": fix_type,
                "original_steps": original_steps,
                "updated_steps": test_case["steps"]
            })
            return True
        
        return False
    
    def _extract_selector(self, step: str) -> Optional[str]:
        """Extract selector from a step."""
        # Simple extraction - can be improved
        if "text=" in step:
            return step.split("text=")[1].split()[0]
        elif "#" in step:
            return "#" + step.split("#")[1].split()[0]
        elif "." in step and step.index(".") < 20:  # Likely a class selector
            return "." + step.split(".")[1].split()[0]
        return None
    
    def auto_fix_all(self, check_logs: bool = True) -> Dict[str, Any]:
        """
        Automatically fix all failures.
        
        Args:
            check_logs: Whether to check service logs and fix service issues
        """
        # First, check service logs if enabled
        service_fix_result = None
        if check_logs:
            service_issues = self.check_service_logs()
            if service_issues.get("checked") and service_issues.get("needs_restart"):
                service_fix_result = self.fix_service_issues(service_issues)
        
        # Then fix test case issues
        failures = self.analyze_failures()
        fix_summary = {
            "total_failures": len(failures),
            "fixes_attempted": 0,
            "fixes_applied": 0,
            "fixes_by_type": {},
            "service_fixes": self.service_fixes,
        }
        
        for failure in failures:
            for fix in failure["suggested_fixes"]:
                fix_type = fix["type"]
                fix_summary["fixes_attempted"] += 1
                
                if fix_type not in fix_summary["fixes_by_type"]:
                    fix_summary["fixes_by_type"][fix_type] = 0
                
                if self.apply_fix(failure["case_id"], fix_type):
                    fix_summary["fixes_applied"] += 1
                    fix_summary["fixes_by_type"][fix_type] += 1
                    break  # Apply one fix per failure
        
        return fix_summary
    
    def save_updated_plan(self, output_file: str):
        """Save the updated test plan with fixes."""
        self._save_json(self.plan, output_file)
        return output_file


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_fixer.py <plan_file> <results_file> [--output <updated_plan_file>]")
        sys.exit(1)
    
    plan_file = sys.argv[1]
    results_file = sys.argv[2]
    output_file = None
    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == "--output" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
            break
        i += 1
    
    if not output_file:
        output_file = plan_file.replace(".json", "_fixed.json")
    
    fixer = TestFixer(plan_file, results_file)
    
    print("Analyzing failures...")
    failures = fixer.analyze_failures()
    print(f"Found {len(failures)} failed test cases")
    
    print("\nApplying automatic fixes...")
    summary = fixer.auto_fix_all(check_logs=True)
    
    if summary.get("service_fixes"):
        print("\nService fixes:")
        for fix in summary["service_fixes"]:
            status = "✅" if fix.get("success") else "❌"
            print(f"  {status} {fix['service']}: {fix['action']}")
    
    print(f"\nFixes applied: {summary['fixes_applied']}/{summary['fixes_attempted']}")
    for fix_type, count in summary["fixes_by_type"].items():
        print(f"  {fix_type}: {count}")
    
    fixer.save_updated_plan(output_file)
    print(f"\nUpdated plan saved to: {output_file}")
