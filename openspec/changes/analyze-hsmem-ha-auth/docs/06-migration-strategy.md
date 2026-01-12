# HSMem迁移策略

## 1. 数据迁移策略

### 1.1 迁移准备

#### 数据评估
- **数据量评估**：
  - 统计资源文件数量
  - 统计记忆项数量
  - 统计分类数量
  - 评估数据总大小

- **数据完整性检查**：
  - 验证JSON文件完整性
  - 检查数据关联关系
  - 识别损坏或异常数据

- **备份策略**：
  - 创建完整数据备份
  - 备份存储到安全位置
  - 验证备份可恢复性

#### 环境准备
- **数据库环境**：
  - 安装和配置PostgreSQL
  - 创建数据库和用户
  - 配置连接池

- **测试环境**：
  - 搭建测试环境
  - 准备测试数据
  - 配置测试工具

### 1.2 迁移方案

#### 方案1：全量迁移（推荐用于小数据量）

**流程**：
1. 停止服务（维护窗口）
2. 执行全量数据迁移
3. 验证数据完整性
4. 切换存储后端
5. 启动服务

**优点**：
- 实施简单
- 数据一致性保证
- 迁移时间可控

**缺点**：
- 需要停机
- 迁移期间服务不可用

**适用场景**：
- 数据量较小（<10GB）
- 可以接受短暂停机
- 迁移时间可控

#### 方案2：增量迁移（推荐用于大数据量）

**流程**：
1. 实现双写机制（同时写入文件和数据库）
2. 后台执行历史数据迁移
3. 验证数据一致性
4. 逐步切换到只写数据库
5. 停止文件写入
6. 完成剩余数据迁移

**优点**：
- 无需停机
- 可以逐步迁移
- 风险可控

**缺点**：
- 实施复杂
- 需要双写机制
- 迁移时间较长

**适用场景**：
- 数据量较大（>10GB）
- 不能接受停机
- 需要零停机迁移

### 1.3 迁移脚本设计

#### 数据迁移脚本结构
```python
# migrate_to_postgresql.py

import asyncio
import json
from pathlib import Path
import asyncpg
from datetime import datetime

class DataMigrator:
    def __init__(self, file_base_path: str, db_url: str):
        self.file_base_path = Path(file_base_path)
        self.db_url = db_url
        self.pool = None
    
    async def connect_db(self):
        """连接数据库"""
        self.pool = await asyncpg.create_pool(self.db_url)
    
    async def migrate_resources(self):
        """迁移资源数据"""
        resources_path = self.file_base_path / "resources"
        # 遍历所有资源文件
        # 读取JSON数据
        # 插入到PostgreSQL
        pass
    
    async def migrate_items(self):
        """迁移记忆项数据"""
        items_path = self.file_base_path / "items"
        # 遍历所有记忆项文件
        # 读取JSON数据
        # 插入到PostgreSQL
        pass
    
    async def migrate_categories(self):
        """迁移分类数据"""
        categories_path = self.file_base_path / "categories"
        # 遍历所有分类文件
        # 读取JSON数据
        # 插入到PostgreSQL
        pass
    
    async def verify_migration(self):
        """验证迁移结果"""
        # 比较文件数量和数据库记录数
        # 抽样验证数据内容
        # 验证关联关系
        pass
    
    async def migrate(self):
        """执行完整迁移"""
        await self.connect_db()
        await self.migrate_resources()
        await self.migrate_items()
        await self.migrate_categories()
        await self.verify_migration()
        await self.pool.close()

# 使用示例
async def main():
    migrator = DataMigrator(
        file_base_path="./api_memory_data",
        db_url="postgresql://user:pass@localhost/hsmem"
    )
    await migrator.migrate()

if __name__ == "__main__":
    asyncio.run(main())
```

### 1.4 数据验证

#### 完整性验证
- **数量验证**：比较文件数量和数据库记录数
- **内容验证**：抽样验证数据内容一致性
- **关联验证**：验证资源、记忆项、分类之间的关联关系

#### 一致性验证
- **数据一致性**：验证迁移后数据与原始数据一致
- **关联一致性**：验证外键关联正确
- **时间一致性**：验证时间戳正确迁移

## 2. API兼容性策略

### 2.1 API版本管理

#### 版本策略
- **URL版本**：使用URL路径版本（`/api/v1/`, `/api/v2/`）
- **向后兼容**：保持v1版本可用，新功能在v2实现
- **废弃计划**：制定v1版本废弃时间表

#### 版本实现
```python
# v1 API（无鉴权，保持兼容）
@app.post("/api/v1/memory/memorize/conversation")
async def memorize_conversation_v1(request: ConversationRequest):
    # 原有逻辑，无鉴权
    pass

# v2 API（有鉴权）
@app.post("/api/v2/memory/memorize/conversation")
async def memorize_conversation_v2(
    request: ConversationRequest,
    token_info: dict = Depends(verify_token)
):
    # 新逻辑，有鉴权
    pass
```

### 2.2 渐进式部署

#### 阶段1：双版本并存
- v1版本保持可用（无鉴权）
- v2版本部署（有鉴权）
- 客户端逐步迁移到v2

#### 阶段2：v2为主
- v2版本成为主要版本
- v1版本标记为废弃
- 新功能只在v2实现

#### 阶段3：v1废弃
- 停止v1版本支持
- 移除v1代码
- 所有客户端使用v2

### 2.3 客户端迁移指南

#### 迁移步骤
1. **更新API地址**：从`/api/v1/`改为`/api/v2/`
2. **添加认证**：在请求头中添加认证信息
3. **处理错误**：处理新的错误响应
4. **测试验证**：充分测试新API

#### 迁移示例
```python
# 旧代码（v1）
response = requests.post(
    "http://localhost:8000/api/v1/memory/memorize/conversation",
    json={"messages": [...]}
)

# 新代码（v2）
response = requests.post(
    "http://localhost:8000/api/v2/memory/memorize/conversation",
    json={"messages": [...]},
    headers={"Authorization": "Bearer <token>"}
)
```

## 3. 存储后端切换策略

### 3.1 存储抽象层

#### 接口设计
```python
from abc import ABC, abstractmethod

class StorageInterface(ABC):
    @abstractmethod
    async def store_resource(self, resource_data: dict, modality: str) -> str:
        pass
    
    @abstractmethod
    async def get_resource(self, resource_id: str) -> dict:
        pass
    
    @abstractmethod
    async def store_memory_item(self, item: dict, resource_id: str) -> str:
        pass
    
    # ... 其他方法
```

#### 实现存储适配器
```python
# 文件存储适配器
class FileStorageAdapter(StorageInterface):
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        # 原有文件存储逻辑
    
# PostgreSQL存储适配器
class PostgreSQLStorageAdapter(StorageInterface):
    def __init__(self, db_url: str):
        self.pool = asyncpg.create_pool(db_url)
        # PostgreSQL存储逻辑
```

### 3.2 配置切换

#### 配置方式
```python
# config.py
STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "file")  # file 或 postgresql

if STORAGE_BACKEND == "file":
    storage = FileStorageAdapter("./api_memory_data")
elif STORAGE_BACKEND == "postgresql":
    storage = PostgreSQLStorageAdapter(DATABASE_URL)
```

#### 切换流程
1. **准备阶段**：部署新存储后端，验证功能
2. **切换阶段**：更新配置，重启服务
3. **验证阶段**：验证服务正常工作
4. **回滚准备**：保留原配置，准备回滚

## 4. 鉴权迁移策略

### 4.1 可选鉴权阶段

#### 实现方式
```python
# 配置鉴权是否必需
AUTH_REQUIRED = os.getenv("AUTH_REQUIRED", "false").lower() == "true"

@app.post("/api/v1/memory/memorize/conversation")
async def memorize_conversation(
    request: ConversationRequest,
    token_info: Optional[dict] = Depends(verify_token_optional)
):
    # 如果AUTH_REQUIRED=False，token_info可能为None
    # 如果AUTH_REQUIRED=True，token_info必须有效
    pass
```

#### 迁移流程
1. **阶段1**：AUTH_REQUIRED=False，鉴权可选
2. **阶段2**：AUTH_REQUIRED=True，鉴权必需，但保持v1兼容
3. **阶段3**：v2版本，鉴权必需

### 4.2 API Key迁移到JWT

#### 迁移策略
- **双认证支持**：同时支持API Key和JWT Token
- **逐步迁移**：客户端逐步从API Key迁移到JWT
- **API Key废弃**：所有客户端迁移后废弃API Key

## 5. 回滚策略

### 5.1 数据回滚

#### 回滚准备
- **备份保留**：保留原始文件数据备份
- **回滚脚本**：准备从数据库回滚到文件的脚本
- **验证机制**：验证回滚后数据完整性

#### 回滚流程
1. 停止服务
2. 恢复文件数据
3. 切换存储后端配置
4. 启动服务
5. 验证服务正常

### 5.2 API回滚

#### 回滚准备
- **版本保留**：保留v1版本代码
- **配置切换**：通过配置切换API版本
- **客户端通知**：通知客户端回滚

#### 回滚流程
1. 更新配置，启用v1版本
2. 禁用v2版本（或标记为废弃）
3. 重启服务
4. 通知客户端

## 6. 迁移检查清单

### 6.1 迁移前检查
- [ ] 数据备份完成
- [ ] 测试环境验证通过
- [ ] 迁移脚本测试通过
- [ ] 回滚方案准备就绪
- [ ] 迁移计划制定
- [ ] 团队通知和培训

### 6.2 迁移中检查
- [ ] 数据迁移执行
- [ ] 数据验证通过
- [ ] 服务切换成功
- [ ] 功能验证通过
- [ ] 性能验证通过

### 6.3 迁移后检查
- [ ] 服务正常运行
- [ ] 监控指标正常
- [ ] 错误日志检查
- [ ] 用户反馈收集
- [ ] 迁移总结文档

## 7. 迁移时间表示例

### 小规模迁移（<10GB数据）
- **准备阶段**：1-2天
- **迁移执行**：2-4小时（维护窗口）
- **验证阶段**：1天
- **总计**：3-4天

### 大规模迁移（>10GB数据）
- **准备阶段**：3-5天
- **增量迁移**：1-2周（后台执行）
- **切换阶段**：1天
- **验证阶段**：2-3天
- **总计**：2-3周
