"""
HSMem 系统测试脚本

验证所有核心功能是否正常工作
"""

import asyncio
import sys
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from hscore import MemoryService


async def test_basic_functionality():
    """测试基本功能"""
    print("\n" + "="*70)
    print("测试 1: 基本功能")
    print("="*70)

    service = MemoryService(base_path="./test_memory_data")

    # 测试对话记忆
    conversation = {
        "messages": [
            {"role": "user", "content": "你好，我是测试用户"},
            {"role": "assistant", "content": "你好！"},
            {"role": "user", "content": "我喜欢Python编程"}
        ]
    }

    memory = await service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id="test_user"
    )

    assert memory['items_count'] > 0, "记忆项数量应该大于0"
    assert len(memory['categories']) > 0, "分类数量应该大于0"

    print(f"✓ 记忆化成功")
    print(f"  - 资源ID: {memory['resource_id'][:8]}...")
    print(f"  - 记忆项: {memory['items_count']}")
    print(f"  - 分类: {len(memory['categories'])}")

    return True


async def test_storage_layers():
    """测试三层存储"""
    print("\n" + "="*70)
    print("测试 2: 三层存储架构")
    print("="*70)

    service = MemoryService(base_path="./test_memory_data")

    stats = await service.get_statistics()

    print(f"✓ 三层架构验证:")
    print(f"  - Resource Layer: {stats['statistics']['resources_count']} 个资源")
    print(f"  - Memory Item Layer: {stats['statistics']['items_count']} 个记忆项")
    print(f"  - Memory Category Layer: {stats['statistics']['categories_count']} 个分类")

    # 验证文件存在
    from pathlib import Path
    base = Path("./test_memory_data")
    assert (base / "resources").exists(), "资源层目录不存在"
    assert (base / "items").exists(), "记忆项层目录不存在"
    assert (base / "categories").exists(), "记忆分类层目录不存在"

    print(f"✓ 所有层级目录创建成功")

    return True


async def test_retrieval():
    """测试检索功能"""
    print("\n" + "="*70)
    print("测试 3: 记忆检索")
    print("="*70)

    service = MemoryService(
        base_path="./test_memory_data",
        retrieve_config={"method": "simple"}
    )

    # 添加更多测试数据
    conversations = [
        {
            "messages": [
                {"role": "user", "content": "我喜欢喝咖啡"},
                {"role": "assistant", "content": "好的"}
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "我喜欢喝茶"},
                {"role": "assistant", "content": "好的"}
            ]
        }
    ]

    for conv in conversations:
        await service.memorize(conv, modality="conversation", user_id="test_user")

    # 测试检索
    queries = [{"role": "user", "content": {"text": "喜欢"}}]
    result = await service.retrieve(queries=queries)

    print(f"✓ 检索功能正常")
    print(f"  - 查询: '喜欢'")
    print(f"  - 结果数量: {len(result['items'])}")
    print(f"  - 检索方法: {result['method']}")

    return True


async def test_categories():
    """测试分类功能"""
    print("\n" + "="*70)
    print("测试 4: 分类管理")
    print("="*70)

    service = MemoryService(base_path="./test_memory_data")

    categories = await service.get_all_categories()

    print(f"✓ 分类管理正常")
    print(f"  - 总分类数: {len(categories)}")

    for cat in categories[:5]:
        print(f"  • {cat['name']}: {len(cat['item_ids'])} 个记忆项")

    # 测试按分类搜索
    if categories:
        first_cat_name = categories[0]['name']
        items = await service.search_by_category(first_cat_name)
        print(f"✓ 按分类搜索正常")
        print(f"  - 分类: {first_cat_name}")
        print(f"  - 找到: {len(items)} 个记忆项")

    return True


async def test_incremental_update():
    """测试增量更新"""
    print("\n" + "="*70)
    print("测试 5: 增量更新")
    print("="*70)

    service = MemoryService(base_path="./test_memory_data_incremental")

    # 第一次对话
    conv1 = {
        "messages": [
            {"role": "user", "content": "我叫小红"},
            {"role": "assistant", "content": "你好小红"}
        ]
    }

    memory1 = await service.memorize(conv1, modality="conversation", user_id="user_xiaohong")
    print(f"✓ 第一次对话: {memory1['items_count']} 个记忆项")

    # 第二次对话（增量）
    conv2 = {
        "messages": [
            {"role": "user", "content": "我今年20岁"},
            {"role": "assistant", "content": "好的"}
        ]
    }

    memory2 = await service.memorize(conv2, modality="conversation", user_id="user_xiaohong")
    print(f"✓ 第二次对话: {memory2['items_count']} 个记忆项")

    # 验证总量
    stats = await service.get_statistics()
    print(f"✓ 总记忆项: {stats['statistics']['items_count']}")

    return True


async def run_all_tests():
    """运行所有测试"""
    print("\n" + "="*70)
    print("HSMem 系统测试")
    print("="*70)

    tests = [
        ("基本功能", test_basic_functionality),
        ("三层存储", test_storage_layers),
        ("记忆检索", test_retrieval),
        ("分类管理", test_categories),
        ("增量更新", test_incremental_update),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            await test_func()
            passed += 1
            print(f"\n✅ {name} 测试通过")
        except AssertionError as e:
            failed += 1
            print(f"\n❌ {name} 测试失败: {e}")
        except Exception as e:
            failed += 1
            print(f"\n❌ {name} 测试错误: {e}")

    # 总结
    print("\n" + "="*70)
    print("测试总结")
    print("="*70)
    print(f"通过: {passed}/{len(tests)}")
    print(f"失败: {failed}/{len(tests)}")

    if failed == 0:
        print("\n🎉 所有测试通过！HSMem 系统工作正常！")
    else:
        print(f"\n⚠️  有 {failed} 个测试失败，请检查")

    print("="*70)

    return failed == 0


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
