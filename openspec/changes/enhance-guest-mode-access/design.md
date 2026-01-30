# Design: Enhance Guest Mode Access Logic

## Architecture Overview

### Current State

- 游客模式仅在前端标记，不创建后端用户
- 使用 `anonymousUser` 或前端状态管理游客身份
- 无法跟踪游客的使用情况和Token消耗
- 游客无法升级为正式用户

### Target State

- 游客登录自动创建后端用户账号
- 分配体验会员（Trial Membership）
- 完整的权限控制和功能限制
- 支持平滑升级为正式用户

## Key Design Decisions

### 1. User Account Creation

**Decision**: 游客登录时立即创建用户账号，而不是延迟创建。

**Rationale**:
- 需要跟踪Token消耗和用户行为
- 需要保存对话记录用于升级后使用
- 需要统一的用户管理

**Implementation**:
- 游客点击"游客模式"时触发用户创建
- 生成唯一临时用户名（如 `guest_<timestamp>_<random>`）
- 自动分配体验会员
- 返回JWT Token供后续请求使用

### 2. Trial Membership Design

**Decision**: 创建独立的体验会员类型，而不是使用现有的会员类型。

**Rationale**:
- 清晰的会员类型区分
- 便于权限检查和配额管理
- 支持独立的会员配置

**Structure**:
```sql
INSERT INTO memberships (name, type, text_token_quota, image_token_quota, ...)
VALUES ('体验会员', 'TRIAL', 10000, 0, ...);
```

### 3. Permission Control Strategy

**Decision**: 使用会员类型检查 + 注解方式实现权限控制。

**Approach**:
1. 创建 `@RequireRegisteredUser` 注解
2. 创建拦截器检查用户会员类型
3. 体验会员访问受限功能时返回403错误

**Alternative Considered**: 
- 使用角色权限系统（ROLE_GUEST, ROLE_USER）
- **Rejected**: 当前系统主要基于会员类型，角色系统可能过度设计

### 4. Pre-configured Content

**Decision**: 硬编码预置场景和角色ID，而不是配置表。

**Rationale**:
- 简单直接，性能好
- 场景和角色ID相对固定
- 易于维护和更新

**Configuration**:
```java
public class GuestModeConfig {
    public static final Long DEFAULT_ERA_ID = 50L; // 日常生活助手
    public static final List<Long> ALLOWED_CHARACTER_IDS = List.of(
        315L, // 时小光
        316L, // 康小健
        317L, // 学小知
        318L, // 心小暖
        319L, // 心小安
        320L  // 暖小阳
    );
}
```

### 5. Data Migration on Upgrade

**Decision**: 保留用户ID，仅更新用户信息和会员类型。

**Rationale**:
- 最小化数据迁移复杂度
- 保留所有关联数据（对话、消息等）
- 用户ID不变，外键关系保持完整

**Migration Steps**:
1. 更新 `users` 表：用户名、密码、邮箱等
2. 更新 `memberships` 表：会员类型
3. 创建默认场景（如果需要）
4. 触发初始化向导

## Data Flow

### Guest Login Flow

```
User clicks "Guest Mode"
    ↓
Frontend sends POST /api/auth/guest-login (独立接口)
    ↓
Backend: AuthController.guestLogin()
    ↓
1. Generate unique guest username
2. Create User entity (username, password=random, email=guest@temp)
3. Find/assign Trial Membership
4. Create JWT Token
5. **不初始化个人场景和角色**（游客使用系统预置内容）
    ↓
Return { token, user, membership, isGuest: true }
    ↓
Frontend: Save token, set user state, use preset era/characters
```

### Guest Register Flow

```
Guest user clicks "Register as Full User"
    ↓
Frontend sends POST /api/auth/guest-register (独立接口，不同于正式用户注册)
    ↓
Backend: AuthController.guestRegister()
    ↓
1. Check current user is guest (trial membership)
2. Update user: username, password, email
3. Upgrade membership: trial → free (or selected)
4. **初始化个人场景和角色**（首次创建）
5. Create JWT Token with new credentials
    ↓
Return { token, user, membership, isGuest: false }
    ↓
Frontend: Re-authenticate, show initialization wizard
```

### Permission Check Flow

```
User requests restricted feature
    ↓
Controller method with @RequireRegisteredUser
    ↓
Interceptor checks membership type
    ↓
If TRIAL membership:
    → Return 403: "需要注册正式用户"
Else:
    → Proceed with request
```

### Guest Content Access

```
Guest user accesses characters/scenes
    ↓
Backend: Check user membership type
    ↓
If trial membership:
    → Return hardcoded preset content:
      - Era ID: 50 (日常生活助手)
      - Character IDs: 315-320 (6个预置角色)
    → Do NOT query user's personal eras/characters
Else:
    → Return user's personal eras/characters
```

## Database Schema Changes

### New Membership Record

```sql
INSERT INTO memberships (
    name,
    type,
    text_token_quota,
    image_token_quota,
    video_token_quota,
    is_active,
    created_at
) VALUES (
    '体验会员',
    'TRIAL',
    10000,  -- 1万文本Token
    0,
    0,
    true,
    NOW()
);
```

### User Table (No schema change, behavior change)

- `users` 表结构不变
- 添加 `is_guest` 字段（可选，可通过membership type判断）

## API Changes

### New Endpoints

- `POST /api/auth/guest-login` - 游客登录，创建临时用户（独立接口）
- `POST /api/auth/guest-register` - 游客注册为正式用户（独立接口，不同于正式用户注册）

### Modified Endpoints

- `GET /api/eras` - 游客访问时返回系统预置场景（ID: 50）
- `GET /api/characters` - 游客访问时返回系统预置角色（ID: 315-320）
- All restricted endpoints - 添加权限检查

### Response Changes

- 注册接口：返回升级提示（如果从游客升级）

## Frontend Changes

### New Components

- `GuestModeBanner` - 显示游客状态和升级提示
- `UpgradePrompt` - 功能受限时的升级提示弹窗

### Modified Components

- `LoginModal` - 添加游客登录选项
- `CharacterSelection` - 过滤预置角色
- `EraSelection` - 仅显示预置场景
- `SettingsModal` - 添加升级为正式用户选项

## Security Considerations

1. **Rate Limiting**: 限制单个IP的游客账号创建频率
2. **Account Cleanup**: 定期清理长期未使用的游客账号
3. **Token Abuse**: 监控Token消耗异常
4. **Data Privacy**: 游客数据应定期清理或匿名化

## Migration Strategy

1. **Phase 1**: 添加体验会员记录（向后兼容）
2. **Phase 2**: 实现游客登录逻辑（新功能，不影响现有用户）
3. **Phase 3**: 添加权限控制（渐进式部署）
4. **Phase 4**: 前端UI更新（用户体验改进）

## Rollback Plan

如果出现问题，可以：
1. 禁用游客登录API
2. 恢复前端游客模式为原实现
3. 不影响正式用户的正常使用
