#!/usr/bin/env python3
"""
Test Report Generator
Generates human-readable test reports in various formats.
"""

import json
import sys
from typing import Dict, Any
from datetime import datetime
from pathlib import Path


class ReportGenerator:
    def __init__(self, report_data: Dict[str, Any]):
        self.data = report_data
    
    def generate_markdown(self) -> str:
        """Generate markdown report."""
        md = []
        md.append("# Web Automation Test Report\n")
        md.append(f"**Generated:** {self.data['metadata']['generated_at']}\n")
        md.append(f"**Test Plan:** {self.data['metadata']['plan_file']}\n")
        md.append(f"**Total Iterations:** {self.data['metadata']['total_iterations']}\n")
        
        md.append("\n## Summary\n")
        summary = self.data['summary']
        md.append(f"- **Total Tests:** {summary['total_tests']}")
        md.append(f"- **Passed:** {summary['passed']} ✅")
        if summary.get('passed_with_warnings', 0) > 0:
            md.append(f"- **Passed with warnings:** {summary['passed_with_warnings']} ⚠️")
        md.append(f"- **Failed:** {summary['failed']} ❌")
        md.append(f"- **Skipped:** {summary['skipped']} ⏭️")
        md.append(f"- **Success Rate:** {summary['success_rate']:.1f}%\n")
        # Test process timeline
        timeline = self.data.get('timeline') or []
        if timeline:
            md.append("\n## 测试过程时间线\n")
            md.append("| 时间 | 事件 | 说明 |")
            md.append("|------|------|------|")
            for e in timeline:
                ts = e.get('timestamp', '')[:19].replace('T', ' ')
                ev = e.get('event', '')
                meta = e.get('metadata') or {}
                desc = str(meta)[:80] if meta else ""
                md.append(f"| {ts} | {ev} | {desc} |")
            md.append("")
        # Execution history
        if len(self.data['execution_history']) > 1:
            md.append("\n## Execution History\n")
            md.append("| Iteration | Total | Passed | Failed | Skipped |\n")
            md.append("|-----------|-------|--------|--------|---------|\n")
            for hist in self.data['execution_history']:
                s = hist['summary']
                md.append(f"| {hist['iteration']} | {s['total']} | {s['passed']} | {s['failed']} | {s['skipped']} |\n")
        
        # Test case details
        md.append("\n## Test Case Details\n")
        test_cases = self.data['final_results'].get('test_cases', {})
        
        for case_id, result in test_cases.items():
            status_icon = "✅" if result['status'] == 'passed' else "⚠️" if result['status'] == 'passed_with_warnings' else "❌" if result['status'] == 'failed' else "⏭️"
            md.append(f"\n### {status_icon} {result['name']}\n")
            md.append(f"**ID:** {case_id}\n")
            md.append(f"**Status:** {result['status']}\n")
            if result.get('started_at'):
                md.append(f"**Started:** {result['started_at'][:19]}\n")
            if result.get('duration_ms') is not None:
                md.append(f"**Duration:** {result['duration_ms']} ms\n")
            if result.get('error'):
                md.append(f"**Error:** {result['error']}\n")
            if result.get('content_anomalies'):
                md.append("\n**内容异常 (通过但需关注):**\n")
                for a in result['content_anomalies']:
                    md.append(f"- {a.get('anomaly_type', '')}: {a.get('details', '')}\n")
                    if a.get('cursor_analysis_path'):
                        md.append(f"  - 详见 Cursor 分析：`{a['cursor_analysis_path']}`\n")
            if result.get('steps'):
                md.append("\n**Steps:**\n")
                for step in result['steps']:
                    step_icon = "✅" if step['status'] == 'passed' else "❌"
                    md.append(f"{step_icon} Step {step['step_number']}: {step['description']}\n")
                    if step.get('executed_at'):
                        md.append(f"   - 执行时间: {step['executed_at'][:19]}, 耗时: {step.get('duration_ms', '')} ms\n")
                    if step.get('error'):
                        md.append(f"   - Error: {step['error']}\n")
            if result.get('screenshot'):
                md.append(f"\n**Screenshot:** {result['screenshot']}\n")
            if result.get('cursor_analysis_path'):
                md.append(f"\n**详见 Cursor 分析：** `{result['cursor_analysis_path']}`\n")

        # Failed tests section
        failed_tests = [
            (case_id, result) for case_id, result in test_cases.items()
            if result['status'] == 'failed'
        ]
        
        if failed_tests:
            md.append("\n## Failed Tests Summary\n")
            for case_id, result in failed_tests:
                md.append(f"- **{result['name']}** ({case_id})\n")
                if result.get('error'):
                    md.append(f"  - Error: {result['error']}\n")
                if result.get('cursor_analysis_path'):
                    md.append(f"  - 详见 Cursor 分析：`{result['cursor_analysis_path']}`\n")
        # Passed with warnings (content anomalies)
        warned_tests = [
            (cid, res) for cid, res in test_cases.items()
            if res.get('status') == 'passed_with_warnings'
        ]
        if warned_tests:
            md.append("\n## Passed with Warnings (内容异常)\n")
            for case_id, result in warned_tests:
                md.append(f"- **{result['name']}** ({case_id})\n")
                for a in result.get('content_anomalies') or []:
                    md.append(f"  - {a.get('anomaly_type', '')}: {a.get('details', '')}\n")
                    if a.get('cursor_analysis_path'):
                        md.append(f"    - 详见 Cursor 分析：`{a['cursor_analysis_path']}`\n")
        return "\n".join(md)
    
    def generate_html(self) -> str:
        """Generate HTML report."""
        md_content = self.generate_markdown()
        
        # Simple markdown to HTML conversion (basic)
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Web Automation Test Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }}
        h1 {{
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }}
        h2 {{
            color: #555;
            margin-top: 30px;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }}
        th {{
            background-color: #4CAF50;
            color: white;
        }}
        tr:nth-child(even) {{
            background-color: #f2f2f2;
        }}
        .passed {{
            color: #4CAF50;
            font-weight: bold;
        }}
        .failed {{
            color: #f44336;
            font-weight: bold;
        }}
        .skipped {{
            color: #ff9800;
            font-weight: bold;
        }}
        pre {{
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }}
    </style>
</head>
<body>
{self._markdown_to_html(md_content)}
</body>
</html>"""
        return html
    
    def _markdown_to_html(self, md: str) -> str:
        """Simple markdown to HTML converter."""
        html = md
        # Convert headers
        html = html.replace("# ", "<h1>").replace("\n# ", "</h1>\n<h1>")
        html = html.replace("## ", "<h2>").replace("\n## ", "</h2>\n<h2>")
        html = html.replace("### ", "<h3>").replace("\n### ", "</h3>\n<h3>")
        
        # Convert bold
        html = html.replace("**", "<strong>").replace("**", "</strong>")
        
        # Convert lists
        lines = html.split("\n")
        result = []
        in_list = False
        for line in lines:
            if line.startswith("- "):
                if not in_list:
                    result.append("<ul>")
                    in_list = True
                result.append(f"<li>{line[2:]}</li>")
            else:
                if in_list:
                    result.append("</ul>")
                    in_list = False
                result.append(line)
        if in_list:
            result.append("</ul>")
        
        html = "\n".join(result)
        
        # Convert tables (basic)
        html = html.replace("|", "</td><td>")
        html = html.replace("<td>", "<table><tr><td>")
        html = html.replace("</td>", "</td></tr></table>")
        
        return html
    
    def save_markdown(self, filepath: str):
        """Save markdown report."""
        content = self.generate_markdown()
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return filepath
    
    def save_html(self, filepath: str):
        """Save HTML report."""
        content = self.generate_html()
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return filepath


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python report_generator.py <report_json_file> <output_format> [output_file]")
        print("Formats: markdown, html")
        sys.exit(1)
    
    report_file = sys.argv[1]
    format_type = sys.argv[2].lower()
    output_file = sys.argv[3] if len(sys.argv) > 3 else None
    
    with open(report_file, 'r', encoding='utf-8') as f:
        report_data = json.load(f)
    
    generator = ReportGenerator(report_data)
    
    if format_type == "markdown":
        if not output_file:
            output_file = report_file.replace(".json", ".md")
        generator.save_markdown(output_file)
        print(f"Markdown report saved to: {output_file}")
    
    elif format_type == "html":
        if not output_file:
            output_file = report_file.replace(".json", ".html")
        generator.save_html(output_file)
        print(f"HTML report saved to: {output_file}")
    
    else:
        print(f"Unknown format: {format_type}")
        sys.exit(1)
