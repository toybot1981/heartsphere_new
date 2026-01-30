#!/usr/bin/env python3
"""
Optional helper: run scripts/start/start-<backend>.sh and wait until service is ready (port).
Usage: python restart_backend.py <service_name> [port]
If port omitted, use default: admin-backend 8085, main-backend 8081, etc.
"""

import subprocess
import sys
import time
from pathlib import Path

# Default ports for backend services
DEFAULT_PORTS = {
    "admin-backend": 8085,
    "main-backend": 8081,
    "edu-backend": 8084,
    "company-backend": 8083,
    "mentis-backend": 8082,
    "psychology-mentor-backend": 8083,
}

SCRIPT_NAMES = {
    "admin-backend": "start-admin-backend.sh",
    "main-backend": "start-main-backend.sh",
    "edu-backend": "start-edu-backend.sh",
    "company-backend": "start-company-backend.sh",
    "mentis-backend": "start-mentis-backend.sh",
    "psychology-mentor-backend": "start-psychology-mentor-backend.sh",
}


def detect_project_root() -> Path:
    current = Path(__file__).resolve().parent
    for _ in range(6):
        current = current.parent
        if (current / "scripts" / "start").exists():
            return current
    return Path.cwd()


def is_port_listening(port: int) -> bool:
    try:
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            return s.connect_ex(("127.0.0.1", port)) == 0
    except Exception:
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: restart_backend.py <service_name> [port]", file=sys.stderr)
        print("  service_name: admin-backend, main-backend, edu-backend, company-backend, mentis-backend, psychology-mentor-backend", file=sys.stderr)
        sys.exit(2)
    service = sys.argv[1]
    port = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_PORTS.get(service)
    if not port:
        print(f"Unknown service {service}, specify port as second argument", file=sys.stderr)
        sys.exit(2)
    script_name = SCRIPT_NAMES.get(service)
    if not script_name:
        print(f"Unknown service {service}", file=sys.stderr)
        sys.exit(2)
    root = detect_project_root()
    script_path = root / "scripts" / "start" / script_name
    if not script_path.exists():
        print(f"Script not found: {script_path}", file=sys.stderr)
        sys.exit(1)
    print(f"Running {script_path} ...")
    subprocess.run([str(script_path)], cwd=str(root), check=False)
    print(f"Waiting for port {port} (up to 60s)...")
    for _ in range(60):
        if is_port_listening(port):
            print(f"Port {port} is ready.")
            sys.exit(0)
        time.sleep(1)
    print(f"Timeout: port {port} not ready.", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
