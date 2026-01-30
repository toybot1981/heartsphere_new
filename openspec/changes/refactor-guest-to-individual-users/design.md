# Design: Refactor Guest Mode to Individual Temporary Users

## Context

当前游客模式使用固定的 `__guest__` 用户，所有游客共享同一个用户账号和会员额度。这导致无法为每个游客单独分配和跟踪配额，也无法实现数据隔离。

## Goals

1. 为每个游客创建独立的临时用户账号
2. 为每个临时用户分配独立的体验会员和配额
3. 实现数据隔离，每个游客的数据完全独立
4. 支持临时用户平滑升级为正式用户

## Non-Goals

- 不改变游客的功能限制（仍然只能使用预置场景和角色）
- 不改变体验会员的配额配置（仍然是1万文本Token）
- 不改变游客升级为正式用户的流程

## Decisions

### Decision 1: 临时用户命名策略

**Decision**: 使用格式 `guest_<timestamp>_<random>` 作为临时用户名

**Rationale**:
- 格式清晰，易于识别临时用户
- 时间戳确保唯一性
- 随机字符串增加安全性

**Alternatives Considered**:
- UUID格式：`guest-<uuid>` - 更安全但可读性差
- 序号格式：`guest_<sequence>` - 简单但需要维护序列号
- **Rejected**: 选择时间戳+随机字符串，平衡了可读性和唯一性

### Decision 2: 临时用户标识方式

**Decision**: 通过用户名格式识别临时用户（以 `guest_` 开头）

**Rationale**:
- 无需修改数据库表结构
- 简单直接，易于实现
- 查询和过滤方便

**Alternatives Considered**:
- 添加 `is_temporary` 字段到 `users` 表
- **Rejected**: 当前阶段不需要额外的数据库字段，用户名格式足够

### Decision 3: 会员记录创建时机

**Decision**: 在创建临时用户后立即创建体验会员记录

**Rationale**:
- 确保用户登录后立即拥有配额
- 避免后续查询时会员记录不存在的问题
- 与正式用户创建流程一致

**Implementation**:
```java
User guestUser = createGuestUser(nickname);
Membership trialMembership = membershipService.getOrCreateTrialMembership(guestUser.getId());
```

### Decision 4: 临时用户清理策略

**Decision**: 实现定期清理机制，清理30天未使用的临时用户

**Rationale**:
- 防止数据库无限增长
- 30天足够长，不会影响正常使用的游客
- 可以通过定时任务实现

**Implementation**:
- 创建定时任务，每天检查并清理30天未使用的临时用户
- 清理前备份重要数据（如对话记录）
- 可选：提供手动清理接口

**Alternatives Considered**:
- 不清理，永久保留
- **Rejected**: 会导致数据库无限增长
- 7天清理
- **Rejected**: 太短，可能影响正常使用的游客

## Architecture Changes

### Current Architecture

```
游客登录
  ↓
查找固定用户 __guest__
  ↓
获取/创建共享会员
  ↓
使用共享配额
```

### Target Architecture

```
游客登录
  ↓
创建新临时用户 (guest_<timestamp>_<random>)
  ↓
创建独立会员记录
  ↓
分配独立配额
  ↓
使用独立配额
```

## Data Model

### Users Table

- 每个游客创建新记录
- 用户名格式：`guest_<timestamp>_<random>`
- 邮箱格式：`guest_<timestamp>_<random>@guest.temp`
- 其他字段与正式用户相同

### Memberships Table

- 每个临时用户创建新记录
- `user_id`: 关联到临时用户
- `plan_type`: `trial`
- `plan_id`: 体验会员计划ID
- 配额使用字段独立跟踪

### Token Quota Table

- 每个临时用户创建新记录
- 独立的配额余额和使用记录

## Migration Plan

### Phase 1: 修改登录逻辑
1. 修改 `AuthController.guestLogin()` 创建新用户
2. 修改 `MembershipService` 为每个用户创建独立会员
3. 测试游客登录和配额分配

### Phase 2: 数据迁移（可选）
1. 如果存在旧的 `__guest__` 用户，可以保留或删除
2. 如果删除，需要处理相关的对话记录等数据

### Phase 3: 清理机制（可选）
1. 实现定时任务清理长期未使用的临时用户
2. 添加清理日志和监控

## Risks / Trade-offs

### Risk 1: 数据库增长
- **Risk**: 临时用户账号大量增长
- **Mitigation**: 实现定期清理机制
- **Trade-off**: 清理可能丢失数据，但30天足够长

### Risk 2: 用户名冲突
- **Risk**: 时间戳+随机字符串可能冲突（极低概率）
- **Mitigation**: 检查用户名唯一性，冲突时重试
- **Trade-off**: 增加少量复杂度，但确保唯一性

### Risk 3: 性能影响
- **Risk**: 每次登录创建新用户可能影响性能
- **Mitigation**: 用户创建是轻量操作，影响可忽略
- **Trade-off**: 换取数据隔离和配额独立

## Open Questions

1. 是否需要保留旧的 `__guest__` 用户？
   - **建议**: 可以保留作为兼容，但不使用

2. 临时用户清理时是否保留对话记录？
   - **建议**: 可以保留对话记录，只删除用户和会员记录

3. 是否需要限制单个IP的游客账号创建频率？
   - **建议**: 可以添加，防止滥用
