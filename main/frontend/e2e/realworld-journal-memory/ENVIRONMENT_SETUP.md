# 测试环境准备指南

## 前置条件

### 1. Python 环境
- Python 3.8 或更高版本
- 检查：`python3 --version`

### 2. 安装 web-automation-testing 依赖
```bash
cd /Users/admin/Workspace/heartsphere_new/.claude/skills/web-automation-testing
pip3 install -r requirements.txt
playwright install
```

### 3. 启动服务

#### 启动 Main 后端
```bash
cd /Users/admin/Workspace/heartsphere_new/main/backend
mvn spring-boot:run
```
后端应运行在 `http://localhost:8081`

#### 启动 Main 前端
```bash
cd /Users/admin/Workspace/heartsphere_new/main/frontend
npm run dev
```
前端应运行在 `http://localhost:3000`

### 4. 验证服务
```bash
# 检查后端
curl http://localhost:8081/actuator/health

# 检查前端
curl http://localhost:3000
```

### 5. 测试账号
- 用户名：`tongyexin`
- 密码：`123456`
- 或使用游客模式（如果支持）

## 快速开始

### 方式 1：使用 npm scripts（推荐）
```bash
cd /Users/admin/Workspace/heartsphere_new/main/frontend

# 执行测试
npm run test:e2e:journal-memory

# 生成 HTML 报告
npm run test:e2e:journal-memory:report
```

### 方式 2：使用测试脚本
```bash
cd /Users/admin/Workspace/heartsphere_new/main/frontend/e2e/realworld-journal-memory
./run_tests.sh
```

### 方式 3：直接使用 Python 脚本
```bash
cd /Users/admin/Workspace/heartsphere_new

# 执行测试
python3 .claude/skills/web-automation-testing/scripts/test_runner.py \
  main/frontend/e2e/realworld-journal-memory/test_plan.json \
  --max-iterations 5 \
  --report main/frontend/e2e/realworld-journal-memory/report.json

# 生成报告
python3 .claude/skills/web-automation-testing/scripts/report_generator.py \
  main/frontend/e2e/realworld-journal-memory/report.json \
  html \
  main/frontend/e2e/realworld-journal-memory/report.html
```

## 故障排除

### Playwright 未安装
```bash
cd .claude/skills/web-automation-testing
pip3 install playwright
playwright install
```

### 服务未启动
- 确保后端在 8081 端口运行
- 确保前端在 5173 端口运行
- 检查防火墙设置

### 测试失败
- 检查浏览器控制台错误
- 检查网络请求是否成功
- 查看测试报告了解详细错误信息
