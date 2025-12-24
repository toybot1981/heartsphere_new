# 计费管理前端模块

## 概述

计费管理前端模块提供了完整的AI服务计费管理功能，包括提供商管理、模型管理、资费配置、使用记录查询、成本统计和用户配额管理。

## 模块结构

```
billing/
├── BillingManagement.tsx      # 主组件，整合所有子功能
├── ProvidersManagement.tsx     # AI提供商管理
├── ModelsManagement.tsx        # AI模型管理
├── PricingManagement.tsx       # 资费配置管理
├── UsageRecordsView.tsx        # 使用记录查看
├── CostStatisticsView.tsx      # 成本统计查看
├── UserQuotaManagement.tsx     # 用户配额管理
├── index.ts                    # 模块导出
└── README.md                   # 本文档
```

## 功能说明

### 1. 提供商管理 (ProvidersManagement)
- 创建、编辑、删除AI提供商
- 查看提供商列表和状态
- 支持启用/禁用提供商

### 2. 模型管理 (ModelsManagement)
- 创建、编辑、删除AI模型
- 关联模型到提供商
- 设置模型类型（文本/图片/音频/视频）
- 支持启用/禁用模型

### 3. 资费配置管理 (PricingManagement)
- 配置模型的计费标准
- 支持多种计费类型（输入Token、输出Token、图片、音频、视频）
- 设置单价、最低计费单位
- 配置生效日期和失效日期

### 4. 使用记录查看 (UsageRecordsView)
- 查询AI服务使用记录
- 支持多条件筛选（用户ID、提供商、模型、日期范围）
- 分页显示使用记录
- 显示Token使用量、费用、状态等信息

### 5. 成本统计 (CostStatisticsView)
- 查看按日期、提供商、模型的成本统计
- 显示总成本、总使用量、总调用次数
- 支持日期范围筛选
- 展示详细的成本明细

### 6. 用户配额管理 (UserQuotaManagement)
- 查询用户的Token配额详情
- 显示各类配额的已用/剩余情况
- 支持手动分配配额给用户
- 显示配额使用统计

## 使用方法

### 在管理后台中使用

1. 在侧边栏中点击"计费管理 Billing"进入计费管理模块
2. 使用顶部子导航切换不同的管理功能
3. 各功能模块支持独立的CRUD操作

### API服务

API服务位于 `frontend/services/api/billing.ts`，提供以下API：

- `billingApi.providers.*` - 提供商管理API
- `billingApi.models.*` - 模型管理API
- `billingApi.pricing.*` - 资费配置API
- `billingApi.usage.*` - 使用记录API
- `billingApi.cost.*` - 成本统计API
- `billingApi.quota.*` - 用户配额API

## 代码规范

- 所有组件文件均控制在500行以内
- 使用TypeScript进行类型检查
- 遵循React Hooks最佳实践
- 统一的UI风格和交互体验
- 错误处理和用户提示完善

## 依赖项

- React
- TypeScript
- Tailwind CSS（用于样式）
- 管理后台通用组件（AdminUIComponents）
- API服务（billingApi）

## 注意事项

1. 所有API调用都需要adminToken认证
2. 删除操作不可恢复，请谨慎操作
3. 计费配置修改会影响后续的计费计算
4. 用户配额分配会实时生效

## 后续优化建议

1. 添加数据可视化图表（成本趋势、使用量统计等）
2. 支持批量操作（批量启用/禁用、批量删除等）
3. 添加导出功能（导出使用记录、成本统计等）
4. 支持更复杂的筛选和排序功能
5. 添加操作日志记录功能

