"""
HSMem Quick Start Example
快速开始示例
"""

import asyncio
import sys
from pathlib import Path

# 添加父目录到路径以便导入 hscore
sys.path.insert(0, str(Path(__file__).parent.parent))

from hscore import MemoryService


async def main():
    """主函数"""
    print("=" * 60)
    print("HSMem - HeartSphere Memory System 快速开始")
    print("=" * 60)

    # 1. 初始化记忆服务
    print("\n[1] 初始化记忆服务...")
    service = MemoryService(
        base_path="./memory_data",
        retrieve_config={"method": "simple"}
    )
    print("✓ 记忆服务初始化完成")

    # 2. 创建示例对话
    print("\n[2] 创建示例对话...")
    conversation = {
        "messages": [
            {"role": "user", "content": "你好，我叫李明，是一名软件工程师"},
            {"role": "assistant", "content": "你好李明！很高兴认识你"},
            {"role": "user", "content": "我喜欢编程，特别是 Python 和 Java"},
            {"role": "assistant", "content": "Python 和 Java 都是很好的语言"},
            {"role": "user", "content": "我每天早上都会喝咖啡，然后开始工作"},
            {"role": "assistant", "content": "咖啡确实是程序员的燃料！"},
            {"role": "user", "content": "周末我喜欢去爬山，放松心情"}
        ]
    }
    print(f"✓ 对话包含 {len(conversation['messages'])} 条消息")

    # 3. 记忆化
    print("\n[3] 提取记忆...")
    memory = await service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id="user_001"
    )

    print(f"✓ 成功创建记忆:")
    print(f"  - 资源 ID: {memory['resource_id'][:8]}...")
    print(f"  - 记忆项数量: {memory['items_count']}")
    print(f"  - 分类数量: {len(memory['categories'])}")

    for cat in memory['categories']:
        print(f"    • {cat['name']}: {cat['item_count']} 个记忆项")

    # 4. 检索记忆
    print("\n[4] 检索记忆...")
    queries = [
        {"role": "user", "content": {"text": "李明的工作是什么？"}}
    ]

    result = await service.retrieve(queries=queries, where={"user_id": "user_001"})
    print(f"✓ 检索到 {len(result['items'])} 个相关记忆")

    for i, item in enumerate(result['items'][:3], 1):
        print(f"  [{i}] {item.get('name', 'N/A')}: {item.get('summary', 'N/A')[:50]}...")

    # 5. 获取统计信息
    print("\n[5] 系统统计...")
    stats = await service.get_statistics()
    print(f"✓ 记忆系统状态:")
    print(f"  - 资源数: {stats['statistics']['resources_count']}")
    print(f"  - 记忆项数: {stats['statistics']['items_count']}")
    print(f"  - 分类数: {stats['statistics']['categories_count']}")

    # 6. 查看所有分类
    print("\n[6] 所有记忆分类...")
    categories = await service.get_all_categories()
    for cat in categories:
        print(f"  • {cat['name']}: {cat['summary'][:60]}...")

    print("\n" + "=" * 60)
    print("✓ HSMem 快速开始完成！")
    print("=" * 60)

    # 提示
    print("\n💡 提示:")
    print("  - 记忆数据保存在 ./memory_data 目录")
    print("  - 你可以查看 .md 文件来了解记忆内容")
    print("  - 尝试修改示例对话来测试不同的场景")


if __name__ == "__main__":
    asyncio.run(main())
