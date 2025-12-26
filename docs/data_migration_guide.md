# ai_models 到 ai_model_config 数据迁移指南

## 概述

本指南说明如何将数据库中所有关联 `ai_models` 的表迁移到 `ai_model_config`。

## 迁移脚本

使用迁移脚本：`V10005__migrate_all_model_ids_to_config.sql`

## 迁移逻辑

### 步骤说明

1. **通过 model_id 查询 ai_models**
   - 获取 `model_code` 和 `provider_id`

2. **通过 provider_id 查询 ai_providers**
   - 获取 `provider name`

3. **通过 provider name 和 model_code 查询 ai_model_config**
   - 匹配条件：`ai_model_config.provider = UPPER(ai_providers.name)` 
   - 并且：`ai_model_config.model_name = ai_models.model_code`

4. **更新原表的 model_id**
   - 将 `model_id` 从 `ai_models.id` 更新为 `ai_model_config.id`

### 匹配规则

```
ai_models.id → ai_models.model_code + ai_models.provider_id
                ↓
            ai_providers.name
                ↓
ai_model_config.provider (UPPER) + ai_model_config.model_name
                ↓
            ai_model_config.id
```

## 涉及的表

### 1. ai_model_pricing（定价配置表）

- **原关联**：`model_id` → `ai_models.id`
- **新关联**：`model_id` → `ai_model_config.id`

### 2. ai_usage_records（使用记录表）

- **原关联**：`model_id` → `ai_models.id`
- **新关联**：`model_id` → `ai_model_config.id`

## 执行步骤

### 1. 备份数据库（重要！）

在执行迁移前，务必备份数据库：

```bash
mysqldump -u root -p heartsphere > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 检查数据

执行以下查询检查需要迁移的数据：

```sql
-- 检查 ai_model_pricing 中的记录
SELECT COUNT(*) as total, 
       COUNT(DISTINCT model_id) as distinct_models
FROM ai_model_pricing;

-- 检查 ai_usage_records 中的记录
SELECT COUNT(*) as total,
       COUNT(DISTINCT model_id) as distinct_models
FROM ai_usage_records;

-- 检查匹配情况
SELECT 
    am.id as ai_models_id,
    am.model_code,
    ap.name as provider_name,
    amc.id as ai_model_config_id,
    amc.model_name,
    amc.provider
FROM ai_models am
INNER JOIN ai_providers ap ON am.provider_id = ap.id
LEFT JOIN ai_model_config amc ON amc.provider = UPPER(ap.name) 
    AND amc.model_name = am.model_code;
```

### 3. 执行迁移脚本

迁移脚本会自动：

1. 创建备份表（无法迁移的记录）
2. 删除旧的外键约束
3. 执行数据迁移
4. 添加新的外键约束
5. 生成迁移报告

### 4. 验证迁移结果

迁移脚本会生成以下报告：

- **迁移统计**：显示每个表的总记录数、已迁移记录数
- **无法迁移的记录**：列出无法匹配到 `ai_model_config` 的记录
- **验证查询**：检查是否有无效的 `model_id`

### 5. 处理无法迁移的记录

如果存在无法迁移的记录（在备份表中），需要：

1. 检查这些记录对应的模型是否需要在 `ai_model_config` 中创建
2. 如果不需要，可以考虑删除这些记录
3. 如果需要，先在 `ai_model_config` 中创建对应的模型配置，然后手动更新

查询无法迁移的记录：

```sql
-- ai_model_pricing 无法迁移的记录
SELECT * FROM ai_model_pricing_migration_backup;

-- ai_usage_records 无法迁移的记录
SELECT * FROM ai_usage_records_migration_backup;
```

## 常见问题

### Q1: 如果 ai_model_config 中不存在对应的模型怎么办？

**A**: 迁移脚本会将这些记录备份到 `*_migration_backup` 表中，需要手动处理：
- 如果该模型不再使用，可以删除这些记录
- 如果该模型仍在使用，需要在 `ai_model_config` 中创建对应的配置

### Q2: provider name 大小写不一致怎么办？

**A**: 迁移脚本使用 `UPPER(ap.name)` 和 `amc.provider` 进行比较，确保大小写一致。注意：
- `ai_providers.name` 是小写（如：`doubao`, `dashscope`）
- `ai_model_config.provider` 是大写（如：`DOUBAO`, `DASHSCOPE`）

### Q3: model_code 和 model_name 不完全匹配怎么办？

**A**: 迁移脚本使用精确匹配：`ai_model_config.model_name = ai_models.model_code`
- 如果 `ai_models.model_code` 与 `ai_model_config.model_name` 不一致，记录将无法迁移
- 需要在迁移前检查并修复数据不一致问题

### Q4: 迁移后如何验证数据完整性？

**A**: 使用以下查询验证：

```sql
-- 验证 ai_model_pricing
SELECT COUNT(*) as invalid_count
FROM ai_model_pricing amp
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc WHERE amc.id = amp.model_id
);

-- 验证 ai_usage_records
SELECT COUNT(*) as invalid_count
FROM ai_usage_records aur
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc WHERE amc.id = aur.model_id
);
```

如果 `invalid_count` 为 0，说明所有记录都已成功迁移。

## 回滚方案

如果需要回滚，可以使用备份表：

```sql
-- 恢复 ai_model_pricing（注意：需要重新匹配 ai_models.id）
-- 此操作需要根据备份表中的 model_code 和 provider_name 重新查找 ai_models.id

-- 恢复 ai_usage_records（同样需要重新匹配）
```

**建议**：如果迁移失败，直接使用数据库备份恢复，而不是尝试手动回滚。

## 后续清理

迁移完成后，可以：

1. 删除备份表（确认迁移成功后）：
   ```sql
   DROP TABLE IF EXISTS ai_model_pricing_migration_backup;
   DROP TABLE IF EXISTS ai_usage_records_migration_backup;
   ```

2. 删除 `ai_models` 表（确认不再使用后）：
   ```sql
   DROP TABLE IF EXISTS ai_models;
   ```

3. 清理相关代码和实体类（在确认代码已更新后）


