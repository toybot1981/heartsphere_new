#!/usr/bin/env python3
"""
Test Runner
Orchestrates the complete testing workflow: plan -> execute -> fix -> retry -> report
"""

import json
import sys
import subprocess
import os
import signal
import time
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path


class TestRunner:
    def __init__(self, plan_file: str, max_iterations: int = 1000, fail_fast: bool = True, auto_fix_retry: bool = False, resume_from: Optional[str] = None):
        """
        Initialize test runner.

        Args:
            plan_file: Path to test plan file
            max_iterations: Maximum iterations (used when auto_fix_retry is True)
            fail_fast: If True (default), on first failure stop and hand result to Agent; do not auto-fix/retry.
                       测试失败后终止，将结果交给 Agent 分析并修复后再重新运行。
            auto_fix_retry: If True, on failure run test_fixer and retry until all pass. Use --auto-fix-retry.
            resume_from: Optional path to test_run_state.json; skip passed cases and continue from failed (保留现场继续).
        """
        self.plan_file = plan_file
        self.max_iterations = max_iterations
        self.fail_fast = fail_fast and not auto_fix_retry
        self.auto_fix_retry = auto_fix_retry
        self.resume_from = resume_from
        self.iteration = 0
        self.all_results = []
        self.final_report = None
        self.interrupted = False
        self.fix_history = []  # Track fix history to detect ineffective fixes
        
        # Setup signal handlers for graceful interruption
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle interruption signals (Ctrl+C or e.g. timeout SIGTERM)."""
        print("\n\n⚠️  Signal received (Ctrl+C or timeout/kill). Saving state and exiting...", flush=True)
        self.interrupted = True
    
    def load_plan(self) -> Dict[str, Any]:
        """Load test plan."""
        with open(self.plan_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def execute_tests(self, plan_file: str, headless: bool = True, resume_from: Optional[str] = None) -> str:
        """Execute tests and return results file path. If resume_from is set, skip passed cases and continue from failed."""
        results_file = f"/tmp/test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        if resume_from and os.path.isfile(resume_from):
            try:
                with open(resume_from, "r", encoding="utf-8") as f:
                    state = json.load(f)
                results_file = state.get("results_file") or results_file
            except Exception:
                pass
        script_dir = Path(__file__).parent
        executor_script = script_dir / "test_executor.py"
        cmd = [
            sys.executable,
            str(executor_script),
            plan_file,
            "--output", results_file
        ]
        if resume_from and os.path.isfile(resume_from):
            cmd.extend(["--resume-from", resume_from])
        if headless:
            cmd.append("--headless")
        if os.environ.get("TEST_TRACKING_VERBOSE", "").strip() == "1":
            cmd.append("--verbose")
        # Do not capture output so user sees executor progress (Case N/T, Step N/T) in real time
        result = subprocess.run(cmd)
        if result.returncode != 0:
            # returncode < 0 通常表示被信号终止（如超时 SIGTERM），非人为 Ctrl+C
            if result.returncode < 0:
                print("Test execution was terminated (e.g. timeout or signal), not necessarily by user.", flush=True)
            else:
                print("Test execution exited with non-zero code.", flush=True)
            return None
        return results_file
    
    def fix_tests(self, plan_file: str, results_file: str) -> Optional[str]:
        """Fix test failures and return updated plan file path."""
        fixed_plan_file = plan_file.replace(".json", f"_fixed_iter{self.iteration}.json")
        
        script_dir = Path(__file__).parent
        fixer_script = script_dir / "test_fixer.py"
        
        cmd = [
            sys.executable,
            str(fixer_script),
            plan_file,
            results_file,
            "--output", fixed_plan_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Fix application error: {result.stderr}")
            return None
        
        return fixed_plan_file
    
    def has_failures(self, results_file: str) -> bool:
        """Check if there are any test failures."""
        with open(results_file, 'r', encoding='utf-8') as f:
            results = json.load(f)
        return results["summary"]["failed"] > 0
    
    def _detect_ineffective_fixes(self) -> bool:
        """Detect if fixes are ineffective (same fixes applied multiple times)."""
        if len(self.fix_history) < 5:
            return False
        
        # Check last 5 fixes
        recent_fixes = self.fix_history[-5:]
        
        # If all recent fixes are identical (same plan file), it's ineffective
        if len(set(f.get("plan_file") for f in recent_fixes)) == 1:
            return True
        
        return False
    
    def run(self, headless: bool = True) -> Dict[str, Any]:
        """Run the complete testing workflow with continuous loop."""
        current_plan = self.plan_file
        
        print("="*60, flush=True)
        print("WEB AUTOMATION TESTING - CONTINUOUS EXECUTION", flush=True)
        print("="*60, flush=True)
        print(f"Test Plan: {self.plan_file}", flush=True)
        print(f"Max Iterations: {self.max_iterations} (or until success/interrupted)", flush=True)
        if self.auto_fix_retry:
            print("Mode: 自动修复并重试（--auto-fix-retry），直到全部通过。", flush=True)
        else:
            print("Mode: 失败即停，将结果交给 Agent 分析并修复后再重跑。", flush=True)
        print("Press Ctrl+C to interrupt gracefully", flush=True)
        print("", flush=True)
        
        while self.iteration < self.max_iterations and not self.interrupted:
            self.iteration += 1
            iteration_display = f"{self.iteration}" if self.max_iterations >= 1000 else f"{self.iteration}/{self.max_iterations}"
            max_display = "" if self.max_iterations >= 1000 else f"/{self.max_iterations}"
            ts_start = datetime.now().isoformat()
            print(f"\n{'='*60}")
            print(f"--- Iteration {iteration_display} ---")
            print(f"{'='*60}")
            print(f"[Iteration {self.iteration}{max_display}] Starting...")
            iteration_result = {
                "iteration": self.iteration,
                "plan_file": current_plan,
                "results_file": None,
                "summary": None,
                "timestamp": ts_start,
                "timeline_events": [
                    {"event": "iteration_started", "timestamp": ts_start, "metadata": {"iteration": self.iteration}},
                ],
            }
            if self.interrupted:
                print("\n⚠️  Test interrupted by user", flush=True)
                break
            print(f"📋 Executing tests from: {current_plan}", flush=True)
            # Use resume_from only on first iteration (preserve scene: skip passed, continue from failed)
            resume_from = getattr(self, "resume_from", None) if self.iteration == 1 else None
            results_file = self.execute_tests(current_plan, headless, resume_from=resume_from)
            if not results_file:
                print("❌ Test execution failed. Stopping.")
                break
            with open(results_file, 'r', encoding='utf-8') as f:
                results = json.load(f)
            iteration_result["results_file"] = results_file
            iteration_result["summary"] = results["summary"]
            ts_complete = datetime.now().isoformat()
            iteration_result["timeline_events"].append(
                {"event": "iteration_completed", "timestamp": ts_complete, "metadata": {"iteration": self.iteration, "summary": results["summary"]}}
            )
            total_cases = results["summary"].get("total", 0)
            completed = results["summary"].get("passed", 0) + results["summary"].get("passed_with_warnings", 0) + results["summary"].get("failed", 0) + results["summary"].get("skipped", 0)
            print(f"[Iteration {self.iteration}{max_display}] Progress: {completed}/{total_cases} cases completed")
            self.all_results.append(iteration_result)
            print(f"\n📊 Iteration {self.iteration} Results:")
            print(f"  Total: {results['summary']['total']}")
            print(f"  ✅ Passed: {results['summary']['passed']}")
            if results["summary"].get("passed_with_warnings", 0) > 0:
                print(f"  ⚠️  Passed with warnings: {results['summary']['passed_with_warnings']}")
            print(f"  ❌ Failed: {results['summary']['failed']}")
            print(f"  ⏭️  Skipped: {results['summary']['skipped']}")
            
            # Check if all tests passed
            if not self.has_failures(results_file):
                print("\n" + "="*60)
                print("🎉 All tests passed!")
                print("="*60)
                break
            
            # Default: stop on first failure and hand result to Agent (do not auto-fix/retry)
            if self.fail_fast:
                state_path = os.path.join(os.path.dirname(os.path.abspath(current_plan)) or ".", "test_run_state.json")
                print("\n" + "="*60, flush=True)
                print("⚠️  测试失败已终止，请将结果交给 Agent 分析并修复后再重新运行测试。", flush=True)
                print("   查看 agent_failure_summary.md 与 cursor_analysis/ 进行分析。", flush=True)
                if os.path.isfile(state_path):
                    print("   修复用例后可从保留现场继续：", flush=True)
                    print(f"   python test_runner.py {current_plan} --report <report> --resume-from {state_path}", flush=True)
                print("="*60, flush=True)
                break
            
            # Check for ineffective fixes
            if self._detect_ineffective_fixes():
                print("\n⚠️  Detected ineffective fixes (same fixes applied multiple times)")
                print("   Stopping to prevent infinite loop. Manual intervention may be needed.")
                break
            
            # Apply fixes
            print(f"\n🔧 Applying fixes (logs check + test case fixes)...")
            ts_fix = datetime.now().isoformat()
            iteration_result["timeline_events"].append(
                {"event": "fix_attempted", "timestamp": ts_fix, "metadata": {"iteration": self.iteration}}
            )
            fixed_plan = self.fix_tests(current_plan, results_file)
            # Record fix in history
            self.fix_history.append({
                "iteration": self.iteration,
                "plan_file": current_plan,
                "fixed_plan": fixed_plan,
            })
            
            if fixed_plan and os.path.exists(fixed_plan):
                # Check if plan actually changed
                with open(current_plan, 'r') as f1, open(fixed_plan, 'r') as f2:
                    plan_changed = f1.read() != f2.read()
                
                if plan_changed:
                    current_plan = fixed_plan
                    print(f"✅ Updated plan: {fixed_plan}")
                    # Wait a bit for services to stabilize after restart
                    if self.iteration > 1:  # Skip wait on first iteration
                        print("⏳ Waiting 3 seconds for services to stabilize...")
                        time.sleep(3)
                else:
                    print("ℹ️  No changes made to test plan.")
                    # Still continue, might be service-level fixes only
            else:
                print("⚠️  Failed to apply fixes, but continuing...")
        
        # Handle interruption
        if self.interrupted:
            print("\n" + "="*60)
            print("⚠️  TEST INTERRUPTED BY USER")
            print("="*60)
            print(f"Stopped at iteration {self.iteration}")
            print(f"Current plan: {current_plan}")
        
        # Generate final report
        self.final_report = self.generate_report()
        return self.final_report
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate final test report."""
        final_results = self.all_results[-1]["results_file"] if self.all_results else None
        if final_results:
            with open(final_results, 'r', encoding='utf-8') as f:
                final_data = json.load(f)
        else:
            final_data = {"summary": {"total": 0, "passed": 0, "failed": 0, "skipped": 0, "passed_with_warnings": 0}}
        summary = final_data.get("summary") or {}
        timeline = list(final_data.get("timeline") or [])
        for ir in self.all_results:
            for ev in ir.get("timeline_events") or []:
                timeline.append({"event": ev["event"], "timestamp": ev["timestamp"], "metadata": ev.get("metadata", {})})
        timeline.sort(key=lambda e: e.get("timestamp", ""))
        report = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "plan_file": self.plan_file,
                "total_iterations": self.iteration,
                "max_iterations": self.max_iterations,
                "interrupted": self.interrupted,
            },
            "execution_history": self.all_results,
            "fix_history": self.fix_history,
            "final_results": final_data,
            "timeline": timeline,
            "summary": {
                "total_tests": summary.get("total", 0),
                "passed": summary.get("passed", 0),
                "failed": summary.get("failed", 0),
                "skipped": summary.get("skipped", 0),
                "passed_with_warnings": summary.get("passed_with_warnings", 0),
                "success_rate": (
                    summary.get("passed", 0) / summary.get("total", 1) * 100
                    if summary.get("total", 0) > 0 else 0
                )
            }
        }
        return report
    
    def save_report(self, output_file: str):
        """Save test report to file."""
        if not self.final_report:
            self.final_report = self.generate_report()
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.final_report, f, indent=2, ensure_ascii=False)
        
        return output_file
    
    def print_report(self):
        """Print human-readable test report."""
        if not self.final_report:
            self.final_report = self.generate_report()
        
        report = self.final_report
        
        print("\n" + "="*60)
        print("FINAL TEST REPORT")
        print("="*60)
        print(f"\nTest Plan: {report['metadata']['plan_file']}")
        print(f"Total Iterations: {report['metadata']['total_iterations']}")
        if report['metadata'].get('interrupted'):
            print("⚠️  Test was interrupted by user")
        print(f"\nFinal Results:")
        print(f"  Total Tests: {report['summary']['total_tests']}")
        print(f"  Passed: {report['summary']['passed']}")
        if report['summary'].get('passed_with_warnings', 0) > 0:
            print(f"  Passed with warnings: {report['summary']['passed_with_warnings']}")
        print(f"  Failed: {report['summary']['failed']}")
        print(f"  Skipped: {report['summary']['skipped']}")
        print(f"  Success Rate: {report['summary']['success_rate']:.1f}%")
        
        if report['summary']['failed'] > 0:
            print("\nFailed Test Cases:")
            for case_id, result in report['final_results'].get('test_cases', {}).items():
                if result['status'] == 'failed':
                    print(f"  - {result['name']} ({case_id})")
                    if result.get('error'):
                        print(f"    Error: {result['error']}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_runner.py <plan_file> [--max-iterations <n>] [--no-headless] [--report <report_file>] [--auto-fix-retry] [--resume-from <state_file>]")
        print("  默认：测试失败后终止，将结果交给 Agent 分析并修复后再重新运行测试。")
        print("  --auto-fix-retry: 失败后自动修复并重试，直到全部通过。")
        print("  --resume-from: 从保留现场继续（跳过已通过用例，从失败用例起执行）。")
        sys.exit(1)

    plan_file = sys.argv[1]
    max_iterations = 1000
    headless = True
    report_file = None
    fail_fast = True   # Default: stop on failure, hand to Agent
    auto_fix_retry = False
    resume_from = None

    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--max-iterations" and i + 1 < len(sys.argv):
            max_iterations = int(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == "--no-headless":
            headless = False
            i += 1
        elif sys.argv[i] == "--report" and i + 1 < len(sys.argv):
            report_file = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--auto-fix-retry":
            auto_fix_retry = True
            fail_fast = False
            i += 1
        elif sys.argv[i] == "--resume-from" and i + 1 < len(sys.argv):
            resume_from = sys.argv[i + 1]
            i += 2
        else:
            i += 1

    runner = TestRunner(plan_file, max_iterations=max_iterations, fail_fast=fail_fast, auto_fix_retry=auto_fix_retry, resume_from=resume_from)
    report = runner.run(headless=headless)
    runner.print_report()
    
    if report_file:
        runner.save_report(report_file)
        print(f"\nReport saved to: {report_file}")
    
    # Exit with 1 when there are failures (so agent/CI knows to fix and re-run)
    if report and report.get("summary", {}).get("failed", 0) > 0:
        sys.exit(1)
