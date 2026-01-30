# Agent Mind 管理模块使用指南

## 概述

Agent Mind 管理模块是 Admin 后台的一个功能模块，用于集中管理智能体的身份认知、状态监控和能力配置。该模块提供了完整的界面和 API，方便管理员进行智能体意识相关的配置和监控。

## 功能模块

### 1. 身份认知管理

#### 功能说明
- 查看所有智能体的身份认知信息
- 搜索和筛选智能体
- 查看身份认知详情
- 初始化身份认知

#### 使用步骤
1. 进入 Agent Mind 管理页面
2. 默认显示"身份认知管理"标签页
3. 在搜索框输入角色名称或角色类型进行搜索
4. 点击"查看详情"按钮查看完整的身份认知信息
5. 查看自我认知水平进度条

#### 数据说明
- **角色ID**: 智能体在系统中的唯一标识
- **角色名称**: 智能体的名称
- **角色类型**: 智能体的角色定位
- **自我认知水平**: 0-100 的数值，表示智能体对自身的理解程度

### 2. 状态监控

#### 功能说明
- 查看智能体的当前状态
- 查看状态历史记录
- 查看状态统计信息
- 分析状态模式

#### 使用步骤
1. 在"身份认知管理"中选择一个角色
2. 切换到"状态监控"标签页
3. 查看当前状态卡片（显示状态类型、描述、持续时间）
4. 查看状态统计卡片（显示总记录数、状态类型分布）
5. 查看状态历史列表（按时间倒序）
6. 使用分页浏览历史记录

#### 状态类型说明
- **IDLE**: 空闲状态
- **THINKING**: 思考中
- **PROCESSING**: 处理中
- **RESPONDING**: 响应中
- **EXECUTING**: 执行中

### 3. 能力管理

#### 功能说明
- 查看智能体的能力列表
- 查看智能体的能力边界
- 管理能力配置

#### 使用步骤
1. 在"身份认知管理"中选择一个角色
2. 切换到"能力管理"标签页
3. 查看能力列表（显示所有能力及其详细信息）
4. 查看能力边界（显示智能体不能做的事情和限制）

#### 数据说明
- **能力列表**: 智能体拥有的技能和能力，以 JSON 格式存储
- **能力边界**: 智能体明确知道不能做的事情，以 JSON 格式存储

## API 使用

### 基础 URL
```
/api/admin/agent-mind
```

### 主要端点

#### 身份认知管理
- `GET /identities` - 获取身份认知列表（支持分页和搜索）
- `GET /identities/{characterId}` - 获取单个身份认知
- `PUT /identities/{characterId}` - 更新身份认知
- `POST /identities/{characterId}/initialize` - 初始化身份认知

#### 状态监控
- `GET /states/{characterId}` - 获取当前状态
- `GET /states/{characterId}/history` - 获取状态历史（支持分页）
- `GET /states/{characterId}/history/range` - 按时间范围获取状态历史
- `GET /states/{characterId}/statistics` - 获取状态统计

#### 能力管理
- `GET /capabilities/{characterId}` - 获取能力列表
- `PUT /capabilities/{characterId}` - 更新能力列表
- `GET /limitations/{characterId}` - 获取能力边界
- `PUT /limitations/{characterId}` - 更新能力边界

### 请求示例

#### 获取身份认知列表
```bash
GET /api/admin/agent-mind/identities?page=0&size=20&search=角色名称
```

#### 获取状态历史
```bash
GET /api/admin/agent-mind/states/1/history?page=0&size=20
```

#### 更新能力列表
```bash
PUT /api/admin/agent-mind/capabilities/1
Content-Type: application/json

[
  {
    "id": "skill_1",
    "name": "对话能力",
    "description": "能够进行自然语言对话",
    "type": "communication"
  }
]
```

## 配置说明

### 数据库配置

在 `application.yml` 中配置 Agent Mind 数据库连接：

```yaml
spring:
  datasource:
    agent-mind:
      url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${AGENT_MIND_DB_NAME:heartsphere_agent_mind}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai&connectionCollation=utf8mb4_unicode_ci
      username: ${DB_USER:root}
      password: ${DB_PASSWORD:123456}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        pool-name: AgentMindHikariPool
        maximum-pool-size: 10
        minimum-idle: 2
        connection-timeout: 30000
        idle-timeout: 600000
        max-lifetime: 1800000
```

### 后端配置

Agent Mind 后端配置（可选，用于数据同步）：

```yaml
agent-mind:
  backend:
    base-url: ${AGENT_MIND_BACKEND_BASE_URL:http://localhost:8086}
```

## 常见问题

### Q: 为什么看不到状态历史？
A: 状态历史需要 Agent Mind 模块记录状态变化。确保 Agent Mind 模块正在运行并记录状态。

### Q: 如何初始化身份认知？
A: 可以通过 API 调用 `POST /api/admin/agent-mind/identities/{characterId}/initialize`，或者在查看身份认知时如果不存在会自动初始化。

### Q: 能力列表是空的怎么办？
A: 能力列表需要从技能系统同步。可以手动更新能力列表，或者等待系统自动同步。

### Q: 数据同步是如何工作的？
A: 当前实现通过直接访问 Agent Mind 数据库实现数据同步。配置更新直接写入数据库，无需额外的同步服务。

## 最佳实践

1. **定期检查状态监控**
   - 定期查看智能体的状态历史，了解智能体的工作模式
   - 分析状态统计，优化智能体的行为

2. **及时更新身份认知**
   - 当角色信息发生变化时，及时更新身份认知
   - 确保能力列表和能力边界与实际一致

3. **监控自我认知水平**
   - 关注自我认知水平的变化
   - 通过配置和训练提升智能体的自我认知能力

4. **使用搜索功能**
   - 当智能体数量较多时，使用搜索功能快速定位
   - 可以按角色名称或角色类型搜索

## 技术支持

如有问题或建议，请联系开发团队或查看项目文档。
