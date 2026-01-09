#!/usr/bin/env python3
"""
Mentis 流式消息测试脚本
测试 SSE (Server-Sent Events) 流式响应
"""

import requests
import json
import sys
import time

# 配置
BASE_URL = "http://localhost:8080"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

def login():
    """管理员登录"""
    print("[1/3] 管理员登录...")
    response = requests.post(
        f"{BASE_URL}/api/admin/auth/login",
        json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code != 200:
        print(f"✗ 登录失败: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    token = response.json().get("token")
    if not token:
        print("✗ 登录失败: 未获取到 token")
        sys.exit(1)
    
    print(f"✓ 登录成功")
    print(f"Token: {token[:20]}...")
    return token

def create_session(token):
    """创建会话"""
    print("\n[2/3] 创建会话...")
    response = requests.post(
        f"{BASE_URL}/api/admin/mentis/sessions",
        json={"title": "流式消息测试会话"},
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
    )
    
    if response.status_code != 200:
        print(f"✗ 创建会话失败: {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    session_id = response.json().get("data", {}).get("sessionId")
    if not session_id:
        print("✗ 创建会话失败: 未获取到 sessionId")
        sys.exit(1)
    
    print(f"✓ 会话创建成功")
    print(f"Session ID: {session_id}")
    return session_id

def test_stream_message(token, session_id, message):
    """测试流式消息"""
    print(f"\n[3/3] 发送流式消息: {message}")
    print("-" * 50)
    
    url = f"{BASE_URL}/api/admin/mentis/chat/stream"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    data = {
        "sessionId": session_id,
        "message": message,
        "enableComputerUse": False
    }
    
    try:
        response = requests.post(
            url,
            json=data,
            headers=headers,
            stream=True,
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"✗ 请求失败: {response.status_code}")
            print(response.text)
            return False
        
        print("✓ 流式连接建立成功")
        print("\n接收到的数据:")
        print("-" * 50)
        
        chunk_count = 0
        for line in response.iter_lines(decode_unicode=True):
            if line:
                chunk_count += 1
                print(f"[Chunk {chunk_count}] {line}")
                
                # 解析 SSE 数据
                if line.startswith("data: "):
                    try:
                        json_data = json.loads(line[6:])
                        if "response" in json_data:
                            print(f"  响应内容: {json_data['response'][:100]}...")
                    except json.JSONDecodeError:
                        pass
                
                # 限制显示前 20 个 chunk
                if chunk_count >= 20:
                    print("\n... (已接收 20 个 chunk，继续接收...)")
                    break
        
        print("-" * 50)
        print(f"✓ 总共接收到 {chunk_count} 个数据块")
        return True
        
    except requests.exceptions.Timeout:
        print("✗ 请求超时")
        return False
    except Exception as e:
        print(f"✗ 发生错误: {e}")
        return False

def main():
    """主函数"""
    print("=" * 50)
    print("Mentis 流式消息测试")
    print("=" * 50)
    
    # 登录
    token = login()
    
    # 创建会话
    session_id = create_session(token)
    
    # 测试不同的消息
    test_messages = [
        "你好，Mentis",
        "帮我执行 ls -la 命令",
        "介绍一下你的功能"
    ]
    
    for i, msg in enumerate(test_messages, 1):
        print(f"\n{'=' * 50}")
        print(f"测试 {i}/{len(test_messages)}")
        print(f"{'=' * 50}")
        test_stream_message(token, session_id, msg)
        time.sleep(1)  # 短暂延迟
    
    print("\n" + "=" * 50)
    print("测试完成！")
    print("=" * 50)

if __name__ == "__main__":
    main()
