# 脚本执行输出列溢出修复

## 问题描述

执行脚本时出现错误：
```
Data truncation: Data too long for column 'output' at row 1
```

## 根本原因

`script_executions` 表的 `output` 和 `error` 列定义为 `TEXT` 类型，最多只能存储 65KB 的数据。当脚本输出超过此限制时，数据库保存失败。

### 列类型限制
- `TEXT`: 最多 65KB (2^16 - 1 字节)
- `MEDIUMTEXT`: 最多 16MB (2^24 - 1 字节)
- `LONGTEXT`: 最多 4GB (2^32 - 1 字节)

## 解决方案

### 1. 数据库迁移

扩展 `output` 和 `error` 列从 `TEXT` 到 `LONGTEXT`：

```bash
# 执行迁移脚本
cd /Users/admin/Workspace/heartsphere_new
scripts/devops/migrate-script-execution-columns.sh heartsphere root 123456
```

**迁移 SQL**：
```sql
ALTER TABLE script_executions 
MODIFY COLUMN output LONGTEXT;

ALTER TABLE script_executions 
MODIFY COLUMN error LONGTEXT;
```

### 2. 代码修改

**文件 1**：`admin/backend/src/main/java/com/heartsphere/admin/entity/ScriptExecution.java`
- 更新 `@Column` 定义为 `columnDefinition = "LONGTEXT"`

**文件 2**：`admin/backend/src/main/java/com/heartsphere/admin/service/ScriptExecutionEngine.java`
- 添加 `MAX_OUTPUT_SIZE = 5MB` 常量
- 修改 `updateExecutionStatus()` 方法
- 自动截断超过 5MB 的输出（保留最后 5MB）
- 截断时在日志中记录警告

### 为什么限制到 5MB？

1. **数据库性能**：虽然 LONGTEXT 可以存储 4GB，但保存超大文本会影响性能
2. **备份功能**：数据库中的输出仅用于备份，不是主要存储
3. **完整日志**：完整的日志始终保存到文件系统 (`logs/script-executions/execution-{id}.log`)
4. **权衡**：5MB 是一个合理的平衡，可以存储大多数脚本的完整输出

## 修复步骤

### 第 1 步：执行数据库迁移

```bash
cd /Users/admin/Workspace/heartsphere_new

# 使用默认数据库 (heartsphere) 和用户 (root)，密码通过参数传递
scripts/devops/migrate-script-execution-columns.sh heartsphere root 123456
```

**预期输出**：
```
🔧 开始迁移 script_executions 表的列大小...
📦 数据库: heartsphere
👤 用户: root

📊 当前列的大小:
COLUMN_NAME  COLUMN_TYPE  CHARACTER_MAXIMUM_LENGTH
output       text         65535
error        text         65535

执行迁移脚本...
✅ 迁移成功！

📊 迁移后的列大小:
COLUMN_NAME  COLUMN_TYPE   CHARACTER_MAXIMUM_LENGTH
output       longtext      4294967295
error        longtext      4294967295
```

### 第 2 步：重新编译后端

```bash
cd admin/backend
mvn clean install -DskipTests
```

### 第 3 步：重启后端服务

```bash
# 停止现有的后端服务
# 启动新的后端服务
```

### 第 4 步：测试

1. 执行一个生成大量输出的脚本
2. 验证脚本执行成功
3. 查看数据库中的 `output` 字段是否正确保存
4. 检查后端日志是否有警告信息

## 验证迁移是否成功

```bash
# 使用 MySQL 命令行验证
mysql -uroot -p123456 heartsphere << 'SQL'
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'heartsphere' 
AND TABLE_NAME = 'script_executions' 
AND COLUMN_NAME IN ('output', 'error');
SQL
```

## 相关文件修改

### 1. ScriptExecution.java
```java
@Column(name = "output", columnDefinition = "LONGTEXT")
private String output;

@Column(name = "error", columnDefinition = "LONGTEXT")
private String error;
```

### 2. ScriptExecutionEngine.java
```java
private static final int MAX_OUTPUT_SIZE = 5 * 1024 * 1024; // 5MB

private void updateExecutionStatus(Long executionId, ...) {
    // ... 
    // 限制输出大小
    if (output != null && output.length() > MAX_OUTPUT_SIZE) {
        logger.warn("Script output is too large ({}), truncating to {} bytes", 
                output.length(), MAX_OUTPUT_SIZE);
        execution.setOutput("[...截断...]\n" + output.substring(...));
    }
    // ...
}
```

## FAQ

### Q: 为什么不用 MEDIUMTEXT (16MB)?
A: 5MB 对于数据库中的备份已经足够。完整的日志始终保存在文件系统中。

### Q: 迁移需要停机吗？
A: 不需要。`ALTER TABLE` 可以在线进行，但建议在低流量时期执行。

### Q: 如何恢复超过 5MB 的输出？
A: 从日志文件中恢复。所有输出都保存在 `logs/script-executions/execution-{id}.log`。

### Q: 旧的执行记录会受到影响吗？
A: 不会。迁移只改变列的大小限制，不修改现有数据。

## 最佳实践

1. **定期清理旧日志**
   - 脚本执行记录会随时间累积
   - 定期删除旧的执行记录和日志文件

2. **监控输出大小**
   - 后端日志中会记录超过 5MB 的输出
   - 定期检查这些警告

3. **流式处理大输出**
   - 对于生成大量输出的脚本，考虑使用流式输出处理
   - 实时推送到前端，而不是全部保存到数据库

## 总结

✅ **修复内容**：
- 数据库列大小从 65KB 扩展到 4GB
- 代码层面限制到 5MB（避免浪费数据库空间）
- 超大输出自动截断并记录警告

🎯 **预期结果**：
- 脚本执行不再因输出过大而失败
- 完整日志始终保存到文件系统
- 数据库中保存最后 5MB 用于备份

📝 **监控建议**：
- 定期检查后端日志中的截断警告
- 定期清理旧的执行记录

