"""
示例 2: 记忆检索

演示不同的检索策略和查询方式
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from hscore import MemoryService


async def setup_sample_data(service):
    """设置示例数据"""
    conversations = [
        {
            "messages": [
                {"role": "user", "content": "我喜欢喝拿铁咖啡"},
                {"role": "assistant", "content": "好的，记住了"},
                {"role": "user", "content": "我每天早上都要喝一杯"},
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "我正在学习Python编程"},
                {"role": "assistant", "content": "很好的选择"},
                {"role": "user", "content": "我觉得Python很简洁易学"},
            ]
        },
        {
            "messages": [
                {"role": "user", "content": "我喜欢爵士音乐"},
                {"role": "assistant", "content": "爵士乐很有品味"},
                {"role": "user", "content": "特别是Miles Davis的作品"},
            ]
        }
    ]

    for i, conv in enumerate(conversations):
        await service.memorize(
            resource_data=conv,
            modality="conversation",
            user_id="demo_user"
        )
        print(f"✓ 已加载示例对话 {i + 1}")


async def main():
    print("=" * 70)
    print("示例 2: 记忆检索")
    print("=" * 70)

    # 初始化服务
    service = MemoryService(
        base_path="./memory_data_retrieval",
        retrieve_config={"method": "simple"}
    )

    # 加载示例数据
    print("\n[加载示例数据]")
    await setup_sample_data(service)

    # 测试 1: 简单查询
    print("\n[测试 1: 简单查询]")
    queries = [{"role": "user", "content": {"text": "咖啡"}}]
    result = await service.retrieve(queries=queries)
    print(f"查询: '咖啡'")
    print(f"结果: {len(result['items'])} 个相关记忆")

    # 测试 2: 多轮查询
    print("\n[测试 2: 多轮查询]")
    queries = [
        {"role": "user", "content": {"text": "我喜欢什么音乐？"}},
        {"role": "assistant", "content": {"text": "根据记忆，你喜欢爵士音乐"}},
        {"role": "user", "content": {"text": "具体是谁的作品？"}}
    ]
    result = await service.retrieve(queries=queries)
    print(f"多轮查询结果: {len(result['items'])} 个相关记忆")

    # 测试 3: 按分类检索
    print("\n[测试 3: 按分类检索]")
    categories = await service.get_all_categories()
    print(f"所有分类:")
    for cat in categories:
        print(f"  • {cat['name']}: {len(cat['item_ids'])} 个记忆项")

    # 测试 4: 带过滤条件的检索
    print("\n[测试 4: 带用户过滤的检索]")
    queries = [{"role": "user", "content": {"text": "学习"}}]
    result = await service.retrieve(
        queries=queries,
        where={"user_id": "demo_user"}
    )
    print(f"查询: '学习' (用户: demo_user)")
    print(f"结果: {len(result['items'])} 个相关记忆")

    # 统计信息
    print("\n[系统统计]")
    stats = await service.get_statistics()
    for key, value in stats['statistics'].items():
        print(f"  • {key}: {value}")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
