# 提示词收集和导入工具

**创建日期**: 2025-01-13  
**用途**: 收集代码库中的硬编码提示词模板，分类并导入到管理系统

---

## 文件说明

### 扫描脚本

- **`scan-prompts.py`** - 自动扫描代码库中的提示词模板
  - 支持 `private static final String XXX_PROMPT = """` 模式
  - 支持 `String xxxPrompt = """` 模式
  - 生成 `scan-results.json` 扫描报告

### 分析脚本

- **`analyze-and-categorize.py`** - 分析和分类扫描结果
  - 自动分类提示词
  - 提取systemPrompt和userPrompt
  - 识别变量定义
  - 生成 `categorized-prompts.json`

### 手动补充

- **`manual-prompts.json`** - 手动添加的提示词（StringBuilder模式等）
  - 包含main项目中的动态构建提示词
  - 需要手动识别和添加

### 导入脚本

- **`import-prompts.py`** - 生成SQL导入脚本
  - 合并扫描和手动提示词
  - 生成 `import-prompts.sql` SQL脚本
  - 生成 `create-categories.sql` 分类创建脚本

---

## 使用步骤

### 1. 扫描代码库

```bash
cd /Users/admin/Workspace/heartsphere_new
python3 scripts/prompt-collection/scan-prompts.py
```

结果保存在: `scripts/prompt-collection/scan-results.json`

### 2. 分析和分类

```bash
python3 scripts/prompt-collection/analyze-and-categorize.py
```

结果保存在: `scripts/prompt-collection/categorized-prompts.json`

### 3. 手动补充（如需要）

编辑 `scripts/prompt-collection/manual-prompts.json`，添加StringBuilder模式的提示词

### 4. 生成导入脚本

```bash
python3 scripts/prompt-collection/import-prompts.py
```

生成文件:
- `scripts/prompt-collection/import-prompts.sql` - 完整的导入脚本
- `scripts/prompt-collection/create-categories.sql` - 分类创建脚本

### 5. 执行导入

```bash
mysql -u <username> -p <database> < scripts/prompt-collection/import-prompts.sql
```

---

## 当前收集结果

### 已收集的提示词（6个）

#### Mentis项目（4个）
1. **mentis-intent-recognition-basic** - 意图识别
2. **mentis-task-decomposition-single** - 单任务分解
3. **mentis-task-decomposition-multi-agent** - 多智能体任务分解
4. **mentis-response-generation-friendly** - 响应生成

#### Main项目（2个）
5. **main-emotion-analysis-default** - 情感分析
6. **main-letter-generation-character** - 信件生成

### 分类体系

#### 一级分类（项目模块）
- `main` - 主项目
- `mentis` - Mentis项目
- `admin` - 管理后台
- `shared` - 共享

#### 二级分类（功能模块）
- `main-emotion-analysis` - 情感分析
- `main-letter-generation` - 信件生成
- `main-ai-service` - AI服务
- `main-skill-execution` - 技能执行
- `mentis-intent-recognition` - 意图识别
- `mentis-task-decomposition` - 任务分解
- `mentis-response-generation` - 响应生成
- `mentis-multi-agent` - 多智能体

---

## 注意事项

1. **StringBuilder模式提示词**：需要手动识别和添加（已在 `manual-prompts.json` 中补充部分）
2. **变量提取**：自动提取 `{variableName}` 格式的变量
3. **SQL转义**：导入脚本已处理SQL字符串转义
4. **数据验证**：导入后需要在管理界面验证数据正确性

---

## 后续工作

1. 执行SQL脚本导入数据
2. 在管理界面验证数据
3. 继续收集遗漏的提示词（如LLMMemoryExtractor中的多个提示词）
4. 开始代码重构，从管理系统读取提示词
