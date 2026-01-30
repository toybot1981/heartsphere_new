#!/bin/bash
# 运行 MCP 相关单元测试
# 用法: ./run-mcp-tests.sh  或  bash run-mcp-tests.sh
# 说明: 首次运行会编译全部测试类，可能需 2–5 分钟

set -e
cd "$(dirname "$0")"

echo "运行 MCP 单元测试: McpToolExecutorTest, McpProtocolTest"
echo "（首次运行会编译测试代码，请稍候）"
echo "---"
mvn test -Dtest=McpToolExecutorTest,McpProtocolTest "$@"
EXIT=$?
echo "---"
[ $EXIT -eq 0 ] && echo "测试通过" || echo "测试失败 (exit $EXIT)"
exit $EXIT
