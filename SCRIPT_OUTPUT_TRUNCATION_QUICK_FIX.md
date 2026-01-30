# 脚本执行输出列溢出 - 快速修复指南

## 问题

脚本输出超过 65KB 时出现错误：
```
Data truncation: Data too long for column 'output' at row 1
```

## 快速修复（3 步，5 分钟）

### 1️⃣ 执行数据库迁移

```bash
cd /Users/admin/Workspace/heartsphere_new
scripts/devops/migrate-script-execution-columns.sh heartsphere root 123456
```

### 2️⃣ 重新编译后端

```bash
cd admin/backend
mvn clean install -DskipTests
```

### 3️⃣ 重启后端服务并测试

## 修复了什么

| 方面 | 前 | 后 |
|------|-----|-----|
| output 列大小 | TEXT (65KB) | LONGTEXT (4GB) |
| error 列大小 | TEXT (65KB) | LONGTEXT (4GB) |
| 数据库限制 | 65KB | 4GB |
| 代码限制 | 无 | 5MB（超过自动截断） |

## 为什么是 5MB？

- 数据库性能考虑
- 完整日志保存在文件系统
- 数据库仅用于备份
- 5MB 可覆盖 99% 的脚本输出

## 验证修复

```bash
# 方式 1：查询数据库
mysql -uroot -p123456 heartsphere -e "
  SELECT COLUMN_NAME, COLUMN_TYPE 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'heartsphere' 
  AND TABLE_NAME = 'script_executions' 
  AND COLUMN_NAME IN ('output', 'error');
"

# 预期：output 和 error 都应该是 longtext

# 方式 2：执行脚本测试
# 执行一个生成大量输出的脚本，验证执行成功
```

## 修改文件列表

1. `sql/migrate_script_execution_output_column.sql` - 数据库迁移
2. `admin/backend/src/main/java/com/heartsphere/admin/entity/ScriptExecution.java` - 实体定义
3. `admin/backend/src/main/java/com/heartsphere/admin/service/ScriptExecutionEngine.java` - 业务逻辑
4. `scripts/devops/migrate-script-execution-columns.sh` - 迁移脚本

## 监控

后端日志中检查截断警告：

```bash
tail -f logs/spring.log | grep "Script output is too large"
```

## 常见问题

**Q: 迁移会影响现有数据吗？**
A: 不会。只改变列大小，现有数据保持不变。

**Q: 需要停机吗？**
A: 不需要，但建议在低流量时期执行。

**Q: 如何恢复超过 5MB 的输出？**
A: 从 `logs/script-executions/execution-{id}.log` 恢复。

## 更多信息

详见 `docs/SCRIPT_EXECUTION_OUTPUT_COLUMN_FIX.md`
