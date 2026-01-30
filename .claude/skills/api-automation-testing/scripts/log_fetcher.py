#!/usr/bin/env python3
"""
Fetch backend log tail for agent_failure_summary. Uses service_config for log path.
"""

from pathlib import Path
from typing import Optional

from service_config import ServiceConfig, detect_project_root

DEFAULT_TAIL_LINES = 200


def get_backend_log_tail(
    backend_service: str,
    project_root: Optional[str] = None,
    tail_lines: int = DEFAULT_TAIL_LINES,
    log_path_override: Optional[str] = None,
) -> str:
    """
    Read last N lines of backend log. Return empty string if log unavailable.
    If log_path_override is set (absolute or relative to project root), use it instead of parsing from script.
    """
    root = Path(project_root) if project_root else detect_project_root()
    if log_path_override:
        p = Path(log_path_override)
        if not p.is_absolute():
            p = root / p
    else:
        cfg = ServiceConfig(str(root))
        path = cfg.get_log_path(backend_service)
        if not path:
            return ""
        p = Path(path)
    if not p.exists():
        return ""
    try:
        with open(p, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
    except Exception:
        return ""
    tail = lines[-tail_lines:] if len(lines) > tail_lines else lines
    return "".join(tail)


if __name__ == "__main__":
    import sys
    backend = sys.argv[1] if len(sys.argv) > 1 else "admin-backend"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    out = get_backend_log_tail(backend, tail_lines=n)
    print("--- Backend log tail ---")
    print(out or "(no log or empty)")
