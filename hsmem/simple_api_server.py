"""
HSMem 简化 REST API 服务器
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from hscore import MemoryService


# 数据模型
class Message(BaseModel):
    role: str
    content: Dict[str, Any]


class ConversationRequest(BaseModel):
    messages: List[Message]
    user_id: Optional[str] = None


class RetrieveRequest(BaseModel):
    queries: List[Message]
    limit: Optional[int] = 10


# 创建应用
app = FastAPI(title="HSMem API", version="0.1.0")

# 添加 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化服务
service = MemoryService(base_path="./api_memory_data")


@app.get("/")
async def root():
    return {"service": "HSMem API", "status": "running"}


@app.get("/health")
async def health():
    stats = await service.get_statistics()
    return {"status": "healthy", "stats": stats['statistics']}


@app.post("/api/v1/memorize")
async def memorize(request: ConversationRequest):
    """记忆化对话"""
    try:
        conversation = {"messages": [msg.dict() for msg in request.messages]}

        result = await service.memorize(
            resource_data=conversation,
            modality="conversation",
            user_id=request.user_id
        )

        return {
            "success": True,
            "resource_id": result['resource_id'],
            "items_count": result['items_count'],
            "categories": len(result['categories'])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/retrieve")
async def retrieve(request: RetrieveRequest):
    """检索记忆"""
    try:
        queries = [msg.dict() for msg in request.queries]

        result = await service.retrieve(
            queries=queries,
            limit=request.limit
        )

        return {
            "success": True,
            "method": result['method'],
            "items_count": len(result['items']),
            "items": result['items'][:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/stats")
async def stats():
    """获取统计"""
    try:
        stats = await service.get_statistics()
        return {"success": True, "stats": stats['statistics']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/categories")
async def categories():
    """获取分类"""
    try:
        cats = await service.get_all_categories()
        return {"success": True, "categories": cats[:10]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("\n" + "="*60)
    print("  HSMem REST API 服务器")
    print("="*60)
    print("  地址: http://localhost:8000")
    print("  文档: http://localhost:8000/docs")
    print("="*60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)
