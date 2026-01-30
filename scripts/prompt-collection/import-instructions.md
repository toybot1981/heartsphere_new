# 提示词数据导入说明

**创建日期**: 2025-01-13

---

## 导入方式

### 方式1: 使用SQL脚本（推荐）

1. **确认数据库连接信息**
   - 数据库名: `heartsphere`（或你的数据库名）
   - 用户名: 你的MySQL用户名

2. **执行导入脚本**
   ```bash
   mysql -u <username> -p <database> < scripts/prompt-collection/import-prompts.sql
   ```

3. **验证导入结果**
   ```sql
   -- 检查分类
   SELECT * FROM prompt_categories ORDER BY code;
   
   -- 检查提示词模板
   SELECT name, category_code, description FROM prompt_templates ORDER BY category_code, name;
   ```

### 方式2: 通过管理界面导入

1. 启动管理后台服务
2. 登录管理后台
3. 进入"提示词管理"页面
4. 手动创建分类和模板（参考 `categorized-prompts.json` 和 `manual-prompts.json`）

### 方式3: 通过API导入（需要编写脚本）

参考 `AdminPromptController` 的API，编写导入脚本调用API。

---

## 导入内容

### 分类体系（8个二级分类）

#### Main项目
- `main-emotion-analysis` - 情感分析
- `main-letter-generation` - 信件生成
- `main-ai-service` - AI服务
- `main-skill-execution` - 技能执行

#### Mentis项目
- `mentis-intent-recognition` - 意图识别
- `mentis-task-decomposition` - 任务分解
- `mentis-response-generation` - 响应生成
- `mentis-multi-agent` - 多智能体

### 提示词模板（6个）

1. `mentis-intent-recognition-basic` - 意图识别
2. `mentis-task-decomposition-single` - 单任务分解
3. `mentis-task-decomposition-multi-agent` - 多智能体任务分解
4. `mentis-response-generation-friendly` - 响应生成
5. `main-emotion-analysis-default` - 情感分析
6. `main-letter-generation-character` - 信件生成

---

## 验证步骤

### 1. 检查分类

```sql
SELECT code, name, parent_id, sort_order 
FROM prompt_categories 
ORDER BY parent_id, sort_order;
```

应该看到：
- 4个一级分类（main, mentis, admin, shared）
- 8个二级分类（功能模块）

### 2. 检查提示词模板

```sql
SELECT name, category_code, description, 
       LENGTH(system_prompt) as system_len,
       LENGTH(user_prompt) as user_len
FROM prompt_templates 
ORDER BY category_code, name;
```

应该看到6个提示词模板。

### 3. 在管理界面验证

1. 打开管理后台
2. 进入"提示词管理"
3. 检查分类列表是否正确显示
4. 检查每个分类下的提示词模板
5. 测试预览功能

---

## 注意事项

1. **SQL脚本使用ON DUPLICATE KEY UPDATE**：如果数据已存在，会更新而不是报错
2. **created_by字段**：默认使用admin_id=1，可根据实际情况修改
3. **字符编码**：确保数据库使用utf8mb4字符集
4. **JSON字段**：variables和example_data字段存储为JSON格式

---

## 故障排查

### 问题1: 分类创建失败

**原因**: 可能parent_id引用不存在
**解决**: 先执行一级分类创建，再执行二级分类

### 问题2: 提示词导入失败

**原因**: 可能category_code不存在
**解决**: 确保先创建分类，再导入提示词

### 问题3: JSON格式错误

**原因**: SQL转义可能有问题
**解决**: 检查variables和example_data字段的JSON格式

---

## 后续工作

导入完成后：
1. 在管理界面验证数据
2. 继续收集遗漏的提示词
3. 开始代码重构（阶段3）
