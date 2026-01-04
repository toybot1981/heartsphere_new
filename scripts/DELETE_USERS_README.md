# 删除所有普通注册用户脚本使用说明

## ⚠️ 重要警告

**此脚本会永久删除所有普通注册用户及其关联数据，操作不可逆！**

**执行前请务必备份数据库！**

## 脚本说明

### 1. `delete_all_regular_users.sql`
SQL脚本，包含所有删除操作。

### 2. `delete_all_regular_users.sh`
用于删除**本地数据库**中所有普通注册用户的脚本。

### 3. `delete_all_regular_users_remote.sh`
用于删除**远程数据库**中所有普通注册用户的脚本。

## 删除的数据

### 会删除的数据：
- ✅ `users` 表中的所有用户
- ✅ 用户创建的世界 (`worlds`)
- ✅ 用户创建的时代 (`eras`)
- ✅ 用户创建的角色 (`characters`)
- ✅ 用户主线剧情 (`user_main_stories`)
- ✅ 对话日志 (`conversation_logs`)
- ✅ 用户收藏 (`user_favorites`)
- ✅ 访问历史 (`access_history`)
- ✅ 会员信息 (`memberships`)
- ✅ 支付订单 (`payment_orders`)
- ✅ 积分记录 (`point_transactions`)
- ✅ 用户Token配额 (`user_token_quota`)
- ✅ Token配额交易记录 (`token_quota_transaction`)
- ✅ AI使用记录 (`ai_usage_records`)
- ✅ 心域共享配置 (`heartsphere_share_config`)
- ✅ 连接请求 (`heartsphere_connection_request`)
- ✅ 连接记录 (`heartsphere_connection`)
- ✅ 体验模式数据 (`warm_message`, `experience_summary`)
- ✅ 信箱消息 (`mailbox_messages`)
- ✅ 信箱对话 (`mailbox_conversations`)
- ✅ 信箱通知设置 (`mailbox_notification_settings`)
- ✅ 跨时空信箱 (`chronos_letters`, `mails`)
- ✅ 用户场景物品 (`user_scenario_items`)
- ✅ 用户场景事件 (`user_scenario_events`)
- ✅ 用户创建的剧本 (`scripts`)
- ✅ 用户创建的剧本事件 (`scenario_events`)
- ✅ 用户创建的剧本物品 (`scenario_items`)
- ✅ 用户AI配置 (`user_ai_config`)
- ✅ 情绪记录 (`emotion_records`)

### 不会删除的数据：
- ❌ `system_admin` 表中的管理员
- ❌ 系统预设的世界 (`system_worlds`)
- ❌ 系统预设的时代 (`system_eras`)
- ❌ 系统预设的角色 (`system_characters`)
- ❌ 系统预设的主线剧情 (`system_main_stories`)
- ❌ 订阅计划 (`subscription_plans`)
- ❌ AI模型配置 (`ai_models`, `ai_providers`, `ai_model_pricing`)
- ❌ 其他系统配置数据

## 使用方法

### 方法一：使用Shell脚本（推荐）

#### 删除本地数据库用户：
```bash
cd /Users/admin/Workspace/heartsphere_new
./scripts/delete_all_regular_users.sh
```

#### 删除远程数据库用户：
```bash
cd /Users/admin/Workspace/heartsphere_new
./scripts/delete_all_regular_users_remote.sh
```

脚本会提示输入数据库连接信息。

### 方法二：直接执行SQL脚本

#### 本地数据库：
```bash
mysql -u root -p123456 heartsphere < scripts/delete_all_regular_users.sql
```

#### 远程数据库：
```bash
mysql -h <远程主机> -P 3306 -u <用户名> -p <数据库名> < scripts/delete_all_regular_users.sql
```

## 数据库配置

### 本地数据库默认配置：
- 主机: `localhost`
- 端口: `3306`
- 数据库: `heartsphere`
- 用户: `root`
- 密码: `123456`

### 远程数据库配置：
可以通过环境变量设置：
```bash
export REMOTE_DB_HOST="your-remote-host"
export REMOTE_DB_PORT="3306"
export REMOTE_DB_NAME="heartsphere"
export REMOTE_DB_USER="your-username"
export REMOTE_DB_PASSWORD="your-password"
```

或者在执行脚本时按提示输入。

## 执行流程

1. **显示警告信息** - 提醒用户操作的危险性
2. **显示将要删除的数据** - 列出所有会被删除的数据类型
3. **确认操作** - 需要输入 `YES` 才能继续
4. **执行删除** - 按依赖顺序删除所有关联数据
5. **显示结果** - 显示删除完成状态

## 注意事项

1. **备份数据库**：执行前务必备份数据库
2. **外键约束**：大部分表设置了 `ON DELETE CASCADE`，删除用户时会自动删除关联数据
3. **执行顺序**：脚本按正确的依赖顺序删除数据，避免外键约束错误
4. **不可逆操作**：删除操作不可逆，请谨慎执行
5. **管理员数据**：`system_admin` 表中的管理员不会被删除

## 故障排除

### 如果遇到外键约束错误：
- 检查是否有其他表引用了 `users` 表但没有设置 `ON DELETE CASCADE`
- 手动删除这些表中的数据后再执行脚本

### 如果遇到权限错误：
- 确保数据库用户有足够的权限执行 DELETE 操作
- 检查是否有其他进程锁定了表

### 如果执行失败：
- 检查数据库连接信息是否正确
- 查看错误信息，定位问题
- 确保数据库服务正在运行

## 验证删除结果

执行完成后，可以运行以下SQL验证：

```sql
-- 检查users表是否为空
SELECT COUNT(*) FROM users;

-- 检查是否还有用户相关的数据
SELECT COUNT(*) FROM worlds WHERE user_id IS NOT NULL;
SELECT COUNT(*) FROM characters WHERE world_id IN (SELECT id FROM worlds WHERE user_id IS NOT NULL);
SELECT COUNT(*) FROM conversation_logs;
SELECT COUNT(*) FROM user_favorites;
-- ... 其他表
```

## 联系支持

如果遇到问题，请检查：
1. 数据库连接信息是否正确
2. 用户权限是否足够
3. 数据库服务是否正常运行
4. 是否有其他进程占用数据库
