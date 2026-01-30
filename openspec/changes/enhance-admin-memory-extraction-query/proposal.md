# Change: 增强管理端记忆提取查询功能

## Why

当前管理端的记忆管理模块已经集成了 hsmem 服务，支持基本的记忆查询功能。但是，根据 hsmem 记忆系统的三层架构设计（Resource Layer → Memory Item Layer → Memory Category Layer），管理员需要能够方便地查询和查看：

1. **用户的原始资源**（Resource Layer）：查看用户输入的原始对话、文本、文档等数据
2. **提取的记忆项**（Memory Item Layer）：查看从资源中提取出的具体记忆项，包括内容、摘要、类型、分类、重要性等
3. **记忆分类组织**（Memory Category Layer）：查看记忆项如何被组织成不同的分类，以及分类的聚合信息
4. **完整的追溯链**：能够从资源追溯到记忆项，从记忆项追溯到分类，实现完整的记忆提取流程可视化

当前实现虽然支持基本的查询，但缺乏对三层架构的完整展示和追溯能力，无法直观地看到记忆提取的完整过程。

## What Changes

- **ADDED**: 用户记忆提取追溯功能
  - 在用户记忆管理页面添加"记忆提取追溯"视图
  - 支持按用户ID查看该用户的所有原始资源（Resource）
  - 支持查看每个资源对应的记忆项（Memory Items）
  - 支持查看记忆项所属的分类（Categories）
  - 提供资源→记忆项→分类的完整追溯链展示

- **ADDED**: 记忆提取详情查看功能
  - 点击资源可查看原始数据详情
  - 点击记忆项可查看提取详情（内容、摘要、类型、分类、重要性等）
  - 点击分类可查看该分类下的所有记忆项
  - 支持在详情页面中跳转到关联的资源或记忆项

- **ADDED**: 记忆提取统计和可视化
  - 显示用户的资源数量、记忆项数量、分类数量
  - 显示记忆提取的时间分布
  - 显示记忆类型分布（偏好、习惯、个人信息等）
  - 显示分类分布统计

- **MODIFIED**: 现有用户记忆管理组件
  - 增强 UserMemoryManagement 组件，添加记忆提取追溯标签页
  - 优化 HSMem 查询功能，支持按用户ID查询资源、记忆项、分类
  - 添加资源列表、记忆项列表、分类列表的展示
  - 添加详情对话框，展示完整的记忆提取信息

## Impact

- **Affected specs**: 
  - `admin-memory-management` (修改现有规范)

- **Affected code**:
  - 前端：
    - `admin/frontend/src/components/memory/UserMemoryManagement.tsx` - 添加记忆提取追溯功能
    - `admin/frontend/src/services/api/hsmem/hsmemApi.ts` - 添加资源、记忆项、分类查询的API方法
    - 可能需要添加新的组件用于展示三层架构的追溯关系

- **New dependencies**: 无

- **Configuration**: 无

- **Breaking changes**: 无
