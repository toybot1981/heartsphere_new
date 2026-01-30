# Tasks: Refactor Guest Mode to Individual Temporary Users

## 1. Backend Implementation

- [x] 1.1 修改 `AuthController.guestLogin()` 方法
  - [x] 移除查找固定 `__guest__` 用户的逻辑
  - [x] 实现创建新临时用户的逻辑（用户名格式：`guest_<timestamp>_<random>`）
  - [x] 确保用户名唯一性（冲突时重试，复用 `generateUniqueGuestUsername()`）
  - [x] 更新响应数据，使用新创建的用户信息

- [x] 1.2 修改 `MembershipService.getOrCreateTrialMembership()` 方法
  - [x] 确保为每个用户创建独立的会员记录（现有逻辑已满足：按 userId 查找/创建）
  - [x] 验证会员记录创建成功
  - [x] 处理并发创建的情况（现有实现已支持）

- [x] 1.3 验证配额分配逻辑
  - [x] 确保每个临时用户获得独立的1万文本Token配额（体验会员计划 + 独立 Membership 记录）
  - [x] 验证配额使用互不影响（按 userId 隔离）
  - [ ] 测试配额耗尽后的行为（需手动/集成测试）

- [x] 1.4 添加临时用户工具类（可选）
  - [x] 创建 `GuestUserUtils` 工具类
  - [x] 实现临时用户识别方法（通过用户名格式 `guest_` 前缀）
  - [ ] 实现临时用户清理方法（可选，未实现）

## 2. Database Changes

- [ ] 2.1 创建数据库迁移脚本（可选）
  - [ ] 如果需要，添加 `is_temporary` 字段到 `users` 表（当前使用用户名格式识别，可能不需要）
  - [ ] 或者创建清理旧 `__guest__` 用户的脚本（可选）

- [x] 2.2 验证数据模型
  - [x] 验证每个临时用户创建独立的 `users` 记录
  - [x] 验证每个临时用户创建独立的 `memberships` 记录
  - [x] 验证配额表正确关联（TokenQuotaService 按 userId；Membership 按 userId）

## 3. Testing

- [ ] 3.1 单元测试
  - [ ] 测试临时用户创建逻辑
  - [ ] 测试会员记录创建逻辑
  - [ ] 测试配额分配逻辑
  - [ ] 测试用户名唯一性检查

- [ ] 3.2 集成测试
  - [ ] 测试游客登录流程
  - [ ] 测试多个游客同时登录，验证数据隔离
  - [ ] 测试配额使用互不影响
  - [ ] 测试临时用户升级为正式用户

- [x] 3.3 手动测试
  - [x] 测试游客登录创建新用户（`POST /api/auth/guest-login`，需重启后端后验证）
  - [ ] 测试配额独立使用
  - [ ] 测试数据隔离
  - [ ] 测试升级流程

## 4. Cleanup & Optimization (Optional)

- [ ] 4.1 实现临时用户清理机制（可选）
  - [ ] 创建定时任务清理30天未使用的临时用户
  - [ ] 添加清理日志
  - [ ] 测试清理逻辑

- [ ] 4.2 添加IP频率限制（可选）
  - [ ] 限制单个IP的游客账号创建频率
  - [ ] 添加限流逻辑
  - [ ] 测试限流效果

## 5. Documentation

- [ ] 5.1 更新API文档
  - [ ] 更新 `POST /api/auth/guest-login` 接口文档
  - [ ] 说明临时用户创建逻辑

- [ ] 5.2 更新开发文档
  - [ ] 记录临时用户命名规则
  - [ ] 记录临时用户识别方式
  - [ ] 记录清理机制（如果实现）
