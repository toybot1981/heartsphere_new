# HSMem 备份与恢复指南

## 📦 存储介质概述

### 当前实现：文件系统存储

HSMem 使用**文件系统**作为主要存储介质：

#### 存储结构
```
memory_data/
├── resources/           # 资源层（原始数据）
│   ├── conversation/   # 对话
│   ├── text/          # 文本
│   └── document/      # 文档
├── items/             # 记忆项层
│   ├── *.json        # 各个记忆项
│   └── index.json    # 全局索引
└── categories/        # 记忆分类层
    ├── *.json        # 分类数据
    ├── *.md         # Markdown 格式
    └── categories_index.json
```

#### 存储格式
- **JSON 文件**: 机器可读的数据格式
- **Markdown 文件**: LLM 可读的文本格式
- **索引文件**: 快速查询的索引

### 存储特点

✅ **优点**:
- 简单直接，无需额外数据库
- 人类可读，易于调试
- 便于迁移和备份
- 版本控制友好

⚠️ **限制**:
- 性能受文件系统限制
- 不支持复杂查询
- 并发访问需要加锁

## 💾 自动备份

### 快速开始

#### 1. 完整备份
```bash
python3 backup_memory.py backup
```

输出示例：
```
📦 开始备份: memory_data -> backups/memory_data_20260111_205447
✅ 完整备份成功
📊 备份大小: 0.01 MB
✅ 备份验证通过
```

#### 2. 增量备份
```bash
python3 backup_memory.py backup --incremental
```

增量备份使用 rsync，只复制变化的文件，速度更快。

#### 3. 列出备份
```bash
python3 backup_memory.py list
```

输出示例：
```
📋 备份列表:
--------------------------------------------------------------------------------

1. memory_data_20260111_205447
   类型: full
   大小: 0.01 MB
   时间: 2026-01-11T20:54:47

2. memory_data_20260111_180000
   类型: incremental
   大小: 0.02 MB
   时间: 2026-01-11T18:00:00
--------------------------------------------------------------------------------
```

### 高级用法

#### 自定义路径
```bash
python3 backup_memory.py backup \
  --source /path/to/memory_data \
  --backup-dir /path/to/backups
```

#### 设置保留天数
```bash
python3 backup_memory.py backup --keep-days 30
```

默认保留 7 天的备份。

#### 完整参数示例
```bash
python3 backup_memory.py backup \
  --source ./memory_data \
  --backup-dir ./my_backups \
  --keep-days 14 \
  --incremental
```

## 🔄 数据恢复

### 从备份恢复

#### 1. 恢复到原始位置
```bash
python3 backup_memory.py restore \
  --backup-path ./backups/memory_data_20260111_205447
```

恢复前会自动备份当前数据。

#### 2. 恢复到指定位置
```bash
python3 backup_memory.py restore \
  --backup-path ./backups/memory_data_20260111_205447 \
  --source ./restored_data
```

#### 3. 手动恢复
```bash
# 停止服务器
pkill -f simple_api_server

# 备份当前数据
mv memory_data memory_data_current_backup

# 恢复备份
cp -r backups/memory_data_20260111_205447 memory_data

# 重启服务器
python3 simple_api_server.py &
```

## 🗑️ 清理旧备份

### 自动清理
备份脚本会自动清理超过保留天数的备份。

### 手动清理
```bash
python3 backup_memory.py cleanup --keep-days 7
```

### 删除特定备份
```bash
# 删除单个备份
rm -rf backups/memory_data_20260111_205447

# 删除所有备份
rm -rf backups/*
```

## 📅 定时备份

### Linux/macOS 使用 crontab

#### 编辑 crontab
```bash
crontab -e
```

#### 添加定时任务
```bash
# 每天凌晨 2 点完整备份
0 2 * * * cd /path/to/hsmem && python3 backup_memory.py backup >> backup.log 2>&1

# 每 6 小时增量备份
0 */6 * * * cd /path/to/hsmem && python3 backup_memory.py backup --incremental >> backup.log 2>&1

# 每周清理一次
0 3 * * 0 cd /path/to/hsmem && python3 backup_memory.py cleanup --keep-days 7 >> cleanup.log 2>&1
```

#### 验证 crontab
```bash
# 查看当前的 crontab
crontab -l

# 查看 cron 日志
grep CRON /var/log/syslog
```

### systemd 定时器（Linux）

#### 创建服务文件
```bash
sudo nano /etc/systemd/system/hsmem-backup.service
```

内容：
```ini
[Unit]
Description=HSMem Memory Backup
After=network.target

[Service]
Type=oneshot
User=your_username
WorkingDirectory=/path/to/hsmem
ExecStart=/usr/bin/python3 backup_memory.py backup

[Install]
WantedBy=multi-user.target
```

#### 创建定时器
```bash
sudo nano /etc/systemd/system/hsmem-backup.timer
```

内容：
```ini
[Unit]
Description=HSMem Memory Backup Timer
Requires=hsmem-backup.service

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

#### 启用和启动
```bash
sudo systemctl daemon-reload
sudo systemctl enable hsmem-backup.timer
sudo systemctl start hsmem-backup.timer

# 查看状态
sudo systemctl status hsmem-backup.timer
```

## ☁️ 云端备份

### rsync 同步到远程服务器

```bash
rsync -avz --delete \
  backups/ \
  user@remote-server:/backup/hsmem/
```

### 同步到云存储

#### Google Drive
```bash
# 安装 rclone
curl https://rclone.org/install.sh | sudo bash

# 配置
rclone config

# 同步
rclone sync backups/ remote:hsmem_backup/
```

#### AWS S3
```bash
# 安装 AWS CLI
pip install awscli

# 配置
aws configure

# 同步
aws s3 sync backups/ s3://my-bucket/hsmem-backups/
```

### Dropbox
```bash
# 安装 rclone
rclone sync backups/ dropbox:hsmem_backup/
```

## 📊 备份策略

### 推荐策略

#### 1. 每日备份
- 完整备份：每天凌晨 2 点
- 保留：7 天

#### 2. 每周备份
- 完整备份：每周日凌晨 3 点
- 保留：4 周

#### 3. 每月备份
- 完整备份：每月 1 号凌晨 4 点
- 保留：12 个月

#### 4. 异地备份
- 每天同步到远程服务器
- 每周上传到云存储

### 备份策略示例

```bash
# crontab 配置
# 每日完整备份（保留 7 天）
0 2 * * * python3 backup_memory.py backup --keep-days 7

# 每周完整备份（保留 4 周）
0 3 * * 0 python3 backup_memory.py backup --backup-dir ./weekly_backups --keep-days 28

# 每月完整备份（保留 12 个月）
0 4 1 * * python3 backup_memory.py backup --backup-dir ./monthly_backups --keep-days 365

# 每小时增量备份
0 * * * * python3 backup_memory.py backup --incremental --backup-dir ./hourly_backups --keep-days 1

# 每天同步到远程
0 5 * * * rsync -avz --delete backups/ user@remote:/backup/hsmem/
```

## 🔍 备份验证

### 自动验证
备份脚本会自动验证：
- ✅ 目录结构完整
- ✅ 索引文件存在
- ✅ JSON 格式正确

### 手动验证
```python
#!/usr/bin/env python3
"""手动验证备份"""

from pathlib import Path
import json

def verify_backup(backup_path: str):
    path = Path(backup_path)

    print(f"🔍 验证备份: {backup_path}\n")

    # 检查目录结构
    print("📁 检查目录结构...")
    required_dirs = ['resources', 'items', 'categories']
    for dir_name in required_dirs:
        dir_path = path / dir_name
        if dir_path.exists():
            print(f"  ✅ {dir_name}/")
        else:
            print(f"  ❌ {dir_name}/ (缺失)")

    # 检查索引文件
    print("\n📋 检查索引文件...")
    index_files = [
        'items/index.json',
        'categories/categories_index.json'
    ]

    for index_file in index_files:
        file_path = path / index_file
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    json.load(f)
                print(f"  ✅ {index_file}")
            except:
                print(f"  ❌ {index_file} (格式错误)")
        else:
            print(f"  ❌ {index_file} (缺失)")

    # 统计文件
    print("\n📊 文件统计:")
    resource_count = len(list(path.glob("resources/**/*.json")))
    item_count = len(list(path.glob("items/*.json")))
    category_count = len(list(path.glob("categories/*.json")))

    print(f"  资源文件: {resource_count}")
    print(f"  记忆项文件: {item_count}")
    print(f"  分类文件: {category_count}")

    print("\n✅ 验证完成")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        verify_backup(sys.argv[1])
    else:
        print("Usage: python3 verify_backup.py <backup_path>")
```

## 🚨 灾难恢复

### 完全恢复流程

#### 1. 停止服务
```bash
pkill -f simple_api_server
```

#### 2. 备份当前数据（如果可能）
```bash
mv memory_data memory_data_damaged_$(date +%Y%m%d)
```

#### 3. 恢复最新备份
```bash
python3 backup_memory.py restore \
  --backup-path ./backups/memory_data_latest
```

#### 4. 验证数据
```bash
python3 backup_memory.py list
```

#### 5. 重启服务
```bash
python3 simple_api_server.py &
```

#### 6. 测试功能
```bash
curl http://localhost:8000/health
```

## 📈 监控和告警

### 备份监控脚本

```bash
#!/bin/bash
# 监控备份状态

BACKUP_DIR="./backups"
MAX_AGE_HOURS=24

# 检查最新备份
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/memory_data_* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ 警告: 没有找到备份"
    exit 1
fi

# 检查备份时间
BACKUP_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$LATEST_BACKUP")
CURRENT_TIME=$(date +%s)
BACKUP_SECONDS=$(stat -f "%m" "$LATEST_BACKUP")
AGE_HOURS=$(( (CURRENT_TIME - BACKUP_SECONDS) / 3600 ))

if [ $AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo "⚠️  警告: 最新备份已过期 ${AGE_HOURS} 小时"
    exit 1
else
    echo "✅ 备份正常: ${LATEST_BACKUP} (${AGE_HOURS} 小时前)"
    exit 0
fi
```

## 💡 最佳实践

### 1. 3-2-1 备份规则
- **3** 份副本（1 个原始 + 2 个备份）
- **2** 种不同介质（本地磁盘 + 云存储）
- **1** 份异地备份（远程服务器）

### 2. 定期测试恢复
- 每月测试一次恢复流程
- 验证备份数据完整性
- 记录恢复时间

### 3. 加密敏感数据
```bash
# 使用 GPG 加密备份
gpg --symmetric --cipher-algo AES256 backup.tar.gz

# 解密
gpg --decrypt backup.tar.gz.gpg > backup.tar.gz
```

### 4. 文档化
- 记录备份策略
- 记录恢复流程
- 记录问题处理

## 🎯 快速参考

### 常用命令
```bash
# 完整备份
python3 backup_memory.py backup

# 增量备份
python3 backup_memory.py backup --incremental

# 列出备份
python3 backup_memory.py list

# 恢复备份
python3 backup_memory.py restore --backup-path ./backups/memory_data_xxx

# 清理旧备份
python3 backup_memory.py cleanup --keep-days 7
```

### 检查点
- ✅ 备份成功
- ✅ 验证通过
- ✅ 存储空间充足
- ✅ 恢复测试通过

---

**HSMem 备份系统** - 可靠、自动、安全 ❤️
