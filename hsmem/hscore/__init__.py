"""
HSMem - HeartSphere Memory System
基于 memU 设计理念的记忆系统

三层架构：
1. Resource Layer: 原始数据层
2. Memory Item Layer: 记忆项层
3. Memory Category Layer: 记忆分类层
"""

__version__ = "0.1.0"
__author__ = "HeartSphere Team"

from .memory.memory_service import MemoryService
from .storage.memory_store import MemoryStore

__all__ = ['MemoryService', 'MemoryStore']
