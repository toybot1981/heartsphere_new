# HSMem技术选型建议

## 1. 高可用性技术选型

### 1.1 存储方案选型

#### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **NFS共享存储** | 实施简单，无需数据迁移 | 性能瓶颈，单点故障 | 小规模部署（2-3实例） | ⭐⭐ |
| **PostgreSQL** | ACID事务，强一致性，成熟方案 | 需要数据迁移，关系型设计 | 需要强一致性，复杂查询 | ⭐⭐⭐⭐⭐ |
| **MongoDB** | 文档存储，易迁移，水平扩展 | 最终一致性，运维复杂 | 文档结构，水平扩展需求 | ⭐⭐⭐⭐ |
| **对象存储（S3）** | 高可用，可扩展，成本低 | API延迟，最终一致性 | 云环境，大文件存储 | ⭐⭐⭐ |

#### 推荐方案：PostgreSQL

**理由**：
1. **数据一致性**：hsmem需要保证数据一致性，PostgreSQL的ACID特性适合
2. **查询能力**：支持复杂查询，便于统计和分析
3. **成熟方案**：PostgreSQL有成熟的高可用方案（主从复制、流复制）
4. **社区支持**：丰富的工具和库支持

**实施建议**：
- 使用PostgreSQL 14+
- 使用连接池（如pgBouncer）
- 配置主从复制实现高可用
- 使用JSONB类型存储灵活的JSON数据

### 1.2 负载均衡方案选型

#### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **Nginx** | 成熟稳定，配置灵活，性能好 | 需要单独部署，手动配置 | 自建环境，中小规模 | ⭐⭐⭐⭐ |
| **云负载均衡器** | 自动管理，高可用，无需维护 | 云服务依赖，可能有成本 | 云环境部署 | ⭐⭐⭐⭐⭐ |
| **Kubernetes Service** | 自动服务发现，原生支持 | 需要Kubernetes环境 | Kubernetes环境 | ⭐⭐⭐⭐ |
| **HAProxy** | 功能强大，支持多种算法 | 配置复杂，需要运维 | 大规模部署 | ⭐⭐⭐ |

#### 推荐方案：分场景选择

**自建环境**：Nginx
- 成熟稳定，配置简单
- 支持健康检查
- 性能好，资源占用少

**云环境**：云负载均衡器
- AWS: Application Load Balancer (ALB)
- 阿里云: 应用型负载均衡 (ALB)
- 腾讯云: 应用型负载均衡 (CLB)

**Kubernetes环境**：Kubernetes Service + Ingress
- 原生支持，无需额外组件
- 自动服务发现
- 支持自动扩缩容

### 1.3 服务发现方案选型

#### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **静态配置** | 简单直接，无需额外组件 | 需要手动更新，不够灵活 | 小规模，稳定环境 | ⭐⭐ |
| **Consul** | 自动服务发现，健康检查，多数据中心 | 需要部署Consul，增加复杂度 | 大规模，多环境 | ⭐⭐⭐⭐ |
| **etcd** | 高性能，分布式，Kubernetes原生 | 需要运维，配置复杂 | Kubernetes环境 | ⭐⭐⭐ |
| **Kubernetes Service** | 原生支持，自动管理 | 需要Kubernetes环境 | Kubernetes环境 | ⭐⭐⭐⭐⭐ |

#### 推荐方案：分场景选择

**小规模部署**：静态配置
- 在Nginx或负载均衡器中静态配置后端服务器
- 适合实例数量少且稳定的场景

**中等规模**：Consul
- 自动服务发现
- 健康检查集成
- 支持多数据中心

**Kubernetes环境**：Kubernetes Service
- 原生支持，无需额外组件
- 自动服务发现和负载均衡

### 1.4 容器化方案选型

#### Docker vs Kubernetes

| 特性 | Docker Compose | Kubernetes |
|------|----------------|------------|
| **复杂度** | 低 | 高 |
| **适用规模** | 小到中等 | 大规模 |
| **自动扩缩容** | 不支持 | 支持 |
| **服务发现** | 简单 | 原生支持 |
| **运维成本** | 低 | 高 |
| **学习曲线** | 平缓 | 陡峭 |

#### 推荐方案：分阶段选择

**阶段1-2**：Docker + Docker Compose
- 简单易用，快速实施
- 适合小到中等规模部署
- 降低运维复杂度

**阶段3+**：Kubernetes（如需要）
- 大规模部署
- 需要自动扩缩容
- 有Kubernetes运维能力

## 2. 鉴权技术选型

### 2.1 鉴权库选型

#### Python JWT库对比

| 库 | 优点 | 缺点 | 推荐度 |
|----|------|------|--------|
| **python-jose** | FastAPI推荐，功能完整，支持多种算法 | 依赖较多 | ⭐⭐⭐⭐⭐ |
| **PyJWT** | 轻量级，性能好，广泛使用 | 功能相对简单 | ⭐⭐⭐⭐ |
| **python-jwt** | 简单易用 | 功能有限，维护不活跃 | ⭐⭐ |

#### 推荐方案：python-jose

**理由**：
- FastAPI官方推荐
- 功能完整，支持JWT、JWE等
- 支持多种加密算法
- 文档完善，社区活跃

**安装**：
```bash
pip install python-jose[cryptography]
```

### 2.2 Token管理方案选型

#### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **内存缓存** | 简单快速，无需额外组件 | 无法跨实例共享，重启丢失 | 单实例，开发环境 | ⭐⭐ |
| **Redis** | 高性能，分布式，支持过期 | 需要部署Redis，增加依赖 | 多实例，生产环境 | ⭐⭐⭐⭐⭐ |
| **数据库** | 持久化，查询方便 | 性能较低，增加数据库负载 | 需要持久化Token信息 | ⭐⭐⭐ |

#### 推荐方案：Redis

**理由**：
1. **高性能**：Redis内存存储，性能好
2. **分布式**：多实例可以共享Token黑名单
3. **过期机制**：支持自动过期，适合Token管理
4. **成熟方案**：广泛使用，工具丰富

**使用场景**：
- Token黑名单（撤销的Token）
- Token缓存（减少验证开销）
- 用户会话信息

### 2.3 用户存储方案选型

#### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **配置文件** | 简单直接，无需数据库 | 难以管理，不适合生产 | 开发测试，小规模 | ⭐⭐ |
| **数据库表** | 灵活，易于管理，支持复杂查询 | 需要数据库，增加复杂度 | 生产环境 | ⭐⭐⭐⭐⭐ |
| **LDAP/AD** | 企业级，集中管理 | 实施复杂，需要LDAP服务器 | 企业环境 | ⭐⭐⭐ |

#### 推荐方案：数据库表

**理由**：
1. **灵活性**：可以存储用户信息、权限、角色等
2. **可扩展**：易于添加新字段和功能
3. **查询能力**：支持复杂查询和统计
4. **与存储统一**：如果使用PostgreSQL，可以统一存储

**表结构设计**：
```sql
-- 用户表
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR,
    password_hash VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Key表
CREATE TABLE api_keys (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    key_hash VARCHAR UNIQUE NOT NULL,
    permissions TEXT[],
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 角色表
CREATE TABLE roles (
    id VARCHAR PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    permissions TEXT[]
);

-- 用户角色关联表
CREATE TABLE user_roles (
    user_id VARCHAR REFERENCES users(id),
    role_id VARCHAR REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);
```

## 3. 部署技术选型

### 3.1 容器化技术

#### Docker
**推荐使用**：
- 所有环境都使用Docker容器化
- 统一运行环境
- 简化部署流程

**Dockerfile示例**：
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "rest_api_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3.2 编排工具

#### Docker Compose（推荐用于阶段1-2）
**docker-compose.yml示例**：
```yaml
version: '3.8'

services:
  hsmem:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/hsmem
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=hsmem
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### Kubernetes（推荐用于阶段3+）
**deployment.yaml示例**：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hsmem
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hsmem
  template:
    metadata:
      labels:
        app: hsmem
    spec:
      containers:
      - name: hsmem
        image: hsmem:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hsmem-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: hsmem-service
spec:
  selector:
    app: hsmem
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

## 4. 监控和日志技术选型

### 4.1 监控方案

#### Prometheus + Grafana（推荐）
**优点**：
- 开源，广泛使用
- 丰富的指标和可视化
- 支持告警

**集成方式**：
- 使用`prometheus-fastapi-instrumentator`添加指标
- 配置Prometheus抓取指标
- 使用Grafana可视化

### 4.2 日志方案

#### 结构化日志（推荐）
**使用库**：`structlog`或Python标准`logging`

**配置示例**：
```python
import structlog
import logging

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=False,
)

logger = structlog.get_logger()
```

#### 日志聚合（可选）
- **ELK Stack**：Elasticsearch + Logstash + Kibana
- **Loki**：Grafana Loki（轻量级）
- **云服务**：AWS CloudWatch、阿里云日志服务

## 5. 技术选型总结

### 5.1 推荐技术栈

#### 阶段1-2（快速实施）
- **存储**：PostgreSQL
- **负载均衡**：Nginx（自建）或云负载均衡器（云环境）
- **服务发现**：静态配置
- **容器化**：Docker + Docker Compose
- **鉴权**：API Key + python-jose（JWT准备）
- **Token管理**：Redis
- **用户存储**：PostgreSQL
- **监控**：Prometheus + Grafana

#### 阶段3+（高级功能）
- **存储**：PostgreSQL（主从复制）
- **负载均衡**：Kubernetes Service + Ingress
- **服务发现**：Kubernetes Service Discovery
- **容器化**：Kubernetes
- **鉴权**：JWT Token + OAuth2（可选）
- **Token管理**：Redis集群
- **用户存储**：PostgreSQL（高可用）
- **监控**：Prometheus + Grafana + 告警

### 5.2 技术选型原则

1. **成熟稳定**：优先选择成熟、稳定的技术
2. **简单实用**：避免过度设计，选择简单实用的方案
3. **社区支持**：选择有活跃社区支持的技术
4. **可扩展性**：考虑未来扩展需求
5. **运维成本**：考虑运维复杂度和成本
