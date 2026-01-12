"""
示例 1: 对话记忆处理

演示如何从对话中提取和记忆化用户信息
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from hscore import MemoryService


async def main():
    print("=" * 70)
    print("示例 1: 对话记忆处理")
    print("=" * 70)

    # 初始化服务
    service = MemoryService(
        base_path="./memory_data_conversation",
        retrieve_config={"method": "simple"}
    )

    # 示例对话 1: 初次见面
    conversation1 = {
        "messages": [
            {"role": "user", "content": "你好，我叫王芳，是一名产品经理"},
            {"role": "assistant", "content": "你好王芳！很高兴认识你"},
            {"role": "user", "content": "我在一家科技公司工作，负责AI产品的规划"},
            {"role": "assistant", "content": "听起来很有挑战性的工作"},
            {"role": "user", "content": "是的，但我很享受。我平时喜欢阅读科技新闻"}
        ]
    }

    # 示例对话 2: 后续交流
    conversation2 = {
        "messages": [
            {"role": "user", "content": "我最近在学习机器学习"},
            {"role": "assistant", "content": "很好的方向！"},
            {"role": "user", "content": "我希望能够更好地理解AI技术，帮助我做出更好的产品决策"},
            {"role": "assistant", "content": "这确实很重要"},
            {"role": "user", "content": "每天下班后我都会花一小时学习"}
        ]
    }

    # 记忆化第一个对话
    print("\n[处理对话 1]")
    memory1 = await service.memorize(
        resource_data=conversation1,
        modality="conversation",
        user_id="user_wangfang"
    )
    print(f"✓ 提取了 {memory1['items_count']} 个记忆项")
    for cat in memory1['categories']:
        print(f"  - {cat['name']}")

    # 记忆化第二个对话（增量更新）
    print("\n[处理对话 2 - 增量记忆]")
    memory2 = await service.memorize(
        resource_data=conversation2,
        modality="conversation",
        user_id="user_wangfang"
    )
    print(f"✓ 提取了 {memory2['items_count']} 个记忆项")
    for cat in memory2['categories']:
        print(f"  - {cat['name']}")

    # 检索测试
    print("\n[检索测试]")
    queries = [
        {"role": "user", "content": {"text": "王芳的工作是什么？"}}
    ]

    result = await service.retrieve(queries=queries, where={"user_id": "user_wangfang"})
    print(f"查询: 王芳的工作是什么？")
    print(f"找到 {len(result['items'])} 个相关记忆")

    # 获取所有分类
    print("\n[所有记忆分类]")
    categories = await service.get_all_categories()
    for cat in categories:
        print(f"• {cat['name']}")
        print(f"  {cat['summary'][:80]}...")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
