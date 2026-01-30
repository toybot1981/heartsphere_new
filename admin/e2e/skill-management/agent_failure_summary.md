# 测试失败摘要（供 Agent 修复后重跑）

以下用例失败，请根据错误信息与 Cursor 分析工件修复后重新运行测试。

## case_2_1: AI 生成简单描述

- **错误:** Step 12 failed: Text 'skillId' not found
- **失败步骤:** `verify text=skillId`
- **Cursor 分析:** admin/e2e/skill-management/cursor_analysis/cursor_analysis_case_2_1_20260129_023144.md
- **截图:** /tmp/test_case_2_1_20260129_023144.png

---
修复完成后请重新执行: python scripts/test_executor.py <plan> --output <results>
