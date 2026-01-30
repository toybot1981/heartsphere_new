#!/usr/bin/env python3
"""
Log Analyzer
Analyzes service logs to identify errors and suggest fixes.
"""

import os
import re
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from service_config import ServiceConfig


class LogAnalyzer:
    """Analyzes log files to identify service errors."""
    
    # Error patterns with their types and auto-fixability
    ERROR_PATTERNS = {
        "port_in_use": {
            "patterns": [
                r"Address already in use",
                r"Port \d+ already in use",
                r"bind.*address.*already in use",
                r"端口.*已被占用",
            ],
            "type": "port_in_use",
            "auto_fixable": True,
            "severity": "high",
        },
        "database_connection": {
            "patterns": [
                r"Connection refused",
                r"Access denied",
                r"Unknown database",
                r"无法连接到数据库",
                r"数据库连接失败",
            ],
            "type": "database_connection",
            "auto_fixable": False,  # Usually requires config changes
            "severity": "high",
        },
        "configuration_error": {
            "patterns": [
                r"Configuration error",
                r"Missing property",
                r"Invalid configuration",
                r"配置错误",
                r"缺少配置",
            ],
            "type": "configuration_error",
            "auto_fixable": False,
            "severity": "high",
        },
        "compilation_error": {
            "patterns": [
                r"Compilation failure",
                r"Cannot resolve",
                r"编译错误",
                r"无法解析",
            ],
            "type": "compilation_error",
            "auto_fixable": False,  # Code-level issues
            "severity": "high",
        },
        "service_crash": {
            "patterns": [
                r"Process.*exited",
                r"Service.*stopped",
                r"进程.*退出",
                r"服务.*停止",
            ],
            "type": "service_crash",
            "auto_fixable": True,  # Can restart
            "severity": "critical",
        },
        "timeout": {
            "patterns": [
                r"Timeout",
                r"Request timeout",
                r"超时",
            ],
            "type": "timeout",
            "auto_fixable": False,
            "severity": "medium",
        },
    }
    
    def __init__(self, project_root: Optional[str] = None):
        """Initialize log analyzer."""
        self.service_config = ServiceConfig(project_root)
    
    def analyze_log(self, service_name: str, lines: int = 100) -> Dict:
        """
        Analyze log file for a service.
        
        Args:
            service_name: Service name (e.g., "main-backend")
            lines: Number of recent lines to analyze (default: 100)
        
        Returns:
            Dictionary with analysis results
        """
        log_path = self.service_config.get_log_path(service_name)
        
        if not log_path:
            return {
                "service": service_name,
                "log_path": None,
                "errors": [],
                "summary": "Log file not found",
            }
        
        if not os.path.exists(log_path):
            return {
                "service": service_name,
                "log_path": log_path,
                "errors": [],
                "summary": "Log file does not exist",
            }
        
        try:
            # Read last N lines
            with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
                all_lines = f.readlines()
                recent_lines = all_lines[-lines:] if len(all_lines) > lines else all_lines
                log_content = ''.join(recent_lines)
        except Exception as e:
            return {
                "service": service_name,
                "log_path": log_path,
                "errors": [],
                "summary": f"Failed to read log file: {e}",
            }
        
        # Analyze for errors
        errors = []
        for error_type, error_info in self.ERROR_PATTERNS.items():
            for pattern in error_info["patterns"]:
                matches = re.finditer(pattern, log_content, re.IGNORECASE)
                for match in matches:
                    # Find the line containing this error
                    line_num = log_content[:match.start()].count('\n') + 1
                    line_content = recent_lines[line_num - 1].strip() if line_num <= len(recent_lines) else ""
                    
                    errors.append({
                        "type": error_info["type"],
                        "pattern": pattern,
                        "message": match.group(0),
                        "line": line_num,
                        "line_content": line_content,
                        "auto_fixable": error_info["auto_fixable"],
                        "severity": error_info["severity"],
                    })
        
        # Deduplicate errors (same type and similar message)
        unique_errors = []
        seen = set()
        for error in errors:
            key = (error["type"], error["message"][:50])  # First 50 chars of message
            if key not in seen:
                seen.add(key)
                unique_errors.append(error)
        
        # Sort by severity
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        unique_errors.sort(key=lambda x: severity_order.get(x["severity"], 99))
        
        return {
            "service": service_name,
            "log_path": log_path,
            "errors": unique_errors,
            "summary": f"Found {len(unique_errors)} error(s)" if unique_errors else "No errors found",
            "needs_restart": any(e["auto_fixable"] and e["type"] in ["port_in_use", "service_crash"] for e in unique_errors),
        }
    
    def analyze_service_logs(self, service_names: List[str], lines: int = 100) -> Dict[str, Dict]:
        """Analyze logs for multiple services."""
        results = {}
        for service_name in service_names:
            results[service_name] = self.analyze_log(service_name, lines)
        return results
    
    def get_fixable_errors(self, analysis_result: Dict) -> List[Dict]:
        """Get list of errors that can be auto-fixed."""
        return [e for e in analysis_result.get("errors", []) if e.get("auto_fixable", False)]


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python log_analyzer.py <service_name> [lines]")
        sys.exit(1)
    
    service_name = sys.argv[1]
    lines = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    
    analyzer = LogAnalyzer()
    result = analyzer.analyze_log(service_name, lines)
    
    print(f"\nLog Analysis for {service_name}")
    print(f"Log Path: {result['log_path']}")
    print(f"Summary: {result['summary']}")
    
    if result['errors']:
        print(f"\nFound {len(result['errors'])} error(s):")
        for error in result['errors']:
            print(f"  - [{error['severity'].upper()}] {error['type']}: {error['message']}")
            print(f"    Auto-fixable: {error['auto_fixable']}")
            if error.get('line_content'):
                print(f"    Line {error['line']}: {error['line_content'][:80]}")
    else:
        print("\nNo errors found in log file.")
