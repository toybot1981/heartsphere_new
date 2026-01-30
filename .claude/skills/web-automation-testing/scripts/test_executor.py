#!/usr/bin/env python3
"""
Test Executor
Executes test cases using Playwright and handles failures.
Supports page context collection on failure and database verification steps.
Supports progress output, timeline events, and content anomaly detection.
"""

import json
import os
import re
import sys
import traceback
import time
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext

try:
    from db_verifier import DBVerifier, parse_database_step
except ImportError:
    DBVerifier = None
    parse_database_step = None

# Default error keywords for content anomaly detection (Chinese + English)
CONTENT_ANOMALY_KEYWORDS = [
    "错误", "失败", "异常", "500", "404", "Internal Server Error",
    "Error", "Failed", "Exception", "未授权", "Unauthorized",
]
# Placeholder / empty-like content
CONTENT_PLACEHOLDER_PATTERNS = ["loading...", "加载中", "...", "－", "—"]


# Default step timeout (ms) - reduce flaky "stuck" on slow pages
STEP_TIMEOUT_MS = 15000


class TestExecutor:
    PAGE_CONTEXT_TEXT_LIMIT = 2000
    PAGE_CONTEXT_DOM_LIMIT = 3000

    def __init__(self, plan_file: str, headless: bool = True, verbose: bool = False, keep_open: bool = False):
        self.plan_file = plan_file
        self.plan = self._load_plan(plan_file)
        self.headless = headless
        self.verbose = verbose
        self.keep_open = keep_open
        self._tracking = self._resolve_tracking_config()
        self.results = {
            "execution_start": datetime.now().isoformat(),
            "test_cases": {},
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "skipped": 0,
                "passed_with_warnings": 0,
            },
            "timeline": [],
        }
        self._db_verifier = None

    def _resolve_tracking_config(self) -> Dict[str, Any]:
        """Resolve tracking options from plan metadata and environment."""
        meta = self.plan.get("metadata") or {}
        tracking = meta.get("tracking") or {}
        progress = tracking.get("progress_output", True)
        if os.environ.get("TEST_TRACKING_DISABLE_PROGRESS", "").strip():
            progress = False
        return {
            "progress_output": progress,
            "content_anomaly_detection": tracking.get("content_anomaly_detection", True),
            "timeline_detail": tracking.get("timeline_detail", "standard"),
        }

    def _timeline_append(self, event: str, metadata: Optional[Dict[str, Any]] = None):
        if not self.results.get("timeline") is None:
            self.results["timeline"].append({
                "event": event,
                "timestamp": datetime.now().isoformat(),
                "metadata": metadata or {},
            })

    def _progress_print(self, msg: str):
        if self._tracking.get("progress_output") and msg:
            print(msg, flush=True)

    def _get_db_verifier(self):
        if self._db_verifier is None and DBVerifier is not None:
            db_config = self.plan.get("database") or (self.plan.get("metadata") or {}).get("database") or {}
            self._db_verifier = DBVerifier(db_config)
        return self._db_verifier

    def _collect_page_context(self, page: Page, failed_step: str) -> Dict[str, Any]:
        """Collect page context on failure: URL, title, visible text, DOM snippet."""
        ctx = {"url": None, "title": None, "visible_text": None, "dom_snippet": None}
        try:
            ctx["url"] = page.url
            ctx["title"] = page.title()
        except Exception:
            pass
        try:
            text = page.evaluate("""() => {
                const body = document.body;
                if (!body) return '';
                return (body.innerText || body.textContent || '').trim();
            }""")
            if text and len(text) > self.PAGE_CONTEXT_TEXT_LIMIT:
                text = text[: self.PAGE_CONTEXT_TEXT_LIMIT] + "\n...[truncated]"
            ctx["visible_text"] = text
        except Exception:
            pass
        if failed_step and ("click" in failed_step or "verify" in failed_step or "type" in failed_step or "fill" in failed_step):
            try:
                selector = self._extract_selector_from_step(failed_step)
                if selector:
                    limit = self.PAGE_CONTEXT_DOM_LIMIT
                    snippet = page.evaluate("""(sel, lim) => {
                        try {
                            const el = document.querySelector(sel) || document.querySelector('[id="' + sel.replace('#','') + '"]');
                            if (!el) return null;
                            const html = el.outerHTML || '';
                            return html.length > lim ? html.slice(0, lim) + '...[truncated]' : html;
                        } catch (e) { return null; }
                    }""", selector if selector.startswith("#") else selector, limit)
                    ctx["dom_snippet"] = snippet
            except Exception:
                pass
        return ctx

    def _extract_selector_from_step(self, step: str) -> Optional[str]:
        step_lower = step.lower()
        if "text=" in step:
            try:
                return "text=" + step.split("text=")[1].strip().split()[0]
            except IndexError:
                return None
        if "#" in step:
            try:
                return "#" + step.split("#")[1].strip().split()[0]
            except IndexError:
                return None
        if "." in step and step.index(".") < 30:
            try:
                return "." + step.split(".")[1].strip().split()[0]
            except IndexError:
                return None
        return None

    def _write_agent_failure_summary(
        self, failed: List[Tuple[str, Dict[str, Any]]], output_file: Optional[str]
    ) -> None:
        """
        Write a concise failure summary for the agent: failed case id, name, error,
        failed step, and cursor_analysis path. Agent can fix and re-run.
        """
        if not failed:
            return
        lines = [
            "# 测试失败摘要（供 Agent 修复后重跑）",
            "",
            "以下用例失败，请根据错误信息与 Cursor 分析工件修复后重新运行测试。",
            "",
        ]
        for case_id, result in failed:
            lines.append(f"## {case_id}: {result.get('name', '')}")
            lines.append("")
            lines.append(f"- **错误:** {result.get('error', '')}")
            failed_step = None
            for s in result.get("steps", []):
                if s.get("status") == "failed":
                    failed_step = s.get("description", "")
                    break
            if failed_step:
                lines.append(f"- **失败步骤:** `{failed_step}`")
            if result.get("cursor_analysis_path"):
                lines.append(f"- **Cursor 分析:** {result['cursor_analysis_path']}")
            if result.get("screenshot"):
                lines.append(f"- **截图:** {result['screenshot']}")
            lines.append("")
        lines.append("---")
        lines.append("修复完成后请重新执行: python scripts/test_executor.py <plan> --output <results>")
        lines.append("")
        out_dir = Path(output_file).resolve().parent if output_file else Path(".").resolve()
        summary_path = out_dir / "agent_failure_summary.md"
        try:
            summary_path.write_text("\n".join(lines), encoding="utf-8")
            self._progress_print(f"\n失败摘要已写入: {summary_path}")
        except Exception as e:
            self._progress_print(f"\n写入失败摘要时出错: {e}")

    def _get_cursor_analysis_dir(self, output_file: Optional[str]) -> str:
        """Resolve cursor analysis output directory."""
        if output_file:
            base = str(Path(output_file).parent)
            return os.path.join(base, "cursor_analysis")
        return (
            self.plan.get("cursor_analysis_output_dir")
            or os.environ.get("CURSOR_ANALYSIS_DIR")
            or "cursor_analysis"
        )

    def _generate_cursor_analysis(
        self, result: Dict[str, Any], output_dir: str
    ) -> Optional[str]:
        """
        Generate Cursor analysis Markdown (and optional JSON) for a failed case.
        Returns path to the .md file or None on error.
        """
        if result.get("status") != "failed":
            return None
        case_id = result.get("case_id", "unknown")
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        base_name = f"cursor_analysis_{case_id}_{ts}"
        md_path = os.path.join(output_dir, f"{base_name}.md")

        lines = [
            "# Cursor 分析：测试失败上下文",
            "",
            f"**用例 ID:** {case_id}",
            f"**用例名称:** {result.get('name', '')}",
            f"**失败时间:** {datetime.now().isoformat()}",
            "",
            "## 失败信息",
            "",
            f"- **错误:** {result.get('error', '')}",
            "",
        ]

        failed_step = None
        db_info = None
        for s in result.get("steps", []):
            if s.get("status") == "failed":
                failed_step = s.get("description", "")
                if s.get("database"):
                    db_info = s["database"]
                break
        if failed_step:
            lines.append("## 失败步骤")
            lines.append("")
            lines.append(f"```\n{failed_step}\n```")
            lines.append("")

        if db_info:
            lines.append("## 数据库验证失败")
            lines.append("")
            lines.append(f"- **SQL:** `{db_info.get('sql', '')}`")
            lines.append(f"- **预期值:** {repr(db_info.get('expected'))}")
            lines.append(f"- **实际值:** {repr(db_info.get('actual'))}")
            lines.append("")

        ctx = result.get("page_context") or {}
        lines.append("## 页面上下文")
        lines.append("")
        lines.append(f"- **URL:** {ctx.get('url', '')}")
        lines.append(f"- **标题:** {ctx.get('title', '')}")
        if ctx.get("visible_text"):
            lines.append("")
            lines.append("### 可见文本摘要")
            lines.append("")
            lines.append("```")
            lines.append((ctx["visible_text"] or "")[:5000])
            lines.append("```")
        if ctx.get("dom_snippet"):
            lines.append("")
            lines.append("### 相关 DOM 片段")
            lines.append("")
            lines.append("```html")
            lines.append((ctx["dom_snippet"] or "")[:5000])
            lines.append("```")
        lines.append("")

        if result.get("screenshot"):
            lines.append("## 截图")
            lines.append("")
            lines.append(f"路径: `{result['screenshot']}`")
            lines.append("")
        lines.append("## 使用说明")
        lines.append("")
        lines.append("可将本文件在 Cursor 中打开，或复制内容到对话中，便于 AI 分析失败原因。")
        lines.append("")

        try:
            with open(md_path, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))
        except Exception:
            return None

        json_path = os.path.join(output_dir, f"{base_name}.json")
        try:
            payload = {
                "case_id": case_id,
                "name": result.get("name"),
                "error": result.get("error"),
                "failed_step": failed_step,
                "database": db_info,
                "page_context": ctx,
                "screenshot": result.get("screenshot"),
            }
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2, ensure_ascii=False)
        except Exception:
            pass
        return md_path

    def _check_content_anomaly(self, page: Page, step_description: str) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        After a successful verify/check step, check if page content shows anomalies.
        Returns (has_anomaly, list of {anomaly_type, details}).
        """
        if not self._tracking.get("content_anomaly_detection"):
            return False, []
        anomalies = []
        try:
            text = page.evaluate("""() => {
                const body = document.body;
                if (!body) return '';
                return (body.innerText || body.textContent || '').trim();
            }""")
            if not text or len(text.strip()) < 3:
                anomalies.append({"anomaly_type": "empty_or_placeholder", "details": "Page visible text is empty or very short."})
            else:
                text_lower = text.lower().strip()
                for kw in CONTENT_ANOMALY_KEYWORDS:
                    if kw.lower() in text_lower:
                        anomalies.append({"anomaly_type": "error_keyword", "details": f"Page contains keyword: {kw}"})
                        break
                for ph in CONTENT_PLACEHOLDER_PATTERNS:
                    if text_lower == ph or (len(text_lower) < 50 and ph in text_lower):
                        anomalies.append({"anomaly_type": "placeholder_only", "details": f"Page content looks like placeholder: {ph}"})
                        break
        except Exception as e:
            anomalies.append({"anomaly_type": "check_error", "details": str(e)})
        return len(anomalies) > 0, anomalies

    def _generate_cursor_analysis_for_anomaly(
        self, case_id: str, case_name: str, step_description: str,
        anomalies: List[Dict[str, Any]], page_context: Dict[str, Any], output_dir: str
    ) -> Optional[str]:
        """Generate Cursor analysis Markdown for content anomaly (passed but suspicious)."""
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        base_name = f"cursor_analysis_anomaly_{case_id}_{ts}"
        md_path = os.path.join(output_dir, f"{base_name}.md")
        lines = [
            "# Cursor 分析：页面内容异常",
            "",
            f"**用例 ID:** {case_id}",
            f"**用例名称:** {case_name}",
            f"**时间:** {datetime.now().isoformat()}",
            "",
            "## 说明",
            "",
            "验证步骤已通过，但检测到页面内容可能存在异常，建议人工确认。",
            "",
            "## 相关步骤",
            "",
            f"```\n{step_description}\n```",
            "",
            "## 异常项",
            "",
        ]
        for a in anomalies:
            lines.append(f"- **{a.get('anomaly_type', '')}**: {a.get('details', '')}")
        lines.append("")
        lines.append("## 页面上下文")
        lines.append("")
        lines.append(f"- **URL:** {page_context.get('url', '')}")
        lines.append(f"- **标题:** {page_context.get('title', '')}")
        if page_context.get("visible_text"):
            lines.append("")
            lines.append("### 可见文本摘要")
            lines.append("")
            lines.append("```")
            lines.append((page_context["visible_text"] or "")[:5000])
            lines.append("```")
        lines.append("")
        lines.append("## 使用说明")
        lines.append("")
        lines.append("可将本文件在 Cursor 中打开，或复制内容到对话中，便于 AI 分析是否为误报或真实问题。")
        lines.append("")
        try:
            with open(md_path, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))
        except Exception:
            return None
        return md_path

    def _load_plan(self, plan_file: str) -> Dict[str, Any]:
        """Load test plan from file."""
        with open(plan_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _find_test_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Find test case by ID."""
        for case in self.plan["test_cases"]:
            if case["id"] == case_id:
                return case
        return None
    
    def _execute_step(self, page: Page, step: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Execute a single test step.
        Returns (success, error_message, extra=None).
        extra may contain {"database": {sql, actual, expected}} on database verification failure.
        """
        try:
            step_lower = step.lower().strip()

            # Database verification steps (before generic verify/check)
            if parse_database_step is not None:
                parsed = parse_database_step(step)
                if parsed is not None:
                    sql, expected = parsed
                    verifier = self._get_db_verifier()
                    if verifier is None:
                        return False, "Database verification not available (pymysql or config missing)", None
                    r = verifier.verify(sql, expected)
                    if r["success"]:
                        return True, "", None
                    return False, r.get("error") or "Database verification failed", {"database": {"sql": r.get("sql"), "actual": r.get("actual"), "expected": r.get("expected")}}

            # Parse common step patterns
            if step_lower.startswith("navigate to"):
                url = step.split("to", 1)[1].strip().rstrip("/")
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(2000)
                return True, "", None
            
            elif step_lower.startswith("click"):
                selector = step.split("click", 1)[1].strip()
                # Chained locator: "outer >> inner" (e.g. row containing text then button)
                if " >> " in selector:
                    parts = [p.strip() for p in selector.split(" >> ", 1)]
                    if len(parts) == 2:
                        locator = page.locator(parts[0]).locator(parts[1])
                        locator.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                        locator.click()
                        page.wait_for_timeout(500)
                        return True, "", None
                # button:has-text("...") -> use get_by_role; use .first when multiple matches (e.g. 编辑 per row)
                if selector.startswith("button:has-text("):
                    m = re.match(r'button:has-text\s*\(\s*["\'](.+?)["\']\s*\)', selector, re.DOTALL)
                    if m:
                        btn_text = m.group(1).strip()
                        locator = page.get_by_role("button", name=btn_text).first
                        locator.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                        locator.click()
                        page.wait_for_timeout(500)
                        return True, "", None
                if selector.startswith("text="):
                    locator = page.locator(f"text={selector[5:]}")
                    locator.first.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                    locator.first.click()
                elif selector.startswith("#"):
                    locator = page.locator(selector)
                    locator.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                    locator.click()
                elif selector.startswith("."):
                    locator = page.locator(selector)
                    locator.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                    locator.click()
                else:
                    locator = page.locator(selector)
                    locator.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                    locator.click()
                page.wait_for_timeout(500)  # Wait for action to complete
                return True, "", None

            elif step_lower.startswith("type") or step_lower.startswith("fill"):
                # Extract selector and value (prefer " into " to avoid splitting inside "input")
                if " into " in step:
                    parts = step.split(" into ", 1)
                elif " in " in step:
                    parts = step.split(" in ", 1)
                else:
                    parts = []
                if len(parts) == 2:
                    value = parts[0].replace("type", "").replace("fill", "").strip().strip('"').strip("'")
                    selector = parts[1].strip()
                    # label=... -> get_by_label; textarea -> first textarea
                    if selector.lower().startswith("label="):
                        label_text = selector[6:].strip()
                        locator = page.get_by_label(label_text)
                    elif selector.lower() == "textarea":
                        locator = page.locator("textarea").first
                    else:
                        locator = page.locator(selector)
                    locator.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                    locator.fill(value)
                    page.wait_for_timeout(200)  # Small wait after fill
                    return True, "", None
                return False, "Invalid type/fill step format", None

            elif step_lower.startswith("select "):
                # "select <value_or_label> in <selector>" for HTML <select>
                if " in " in step:
                    parts = step.split(" in ", 1)
                    value_part = parts[0].replace("select", "").strip().strip('"').strip("'")
                    selector = parts[1].strip()
                    locator = page.locator(selector)
                    locator.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                    # Try by value first (empty string for "全部"), then by label
                    if value_part == "" or value_part.lower() == "全部":
                        locator.select_option(value="")
                    else:
                        try:
                            locator.select_option(value=value_part)
                        except Exception:
                            locator.select_option(label=value_part)
                    page.wait_for_timeout(300)
                    return True, "", None
                return False, "Invalid select step format (use: select <value> in <selector>)", None

            elif step_lower.startswith("wait for"):
                target = step.split("for", 1)[1].strip()
                # "N second(s)" -> wait N seconds; otherwise treat as selector
                if "second" in target.lower():
                    try:
                        seconds = int(target.split()[0])
                        page.wait_for_timeout(seconds * 1000)
                    except (ValueError, IndexError):
                        page.wait_for_selector(target, timeout=STEP_TIMEOUT_MS)
                else:
                    # label=... -> get_by_label; single "textarea" -> first textarea
                    if target.lower().startswith("label="):
                        label_text = target[6:].strip()
                        page.get_by_label(label_text).wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                    elif target.lower().strip() == "textarea":
                        page.locator("textarea").first.wait_for(state="visible", timeout=STEP_TIMEOUT_MS)
                    elif "," in target:
                        # Comma-separated selectors: wait for first that becomes visible (avoid long hang)
                        parts = [p.strip() for p in target.split(",")]
                        found = False
                        for part in parts:
                            try:
                                if part.lower().startswith("label="):
                                    label_text = part[6:].strip()
                                    page.get_by_label(label_text).wait_for(state="visible", timeout=min(STEP_TIMEOUT_MS, 5000))
                                elif part.lower().strip() == "textarea":
                                    page.locator("textarea").first.wait_for(state="visible", timeout=min(STEP_TIMEOUT_MS, 5000))
                                else:
                                    page.wait_for_selector(part, timeout=min(STEP_TIMEOUT_MS, 5000))
                                found = True
                                break
                            except Exception:
                                continue
                        if not found:
                            return False, f"None of the selectors became visible within timeout: {target}", None
                    else:
                        page.wait_for_selector(target, timeout=STEP_TIMEOUT_MS)
                return True, "", None

            elif step_lower.startswith("verify") or step_lower.startswith("check"):
                # Extract what to verify
                target = step.split("verify", 1)[1] if "verify" in step else step.split("check", 1)[1]
                target = target.strip()
                check_not_visible = target.endswith(" not visible")
                if check_not_visible:
                    target = target[:-len(" not visible")].strip()

                # Try to find the element
                if "text=" in target:
                    text = target.split("text=")[1].strip().strip('"').strip("'")
                    element = page.locator(f"text={text}")
                    count = element.count()
                    if check_not_visible:
                        if count == 0:
                            return True, "", None
                        return False, f"Text '{text}' should not be visible (found {count})", None
                    if count > 0:
                        return True, "", None
                    return False, f"Text '{text}' not found", None
                else:
                    element = page.locator(target)
                    count = element.count()
                    if check_not_visible:
                        if count == 0:
                            return True, "", None
                        return False, f"Element should not be visible (found {count})", None
                    if count > 0:
                        return True, "", None
                    return False, f"Element '{target}' not found", None

            else:
                return False, f"Unknown step pattern: {step}", None

        except Exception as e:
            return False, str(e), None
    
    def execute_test_case(
        self, case_id: str, page: Page,
        case_index: int = 0, total_cases: int = 1, output_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute a single test case. case_index is 1-based for display."""
        test_case = self._find_test_case(case_id)
        if not test_case:
            return {
                "status": "skipped",
                "error": f"Test case {case_id} not found"
            }
        total_steps = len(test_case["steps"])
        result = {
            "case_id": case_id,
            "name": test_case["name"],
            "status": "pending",
            "steps": [],
            "error": None,
            "screenshot": None,
            "started_at": None,
            "completed_at": None,
            "duration_ms": None,
            "content_anomalies": [],
        }
        started = time.perf_counter()
        result["started_at"] = datetime.now().isoformat()
        self._timeline_append("case_started", {"case_id": case_id, "name": test_case["name"]})
        self._progress_print(f"[Case {case_index}/{total_cases}] {case_id}: {test_case['name']}")

        try:
            for i, step in enumerate(test_case["steps"]):
                step_result = {
                    "step_number": i + 1,
                    "description": step,
                    "status": "pending",
                    "executed_at": None,
                    "duration_ms": None,
                }
                step_start = time.perf_counter()
                step_result["executed_at"] = datetime.now().isoformat()
                self._timeline_append("step_executed", {
                    "case_id": case_id, "step_number": i + 1, "description": step[:100]
                })
                self._progress_print(
                    f"[Case {case_index}/{total_cases}] {case_id}: {test_case['name']} - "
                    f"Step {i + 1}/{total_steps}: {step[:60]}{'...' if len(step) > 60 else ''}"
                )

                success, error, extra = self._execute_step(page, step)
                step_result["duration_ms"] = int((time.perf_counter() - step_start) * 1000)
                if success:
                    step_result["status"] = "passed"
                    step_lower = step.lower().strip()
                    if self._tracking.get("content_anomaly_detection") and (
                        step_lower.startswith("verify") or step_lower.startswith("check")
                    ):
                        has_anomaly, anomalies = self._check_content_anomaly(page, step)
                        if has_anomaly:
                            ctx = self._collect_page_context(page, step)
                            cursor_dir = self._get_cursor_analysis_dir(output_file)
                            md_path = self._generate_cursor_analysis_for_anomaly(
                                case_id, test_case["name"], step, anomalies, ctx, cursor_dir
                            )
                            for a in anomalies:
                                a["cursor_analysis_path"] = md_path
                            result["content_anomalies"].extend([
                                {"step": step, "anomaly_type": a.get("anomaly_type", ""), "details": a.get("details", ""), "cursor_analysis_path": md_path}
                                for a in anomalies
                            ])
                            self._timeline_append("page_content_anomaly", {
                                "case_id": case_id, "step": step[:80], "anomalies": [x.get("anomaly_type") for x in anomalies]
                            })
                else:
                    step_result["status"] = "failed"
                    step_result["error"] = error
                    if extra and "database" in extra:
                        step_result["database"] = extra["database"]
                    result["status"] = "failed"
                    result["error"] = f"Step {i + 1} failed: {error}"
                    result["page_context"] = self._collect_page_context(page, step)
                    screenshot_path = f"/tmp/test_{case_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                    try:
                        page.screenshot(path=screenshot_path, full_page=True)
                    except Exception:
                        pass
                    result["screenshot"] = screenshot_path
                    result["steps"].append(step_result)
                    break

                result["steps"].append(step_result)

            if result["status"] == "pending":
                if result.get("content_anomalies"):
                    result["status"] = "passed_with_warnings"
                else:
                    result["status"] = "passed"

            result["completed_at"] = datetime.now().isoformat()
            result["duration_ms"] = int((time.perf_counter() - started) * 1000)
            self._timeline_append("case_completed", {
                "case_id": case_id, "status": result["status"], "duration_ms": result["duration_ms"]
            })
            status_icon = "✅" if result["status"] == "passed" else "⚠️" if result["status"] == "passed_with_warnings" else "❌" if result["status"] == "failed" else "⏭️"
            self._progress_print(f"[Case {case_index}/{total_cases}] {case_id}: {test_case['name']} - {status_icon}")

            if result["screenshot"] is None:
                screenshot_path = f"/tmp/test_{case_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                try:
                    page.screenshot(path=screenshot_path, full_page=True)
                    result["screenshot"] = screenshot_path
                except Exception:
                    pass

        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            result["traceback"] = traceback.format_exc()
            result["completed_at"] = datetime.now().isoformat()
            result["duration_ms"] = int((time.perf_counter() - started) * 1000)
            self._timeline_append("case_completed", {"case_id": case_id, "status": "failed"})
            self._progress_print(f"[Case {case_index}/{total_cases}] {case_id}: {test_case['name']} - ❌")
        return result
    
    def _write_run_state(self, output_file: Optional[str]) -> None:
        """On failure, write run state so Agent can fix and resume from this point."""
        if not output_file or self.results["summary"].get("failed", 0) == 0:
            return
        passed_ids = [
            cid for cid, r in self.results.get("test_cases", {}).items()
            if r.get("status") in ("passed", "passed_with_warnings")
        ]
        failed_id = next(
            (cid for cid, r in self.results.get("test_cases", {}).items() if r.get("status") == "failed"),
            None,
        )
        if not failed_id:
            return
        state = {
            "plan_file": os.path.abspath(self.plan_file),
            "results_file": os.path.abspath(output_file),
            "passed_case_ids": passed_ids,
            "failed_case_id": failed_id,
            "timestamp": datetime.now().isoformat(),
        }
        # Prefer plan dir so state lives next to test plan (preserve scene in project)
        state_dir = os.path.dirname(os.path.abspath(self.plan_file)) or "."
        state_path = os.path.join(state_dir, "test_run_state.json")
        try:
            with open(state_path, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2, ensure_ascii=False)
            self._progress_print(f"\n📌 Run state saved: {state_path} (use --resume-from to continue from failed case)")
        except Exception:
            pass

    def run_all_tests(self, output_file: Optional[str] = None, resume_from: Optional[str] = None):
        """Execute all test cases. If resume_from is set, load state and skip passed cases."""
        if resume_from and os.path.isfile(resume_from):
            return self._run_resumed(output_file, resume_from)
        return self._run_all_tests_impl(output_file)

    def _run_resumed(self, output_file: Optional[str], state_path: str):
        """Load state, skip passed cases, run from failed case onward; merge results."""
        with open(state_path, "r", encoding="utf-8") as f:
            state = json.load(f)
        prev_results_path = state.get("results_file")
        passed_ids = set(state.get("passed_case_ids") or [])
        failed_id = state.get("failed_case_id")
        if not prev_results_path or not os.path.isfile(prev_results_path):
            self._progress_print(f"⚠️  Previous results not found: {prev_results_path}, running from start.")
            return self._run_all_tests_impl(output_file)
        with open(prev_results_path, "r", encoding="utf-8") as f:
            prev_results = json.load(f)
        # Merge previous timeline
        self.results["timeline"] = list(prev_results.get("timeline") or [])
        self.results["test_cases"] = {k: v for k, v in (prev_results.get("test_cases") or {}).items()}
        self.results["summary"] = {"total": 0, "passed": 0, "failed": 0, "skipped": 0, "passed_with_warnings": 0}
        for cid in passed_ids:
            if cid in self.results["test_cases"]:
                r = self.results["test_cases"][cid]
                self.results["summary"]["total"] += 1
                if r.get("status") == "passed":
                    self.results["summary"]["passed"] += 1
                elif r.get("status") == "passed_with_warnings":
                    self.results["summary"]["passed_with_warnings"] += 1
                else:
                    self.results["summary"]["skipped"] += 1
        self._progress_print(f"📌 Resuming: {len(passed_ids)} passed, continuing from '{failed_id}'")
        out_file = output_file or prev_results_path
        return self._run_all_tests_impl(out_file, skip_case_ids=passed_ids)

    def _run_all_tests_impl(self, output_file: Optional[str], skip_case_ids: Optional[set] = None):
        """Internal: execute test cases; skip_case_ids = set of case IDs to skip (use previous result)."""
        skip_set = skip_case_ids or set()
        app_url = self.plan["metadata"]["app_url"]

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context()
            page = context.new_page()
            page.on("dialog", lambda dialog: dialog.accept())

            try:
                page.goto(app_url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(2000)
                total_cases = len(self.plan["test_cases"])
                for idx, test_case in enumerate(self.plan["test_cases"]):
                    case_id = test_case["id"]
                    if case_id in skip_set:
                        continue
                    if self.verbose and not self._tracking.get("progress_output"):
                        print(f"Executing: {test_case['name']} ({case_id})", flush=True)
                    result = self.execute_test_case(
                        case_id, page,
                        case_index=idx + 1, total_cases=total_cases, output_file=output_file
                    )
                    self.results["test_cases"][case_id] = result
                    self.results["summary"]["total"] += 1
                    if result["status"] == "passed":
                        self.results["summary"]["passed"] += 1
                    elif result["status"] == "passed_with_warnings":
                        self.results["summary"]["passed_with_warnings"] += 1
                    elif result["status"] == "failed":
                        self.results["summary"]["failed"] += 1
                        for rest in self.plan["test_cases"][idx + 1:]:
                            rid = rest["id"]
                            if rid in skip_set:
                                self.results["summary"]["total"] += 1
                                self.results["summary"]["skipped"] += 1
                                continue
                            self.results["test_cases"][rid] = {
                                "case_id": rid,
                                "name": rest["name"],
                                "status": "skipped",
                                "error": "Skipped: previous case failed",
                                "steps": [],
                            }
                            self.results["summary"]["total"] += 1
                            self.results["summary"]["skipped"] += 1
                        break
                    else:
                        self.results["summary"]["skipped"] += 1
                    if self.verbose:
                        print(f"  Status: {result['status']}", flush=True)
                        if result.get("error"):
                            print(f"  Error: {result['error']}", flush=True)
                        if result.get("content_anomalies"):
                            print(f"  Content anomalies: {len(result['content_anomalies'])}", flush=True)

            finally:
                if self.keep_open and not self.headless:
                    print("\n浏览器保持打开 30 秒（或按 Enter 关闭）...", flush=True)
                    try:
                        if sys.stdin.isatty():
                            input()
                        else:
                            time.sleep(30)
                    except (EOFError, KeyboardInterrupt):
                        time.sleep(30)
                browser.close()

        self.results["execution_end"] = datetime.now().isoformat()
        cursor_dir = self._get_cursor_analysis_dir(output_file)
        for case_id, case_result in self.results["test_cases"].items():
            if case_result.get("status") == "failed":
                path = self._generate_cursor_analysis(case_result, cursor_dir)
                if path:
                    case_result["cursor_analysis_path"] = path
        if self.results.get("timeline"):
            self.results["timeline"].sort(key=lambda e: e.get("timestamp", ""))
        if output_file:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False)
            print(f"\nResults saved to: {output_file}", flush=True)
        failed = [(cid, r) for cid, r in self.results.get("test_cases", {}).items() if r.get("status") == "failed"]
        if failed:
            self._write_agent_failure_summary(failed, output_file)
            self._write_run_state(output_file)
        return self.results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_executor.py <plan_file> [--output <results_file>] [--resume-from <state_file>] [--headless] [--verbose] [--keep-open]")
        sys.exit(1)

    plan_file = sys.argv[1]
    output_file = None
    resume_from = None
    headless = True
    verbose = os.environ.get("TEST_TRACKING_VERBOSE", "").strip() == "1"
    keep_open = False

    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--output" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--resume-from" and i + 1 < len(sys.argv):
            resume_from = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--headless":
            headless = True
            i += 1
        elif sys.argv[i] == "--no-headless":
            headless = False
            i += 1
        elif sys.argv[i] == "--verbose":
            verbose = True
            i += 1
        elif sys.argv[i] == "--keep-open":
            keep_open = True
            i += 1
        else:
            i += 1

    executor = TestExecutor(plan_file, headless=headless, verbose=verbose, keep_open=keep_open)
    results = executor.run_all_tests(output_file, resume_from=resume_from)
    
    # Print summary
    print("\n" + "="*50, flush=True)
    print("TEST EXECUTION SUMMARY", flush=True)
    print("="*50, flush=True)
    print(f"Total: {results['summary']['total']}", flush=True)
    print(f"Passed: {results['summary']['passed']}", flush=True)
    if results['summary'].get('passed_with_warnings', 0) > 0:
        print(f"Passed with warnings: {results['summary']['passed_with_warnings']}", flush=True)
    print(f"Failed: {results['summary']['failed']}", flush=True)
    print(f"Skipped: {results['summary']['skipped']}", flush=True)
