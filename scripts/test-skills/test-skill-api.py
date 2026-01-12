#!/usr/bin/env python3
"""
日常生活助手技能API测试脚本
通过API调用测试技能激活和执行

使用方法:
    python test-skill-api.py

环境变量:
    API_BASE_URL: API服务器地址（默认: http://localhost:8081）
    FRONTEND_URL: 前端应用地址（默认: http://localhost:3000）
    TEST_USER_TOKEN: 测试用户认证Token
"""

import os
import json
import requests
import time
from datetime import datetime
from typing import Dict, List, Optional

# 配置
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8081')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
TEST_USER_TOKEN = os.getenv('TEST_USER_TOKEN', '')

# 测试结果存储
RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'data', 'results')
TEST_CASES_FILE = os.path.join(os.path.dirname(__file__), 'data', 'test-cases.json')

def ensure_dir(dir_path: str):
    """确保目录存在"""
    os.makedirs(dir_path, exist_ok=True)

def load_test_cases() -> Dict:
    """加载测试用例"""
    if not os.path.exists(TEST_CASES_FILE):
        print(f"警告: 测试用例文件不存在: {TEST_CASES_FILE}")
        return {"characters": []}
    
    with open(TEST_CASES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def send_message(character_id: str, message: str) -> Dict:
    """发送消息到AI对话API"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {TEST_USER_TOKEN}'
    }
    
    url = f"{API_BASE_URL}/api/chat/send"
    data = {
        'characterId': character_id,
        'message': message
    }
    
    start_time = time.time()
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            return {
                'success': True,
                'response': response.json(),
                'responseTime': response_time
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}: {response.text}",
                'responseTime': response_time
            }
    except Exception as e:
        response_time = time.time() - start_time
        return {
            'success': False,
            'error': str(e),
            'responseTime': response_time
        }

def check_skill_activation(response: Dict, expected_skill_name: str) -> Dict:
    """检查技能是否被激活"""
    # 这里需要根据实际的API响应格式来解析
    # 示例：检查响应中是否包含技能名称
    response_text = json.dumps(response)
    
    skill_displayed = f'应用了 {expected_skill_name} 技能' in response_text or \
                     f'✨ 应用了 {expected_skill_name} 技能' in response_text
    
    function_calling_triggered = 'functionCalling' in response_text or \
                                'skillId' in response_text
    
    return {
        'skillActivated': skill_displayed or function_calling_triggered,
        'skillNameDisplayed': skill_displayed,
        'functionCallingTriggered': function_calling_triggered
    }

def execute_test_case(character: Dict, skill: Dict, prompt: Dict) -> Dict:
    """执行单个测试用例"""
    test_id = f"TC-{character['name'].upper()}-{skill['id'].upper()}-{prompt['type'].upper()}"
    
    print(f"执行测试: {test_id}")
    print(f"  角色: {character['name']}")
    print(f"  技能: {skill['name']}")
    print(f"  话术: {prompt['text']}")
    
    # 发送消息
    result = send_message(character['id'], prompt['text'])
    
    if not result['success']:
        return {
            'testId': test_id,
            'character': character['name'],
            'skillId': skill['id'],
            'skillName': skill['name'],
            'testType': prompt['type'],
            'prompt': prompt['text'],
            'status': 'failed',
            'errorType': 'api_error',
            'errorMessage': result.get('error', 'Unknown error'),
            'responseTime': result.get('responseTime', 0),
            'testTime': datetime.now().isoformat()
        }
    
    # 检查技能激活
    activation_check = check_skill_activation(result['response'], skill['name'])
    
    return {
        'testId': test_id,
        'character': character['name'],
        'skillId': skill['id'],
        'skillName': skill['name'],
        'testType': prompt['type'],
        'prompt': prompt['text'],
        'status': 'success' if activation_check['skillActivated'] else 'failed',
        'functionCallingTriggered': activation_check['functionCallingTriggered'],
        'skillNameDisplayed': activation_check['skillNameDisplayed'],
        'responseTime': result['responseTime'],
        'errorType': None if activation_check['skillActivated'] else 'skill_not_activated',
        'errorMessage': None if activation_check['skillActivated'] else '技能未激活',
        'testTime': datetime.now().isoformat()
    }

def run_tests():
    """运行所有测试"""
    print("=" * 60)
    print("日常生活助手技能测试")
    print("=" * 60)
    print(f"API地址: {API_BASE_URL}")
    print(f"测试时间: {datetime.now().isoformat()}")
    print()
    
    # 加载测试用例
    test_cases = load_test_cases()
    if not test_cases.get('characters'):
        print("错误: 没有找到测试用例")
        return
    
    # 执行测试
    results = []
    total_cases = 0
    
    for character in test_cases['characters']:
        print(f"\n测试角色: {character['name']}")
        print("-" * 60)
        
        for skill in character.get('skills', []):
            for prompt in skill.get('prompts', []):
                total_cases += 1
                result = execute_test_case(character, skill, prompt)
                results.append(result)
                
                # 打印结果
                status_icon = "✅" if result['status'] == 'success' else "❌"
                print(f"  {status_icon} {result['testId']}: {result['status']} ({result['responseTime']:.2f}s)")
                
                # 等待一段时间，避免请求过快
                time.sleep(1)
    
    # 保存结果
    ensure_dir(RESULTS_DIR)
    result_file = os.path.join(RESULTS_DIR, f"results-{datetime.now().strftime('%Y-%m-%d')}.json")
    
    summary = {
        'testDate': datetime.now().strftime('%Y-%m-%d'),
        'totalCases': total_cases,
        'successCases': sum(1 for r in results if r['status'] == 'success'),
        'failedCases': sum(1 for r in results if r['status'] == 'failed'),
        'passRate': (sum(1 for r in results if r['status'] == 'success') / total_cases * 100) if total_cases > 0 else 0
    }
    
    output = {
        'testDate': summary['testDate'],
        'testSummary': summary,
        'results': results
    }
    
    with open(result_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)
    print(f"总用例数: {summary['totalCases']}")
    print(f"成功数: {summary['successCases']}")
    print(f"失败数: {summary['failedCases']}")
    print(f"通过率: {summary['passRate']:.2f}%")
    print(f"\n结果已保存到: {result_file}")

if __name__ == '__main__':
    if not TEST_USER_TOKEN:
        print("错误: 请设置环境变量 TEST_USER_TOKEN")
        exit(1)
    
    run_tests()
