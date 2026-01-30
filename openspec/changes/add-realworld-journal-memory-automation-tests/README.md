# 现实世界日记与记忆提取自动化测试

## 概述

本目录包含针对 main 工程「现实世界」日记功能和记忆提取功能的自动化测试计划。

## 测试范围

### 功能模块
1. **现实世界日记功能**（RealWorldScreen）
   - 进入现实世界
   - 新建、编辑、删除日记
   - 写今日功能
   - 日记列表和搜索

2. **记忆提取功能**
   - 从日记中自动提取记忆
   - 查看日记记忆（JournalMemoryModal）

## 前置条件

### 环境要求
- Main 前端运行在 `http://localhost:5173`
- Main 后端运行在 `http://localhost:8081`
- Python 3.8+ 已安装
- Playwright 已安装（`pip install playwright && playwright install`）

### 测试账号
- 用户名：`tongyexin`
- 密码：`123456`
- 或使用游客模式（如果支持）

### 依赖安装
```bash
# 安装 Python 依赖（如果需要）
cd .claude/skills/web-automation-testing
pip install -r requirements.txt

# 安装 Playwright 浏览器
playwright install
```

## 测试文件

- `test_plan.json` - 测试计划 JSON 文件
- `TEST_PLAN_DETAILED.md` - 详细的测试用例说明
- `README.md` - 本文件

## 执行测试

### 方式 1：使用 test_runner（推荐）

完整工作流（执行 → 修复 → 重试 → 报告）：
```bash
# 从项目根目录执行
python .claude/skills/web-automation-testing/scripts/test_runner.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --max-iterations 5 \
  --report main/frontend/e2e/realworld-journal-memory/report.json
```

### 方式 2：使用 test_executor

仅执行测试（不自动修复）：
```bash
python .claude/skills/web-automation-testing/scripts/test_executor.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --output main/frontend/e2e/realworld-journal-memory/results.json \
  --no-headless  # 可选：显示浏览器窗口
```

### 方式 3：使用 run_with_server

自动启动服务器并执行测试：
```bash
python .claude/skills/web-automation-testing/scripts/run_with_server.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --server "cd main/frontend && npm run dev" \
  --port 5173 \
  --max-iterations 3
```

## 生成报告

### Markdown 报告
```bash
python .claude/skills/web-automation-testing/scripts/report_generator.py \
  main/frontend/e2e/realworld-journal-memory/report.json \
  markdown \
  main/frontend/e2e/realworld-journal-memory/report.md
```

### HTML 报告
```bash
python .claude/skills/web-automation-testing/scripts/report_generator.py \
  main/frontend/e2e/realworld-journal-memory/report.json \
  html \
  main/frontend/e2e/realworld-journal-memory/report.html
```

## 测试用例说明

### 测试套件 1：进入现实世界
- **用例 1.1**：从入口点进入现实世界

### 测试套件 2：日记 CRUD 操作
- **用例 2.1**：新建日记
- **用例 2.2**：编辑日记
- **用例 2.3**：删除日记

### 测试套件 3：写今日功能
- **用例 3.1**：使用写今日快速创建日记

### 测试套件 4：记忆提取功能
- **用例 4.1**：打开日记记忆模态框
- **用例 4.2**：验证记忆展示
- **用例 4.3**：验证记忆提取异步完成

### 测试套件 5：日记列表和筛选
- **用例 5.1**：查看日记列表
- **用例 5.2**：搜索日记

详细步骤请参考 `TEST_PLAN_DETAILED.md`。

## 注意事项

### 中文 UI 测试
- 使用 `text=` 选择器匹配中文文案
- 示例：`text=写今日`、`text=新思维`
- 如果选择器不稳定，使用 `button:has-text("写今日")`

### SPA 导航
- 不依赖 URL 变化
- 使用特征文案验证页面状态
- 使用适当的等待时间

### 异步操作
- 记忆提取是异步的，需要等待 3-5 秒
- 模态框打开后需要等待内容加载
- 使用 `wait for` 确保元素就绪

### 测试数据
- 测试使用唯一的标题（如"测试日记标题"），便于识别
- 测试后可以选择保留或清理测试数据

## 故障排除

### 测试失败常见原因

1. **元素未找到**
   - 检查选择器是否正确
   - 增加等待时间
   - 使用更稳定的选择器（如 ID 或 role）

2. **超时**
   - 增加等待时间
   - 检查应用是否正常运行
   - 检查网络连接

3. **中文解析问题**
   - 确保使用 UTF-8 编码
   - 检查 `text=` 选择器是否正确处理中文

4. **SPA 导航问题**
   - 使用特征文案验证状态
   - 不依赖 URL 变化
   - 增加状态变化的等待时间

## 相关文档

- `TEST_PLAN_DETAILED.md` - 详细的测试用例说明
- `.claude/skills/web-automation-testing/SKILL.md` - web-automation-testing 技能文档
- `.claude/skills/web-automation-testing/references/` - 参考资料

## 更新日志

- 2026-01-28: 创建初始测试计划
