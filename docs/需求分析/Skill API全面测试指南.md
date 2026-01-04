# Skill API 全面测试指南

## 概述

本指南提供了对 Skill 相关 API 进行全面测试的详细步骤，包括 API 调用和数据库验证。

## 测试脚本

**脚本位置**: `scripts/test_skill_api_comprehensive.sh`

**功能**:
- 分步骤测试所有 Skill 相关 API
- 每个步骤后验证数据库状态
- 自动清理测试数据

## 测试步骤

### 步骤 0: 准备阶段
- 检查后端服务状态
- 登录获取认证 Token
- 查询数据库初始状态（技能数量、绑定数量）

### 步骤 1: 技能管理 API 测试
1. **获取所有技能** (`GET /api/skills`)
   - 验证返回的技能列表
   - 验证数据库中的技能数量

2. **获取可用技能** (`GET /api/skills/available`)
   - 验证返回有 function_schema 的技能

3. **创建测试技能** (`POST /api/skills`)
   - 创建测试技能
   - 验证数据库中的技能记录

4. **根据ID获取技能** (`GET /api/skills/{skillId}`)
   - 验证返回的技能信息

5. **更新技能** (`PUT /api/skills/{skillId}`)
   - 更新技能信息
   - 验证数据库中的更新

### 步骤 2: 角色技能装备 API 测试
1. **获取角色已装备技能** (`GET /api/characters/{characterId}/skills`)
   - 获取初始状态
   - 装备后再次获取，验证数量变化

2. **装备技能** (`POST /api/characters/{characterId}/skills/{skillId}/equip`)
   - 装备技能到角色
   - 验证数据库中的绑定记录
   - 验证装备参数（isEnabled, priority）

3. **获取角色已启用技能** (`GET /api/characters/{characterId}/skills/enabled`)
   - 验证返回的已启用技能

4. **设置自动触发** (`PUT /api/characters/{characterId}/skills/{skillId}/auto-trigger`)
   - 设置自动触发
   - 验证数据库中的 auto_trigger 字段

5. **设置优先级** (`PUT /api/characters/{characterId}/skills/{skillId}/priority`)
   - 设置优先级
   - 验证数据库中的 priority 字段

6. **启用/禁用技能** (`PUT /api/characters/{characterId}/skills/{skillId}/toggle`)
   - 禁用技能，验证 is_enabled = 0
   - 重新启用技能，验证 is_enabled = 1

### 步骤 3: 技能执行 API 测试
1. **执行技能** (`POST /api/skills/execute`)
   - 执行测试技能
   - 验证执行结果
   - 验证数据库中的执行记录
   - 验证使用次数更新

2. **获取角色可用技能（Function Calling）** (`GET /api/skills/character/{characterId}/available`)
   - 验证返回的 Function Definition 列表

3. **检查自动触发技能** (`POST /api/skills/character/{characterId}/auto-trigger`)
   - 验证自动触发逻辑

### 步骤 4: 清理和最终验证
1. **卸载技能** (`DELETE /api/characters/{characterId}/skills/{skillId}/unequip`)
   - 卸载技能
   - 验证数据库中的绑定记录已删除

2. **删除技能** (`DELETE /api/skills/{skillId}`)
   - 删除测试技能
   - 验证数据库中的技能记录已删除

3. **最终数据库状态**
   - 对比初始状态和最终状态
   - 确保测试数据已清理

## 使用方法

### 基本用法

```bash
cd /Users/admin/Workspace/heartsphere_new
./scripts/test_skill_api_comprehensive.sh
```

### 指定参数

```bash
# 指定用户名和密码
./scripts/test_skill_api_comprehensive.sh admin 123456

# 指定用户名、密码和角色ID
./scripts/test_skill_api_comprehensive.sh admin 123456 1
```

### 参数说明

- `username` (可选): 登录用户名，默认: `admin`
- `password` (可选): 登录密码，默认: `123456`
- `characterId` (可选): 测试使用的角色ID，默认: `1`

## 前置要求

1. **后端服务运行**
   ```bash
   # 确保后端服务在 http://localhost:8081 运行
   curl http://localhost:8081/api/health
   ```

2. **数据库连接**
   - MySQL 数据库: `localhost:3306`
   - 数据库名: `heartsphere`
   - 用户名: `root`
   - 密码: `123456`
   - 需要安装 `mysql` 命令行工具

3. **Python 3**
   - 用于解析 JSON 响应
   - 需要安装 `python3`

4. **curl**
   - 用于发送 HTTP 请求

## 数据库验证

脚本会在每个关键步骤后验证数据库状态：

### 技能定义表 (skill_definitions)
- 验证技能创建、更新、删除
- 验证字段值（name, description, execution_type 等）

### 角色技能绑定表 (character_skill_bindings)
- 验证装备、卸载操作
- 验证字段值（is_enabled, auto_trigger, priority, usage_count）

### 技能执行记录表 (skill_executions)
- 验证执行记录
- 验证执行结果和耗时

## 测试覆盖的 API

### SkillController
- ✅ `GET /api/skills` - 获取所有技能
- ✅ `GET /api/skills/available` - 获取可用技能
- ✅ `GET /api/skills/{skillId}` - 根据ID获取技能
- ✅ `GET /api/skills/character/{characterId}/available` - 获取角色可用技能
- ✅ `POST /api/skills/character/{characterId}/auto-trigger` - 检查自动触发技能
- ✅ `POST /api/skills` - 创建技能
- ✅ `PUT /api/skills/{skillId}` - 更新技能
- ✅ `DELETE /api/skills/{skillId}` - 删除技能

### CharacterSkillController
- ✅ `GET /api/characters/{characterId}/skills` - 获取角色已装备技能
- ✅ `GET /api/characters/{characterId}/skills/enabled` - 获取角色已启用技能
- ✅ `POST /api/characters/{characterId}/skills/{skillId}/equip` - 装备技能
- ✅ `DELETE /api/characters/{characterId}/skills/{skillId}/unequip` - 卸载技能
- ✅ `PUT /api/characters/{characterId}/skills/{skillId}/toggle` - 启用/禁用技能
- ✅ `PUT /api/characters/{characterId}/skills/{skillId}/auto-trigger` - 设置自动触发
- ✅ `PUT /api/characters/{characterId}/skills/{skillId}/priority` - 设置优先级

### SkillExecutionController
- ✅ `POST /api/skills/execute` - 执行技能

## 输出说明

脚本使用颜色输出，便于识别：
- 🔵 **蓝色 [INFO]**: 信息性消息
- 🟢 **绿色 [SUCCESS]**: 成功操作
- 🔴 **红色 [ERROR]**: 错误信息
- 🟡 **黄色 [WARNING]**: 警告信息

## 故障排查

### 1. 登录失败
- 检查用户名和密码是否正确
- 检查后端服务是否运行
- 检查 `/api/auth/login` 端点是否可访问

### 2. 数据库连接失败
- 检查 MySQL 服务是否运行
- 检查数据库连接信息是否正确
- 检查 `mysql` 命令行工具是否安装

### 3. API 调用失败
- 检查后端服务日志
- 检查网络连接
- 检查 Token 是否有效

### 4. 数据库验证失败
- 检查数据库表结构是否正确
- 检查 Flyway 迁移是否完成
- 检查数据库权限

## 测试数据清理

脚本会自动清理测试数据：
1. 卸载测试技能
2. 删除测试技能定义

如果脚本异常退出，可能需要手动清理：
```sql
-- 删除测试技能绑定
DELETE FROM character_skill_bindings WHERE skill_id LIKE 'test-skill-api-%';

-- 删除测试技能
DELETE FROM skill_definitions WHERE skill_id LIKE 'test-skill-api-%';

-- 删除测试执行记录
DELETE FROM skill_executions WHERE skill_id LIKE 'test-skill-api-%';
```

## 扩展测试

可以根据需要扩展测试脚本：
1. 添加更多边界情况测试
2. 添加性能测试
3. 添加并发测试
4. 添加错误处理测试

## 相关文档

- [技能系统开发计划](./数字人Skill系统开发计划.md)
- [技能创建指南](./技能创建指南.md)
- [技能测试快速开始](./技能测试快速开始.md)
