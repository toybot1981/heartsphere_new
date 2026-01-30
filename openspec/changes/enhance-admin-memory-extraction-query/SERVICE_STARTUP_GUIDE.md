# 服务启动指南

## 🚀 快速启动

### 1. 启动 HSMem 服务

```bash
cd /Users/admin/Workspace/heartsphere_new/hsmem
python3 rest_api_server.py
```

**验证**:
```bash
curl http://localhost:8000/health
```

**预期响应**:
```json
{
  "status": "healthy",
  "statistics": {
    "resources_count": 4,
    "items_count": 6,
    "categories_count": 12
  }
}
```

### 2. 启动 Admin 后端

```bash
cd /Users/admin/Workspace/heartsphere_new/admin/backend
mvn spring-boot:run
```

**验证**:
```bash
curl http://localhost:8085/actuator/health
```

### 3. 启动 Admin 前端

```bash
cd /Users/admin/Workspace/heartsphere_new/admin/frontend
npm run dev
# 或
yarn dev
```

**访问**: http://localhost:3005

## 📋 服务端口

- **HSMem**: http://localhost:8000
- **Admin 后端**: http://localhost:8085
- **Admin 前端**: http://localhost:3005

## ✅ 服务状态检查

### 检查 HSMem 服务
```bash
# 检查进程
ps aux | grep rest_api_server.py

# 检查端口
lsof -ti:8000

# 检查健康状态
curl http://localhost:8000/health
```

### 检查 Admin 后端
```bash
# 检查端口
lsof -ti:8085

# 检查健康状态
curl http://localhost:8085/actuator/health
```

### 检查 Admin 前端
```bash
# 检查端口
lsof -ti:3005

# 访问页面
open http://localhost:3005
```

## 🧪 快速测试

### 测试 HSMem API

```bash
# 1. 健康检查
curl http://localhost:8000/health

# 2. 获取所有记忆项
curl http://localhost:8000/api/v1/memory/items

# 3. 按用户ID查询
curl "http://localhost:8000/api/v1/memory/items?user_id=test_user_002"

# 4. 获取所有资源
curl http://localhost:8000/api/v1/memory/resources

# 5. 获取统计信息
curl http://localhost:8000/api/v1/memory/statistics
```

## 🐛 常见问题

### HSMem 服务无法启动

**检查**:
1. Python 版本: `python3 --version` (需要 3.8+)
2. 依赖安装: `pip3 install fastapi uvicorn`
3. 端口占用: `lsof -ti:8000`

### Admin 后端无法启动

**检查**:
1. Java 版本: `java -version` (需要 17+)
2. Maven 版本: `mvn --version`
3. 数据库连接: 检查 MySQL 是否运行
4. 端口占用: `lsof -ti:8085`

### Admin 前端无法启动

**检查**:
1. Node.js 版本: `node --version` (需要 18+)
2. 依赖安装: `npm install` 或 `yarn install`
3. 端口占用: `lsof -ti:3005`

## 📝 测试数据准备

如果需要测试数据，可以使用以下 Python 脚本：

```python
import asyncio
from hscore import MemoryService

async def create_test_data():
    service = MemoryService(base_path='./api_memory_data')
    
    conversation = {
        'messages': [
            {'role': 'user', 'content': '我叫测试用户，是一名软件工程师'},
            {'role': 'assistant', 'content': '你好测试用户！'},
            {'role': 'user', 'content': '我喜欢Python和TypeScript编程'}
        ]
    }
    
    result = await service.memorize(
        resource_data=conversation,
        modality='conversation',
        user_id='test_user_001'
    )
    
    print(f'创建成功: {result["items_count"]} 个记忆项')

asyncio.run(create_test_data())
```

保存为 `create_test_data.py`，然后运行：
```bash
cd hsmem
python3 create_test_data.py
```
