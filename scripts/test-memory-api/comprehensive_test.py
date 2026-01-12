#!/usr/bin/env python3
"""
记忆API全面测试脚本
测试 HSMem Python API 和主项目后端记忆API
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional
from datetime import datetime

# 配置
HSMEM_URL = "http://localhost:8000"
MAIN_BACKEND_URL = "http://localhost:8081"
TEST_USER_ID = f"test_user_{int(time.time())}"
TEST_TOKEN = ""
TEST_USERNAME = "test"
TEST_PASSWORD = "test123"

# 统计
class TestStats:
    def __init__(self):
        self.total = 0
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.failures = []

stats = TestStats()

# 颜色输出
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def print_header(title: str):
    """打印标题"""
    print(f"\n{Colors.BLUE}{'='*70}{Colors.NC}")
    print(f"{Colors.BLUE}  {title}{Colors.NC}")
    print(f"{Colors.BLUE}{'='*70}{Colors.NC}\n")

def print_test(name: str):
    """打印测试名称"""
    print(f"{Colors.YELLOW}测试: {name}{Colors.NC}")
    stats.total += 1

def print_success(message: str):
    """打印成功消息"""
    print(f"{Colors.GREEN}✓ {message}{Colors.NC}")
    stats.passed += 1

def print_error(message: str, details: str = ""):
    """打印错误消息"""
    print(f"{Colors.RED}✗ {message}{Colors.NC}")
    if details:
        print(f"  详情: {details}")
    stats.failed += 1
    stats.failures.append(f"{message}: {details}")

def print_skip(message: str):
    """打印跳过消息"""
    print(f"{Colors.YELLOW}⊘ {message} (跳过){Colors.NC}")
    stats.skipped += 1

def check_service(url: str, name: str) -> bool:
    """检查服务是否可用"""
    print_test(f"检查 {name} 服务可用性")
    try:
        response = requests.get(f"{url}/health", timeout=5)
        if response.status_code == 200:
            print_success(f"{name} 服务可用")
            return True
        else:
            print_error(f"{name} 服务响应异常", f"状态码: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"{name} 服务不可用", str(e))
        return False

def test_hsmem_health():
    """测试 HSMem 健康检查"""
    print_test("HSMem 健康检查")
    try:
        response = requests.get(f"{HSMEM_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print_success("健康检查通过")
                print(f"  统计: {json.dumps(data.get('statistics', {}), ensure_ascii=False, indent=2)}")
                return True
            else:
                print_error("健康检查失败", f"状态: {data.get('status')}")
                return False
        else:
            print_error("健康检查失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("健康检查异常", str(e))
        return False

def test_hsmem_memorize_conversation():
    """测试 HSMem 对话记忆化"""
    print_test("HSMem 对话记忆化")
    try:
        data = {
            "messages": [
                {"role": "user", "content": {"text": "我是测试用户"}},
                {"role": "assistant", "content": {"text": "你好测试用户！"}},
                {"role": "user", "content": {"text": "我喜欢编程和音乐"}}
            ],
            "user_id": TEST_USER_ID
        }
        response = requests.post(
            f"{HSMEM_URL}/api/v1/memory/memorize/conversation",
            json=data,
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print_success("对话记忆化成功")
                data_result = result.get("data", {})
                print(f"  资源ID: {data_result.get('resource_id', 'N/A')}")
                print(f"  记忆项数: {data_result.get('items_count', 0)}")
                print(f"  分类数: {len(data_result.get('categories', []))}")
                return True
            else:
                print_error("对话记忆化失败", result.get("error", "未知错误"))
                return False
        else:
            print_error("对话记忆化失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("对话记忆化异常", str(e))
        return False

def test_hsmem_memorize_text():
    """测试 HSMem 文本记忆化"""
    print_test("HSMem 文本记忆化")
    try:
        data = {
            "text": "FastAPI 是一个现代、快速的 Python Web 框架，用于构建 API。",
            "context": {"topic": "programming", "framework": "FastAPI"},
            "user_id": TEST_USER_ID
        }
        response = requests.post(
            f"{HSMEM_URL}/api/v1/memory/memorize/text",
            json=data,
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print_success("文本记忆化成功")
                return True
            else:
                print_error("文本记忆化失败", result.get("error", "未知错误"))
                return False
        else:
            print_error("文本记忆化失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("文本记忆化异常", str(e))
        return False

def test_hsmem_retrieve():
    """测试 HSMem 记忆检索"""
    print_test("HSMem 记忆检索")
    try:
        data = {
            "queries": [
                {"role": "user", "content": {"text": "测试用户喜欢什么？"}}
            ],
            "where": {"user_id": TEST_USER_ID},
            "limit": 5
        }
        response = requests.post(
            f"{HSMEM_URL}/api/v1/memory/retrieve",
            json=data,
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                data_result = result.get("data", {})
                items = data_result.get("items", [])
                print_success(f"记忆检索成功 (找到 {len(items)} 个记忆项)")
                if items:
                    print(f"  第一个记忆项: {items[0].get('summary', 'N/A')[:50]}...")
                return True
            else:
                print_error("记忆检索失败", result.get("error", "未知错误"))
                return False
        else:
            print_error("记忆检索失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("记忆检索异常", str(e))
        return False

def test_hsmem_statistics():
    """测试 HSMem 统计信息"""
    print_test("HSMem 统计信息")
    try:
        response = requests.get(f"{HSMEM_URL}/api/v1/memory/statistics", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                stats_data = result.get("data", {}).get("statistics", {})
                print_success("统计信息获取成功")
                print(f"  资源数: {stats_data.get('resources_count', 0)}")
                print(f"  记忆项数: {stats_data.get('items_count', 0)}")
                print(f"  分类数: {stats_data.get('categories_count', 0)}")
                return True
            else:
                print_error("统计信息获取失败", result.get("error", "未知错误"))
                return False
        else:
            print_error("统计信息获取失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("统计信息获取异常", str(e))
        return False

def test_hsmem_categories():
    """测试 HSMem 分类列表"""
    print_test("HSMem 分类列表")
    try:
        response = requests.get(f"{HSMEM_URL}/api/v1/memory/categories", timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                categories = result.get("data", {}).get("categories", [])
                print_success(f"分类列表获取成功 (共 {len(categories)} 个分类)")
                if categories:
                    print(f"  前3个分类: {[c.get('name') for c in categories[:3]]}")
                return True
            else:
                print_error("分类列表获取失败", result.get("error", "未知错误"))
                return False
        else:
            print_error("分类列表获取失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("分类列表获取异常", str(e))
        return False

def test_hsmem_error_handling():
    """测试 HSMem 错误处理"""
    print_test("HSMem 错误处理 - 无效请求")
    try:
        # 发送无效请求
        response = requests.post(
            f"{HSMEM_URL}/api/v1/memory/memorize/conversation",
            json={},
            timeout=10
        )
        if response.status_code in [400, 422]:
            print_success("无效请求被正确拒绝")
            return True
        else:
            print_error("无效请求处理异常", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("错误处理测试异常", str(e))
        return False

def login_backend() -> bool:
    """登录主项目后端"""
    print_test("主项目后端登录")
    try:
        data = {
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        }
        response = requests.post(
            f"{MAIN_BACKEND_URL}/api/auth/login",
            json=data,
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("code") == 200:
                global TEST_TOKEN
                TEST_TOKEN = result.get("data", {}).get("token", "")
                if TEST_TOKEN:
                    print_success("登录成功")
                    return True
                else:
                    print_error("登录失败", "未获取到Token")
                    return False
            else:
                print_error("登录失败", result.get("message", "未知错误"))
                return False
        else:
            print_error("登录失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("登录异常", str(e))
        return False

def test_backend_memory_search():
    """测试主项目后端记忆搜索"""
    if not TEST_TOKEN:
        print_skip("主项目后端记忆搜索 (需要登录)")
        return False
    
    print_test("主项目后端记忆搜索")
    try:
        # 需要从登录响应中获取用户ID，这里使用占位符
        user_id = "1"  # 实际应该从登录响应中获取
        response = requests.get(
            f"{MAIN_BACKEND_URL}/api/memory/v1/users/{user_id}/memories/search?query=test&limit=10",
            headers={"Authorization": f"Bearer {TEST_TOKEN}"},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("code") == 200:
                print_success("记忆搜索成功")
                return True
            else:
                print_error("记忆搜索失败", result.get("message", "未知错误"))
                return False
        else:
            print_error("记忆搜索失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("记忆搜索异常", str(e))
        return False

def test_performance():
    """测试性能"""
    print_test("性能测试 - 响应时间")
    try:
        start_time = time.time()
        response = requests.get(f"{HSMEM_URL}/health", timeout=5)
        end_time = time.time()
        duration = (end_time - start_time) * 1000  # 转换为毫秒
        
        if response.status_code == 200:
            if duration < 1000:
                print_success(f"响应时间: {duration:.2f}ms (正常)")
            else:
                print_error(f"响应时间: {duration:.2f}ms (较慢)")
            return True
        else:
            print_error("性能测试失败", f"状态码: {response.status_code}")
            return False
    except Exception as e:
        print_error("性能测试异常", str(e))
        return False

def generate_report():
    """生成测试报告"""
    print_header("测试报告")
    
    print(f"总测试数: {stats.total}")
    print(f"{Colors.GREEN}通过: {stats.passed}{Colors.NC}")
    print(f"{Colors.RED}失败: {stats.failed}{Colors.NC}")
    print(f"{Colors.YELLOW}跳过: {stats.skipped}{Colors.NC}")
    
    if stats.failures:
        print(f"\n{Colors.RED}失败详情:{Colors.NC}")
        for i, failure in enumerate(stats.failures, 1):
            print(f"  {i}. {failure}")
    
    if stats.failed == 0:
        print(f"\n{Colors.GREEN}✅ 所有测试通过！{Colors.NC}")
        return 0
    else:
        print(f"\n{Colors.RED}❌ 部分测试失败{Colors.NC}")
        return 1

def main():
    """主测试函数"""
    print_header("记忆API全面测试")
    
    print(f"配置:")
    print(f"  HSMem URL: {HSMEM_URL}")
    print(f"  主项目后端 URL: {MAIN_BACKEND_URL}")
    print(f"  测试用户ID: {TEST_USER_ID}")
    print(f"  测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 检查服务
    hsmem_available = check_service(HSMEM_URL, "HSMem")
    backend_available = check_service(MAIN_BACKEND_URL, "主项目后端")
    
    # 测试 HSMem API
    if hsmem_available:
        print_header("HSMem Python API 测试")
        test_hsmem_health()
        test_hsmem_memorize_conversation()
        test_hsmem_memorize_text()
        test_hsmem_retrieve()
        test_hsmem_statistics()
        test_hsmem_categories()
        test_hsmem_error_handling()
        test_performance()
    else:
        print_skip("HSMem API 测试 (服务不可用)")
    
    # 测试主项目后端API
    if backend_available:
        print_header("主项目后端记忆API测试")
        if login_backend():
            test_backend_memory_search()
        else:
            print_skip("主项目后端API测试 (登录失败)")
    else:
        print_skip("主项目后端API测试 (服务不可用)")
    
    # 生成报告
    return generate_report()

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}测试被用户中断{Colors.NC}")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n{Colors.RED}测试异常: {e}{Colors.NC}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
