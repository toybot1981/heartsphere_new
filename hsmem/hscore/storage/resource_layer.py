"""
Resource Layer - 资源层

存储原始多模态数据，是记忆系统的基础层
"""

import json
import uuid
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime


class ResourceLayer:
    """资源层 - 存储原始数据"""

    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def store(self, resource_data: Dict[str, Any],
                   modality: str = "text") -> str:
        """
        存储资源

        Args:
            resource_data: 资源数据
            modality: 模态类型

        Returns:
            资源ID
        """
        resource_id = str(uuid.uuid4())

        resource = {
            "id": resource_id,
            "modality": modality,
            "data": resource_data,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": {
                "size": len(json.dumps(resource_data))
            }
        }

        # 按模态类型组织存储
        modality_path = self.base_path / modality
        modality_path.mkdir(exist_ok=True)

        file_path = modality_path / f"{resource_id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(resource, f, ensure_ascii=False, indent=2)

        return resource_id

    async def get(self, resource_id: str) -> Optional[Dict[str, Any]]:
        """获取资源"""
        # 在所有模态目录中搜索
        for modality_dir in self.base_path.iterdir():
            if modality_dir.is_dir():
                file_path = modality_dir / f"{resource_id}.json"
                if file_path.exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return json.load(f)
        return None

    def count(self) -> int:
        """统计资源数量"""
        count = 0
        for modality_dir in self.base_path.iterdir():
            if modality_dir.is_dir():
                count += len(list(modality_dir.glob("*.json")))
        return count
