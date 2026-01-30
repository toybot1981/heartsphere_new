#!/usr/bin/env python3
"""
DevOps 工作台 API 全面测试脚本 (Python版本)
测试所有 DevOps 工作台相关的 API 端点

使用方法:
    python3 scripts/test-devops-api/test_devops_api.py [base_url] [username] [password]
"""

import sys
import json
import time
import requests
from typing import Optional, Dict, Any
from datetime import datetime

# 颜色定义
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

# 配置
BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8085"
ADMIN_USERNAME = sys.argv[2] if len(sys.argv) > 2 else "admin"
ADMIN_PASSWORD = sys.argv[3] if len(sys.argv) > 3 else "admin123"

API_BASE = f"{BASE_URL}/api/admin"
AUTH_TOKEN = ""

# 统计
total_tests = 0
passed_tests = 0
failed_tests = 0

# 测试数据
script_id = ""
execution_id = ""
pipeline_id = ""
task_id = ""

def print_test(name: str):
    """打印测试标题"""
    print(f"\n{Colors.CYAN}{'='*50}{Colors.NC}")
    print(f"{Colors.BLUE}📋 测试: {name}{Colors.NC}")
    print(f"{Colors.CYAN}{'='*50}{Colors.NC}")

def print_success(message: str):
    """打印成功"""
    global passed_tests
    print(f"{Colors.GREEN}✅ {message}{Colors.NC}")
    passed_tests += 1

def print_failure(message: str):
    """打印失败"""
    global failed_tests
    print(f"{Colors.RED}❌ {message}{Colors.NC}")
    failed_tests += 1

def print_info(message: str):
    """打印信息"""
    print(f"{Colors.YELLOW}ℹ️  {message}{Colors.NC}")

def http_request(method: str, url: str, data: Optional[Dict] = None, expected_status: int = 200) -> Optional[Dict]:
    """执行 HTTP 请求"""
    global total_tests
    total_tests += 1
    
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}"
    }
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            headers["Content-Type"] = "application/json"
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == "PUT":
            headers["Content-Type"] = "application/json"
            response = requests.put(url, headers=headers, json=data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            print_failure(f"不支持的 HTTP 方法: {method}")
            return None
        
        if response.status_code == expected_status:
            try:
                return response.json()
            except:
                return {"raw": response.text}
        else:
            print_failure(f"期望状态码: {expected_status}, 实际: {response.status_code}")
            print(f"响应: {response.text[:500]}")
            return None
    except requests.exceptions.RequestException as e:
        print_failure(f"请求失败: {str(e)}")
        return None

# ==================== 认证测试 ====================

def test_admin_login():
    """测试管理员登录"""
    print_test("管理员登录")
    global AUTH_TOKEN
    
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            AUTH_TOKEN = data.get("token", "")
            if AUTH_TOKEN:
                print_success("登录成功")
                print_info(f"Token: {AUTH_TOKEN[:30]}...")
                return True
            else:
                print_failure("登录成功但未返回 token")
                return False
        else:
            print_failure(f"登录失败: {response.status_code}")
            print(f"响应: {response.text}")
            return False
    except Exception as e:
        print_failure(f"登录异常: {str(e)}")
        return False

# ==================== 脚本管理 API 测试 ====================

def test_get_all_scripts():
    """测试获取所有脚本"""
    print_test("获取所有脚本列表")
    global script_id
    
    response = http_request("GET", f"{API_BASE}/devops/scripts")
    if response:
        scripts = response if isinstance(response, list) else response.get("content", [])
        count = len(scripts) if isinstance(scripts, list) else 0
        print_success(f"获取脚本列表成功，共 {count} 个脚本")
        
        if count > 0 and isinstance(scripts, list):
            script_id = scripts[0].get("id", "")
            if script_id:
                print_info(f"使用脚本 ID: {script_id} 进行后续测试")
        return True
    return False

def test_get_scripts_by_category():
    """测试按分类获取脚本"""
    print_test("根据分类获取脚本 (scan)")
    
    response = http_request("GET", f"{API_BASE}/devops/scripts?category=scan")
    if response:
        print_success("获取扫描类脚本成功")
        return True
    return False

def test_get_script_detail():
    """测试获取脚本详情"""
    print_test("获取脚本详情")
    
    if not script_id:
        print_info("跳过：没有可用的脚本 ID")
        return True
    
    response = http_request("GET", f"{API_BASE}/devops/scripts/{script_id}")
    if response:
        name = response.get("name", "未知")
        print_success(f"获取脚本详情成功: {name}")
        return True
    return False

def test_execute_script():
    """测试执行脚本"""
    print_test("执行脚本")
    global execution_id
    
    if not script_id:
        print_info("跳过：没有可用的脚本 ID")
        return True
    
    response = http_request("POST", f"{API_BASE}/devops/scripts/{script_id}/execute", {"parameters": {}})
    if response:
        execution_id = response.get("id", "")
        if execution_id:
            print_success(f"脚本执行已启动 (执行ID: {execution_id})")
            print_info("等待 2 秒后查询执行状态...")
            time.sleep(2)
            return True
        else:
            print_failure("执行成功但未返回执行 ID")
            return False
    return False

def test_get_script_execution_status():
    """测试获取脚本执行状态"""
    print_test("获取脚本执行状态")
    
    if not execution_id:
        print_info("跳过：没有执行 ID")
        return True
    
    response = http_request("GET", f"{API_BASE}/devops/executions/{execution_id}")
    if response:
        status = response.get("status", "未知")
        print_success(f"获取执行状态成功 (状态: {status})")
        return True
    return False

def test_get_statistics():
    """测试获取统计信息"""
    print_test("获取 DevOps 统计信息")
    
    response = http_request("GET", f"{API_BASE}/devops/statistics")
    if response:
        print_success("获取统计信息成功")
        return True
    return False

# ==================== 定时任务 API 测试 ====================

def test_get_scheduled_tasks():
    """测试获取定时任务列表"""
    print_test("获取定时任务列表")
    
    response = http_request("GET", f"{API_BASE}/devops/scheduled-tasks")
    if response:
        print_success("获取定时任务列表成功")
        return True
    return False

def test_create_scheduled_task():
    """测试创建定时任务"""
    print_test("创建定时任务")
    global task_id
    
    if not script_id:
        print_info("跳过：没有可用的脚本 ID")
        return True
    
    task_data = {
        "name": "测试定时任务",
        "scriptId": script_id,
        "cronExpression": "0 0 2 * * ?",
        "enabled": False,
        "parameters": {}
    }
    
    response = http_request("POST", f"{API_BASE}/devops/scheduled-tasks", task_data)
    if response:
        task_id = response.get("id", "")
        if task_id:
            print_success(f"创建定时任务成功 (ID: {task_id})")
            return True
        else:
            print_failure("创建成功但未返回 ID")
            return False
    return False

def test_enable_disable_task():
    """测试启用/禁用定时任务"""
    if not task_id:
        print_info("跳过：没有可用的任务 ID")
        return True
    
    print_test("启用定时任务")
    response = http_request("POST", f"{API_BASE}/devops/scheduled-tasks/{task_id}/enable", None)
    if response:
        print_success("启用定时任务成功")
    
    print_test("禁用定时任务")
    response = http_request("POST", f"{API_BASE}/devops/scheduled-tasks/{task_id}/disable", None)
    if response:
        print_success("禁用定时任务成功")
        return True
    return False

def test_delete_scheduled_task():
    """测试删除定时任务"""
    print_test("删除定时任务")
    global task_id
    
    if not task_id:
        print_info("跳过：没有可用的任务 ID")
        return True
    
    response = http_request("DELETE", f"{API_BASE}/devops/scheduled-tasks/{task_id}")
    if response:
        print_success("删除定时任务成功")
        task_id = ""
        return True
    return False

# ==================== 部署流程 API 测试 ====================

def test_get_all_pipelines():
    """测试获取所有流程模板"""
    print_test("获取所有流程模板")
    global pipeline_id
    
    response = http_request("GET", f"{API_BASE}/devops/pipelines")
    if response:
        pipelines = response if isinstance(response, list) else []
        count = len(pipelines) if isinstance(pipelines, list) else 0
        print_success(f"获取流程模板成功，共 {count} 个模板")
        
        if count > 0 and isinstance(pipelines, list):
            pipeline_id = pipelines[0].get("id", "")
            if pipeline_id:
                print_info(f"使用流程模板 ID: {pipeline_id} 进行后续测试")
        return True
    return False

def test_get_pipeline_detail():
    """测试获取流程模板详情"""
    print_test("获取流程模板详情")
    
    if not pipeline_id:
        print_info("跳过：没有可用的流程模板 ID")
        return True
    
    response = http_request("GET", f"{API_BASE}/devops/pipelines/{pipeline_id}")
    if response:
        name = response.get("name", "未知")
        print_success(f"获取流程模板详情成功: {name}")
        return True
    return False

def test_execute_pipeline():
    """测试执行流程"""
    print_test("执行流程")
    
    if not pipeline_id:
        print_info("跳过：没有可用的流程模板 ID")
        return True
    
    execute_data = {
        "parameters": {},
        "skipSteps": []
    }
    
    response = http_request("POST", f"{API_BASE}/devops/pipelines/{pipeline_id}/execute", execute_data)
    if response:
        execution_id = response.get("executionId", "")
        if execution_id:
            print_success(f"流程执行已启动 (执行ID: {execution_id})")
            print_info("等待 3 秒后查询执行状态...")
            time.sleep(3)
            return True
        else:
            print_failure("执行成功但未返回执行 ID")
            return False
    return False

def test_get_pipeline_execution_history():
    """测试获取流程执行历史"""
    print_test("获取流程执行历史")
    
    response = http_request("GET", f"{API_BASE}/devops/pipelines/executions?page=0&size=10")
    if response:
        print_success("获取流程执行历史成功")
        return True
    return False

# ==================== 主函数 ====================

def main():
    """主函数"""
    print(f"{Colors.BLUE}")
    print("╔════════════════════════════════════════════════╗")
    print("║   DevOps 工作台 API 全面测试 (Python)         ║")
    print("╚════════════════════════════════════════════════╝")
    print(f"{Colors.NC}")
    print(f"Base URL: {BASE_URL}")
    print(f"Username: {ADMIN_USERNAME}")
    print("")
    
    # 认证
    if not test_admin_login():
        print_failure("登录失败，无法继续测试")
        sys.exit(1)
    
    # 脚本管理 API
    print(f"\n{Colors.YELLOW}{'='*50}{Colors.NC}")
    print(f"{Colors.YELLOW}脚本管理 API 测试{Colors.NC}")
    print(f"{Colors.YELLOW}{'='*50}{Colors.NC}")
    test_get_all_scripts()
    test_get_scripts_by_category()
    test_get_script_detail()
    test_execute_script()
    test_get_script_execution_status()
    test_get_statistics()
    
    # 定时任务 API
    print(f"\n{Colors.YELLOW}{'='*50}{Colors.NC}")
    print(f"{Colors.YELLOW}定时任务 API 测试{Colors.NC}")
    print(f"{Colors.YELLOW}{'='*50}{Colors.NC}")
    test_get_scheduled_tasks()
    test_create_scheduled_task()
    test_enable_disable_task()
    test_delete_scheduled_task()
    
    # 部署流程 API
    print(f"\n{Colors.YELLOW}{'='*50}{Colors.NC}")
    print(f"{Colors.YELLOW}部署流程 API 测试{Colors.NC}")
    print(f"{Colors.YELLOW}{'='*50}{Colors.NC}")
    test_get_all_pipelines()
    test_get_pipeline_detail()
    test_execute_pipeline()
    test_get_pipeline_execution_history()
    
    # 打印总结
    print(f"\n{Colors.CYAN}{'='*50}{Colors.NC}")
    print(f"{Colors.BLUE}📊 测试总结{Colors.NC}")
    print(f"{Colors.CYAN}{'='*50}{Colors.NC}")
    print(f"总测试数: {Colors.BLUE}{total_tests}{Colors.NC}")
    print(f"{Colors.GREEN}✅ 通过: {passed_tests}{Colors.NC}")
    print(f"{Colors.RED}❌ 失败: {failed_tests}{Colors.NC}")
    
    if total_tests > 0:
        success_rate = (passed_tests / total_tests) * 100
        print(f"成功率: {Colors.BLUE}{success_rate:.1f}%{Colors.NC}")
    
    if failed_tests == 0:
        print(f"\n{Colors.GREEN}🎉 所有测试通过！{Colors.NC}")
        sys.exit(0)
    else:
        print(f"\n{Colors.YELLOW}⚠️  有 {failed_tests} 个测试失败{Colors.NC}")
        sys.exit(1)

if __name__ == "__main__":
    main()
