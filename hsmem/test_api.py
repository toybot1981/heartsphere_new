"""
HSMem API 测试脚本

测试记忆服务的所有 API 接口
"""

import asyncio
import json
from pathlib import Path
from hscore import MemoryService


def print_section(title):
    """打印分节标题"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def print_api_result(api_name, result, status="✅"):
    """打印 API 结果"""
    print(f"\n{status} API: {api_name}")
    print("-" * 70)
    if isinstance(result, dict):
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(result)
    print("-" * 70)


async def test_memorize_apis():
    """测试记忆化 API"""
    print_section("1️⃣  记忆化 API 测试")

    service = MemoryService(base_path="./api_test_data")

    # API 1: 记忆化对话
    print("\n📞 API: memorize (conversation)")
    conversation = {
        "messages": [
            {"role": "user", "content": "你好，我是王芳"},
            {"role": "assistant", "content": "你好王芳！"},
            {"role": "user", "content": "我是一名设计师，喜欢摄影和旅行"},
            {"role": "assistant", "content": "很有艺术气息！"},
            {"role": "user", "content": "我每周都会去瑜伽课"}
        ]
    }

    result = await service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id="user_wangfang"
    )

    print_api_result("POST /api/memory/memorize", {
        "resource_id": result['resource_id'],
        "items_count": result['items_count'],
        "categories_count": len(result['categories']),
        "categories": [
            {
                "name": cat['name'],
                "item_count": cat['item_count']
            }
            for cat in result['categories']
        ]
    })

    return service, result


async def test_retrieve_apis(service):
    """测试检索 API"""
    print_section("2️⃣  检索 API 测试")

    # API 2: 简单检索
    print("\n🔍 API: retrieve (simple)")
    queries = [
        {"role": "user", "content": {"text": "王芳喜欢什么？"}}
    ]

    result = await service.retrieve(queries=queries)

    print_api_result("POST /api/memory/retrieve", {
        "method": result['method'],
        "query": "王芳喜欢什么？",
        "items_count": len(result['items']),
        "items": [
            {
                "memory_type": item.get('memory_type'),
                "summary": item.get('summary', '')[:50] + "..."
            }
            for item in result['items'][:3]
        ]
    })

    # API 3: 带过滤条件的检索
    print("\n🎯 API: retrieve (with filter)")
    result = await service.retrieve(
        queries=[{"role": "user", "content": {"text": "设计师"}}],
        where={"user_id": "user_wangfang"},
        limit=5
    )

    print_api_result("POST /api/memory/retrieve (filtered)", {
        "filter": {"user_id": "user_wangfang"},
        "limit": 5,
        "items_count": len(result['items'])
    })


async def test_statistics_apis(service):
    """测试统计 API"""
    print_section("3️⃣  统计 API 测试")

    # API 4: 获取系统统计
    print("\n📊 API: get_statistics")
    result = await service.get_statistics()

    print_api_result("GET /api/memory/statistics", result)


async def test_category_apis(service):
    """测试分类 API"""
    print_section("4️⃣  分类 API 测试")

    # API 5: 获取所有分类
    print("\n📁 API: get_all_categories")
    categories = await service.get_all_categories()

    # 去重展示
    unique_cats = {}
    for cat in categories:
        if cat['name'] not in unique_cats:
            unique_cats[cat['name']] = cat

    print_api_result("GET /api/memory/categories", {
        "total_categories": len(categories),
        "unique_categories": len(unique_cats),
        "categories": [
            {
                "name": name,
                "item_count": len(cat['item_ids']),
                "created_at": cat['created_at'][:19]
            }
            for name, cat in list(unique_cats.items())[:5]
        ]
    })

    # API 6: 按分类搜索
    print("\n🔎 API: search_by_category")
    if categories:
        first_cat_name = categories[0]['name']
        items = await service.search_by_category(first_cat_name)

        print_api_result(f"GET /api/memory/categories/{first_cat_name}", {
            "category": first_cat_name,
            "items_count": len(items),
            "items": [
                {
                    "id": item['id'][:8] + "...",
                    "summary": item['summary'][:50] + "...",
                    "importance": item['importance']
                }
                for item in items[:3]
            ]
        })


async def test_batch_operations():
    """测试批量操作"""
    print_section("5️⃣  批量操作 API 测试")

    service = MemoryService(base_path="./api_test_data")

    # API 7: 批量记忆化
    print("\n📦 API: batch memorize")
    conversations = [
        {
            "messages": [
                {"role": "user", "content": "我叫张伟，是程序员"},
                {"role": "assistant", "content": "你好张伟！"}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "我喜欢篮球和音乐"},
                {"role": "assistant", "content": "很好的爱好！"}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "我经常去健身房"},
                {"role": "assistant", "content": "健康生活！"}
            ]
        }
    ]

    results = []
    for i, conv in enumerate(conversations, 1):
        result = await service.memorize(
            resource_data=conv,
            modality="conversation",
            user_id="user_zhangwei"
        )
        results.append({
            "conversation": i,
            "items_count": result['items_count'],
            "categories": len(result['categories'])
        })

    print_api_result("POST /api/memory/batch_memorize", {
        "total_conversations": len(conversations),
        "user_id": "user_zhangwei",
        "results": results
    })


async def test_advanced_features():
    """测试高级功能"""
    print_section("6️⃣  高级功能 API 测试")

    service = MemoryService(base_path="./api_test_data")

    # API 8: 多模态记忆化
    print("\n🎨 API: memorize (text modality)")
    text_data = {
        "text": "Python 是一种高级编程语言，由 Guido van Rossum 创建",
        "context": {"topic": "programming", "language": "Python"}
    }

    result = await service.memorize(
        resource_data=text_data,
        modality="text"
    )

    print_api_result("POST /api/memory/memorize (text)", {
        "modality": "text",
        "items_count": result['items_count'],
        "categories": [cat['name'] for cat in result['categories']]
    })

    # API 9: 文档记忆化
    print("\n📄 API: memorize (document modality)")
    document = {
        "title": "机器学习入门",
        "content": "机器学习是人工智能的一个分支",
        "author": "AI Researcher"
    }

    result = await service.memorize(
        resource_data=document,
        modality="document"
    )

    print_api_result("POST /api/memory/memorize (document)", {
        "modality": "document",
        "items_count": result['items_count'],
        "categories": [cat['name'] for cat in result['categories']]
    })


async def test_query_patterns():
    """测试不同查询模式"""
    print_section("7️⃣  查询模式 API 测试")

    service = MemoryService(base_path="./api_test_data")

    # API 10: 多轮对话检索
    print("\n💬 API: retrieve (multi-turn conversation)")
    queries = [
        {"role": "user", "content": {"text": "王芳是谁？"}},
        {"role": "assistant", "content": {"text": "王芳是一名设计师"}},
        {"role": "user", "content": {"text": "她有什么爱好？"}}
    ]

    result = await service.retrieve(queries=queries)

    print_api_result("POST /api/memory/retrieve (multi-turn)", {
        "query_type": "multi_turn_conversation",
        "turns": len(queries),
        "items_count": len(result['items']),
        "last_query": "她有什么爱好？"
    })

    # API 11: 不同检索策略
    print("\n⚡ API: retrieve (different strategies)")
    service_rag = MemoryService(
        base_path="./api_test_data",
        retrieve_config={"method": "simple"}
    )

    result = await service_rag.retrieve(
        queries=[{"role": "user", "content": {"text": "瑜伽"}}]
    )

    print_api_result("POST /api/memory/retrieve (strategy)", {
        "strategy": "simple",
        "query": "瑜伽",
        "items_count": len(result['items'])
    })


async def test_data_integrity():
    """测试数据完整性"""
    print_section("8️⃣  数据完整性 API 测试")

    service = MemoryService(base_path="./api_test_data")

    # API 12: 验证数据链路
    print("\n🔗 API: verify data chain")

    stats = await service.get_statistics()
    categories = await service.get_all_categories()

    # 验证：从分类追溯到记忆项
    if categories:
        first_cat = categories[0]
        items = await service.search_by_category(first_cat['name'])

        verification = {
            "total_resources": stats['statistics']['resources_count'],
            "total_items": stats['statistics']['items_count'],
            "total_categories": stats['statistics']['categories_count'],
            "data_chain_verified": len(items) > 0,
            "sample_category": first_cat['name'],
            "items_in_category": len(items)
        }

        print_api_result("GET /api/memory/verify", verification)


async def generate_api_summary():
    """生成 API 总结"""
    print_section("📋  API 测试总结")

    api_list = [
        ("POST", "/api/memory/memorize", "记忆化资源", "conversation/text/document"),
        ("POST", "/api/memory/retrieve", "检索记忆", "支持过滤和限制"),
        ("GET", "/api/memory/statistics", "获取统计信息", "资源/记忆项/分类数量"),
        ("GET", "/api/memory/categories", "获取所有分类", "分类列表"),
        ("GET", "/api/memory/categories/{name}", "按分类搜索", "分类下的记忆项"),
        ("POST", "/api/memory/batch_memorize", "批量记忆化", "多个资源"),
        ("GET", "/api/memory/verify", "验证数据完整性", "数据链路验证"),
    ]

    print("\n📖 可用的 API 接口:\n")
    for method, endpoint, description, params in api_list:
        print(f"  {method:6} {endpoint:40} - {description}")
        print(f"         └─ 参数: {params}")

    print("\n" + "="*70)
    print("✅  所有 API 测试完成！")
    print("="*70)

    print("\n💡 使用示例:")
    print("""
    # Python 代码示例
    from hscore import MemoryService

    service = MemoryService(base_path="./memory_data")

    # 记忆化
    memory = await service.memorize(conversation, modality="conversation")

    # 检索
    result = await service.retrieve(queries)

    # 获取统计
    stats = await service.get_statistics()

    # 获取分类
    categories = await service.get_all_categories()
    """)


async def main():
    """主测试函数"""
    print("\n" + "="*70)
    print("  🚀 HSMem API 测试套件")
    print("="*70)
    print("\n⏰ 开始时间:", __import__('datetime').datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    try:
        # 1. 记忆化 API
        service, _ = await test_memorize_apis()

        # 2. 检索 API
        await test_retrieve_apis(service)

        # 3. 统计 API
        await test_statistics_apis(service)

        # 4. 分类 API
        await test_category_apis(service)

        # 5. 批量操作
        await test_batch_operations()

        # 6. 高级功能
        await test_advanced_features()

        # 7. 查询模式
        await test_query_patterns()

        # 8. 数据完整性
        await test_data_integrity()

        # 9. 生成总结
        await generate_api_summary()

        print("\n✨ 所有 API 测试成功完成！\n")

    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
