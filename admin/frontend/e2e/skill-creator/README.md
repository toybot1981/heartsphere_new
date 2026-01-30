# 技能创建器 / 单表视图 E2E 测试

本目录用于存放技能管理（创建/生成/编辑/单表视图）的自动化测试方案，由 **web-automation-testing** 技能完成。

- **需求分析**：执行时先对技能创建器与单表展示/编辑模块做需求分析，再围绕需求编写用例。
- **测试资产**：`test_plan.json`、README、results、report 等保存在本目录。

## 前置条件

- **Admin 前端**：http://localhost:3005/admin（须先 `cd admin/frontend && npm run dev` 并确认浏览器能正常打开、登录后能看到主界面）
- **Admin 后端**：http://localhost:8085
- **管理员账号**：admin / 指定密码（如 Tyx@19811009）
- **Python 3.8+**、**Playwright** 已安装

若登录后出现「加载失败」或 `Failed to fetch dynamically imported module: .../AdminScreen.tsx`，说明主界面懒加载失败，需先在本机浏览器中确认 Admin 能完整加载后再跑 e2e。

## 运行方式（从项目根目录）

```bash
# 执行测试（失败即停，结果交 Agent 分析后重跑）
python .claude/skills/web-automation-testing/scripts/test_runner.py admin/frontend/e2e/skill-creator/test_plan.json --report admin/frontend/e2e/skill-creator/report.json

# 仅执行一轮
python .claude/skills/web-automation-testing/scripts/test_executor.py admin/frontend/e2e/skill-creator/test_plan.json --output admin/frontend/e2e/skill-creator/results.json
```

说明：
- 完成标准：case_6 通过数据库验证，确认 `skill_definitions` 中技能 `e2e-verify-skill` 的 name、description 与创建时一致（即「数据库中查出来的技能数据跟创建时的数据完全一致」）。
- case_6 使用「verify database: SELECT ... expect ...」步骤，需：① 安装 pymysql（`pip install pymysql`）；② 数据库连接与 Admin 后端一致：在 test_plan.json **顶层**的 `database` 中填写与 Admin 相同的 `host/port/database/user/password`（与 Admin 的 application.yml 或环境变量一致），或设置环境变量 `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD`。若 case_6 报 Expected 1 got 0，请确认上述配置与 Admin 实际使用的库一致，并在 case_5 通过后手动执行 `SELECT * FROM skill_definitions WHERE skill_id='e2e-verify-skill'` 确认该库中是否有该条记录。
