# Agent Mind 管理模块

## 概述

Agent Mind 管理模块是 Admin 后台的一个功能模块，用于集中管理智能体的身份认知、状态监控和能力配置。该模块提供了完整的界面和 API，方便管理员进行智能体意识相关的配置和监控。

## 功能特性

- ✅ **身份认知管理**: 查看、搜索、管理智能体的身份认知信息
- ✅ **状态监控**: 实时查看智能体的当前状态和历史记录
- ✅ **能力管理**: 管理智能体的能力列表和能力边界
- ✅ **数据同步**: 通过直接数据库访问实现数据同步
- ✅ **完整 API**: 提供 12 个 RESTful API 端点
- ✅ **现代化 UI**: 使用 Tailwind CSS 的深色主题界面

## 快速开始

查看 [QUICK_START.md](./QUICK_START.md) 了解如何快速启动和使用。

## 文档

- **[实施总结](./IMPLEMENTATION_SUMMARY.md)**: 详细的技术实施总结
- **[使用指南](./USAGE_GUIDE.md)**: 完整的功能使用说明
- **[快速开始](./QUICK_START.md)**: 快速启动和验证指南
- **[完成清单](./COMPLETION_CHECKLIST.md)**: 完成情况检查清单
- **[设计文档](./design.md)**: 技术设计说明
- **[提案文档](./proposal.md)**: 功能提案和需求

## 项目结构

### 后端文件
```
admin/backend/src/main/java/com/heartsphere/admin/
├── entity/agentmind/
│   ├── AgentIdentity.java
│   └── AgentStateHistory.java
├── repository/agentmind/
│   ├── AgentIdentityRepository.java
│   └── AgentStateHistoryRepository.java
├── service/
│   └── AgentMindManagementService.java
├── service/impl/
│   └── AgentMindManagementServiceImpl.java
├── controller/
│   └── AgentMindManagementController.java
└── dto/agentmind/
    ├── AgentIdentityDTO.java
    ├── AgentStateHistoryDTO.java
    └── AgentStateStatisticsDTO.java
```

### 前端文件
```
admin/frontend/src/
├── services/api/admin/
│   └── agentMind.ts
└── pages/
    └── AgentMindManagementPage.tsx
```

## API 端点

### 身份认知管理
- `GET /api/admin/agent-mind/identities` - 获取身份认知列表
- `GET /api/admin/agent-mind/identities/{characterId}` - 获取单个身份认知
- `PUT /api/admin/agent-mind/identities/{characterId}` - 更新身份认知
- `POST /api/admin/agent-mind/identities/{characterId}/initialize` - 初始化身份认知

### 状态监控
- `GET /api/admin/agent-mind/states/{characterId}` - 获取当前状态
- `GET /api/admin/agent-mind/states/{characterId}/history` - 获取状态历史
- `GET /api/admin/agent-mind/states/{characterId}/history/range` - 按时间范围获取状态历史
- `GET /api/admin/agent-mind/states/{characterId}/statistics` - 获取状态统计

### 能力管理
- `GET /api/admin/agent-mind/capabilities/{characterId}` - 获取能力列表
- `PUT /api/admin/agent-mind/capabilities/{characterId}` - 更新能力列表
- `GET /api/admin/agent-mind/limitations/{characterId}` - 获取能力边界
- `PUT /api/admin/agent-mind/limitations/{characterId}` - 更新能力边界

## 技术栈

- **后端**: Spring Boot 3.2.0, Spring Data JPA, MySQL
- **前端**: React, TypeScript, Tailwind CSS, Vite
- **API 文档**: Swagger/OpenAPI

## 配置要求

### 数据库
- MySQL 5.7+ 或 8.0+
- 数据库名: `heartsphere_agent_mind`
- 需要创建的表: `agent_identity`, `agent_state_history`

### 环境变量
- `DB_HOST`: 数据库主机（默认: localhost）
- `DB_PORT`: 数据库端口（默认: 3306）
- `DB_USER`: 数据库用户名（默认: root）
- `DB_PASSWORD`: 数据库密码
- `AGENT_MIND_DB_NAME`: Agent Mind 数据库名（默认: heartsphere_agent_mind）

## 开发状态

✅ **核心功能已完成**
- 所有主要功能已实现
- 前端界面已完善
- API 文档已添加
- 使用文档已创建

📋 **待完善项目**
- 单元测试和集成测试
- 功能增强（编辑功能、数据可视化）
- 性能优化

## 贡献

如有问题或建议，请：
1. 查看相关文档
2. 检查代码注释
3. 联系开发团队

## 许可证

本项目遵循项目主许可证。
