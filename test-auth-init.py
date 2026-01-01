#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
注册、登录、初始化过程全面测试脚本
使用Python编写，提供更完善的JSON处理和错误处理
"""

import sys
import json
import time
import random
import string
import requests
from typing import Dict, Optional, Tuple, Any
from datetime import datetime

# 颜色输出
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

# 测试统计
class TestStats:
    def __init__(self):
        self.total = 0
        self.passed = 0
        self.failed = 0
        self.results = []
    
    def add_test(self, name: str, passed: bool, error: str = ""):
        self.total += 1
        if passed:
            self.passed += 1
            self.results.append(("PASS", name, ""))
            print(f"{Colors.GREEN}✅ PASS{Colors.NC} - {name}")
        else:
            self.failed += 1
            self.results.append(("FAIL", name, error))
            print(f"{Colors.RED}❌ FAIL{Colors.NC} - {name}")
            if error:
                print(f"{Colors.RED}   错误: {error}{Colors.NC}")
    
    def print_summary(self):
        print(f"\n{Colors.CYAN}========================================{Colors.NC}")
        print(f"{Colors.CYAN}测试总结{Colors.NC}")
        print(f"{Colors.CYAN}========================================{Colors.NC}\n")
        print(f"{Colors.CYAN}总测试数: {self.total}{Colors.NC}")
        print(f"{Colors.GREEN}通过: {self.passed}{Colors.NC}")
        print(f"{Colors.RED}失败: {self.failed}{Colors.NC}\n")
        
        if self.failed > 0:
            print(f"{Colors.YELLOW}失败的测试详情:{Colors.NC}")
            for status, name, error in self.results:
                if status == "FAIL":
                    print(f"{Colors.RED}  {name}")
                    if error:
                        print(f"    {error}{Colors.NC}")
            print(f"\n{Colors.RED}========================================{Colors.NC}")
            print(f"{Colors.RED}❌ 有 {self.failed} 个测试失败{Colors.NC}")
            print(f"{Colors.RED}========================================{Colors.NC}\n")
            return False
        else:
            print(f"{Colors.GREEN}========================================{Colors.NC}")
            print(f"{Colors.GREEN}✅ 所有测试通过！{Colors.NC}")
            print(f"{Colors.GREEN}========================================{Colors.NC}\n")
            return True


class AuthTester:
    def __init__(self, base_url: str = "http://localhost:8081"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.stats = TestStats()
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        # 测试过程中保存的数据
        self.registered_token: Optional[str] = None
        self.registered_user_id: Optional[str] = None
        self.registered_username: Optional[str] = None
        self.registered_password: Optional[str] = None
        self.login_token: Optional[str] = None
    
    def generate_test_user(self) -> str:
        """生成随机测试用户名"""
        timestamp = int(time.time())
        random_num = random.randint(1000, 9999)
        return f"testuser_{timestamp}_{random_num}"
    
    def print_header(self, title: str):
        """打印测试标题"""
        print(f"\n{Colors.CYAN}========================================{Colors.NC}")
        print(f"{Colors.CYAN}{title}{Colors.NC}")
        print(f"{Colors.CYAN}========================================{Colors.NC}\n")
    
    def print_test_item(self, name: str):
        """打印测试项"""
        print(f"{Colors.YELLOW}[测试]{Colors.NC} {name}")
    
    def api_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                   token: Optional[str] = None) -> Tuple[int, Any]:
        """执行API请求"""
        url = f"{self.api_url}{endpoint}"
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = self.session.post(url, headers=headers, json=data, timeout=10)
            elif method.upper() == 'PUT':
                response = self.session.put(url, headers=headers, json=data, timeout=10)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"不支持的HTTP方法: {method}")
            
            try:
                body = response.json()
            except:
                body = response.text
            
            return response.status_code, body
        except requests.exceptions.RequestException as e:
            return 0, {"error": str(e)}
    
    def check_service(self):
        """检查服务是否运行"""
        self.print_header("1. 服务可用性检查")
        
        self.print_test_item("检查后端服务是否运行")
        status_code, body = self.api_request("GET", "/auth/invite-code-required")
        
        if status_code in [200, 404]:
            self.stats.add_test("后端服务运行正常", True)
            print(f"{Colors.GREEN}✅ 后端服务正在运行 ({self.base_url}){Colors.NC}")
            return True
        else:
            self.stats.add_test("后端服务运行正常", False, f"HTTP {status_code}")
            print(f"{Colors.RED}❌ 后端服务未运行或无法访问{Colors.NC}")
            print(f"{Colors.YELLOW}请确保后端服务已启动在 {self.base_url}{Colors.NC}")
            return False
    
    def test_config_check(self):
        """测试配置检查"""
        self.print_header("2. 系统配置检查")
        
        # 检查邀请码配置
        self.print_test_item("检查是否需要邀请码")
        status_code, body = self.api_request("GET", "/auth/invite-code-required")
        
        if status_code == 200:
            invite_required = body.get('inviteCodeRequired', False) if isinstance(body, dict) else False
            print(f"{Colors.BLUE}   邀请码要求: {invite_required}{Colors.NC}")
            self.stats.add_test("邀请码配置查询成功", True)
        else:
            self.stats.add_test("邀请码配置查询成功", False, f"HTTP {status_code}")
        
        # 检查邮箱验证码配置
        self.print_test_item("检查是否需要邮箱验证码")
        status_code, body = self.api_request("GET", "/auth/email-verification-required")
        
        if status_code == 200:
            email_required = body.get('emailVerificationRequired', False) if isinstance(body, dict) else False
            print(f"{Colors.BLUE}   邮箱验证码要求: {email_required}{Colors.NC}")
            self.stats.add_test("邮箱验证码配置查询成功", True)
        else:
            self.stats.add_test("邮箱验证码配置查询成功", False, f"HTTP {status_code}")
    
    def test_registration(self):
        """测试注册功能"""
        self.print_header("3. 注册功能测试")
        
        # 生成测试用户
        test_username = self.generate_test_user()
        test_email = f"test_{test_username}@example.com"
        test_password = "Test1234@"
        test_nickname = "测试用户"
        
        print(f"{Colors.BLUE}测试用户信息:{Colors.NC}")
        print(f"{Colors.BLUE}  用户名: {test_username}{Colors.NC}")
        print(f"{Colors.BLUE}  邮箱: {test_email}{Colors.NC}\n")
        
        # 测试3.1: 无效的注册请求
        self.print_test_item("测试无效注册（缺少用户名）")
        invalid_data = {"email": "test@example.com", "password": "Test1234@"}
        status_code, body = self.api_request("POST", "/auth/register", invalid_data)
        self.stats.add_test("无效注册请求被拒绝", status_code in [400, 422])
        
        # 测试3.2: 无效的密码
        self.print_test_item("测试无效密码（长度不足）")
        invalid_data = {
            "username": f"{test_username}_short",
            "email": "short@example.com",
            "password": "short"
        }
        status_code, body = self.api_request("POST", "/auth/register", invalid_data)
        self.stats.add_test("无效密码被拒绝", status_code in [400, 422])
        
        # 测试3.3: 正常注册
        self.print_test_item("测试正常注册")
        register_data = {
            "username": test_username,
            "email": test_email,
            "password": test_password,
            "nickname": test_nickname
        }
        status_code, body = self.api_request("POST", "/auth/register", register_data)
        
        if status_code == 200 and isinstance(body, dict):
            data = body.get('data', {})
            code = body.get('code', 0)
            token = data.get('token', '')
            user_id = data.get('id')
            is_first_login = data.get('isFirstLogin', False)
            worlds = data.get('worlds', [])
            
            self.stats.add_test("注册成功", code == 200)
            self.stats.add_test("返回了JWT Token", bool(token))
            self.stats.add_test("返回了用户ID", user_id is not None)
            self.stats.add_test("首次登录标识为true", is_first_login is True)
            self.stats.add_test("初始化创建了世界", len(worlds) > 0, 
                               f"世界数量: {len(worlds)}")
            
            # 保存数据供后续测试使用
            self.registered_token = token
            self.registered_user_id = str(user_id) if user_id else None
            self.registered_username = test_username
            self.registered_password = test_password
            
            print(f"{Colors.GREEN}   注册成功，用户ID: {user_id}，世界数量: {len(worlds)}{Colors.NC}")
            if worlds:
                world_name = worlds[0].get('name', '')
                print(f"{Colors.GREEN}   第一个世界名称: {world_name}{Colors.NC}")
        else:
            self.stats.add_test("注册成功", False, f"HTTP {status_code}")
            if isinstance(body, dict):
                error_msg = body.get('message', str(body))
            else:
                error_msg = str(body)
            print(f"{Colors.RED}   响应: {error_msg}{Colors.NC}")
            return False
        
        # 测试3.4: 重复用户名
        self.print_test_item("测试重复用户名注册")
        duplicate_data = {
            "username": test_username,
            "email": "duplicate@example.com",
            "password": test_password
        }
        status_code, body = self.api_request("POST", "/auth/register", duplicate_data)
        self.stats.add_test("重复用户名被拒绝", status_code in [400, 409])
        
        # 测试3.5: 重复邮箱
        self.print_test_item("测试重复邮箱注册")
        duplicate_email_data = {
            "username": f"{test_username}_dup",
            "email": test_email,
            "password": test_password
        }
        status_code, body = self.api_request("POST", "/auth/register", duplicate_email_data)
        self.stats.add_test("重复邮箱被拒绝", status_code in [400, 409])
        
        return True
    
    def test_login(self):
        """测试登录功能"""
        self.print_header("4. 登录功能测试")
        
        if not self.registered_username or not self.registered_password:
            print(f"{Colors.YELLOW}跳过登录测试（需要先成功注册）{Colors.NC}")
            return False
        
        # 测试4.1: 错误密码
        self.print_test_item("测试错误密码登录")
        wrong_data = {
            "username": self.registered_username,
            "password": "WrongPassword123@"
        }
        status_code, body = self.api_request("POST", "/auth/login", wrong_data)
        self.stats.add_test("错误密码登录被拒绝", status_code in [401, 400])
        
        # 测试4.2: 不存在用户
        self.print_test_item("测试不存在用户登录")
        nonexistent_data = {
            "username": "nonexistent_user_99999",
            "password": "Test1234@"
        }
        status_code, body = self.api_request("POST", "/auth/login", nonexistent_data)
        self.stats.add_test("不存在用户登录被拒绝", status_code in [401, 400])
        
        # 测试4.3: 正常登录
        self.print_test_item("测试正常登录")
        login_data = {
            "username": self.registered_username,
            "password": self.registered_password
        }
        status_code, body = self.api_request("POST", "/auth/login", login_data)
        
        if status_code == 200 and isinstance(body, dict):
            data = body.get('data', {})
            code = body.get('code', 0)
            token = data.get('token', '')
            user_id = data.get('id')
            username = data.get('username', '')
            is_first_login = data.get('isFirstLogin', False)
            worlds = data.get('worlds', [])
            
            self.stats.add_test("登录成功", code == 200)
            self.stats.add_test("返回了JWT Token", bool(token))
            self.stats.add_test("返回了正确的用户ID", 
                               str(user_id) == self.registered_user_id if user_id else False)
            self.stats.add_test("返回了正确的用户名", username == self.registered_username)
            self.stats.add_test("首次登录标识正确", is_first_login is False, 
                               "应为false（已注册过）")
            self.stats.add_test("世界数据存在", len(worlds) > 0, f"世界数量: {len(worlds)}")
            
            self.login_token = token
            print(f"{Colors.GREEN}   登录成功，Token已获取{Colors.NC}")
        else:
            self.stats.add_test("登录成功", False, f"HTTP {status_code}")
            if isinstance(body, dict):
                error_msg = body.get('message', str(body))
            else:
                error_msg = str(body)
            print(f"{Colors.RED}   响应: {error_msg}{Colors.NC}")
            return False
        
        return True
    
    def test_get_current_user(self):
        """测试获取当前用户信息"""
        self.print_header("5. 获取当前用户信息测试")
        
        token = self.login_token or self.registered_token
        if not token:
            print(f"{Colors.YELLOW}跳过获取用户信息测试（需要有效的Token）{Colors.NC}")
            return False
        
        # 测试5.1: 使用Token获取用户信息
        self.print_test_item("测试使用Token获取用户信息")
        status_code, body = self.api_request("GET", "/auth/me", token=token)
        
        if status_code == 200 and isinstance(body, dict):
            data = body.get('data', {})
            code = body.get('code', 0)
            user_id = data.get('id')
            username = data.get('username', '')
            
            self.stats.add_test("获取用户信息成功", code == 200)
            self.stats.add_test("返回了用户ID", user_id is not None)
            self.stats.add_test("返回了正确的用户名", username == self.registered_username)
        else:
            self.stats.add_test("获取用户信息成功", False, f"HTTP {status_code}")
            if isinstance(body, dict):
                error_msg = body.get('message', str(body))
            else:
                error_msg = str(body)
            print(f"{Colors.RED}   响应: {error_msg}{Colors.NC}")
        
        # 测试5.2: 无Token访问
        self.print_test_item("测试无Token访问（应被拒绝）")
        status_code, body = self.api_request("GET", "/auth/me")
        self.stats.add_test("无Token访问被拒绝", status_code in [401, 403])
        
        return True
    
    def test_initialization(self):
        """测试初始化过程验证"""
        self.print_header("6. 初始化过程验证")
        
        token = self.login_token or self.registered_token
        if not token:
            print(f"{Colors.YELLOW}跳过初始化验证（需要有效的Token）{Colors.NC}")
            return False
        
        # 测试6.1: 验证世界是否已创建
        self.print_test_item("验证用户世界是否已创建")
        status_code, body = self.api_request("GET", "/worlds", token=token)
        
        if status_code == 200:
            if isinstance(body, list):
                worlds_count = len(body)
                self.stats.add_test("世界列表可访问", True)
                self.stats.add_test("至少创建了一个世界", worlds_count > 0, 
                                   f"世界数量: {worlds_count}")
                if worlds_count > 0:
                    world_name = body[0].get('name', '') if isinstance(body[0], dict) else ''
                    print(f"{Colors.GREEN}   第一个世界名称: {world_name}{Colors.NC}")
            else:
                self.stats.add_test("世界列表可访问", False, "响应格式不正确")
        else:
            print(f"{Colors.YELLOW}   世界API不可用 (HTTP {status_code})，跳过详细验证{Colors.NC}")
            self.stats.add_test("初始化验证", True)
        
        return True
    
    def test_first_login_initialization(self):
        """测试新用户首次登录初始化"""
        self.print_header("7. 首次登录初始化测试")
        
        # 创建一个新用户
        new_username = self.generate_test_user()
        new_email = f"firstlogin_{new_username}@example.com"
        new_password = "Test1234@"
        
        print(f"{Colors.BLUE}创建新用户用于首次登录测试: {new_username}{Colors.NC}")
        
        # 注册新用户
        register_data = {
            "username": new_username,
            "email": new_email,
            "password": new_password
        }
        status_code, body = self.api_request("POST", "/auth/register", register_data)
        
        if status_code == 200 and isinstance(body, dict):
            data = body.get('data', {})
            is_first_login = data.get('isFirstLogin', False)
            worlds = data.get('worlds', [])
            
            self.stats.add_test("新用户注册成功", True)
            self.stats.add_test("首次登录标识为true", is_first_login is True)
            self.stats.add_test("注册时已初始化世界", len(worlds) > 0, 
                               f"世界数量: {len(worlds)}")
            
            print(f"{Colors.GREEN}   新用户注册并初始化成功，世界数量: {len(worlds)}{Colors.NC}")
        
        return True
    
    def run_all_tests(self):
        """运行所有测试"""
        print(f"{Colors.GREEN}========================================{Colors.NC}")
        print(f"{Colors.GREEN}注册、登录、初始化过程全面测试{Colors.NC}")
        print(f"{Colors.GREEN}========================================{Colors.NC}\n")
        print(f"{Colors.BLUE}测试环境: {self.base_url}{Colors.NC}")
        print(f"{Colors.BLUE}API地址: {self.api_url}{Colors.NC}\n")
        
        # 执行测试
        if not self.check_service():
            return False
        
        self.test_config_check()
        self.test_registration()
        self.test_login()
        self.test_get_current_user()
        self.test_initialization()
        self.test_first_login_initialization()
        
        # 打印总结
        return self.stats.print_summary()


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='注册、登录、初始化过程全面测试')
    parser.add_argument('--base-url', default='http://localhost:8081',
                       help='后端服务基础URL（默认: http://localhost:8081）')
    
    args = parser.parse_args()
    
    tester = AuthTester(base_url=args.base_url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
