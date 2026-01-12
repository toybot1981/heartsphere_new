"""
HSMem REST API 客户端测试脚本

测试所有 REST API 接口
"""

import requests
import json
from typing import Dict, Any


# API 基础 URL
BASE_URL = "http://localhost:8000"


def print_section(title: str):
    """打印分节标题"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def print_response(api_name: str, response: Dict[str, Any], status_code: int):
    """打印 API 响应"""
    icon = "✅" if status_code == 200 else "❌"
    print(f"\n{icon} {api_name}")
    print(f"   状态码: {status_code}")
    print("-" * 70)
    print(json.dumps(response, ensure_ascii=False, indent=2))
    print("-" * 70)


def test_health_check():
    """测试健康检查"""
    print_section("1️⃣  健康检查 API")

    response = requests.get(f"{BASE_URL}/health")
    print_response("GET /health", response.json(), response.status_code)


def test_memorize_conversation():
    """测试记忆化对话"""
    print_section("2️⃣  记忆化对话 API")

    url = f"{BASE_URL}/api/v1/memory/memorize/conversation"
    data = {
        "messages": [
            {"role": "user", "content": {"text": "你好，我是小红"}},
            {"role": "assistant", "content": {"text": "你好小红！"}},
            {"role": "user", "content": {"text": "我喜欢绘画和音乐"}}
        ],
        "user_id": "user_xiaohong"
    }

    response = requests.post(url, json=data)
    print_response("POST /api/v1/memory/memorize/conversation", response.json(), response.status_code)

    return response.json().get('data', {})


def test_memorize_text():
    """测试记忆化文本"""
    print_section("3️⃣  记忆化文本 API")

    url = f"{BASE_URL}/api/v1/memory/memorize/text"
    data = {
        "text": "FastAPI 是一个现代、快速的 Python Web 框架",
        "context": {"topic": "programming", "framework": "FastAPI"}
    }

    response = requests.post(url, json=data)
    print_response("POST /api/v1/memory/memorize/text", response.json(), response.status_code)


def test_memorize_document():
    """测试记忆化文档"""
    print_section("4️⃣  记忆化文档 API")

    url = f"{BASE_URL}/api/v1/memory/memorize/document"
    data = {
        "title": "Python 编程入门",
        "content": "Python 是一种广泛使用的高级编程语言",
        "author": "AI Assistant"
    }

    response = requests.post(url, json=data)
    print_response("POST /api/v1/memory/memorize/document", response.json(), response.status_code)


def test_retrieve():
    """测试检索"""
    print_section("5️⃣  检索 API")

    url = f"{BASE_URL}/api/v1/memory/retrieve"
    data = {
        "queries": [
            {"role": "user", "content": {"text": "小红喜欢什么？"}}
        ],
        "limit": 5
    }

    response = requests.post(url, json=data)
    print_response("POST /api/v1/memory/retrieve", response.json(), response.status_code)


def test_retrieve_with_filter():
    """测试带过滤条件的检索"""
    print_section("6️⃣  带过滤的检索 API")

    url = f"{BASE_URL}/api/v1/memory/retrieve"
    data = {
        "queries": [
            {"role": "user", "content": {"text": "绘画"}}
        ],
        "where": {"user_id": "user_xiaohong"},
        "limit": 10
    }

    response = requests.post(url, json=data)
    print_response("POST /api/v1/memory/retrieve (filtered)", response.json(), response.status_code)


def test_statistics():
    """测试统计信息"""
    print_section("7️⃣  统计信息 API")

    response = requests.get(f"{BASE_URL}/api/v1/memory/statistics")
    print_response("GET /api/v1/memory/statistics", response.json(), response.status_code)


def test_get_categories():
    """测试获取所有分类"""
    print_section("8️⃣  获取分类 API")

    response = requests.get(f"{BASE_URL}/api/v1/memory/categories")
    result = response.json()

    # 只显示前5个分类
    if result.get('success') and 'data' in result:
        data = result['data']
        if 'categories' in data:
            data['categories'] = data['categories'][:5]
            data['total'] = len(data['categories'])

    print_response("GET /api/v1/memory/categories", result, response.status_code)


def test_get_category_items():
    """测试获取分类下的记忆项"""
    print_section("9️⃣  获取分类项 API")

    # 先获取一个分类名称
    response = requests.get(f"{BASE_URL}/api/v1/memory/categories")
    result = response.json()

    if result.get('success') and 'data' in result:
        categories = result['data'].get('categories', [])
        if categories:
            category_name = categories[0]['name']
            url = f"{BASE_URL}/api/v1/memory/categories/{category_name}"
            response = requests.get(url)
            print_response(f"GET /api/v1/memory/categories/{category_name}",
                         response.json(), response.status_code)
        else:
            print("\n⚠️  没有可用的分类")
    else:
        print("\n⚠️  无法获取分类列表")


def test_batch_operations():
    """测试批量操作"""
    print_section("🔟  批量操作 API")

    conversations = [
        {
            "messages": [
                {"role": "user", "content": {"text": "我叫小明"}}
            ],
            "user_id": "user_xiaoming"
        },
        {
            "messages": [
                {"role": "user", "content": {"text": "我喜欢篮球"}}
            ],
            "user_id": "user_xiaoming"
        }
    ]

    results = []
    for i, conv in enumerate(conversations, 1):
        url = f"{BASE_URL}/api/v1/memory/memorize/conversation"
        response = requests.post(url, json=conv)
        results.append({
            "conversation": i,
            "status_code": response.status_code,
            "success": response.json().get('success', False)
        })

    print_response("POST /api/v1/memory/memorize (batch)", {
        "total_conversations": len(conversations),
        "results": results
    }, 200)


def main():
    """主测试函数"""
    print("\n" + "="*70)
    print("  🚀 HSMem REST API 客户端测试")
    print("="*70)
    print(f"\n📍 API 服务器: {BASE_URL}")
    print(f"📚 API 文档: {BASE_URL}/docs")

    try:
        # 1. 健康检查
        test_health_check()

        # 2. 记忆化对话
        test_memorize_conversation()

        # 3. 记忆化文本
        test_memorize_text()

        # 4. 记忆化文档
        test_memorize_document()

        # 5. 检索
        test_retrieve()

        # 6. 带过滤的检索
        test_retrieve_with_filter()

        # 7. 统计信息
        test_statistics()

        # 8. 获取分类
        test_get_categories()

        # 9. 获取分类项
        test_get_category_items()

        # 10. 批量操作
        test_batch_operations()

        # 总结
        print_section("✅  测试完成")
        print("\n所有 API 测试已执行！")
        print(f"\n💡 访问 {BASE_URL}/docs 查看完整的 API 文档")
        print("="*70)

    except requests.exceptions.ConnectionError:
        print("\n❌ 错误: 无法连接到 API 服务器")
        print("\n💡 请先启动服务器:")
        print("   python3 rest_api_server.py")
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
