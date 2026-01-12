# Design: 集成HSMem服务到Admin记忆管理模块

## Context

hsmem项目是基于memU的记忆系统，提供REST API服务运行在http://localhost:8000。当前admin记忆管理模块需要集成hsmem服务，提供可视化界面进行记忆的模拟测试、查询、删除等操作。

## Goals / Non-Goals

### Goals
- 在admin前端直接调用hsmem REST API，无需后端包装（简化架构）
- 提供完整的记忆管理功能：测试、查询、删除
- 保持现有admin记忆管理模块的结构和风格
- 支持对话、文本、文档三种记忆类型的测试

### Non-Goals
- 不在后端创建hsmem API包装服务（除非有安全或跨域需求）
- 不修改hsmem服务本身
- 不实现复杂的记忆编辑功能（仅支持测试、查询、删除）

## Decisions

### Decision 1: 前端直接调用hsmem API
**What**: Admin前端直接调用http://localhost:8000的REST API
**Why**: 
- 简化架构，减少中间层
- hsmem服务已支持CORS
- 当前是开发环境，localhost访问无安全风险

**Alternatives considered**:
- 在后端创建包装服务：增加了复杂性，当前不需要

### Decision 2: 使用现有的HTTP客户端
**What**: 使用admin前端现有的request工具（如fetch或axios）
**Why**: 保持代码一致性，复用现有基础设施

### Decision 3: 记忆删除功能
**What**: 如果hsmem API不提供删除接口，则通过查询接口获取数据，在前端标记为"已删除"（或联系hsmem团队添加删除接口）
**Why**: 需要先确认hsmem API是否支持删除操作

**Alternatives considered**:
- 等待hsmem添加删除接口：可能延迟功能实现

## API接口映射

### hsmem API → Admin功能
- `GET /health` → 服务健康检查
- `GET /api/v1/memory/statistics` → Dashboard统计信息
- `POST /api/v1/memory/memorize/conversation` → 对话记忆测试
- `POST /api/v1/memory/memorize/text` → 文本记忆测试
- `POST /api/v1/memory/memorize/document` → 文档记忆测试
- `POST /api/v1/memory/retrieve` → 记忆查询
- `GET /api/v1/memory/categories` → 获取分类列表
- `GET /api/v1/memory/categories/{category_name}` → 获取分类下的记忆项

## 组件结构

```
admin/frontend/src/
├── services/api/hsmem/
│   └── hsmemApi.ts          # hsmem API客户端
└── components/memory/
    ├── MemoryTesting.tsx    # 记忆测试组件（新增）
    ├── MemoryDashboard.tsx  # 更新：集成hsmem统计
    ├── UserMemoryManagement.tsx  # 更新：集成hsmem查询和删除
    └── MemoryManagement.tsx # 更新：添加测试标签
```

## Risks / Trade-offs

### Risk 1: CORS问题
**Risk**: 如果hsmem服务CORS配置不正确，前端无法访问
**Mitigation**: hsmem服务已配置CORS中间件，支持所有来源

### Risk 2: 服务地址硬编码
**Risk**: localhost:8000硬编码在代码中
**Mitigation**: 使用环境变量或配置文件，支持不同环境配置

### Risk 3: hsmem API变更
**Risk**: hsmem API接口可能变更
**Mitigation**: 封装API调用到独立服务文件，便于维护

## Migration Plan

1. 创建hsmem API客户端服务
2. 创建记忆测试组件
3. 更新现有组件集成hsmem功能
4. 测试所有功能
5. 部署到开发环境验证

## Open Questions

- hsmem API是否提供删除接口？如果没有，如何实现删除功能？
- 是否需要支持批量操作？
- 是否需要添加记忆编辑功能？
