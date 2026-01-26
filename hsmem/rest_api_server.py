"""
HSMem REST API 服务器

提供 HTTP REST API 接口访问记忆系统
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from hscore import MemoryService


# ==================== 数据模型 ====================

class Message(BaseModel):
    role: str
    content: Dict[str, Any]  # HSMem API 要求 content 必须是字典（对象），不能是字符串
    
    def __init__(self, **data):
        """自定义初始化，规范化 content 字段"""
        # 如果 content 是字符串，转换为字典格式
        if 'content' in data and not isinstance(data['content'], dict):
            if isinstance(data['content'], str):
                data['content'] = {"text": data['content']}
            else:
                data['content'] = {"text": str(data['content'])}
        super().__init__(**data)


class ConversationRequest(BaseModel):
    messages: List[Message]
    user_id: Optional[str] = None
    agent_id: Optional[str] = None


class TextMemoryRequest(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None


class DocumentMemoryRequest(BaseModel):
    title: str
    content: str
    author: Optional[str] = None
    user_id: Optional[str] = None


class RetrieveRequest(BaseModel):
    queries: List[Message]
    where: Optional[Dict[str, Any]] = None
    limit: Optional[int] = 10


# ==================== FastAPI 应用 ====================

app = FastAPI(
    title="HSMem API",
    description="HeartSphere Memory System REST API",
    version="0.1.0"
)

# 添加 CORS 支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化记忆服务
memory_service = MemoryService(base_path="./api_memory_data")


# ==================== 健康检查 ====================

@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "HSMem API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    stats = await memory_service.get_statistics()
    return {
        "status": "healthy",
        "statistics": stats['statistics']
    }


# ==================== 记忆化 API ====================

@app.post("/api/v1/memory/memorize/conversation")
async def memorize_conversation(request: ConversationRequest):
    """
    记忆化对话

    - **messages**: 对话消息列表
    - **user_id**: 用户ID（可选）
    - **agent_id**: 代理ID（可选）
    """
    try:
        conversation = {
            "messages": [msg.dict() for msg in request.messages]
        }

        result = await memory_service.memorize(
            resource_data=conversation,
            modality="conversation",
            user_id=request.user_id,
            agent_id=request.agent_id
        )

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/memory/memorize/text")
async def memorize_text(request: TextMemoryRequest):
    """
    记忆化文本

    - **text**: 文本内容
    - **context**: 上下文信息（可选）
    - **user_id**: 用户ID（可选）
    """
    try:
        text_data = {
            "text": request.text,
            "context": request.context or {}
        }

        result = await memory_service.memorize(
            resource_data=text_data,
            modality="text",
            user_id=request.user_id
        )

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/memory/memorize/document")
async def memorize_document(request: DocumentMemoryRequest):
    """
    记忆化文档

    - **title**: 文档标题
    - **content**: 文档内容
    - **author**: 作者（可选）
    - **user_id**: 用户ID（可选）
    """
    try:
        document = {
            "title": request.title,
            "content": request.content,
            "author": request.author
        }

        result = await memory_service.memorize(
            resource_data=document,
            modality="document",
            user_id=request.user_id
        )

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 检索 API ====================

@app.post("/api/v1/memory/retrieve")
async def retrieve_memory(request: RetrieveRequest):
    """
    检索记忆

    - **queries**: 查询列表
    - **where**: 过滤条件（可选）
    - **limit**: 返回数量限制（可选）
    """
    try:
        queries = [msg.dict() for msg in request.queries]

        result = await memory_service.retrieve(
            queries=queries,
            where=request.where,
            limit=request.limit
        )

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 统计 API ====================

@app.get("/api/v1/memory/statistics")
async def get_statistics():
    """
    获取系统统计信息
    """
    try:
        stats = await memory_service.get_statistics()
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 分类 API ====================

@app.get("/api/v1/memory/categories")
async def get_categories():
    """
    获取所有记忆分类
    """
    try:
        categories = await memory_service.get_all_categories()
        return {
            "success": True,
            "data": {
                "categories": categories,
                "total": len(categories)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/memory/categories/{category_name}")
async def get_category_items(category_name: str):
    """
    获取指定分类的记忆项

    - **category_name**: 分类名称
    """
    try:
        items = await memory_service.search_by_category(category_name)
        return {
            "success": True,
            "data": {
                "category": category_name,
                "items": items,
                "total": len(items)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 记忆项 API ====================

@app.get("/api/v1/memory/items")
async def get_memory_items(user_id: Optional[str] = None):
    """
    获取所有记忆项

    - **user_id**: 可选，按用户ID过滤
    """
    try:
        items = await memory_service.get_all_items(user_id=user_id)
        return {
            "success": True,
            "data": {
                "items": items,
                "total": len(items)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/memory/items/{item_id}")
async def get_memory_item(item_id: str):
    """
    获取记忆项详情

    - **item_id**: 记忆项ID
    """
    try:
        item = await memory_service.database.get_memory_item(item_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"记忆项 {item_id} 不存在")
        
        return {
            "success": True,
            "data": item
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 资源 API ====================

@app.get("/api/v1/memory/resources")
async def get_resources():
    """
    获取所有资源
    """
    try:
        resources = await memory_service.get_all_resources()
        return {
            "success": True,
            "data": {
                "resources": resources,
                "total": len(resources)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/memory/resources/{resource_id}")
async def get_resource(resource_id: str):
    """
    获取资源详情

    - **resource_id**: 资源ID
    """
    try:
        resource = await memory_service.database.get_resource(resource_id)
        if not resource:
            raise HTTPException(status_code=404, detail=f"资源 {resource_id} 不存在")
        
        return {
            "success": True,
            "data": resource
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== 日志配置 ====================

def setup_logging(log_file: str = "hsmem.log"):
    """
    配置日志系统
    将访问日志和应用日志输出到文件
    """
    log_path = Path(log_file)
    
    # 创建日志格式
    log_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 配置根日志记录器
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # 清除现有的处理器
    root_logger.handlers.clear()
    
    # 文件处理器（带日志轮转，最大10MB，保留5个备份）
    file_handler = RotatingFileHandler(
        log_path,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(log_format)
    root_logger.addHandler(file_handler)
    
    # 控制台处理器（同时输出到控制台）
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(log_format)
    root_logger.addHandler(console_handler)
    
    # 配置 uvicorn 的访问日志
    access_logger = logging.getLogger("uvicorn.access")
    access_logger.setLevel(logging.INFO)
    access_logger.addHandler(file_handler)
    access_logger.addHandler(console_handler)
    
    # 配置 uvicorn 的错误日志
    error_logger = logging.getLogger("uvicorn.error")
    error_logger.setLevel(logging.INFO)
    error_logger.addHandler(file_handler)
    error_logger.addHandler(console_handler)
    
    return log_path


# ==================== 启动服务器 ====================

if __name__ == "__main__":
    # 设置日志
    log_file = setup_logging("hsmem.log")
    
    print("""
    ╔═══════════════════════════════════════════════════════╗
    ║          HSMem REST API 服务器                        ║
    ╠═══════════════════════════════════════════════════════╣
    ║  服务地址: http://localhost:8000                      ║
    ║  API 文档: http://localhost:8000/docs                 ║
    ║  健康检查: http://localhost:8000/health               ║
    ║  日志文件: {:<43}║
    ╚═══════════════════════════════════════════════════════╝
    """.format(str(log_file.absolute())))
    
    # 记录启动信息
    logging.info("=" * 60)
    logging.info("HSMem REST API 服务器启动")
    logging.info(f"服务地址: http://localhost:8000")
    logging.info(f"日志文件: {log_file.absolute()}")
    logging.info("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        access_log=True,  # 启用访问日志
        log_config=None   # 使用我们自定义的日志配置
    )
