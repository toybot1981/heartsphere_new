#!/usr/bin/env python3
"""
Service configuration for API testing: backend script and log path mapping.
Resolves project root from directory containing scripts/start/; parses log path from scripts.
"""

import re
import os
from typing import Dict, Optional
from pathlib import Path


# Only backend services are needed for API testing
BACKEND_SERVICES = {
    "admin-backend": {"script": "start-admin-backend.sh"},
    "main-backend": {"script": "start-main-backend.sh"},
    "edu-backend": {"script": "start-edu-backend.sh"},
    "company-backend": {"script": "start-company-backend.sh"},
    "mentis-backend": {"script": "start-mentis-backend.sh"},
    "psychology-mentor-backend": {"script": "start-psychology-mentor-backend.sh"},
}

# Default ports for inferring backend from base_url
BASE_URL_TO_BACKEND = {
    "8085": "admin-backend",
    "8081": "main-backend",
    "8084": "edu-backend",
    "8083": "company-backend",
    "8082": "mentis-backend",
}


def detect_project_root() -> Path:
    """Detect project root (directory containing scripts/start/)."""
    current = Path(__file__).resolve().parent
    for _ in range(6):
        current = current.parent
        if (current / "scripts" / "start").exists():
            return current
    return Path.cwd()


class ServiceConfig:
    """Backend service config: script path and log path (parsed from script)."""

    def __init__(self, project_root: Optional[str] = None):
        self.project_root = Path(project_root) if project_root else detect_project_root()
        self.scripts_dir = self.project_root / "scripts" / "start"
        self._log_path_cache: Dict[str, str] = {}
        self.service_configs = {
            name: {"script": info["script"], "log_path": None}
            for name, info in BACKEND_SERVICES.items()
        }

    def get_script_path(self, service_name: str) -> Optional[Path]:
        if service_name not in self.service_configs:
            return None
        script_name = self.service_configs[service_name]["script"]
        path = self.scripts_dir / script_name
        return path if path.exists() else None

    def parse_log_path_from_script(self, service_name: str) -> Optional[str]:
        if service_name in self._log_path_cache:
            return self._log_path_cache[service_name]
        script_path = self.get_script_path(service_name)
        if not script_path:
            return None
        try:
            content = script_path.read_text(encoding="utf-8")
        except Exception:
            return None
        project_dir = None
        m = re.search(r'PROJECT_DIR=["\']([^"\']+)["\']', content)
        if m:
            project_dir = m.group(1)

        def expand(p: str) -> str:
            if project_dir and "$PROJECT_DIR" in p:
                return p.replace("$PROJECT_DIR", project_dir)
            return p

        for pattern in [
            r'>\s*"\$PROJECT_ROOT/([^"]+\.log)"',
            r">\s*'\$PROJECT_ROOT/([^']+\.log)'",
            r'>\s*"([^"$]+\.log)"',
            r">\s*'([^']+\.log)'",
        ]:
            match = re.search(pattern, content)
            if match:
                log_path = expand(match.group(1))
                if not os.path.isabs(log_path):
                    log_path = str(self.project_root / log_path)
                else:
                    log_path = log_path
                self._log_path_cache[service_name] = log_path
                return log_path
        return None

    def get_log_path(self, service_name: str) -> Optional[str]:
        if service_name in self._log_path_cache:
            return self._log_path_cache[service_name]
        path = self.parse_log_path_from_script(service_name)
        if path:
            return path
        for suffix in (f"{service_name}.log", f"{service_name.replace('-', '_')}.log"):
            for base in (self.project_root, self.project_root / "logs"):
                p = base / suffix
                if p.exists():
                    self._log_path_cache[service_name] = str(p)
                    return str(p)
        return None

    def backend_from_base_url(self, base_url: str) -> Optional[str]:
        """Infer backend service name from base_url (e.g. http://localhost:8085 -> admin-backend)."""
        for port, name in BASE_URL_TO_BACKEND.items():
            if port in base_url:
                return name
        return None


if __name__ == "__main__":
    import sys
    root = detect_project_root()
    print("Project root:", root)
    cfg = ServiceConfig(str(root))
    for svc in BACKEND_SERVICES:
        script = cfg.get_script_path(svc)
        log_path = cfg.get_log_path(svc)
        print(svc, "script:", script, "log:", log_path)
