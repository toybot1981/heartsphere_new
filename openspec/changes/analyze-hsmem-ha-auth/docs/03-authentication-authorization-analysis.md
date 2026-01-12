# HSMem鉴权机制分析

## 1. 当前无鉴权的安全风险分析

### 1.1 未授权访问风险

#### 数据泄露风险
- **所有数据可访问**：任何人都可以调用API读取所有记忆数据
- **敏感信息泄露**：记忆数据可能包含用户个人信息、偏好等敏感信息
- **批量数据导出**：恶意用户可以批量调用API导出所有数据

#### 数据篡改风险
- **任意修改**：任何人都可以修改或删除记忆数据
- **数据污染**：恶意用户可以注入错误或恶意数据
- **服务破坏**：大量无效请求可能导致服务不可用

#### 服务滥用风险
- **无速率限制**：恶意用户可以无限调用API
- **资源耗尽**：大量请求可能导致服务器资源耗尽
- **DDoS攻击**：容易受到分布式拒绝服务攻击

### 1.2 CORS安全风险

#### 当前配置问题
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 风险分析
- **CSRF攻击**：恶意网站可以代表用户调用API
- **信息泄露**：跨域请求可能泄露敏感信息
- **凭证滥用**：`allow_credentials=True` 结合 `allow_origins=["*"]` 存在安全风险

### 1.3 数据隔离缺失

#### 用户数据隔离
- **无用户区分**：所有用户共享同一数据空间
- **跨用户访问**：用户可以访问其他用户的数据
- **隐私泄露**：无法保护用户隐私数据

#### 项目/租户隔离
- **无项目隔离**：不同项目的记忆数据无法隔离
- **多租户支持**：无法支持多租户场景
- **数据混淆**：不同项目的数据可能混淆

## 2. 鉴权方案评估

### 2.1 API Key方案

#### 实现方式
**基本流程**：
1. 为每个客户端分配唯一的API Key
2. 客户端在请求头中携带API Key：`X-API-Key: <key>`
3. 服务端验证API Key的有效性
4. 根据API Key关联的权限控制访问

**代码示例**：
```python
from fastapi import Header, HTTPException, Security
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

# API Key存储（可以是数据库、配置文件等）
VALID_API_KEYS = {
    "key1": {"user_id": "user1", "permissions": ["read", "write"]},
    "key2": {"user_id": "user2", "permissions": ["read"]},
}

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key not in VALID_API_KEYS:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return VALID_API_KEYS[api_key]

@app.post("/api/v1/memory/memorize/conversation")
async def memorize_conversation(
    request: ConversationRequest,
    api_key_info: dict = Depends(verify_api_key)
):
    # 使用api_key_info中的权限信息
    if "write" not in api_key_info["permissions"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    # ... 处理请求
```

#### 优点
- **实施简单**：实现和维护成本低
- **性能好**：验证逻辑简单，性能开销小
- **适合服务间调用**：适合服务到服务的调用场景
- **易于管理**：API Key管理相对简单

#### 缺点
- **Key管理复杂**：需要管理大量API Key
- **权限控制有限**：只能实现简单的权限控制
- **Key泄露风险**：API Key泄露后难以撤销（需要更新Key）
- **无用户信息**：无法携带详细的用户信息

#### 适用场景
- **阶段1实施**：作为基础鉴权方案
- **服务间调用**：内部服务之间的调用
- **简单权限控制**：只需要简单的读写权限控制

### 2.2 JWT Token方案

#### 实现方式
**基本流程**：
1. 用户通过认证服务获取JWT Token
2. 客户端在请求头中携带Token：`Authorization: Bearer <token>`
3. 服务端验证Token签名和有效期
4. 从Token中提取用户信息和权限

**代码示例**：
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# JWT配置
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        permissions: list = payload.get("permissions", [])
        if user_id is None:
            raise HTTPException(status_code=403, detail="Invalid token")
        return {"user_id": user_id, "permissions": permissions}
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

@app.post("/api/v1/memory/memorize/conversation")
async def memorize_conversation(
    request: ConversationRequest,
    token_info: dict = Depends(verify_token)
):
    # 使用token_info中的用户信息和权限
    if "write" not in token_info["permissions"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    # ... 处理请求
```

#### 优点
- **无状态**：服务端无需存储Token，适合分布式
- **信息丰富**：Token中可以携带用户ID、权限等信息
- **标准化**：JWT是标准协议，工具和库丰富
- **灵活性**：可以自定义Token中的信息

#### 缺点
- **Token撤销复杂**：Token在有效期内无法撤销（需要黑名单机制）
- **需要认证服务**：需要独立的认证服务签发Token
- **性能开销**：Token验证需要解密和签名验证
- **Token大小**：Token可能较大，增加请求头大小

#### 适用场景
- **阶段2实施**：作为增强鉴权方案
- **用户认证**：需要用户登录的场景
- **分布式系统**：多服务共享认证信息

### 2.3 OAuth2方案

#### 实现方式
**基本流程**：
1. 客户端通过OAuth2服务器进行认证
2. 获取Access Token和Refresh Token
3. 使用Access Token调用hsmem API
4. Token过期后使用Refresh Token刷新

**FastAPI OAuth2支持**：
```python
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def verify_oauth2_token(token: str = Depends(oauth2_scheme)):
    # 验证Token（可以调用OAuth2服务器验证）
    # 或使用JWT验证（如果OAuth2服务器使用JWT）
    pass
```

#### 优点
- **标准化**：OAuth2是行业标准，兼容性好
- **第三方集成**：支持第三方登录（Google、GitHub等）
- **权限细分**：支持细粒度的权限控制（Scope）
- **Token管理**：支持Access Token和Refresh Token机制

#### 缺点
- **实施复杂**：需要OAuth2服务器，实施复杂度高
- **依赖外部服务**：依赖OAuth2服务器可用性
- **性能开销**：需要与OAuth2服务器交互验证Token
- **过度设计**：对于简单场景可能过度设计

#### 适用场景
- **阶段3实施**：作为高级鉴权方案
- **第三方集成**：需要支持第三方登录
- **企业级应用**：需要完整的OAuth2生态

### 2.4 其他方案

#### Basic Authentication
**实现方式**：用户名密码Base64编码
- **优点**：简单，HTTP标准
- **缺点**：安全性低，不适合生产环境
- **适用**：内部测试环境

#### 自定义Token
**实现方式**：自定义Token格式和验证逻辑
- **优点**：完全可控
- **缺点**：非标准，维护成本高
- **适用**：特殊需求场景

## 3. 适合hsmem的鉴权方案推荐

### 3.1 推荐方案：分阶段实施

#### 阶段1：API Key认证（短期，1-2周）
**目标**：快速实现基础鉴权
- **实施内容**：
  - 实现API Key生成和管理
  - 添加API Key验证中间件
  - 配置CORS白名单
  - 实现基础权限控制（读/写）

**技术选型**：
- FastAPI Security：使用FastAPI的Security依赖
- 存储：配置文件或简单数据库表
- 权限：简单的读写权限

#### 阶段2：JWT Token认证（中期，2-3周）
**目标**：增强鉴权能力
- **实施内容**：
  - 实现JWT Token签发和验证
  - 集成认证服务（或实现简单认证服务）
  - 实现Token刷新机制
  - 实现RBAC权限模型

**技术选型**：
- python-jose：JWT库
- Redis：Token黑名单（可选）
- 数据库：用户和权限存储

#### 阶段3：OAuth2集成（长期，按需）
**目标**：支持第三方集成
- **实施内容**：
  - 集成OAuth2服务器
  - 支持第三方登录
  - 实现Scope权限控制

**技术选型**：
- FastAPI OAuth2：使用FastAPI的OAuth2支持
- 外部OAuth2服务器：或自建OAuth2服务器

### 3.2 方案对比

| 方案 | 实施复杂度 | 性能 | 安全性 | 灵活性 | 推荐阶段 |
|------|-----------|------|--------|--------|----------|
| API Key | 低 | 高 | 中 | 低 | 阶段1 |
| JWT Token | 中 | 中 | 高 | 高 | 阶段2 |
| OAuth2 | 高 | 中 | 高 | 高 | 阶段3 |

## 4. 用户权限控制需求分析

### 4.1 角色定义

#### 基础角色
- **管理员（Admin）**：
  - 所有权限
  - 可以管理API Key
  - 可以查看所有数据
  - 可以删除任何数据

- **普通用户（User）**：
  - 可以创建、读取、更新自己的记忆
  - 可以检索自己的记忆
  - 不能访问其他用户的数据

- **只读用户（ReadOnly）**：
  - 只能读取自己的记忆
  - 不能创建、更新、删除记忆

#### 扩展角色（可选）
- **服务账户（Service Account）**：
  - 用于服务间调用
  - 特定权限（如只能写入，不能读取）

- **审计员（Auditor）**：
  - 可以读取所有数据
  - 可以查看审计日志
  - 不能修改数据

### 4.2 权限模型

#### RBAC（基于角色的访问控制）
**模型设计**：
```
用户 (User)
  └── 角色 (Role)
      └── 权限 (Permission)
          └── 资源 (Resource)
```

**权限定义**：
- `memory:read` - 读取记忆
- `memory:write` - 创建/更新记忆
- `memory:delete` - 删除记忆
- `memory:admin` - 管理所有记忆
- `api_key:manage` - 管理API Key

**角色权限映射**：
- Admin: `memory:*`, `api_key:*`
- User: `memory:read`, `memory:write` (own)
- ReadOnly: `memory:read` (own)

#### ABAC（基于属性的访问控制）
**适用场景**：需要更细粒度的权限控制
- **用户属性**：部门、项目、租户等
- **资源属性**：所属用户、项目、分类等
- **环境属性**：时间、IP地址等

**示例规则**：
- 用户只能访问自己部门的记忆
- 用户只能在工作时间访问
- 用户只能从特定IP访问

### 4.3 资源隔离方案

#### 用户数据隔离
**实现方式**：
- 在数据存储时添加`user_id`字段
- 查询时自动过滤`user_id`
- API Key或Token中携带`user_id`

**代码示例**：
```python
async def memorize_conversation(
    request: ConversationRequest,
    token_info: dict = Depends(verify_token)
):
    user_id = token_info["user_id"]
    # 确保user_id来自Token，而不是请求参数
    result = await memory_service.memorize(
        resource_data=conversation,
        modality="conversation",
        user_id=user_id,  # 使用Token中的user_id
        agent_id=request.agent_id
    )
    return result
```

#### 租户/项目隔离
**实现方式**：
- 添加`tenant_id`或`project_id`字段
- 在Token中携带租户信息
- 查询时自动过滤租户

**数据模型**：
```python
# 在存储时添加tenant_id
{
    "resource_id": "...",
    "user_id": "user_123",
    "tenant_id": "project_abc",  # 租户ID
    "data": {...}
}
```

## 5. CORS安全配置方案

### 5.1 CORS白名单机制

#### 配置方式
```python
# 从配置文件或环境变量读取允许的来源
ALLOWED_ORIGINS = [
    "https://admin.heartsphere.com",
    "https://app.heartsphere.com",
    "http://localhost:3000",  # 开发环境
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # 白名单
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
)
```

#### 动态配置
```python
# 从数据库读取允许的来源
async def get_allowed_origins():
    # 从数据库查询允许的来源列表
    return await db.get_allowed_origins()

# 使用中间件动态检查
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    if origin in await get_allowed_origins():
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = origin
        return response
    return await call_next(request)
```

### 5.2 凭证控制

#### 安全配置
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,  # 只在信任的来源时允许
    allow_methods=["GET", "POST"],
    expose_headers=["X-Request-ID"],
    max_age=3600,  # 预检请求缓存时间
)
```

### 5.3 环境区分

#### 开发环境
```python
if os.getenv("ENV") == "development":
    allow_origins = ["*"]  # 开发环境允许所有来源
else:
    allow_origins = ALLOWED_ORIGINS  # 生产环境使用白名单
```

## 6. 实施建议总结

### 6.1 短期方案（1-2周）

#### 实施内容
1. **API Key认证**：
   - 实现API Key生成和管理API
   - 添加API Key验证中间件
   - 实现基础权限控制

2. **CORS配置**：
   - 配置CORS白名单
   - 区分开发和生产环境

3. **用户数据隔离**：
   - 在API Key中关联user_id
   - 查询时自动过滤user_id

### 6.2 中期方案（2-3周）

#### 实施内容
1. **JWT Token认证**：
   - 实现JWT Token签发和验证
   - 集成认证服务
   - 实现Token刷新

2. **RBAC权限模型**：
   - 实现角色和权限管理
   - 实现基于角色的访问控制

3. **审计日志**：
   - 记录API调用日志
   - 记录权限验证日志

### 6.3 长期方案（按需）

#### 实施内容
1. **OAuth2集成**：
   - 集成OAuth2服务器
   - 支持第三方登录

2. **多租户支持**：
   - 实现租户隔离
   - 实现租户管理

3. **高级安全**：
   - 实现速率限制
   - 实现IP白名单
   - 实现异常检测
