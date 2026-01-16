"""
MemoryRetriever - 记忆检索器

支持多种检索策略：RAG、LLM-based
"""

import json
from typing import Dict, Any, List, Optional
from pathlib import Path


class MemoryRetriever:
    """记忆检索器 - 多策略检索"""

    def __init__(self, store, method: str = "simple"):
        """
        初始化检索器

        Args:
            store: MemoryStore实例
            method: 检索方法 (simple, rag, llm)
        """
        self.store = store
        self.method = method

    async def retrieve(self,
                      query: str,
                      where: Optional[Dict[str, Any]] = None,
                      limit: int = 10) -> Dict[str, Any]:
        """
        检索记忆

        Args:
            query: 查询文本
            where: 过滤条件
            limit: 返回数量限制

        Returns:
            检索结果
        """
        if self.method == "simple":
            return await self._simple_retrieve(query, where, limit)
        elif self.method == "rag":
            return await self._rag_retrieve(query, where, limit)
        elif self.method == "llm":
            return await self._llm_retrieve(query, where, limit)
        else:
            raise ValueError(f"未知的检索方法: {self.method}")

    async def _simple_retrieve(self,
                              query: str,
                              where: Optional[Dict[str, Any]],
                              limit: int) -> Dict[str, Any]:
        """简单检索 - 基于关键词匹配"""
        all_categories = await self.store.get_all_categories()

        # 简单的关键词匹配
        results = []
        query_lower = query.lower()

        for category in all_categories:
            score = 0.0

            # 检查名称匹配
            if query_lower in category["name"].lower():
                score += 0.5

            # 检查描述匹配
            if query_lower in category["description"].lower():
                score += 0.3

            # 检查摘要匹配
            if query_lower in category["summary"].lower():
                score += 0.2

            if score > 0:
                # 如果提供了 where 过滤条件，检查记忆项是否匹配
                if where and "user_id" in where:
                    # 获取该分类下的记忆项，检查是否有匹配的 user_id
                    category_items = await self.store.search_items_by_category(category["name"])
                    user_id = where["user_id"]
                    # 检查是否有记忆项的 user_id 匹配
                    matching_items = [item for item in category_items if item.get("user_id") == user_id]
                    if not matching_items:
                        continue  # 如果分类下没有匹配的记忆项，跳过该分类

                results.append({
                    "category": category,
                    "score": score
                })

        # 按分数排序
        results.sort(key=lambda x: x["score"], reverse=True)

        return {
            "method": "simple",
            "query": query,
            "items": [r["category"] for r in results[:limit]],
            "total": len(results)
        }

    async def _rag_retrieve(self,
                           query: str,
                           where: Optional[Dict[str, Any]],
                           limit: int) -> Dict[str, Any]:
        """RAG检索 - 基于向量相似度（简化实现）"""
        # 简化版本：使用简单检索
        # 实际应用中应该使用向量数据库和嵌入模型
        result = await self._simple_retrieve(query, where, limit)
        result["method"] = "rag"
        return result

    async def _llm_retrieve(self,
                           query: str,
                           where: Optional[Dict[str, Any]],
                           limit: int) -> Dict[str, Any]:
        """LLM检索 - 基于LLM深度理解（简化实现）"""
        # 简化版本：使用简单检索
        # 实际应用中应该让LLM阅读记忆文件并理解语义
        result = await self._simple_retrieve(query, where, limit)
        result["method"] = "llm"
        return result

    async def retrieve_by_category(self,
                                  category_name: str,
                                  limit: int = 10) -> List[Dict[str, Any]]:
        """按分类检索"""
        items = await self.store.search_items_by_category(category_name)
        return items[:limit]

    async def retrieve_by_type(self,
                              memory_type: str,
                              limit: int = 10) -> List[Dict[str, Any]]:
        """按类型检索"""
        # 简化实现：遍历所有项
        all_categories = await self.store.get_all_categories()
        results = []

        for category in all_categories:
            # 检查是否匹配类型
            if memory_type in str(category):
                results.append(category)

        return results[:limit]
