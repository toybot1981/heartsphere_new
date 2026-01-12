# HSMem - HeartSphere 记忆系统

## 🚀 快速启动

```bash
cd hsmem
pip install -r requirements.txt
python3 examples/quick_start.py
```

## ✅ 验证测试

```bash
python3 test_hsmem.py
```

预期输出: `🎉 所有测试通过！HSMem 系统工作正常！`

## 📖 文档

- [QUICKSTART.md](hsmem/QUICKSTART.md) - 5分钟快速开始
- [README_CN.md](hsmem/README_CN.md) - 中文说明
- [USAGE.md](hsmem/USAGE.md) - 详细使用指南
- [DELIVERY.md](hsmem/DELIVERY.md) - 项目交付文档

## 🎯 核心功能

- **三层架构**: Resource → Memory Item → Memory Category
- **记忆提取**: 从对话、文本、文档中提取记忆
- **记忆检索**: 支持多种检索策略
- **LLM 友好**: 自动生成 Markdown 文件

## 💡 快速示例

```python
import asyncio
from hscore import MemoryService

async def main():
    service = MemoryService(base_path="./memory_data")

    # 记忆化对话
    conversation = {
        "messages": [
            {"role": "user", "content": "我叫李明"},
            {"role": "assistant", "content": "你好李明！"}
        ]
    }

    memory = await service.memorize(conversation, modality="conversation")
    print(f"创建了 {memory['items_count']} 个记忆项")

asyncio.run(main())
```

## 📊 项目状态

- **版本**: 0.1.0
- **状态**: ✅ 完成并测试通过
- **测试**: 5/5 通过
- **示例**: 3个完整示例

## 📁 项目位置

```
heartsphere_new/hsmem/
```

---

**基于 memU 设计理念 | 为 HeartSphere 提供持久化记忆能力 ❤️**
