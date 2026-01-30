#!/usr/bin/env python3
"""
Service Manager
Manages service lifecycle: check status, stop, start, restart.
"""

import os
import subprocess
import time
import signal
from typing import Dict, Optional, Tuple
from pathlib import Path
from service_config import ServiceConfig


class ServiceManager:
    """Manages service lifecycle operations."""
    
    def __init__(self, project_root: Optional[str] = None):
        """Initialize service manager."""
        self.service_config = ServiceConfig(project_root)
        self.project_root = self.service_config.project_root
    
    def get_pid_file_path(self, service_name: str) -> Optional[Path]:
        """Get the PID file path for a service."""
        # Try common PID file patterns
        patterns = [
            f"{service_name}.pid",
            f"{service_name.replace('-', '_')}.pid",
        ]
        
        for pattern in patterns:
            pid_file = self.project_root / pattern
            if pid_file.exists():
                return pid_file
        
        return None
    
    def is_service_running(self, service_name: str) -> Tuple[bool, Optional[int]]:
        """
        Check if a service is running.
        
        Returns:
            (is_running, pid) tuple
        """
        # Check PID file
        pid_file = self.get_pid_file_path(service_name)
        if pid_file:
            try:
                with open(pid_file, 'r') as f:
                    pid = int(f.read().strip())
                
                # Check if process is actually running
                try:
                    os.kill(pid, 0)  # Signal 0 doesn't kill, just checks
                    return True, pid
                except OSError:
                    # Process doesn't exist, PID file is stale
                    return False, None
            except (ValueError, FileNotFoundError):
                pass
        
        # Try to find process by service name
        try:
            result = subprocess.run(
                ["pgrep", "-f", service_name],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                pid = int(result.stdout.strip().split('\n')[0])
                return True, pid
        except Exception:
            pass
        
        return False, None
    
    def stop_service(self, service_name: str) -> bool:
        """Stop a service."""
        is_running, pid = self.is_service_running(service_name)
        
        if not is_running:
            return True  # Already stopped
        
        try:
            # Try graceful shutdown first
            os.kill(pid, signal.SIGTERM)
            
            # Wait for process to stop (max 10 seconds)
            for _ in range(10):
                time.sleep(1)
                if not self.is_service_running(service_name)[0]:
                    return True
            
            # Force kill if still running
            os.kill(pid, signal.SIGKILL)
            time.sleep(1)
            
            return not self.is_service_running(service_name)[0]
        except Exception as e:
            print(f"Warning: Failed to stop service {service_name}: {e}")
            return False
    
    def start_service(self, service_name: str) -> bool:
        """Start a service using the startup script."""
        script_path = self.service_config.get_script_path(service_name)
        
        if not script_path:
            print(f"Error: Startup script not found for {service_name}")
            return False
        
        if not script_path.exists():
            print(f"Error: Startup script does not exist: {script_path}")
            return False
        
        try:
            # Make script executable
            os.chmod(script_path, 0o755)
            
            # Run the startup script
            result = subprocess.run(
                ["bash", str(script_path)],
                cwd=str(self.project_root),
                capture_output=True,
                text=True,
                timeout=30  # Script should start quickly
            )
            
            if result.returncode == 0:
                return True
            else:
                print(f"Warning: Startup script returned non-zero: {result.stderr}")
                return False
        except subprocess.TimeoutExpired:
            print(f"Warning: Startup script timed out")
            return False
        except Exception as e:
            print(f"Error: Failed to start service {service_name}: {e}")
            return False
    
    def wait_for_service_ready(self, service_name: str, timeout: int = 60) -> bool:
        """
        Wait for service to be ready.
        
        Args:
            service_name: Service name
            timeout: Maximum wait time in seconds
        
        Returns:
            True if service is ready, False if timeout
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            is_running, _ = self.is_service_running(service_name)
            
            if is_running:
                # Additional check: try to read log file for "started" or "ready" message
                log_path = self.service_config.get_log_path(service_name)
                if log_path and os.path.exists(log_path):
                    try:
                        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
                            # Read last 20 lines
                            lines = f.readlines()[-20:]
                            content = ''.join(lines).lower()
                            
                            # Check for success indicators
                            if any(indicator in content for indicator in [
                                "started", "ready", "listening", "running",
                                "启动成功", "就绪", "监听"
                            ]):
                                return True
                    except Exception:
                        pass
                
                # If service is running, assume it's ready after a short delay
                time.sleep(2)
                return True
            
            time.sleep(1)
        
        return False
    
    def restart_service(self, service_name: str) -> bool:
        """
        Restart a service.
        
        Returns:
            True if restart successful, False otherwise
        """
        print(f"Restarting service: {service_name}")
        
        # Stop service
        if self.is_service_running(service_name)[0]:
            print(f"  Stopping {service_name}...")
            if not self.stop_service(service_name):
                print(f"  Warning: Failed to stop {service_name}")
        
        # Wait a bit
        time.sleep(2)
        
        # Start service
        print(f"  Starting {service_name}...")
        if not self.start_service(service_name):
            print(f"  Error: Failed to start {service_name}")
            return False
        
        # Wait for service to be ready
        print(f"  Waiting for {service_name} to be ready...")
        if not self.wait_for_service_ready(service_name, timeout=60):
            print(f"  Warning: {service_name} may not be ready yet")
            return False
        
        print(f"  ✅ {service_name} restarted successfully")
        return True


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python service_manager.py <action> <service_name>")
        print("Actions: status, start, stop, restart")
        sys.exit(1)
    
    action = sys.argv[1]
    service_name = sys.argv[2]
    
    manager = ServiceManager()
    
    if action == "status":
        is_running, pid = manager.is_service_running(service_name)
        print(f"Service {service_name}: {'Running' if is_running else 'Stopped'}")
        if is_running:
            print(f"  PID: {pid}")
    elif action == "start":
        if manager.start_service(service_name):
            print(f"Service {service_name} started")
        else:
            print(f"Failed to start {service_name}")
    elif action == "stop":
        if manager.stop_service(service_name):
            print(f"Service {service_name} stopped")
        else:
            print(f"Failed to stop {service_name}")
    elif action == "restart":
        if manager.restart_service(service_name):
            print(f"Service {service_name} restarted")
        else:
            print(f"Failed to restart {service_name}")
    else:
        print(f"Unknown action: {action}")
