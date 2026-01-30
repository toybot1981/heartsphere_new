# Memory / HSMem 兼容 API 自动化测试

## 范围

Main 后端 `/api/memory/v1/hsmem/*` 接口，与 HSMem 逻辑及契约一致。默认 **local**（Main 内置），可配置 `memory.hsmem.mode=remote` 使用外部 HSMem 服务。

## 前置

- Main 后端已启动：`./scripts/start/start-main-backend.sh`，确保 `http://localhost:8081` 可访问。
- **默认 local**：无需额外配置；本地存储根目录 `heartsphere.memory.hsmem.local.base-path`（默认 `./memory_data`）。
- **remote 模式**：`HSMEM_MODE=remote ./scripts/start/start-main-backend.sh`，或配置 `heartsphere.memory.hsmem.mode=remote`。
- **运维**：启动完成后日志中会打印 `[HSMem] mode=local|remote`，用于确认当前使用的实现（内置 vs 外部服务）。

## 执行

**前置**：Main 后端已启动（`./scripts/start/start-main-backend.sh`），8081 就绪。

```bash
# 从项目根执行；第一步 guest-login 保存 token，后续 memorize/retrieve/items 自动携带
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  main/backend/api-tests/memory-hsmem/api_test_plan.json \
  --output main/backend/api-tests/memory-hsmem/results.json
```

失败时查看 `agent_failure_summary.md`、`test_run_state.json`，修复后重启 Main 后端，再：

```bash
python .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  main/backend/api-tests/memory-hsmem/api_test_plan.json \
  --output main/backend/api-tests/memory-hsmem/results.json \
  --resume-from main/backend/api-tests/memory-hsmem/test_run_state.json
```

## 生成报告

```bash
python .claude/skills/api-automation-testing/scripts/report_generator.py \
  main/backend/api-tests/memory-hsmem/results.json markdown \
  main/backend/api-tests/memory-hsmem/report.md
```

## 资产

- `api_test_plan.json`：测试计划
- `REQUIREMENTS.md`：需求分析
- `results.json`：执行结果
- `report.md` / `report.html`：报告（由 report_generator 生成）
- `agent_failure_summary.md`：失败摘要（失败时生成）
- `test_run_state.json`：现场状态（用于 `--resume-from`）
