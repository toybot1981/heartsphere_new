#!/usr/bin/env python3
"""Generate Markdown or HTML report from API test results JSON."""

import json
import sys
from pathlib import Path


def load_results(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def to_markdown(data: dict) -> str:
    lines = [
        "# API Test Report",
        "",
        f"- Plan: {data.get('plan_file', '')}",
        f"- Base URL: {data.get('base_url', '')}",
        f"- Started: {data.get('started_at', '')}",
        f"- Completed: {data.get('completed_at', '')}",
        "",
        "## Summary",
        "",
        f"- Total: {data.get('summary', {}).get('total', 0)}",
        f"- Passed: {data.get('summary', {}).get('passed', 0)}",
        f"- Failed: {data.get('summary', {}).get('failed', 0)}",
        f"- Skipped: {data.get('summary', {}).get('skipped', 0)}",
        "",
        "## Cases",
        "",
    ]
    for c in data.get("cases", []):
        status = c.get("status", "unknown")
        lines.append(f"- **{c.get('name', c.get('case_id', ''))}** ({c.get('case_id', '')}): {status}")
    return "\n".join(lines)


def to_html(data: dict) -> str:
    import html
    md = to_markdown(data)
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>API Test Report</title></head><body><pre>{html.escape(md)}</pre></body></html>"""


def main():
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("results_file", help="results.json")
    p.add_argument("format", choices=["markdown", "html"], help="Output format")
    p.add_argument("output_file", help="Output path")
    args = p.parse_args()
    data = load_results(args.results_file)
    if args.format == "markdown":
        out = to_markdown(data)
    else:
        out = to_html(data)
    Path(args.output_file).write_text(out, encoding="utf-8")
    print(f"Wrote {args.output_file}")


if __name__ == "__main__":
    main()
