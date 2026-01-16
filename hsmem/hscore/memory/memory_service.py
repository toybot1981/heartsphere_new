"""
MemoryService - 记忆服务

统一的记忆管理接口，整合记忆提取和检索
"""

from typing import Dict, Any, List, Optional
from pathlib import Path

from ..storage.memory_store import MemoryStore
from .memory_extractor import MemoryExtractor
from .memory_retriever import MemoryRetriever


class MemoryService:
    """记忆服务 - 统一的记忆管理接口"""

    def __init__(self,
                 base_path: str = "./memory_data",
                 llm_client=None,
                 retrieve_config: Optional[Dict[str, Any]] = None):
        """
        初始化记忆服务

        Args:
            base_path: 存储基础路径
            llm_client: LLM客户端
            retrieve_config: 检索配置
        """
        self.database = MemoryStore(base_path)
        self.extractor = MemoryExtractor(llm_client)

        # 配置检索器
        config = retrieve_config or {}
        method = config.get("method", "simple")
        self.retriever = MemoryRetriever(self.database, method)

    async def memorize(self,
                      resource_data: Dict[str, Any],
                      modality: str = "text",
                      user_id: Optional[str] = None,
                      agent_id: Optional[str] = None) -> Dict[str, Any]:
        """
        记忆化 - 从资源中提取并存储记忆

        Args:
            resource_data: 资源数据
            modality: 模态类型
            user_id: 用户ID
            agent_id: 代理ID

        Returns:
            记忆结果
        """
        # 1. 存储原始资源
        resource_id = await self.database.store_resource(resource_data, modality)

        # 2. 提取记忆项
        if modality == "conversation":
            memory_items = await self.extractor.extract_from_conversation(resource_data)
        elif modality == "text":
            memory_items = await self.extractor.extract_from_text(
                resource_data.get("text", ""),
                resource_data.get("context")
            )
        elif modality == "document":
            memory_items = await self.extractor.extract_from_document(resource_data)
        else:
            # 默认处理
            memory_items = [{
                "content": str(resource_data),
                "summary": "自动提取的记忆",
                "memory_type": "general",
                "categories": ["general"],
                "importance": 0.5
            }]

        # 3. 存储记忆项并组织成分类
        item_ids = []
        category_map = {}

        for item_data in memory_items:
            # 添加用户/代理上下文
            if user_id:
                item_data["user_id"] = user_id
            if agent_id:
                item_data["agent_id"] = agent_id

            # 存储记忆项
            item_id = await self.database.store_memory_item(item_data, resource_id)
            item_ids.append(item_id)

            # 按分类组织
            for category_name in item_data.get("categories", ["general"]):
                if category_name not in category_map:
                    category_map[category_name] = []
                category_map[category_name].append(item_id)

        # 4. 创建或更新记忆分类
        categories = []
        for category_name, cat_item_ids in category_map.items():
            category = {
                "name": category_name,
                "summary": f"关于 {category_name} 的记忆",
                "description": f"包含 {len(cat_item_ids)} 个记忆项"
            }

            category_id = await self.database.store_memory_category(category, cat_item_ids)
            categories.append({
                "id": category_id,
                "name": category_name,
                "item_count": len(cat_item_ids)
            })

        return {
            "resource_id": resource_id,
            "items_count": len(item_ids),
            "categories": categories,
            "modality": modality
        }

    async def retrieve(self,
                      queries: List[Dict[str, Any]],
                      where: Optional[Dict[str, Any]] = None,
                      limit: int = 10) -> Dict[str, Any]:
        """
        检索记忆

        Args:
            queries: 查询列表，每个查询包含 role 和 content
            where: 过滤条件
            limit: 返回数量限制

        Returns:
            检索结果
        """
        # 合并多个查询
        combined_query = " ".join([
            q.get("content", {}).get("text", "")
            for q in queries
        ])

        # 使用检索器
        result = await self.retriever.retrieve(combined_query, where, limit)

        return result

    async def get_statistics(self) -> Dict[str, Any]:
        """获取记忆系统统计信息"""
        stats = self.database.get_statistics()
        return {
            "statistics": stats,
            "status": "healthy"
        }

    async def get_all_categories(self) -> List[Dict[str, Any]]:
        """获取所有分类"""
        return await self.database.get_all_categories()

    async def search_by_category(self, category_name: str) -> List[Dict[str, Any]]:
        """按分类搜索"""
        return await self.database.search_items_by_category(category_name)

    async def get_all_items(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        获取所有记忆项
        
        Args:
            user_id: 可选，按用户ID过滤
        
        Returns:
            记忆项列表
        """
        return await self.database.get_all_items(user_id)

    async def get_all_resources(self) -> List[Dict[str, Any]]:
        """获取所有资源"""
        return await self.database.get_all_resources()
