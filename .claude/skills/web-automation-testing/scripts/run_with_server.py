#!/usr/bin/env python3
"""
Run automated tests with server management.
Combines server lifecycle management with test execution.
"""

import subprocess
import sys
import socket
import time
from pathlib import Path


def is_server_ready(port, timeout=30):
    """Wait for server to be ready by polling the port."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(('localhost', port), timeout=1):
                return True
        except (socket.error, ConnectionRefusedError):
            time.sleep(0.5)
    return False


def main():
    if len(sys.argv) < 4:
        print("Usage: python run_with_server.py <plan_file> --server <command> --port <port> [--max-iterations <n>]")
        print("Example: python run_with_server.py plan.json --server 'npm run dev' --port 5173")
        sys.exit(1)
    
    plan_file = sys.argv[1]
    server_command = None
    server_port = None
    max_iterations = 5
    
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--server" and i + 1 < len(sys.argv):
            server_command = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--port" and i + 1 < len(sys.argv):
            server_port = int(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == "--max-iterations" and i + 1 < len(sys.argv):
            max_iterations = int(sys.argv[i + 1])
            i += 2
        else:
            i += 1
    
    if not server_command or not server_port:
        print("Error: --server and --port are required")
        sys.exit(1)
    
    # Start server
    print(f"Starting server: {server_command}")
    server_process = subprocess.Popen(
        server_command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    try:
        # Wait for server to be ready
        print(f"Waiting for server on port {server_port}...")
        if not is_server_ready(server_port, timeout=60):
            print(f"Error: Server did not become ready on port {server_port}")
            server_process.terminate()
            sys.exit(1)
        
        print("Server is ready. Starting tests...")
        
        # Run test runner
        script_dir = Path(__file__).parent
        runner_script = script_dir / "test_runner.py"
        
        cmd = [
            sys.executable,
            str(runner_script),
            plan_file,
            "--max-iterations", str(max_iterations),
            "--headless"
        ]
        
        result = subprocess.run(cmd)
        exit_code = result.returncode
        
    finally:
        # Clean up server
        print("\nStopping server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server_process.kill()
    
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
