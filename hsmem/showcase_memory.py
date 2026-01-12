"""
HSMem 记忆内容展示脚本

展示系统中存储的所有记忆内容
"""

import asyncio
import json
from pathlib import Path
from hscore import MemoryService


def print_section(title):
    """打印分节标题"""
    print("\n" + "="*70)
    print(title)
    print("="*70)


def print_memory_item(item):
    """打印记忆项"""
    print(f"\n📝 记忆项: {item['id'][:8]}...")
    print(f"   类型: {item['memory_type']}")
    print(f"   内容: {item['content'][:80]}...")
    print(f"   摘要: {item['summary']}")
    print(f"   重要性: {item['importance']}")
    print(f"   分类: {', '.join(item['categories'])}")


def print_category(category):
    """打印分类"""
    print(f"\n📁 分类: {category['name']}")
    print(f"   概述: {category['summary']}")
    print(f"   描述: {category['description']}")
    print(f"   记忆项数量: {len(category['item_ids'])}")
    print(f"   创建时间: {category['created_at']}")


def print_conversation(resource):
    """打印对话"""
    print(f"\n💬 对话: {resource['id'][:8]}...")
    print(f"   模态: {resource['modality']}")
    print(f"   消息数量: {len(resource['data'].get('messages', []))}")

    messages = resource['data'].get('messages', [])
    for i, msg in enumerate(messages[:5], 1):
        role = msg.get('role', 'unknown')
        content = msg.get('content', '')[:50]
        print(f"   {i}. [{role}]: {content}...")

    if len(messages) > 5:
        print(f"   ... 还有 {len(messages) - 5} 条消息")


async def showcase_all():
    """展示所有记忆"""
    print_section("🎯 HSMem 记忆内容展示")

    # 初始化服务
    service = MemoryService(base_path="./memory_data")

    # 1. 显示统计信息
    print("\n📊 系统统计")
    stats = await service.get_statistics()
    for key, value in stats['statistics'].items():
        print(f"   • {key}: {value}")

    # 2. 显示所有原始资源
    print_section("1️⃣ 原始资源 (Resource Layer)")

    resources_dir = Path("./memory_data/resources/conversation")
    if resources_dir.exists():
        resource_files = list(resources_dir.glob("*.json"))[:3]  # 只显示前3个

        for resource_file in resource_files:
            with open(resource_file, 'r', encoding='utf-8') as f:
                resource = json.load(f)
                print_conversation(resource)

    # 3. 显示记忆项
    print_section("2️⃣ 记忆项 (Memory Item Layer)")

    items_dir = Path("./memory_data/items")
    if items_dir.exists():
        item_files = list(items_dir.glob("*.json"))
        item_files = [f for f in item_files if f.name != "index.json"][:5]  # 只显示前5个

        for item_file in item_files:
            with open(item_file, 'r', encoding='utf-8') as f:
                item = json.load(f)
                print_memory_item(item)

    # 4. 显示记忆分类
    print_section("3️⃣ 记忆分类 (Memory Category Layer)")

    categories = await service.get_all_categories()
    unique_categories = {}

    # 去重（按名称）
    for cat in categories:
        name = cat['name']
        if name not in unique_categories:
            unique_categories[name] = cat

    # 显示前10个分类
    for i, (name, cat) in enumerate(list(unique_categories.items())[:10], 1):
        print(f"\n{i}. {cat['name']}")
        print(f"   • 记忆项数: {len(cat['item_ids'])}")
        print(f"   • 创建时间: {cat['created_at'][:19]}")

    # 5. 显示一个完整的记忆分类 Markdown
    print_section("4️⃣ 记忆分类 Markdown 示例")

    if categories:
        first_cat = categories[0]
        md_file = Path(f"./memory_data/categories/{first_cat['id']}.md")

        if md_file.exists():
            print(f"\n📄 文件: {md_file.name}")
            print("\n" + "-"*70)
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                print(content)
            print("-"*70)

    # 6. 展示完整的数据链路
    print_section("5️⃣ 完整数据链路示例")

    if items_dir.exists():
        item_files = list(items_dir.glob("*.json"))
        item_files = [f for f in item_files if f.name != "index.json"]

        if item_files:
            with open(item_files[0], 'r', encoding='utf-8') as f:
                item = json.load(f)

            print(f"\n🔗 数据链路追踪:")
            print(f"   1. 原始资源 ID: {item['resource_id'][:8]}...")

            resource_file = Path(f"./memory_data/resources/conversation/{item['resource_id']}.json")
            if resource_file.exists():
                print(f"   2. 找到原始资源 ✓")

            print(f"   3. 提取为记忆项: {item['id'][:8]}...")
            print(f"   4. 记忆类型: {item['memory_type']}")
            print(f"   5. 关联分类: {', '.join(item['categories'])}")

            # 显示关联的分类
            for cat_id in item['categories']:
                cat_file = Path(f"./memory_data/categories/{cat_id}.md")
                if cat_file.exists():
                    print(f"   6. 分类文件: {cat_id}.md ✓")

    print_section("✅ 展示完成")
    print("\n💡 提示:")
    print("   • 原始资源保存在: memory_data/resources/")
    print("   • 记忆项保存在: memory_data/items/")
    print("   • 记忆分类保存在: memory_data/categories/")
    print("   • Markdown 文件便于 LLM 阅读")
    print("="*70)


if __name__ == "__main__":
    asyncio.run(showcase_all())
