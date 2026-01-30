# 游客模式增强功能部署说明

## 部署前检查清单

### 1. 数据库迁移
- [ ] 确认数据库迁移脚本 `V20260119__add_trial_membership_plan.sql` 已执行
- [ ] 验证 `subscription_plans` 表中存在体验会员记录
  ```sql
  SELECT * FROM subscription_plans WHERE type = 'trial';
  ```

### 2. 环境要求
- [ ] Java 17 或更高版本
- [ ] Maven 3.6+ 
- [ ] MySQL 5.7+ 或 8.0+
- [ ] Node.js 16+ (前端)

### 3. 配置检查
- [ ] 检查 `application.yml` 中的数据库连接配置
- [ ] 确认 JWT 密钥配置正确
- [ ] 确认会员服务配置正确

### 4. 编译和构建
```bash
# 后端编译
cd main/backend
mvn clean compile -DskipTests

# 前端构建（如需要）
cd main/frontend
npm install
npm run build
```

## 部署步骤

### 步骤1: 备份数据库
```bash
# 备份相关表
mysqldump -u username -p database_name subscription_plans memberships users > backup_before_guest_mode.sql
```

### 步骤2: 执行数据库迁移
```bash
# Flyway 会自动执行迁移脚本，或手动执行：
mysql -u username -p database_name < main/backend/src/main/resources/db/migration/V20260119__add_trial_membership_plan.sql
```

### 步骤3: 重启后端服务
```bash
# 停止现有服务
# 重新编译（如果需要）
cd main/backend
mvn clean package -DskipTests

# 启动服务
java -jar target/heartsphere-service-0.0.1-SNAPSHOT.jar
```

### 步骤4: 重启前端服务（如需要）
```bash
cd main/frontend
npm run dev  # 开发环境
# 或
npm run build && npm run start  # 生产环境
```

### 步骤5: 验证部署
- [ ] 测试游客登录功能
- [ ] 验证体验会员自动分配
- [ ] 测试权限控制（创建场景/角色应返回403）
- [ ] 测试预置内容访问
- [ ] 测试游客升级流程

## 回滚方案

如果部署后出现问题，可以按以下步骤回滚：

### 1. 恢复数据库（如果需要）
```bash
mysql -u username -p database_name < backup_before_guest_mode.sql
```

### 2. 恢复代码
```bash
git checkout <previous-commit-hash>
```

### 3. 重新编译和部署
```bash
cd main/backend
mvn clean package -DskipTests
# 重启服务
```

## 已知问题

### Java 版本兼容性
- 项目要求 Java 17，如果使用 Java 8 编译会失败
- 解决方案：升级到 Java 17 或使用项目的 Maven wrapper

### 数据库迁移顺序
- 确保 Flyway 迁移脚本按正确顺序执行
- 如果手动执行迁移，注意检查依赖关系

## 性能考虑

### 游客账号创建
- 大量游客账号创建可能影响数据库性能
- 建议定期清理长期未使用的游客账号

### Token配额检查
- 每次API调用都会检查会员类型，建议添加缓存机制

## 监控建议

### 关键指标
- 游客账号创建数量
- 游客升级为正式用户的比例
- 权限检查失败次数（403错误）
- Token配额消耗情况

### 日志监控
- 关注 `GuestAccessChecker` 相关的日志
- 监控游客登录和注册的异常情况
- 跟踪权限检查的性能指标

## 安全建议

### 游客账号管理
- 定期清理长期未使用的游客账号
- 限制单个IP的游客账号创建频率
- 监控异常游客账号创建行为

### Token配额
- 确保体验会员的Token配额不会被恶意消耗
- 考虑添加Token消耗速率限制

## 测试验证

部署后请执行以下验证：

1. **功能验证**
   - [ ] 游客登录成功
   - [ ] 体验会员自动分配
   - [ ] 权限控制正常工作
   - [ ] 预置内容正确显示
   - [ ] 游客升级流程正常

2. **性能验证**
   - [ ] API响应时间正常
   - [ ] 数据库查询性能正常
   - [ ] 无内存泄漏

3. **安全验证**
   - [ ] 权限检查有效
   - [ ] Token配额限制正常
   - [ ] 无安全漏洞

## 联系支持

如遇到部署问题，请检查：
1. 日志文件中的错误信息
2. 数据库连接状态
3. 服务依赖项状态
4. 配置文件的正确性

参考文档：
- 实施总结：`IMPLEMENTATION_SUMMARY.md`
- 测试清单：`TEST_CHECKLIST.md`
