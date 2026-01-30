# 测试执行指南

## 快速开始

由于自动化测试需要前端和后端服务都运行，请按照以下步骤执行：

### 步骤 1：启动后端服务

**推荐**：使用项目根目录下 `scripts/start/` 脚本（与 web-automation-testing 技能的 service_manager / 日志解析一致）：

在一个终端窗口中（项目根目录）：
```bash
cd /Users/admin/Workspace/heartsphere_new
./scripts/start/start-main-backend.sh
```

等待后端启动完成（通常会在 `http://localhost:8081` 运行）。

### 步骤 2：启动前端服务

**推荐**：使用项目根目录下 `scripts/start/` 脚本：

在另一个终端窗口中（项目根目录）：
```bash
cd /Users/admin/Workspace/heartsphere_new
./scripts/start/start-main-frontend.sh
```

等待前端启动完成（通常会在 `http://localhost:3000` 运行）。

### 步骤 3：验证服务

在第三个终端窗口中验证服务是否正常运行：
```bash
# 检查后端
curl http://localhost:8081/actuator/health

# 检查前端
curl http://localhost:3000
```

### 步骤 4：执行测试

服务启动后，在任意终端执行：

**方式 1：使用 npm scripts（推荐）**
```bash
cd /Users/admin/Workspace/heartsphere_new/main/frontend
npm run test:e2e:journal-memory
```

**方式 2：使用测试脚本**
```bash
cd /Users/admin/Workspace/heartsphere_new/main/frontend/e2e/realworld-journal-memory
./run_tests.sh
```

**方式 3：直接使用 Python 脚本**
```bash
cd /Users/admin/Workspace/heartsphere_new
python3 .claude/skills/web-automation-testing/scripts/test_runner.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --max-iterations 5 \
  --report main/frontend/e2e/realworld-journal-memory/report.json
```

**方式 4：有头模式（排查问题时推荐）**

在本地执行时如需看到浏览器窗口、逐步观察操作与失败步骤，请使用有头模式：

```bash
cd /Users/admin/Workspace/heartsphere_new/main/frontend
npm run test:e2e:journal-memory:debug
```

或直接调用 test_executor（单次执行，不重试）：
```bash
cd /Users/admin/Workspace/heartsphere_new/main/frontend
python3 ../../.claude/skills/web-automation-testing/scripts/test_executor.py \
  e2e/realworld-journal-memory/test_plan.json \
  --output e2e/realworld-journal-memory/report.json \
  --no-headless
```

会弹出 Chromium 窗口，按用例顺序执行步骤，失败时会保留当前页面便于查看。

### 步骤 5：查看测试报告

测试完成后，生成 HTML 报告：
```bash
cd /Users/admin/Workspace/heartsphere_new/main/frontend
npm run test:e2e:journal-memory:report
```

然后在浏览器中打开：
```
main/frontend/e2e/realworld-journal-memory/report.html
```

### 步骤 6：填写验证报告

执行完测试后，打开本目录下的 `VALIDATION_REPORT.md`，按以下顺序填写：

1. **执行环境信息**：填写执行时间、确认 app_url 为 `http://localhost:3000`、后端端口 8081、是否使用 `scripts/start/` 启动、Python/Playwright 版本。
2. **通过率统计**：从 `report.json` 或终端输出中抄写总用例数、通过/失败/跳过数量，计算成功率。
3. **典型失败原因分析**（若有失败）：记录失败用例 ID、失败步骤与错误信息；若已按技能流程查看过 main 前端/后端日志，简要记录；若做过重启或修复，一并记录。
4. **是否需要完善技能**：勾选「是」或「否」，若选「是」则写明需补充的 references/examples/scripts/SKILL.md 内容。
5. **备注**（可选）：其他发现或建议。

填写完成后保存 `VALIDATION_REPORT.md`，便于后续迭代测试或与 OpenSpec 任务 2.4、3.3 对齐。

## 执行逻辑说明

- **仅用例 1（进入现实世界）**：从 EntryPoint 执行「登录 → 进入现实世界 → 验证写今日」；完成后页面停留在现实世界，**不刷新、不回到 EntryPoint**。
- **用例 2～10**：在现实世界页面上继续执行（验证写今日 → 后续步骤），不再做 navigate 或登录。
- **遇失败即停止**：若某用例失败，后续用例不再执行，统一标记为 skipped；需修复失败用例后重新跑测。

## 测试用例说明

测试计划包含以下测试用例：

1. **进入现实世界** - 验证可以进入现实世界界面
2. **新建日记** - 测试创建新日记功能
3. **编辑日记** - 测试编辑已存在日记
4. **删除日记** - 测试删除日记功能
5. **写今日功能** - 测试快速写今日功能
6. **打开日记记忆模态框** - 测试查看记忆入口
7. **验证记忆展示** - 测试记忆内容展示
8. **验证记忆提取异步完成** - 测试记忆提取流程
9. **查看日记列表** - 测试列表展示
10. **搜索日记** - 测试搜索功能

## 故障排除

### 前端服务无法启动
- 使用 **scripts/start/start-main-frontend.sh** 启动（端口 3000）
- 检查 `node_modules` 是否已安装：`npm install`
- 检查端口 3000 是否被占用：`lsof -ti:3000`
- 查看前端启动日志（技能或脚本会解析日志路径）

### 后端服务无法启动
- 使用 **scripts/start/start-main-backend.sh** 启动（端口 8081）
- 检查 Java 和 Maven 是否已安装
- 检查数据库连接配置
- 查看后端启动日志（技能或脚本会解析日志路径）

### 测试执行失败
- 确保前端（3000）和后端（8081）服务都在运行
- **按 web-automation-testing 技能流程**：失败时检查 main 前端、main 后端日志（技能会自动或按文档解析 `scripts/start/` 下脚本的日志路径）
- 若需重启服务，统一使用 `scripts/start/start-main-frontend.sh`、`scripts/start/start-main-backend.sh`，不要使用 ad-hoc 的 npm/mvn 命令
- 查看测试报告了解详细错误信息
- 参考技能 SKILL.md 的 Service Configuration、Troubleshooting

### Playwright 相关问题
- 确保已安装 Playwright：`pip3 install playwright`
- 安装浏览器：`playwright install chromium`
- 检查 Python 版本（需要 3.8+）

## 测试数据

测试会创建以下测试数据：
- 标题为"测试日记标题"的日记
- 标题为"今日"的日记（通过写今日功能创建）
- 标题为"记忆提取测试"的日记

测试完成后，可以选择保留或删除这些测试数据。

## 注意事项

1. **异步操作**：记忆提取是异步的，测试中已包含适当的等待时间（3-5秒）
2. **SPA 导航**：由于是单页应用，测试不依赖 URL 变化，而是使用特征文案验证状态
3. **中文 UI**：测试使用中文文案进行选择，确保选择器正确匹配
4. **测试账号**：建议使用测试账号（tongyexin/123456）或游客模式
