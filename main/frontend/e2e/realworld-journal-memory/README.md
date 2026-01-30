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
- Main 前端运行在 `http://localhost:3000`
- Main 后端运行在 `http://localhost:8081`
- Python 3.8+ 已安装
- Playwright 已安装（`pip install playwright && playwright install`）

### 测试账号与登录
- 用户名：`tongyexin`，密码：`123456`
- 每个用例均包含登录步骤：打开页面后点击「登录账户」→ 输入上述账号密码 → 点击「登录」→ 再执行进入现实世界等步骤；无需预先在浏览器中登录

### 依赖安装
```bash
# 安装 Python 依赖（如果需要）
cd .claude/skills/web-automation-testing
pip install -r requirements.txt

# 安装 Playwright 浏览器
playwright install
```

## 需求与用例对应关系

本目录的自动化测试按「需求分析 → 围绕需求编写用例」流程设计。功能点与验收条件、用例与需求的对应关系见 **`REQUIREMENTS.md`**。test_plan.json 中的 `requirements` 与各 test_case 可追溯到 REQ-1～REQ-8。

## 测试文件

- `test_plan.json` - 测试计划 JSON 文件（含 12 个用例，覆盖 REQ-1～REQ-8）
- `REQUIREMENTS.md` - 需求分析、功能点与验收条件、用例与需求对应表
- `TEST_PLAN_DETAILED.md` - 详细的测试用例说明
- `README.md` - 本文件

## 执行测试

### 方式 1：使用 test_runner（推荐）

完整工作流（执行 → 失败即终止，将结果交 Agent 分析修复 → 再由 Agent 发起下一轮测试）：
```bash
# 从项目根目录执行
python .claude/skills/web-automation-testing/scripts/test_runner.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --report main/frontend/e2e/realworld-journal-memory/report.json
```

从失败用例继续（修改用例后使用，避免从头跑全量）：
```bash
python .claude/skills/web-automation-testing/scripts/test_runner.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --report main/frontend/e2e/realworld-journal-memory/report.json \
  --resume-from main/frontend/e2e/realworld-journal-memory/test_run_state.json
```

### 方式 2：使用 test_executor

仅执行测试（失败即终止，不自动重试；结果交 Agent 分析修复后由 Agent 再次发起）：
```bash
# 从项目根目录执行
python .claude/skills/web-automation-testing/scripts/test_executor.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --output main/frontend/e2e/realworld-journal-memory/results.json
# 可选：--no-headless 显示浏览器窗口
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

报告与 test_run_state 保存于本目录（main/frontend/e2e/realworld-journal-memory/）。执行 test_runner 后使用 report_generator 生成可读报告：

### Markdown 报告
```bash
# 从项目根目录执行
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
- **用例 5.3**：搜索无结果

### 测试套件 4 补充
- **用例 4.4**：记忆模态框空状态

详细步骤请参考 `TEST_PLAN_DETAILED.md`；用例与需求对应见 `REQUIREMENTS.md`。

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

## 测试失败时的日志检查与服务重启（对齐 web-automation-testing 技能）

本测试方案与项目内 **web-automation-testing** 技能的工作流一致：测试失败时会自动或按文档检查前后端日志，如需重启服务则**统一通过项目根目录下 `scripts/start/` 的脚本**启动，不与技能的 service_manager / log 解析冲突。

### 失败时查看日志

- **main 前端**：技能会根据 `scripts/start/start-main-frontend.sh` 等脚本解析日志路径（如 `main/frontend-frontend.log` 或脚本内重定向路径），检查连接失败、白屏、未就绪等。
- **main 后端**：技能会根据 `scripts/start/start-main-backend.sh` 等脚本解析日志路径，检查 5xx、端口占用、启动失败等。
- 详细约定见技能文档：`.claude/skills/web-automation-testing/SKILL.md` 的 **Service Configuration**、**Troubleshooting**，以及 `references/service_configuration.md`、`references/log_checking_strategies.md`。

### 服务重启（仅使用 scripts/start/）

若修复配置或代码后需要重启服务，请使用项目根目录下脚本，**不要**使用 ad-hoc 的 `npm run dev`、`mvn spring-boot:run` 作为官方约定：

```bash
# 在项目根目录下执行
# 启动 main 前端（端口 3000）
./scripts/start/start-main-frontend.sh

# 启动 main 后端（端口 8081）
./scripts/start/start-main-backend.sh
```

这样与技能的自动重启与日志解析一致，便于 CI 或统一环境复现。

## 故障排除

### 测试失败常见原因

1. **元素未找到**
   - 检查选择器是否正确
   - 增加等待时间
   - 使用更稳定的选择器（如 ID 或 role）

2. **超时 / 连接拒绝**
   - 检查前端（http://localhost:3000）、后端（http://localhost:8081）是否已启动
   - 按上文「失败时查看日志」检查前后端日志
   - 如需重启，使用 `scripts/start/start-main-frontend.sh`、`scripts/start/start-main-backend.sh`

3. **中文解析问题**
   - 确保使用 UTF-8 编码
   - 检查 `text=` 选择器是否正确处理中文

4. **SPA 导航问题**
   - 使用特征文案验证状态
   - 不依赖 URL 变化
   - 增加状态变化的等待时间

## 全面测试执行结果摘要

执行完整测试后，可在此记录通过率与覆盖的功能点（或参见 `TEST_STATUS.md`、`VALIDATION_REPORT.md`）。  
当前覆盖：进入现实世界（REQ-1）、日记 CRUD（REQ-2）、写今日（REQ-3）、记忆提取与展示（REQ-4）、日记列表与搜索（REQ-5）、记忆空状态（REQ-7）、搜索无结果（REQ-8）。

## 端口与账号约定

与 add-realworld-journal-memory-automation-tests、add-main-project-e2e-testing 一致：前端 `http://localhost:3000`，后端 `http://localhost:8081`，测试账号 `tongyexin` / `123456`。

## 相关文档

- `REQUIREMENTS.md` - 需求分析、用例与需求对应关系
- `TEST_PLAN_DETAILED.md` - 详细的测试用例说明
- `.claude/skills/web-automation-testing/SKILL.md` - web-automation-testing 技能文档
- `.claude/skills/web-automation-testing/references/` - 参考资料

## 更新日志

- 2026-01-29: 增加 REQUIREMENTS.md、用例 4.4/5.3，需求与用例可追溯；补充 --resume-from 与全面测试说明
- 2026-01-28: 创建初始测试计划
