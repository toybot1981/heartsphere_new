# 页面内容分析与 Cursor 分析工件

## 概述

当测试步骤失败时，执行器会采集当前页面的上下文并生成供 Cursor 使用的分析工件，便于在 Cursor 中根据「页面当时长什么样、断言期望什么、实际报什么错」进行分析和修复。

## 何时生成

- 任一测试步骤标记为**失败**时（包括页面断言失败、数据库验证失败等）
- 执行器会在**所有用例执行结束后**，为每个失败用例生成一份 Cursor 分析

## 采集内容

失败时刻会采集：

- **URL**：当前页面地址
- **标题**：`document.title`
- **可见文本摘要**：body 内主要可见文本，长度上限约 2000 字符（可配置 `PAGE_CONTEXT_TEXT_LIMIT`）
- **相关 DOM 片段**：若失败步骤涉及选择器（click/verify/type/fill），采集该选择器对应元素的 `outerHTML`，长度上限约 3000 字符（可配置 `PAGE_CONTEXT_DOM_LIMIT`）
- **截图路径**：失败时截图保存路径
- **失败步骤描述**、**预期/实际错误信息**
- 若为数据库验证步骤失败，还会包含 **SQL、查询结果、预期值、实际值**

上述内容会写入用例结果的 `page_context` 等字段，并汇总到 Cursor 分析工件中。

## 文件位置与命名

- **默认目录**：与测试结果 JSON 同目录下的 `cursor_analysis/` 子目录  
  例如：`--output ./reports/results.json` 时，工件目录为 `./reports/cursor_analysis/`
- **自定义目录**：
  - 测试计划中：`cursor_analysis_output_dir`: `"path/to/dir"`
  - 环境变量：`CURSOR_ANALYSIS_DIR`
- **文件名**：`cursor_analysis_<case_id>_<timestamp>.md`（同名的 `.json` 为可选机器可读格式）

## 工件格式

- **Markdown（.md）**：标题、用例信息、失败步骤、预期/实际、页面摘要、DOM 片段、截图路径、数据库验证失败信息（若有）、使用说明。适合在 Cursor 中直接打开或粘贴到对话。
- **JSON（.json）**：同内容的结构化数据，便于脚本或后续工具消费。

测试结果 JSON 中会记录 `cursor_analysis_path`，指向生成的 `.md` 路径；报告生成器会在报告中引用该路径（如「详见 Cursor 分析：\<path\>」）。

## 在 Cursor 中使用

1. **打开文件**：在 Cursor 中打开 `cursor_analysis_<case_id>_<timestamp>.md`
2. **粘贴到对话**：将文件内容复制到 Cursor 对话中，让 AI 根据页面上下文和失败信息分析原因
3. **结合截图**：若截图路径可访问，可一并提供给 AI 以辅助分析

示例（终端复制到剪贴板后粘贴到 Cursor）：

```bash
cat cursor_analysis/cursor_analysis_login_01_20250128120000.md | pbcopy   # macOS
```

## 相关

- 数据库验证步骤失败时同样会触发页面内容采集，并在工件中包含数据库验证失败信息。参见 `references/database_verification.md`。
