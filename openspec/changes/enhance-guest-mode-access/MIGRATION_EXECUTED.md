# 数据库迁移执行记录

## 迁移信息

- **迁移脚本**: `V20260119__add_trial_membership_plan.sql`
- **执行日期**: 2026-01-16
- **执行方式**: 手动执行（MySQL 命令行）

## 执行结果

### ✅ 迁移成功

体验会员订阅计划已成功创建：

| 字段 | 值 |
|------|-----|
| ID | 29 |
| 名称 | 体验会员 |
| 类型 | trial |
| 计费周期 | monthly |
| 文本Token配额 | 10,000 |
| 图片生成配额 | 0 |
| 音频处理配额 | 0 |
| 视频生成配额 | 0 |
| 永久Token配额 | 0 |
| 状态 | 激活 (is_active=1) |

## 验证查询

```sql
SELECT 
    id,
    name,
    type,
    billing_cycle,
    text_token_quota,
    image_generation_quota,
    audio_processing_quota,
    video_generation_quota,
    permanent_token_quota,
    is_active,
    created_at
FROM subscription_plans
WHERE type = 'trial';
```

## 执行命令

```bash
./scripts/execute-guest-mode-migration.sh
```

或直接使用 MySQL 命令：

```bash
mysql -h localhost -u root -p123456 heartsphere \
    --default-character-set=utf8mb4 \
    < main/backend/src/main/resources/db/migration/V20260119__add_trial_membership_plan.sql
```

## 下一步

迁移完成后，可以：
1. 启动后端服务，测试游客登录功能
2. 验证体验会员自动分配
3. 测试权限控制功能
4. 按照测试清单进行完整测试

## 备注

- 迁移脚本使用了 `WHERE NOT EXISTS` 条件，即使重复执行也不会出错
- 如果记录已存在，会跳过插入，不会产生重复数据
- Flyway 在应用启动时也会自动执行此迁移（如果还未执行）
