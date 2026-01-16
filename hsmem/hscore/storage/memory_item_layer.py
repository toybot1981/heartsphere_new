"""
Memory Item Layer - 记忆项层

从资源中提取的离散记忆单元
"""

import json
import uuid
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime


class MemoryItemLayer:
    """记忆项层 - 存储提取的记忆单元"""

    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.index_path = self.base_path / "index.json"
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

    async def store(self, item: Dict[str, Any],
                   resource_id: str) -> str:
        """
        存储记忆项

        Args:
            item: 记忆项数据
            resource_id: 关联的资源ID

        Returns:
            记忆项ID
        """
        item_id = str(uuid.uuid4())

        memory_item = {
            "id": item_id,
            "resource_id": resource_id,
            "content": item.get("content", ""),
            "summary": item.get("summary", ""),
            "memory_type": item.get("memory_type", "general"),
            "importance": item.get("importance", 0.5),
            "categories": item.get("categories", []),
            "metadata": item.get("metadata", {}),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # 保存用户ID和代理ID（如果存在）
        if "user_id" in item:
            memory_item["user_id"] = item["user_id"]
        if "agent_id" in item:
            memory_item["agent_id"] = item["agent_id"]

        # 保存记忆项
        file_path = self.base_path / f"{item_id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(memory_item, f, ensure_ascii=False, indent=2)

        # 更新索引
        index = self._load_index()
        index[item_id] = {
            "resource_id": resource_id,
            "memory_type": memory_item["memory_type"],
            "categories": memory_item["categories"],
            "created_at": memory_item["created_at"]
        }
        self._save_index(index)

        return item_id

    async def get(self, item_id: str) -> Optional[Dict[str, Any]]:
        """获取记忆项"""
        file_path = self.base_path / f"{item_id}.json"
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None

    async def search_by_category(self,
                                category_name: str) -> List[Dict[str, Any]]:
        """按分类搜索记忆项"""
        results = []
        index = self._load_index()

        for item_id, item_info in index.items():
            if category_name in item_info.get("categories", []):
                item = await self.get(item_id)
                if item:
                    results.append(item)

        return results

    async def get_by_resource(self, resource_id: str) -> List[Dict[str, Any]]:
        """按资源ID获取所有记忆项"""
        results = []
        index = self._load_index()

        for item_id, item_info in index.items():
            if item_info.get("resource_id") == resource_id:
                item = await self.get(item_id)
                if item:
                    results.append(item)

        return results

    async def get_all(self) -> List[Dict[str, Any]]:
        """获取所有记忆项"""
        results = []
        index = self._load_index()

        for item_id in index.keys():
            item = await self.get(item_id)
            if item:
                results.append(item)

        return results

    async def search_by_user_id(self, user_id: str) -> List[Dict[str, Any]]:
        """按用户ID搜索记忆项"""
        results = []
        all_items = await self.get_all()

        for item in all_items:
            if item.get("user_id") == user_id:
                results.append(item)

        return results

    def count(self) -> int:
        """统计记忆项数量"""
        return len(list(self.base_path.glob("*.json"))) - 1  # 减去索引文件
