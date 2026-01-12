# HSMem - HeartSphere Memory System

基于 memU 设计理念的轻量级记忆系统，为 HeartSphere 项目提供持久化记忆能力。

## 特性

- **三层架构**: Resource Layer → Memory Item Layer → Memory Category Layer
- **多模态支持**: 支持文本、对话、文档等多种数据形式
- **灵活检索**: 支持简单检索、RAG、LLM-based 检索
- **持久化存储**: 本地文件存储，易于扩展

## 安装

```bash
cd hsmem
pip install -r requirements.txt
```

## 快速开始

```python
import asyncio
from hscore import MemoryService

async def main():
    # 初始化记忆服务
    service = MemoryService(
        base_path="./memory_data",
        retrieve_config={"method": "simple"}
    )

    # 记忆化对话
    conversation = {
        "messages": [
            {"role": "user", "content": "我叫张三，喜欢喝咖啡"},
            {"role": "assistant", "content": "你好张三！我知道你喜欢喝咖啡"},
            {"role": "user", "content": "是的，我每天早上都要喝一杯"}
        ]
    }

    # 提取记忆
    memory = await service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id="123"
    )

    print(f"创建了 {memory['items_count']} 个记忆项")
    for cat in memory['categories']:
        print(f"  - {cat['name']}: {cat['item_count']} 个记忆项")

    # 检索记忆
    queries = [
        {"role": "user", "content": {"text": "张三喜欢什么？"}}
    ]

    result = await service.retrieve(queries=queries, where={"user_id": "123"})
    print(f"\n检索到 {len(result['items'])} 个相关记忆")

if __name__ == "__main__":
    asyncio.run(main())
```

## 架构说明

### Resource Layer（资源层）
存储原始多模态数据，保持数据的完整性和可追溯性。

### Memory Item Layer（记忆项层）
从资源中提取的离散记忆单元，每个记忆项包含：
- 内容 (content)
- 摘要 (summary)
- 类型 (memory_type)
- 分类 (categories)
- 重要性 (importance)

### Memory Category Layer（记忆分类层）
将相关记忆项聚合成结构化的文本记忆，支持：
- 自动分类
- 增量更新
- Markdown 导出

## 使用示例

查看 `examples/` 目录获取更多示例：
- `example_1_conversation.py` - 对话记忆处理
- `example_2_text_memory.py` - 文本记忆
- `example_3_retrieval.py` - 记忆检索

## 配置

编辑 `config.yaml` 来自定义系统行为。

## 路线图

- [ ] 集成 LLM 进行智能提取
- [ ] 支持向量检索 (RAG)
- [ ] 支持多模态（图像、音频）
- [ ] 记忆重要性自动评估
- [ ] 记忆遗忘机制
- [ ] 与 HeartSphere 后端集成

## 许可证

Apache License 2.0

## 致谢

本项目受到 [memU](https://github.com/NevaMind-AI/memU) 启发。
