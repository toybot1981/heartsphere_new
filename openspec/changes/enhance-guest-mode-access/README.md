# 游客模式增强功能

## 概述

本功能实现了完整的游客模式访问控制逻辑，包括游客自动创建、体验会员分配、权限控制、预置内容访问、记忆系统限制和用户升级流程。

## 快速开始

### 文档导航

1. **实施总结** (`IMPLEMENTATION_SUMMARY.md`)
   - 完整的功能实现说明
   - 技术实现细节
   - 相关文件列表

2. **测试清单** (`TEST_CHECKLIST.md`)
   - 详细的测试用例
   - 测试步骤和预期结果
   - 测试工具和验证方法

3. **部署说明** (`DEPLOYMENT_NOTES.md`)
   - 部署前检查清单
   - 部署步骤
   - 回滚方案
   - 监控和安全建议

### 核心功能

- ✅ 游客自动创建和体验会员分配
- ✅ 独立的游客登录和注册接口
- ✅ 全面的权限控制（7个控制器）
- ✅ 硬编码预置内容访问
- ✅ 记忆系统限制
- ✅ 平滑的用户升级流程
- ✅ 统一的错误提示格式

### 权限控制矩阵

| 功能模块 | 创建 | 更新 | 删除 | 查询 |
|---------|------|------|------|------|
| 场景管理 | ❌ | ❌ | ❌ | ✅ (预置) |
| 角色管理 | ❌ | ❌ | ❌ | ✅ (预置) |
| 记忆系统 | ❌ | ❌ | ❌ | ✅ (空列表) |
| 剧本管理 | ❌ | ❌ | ❌ | - |
| 主线剧情 | ❌ | ❌ | ❌ | - |
| 日记管理 | ❌ | ❌ | ❌ | - |
| 共享空间 | ❌ | ❌ | ❌ | - |

### 数据库迁移

执行以下迁移脚本：
```sql
-- 文件路径：main/backend/src/main/resources/db/migration/V20260119__add_trial_membership_plan.sql
```

### API 接口

#### 游客登录
```
POST /api/auth/guest-login
Body: { "nickname": "可选昵称" }
```

#### 游客注册（升级）
```
POST /api/auth/guest-register
Body: {
  "username": "用户名",
  "email": "邮箱",
  "password": "密码",
  "nickname": "昵称",
  "emailVerificationCode": "验证码（可选）"
}
```

### 预置内容

- **默认场景**: ID 50 - "日常生活助手"
- **预置角色**: ID 315-320
  - 时小光 (315)
  - 康小健 (316)
  - 学小知 (317)
  - 心小暖 (318)
  - 心小安 (319)
  - 暖小阳 (320)

### 体验会员配额

- 文本Token: 10,000
- 其他配额: 0

## 实施状态

✅ 所有核心功能已实现
✅ 代码质量检查通过
✅ 测试文档已就绪
✅ 部署文档已就绪

## 相关文件

### 后端代码
- `main/backend/src/main/java/com/heartsphere/controller/AuthController.java`
- `main/backend/src/main/java/com/heartsphere/util/GuestAccessChecker.java`
- `main/backend/src/main/java/com/heartsphere/config/GuestModeConfig.java`
- `main/backend/src/main/java/com/heartsphere/service/MembershipService.java`
- 以及7个添加了权限检查的控制器

### 前端代码
- `main/frontend/services/api/auth/auth.ts`
- `main/frontend/App.tsx`
- `main/frontend/components/LoginModal.tsx`

### 数据库
- `main/backend/src/main/resources/db/migration/V20260119__add_trial_membership_plan.sql`

## 下一步

1. 按照 `TEST_CHECKLIST.md` 进行功能测试
2. 按照 `DEPLOYMENT_NOTES.md` 进行部署
3. 监控系统运行状态
4. 根据测试结果优化用户体验

## 支持

如有问题，请参考：
- 实施总结：`IMPLEMENTATION_SUMMARY.md`
- 测试清单：`TEST_CHECKLIST.md`
- 部署说明：`DEPLOYMENT_NOTES.md`
