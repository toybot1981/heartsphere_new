# 传送门API测试检查清单

## 准备工作

### 1. 启用传送门功能
- [ ] 在 `application.yml` 中设置 `heartconnect.portal.enabled=true`
- [ ] 或通过环境变量设置 `PORTAL_ENABLED=true`
- [ ] 重启应用确保配置生效

### 2. 数据库迁移
- [ ] 确认 Flyway 已执行迁移脚本 `V20260107__create_portal_tables.sql`
- [ ] 检查数据库中是否存在以下表：
  ```sql
  SHOW TABLES LIKE 'portal_%';
  ```
- [ ] 验证表结构是否正确：
  ```sql
  DESCRIBE portal_config;
  DESCRIBE portal_permission;
  DESCRIBE portal_teleportation_log;
  ```

### 3. 准备测试数据
- [ ] 创建至少两个测试用户
- [ ] 为用户1创建共享配置（获取共享码）
- [ ] 确保有可用的场景ID（era_id）

## API功能测试

### 基础功能测试

#### 创建传送门
- [ ] POST `/api/portal` - 使用有效数据创建传送门
- [ ] 验证返回的portalId不为空
- [ ] 验证所有字段正确返回
- [ ] 测试三种传送门类型：`stargate`, `wormhole`, `quantum`
- [ ] 测试三种权限类型：`public`, `approval`, `invite`

#### 查询传送门
- [ ] GET `/api/portal/scene/{sceneId}` - 获取场景传送门列表
- [ ] GET `/api/portal/scene/{sceneId}?onlyActive=true` - 只获取激活的传送门
- [ ] GET `/api/portal/{portalId}` - 获取传送门详情
- [ ] GET `/api/portal/{portalId}/preview` - 获取目标心域预览

#### 更新传送门
- [ ] PUT `/api/portal/{portalId}` - 更新传送门信息
- [ ] 验证更新后的字段正确保存
- [ ] 测试部分字段更新

#### 删除传送门
- [ ] DELETE `/api/portal/{portalId}` - 删除传送门
- [ ] 验证传送门已从数据库中删除

### 传送功能测试

#### 执行传送
- [ ] POST `/api/portal/{portalId}/teleport` - 执行传送
- [ ] 验证传送成功（公开权限的传送门）
- [ ] 验证返回了目标心域信息
- [ ] 验证传送记录已保存到 `portal_teleportation_log` 表

### 权限验证测试

#### 公开权限传送门
- [ ] 任何登录用户都可以使用
- [ ] 未登录用户无法使用（401错误）

#### 审批权限传送门
- [ ] 未授权的用户无法使用（权限错误）
- [ ] 授权后的用户可以使用
- [ ] 主人自己可以使用

#### 邀请权限传送门
- [ ] 未邀请的用户无法使用（权限错误）
- [ ] 被邀请的用户可以使用
- [ ] 主人自己可以使用

## 错误场景测试

### 功能开关测试
- [ ] 禁用功能开关 (`heartconnect.portal.enabled=false`)
- [ ] 所有API应返回 "传送门功能未启用" 错误
- [ ] 重新启用功能开关，API恢复正常

### 认证测试
- [ ] 未提供Authorization头的请求应返回401错误
- [ ] 无效的token应返回401错误

### 权限测试
- [ ] 尝试修改他人的传送门应返回权限错误
- [ ] 尝试删除他人的传送门应返回权限错误

### 数据验证测试
- [ ] 使用无效的场景ID应返回错误
- [ ] 使用无效的共享码应返回错误
- [ ] 传送到自己的心域应返回错误
- [ ] 必填字段缺失应返回验证错误

### 边界条件测试
- [ ] 使用不存在的portalId应返回404错误
- [ ] 删除不存在的传送门应返回404错误
- [ ] 获取不存在的传送门详情应返回404错误

## 数据库验证

### 数据完整性
- [ ] 创建传送门后，`portal_config` 表中有对应记录
- [ ] 更新传送门后，`updated_at` 字段已更新
- [ ] 删除传送门后，记录已从数据库删除
- [ ] 执行传送后，`portal_teleportation_log` 表中有对应记录

### 关联验证
- [ ] `portal_permission` 表正确记录权限信息
- [ ] 删除传送门后，相关权限记录也被删除（如果有级联删除）

## 性能测试（可选）

- [ ] 测试大量传送门列表的查询性能
- [ ] 测试并发创建传送门的性能
- [ ] 测试并发传送的性能

## 测试工具

### 使用curl
```bash
# 获取token（先登录）
TOKEN=$(curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}' \
  | jq -r '.data.token')

# 运行测试脚本
./PortalApiTest.sh http://localhost:8081 $TOKEN
```

### 使用Postman
1. 导入测试集合（需要创建）
2. 设置环境变量：`base_url`, `auth_token`
3. 运行测试集合

### 使用Swagger UI
1. 访问 `http://localhost:8081/swagger-ui.html`
2. 找到 `/api/portal` 相关的端点
3. 点击 "Try it out" 进行测试

## 验证清单

- [ ] 所有API端点正常工作
- [ ] 错误处理正确
- [ ] 权限验证正确
- [ ] 数据正确保存到数据库
- [ ] 日志记录正常
- [ ] 功能开关正常工作
- [ ] CORS配置正确（如果需要）

## 注意事项

1. **测试环境**: 确保在测试环境进行测试，避免影响生产数据
2. **数据清理**: 测试完成后清理测试数据
3. **日志检查**: 检查应用日志，确认没有异常错误
4. **数据库状态**: 验证数据库迁移脚本执行成功
5. **配置检查**: 确认所有配置项正确设置
