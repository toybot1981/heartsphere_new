# Change: 完善 web-automation-testing 技能，添加日志检查和自动修复重启功能

## Why

当前 web-automation-testing 技能在测试失败时，只能自动修复测试用例本身（如更新选择器、添加等待条件），但无法诊断和修复底层服务问题。当测试失败是由于前后端服务异常（如服务崩溃、端口占用、配置错误等）导致时，需要：

1. **自动检查日志**：在测试失败时，自动检查相关前后端服务的日志文件，识别服务级别的错误
2. **自动修复服务问题**：根据日志分析结果，尝试自动修复服务问题（如重启服务、修复配置等）
3. **使用标准启动脚本**：修复完成后，使用项目根目录下 `scripts/start/` 中的标准启动脚本进行服务重启，确保与项目标准流程一致

这将使 web-automation-testing 技能能够处理更广泛的测试失败场景，不仅修复测试用例，还能修复底层服务问题。

4. **持续测试直到成功**：测试过程不停顿，修复完成后自动继续测试，循环执行"测试 → 失败 → 修复 → 重试"流程，直到所有测试通过或被人为打断为止

## What Changes

- **新增**：在测试失败时自动检查前后端日志文件的功能
- **新增**：从启动脚本中解析日志路径的功能，自动确定每个服务对应的日志文件位置
- **新增**：基于日志分析的自动服务问题诊断和修复功能
- **新增**：使用项目标准启动脚本（`scripts/start/`）进行服务重启的能力
- **修改**：`test_fixer.py` 和 `test_runner.py`，集成日志检查和修复流程
- **新增**：日志分析器模块，识别常见服务错误模式
- **新增**：服务管理器模块，支持服务重启和状态检查
- **新增**：服务配置映射，支持不同项目的日志路径和启动脚本差异
- **修改**：测试运行流程，支持持续测试直到成功或人为中断

## Impact

- **受影响的能力**：web-automation-testing 技能（`.claude/skills/web-automation-testing/`）
- **受影响的代码**：
  - `.claude/skills/web-automation-testing/scripts/test_fixer.py` - 添加日志检查逻辑
  - `.claude/skills/web-automation-testing/scripts/test_runner.py` - 集成日志检查和修复流程
  - `.claude/skills/web-automation-testing/scripts/` - 新增 `log_analyzer.py` 和 `service_manager.py`
  - `.claude/skills/web-automation-testing/SKILL.md` - 更新文档说明新功能
- **依赖**：
  - 项目根目录下 `scripts/start/` 目录中的启动脚本必须可用
  - 前后端服务的日志文件必须可访问（日志路径从启动脚本中解析或通过配置指定）
  - 不同项目可能有不同的日志路径模式（如 `main/backend-backend.log` vs `admin-backend.log`），系统需要支持这些差异
