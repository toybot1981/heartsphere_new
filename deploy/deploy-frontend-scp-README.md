# SCP 前端部署脚本使用说明

## 概述

`deploy-frontend-scp.sh` 是一个使用 SCP/RSYNC 将前端构建产物部署到远程服务器的脚本。

## 功能特性

1. ✅ 自动构建前端项目（如需要）
2. ✅ 支持 SCP 和 RSYNC 两种上传方式
3. ✅ 自动备份远程现有文件
4. ✅ 保存配置以便下次使用
5. ✅ 交互式配置界面
6. ✅ 完整的错误处理

## 使用方法

### 基本使用

```bash
cd deploy
./deploy-frontend-scp.sh
```

### 配置说明

脚本会依次询问以下信息：

1. **远程服务器地址** - 可以是IP或域名（如：heartsphere.cn）
2. **SSH端口** - 默认22
3. **SSH用户名** - 默认root
4. **远程部署路径** - 默认 /opt/heartsphere/frontend
5. **SSH私钥路径** - 可选，留空使用默认

### 配置保存

脚本支持保存配置到 `.deploy-config` 文件，下次运行时自动加载。

## 部署流程

1. **检查前端目录** - 验证前端项目是否存在
2. **检查是否需要构建** - 如果 dist 目录不存在或为空，自动构建
3. **构建前端项目** - 运行 `npm run build`
4. **测试SSH连接** - 验证是否可以连接到远程服务器
5. **备份现有文件** - 自动备份远程目录到 `.backup.时间戳` 目录
6. **上传文件** - 使用 rsync（推荐）或 scp 上传
7. **设置权限** - 自动设置文件权限

## 上传方式

### 方式1：RSYNC（推荐）

如果系统安装了 `rsync`，脚本会自动使用 rsync 上传：
- ✅ 增量同步，只上传更改的文件
- ✅ 支持断点续传
- ✅ 显示上传进度
- ✅ 自动删除远程多余文件

### 方式2：SCP

如果没有 `rsync`，使用 scp 上传：
- ⚠️ 全量上传所有文件
- ⚠️ 速度较慢但兼容性好

## 配置示例

### 手动创建配置文件

创建 `deploy/.deploy-config` 文件：

```bash
# 远程服务器部署配置
REMOTE_HOST="heartsphere.cn"
REMOTE_PORT="22"
REMOTE_USER="root"
REMOTE_PATH="/opt/heartsphere/frontend"
SSH_KEY="~/.ssh/id_rsa"
```

### 使用SSH密钥

```bash
# 生成SSH密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 复制公钥到远程服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub root@heartsphere.cn

# 在配置文件中指定密钥路径
SSH_KEY="~/.ssh/id_rsa"
```

## 部署后操作

### 重新加载 Nginx（如果使用）

```bash
ssh root@heartsphere.cn "sudo systemctl reload nginx"
```

### 验证部署

```bash
ssh root@heartsphere.cn "ls -la /opt/heartsphere/frontend"
```

### 回滚到备份

如果部署后出现问题，可以回滚到备份：

```bash
# 查看备份目录
ssh root@heartsphere.cn "ls -d /opt/heartsphere/frontend.backup.*"

# 回滚到指定备份
ssh root@heartsphere.cn "
  mv /opt/heartsphere/frontend /opt/heartsphere/frontend.broken
  mv /opt/heartsphere/frontend.backup.20250104_120000 /opt/heartsphere/frontend
"
```

## 常见问题

### Q: 上传失败，提示权限被拒绝

A: 检查以下：
1. SSH密钥权限：`chmod 600 ~/.ssh/id_rsa`
2. 远程目录权限：确保用户有写入权限
3. SSH连接：测试 `ssh user@host`

### Q: 上传速度很慢

A: 
1. 使用 rsync 而不是 scp
2. 检查网络连接
3. 使用压缩选项（rsync 自动启用）

### Q: 如何跳过构建直接上传

A: 如果 dist 目录已存在，脚本会询问是否重新构建，选择 "N" 即可。

### Q: 如何清除远程目录后上传

A: 使用 scp 方式时，脚本会询问是否清空远程目录，选择 "y" 即可。

## 高级用法

### 一键部署（非交互模式）

修改脚本或在配置文件中设置所有参数，然后使用管道输入：

```bash
echo -e "heartsphere.cn\n22\nroot\n/opt/heartsphere/frontend\n\nn\ny\nn\nn\ny" | ./deploy-frontend-scp.sh
```

### 只上传特定文件

修改脚本中的上传命令，例如只上传特定目录：

```bash
# 只上传 assets 目录
rsync -avz --delete dist/assets/ user@host:/opt/heartsphere/frontend/assets/
```

## 注意事项

1. ⚠️ 确保远程目录有足够的磁盘空间
2. ⚠️ 备份功能会在远程创建备份目录，注意磁盘使用
3. ⚠️ 首次部署前确保远程目录已创建或用户有创建权限
4. ⚠️ 如果使用 Nginx，确保文件权限正确（通常需要可读）

## 相关脚本

- `deploy-frontend.sh` - 完整的部署脚本（包含构建和Nginx配置）
- `redeploy-frontend.sh` - 快速重新部署脚本

