"""
Memory Category Layer - 记忆分类层

将相关记忆项聚合成结构化的文本记忆
"""

import json
import uuid
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime


class MemoryCategoryLayer:
    """记忆分类层 - 聚合的结构化记忆"""

    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.index_path = self.base_path / "categories_index.json"
        self._init_index()

    def _init_index(self):
        """初始化索引"""
        if not self.index_path.exists():
            with open(self.index_path, 'w', encoding='utf-8') as f:
                json.dump({}, f)

    def _load_index(self) -> Dict[str, Any]:
        """加载索引"""
        with open(self.index_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _save_index(self, index: Dict[str, Any]):
        """保存索引"""
        with open(self.index_path, 'w', encoding='utf-8') as f:
            json.dump(index, f, ensure_ascii=False, indent=2)

    async def store(self, category: Dict[str, Any],
                   item_ids: List[str]) -> str:
        """
        存储记忆分类

        Args:
            category: 分类数据
            item_ids: 关联的记忆项ID列表

        Returns:
            分类ID
        """
        category_id = str(uuid.uuid4())

        memory_category = {
            "id": category_id,
            "name": category.get("name", "general"),
            "summary": category.get("summary", ""),
            "description": category.get("description", ""),
            "item_ids": item_ids,
            "metadata": category.get("metadata", {}),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "version": 1
        }

        # 保存分类
        file_path = self.base_path / f"{category_id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(memory_category, f, ensure_ascii=False, indent=2)

        # 保存为 Markdown 文件便于 LLM 阅读
        md_path = self.base_path / f"{category_id}.md"
        await self._save_markdown(md_path, memory_category, item_ids)

        # 更新索引
        index = self._load_index()
        index[category_id] = {
            "name": memory_category["name"],
            "item_count": len(item_ids),
            "created_at": memory_category["created_at"],
            "updated_at": memory_category["updated_at"]
        }
        self._save_index(index)

        return category_id

    async def _save_markdown(self, md_path: Path,
                            category: Dict[str, Any],
                            item_ids: List[str]):
        """保存为 Markdown 格式"""
        content = f"""# {category['name']}

## 概述
{category['summary']}

## 描述
{category['description']}

## 包含记忆项数量
{len(item_ids)}

## 创建时间
{category['created_at']}

## 更新时间
{category['updated_at']}

## 版本
{category['version']}
"""
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(content)

    async def get(self, category_id: str) -> Optional[Dict[str, Any]]:
        """获取分类"""
        file_path = self.base_path / f"{category_id}.json"
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    async def get_all(self) -> List[Dict[str, Any]]:
        """获取所有分类"""
        categories = []
        index = self._load_index()

        for category_id in index.keys():
            category = await self.get(category_id)
            if category:
                categories.append(category)

        return categories

    async def update(self, category_id: str, updates: Dict[str, Any]):
        """更新分类"""
        category = await self.get(category_id)
        if not category:
            return

        # 更新字段
        for key, value in updates.items():
            if key in category:
                category[key] = value

        category["updated_at"] = datetime.utcnow().isoformat()
        category["version"] += 1

        # 保存更新
        file_path = self.base_path / f"{category_id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(category, f, ensure_ascii=False, indent=2)

        # 更新 Markdown 文件
        md_path = self.base_path / f"{category_id}.md"
        await self._save_markdown(md_path, category, category["item_ids"])

        # 更新索引
        index = self._load_index()
        index[category_id]["updated_at"] = category["updated_at"]
        self._save_index(index)

    def count(self) -> int:
        """统计分类数量"""
        return len(list(self.base_path.glob("*.json"))) - 1  # 减去索引文件
