# 心域连接管理模块

这是一个独立的心域连接管理模块，提供完整的心域连接功能管理界面。

## 📁 目录结构

```
heartSphereConnection/
├── index.ts                              # 模块统一导出
├── HeartSphereConnectionManagement.tsx    # 主管理组件（标签页导航）
├── ShareConfigManagement.tsx              # 共享配置管理
├── ConnectionRequestManagement.tsx        # 连接请求管理
├── AccessRecordManagement.tsx             # 访问记录管理
├── WarmMessageManagement.tsx              # 留言管理
├── HeartSphereConnectionStatistics.tsx    # 数据统计
├── ExceptionHandlingManagement.tsx         # 异常处理
└── README.md                              # 本文件
```

## 🎯 功能模块

### 1. 共享配置管理
- 查看所有用户的共享配置
- 按用户、共享类型、状态筛选
- 启用/禁用/暂停共享配置
- 删除共享配置
- 批量操作

### 2. 连接请求管理
- 查看所有连接请求
- 按状态筛选
- 审核通过/拒绝连接请求
- 批量审核

### 3. 访问记录管理
- 查看所有访问记录
- 按访问者、被访问者筛选
- 导出访问记录数据

### 4. 留言管理
- 查看所有留言
- 按状态筛选
- 审核留言
- 删除留言
- 批量操作

### 5. 数据统计
- 用户统计（共享用户、连接用户、访问用户等）
- 共享统计（共享配置总数、活跃共享数等）
- 连接统计（连接请求总数、成功率等）
- 访问统计（访问次数、访问时长等）
- 留言统计（留言总数、回复率等）

### 6. 异常处理
- 异常记录管理
- 投诉处理
- 处理历史记录

## 🔌 API集成

所有API调用都通过 `adminApi.heartSphereConnection` 进行，详见：
- `frontend/services/api/admin/heartSphereConnection.ts`

## 🎨 UI特性

- 统一的深色主题（slate-950背景）
- 响应式布局
- 状态徽章（不同颜色表示不同状态）
- 分页支持
- 搜索和筛选功能
- 批量操作支持

## 📝 使用说明

1. 在 `AdminScreen.tsx` 中已集成
2. 在 `AdminSidebar.tsx` 中已添加菜单项
3. 通过侧边栏的"心域连接 HeartSphere"菜单项访问

## 🔧 技术栈

- React + TypeScript
- Tailwind CSS
- 自定义组件（Button, InputGroup等）
- 统一的API服务层

## 📊 数据流

```
用户操作 → 组件 → adminApi.heartSphereConnection → 后端API → 数据库
                ↓
            更新UI状态
```

## 🎯 独立模块设计

本模块完全独立，不依赖其他管理模块：
- 独立的API服务
- 独立的组件目录
- 独立的类型定义
- 可单独测试和维护

---

**模块版本**: V1.0  
**创建日期**: 2025-12-29




