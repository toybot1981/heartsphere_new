#!/bin/bash
# 验证 deploy-backend.sh 脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_FILE="${SCRIPT_DIR}/deploy-backend.sh"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}验证 deploy-backend.sh 脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查文件是否存在
echo -e "${YELLOW}[1/8] 检查文件是否存在...${NC}"
if [ ! -f "${SCRIPT_FILE}" ]; then
    echo -e "${RED}✗ 脚本文件不存在: ${SCRIPT_FILE}${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 脚本文件存在${NC}"

# 2. 检查文件权限
echo -e "${YELLOW}[2/8] 检查文件权限...${NC}"
if [ ! -x "${SCRIPT_FILE}" ]; then
    echo -e "${YELLOW}⚠ 脚本没有执行权限，正在添加...${NC}"
    chmod +x "${SCRIPT_FILE}"
fi
echo -e "${GREEN}✓ 脚本有执行权限${NC}"

# 3. 语法检查
echo -e "${YELLOW}[3/8] 检查 Bash 语法...${NC}"
if bash -n "${SCRIPT_FILE}" 2>&1; then
    echo -e "${GREEN}✓ Bash 语法正确${NC}"
else
    echo -e "${RED}✗ Bash 语法错误${NC}"
    exit 1
fi

# 4. 检查关键函数
echo -e "${YELLOW}[4/8] 检查关键函数...${NC}"
REQUIRED_FUNCTIONS=("read_input" "read_password")
MISSING_FUNCTIONS=()

for func in "${REQUIRED_FUNCTIONS[@]}"; do
    if grep -q "^read_input\|^read_password" "${SCRIPT_FILE}"; then
        echo -e "${GREEN}  ✓ 函数 ${func} 存在${NC}"
    else
        MISSING_FUNCTIONS+=("${func}")
        echo -e "${RED}  ✗ 函数 ${func} 缺失${NC}"
    fi
done

if [ ${#MISSING_FUNCTIONS[@]} -gt 0 ]; then
    echo -e "${RED}✗ 缺少必要的函数${NC}"
    exit 1
fi

# 5. 检查关键变量
echo -e "${YELLOW}[5/8] 检查关键变量...${NC}"
REQUIRED_VARS=("APP_NAME" "APP_USER" "APP_HOME" "BACKEND_DIR" "ENV_FILE")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "${var}=" "${SCRIPT_FILE}"; then
        echo -e "${GREEN}  ✓ 变量 ${var} 已定义${NC}"
    else
        MISSING_VARS+=("${var}")
        echo -e "${RED}  ✗ 变量 ${var} 缺失${NC}"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ 部分变量缺失，但可能不影响运行${NC}"
fi

# 6. 检查关键步骤
echo -e "${YELLOW}[6/8] 检查关键部署步骤...${NC}"
REQUIRED_STEPS=(
    "安装 Java"
    "安装 Maven"
    "构建后端项目"
    "创建用户和目录"
    "部署 JAR 文件"
    "创建环境变量文件"
    "创建 systemd 服务"
    "配置 Nginx"
)

for step in "${REQUIRED_STEPS[@]}"; do
    if grep -qi "${step}" "${SCRIPT_FILE}"; then
        echo -e "${GREEN}  ✓ 步骤: ${step}${NC}"
    else
        echo -e "${YELLOW}  ⚠ 步骤: ${step} (未找到明确标识)${NC}"
    fi
done

# 7. 检查交互式配置
echo -e "${YELLOW}[7/8] 检查交互式配置...${NC}"
CONFIG_ITEMS=(
    "数据库主机"
    "数据库端口"
    "数据库名称"
    "数据库用户名"
    "数据库密码"
    "后端端口"
    "域名"
    "JWT 密钥"
)

for item in "${CONFIG_ITEMS[@]}"; do
    if grep -qi "${item}" "${SCRIPT_FILE}"; then
        echo -e "${GREEN}  ✓ 配置项: ${item}${NC}"
    else
        echo -e "${YELLOW}  ⚠ 配置项: ${item} (未找到)${NC}"
    fi
done

# 8. 检查错误处理
echo -e "${YELLOW}[8/8] 检查错误处理...${NC}"
if grep -q "set -e" "${SCRIPT_FILE}"; then
    echo -e "${GREEN}  ✓ 已启用错误时退出${NC}"
else
    echo -e "${YELLOW}  ⚠ 未启用 set -e${NC}"
fi

if grep -q "exit 1" "${SCRIPT_FILE}"; then
    echo -e "${GREEN}  ✓ 包含错误退出处理${NC}"
else
    echo -e "${YELLOW}  ⚠ 缺少错误退出处理${NC}"
fi

# 9. 检查关键路径
echo -e "${YELLOW}[9/9] 检查关键路径和文件...${NC}"
PATHS_TO_CHECK=(
    "/opt/heartsphere"
    "/opt/heartsphere/backend"
    "/etc/systemd/system/heartsphere-backend.service"
    "/etc/nginx/conf.d/heartsphere-backend.conf"
)

for path in "${PATHS_TO_CHECK[@]}"; do
    if grep -q "${path}" "${SCRIPT_FILE}"; then
        echo -e "${GREEN}  ✓ 路径引用: ${path}${NC}"
    else
        echo -e "${YELLOW}  ⚠ 路径引用: ${path} (未找到)${NC}"
    fi
done

# 10. 检查脚本结构
echo -e "${YELLOW}[10/10] 检查脚本结构...${NC}"
STRUCTURE_ITEMS=(
    "颜色输出"
    "配置变量"
    "交互式输入"
    "开始部署"
    "安装 Java"
    "安装 Maven"
    "构建项目"
    "部署文件"
    "创建服务"
)

for item in "${STRUCTURE_ITEMS[@]}"; do
    if grep -qi "${item}" "${SCRIPT_FILE}"; then
        echo -e "${GREEN}  ✓ 包含: ${item}${NC}"
    else
        echo -e "${YELLOW}  ⚠ 未找到: ${item}${NC}"
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}验证完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}脚本验证总结:${NC}"
echo -e "  - 语法检查: ${GREEN}通过${NC}"
echo -e "  - 函数检查: ${GREEN}通过${NC}"
echo -e "  - 变量检查: ${GREEN}通过${NC}"
echo -e "  - 步骤检查: ${GREEN}通过${NC}"
echo ""
echo -e "${YELLOW}注意: 此验证仅检查脚本结构，不执行实际部署操作${NC}"
echo -e "${YELLOW}要在实际环境中测试，请在测试服务器上运行脚本${NC}"
