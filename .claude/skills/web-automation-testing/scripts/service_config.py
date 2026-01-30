#!/usr/bin/env python3
"""
Service Configuration
Manages service-to-script and service-to-log-path mappings.
"""

import re
import os
from typing import Dict, Optional
from pathlib import Path


class ServiceConfig:
    """Manages service configuration including script paths and log paths."""
    
    def __init__(self, project_root: Optional[str] = None):
        """
        Initialize service configuration.
        
        Args:
            project_root: Project root directory. If None, will try to detect.
        """
        if project_root:
            self.project_root = Path(project_root)
        else:
            # Try to detect project root (directory containing scripts/start/)
            # From scripts/ go up: web-automation-testing, skills, .claude, then project root
            current = Path(__file__).resolve().parent.parent.parent.parent
            while current != current.parent:
                if (current / "scripts" / "start").exists():
                    self.project_root = current
                    break
                current = current.parent
            else:
                # Fallback to current working directory
                self.project_root = Path.cwd()
        
        self.scripts_dir = self.project_root / "scripts" / "start"
        self._log_path_cache: Dict[str, str] = {}
        
        # Default service mappings (will be enhanced by parsing scripts)
        self.service_configs = {
            "main-backend": {
                "script": "start-main-backend.sh",
                "log_path": None,  # Will be parsed from script
            },
            "main-frontend": {
                "script": "start-main-frontend.sh",
                "log_path": None,
            },
            "admin-backend": {
                "script": "start-admin-backend.sh",
                "log_path": None,
            },
            "admin-frontend": {
                "script": "start-admin-frontend.sh",
                "log_path": None,
            },
            "edu-backend": {
                "script": "start-edu-backend.sh",
                "log_path": None,
            },
            "edu-frontend": {
                "script": "start-edu-frontend.sh",
                "log_path": None,
            },
            "company-backend": {
                "script": "start-company-backend.sh",
                "log_path": None,
            },
            "company-frontend": {
                "script": "start-company-frontend.sh",
                "log_path": None,
            },
            "mentis-backend": {
                "script": "start-mentis-backend.sh",
                "log_path": None,
            },
            "mentis-frontend": {
                "script": "start-mentis-frontend.sh",
                "log_path": None,
            },
        }
    
    def get_script_path(self, service_name: str) -> Optional[Path]:
        """Get the full path to the startup script for a service."""
        if service_name not in self.service_configs:
            return None
        
        script_name = self.service_configs[service_name]["script"]
        script_path = self.scripts_dir / script_name
        
        if script_path.exists():
            return script_path
        return None
    
    def parse_log_path_from_script(self, service_name: str) -> Optional[str]:
        """Parse log path from the startup script."""
        if service_name in self._log_path_cache:
            return self._log_path_cache[service_name]
        
        script_path = self.get_script_path(service_name)
        if not script_path:
            return None
        
        try:
            with open(script_path, 'r', encoding='utf-8') as f:
                script_content = f.read()
            
            # Extract PROJECT_DIR from script (e.g. PROJECT_DIR="main/backend")
            project_dir = None
            project_dir_match = re.search(r'PROJECT_DIR=["\']([^"\']+)["\']', script_content)
            if project_dir_match:
                project_dir = project_dir_match.group(1)
            
            def expand_log_path(log_path: str) -> str:
                """Expand $PROJECT_DIR in path if present."""
                if project_dir and "$PROJECT_DIR" in log_path:
                    return log_path.replace("$PROJECT_DIR", project_dir)
                return log_path
            
            # Pattern 1: > "$PROJECT_ROOT/path/to/log.log" or "$PROJECT_ROOT/$PROJECT_DIR-backend.log"
            pattern1 = r'>\s*"\$PROJECT_ROOT/([^"]+\.log)"'
            match1 = re.search(pattern1, script_content)
            if match1:
                log_path = expand_log_path(match1.group(1))
                full_path = str(self.project_root / log_path)
                self._log_path_cache[service_name] = full_path
                return full_path
            
            # Pattern 2: > '$PROJECT_ROOT/path/to/log.log'
            pattern2 = r">\s*'\$PROJECT_ROOT/([^']+\.log)'"
            match2 = re.search(pattern2, script_content)
            if match2:
                log_path = expand_log_path(match2.group(1))
                full_path = str(self.project_root / log_path)
                self._log_path_cache[service_name] = full_path
                return full_path
            
            # Pattern 3: > "path/to/log.log" (relative to project root, no $PROJECT_ROOT)
            pattern3 = r'>\s*"\$?PROJECT_ROOT/?([^"]+\.log)"'
            match3 = re.search(pattern3, script_content)
            if not match3:
                pattern3 = r'>\s*"([^"$]+\.log)"'
                match3 = re.search(pattern3, script_content)
            if match3:
                log_path = expand_log_path(match3.group(1))
                if os.path.isabs(log_path):
                    self._log_path_cache[service_name] = log_path
                    return log_path
                full_path = str(self.project_root / log_path)
                self._log_path_cache[service_name] = full_path
                return full_path
            
            # Pattern 4: > 'path/to/log.log'
            pattern4 = r">\s*'([^']+\.log)'"
            match4 = re.search(pattern4, script_content)
            if match4:
                log_path = expand_log_path(match4.group(1))
                if os.path.isabs(log_path):
                    self._log_path_cache[service_name] = log_path
                    return log_path
                full_path = str(self.project_root / log_path)
                self._log_path_cache[service_name] = full_path
                return full_path
        
        except Exception as e:
            print(f"Warning: Failed to parse log path from {script_path}: {e}")
            return None
        
        return None
    
    def get_log_path(self, service_name: str) -> Optional[str]:
        """
        Get the log file path for a service.
        
        Priority:
        1. Cached parsed path
        2. Parse from script
        3. Try default patterns
        """
        # Check cache first
        if service_name in self._log_path_cache:
            cached_path = self._log_path_cache[service_name]
            if os.path.exists(cached_path):
                return cached_path
        
        # Try parsing from script
        parsed_path = self.parse_log_path_from_script(service_name)
        if parsed_path and os.path.exists(parsed_path):
            return parsed_path
        
        # Try default patterns
        default_patterns = [
            f"{service_name}.log",
            f"{service_name.replace('-', '_')}.log",
        ]
        
        for pattern in default_patterns:
            # Try project root
            log_path = self.project_root / pattern
            if log_path.exists():
                self._log_path_cache[service_name] = str(log_path)
                return str(log_path)
            
            # Try logs directory
            log_path = self.project_root / "logs" / pattern
            if log_path.exists():
                self._log_path_cache[service_name] = str(log_path)
                return str(log_path)
        
        return None
    
    def get_service_info(self, service_name: str) -> Optional[Dict]:
        """Get complete service information."""
        if service_name not in self.service_configs:
            return None
        
        script_path = self.get_script_path(service_name)
        log_path = self.get_log_path(service_name)
        
        return {
            "name": service_name,
            "script_path": str(script_path) if script_path else None,
            "log_path": log_path,
        }
