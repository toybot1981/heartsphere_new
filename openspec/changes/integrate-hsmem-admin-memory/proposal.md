# Change: 集成HSMem服务到Admin记忆管理模块

## Why

hsmem项目是基于开源项目memU（https://github.com/NevaMind-AI/memU）的记忆系统，未来将独立部署。当前接口文档地址为：http://localhost:8000/docs。主项目需要对记忆接口进行包装后，为其他项目提供记忆服务。

当前admin记忆管理模块缺乏与hsmem服务的集成，无法通过可视化页面对记忆进行模拟测试、查询、删除等操作。需要修改admin记忆管理模块，使其能够直接调用hsmem服务的REST API接口，提供完整的记忆管理功能。

## What Changes

- **ADDED**: Admin记忆管理模块与hsmem服务集成
  - 创建hsmem API客户端服务，封装对http://localhost:8000的API调用
  - 添加记忆模拟测试功能，支持对话、文本、文档三种类型的记忆化测试
  - 增强记忆查询功能，支持通过hsmem API进行记忆检索
  - 添加记忆删除功能，支持删除资源、记忆项和分类
  - 添加可视化界面组件，提供记忆测试、查询、删除的可视化操作界面

- **MODIFIED**: 现有Admin记忆管理组件
  - 更新MemoryDashboard组件，集成hsmem服务的统计信息
  - 更新UserMemoryManagement组件，支持通过hsmem API查询和删除记忆
  - 添加新的记忆测试组件，提供模拟测试功能

## Impact

- **Affected specs**: 
  - `admin-memory-management` (新增规范)

- **Affected code**:
  - 后端：
    - 创建hsmem API包装服务（可选，如果需要在后端包装）
  - 前端：
    - `admin/frontend/src/services/api/hsmem/` - hsmem API客户端
    - `admin/frontend/src/components/memory/MemoryTesting.tsx` - 记忆测试组件（新增）
    - `admin/frontend/src/components/memory/MemoryDashboard.tsx` - 更新以集成hsmem统计
    - `admin/frontend/src/components/memory/UserMemoryManagement.tsx` - 更新以支持hsmem查询和删除
    - `admin/frontend/src/components/memory/MemoryManagement.tsx` - 添加测试标签页

- **New dependencies**:
  - 前端可能需要添加HTTP客户端库（如果还没有）

- **Configuration**:
  - 需要配置hsmem服务地址（http://localhost:8000）
  - 可能需要配置CORS（hsmem服务已支持CORS）

- **Breaking changes**: 无
