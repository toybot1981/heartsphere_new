#!/usr/bin/env python3
"""
简单的 API 测试脚本
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_api():
    print("="*70)
    print("  HSMem REST API 测试")
    print("="*70)

    # 1. 健康检查
    print("\n[1] 健康检查...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ 状态: {response.status_code}")
        print(f"   响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
    except Exception as e:
        print(f"❌ 错误: {e}")
        return

    # 2. 记忆化对话
    print("\n[2] 记忆化对话...")
    data = {
        "messages": [
            {"role": "user", "content": {"text": "你好，我叫张伟"}},
            {"role": "assistant", "content": {"text": "你好张伟！"}},
            {"role": "user", "content": {"text": "我喜欢篮球和音乐"}}
        ],
        "user_id": "user_zhangwei"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/memory/memorize/conversation",
            json=data
        )
        print(f"✅ 状态: {response.status_code}")
        result = response.json()
        print(f"   资源ID: {result['data']['resource_id'][:8]}...")
        print(f"   记忆项: {result['data']['items_count']}")
        print(f"   分类数: {len(result['data']['categories'])}")
    except Exception as e:
        print(f"❌ 错误: {e}")
        return

    # 3. 获取统计
    print("\n[3] 获取统计信息...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/memory/statistics")
        print(f"✅ 状态: {response.status_code}")
        stats = response.json()['data']['statistics']
        print(f"   资源数: {stats['resources_count']}")
        print(f"   记忆项数: {stats['items_count']}")
        print(f"   分类数: {stats['categories_count']}")
    except Exception as e:
        print(f"❌ 错误: {e}")

    # 4. 获取分类
    print("\n[4] 获取分类列表...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/memory/categories")
        print(f"✅ 状态: {response.status_code}")
        categories = response.json()['data']['categories']
        print(f"   分类总数: {len(categories)}")
        for cat in categories[:5]:
            print(f"   • {cat['name']}: {len(cat['item_ids'])} 个记忆项")
    except Exception as e:
        print(f"❌ 错误: {e}")

    # 5. 检索记忆
    print("\n[5] 检索记忆...")
    data = {
        "queries": [
            {"role": "user", "content": {"text": "张伟喜欢什么？"}}
        ]
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/memory/retrieve",
            json=data
        )
        print(f"✅ 状态: {response.status_code}")
        result = response.json()
        items = result['data']['items']
        print(f"   找到 {len(items)} 个相关记忆")
    except Exception as e:
        print(f"❌ 错误: {e}")

    print("\n" + "="*70)
    print("✅ 测试完成！")
    print("="*70)
    print(f"\n💡 访问 {BASE_URL}/docs 查看完整 API 文档\n")


if __name__ == "__main__":
    # 等待服务器启动
    time.sleep(1)
    test_api()
