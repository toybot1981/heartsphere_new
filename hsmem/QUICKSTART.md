# HSMem 快速启动指南

## 🚀 5分钟快速开始

### 1. 进入目录
```bash
cd hsmem
```

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 运行快速开始示例
```bash
python3 examples/quick_start.py
```

### 4. 查看生成的记忆数据
```bash
ls -la memory_data/
```

## ✅ 验证安装

运行完整测试：
```bash
python3 test_hsmem.py
```

预期输出：
```
🎉 所有测试通过！HSMem 系统工作正常！
```

## 📚 学习示例

### 示例 1: 对话记忆
```bash
python3 examples/example_1_conversation.py
```

### 示例 2: 记忆检索
```bash
python3 examples/example_2_retrieval.py
```

## 💡 基本使用

### Python 代码示例

```python
import asyncio
from hscore import MemoryService

async def main():
    # 1. 初始化
    service = MemoryService(base_path="./my_memory")

    # 2. 记忆化对话
    conversation = {
        "messages": [
            {"role": "user", "content": "我叫张三"},
            {"role": "assistant", "content": "你好张三！"}
        ]
    }

    memory = await service.memorize(
        resource_data=conversation,
        modality="conversation"
    )

    print(f"创建了 {memory['items_count']} 个记忆项")

    # 3. 检索记忆
    result = await service.retrieve(
        queries=[{"role": "user", "content": {"text": "张三是谁"}}]
    )

    print(f"找到 {len(result['items'])} 个相关记忆")

asyncio.run(main())
```

## 📖 详细文档

- **README.md** - 项目概述
- **README_CN.md** - 中文说明
- **USAGE.md** - 详细使用指南
- **PROJECT_SUMMARY.md** - 项目总结

## 🎯 核心功能

### 1. 记忆化 (Memorize)
支持对话、文本、文档等多种模态

### 2. 检索 (Retrieve)
支持关键词、RAG、LLM等多种检索方式

### 3. 分类管理
自动分类和组织记忆

### 4. 三层架构
- Resource Layer: 原始数据
- Memory Item Layer: 记忆项
- Memory Category Layer: 记忆分类

## 🔧 配置

编辑 `config.yaml` 自定义系统行为：

```yaml
memory_store:
  base_path: "./memory_data"

extraction:
  default_method: "rule_based"

retrieval:
  default_method: "simple"
```

## 🌟 特性

- ✅ 轻量级，无复杂依赖
- ✅ 三层架构设计
- ✅ 支持多种检索策略
- ✅ LLM 友好的 Markdown 输出
- ✅ 完整的示例和文档
- ✅ 易于集成和扩展

## 🚦 下一步

1. 运行所有示例熟悉功能
2. 查看 USAGE.md 了解详细用法
3. 阅读源码理解实现
4. 集成到你的项目中

## 🤝 支持

如有问题：
1. 查看文档 (USAGE.md)
2. 运行测试 (test_hsmem.py)
3. 查看示例代码 (examples/)

## 📝 许可证

Apache License 2.0

---

**HSMem** - 为 AI 提供持久化记忆能力 ❤️
