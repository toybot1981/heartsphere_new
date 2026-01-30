#!/bin/bash

# Firecracker 支持检查脚本
# 用于验证服务器是否支持 Firecracker microVM

echo "=========================================="
echo "Firecracker 支持检查"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查结果
PASS=0
FAIL=0
WARN=0

# 1. 检查操作系统
echo "1. 检查操作系统..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    MACOS_VERSION=$(sw_vers -productVersion 2>/dev/null || echo "Unknown")
    echo "   操作系统: macOS $MACOS_VERSION"
    echo -e "   ${RED}❌ Firecracker 不支持 macOS${NC}"
    echo "   说明: Firecracker 需要 Linux + KVM 支持"
    echo "   建议: 在 Linux 服务器（如阿里云 ECS）上运行此脚本"
    echo ""
    echo "   在 Linux 服务器上运行:"
    echo "   ssh user@your-linux-server"
    echo "   ./scripts/check-firecracker-support.sh"
    exit 1
elif [ -f /etc/os-release ]; then
    # Linux
    . /etc/os-release
    echo "   操作系统: $NAME $VERSION"
    if [[ "$ID" == "ubuntu" ]] || [[ "$ID" == "debian" ]] || [[ "$ID" == "centos" ]] || [[ "$ID" == "rhel" ]]; then
        echo -e "   ${GREEN}✅ 支持的操作系统${NC}"
        ((PASS++))
    else
        echo -e "   ${YELLOW}⚠️  未测试的操作系统，可能支持${NC}"
        ((WARN++))
    fi
else
    echo -e "   ${RED}❌ 无法检测操作系统${NC}"
    ((FAIL++))
fi
echo ""

# 2. 检查 KVM 模块
echo "2. 检查 KVM 模块..."
if command -v lsmod &> /dev/null && lsmod | grep -q "^kvm"; then
    echo "   KVM 模块已加载:"
    lsmod | grep kvm | sed 's/^/   /'
    echo -e "   ${GREEN}✅ KVM 模块已加载${NC}"
    ((PASS++))
else
    echo -e "   ${YELLOW}⚠️  KVM 模块未加载（可能需要手动加载）${NC}"
    echo "   尝试加载 KVM 模块..."
    if modprobe kvm 2>/dev/null; then
        echo -e "   ${GREEN}✅ KVM 模块加载成功${NC}"
        ((PASS++))
    else
        echo -e "   ${RED}❌ 无法加载 KVM 模块${NC}"
        ((FAIL++))
    fi
fi
echo ""

# 3. 检查 CPU 虚拟化支持
echo "3. 检查 CPU 虚拟化支持..."
if [ -f /proc/cpuinfo ] && (grep -q vmx /proc/cpuinfo || grep -q svm /proc/cpuinfo); then
    if grep -q vmx /proc/cpuinfo; then
        echo "   CPU 虚拟化: Intel VT-x (vmx)"
    fi
    if grep -q svm /proc/cpuinfo; then
        echo "   CPU 虚拟化: AMD-V (svm)"
    fi
    echo -e "   ${GREEN}✅ CPU 支持硬件虚拟化${NC}"
    ((PASS++))
else
    echo -e "   ${RED}❌ CPU 不支持硬件虚拟化${NC}"
    echo "   注意: 某些云服务器可能禁用了虚拟化标志"
    ((FAIL++))
fi
echo ""

# 4. 检查 /dev/kvm 设备
echo "4. 检查 /dev/kvm 设备..."
if [ -c /dev/kvm ]; then
    KVM_PERM=$(stat -c "%a" /dev/kvm)
    KVM_OWNER=$(stat -c "%U:%G" /dev/kvm)
    echo "   /dev/kvm 权限: $KVM_PERM"
    echo "   /dev/kvm 所有者: $KVM_OWNER"
    if [ -r /dev/kvm ] && [ -w /dev/kvm ]; then
        echo -e "   ${GREEN}✅ /dev/kvm 可读写${NC}"
        ((PASS++))
    else
        echo -e "   ${YELLOW}⚠️  /dev/kvm 权限不足，可能需要添加到 kvm 组${NC}"
        echo "   解决方法: sudo usermod -aG kvm \$USER"
        ((WARN++))
    fi
else
    echo -e "   ${RED}❌ /dev/kvm 设备不存在${NC}"
    ((FAIL++))
fi
echo ""

# 5. 检查 Firecracker 是否已安装
echo "5. 检查 Firecracker 是否已安装..."
if command -v firecracker &> /dev/null; then
    FIRECRACKER_VERSION=$(firecracker --version 2>&1 | head -n 1)
    echo "   Firecracker 版本: $FIRECRACKER_VERSION"
    echo -e "   ${GREEN}✅ Firecracker 已安装${NC}"
    ((PASS++))
else
    echo -e "   ${YELLOW}⚠️  Firecracker 未安装${NC}"
    echo "   安装方法:"
    echo "   wget https://github.com/firecracker-microvm/firecracker/releases/download/v1.5.0/firecracker-v1.5.0-x86_64.tgz"
    echo "   tar -xzf firecracker-v1.5.0-x86_64.tgz"
    echo "   sudo mv release-*/firecracker-* /usr/local/bin/"
    ((WARN++))
fi
echo ""

# 6. 检查系统资源
echo "6. 检查系统资源..."
if command -v free &> /dev/null; then
    TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
else
    TOTAL_MEM="N/A"
fi
TOTAL_DISK=$(df -h / | awk 'NR==2 {print $4}' || echo "N/A")
if command -v nproc &> /dev/null; then
    CPU_CORES=$(nproc)
else
    CPU_CORES=$(sysctl -n hw.ncpu 2>/dev/null || echo "N/A")
fi

echo "   内存: ${TOTAL_MEM}GB"
echo "   磁盘可用: ${TOTAL_DISK}"
echo "   CPU 核心数: ${CPU_CORES}"

if [ "$TOTAL_MEM" != "N/A" ] && [ -n "$TOTAL_MEM" ] && [ "$TOTAL_MEM" -ge 4 ] 2>/dev/null; then
    echo -e "   ${GREEN}✅ 内存充足（推荐 >= 4GB）${NC}"
    ((PASS++))
elif [ "$TOTAL_MEM" != "N/A" ]; then
    echo -e "   ${YELLOW}⚠️  内存可能不足（推荐 >= 4GB）${NC}"
    ((WARN++))
fi

if [ "$CPU_CORES" != "N/A" ] && [ -n "$CPU_CORES" ] && [ "$CPU_CORES" -ge 2 ] 2>/dev/null; then
    echo -e "   ${GREEN}✅ CPU 核心数充足（推荐 >= 2）${NC}"
    ((PASS++))
elif [ "$CPU_CORES" != "N/A" ]; then
    echo -e "   ${YELLOW}⚠️  CPU 核心数可能不足（推荐 >= 2）${NC}"
    ((WARN++))
fi
echo ""

# 7. 检查网络配置能力
echo "7. 检查网络配置能力..."
if command -v ip &> /dev/null; then
    echo -e "   ${GREEN}✅ ip 命令可用（用于网络配置）${NC}"
    ((PASS++))
else
    echo -e "   ${YELLOW}⚠️  ip 命令不可用${NC}"
    ((WARN++))
fi

if command -v iptables &> /dev/null || command -v nftables &> /dev/null; then
    echo -e "   ${GREEN}✅ 防火墙工具可用${NC}"
    ((PASS++))
else
    echo -e "   ${YELLOW}⚠️  防火墙工具不可用${NC}"
    ((WARN++))
fi
echo ""

# 总结
echo "=========================================="
echo "检查总结"
echo "=========================================="
echo -e "通过: ${GREEN}$PASS${NC}"
echo -e "警告: ${YELLOW}$WARN${NC}"
echo -e "失败: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    if [ $WARN -eq 0 ]; then
        echo -e "${GREEN}✅ 服务器完全支持 Firecracker！${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  服务器基本支持 Firecracker，但有一些警告需要处理${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ 服务器不支持 Firecracker，需要解决上述问题${NC}"
    echo ""
    echo "常见问题解决:"
    echo "1. KVM 未加载: sudo modprobe kvm"
    echo "2. /dev/kvm 权限: sudo usermod -aG kvm \$USER"
    echo "3. CPU 虚拟化: 检查 BIOS 设置或云服务器配置"
    exit 1
fi
