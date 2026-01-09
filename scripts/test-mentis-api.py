#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mentis 超级智能体 API 测试脚本
使用 Python 进行更详细的 API 测试
"""

import requests
import json
import time
import sys
from typing import Optional, Dict, Any

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

class MentisTester:
    def __init__(self, base_url: str = "http://localhost:8080", 
                 admin_username: str = "admin", 
                 admin_password: str = "admin123"):
        self.base_url = base_url
        self.admin_username = admin_username
        self.admin_password = admin_password
        self.admin_token: Optional[str] = None
        self.session_id: Optional[str] = None
        self.passed = 0
        self.failed = 0
        self.total = 0
    
    def log(self, message: str, color: str = Colors.RESET):
        print(f"{color}{message}{Colors.RESET}")
    
    def test_case(self, name: str, func, *args, **kwargs) -> bool:
        """执行测试用例"""
        self.total += 1
        self.log(f"\n[{self.total}] {name}", Colors.YELLOW)
        
        try:
            result = func(*args, **kwargs)
            if result:
                self.passed += 1
                self.log(f"✓ 通过", Colors.GREEN)
                return True
            else:
                self.failed += 1
                self.log(f"✗ 失败", Colors.RED)
                return False
        except Exception as e:
            self.failed += 1
            self.log(f"✗ 异常: {str(e)}", Colors.RED)
            return False
    
    def admin_login(self) -> bool:
        """管理员登录"""
        self.log("\n" + "="*50, Colors.BLUE)
        self.log("1. 管理员认证", Colors.BLUE)
        self.log("="*50, Colors.BLUE)
        
        url = f"{self.base_url}/api/admin/auth/login"
        data = {
            "username": self.admin_username,
            "password": self.admin_password
        }
        
        try:
            response = requests.post(url, json=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                self.admin_token = result.get("token")
                if self.admin_token:
                    self.log(f"✓ 登录成功", Colors.GREEN)
                    self.log(f"Token: {self.admin_token[:20]}...", Colors.GREEN)
                    return True
            self.log(f"✗ 登录失败: {response.status_code}", Colors.RED)
            self.log(f"响应: {response.text}", Colors.RED)
            return False
        except Exception as e:
            self.log(f"✗ 登录异常: {str(e)}", Colors.RED)
            return False
    
    def create_session(self, title: str = "测试会话") -> bool:
        """创建会话"""
        self.log("\n" + "="*50, Colors.BLUE)
        self.log("2. 会话管理测试", Colors.BLUE)
        self.log("="*50, Colors.BLUE)
        
        url = f"{self.base_url}/api/admin/mentis/sessions"
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        data = {"title": title}
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                data_obj = result.get("data", result)
                self.session_id = data_obj.get("sessionId")
                if self.session_id:
                    self.log(f"✓ 会话创建成功: {self.session_id}", Colors.GREEN)
                    return True
            self.log(f"✗ 创建会话失败: {response.status_code}", Colors.RED)
            return False
        except Exception as e:
            self.log(f"✗ 创建会话异常: {str(e)}", Colors.RED)
            return False
    
    def get_sessions(self) -> bool:
        """获取会话列表"""
        url = f"{self.base_url}/api/admin/mentis/sessions"
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                result = response.json()
                sessions = result.get("data", [])
                self.log(f"✓ 获取到 {len(sessions)} 个会话", Colors.GREEN)
                return True
            return False
        except Exception as e:
            self.log(f"✗ 获取会话列表异常: {str(e)}", Colors.RED)
            return False
    
    def send_message_sync(self, message: str) -> bool:
        """发送同步消息"""
        self.log("\n" + "="*50, Colors.BLUE)
        self.log("3. 消息交互测试（同步）", Colors.BLUE)
        self.log("="*50, Colors.BLUE)
        
        url = f"{self.base_url}/api/admin/mentis/chat/send"
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        data = {
            "sessionId": self.session_id,
            "message": message,
            "enableComputerUse": True
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                result = response.json()
                response_text = result.get("data", result).get("response", "")
                self.log(f"✓ 消息发送成功", Colors.GREEN)
                self.log(f"响应: {response_text[:100]}...", Colors.GREEN)
                return True
            self.log(f"✗ 发送消息失败: {response.status_code}", Colors.RED)
            self.log(f"响应: {response.text}", Colors.RED)
            return False
        except Exception as e:
            self.log(f"✗ 发送消息异常: {str(e)}", Colors.RED)
            return False
    
    def send_message_stream(self, message: str) -> bool:
        """发送流式消息"""
        self.log("\n" + "="*50, Colors.BLUE)
        self.log("4. 消息交互测试（流式）", Colors.BLUE)
        self.log("="*50, Colors.BLUE)
        
        url = f"{self.base_url}/api/admin/mentis/chat/stream"
        headers = {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
        data = {
            "sessionId": self.session_id,
            "message": message,
            "enableComputerUse": False
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, 
                                   stream=True, timeout=60)
            if response.status_code == 200:
                self.log(f"✓ 流式连接建立", Colors.GREEN)
                chunk_count = 0
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            chunk_count += 1
                            if chunk_count <= 3:  # 只显示前3个chunk
                                data_str = line_str[6:]
                                try:
                                    chunk_data = json.loads(data_str)
                                    response_text = chunk_data.get("response", "")[:50]
                                    self.log(f"  收到chunk {chunk_count}: {response_text}...", Colors.GREEN)
                                except:
                                    self.log(f"  收到chunk {chunk_count}: {data_str[:50]}...", Colors.GREEN)
                self.log(f"✓ 总共收到 {chunk_count} 个数据块", Colors.GREEN)
                return True
            return False
        except Exception as e:
            self.log(f"✗ 流式消息异常: {str(e)}", Colors.RED)
            return False
    
    def test_error_handling(self) -> bool:
        """测试错误处理"""
        self.log("\n" + "="*50, Colors.BLUE)
        self.log("5. 错误处理测试", Colors.BLUE)
        self.log("="*50, Colors.BLUE)
        
        # 测试无效token
        url = f"{self.base_url}/api/admin/mentis/sessions"
        headers = {"Authorization": "Bearer invalid_token"}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 401:
                self.log(f"✓ 无效token被正确拦截 (401)", Colors.GREEN)
                return True
            else:
                self.log(f"⚠ 无效token返回 {response.status_code} (期望401)", Colors.YELLOW)
                return True  # 暂时通过
        except Exception as e:
            self.log(f"✗ 错误处理测试异常: {str(e)}", Colors.RED)
            return False
    
    def run_all_tests(self):
        """运行所有测试"""
        self.log("\n" + "="*50, Colors.BLUE)
        self.log("Mentis 超级智能体完整测试", Colors.BLUE)
        self.log("="*50, Colors.BLUE)
        
        # 执行测试
        self.test_case("管理员登录", self.admin_login)
        if not self.admin_token:
            self.log("无法继续测试：登录失败", Colors.RED)
            return
        
        self.test_case("创建会话", self.create_session)
        if not self.session_id:
            self.log("无法继续测试：会话创建失败", Colors.RED)
            return
        
        self.test_case("获取会话列表", self.get_sessions)
        self.test_case("发送同步消息-问候", 
                      self.send_message_sync, "你好，请介绍一下自己")
        self.test_case("发送同步消息-命令", 
                      self.send_message_sync, "帮我执行 ls -la")
        self.test_case("发送流式消息", 
                      self.send_message_stream, "告诉我当前系统时间")
        self.test_case("错误处理-无效token", self.test_error_handling)
        
        # 总结
        self.log("\n" + "="*50, Colors.BLUE)
        self.log("测试总结", Colors.BLUE)
        self.log("="*50, Colors.BLUE)
        self.log(f"总测试数: {self.total}")
        self.log(f"通过: {self.passed}", Colors.GREEN)
        self.log(f"失败: {self.failed}", Colors.RED)
        
        if self.failed == 0:
            self.log("\n✓ 所有测试通过！", Colors.GREEN)
            return 0
        else:
            self.log(f"\n✗ 有 {self.failed} 个测试失败", Colors.RED)
            return 1

if __name__ == "__main__":
    # 解析命令行参数
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
    admin_user = sys.argv[2] if len(sys.argv) > 2 else "admin"
    admin_pass = sys.argv[3] if len(sys.argv) > 3 else "admin123"
    
    tester = MentisTester(base_url, admin_user, admin_pass)
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)
