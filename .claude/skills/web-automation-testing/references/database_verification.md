# 数据库验证步骤

## 概述

在涉及数据增删改查的页面操作之后，可使用**数据库验证步骤**通过执行 SELECT 查询来确认数据是否真正写入或更新，避免仅依赖页面提示或 UI 状态导致的误判。

## 语法

- `verify database: <SQL> [expect <value>]`
- `check database: <SQL> [expect <value>]`

仅支持 **SELECT** 查询；其他 SQL（INSERT/UPDATE/DELETE 等）不会被执行。

- **expect <value>**：与查询结果比较的预期值  
  - 若省略：单列单行结果时默认预期为 `1`（常用于 `SELECT COUNT(*) ...`）  
  - 支持数字、字符串、布尔（true/false）

## 配置

优先级从高到低：

1. **测试计划**：在测试计划 JSON 的 `database` 字段中配置  
   - `host`, `port`, `database`, `username`/`user`, `password`
2. **环境变量**：`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
3. **默认值**：localhost:3306，数据库名 heartsphere，用户 root，密码 123456

查询超时默认 5 秒。

## 示例

**期望存在一条记录（COUNT = 1）：**

```
verify database: SELECT COUNT(*) FROM users WHERE name='test'
```

省略 `expect` 时，单列单行结果默认与 `1` 比较。

**显式指定期望值：**

```
verify database: SELECT COUNT(*) FROM users WHERE name='test' expect 1
check database: SELECT status FROM orders WHERE id=1 expect paid
verify database: SELECT active FROM users WHERE id=1 expect true
```

**在测试步骤中的位置：**

通常放在「点击保存/提交」等步骤之后，用于验证数据库状态，例如：

1. navigate to http://localhost:3000/users
2. type 'newuser' in #username
3. click #save-button
4. verify database: SELECT COUNT(*) FROM users WHERE name='newuser' expect 1

## 失败时的行为

- 步骤标记为**失败**，并记录 SQL、查询结果、预期值、实际值
- 与页面步骤失败同等处理：触发页面内容采集，并生成 Cursor 分析工件；工件中会包含数据库验证失败信息（SQL、实际值、预期值）

## 依赖与限制

- 需要安装 **pymysql**：`pip install pymysql`
- 仅支持 SELECT；超时 5 秒
- 若未配置数据库或 pymysql 不可用，该步骤会失败并报错「Database verification not available」

## 相关

- 失败时的页面采集与 Cursor 分析工件说明：`references/cursor_analysis.md`
