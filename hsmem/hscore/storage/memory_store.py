"""
MemoryStore - 记忆存储核心

实现三层架构的记忆存储：
1. Resource Layer: 存储原始多模态数据
2. Memory Item Layer: 存储提取的记忆项
3. Memory Category Layer: 存储聚合的记忆分类
"""

import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from .resource_layer import ResourceLayer
from .memory_item_layer import MemoryItemLayer
from .memory_category_layer import MemoryCategoryLayer


class MemoryStore:
    """记忆存储系统"""

    def __init__(self, base_path: str = "./memory_data"):
        """
        初始化记忆存储

        Args:
            base_path: 基础存储路径
        """
        self.base_path = Path(base_path)
        self.resource_layer = ResourceLayer(self.base_path / "resources")
        self.memory_item_layer = MemoryItemLayer(self.base_path / "items")
        self.memory_category_layer = MemoryCategoryLayer(self.base_path / "categories")

        # 创建目录结构
        self._init_directories()

    def _init_directories(self):
        """初始化目录结构"""
        for layer_path in [self.resource_layer.base_path,
                          self.memory_item_layer.base_path,
                          self.memory_category_layer.base_path]:
            layer_path.mkdir(parents=True, exist_ok=True)

    async def store_resource(self, resource_data: Dict[str, Any],
                           modality: str = "text") -> str:
        """
        存储原始资源

        Args:
            resource_data: 资源数据
            modality: 模态类型 (text, image, audio, video, conversation)

        Returns:
            资源ID
        """
        return await self.resource_layer.store(resource_data, modality)

    async def store_memory_item(self, item: Dict[str, Any],
                               resource_id: str) -> str:
        """
        存储记忆项

        Args:
            item: 记忆项数据
            resource_id: 关联的资源ID

        Returns:
            记忆项ID
        """
        return await self.memory_item_layer.store(item, resource_id)

    async def store_memory_category(self, category: Dict[str, Any],
                                    item_ids: List[str]) -> str:
        """
        存储记忆分类

        Args:
            category: 分类数据
            item_ids: 关联的记忆项ID列表

        Returns:
            分类ID
        """
        return await self.memory_category_layer.store(category, item_ids)

    async def get_resource(self, resource_id: str) -> Optional[Dict[str, Any]]:
        """获取资源"""
        return await self.resource_layer.get(resource_id)

    async def get_memory_item(self, item_id: str) -> Optional[Dict[str, Any]]:
        """获取记忆项"""
        return await self.memory_item_layer.get(item_id)

    async def get_memory_category(self, category_id: str) -> Optional[Dict[str, Any]]:
        """获取记忆分类"""
        return await self.memory_category_layer.get(category_id)

    async def search_items_by_category(self,
                                      category_name: str) -> List[Dict[str, Any]]:
        """按分类搜索记忆项"""
        return await self.memory_item_layer.search_by_category(category_name)

    async def get_all_categories(self) -> List[Dict[str, Any]]:
        """获取所有分类"""
        return await self.memory_category_layer.get_all()

    async def update_category(self, category_id: str,
                             updates: Dict[str, Any]):
        """更新分类"""
        await self.memory_category_layer.update(category_id, updates)

    def get_statistics(self) -> Dict[str, int]:
        """获取存储统计信息"""
        return {
            "resources_count": self.resource_layer.count(),
            "items_count": self.memory_item_layer.count(),
            "categories_count": self.memory_category_layer.count()
        }
