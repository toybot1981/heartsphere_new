"""
MemoryExtractor - 记忆提取器

从原始资源中提取记忆项
"""

import json
from typing import Dict, Any, List, Optional
from datetime import datetime


class MemoryExtractor:
    """记忆提取器 - 从资源中提取记忆"""

    def __init__(self, llm_client=None):
        """
        初始化记忆提取器

        Args:
            llm_client: LLM客户端（用于智能提取）
        """
        self.llm_client = llm_client

    async def extract_from_conversation(self,
                                      conversation_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        从对话中提取记忆

        Args:
            conversation_data: 对话数据

        Returns:
            提取的记忆项列表
        """
        messages = conversation_data.get("messages", [])
        memory_items = []

        # 简单规则提取（实际应用中使用 LLM）
        preferences = self._extract_preferences(messages)
        habits = self._extract_habits(messages)
        personal_info = self._extract_personal_info(messages)

        if preferences:
            memory_items.append({
                "content": "\n".join(preferences),
                "summary": f"用户有 {len(preferences)} 个偏好",
                "memory_type": "preference",
                "categories": ["preferences", "user_profile"],
                "importance": 0.7
            })

        if habits:
            memory_items.append({
                "content": "\n".join(habits),
                "summary": f"用户有 {len(habits)} 个习惯",
                "memory_type": "habit",
                "categories": ["habits", "behavior"],
                "importance": 0.6
            })

        if personal_info:
            memory_items.append({
                "content": "\n".join(personal_info),
                "summary": f"个人信息: {', '.join(personal_info[:3])}",
                "memory_type": "personal_info",
                "categories": ["personal_info", "basic_info"],
                "importance": 0.8
            })

        return memory_items

    def _extract_preferences(self, messages: List[Dict]) -> List[str]:
        """提取偏好信息"""
        preferences = []
        preference_keywords = ["喜欢", "爱", "偏好", "prefer", "like", "love"]

        for msg in messages:
            content = msg.get("content", "")
            for keyword in preference_keywords:
                if keyword in content.lower():
                    # 提取包含关键词的句子
                    sentences = content.split("。")
                    for sentence in sentences:
                        if keyword in sentence.lower():
                            preferences.append(sentence.strip())
                            break

        return preferences[:5]  # 限制数量

    def _extract_habits(self, messages: List[Dict]) -> List[str]:
        """提取习惯信息"""
        habits = []
        habit_keywords = ["每天", "经常", "总是", "习惯", "usually", "always", "every day"]

        for msg in messages:
            content = msg.get("content", "")
            for keyword in habit_keywords:
                if keyword in content.lower():
                    sentences = content.split("。")
                    for sentence in sentences:
                        if keyword in sentence.lower():
                            habits.append(sentence.strip())
                            break

        return habits[:5]

    def _extract_personal_info(self, messages: List[Dict]) -> List[str]:
        """提取个人信息"""
        info = []

        # 提取名字、年龄、职业等
        for msg in messages[:10]:  # 只检查前10条消息
            content = msg.get("content", "")

            # 简单的模式匹配
            if "我叫" in content or "我是" in content:
                info.append(content)

            if len(info) >= 5:
                break

        return info

    async def extract_from_text(self, text: str,
                               context: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """
        从文本中提取记忆

        Args:
            text: 文本内容
            context: 上下文信息

        Returns:
            提取的记忆项列表
        """
        # 简化实现：将文本作为一个记忆项
        return [{
            "content": text,
            "summary": text[:100] + "..." if len(text) > 100 else text,
            "memory_type": "text_memory",
            "categories": context.get("categories", ["general"]),
            "importance": 0.5
        }]

    async def extract_from_document(self, document_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        从文档中提取记忆

        Args:
            document_data: 文档数据

        Returns:
            提取的记忆项列表
        """
        title = document_data.get("title", "")
        content = document_data.get("content", "")

        # 提取关键信息
        memory_item = {
            "content": f"标题: {title}\n内容: {content}",
            "summary": f"文档: {title}",
            "memory_type": "document",
            "categories": ["knowledge", "document"],
            "importance": 0.6
        }

        return [memory_item]
