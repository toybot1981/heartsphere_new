#!/usr/bin/env python3
"""
Example: Creating a test plan programmatically
This script demonstrates how to create a test plan using the test_planner module.
"""

import sys
import os
from pathlib import Path

# Add scripts directory to path
script_dir = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(script_dir))

from test_planner import (
    create_test_plan,
    add_test_suite,
    add_test_case,
    save_plan
)


def main():
    """Create an example test plan for a web application."""
    
    # Create base test plan
    print("Creating test plan...")
    plan = create_test_plan(
        app_url="http://localhost:3000",
        test_scope="User authentication and basic navigation",
        requirements=[
            "Users can log in with valid credentials",
            "Users cannot log in with invalid credentials",
            "Users can navigate to different pages",
            "Users can log out successfully"
        ],
        priority="high"
    )
    
    # Add test suites
    print("Adding test suites...")
    auth_suite_id = add_test_suite(
        plan,
        "Authentication Suite",
        "Tests for login, logout, and authentication"
    )
    
    nav_suite_id = add_test_suite(
        plan,
        "Navigation Suite",
        "Tests for page navigation"
    )
    
    # Add test cases to Authentication Suite
    print("Adding authentication test cases...")
    
    add_test_case(
        plan, auth_suite_id,
        "Valid Login Test",
        "Test that users can log in with valid credentials",
        [
            "navigate to http://localhost:3000/login",
            "wait for #username-input",
            "type \"testuser\" in #username-input",
            "type \"password123\" in #password-input",
            "click #login-button",
            "wait for navigation",
            "verify text=Dashboard"
        ],
        "User should be logged in and redirected to dashboard",
        priority="high"
    )
    
    add_test_case(
        plan, auth_suite_id,
        "Invalid Login Test",
        "Test that users cannot log in with invalid credentials",
        [
            "navigate to http://localhost:3000/login",
            "wait for #username-input",
            "type \"invalid\" in #username-input",
            "type \"wrongpass\" in #password-input",
            "click #login-button",
            "wait for 2 seconds",
            "verify text=Invalid credentials"
        ],
        "Error message should be displayed",
        priority="high"
    )
    
    add_test_case(
        plan, auth_suite_id,
        "Logout Test",
        "Test that users can log out",
        [
            "navigate to http://localhost:3000/login",
            "wait for #username-input",
            "type \"testuser\" in #username-input",
            "type \"password123\" in #password-input",
            "click #login-button",
            "wait for navigation",
            "click text=Logout",
            "wait for navigation",
            "verify text=Login"
        ],
        "User should be logged out and redirected to login page",
        priority="medium"
    )
    
    # Add test case to Navigation Suite
    print("Adding navigation test case...")
    
    add_test_case(
        plan, nav_suite_id,
        "Navigation Test",
        "Test navigation between pages",
        [
            "navigate to http://localhost:3000",
            "wait for networkidle",
            "click text=About",
            "wait for navigation",
            "verify text=About Us",
            "click text=Home",
            "wait for navigation",
            "verify text=Welcome"
        ],
        "User should be able to navigate between pages",
        priority="medium"
    )
    
    # Save the plan
    output_file = Path(__file__).parent / "example_test_plan.json"
    save_plan(plan, str(output_file))
    
    print(f"\n✅ Test plan created successfully!")
    print(f"   File: {output_file}")
    print(f"   Test suites: {len(plan['test_suites'])}")
    print(f"   Test cases: {len(plan['test_cases'])}")
    
    return str(output_file)


if __name__ == "__main__":
    main()
