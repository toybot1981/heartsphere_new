#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
邮箱API全面测试脚本
测试用户：
1. tongyexin / 123456
2. ty1 / Tyx@1234
3. heartsphere / Tyx@1234

所有测试都会验证API响应和数据库数据
"""

import requests
import json
import sys
import subprocess
from typing import Dict, Optional, Any, List
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

# 尝试导入pymysql，如果没有则使用mysql命令行
try:
    import pymysql
    USE_PYMYSQL = True
except ImportError:
    USE_PYMYSQL = False
    print("注意: pymysql未安装，将使用mysql命令行工具")

# 配置
API_BASE = "http://localhost:8081/api"
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'heartsphere',
    'charset': 'utf8mb4'
}

# 颜色输出
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

# 测试结果
@dataclass
class TestResult:
    name: str
    passed: bool
    message: str
    api_response: Optional[Any] = None
    db_data: Optional[Any] = None

class TestPhase(Enum):
    LOGIN = "阶段1: 用户登录"
    CREATE = "阶段2: 创建消息"
    LIST = "阶段3: 获取消息列表"
    DETAIL = "阶段4: 消息详情"
    MARK = "阶段5: 标记操作"
    DELETE = "阶段6: 删除操作"
    UNREAD = "阶段7: 未读数量"

class MailboxAPITester:
    def __init__(self):
        self.db_conn = None
        self.test_results: List[TestResult] = []
        self.users: Dict[str, Dict] = {
            'tongyexin': {'username': 'tongyexin', 'password': '123456'},
            'ty1': {'username': 'ty1', 'password': 'Tyx@1234'},
            'heartsphere': {'username': 'heartsphere', 'password': 'Tyx@1234'}
        }
        self.created_message_ids: List[int] = []
        
    def log(self, level: str, message: str):
        """日志输出"""
        color_map = {
            'INFO': Colors.BLUE,
            'SUCCESS': Colors.GREEN,
            'ERROR': Colors.RED,
            'WARNING': Colors.YELLOW,
            'PHASE': Colors.CYAN
        }
        color = color_map.get(level, Colors.NC)
        print(f"{color}[{level}]{Colors.NC} {message}")
        
    def connect_db(self):
        """连接数据库"""
        if USE_PYMYSQL:
            try:
                self.db_conn = pymysql.connect(**DB_CONFIG)
                self.log('SUCCESS', '数据库连接成功 (使用pymysql)')
                return True
            except Exception as e:
                self.log('ERROR', f'数据库连接失败: {e}')
                return False
        else:
            # 使用mysql命令行工具
            self.log('INFO', '使用mysql命令行工具连接数据库')
            # 测试连接
            try:
                result = self.query_db("SELECT 1", fetch_one=True)
                if result:
                    self.log('SUCCESS', '数据库连接成功 (使用mysql命令行)')
                    return True
            except Exception as e:
                self.log('ERROR', f'数据库连接失败: {e}')
                return False
            return True
            
    def close_db(self):
        """关闭数据库连接"""
        if USE_PYMYSQL and self.db_conn:
            self.db_conn.close()
            
    def query_db(self, sql: str, fetch_one: bool = False) -> Optional[Any]:
        """查询数据库"""
        if USE_PYMYSQL:
            try:
                with self.db_conn.cursor() as cursor:
                    cursor.execute(sql)
                    if fetch_one:
                        return cursor.fetchone()
                    else:
                        return cursor.fetchall()
            except Exception as e:
                self.log('ERROR', f'数据库查询失败: {sql} - {e}')
                return None
        else:
            # 使用mysql命令行
            try:
                cmd = [
                    'mysql',
                    f'-h{DB_CONFIG["host"]}',
                    f'-u{DB_CONFIG["user"]}',
                    f'-p{DB_CONFIG["password"]}',
                    DB_CONFIG['database'],
                    '-N',  # 不打印列名
                    '-e',
                    sql
                ]
                result = subprocess.run(cmd, capture_output=True, text=True, check=True)
                lines = result.stdout.strip().split('\n') if result.stdout.strip() else []
                if fetch_one:
                    return tuple(lines[0].split('\t')) if lines else None
                else:
                    return [tuple(line.split('\t')) for line in lines] if lines else []
            except subprocess.CalledProcessError as e:
                self.log('ERROR', f'数据库查询失败: {sql} - {e.stderr}')
                return None
            except Exception as e:
                self.log('ERROR', f'数据库查询异常: {sql} - {e}')
                return None
            
    def login(self, username: str, password: str) -> Optional[str]:
        """登录获取token"""
        self.log('INFO', f'登录用户: {username}')
        try:
            response = requests.post(
                f"{API_BASE}/auth/login",
                json={'username': username, 'password': password},
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code == 200:
                data = response.json()
                token = data.get('token')
                if token:
                    self.log('SUCCESS', f'登录成功: {username} (token: {token[:20]}...)')
                    return token
                else:
                    self.log('ERROR', f'登录响应中没有token: {data}')
                    return None
            else:
                self.log('ERROR', f'登录失败: HTTP {response.status_code} - {response.text}')
                return None
        except Exception as e:
            self.log('ERROR', f'登录异常: {e}')
            return None
            
    def get_user_id(self, username: str) -> Optional[int]:
        """获取用户ID"""
        result = self.query_db(
            f"SELECT id FROM users WHERE username='{username}' LIMIT 1",
            fetch_one=True
        )
        if result:
            # 处理mysql命令行返回的字符串格式
            user_id = result[0] if isinstance(result[0], int) else int(result[0])
            return user_id
        return None
        
    def test_api_call(self, name: str, method: str, endpoint: str, 
                     token: Optional[str] = None, data: Optional[Dict] = None,
                     expected_status: int = 200) -> Optional[Any]:
        """测试API调用"""
        self.log('INFO', f'测试: {name}')
        self.log('INFO', f'请求: {method} {endpoint}')
        
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
            
        try:
            if method == 'GET':
                response = requests.get(f"{API_BASE}{endpoint}", headers=headers)
            elif method == 'POST':
                response = requests.post(f"{API_BASE}{endpoint}", headers=headers, json=data)
            elif method == 'PUT':
                response = requests.put(f"{API_BASE}{endpoint}", headers=headers, json=data)
            elif method == 'DELETE':
                response = requests.delete(f"{API_BASE}{endpoint}", headers=headers)
            else:
                self.log('ERROR', f'不支持的方法: {method}')
                return None
                
            if response.status_code == expected_status:
                self.log('SUCCESS', f'HTTP状态码: {response.status_code}')
                try:
                    return response.json()
                except:
                    return response.text
            else:
                self.log('ERROR', f'HTTP状态码不匹配: 期望 {expected_status}, 实际 {response.status_code}')
                self.log('ERROR', f'响应: {response.text[:200]}')
                return None
        except Exception as e:
            self.log('ERROR', f'API调用异常: {e}')
            return None
            
    def verify_db(self, name: str, sql: str, expected_count: int = 1, 
                  description: str = None) -> bool:
        """验证数据库数据"""
        if description:
            self.log('INFO', f'验证数据库: {description}')
        result = self.query_db(sql)
        if result is not None:
            # 处理不同的返回格式
            if isinstance(result, list):
                count = len(result)
            elif result:
                count = 1
            else:
                count = 0
                
            if count == expected_count:
                self.log('SUCCESS', f'数据库验证通过: 期望 {expected_count}, 实际 {count}')
                return True
            else:
                self.log('ERROR', f'数据库验证失败: 期望 {expected_count}, 实际 {count}')
                if result:
                    self.log('INFO', f'查询结果: {result}')
                return False
        return False
        
    def record_test(self, name: str, passed: bool, message: str = "", 
                   api_response: Any = None, db_data: Any = None):
        """记录测试结果"""
        self.test_results.append(TestResult(
            name=name,
            passed=passed,
            message=message,
            api_response=api_response,
            db_data=db_data
        ))
        if passed:
            self.log('SUCCESS', f'✓ {name}: {message}')
        else:
            self.log('ERROR', f'✗ {name}: {message}')
            
    def phase1_login(self):
        """阶段1: 用户登录"""
        self.log('PHASE', '=' * 50)
        self.log('PHASE', TestPhase.LOGIN.value)
        self.log('PHASE', '=' * 50)
        
        # 登录所有用户
        for user_key, user_info in self.users.items():
            token = self.login(user_info['username'], user_info['password'])
            if token:
                user_id = self.get_user_id(user_info['username'])
                self.users[user_key]['token'] = token
                self.users[user_key]['user_id'] = user_id
                self.log('INFO', f'用户 {user_info["username"]} ID: {user_id}')
                self.record_test(
                    f"登录用户 {user_info['username']}",
                    True,
                    f"Token获取成功, UserID: {user_id}"
                )
            else:
                self.record_test(
                    f"登录用户 {user_info['username']}",
                    False,
                    "登录失败"
                )
                
        print()
        
    def phase2_create_messages(self):
        """阶段2: 创建消息"""
        self.log('PHASE', '=' * 50)
        self.log('PHASE', TestPhase.CREATE.value)
        self.log('PHASE', '=' * 50)
        
        # 用户1创建消息
        user1 = self.users['tongyexin']
        create_data = {
            'senderType': 'user',
            'senderId': user1['user_id'],
            'senderName': 'tongyexin',
            'messageType': 'text',
            'messageCategory': 'user_message',
            'title': '测试消息-用户1',
            'content': '这是用户1创建的测试消息内容',
            'isRead': False,
            'isImportant': False,
            'isStarred': False
        }
        
        response = self.test_api_call(
            '用户1创建消息',
            'POST',
            '/mailbox/messages',
            user1['token'],
            create_data
        )
        
        if response and 'id' in response:
            message_id = response['id']
            self.created_message_ids.append(message_id)
            
            # 验证数据库
            db_ok = self.verify_db(
                '验证创建的消息',
                f"SELECT id FROM mailbox_messages WHERE id={message_id} AND receiver_id={user1['user_id']} AND title='测试消息-用户1'",
                1,
                f"消息ID {message_id} 应在数据库中"
            )
            
            self.record_test(
                '用户1创建消息',
                db_ok,
                f"消息ID: {message_id}",
                response
            )
        else:
            self.record_test('用户1创建消息', False, "API调用失败或响应无效")
            
        print()
        
    def print_summary(self):
        """打印测试摘要"""
        print()
        print('=' * 50)
        print('测试摘要')
        print('=' * 50)
        
        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r.passed)
        failed = total - passed
        
        print(f'总测试数: {total}')
        print(f'{Colors.GREEN}通过: {passed}{Colors.NC}')
        print(f'{Colors.RED}失败: {failed}{Colors.NC}')
        print()
        
        if failed > 0:
            print('失败的测试:')
            for result in self.test_results:
                if not result.passed:
                    print(f'  {Colors.RED}✗{Colors.NC} {result.name}: {result.message}')
        print('=' * 50)
        
    def run_all_phases(self):
        """运行所有测试阶段"""
        if not self.connect_db():
            return False
            
        try:
            # 阶段1: 登录
            self.phase1_login()
            
            # 询问是否继续
            input("\n按Enter继续下一阶段测试...")
            
            # 阶段2: 创建消息
            self.phase2_create_messages()
            
            # 打印摘要
            self.print_summary()
            
        finally:
            self.close_db()
            
        return True

if __name__ == '__main__':
    print(f'{Colors.CYAN}{"="*50}')
    print('邮箱API全面测试')
    print('='*50 + Colors.NC)
    print()
    
    tester = MailboxAPITester()
    tester.run_all_phases()
