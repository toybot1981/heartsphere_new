# Change: Add Daily Life Assistant Scene and Six Character Resources

## Why

需要在资源管理系统中添加"日常生活助手"场景及其下属的6个角色资源。这些资源需要采用极简主义风格，确保提示词符合场景风格和角色定义，并且所有数据必须以UTF-8编码正确插入数据库。

## What Changes

- **ADDED**: 在 `system_eras` 表中添加"日常生活助手"场景，风格设置为"minimalist"（极简主义）
- **ADDED**: 在 `system_characters` 表中添加6个日常生活助手角色：
  1. 时小光 - 时间管理导师
  2. 康小健 - 健康生活顾问
  3. 学小知 - 学习成长导师
  4. 心小暖 - 情绪陪伴师
  5. 心小安 - 心理健康守护者
  6. 暖小阳 - 情感陪伴伙伴
- **ADDED**: 在 `system_resources` 表中添加对应的资源记录（场景资源、角色头像和背景资源）
- **MODIFIED**: 确保所有提示词（prompt）符合极简主义风格和角色定义

## Impact

- **Affected specs**: 资源管理能力（resource-management）
- **Affected code**: 
  - `main/backend/src/main/resources/db/migration/` - 新增数据库迁移脚本
  - `system_eras` 表 - 新增场景记录
  - `system_characters` 表 - 新增6个角色记录
  - `system_resources` 表 - 新增资源记录
- **Database**: 
  - 新增 1 个场景记录（style='minimalist'）
  - 新增 6 个角色记录
  - 新增 13 个资源记录（1个场景资源 + 6个头像资源 + 6个背景资源）

## Design Principles

1. **极简主义风格**:
   - 简洁的线条和几何形状
   - 干净的配色方案（浅色、柔和色调）
   - 最少的装饰元素
   - 功能性优先
   - 现代感和专业感

2. **UTF-8 编码要求**:
   - 所有 SQL 脚本必须使用 `SET NAMES utf8mb4;`
   - 数据库连接必须使用 UTF-8 字符集
   - 所有中文字符必须正确存储和显示

3. **提示词要求**:
   - 场景提示词：体现极简主义风格，符合"日常生活助手"场景定义
   - 角色提示词：符合角色定位和极简主义风格
   - 背景提示词：与角色场景描述一致，极简风格
