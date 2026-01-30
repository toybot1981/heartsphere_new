# Change: 在角色卡片中添加记忆标签页

## Why

心域的核心在于角色，角色除了基本属性，还会有技能，以及记忆。当前角色查看编辑界面缺少对角色记忆信息的展示，用户无法直观地了解角色对当前用户的记忆情况。

通过添加记忆标签页，用户可以：
1. 查看角色对当前用户的所有记忆信息
2. 了解角色与用户的交互历史和重要时刻
3. 为后续的技能和记忆功能优化提供基础

## What Changes

### 1. 角色记忆标签页
- **ADDED**: 在角色查看编辑卡片中增加记忆标签页
  - 显示角色对当前用户的所有记忆信息
  - 支持按记忆类型、重要性等筛选
  - 显示记忆的时间戳、来源等信息
  - 支持 PC 和移动端

### 2. 记忆数据获取
- **ADDED**: 记忆数据获取和展示逻辑
  - 通过记忆系统 API 获取特定角色对当前用户的记忆
  - 根据角色 ID 和用户 ID 过滤记忆数据
  - 支持实时更新和刷新

### 3. 记忆展示组件
- **ADDED**: 记忆列表展示组件
  - 展示记忆内容、类型、重要性
  - 显示记忆的时间戳和来源
  - 支持记忆的展开/收起
  - 提供良好的视觉层次和可读性

## Impact

- **Affected specs**: 
  - `character-memory-view` capability (new)

- **Affected code**:
  - `main/frontend/components/CharacterConstructorModal.tsx` - 添加记忆标签页
  - `main/frontend/components/character/CharacterMemoryTab.tsx` - 新建记忆标签页组件
  - `main/frontend/services/memory-system/` - 使用现有记忆系统 API
  - `main/frontend/services/api/memory/` - 使用现有记忆 API

- **Breaking changes**: 无

- **Performance impact**: 
  - 记忆数据加载可能增加初始加载时间
  - 需要优化记忆数据的懒加载和分页

## Dependencies

- 依赖现有的记忆系统（MemorySystem）
- 依赖记忆 API（memoryApi）
- 需要确保记忆数据中包含角色 ID 信息（metadata.characterId）

## Future Work

- 后续会对技能和记忆相关的功能进行优化和验证
- 可能添加记忆编辑、删除等功能
- 可能添加记忆的统计和分析功能
