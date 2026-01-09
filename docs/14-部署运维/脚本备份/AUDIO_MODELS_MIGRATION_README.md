# 语音模型数据库迁移说明

## 概述

本迁移脚本用于添加豆包（Doubao）和 DashScope（通义千问）的语音模型配置和计费信息。

## 迁移内容

### 模型配置

1. **豆包（Doubao）TTS 模型**
   - CosyVoice - 豆包主流的语音合成模型，支持多种音色

2. **豆包（Doubao）STT 模型**
   - Fun-ASR - 多语言语音识别模型，支持超过31种语言
   - Paraformer-8k-v2 - 实时语音识别模型

3. **DashScope（通义千问）TTS 模型**
   - sambert-zhichu-v1 - DashScope主流的语音合成模型

4. **DashScope（通义千问）STT 模型**
   - paraformer-v2 - DashScope主流的语音识别模型

### 计费配置

- **TTS 模型**：按字符数计费（每千字符 0.01 元，示例价格，需根据实际价格调整）
- **STT 模型**：按分钟计费（每分钟 0.05 元，示例价格，需根据实际价格调整）

## 执行方式

### 方式1：使用执行脚本（推荐）

```bash
# 设置数据库连接信息（可选，默认使用 localhost:3306）
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=heartsphere
export DB_USER=root
export DB_PASSWORD=your_password

# 执行迁移
./scripts/execute_audio_models_migration.sh
```

### 方式2：直接使用 MySQL 客户端

```bash
mysql -h localhost -u root -p heartsphere < backend/src/main/resources/db/migration/V10010__add_audio_models_doubao_dashscope.sql
```

### 方式3：使用 Flyway 自动迁移（推荐用于生产环境）

如果项目使用 Flyway 进行数据库迁移管理，迁移脚本会在 Spring Boot 应用启动时自动执行。

```bash
# 启动 Spring Boot 应用
cd backend
./mvnw spring-boot:run
# 或
java -jar target/heartsphere-backend.jar
```

Flyway 会自动检测并执行 `V10010__add_audio_models_doubao_dashscope.sql` 迁移脚本。

## 验证迁移结果

执行迁移后，可以使用以下 SQL 查询验证迁移结果：

```sql
-- 查看模型配置统计
SELECT 
    '模型配置统计' AS type,
    provider,
    capability,
    COUNT(*) AS count
FROM ai_model_config 
WHERE provider IN ('doubao', 'dashscope') AND capability = 'audio'
GROUP BY provider, capability;

-- 查看计费信息统计
SELECT 
    '计费信息统计' AS type,
    amc.provider,
    amc.model_name,
    amp.pricing_type,
    amp.unit_price,
    amp.unit
FROM ai_model_pricing amp
INNER JOIN ai_model_config amc ON amp.model_id = amc.id
WHERE amc.provider IN ('doubao', 'dashscope') AND amc.capability = 'audio'
ORDER BY amc.provider, amc.model_name, amp.pricing_type;
```

## 预期结果

迁移成功后，应该看到：

- **模型配置**：5 条记录
  - doubao: CosyVoice (audio)
  - doubao: Fun-ASR (audio)
  - doubao: Paraformer-8k-v2 (audio)
  - dashscope: sambert-zhichu-v1 (audio)
  - dashscope: paraformer-v2 (audio)

- **计费信息**：5 条记录
  - CosyVoice: audio_character (每千字符)
  - Fun-ASR: audio_minute (每分钟)
  - Paraformer-8k-v2: audio_minute (每分钟)
  - sambert-zhichu-v1: audio_character (每千字符)
  - paraformer-v2: audio_minute (每分钟)

## 注意事项

1. **价格调整**：迁移脚本中的价格是示例价格，需要根据实际 API 提供商的价格进行调整。

2. **API Key 配置**：模型配置中的 `api_key` 字段为空，需要在管理后台或通过配置服务设置实际的 API Key。

3. **重复执行**：迁移脚本使用 `ON DUPLICATE KEY UPDATE`，可以安全地重复执行，不会产生重复数据。

4. **Flyway 版本控制**：如果使用 Flyway，迁移脚本的版本号 `V10010` 必须唯一，不能与现有迁移脚本冲突。

## 回滚

如果需要回滚迁移，可以执行以下 SQL：

```sql
-- 删除计费信息
DELETE FROM ai_model_pricing 
WHERE model_id IN (
    SELECT id FROM ai_model_config 
    WHERE provider IN ('doubao', 'dashscope') AND capability = 'audio'
);

-- 删除模型配置
DELETE FROM ai_model_config 
WHERE provider IN ('doubao', 'dashscope') AND capability = 'audio';
```

## 相关文件

- 迁移脚本：`backend/src/main/resources/db/migration/V10010__add_audio_models_doubao_dashscope.sql`
- 执行脚本：`scripts/execute_audio_models_migration.sh`
- 代码实现：
  - `backend/src/main/java/com/heartsphere/aiagent/adapter/DoubaoAdapter.java`
  - `backend/src/main/java/com/heartsphere/aiagent/adapter/DashScopeAdapter.java`
  - `backend/src/main/java/com/heartsphere/aiagent/adapter/MultimodalService.java`
