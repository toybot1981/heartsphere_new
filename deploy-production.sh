#!/bin/bash

# 生产服务器部署脚本
# 在生产服务器上执行此脚本

set -e  # 遇到错误立即退出

echo "===== 开始在生产服务器上构建前端 ====="

# 1. 进入项目目录
cd /path/to/heartsphere_new  # 请修改为实际的项目路径

# 2. 拉取最新代码
echo "拉取最新代码..."
git pull origin master

# 3. 进入前端目录
cd frontend

# 4. 安装依赖（如果需要）
echo "安装依赖..."
npm install

# 5. 创建 .env 文件（如果不存在）
if [ ! -f .env ]; then
    echo "创建 .env 文件..."
    cat > .env << 'EOF'
VITE_API_BASE_URL=http://heartsphere.cn:8080
EOF
fi

# 6. 清理旧构建
echo "清理旧构建..."
rm -rf dist

# 7. 构建
echo "开始构建..."
npm run build

# 8. 部署到 nginx（根据实际情况修改路径）
echo "部署到 nginx..."
NGINX_PATH="/var/www/html"  # 请修改为实际的 nginx 静态文件目录

# 备份旧文件（可选）
if [ -d "$NGINX_PATH" ]; then
    echo "备份旧文件..."
    sudo tar -czf /tmp/heartsphere_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C "$NGINX_PATH" .
fi

# 复制新构建文件
echo "复制新构建文件到 $NGINX_PATH..."
sudo cp -r dist/* "$NGINX_PATH/"

# 9. 设置权限
echo "设置文件权限..."
sudo chown -R www-data:www-data "$NGINX_PATH"  # 根据实际情况修改用户和组
sudo chmod -R 755 "$NGINX_PATH"

echo "===== 部署完成 ====="
echo "请访问 http://heartsphere.cn 检查是否正常"
