# HSMem 存储架构与可靠性保障

## 📦 存储介质

### 1. 文件系统存储（当前实现）

#### 存储位置
```
hsmem/
└── memory_data/              # 数据根目录
    ├── resources/           # 资源层 - 原始数据
    │   ├── conversation/   # 对话资源
    │   ├── text/          # 文本资源
    │   └── document/      # 文档资源
    ├── items/             # 记忆项层 - 提取的记忆
    │   ├── {item_id}.json # 各个记忆项
    │   └── index.json     # 全局索引
    └── categories/        # 记忆分类层 - 聚合记忆
        ├── {cat_id}.json  # 分类数据
        ├── {cat_id}.md   # Markdown 格式（LLM 可读）
        └── categories_index.json  # 分类索引
```

#### 文件格式

**1. 资源文件** (`resources/conversation/{resource_id}.json`)
```json
{
  "id": "fb2382e6-4ada-4b38-a319-e77a2144c074",
  "modality": "conversation",
  "data": {
    "messages": [
      {"role": "user", "content": "你好"},
      {"role": "assistant", "content": "你好！"}
    ]
  },
  "created_at": "2026-01-11T12:00:00",
  "metadata": {"size": 1024}
}
```

**2. 记忆项文件** (`items/{item_id}.json`)
```json
{
  "id": "2c05671e-9915-4fa2-ab57-326d353eae4f",
  "resource_id": "fb2382e6-4ada-4b38-a319-e77a2144c074",
  "content": "完整内容",
  "summary": "摘要",
  "memory_type": "preference",
  "importance": 0.7,
  "categories": ["preferences", "user_profile"],
  "created_at": "2026-01-11T12:00:00"
}
```

**3. 分类文件** (`categories/{cat_id}.json` + `.md`)
```json
{
  "id": "464ac0bb-aaa9-465e-a0eb-b9106c467e83",
  "name": "preferences",
  "summary": "关于偏好的记忆",
  "item_ids": ["item_id_1", "item_id_2"],
  "created_at": "2026-01-11T12:00:00",
  "version": 1
}
```

**4. Markdown 文件** (`categories/{cat_id}.md`)
```markdown
# preferences

## 概述
关于偏好的记忆

## 描述
包含 5 个记忆项

## 创建时间
2026-01-11T12:00:00
```

### 2. 存储特点

#### 优点
- ✅ **简单直接**: 无需额外数据库
- ✅ **可读性强**: JSON/Markdown 人类可读
- ✅ **易于调试**: 直接查看文件内容
- ✅ **便于迁移**: 复制目录即可
- ✅ **版本控制友好**: 文件格式清晰

#### 特性
- 📝 **双格式存储**: JSON（机器）+ Markdown（LLM）
- 🔗 **完整追溯**: 从记忆项追溯到原始资源
- 📊 **索引优化**: 快速查找和统计
- 🔄 **增量更新**: 支持追加和修改

## 🛡️ 可靠性保障

### 1. 数据完整性

#### UUID 唯一标识
```python
# 每个数据对象都有唯一 ID
resource_id = str(uuid.uuid4())  # 资源 ID
item_id = str(uuid.uuid4())     # 记忆项 ID
category_id = str(uuid.uuid4())  # 分类 ID
```

#### 数据链路追溯
```python
# 完整的数据链路
资源 → 记忆项 → 分类
```

每层都保存父级引用：
```json
{
  "item": {
    "resource_id": "parent_resource_id"  // 指向原始资源
  },
  "category": {
    "item_ids": ["item_id_1", "item_id_2"]  // 指向记忆项
  }
}
```

#### 版本控制
```json
{
  "category": {
    "version": 1,
    "updated_at": "2026-01-11T12:00:00",
    "created_at": "2026-01-11T10:00:00"
  }
}
```

### 2. 索引机制

#### 全局索引
```json
// items/index.json
{
  "items": {
    "item_id_1": {
      "resource_id": "resource_id",
      "memory_type": "preference",
      "created_at": "2026-01-11T12:00:00"
    }
  },
  "count": 100,
  "last_updated": "2026-01-11T12:00:00"
}
```

#### 分类索引
```json
// categories/categories_index.json
{
  "categories": {
    "cat_id_1": {
      "name": "preferences",
      "item_count": 10,
      "created_at": "2026-01-11T12:00:00"
    }
  }
}
```

### 3. 错误处理

#### 异常捕获
```python
async def store_resource(self, resource_data: Dict, modality: str):
    try:
        # 存储逻辑
        resource_id = str(uuid.uuid4())
        file_path = self.base_path / modality / f"{resource_id}.json"

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(resource, f, ensure_ascii=False)

        return resource_id
    except IOError as e:
        # IO 错误处理
        logger.error(f"Failed to save resource: {e}")
        raise
    except Exception as e:
        # 其他错误
        logger.error(f"Unexpected error: {e}")
        raise
```

#### 数据验证
```python
def validate_resource(resource_data: Dict) -> bool:
    """验证资源数据格式"""
    required_fields = ['messages', 'modality']
    for field in required_fields:
        if field not in resource_data:
            raise ValueError(f"Missing required field: {field}")
    return True
```

## 💾 备份策略

### 1. 手动备份

#### 完整备份
```bash
# 备份整个数据目录
cp -r memory_data memory_data_backup_$(date +%Y%m%d)

# 或使用 tar 打包
tar -czf memory_data_backup_$(date +%Y%m%d).tar.gz memory_data/
```

#### 增量备份
```bash
# 只备份新增的文件
rsync -av --delete memory_data/ backup/memory_data_$(date +%Y%m%d)/
```

### 2. 自动备份脚本

创建 `backup_memory.py`:

```python
#!/usr/bin/env python3
"""
HSMem 自动备份脚本
"""

import shutil
import os
from datetime import datetime
from pathlib import Path

def backup_memory_data(source_dir: str, backup_dir: str):
    """备份记忆数据"""

    source = Path(source_dir)
    backup_base = Path(backup_dir)

    # 创建备份目录
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_base / f"memory_data_{timestamp}"

    print(f"📦 开始备份: {source} -> {backup_path}")

    try:
        # 复制整个目录
        shutil.copytree(source, backup_path)

        print(f"✅ 备份成功: {backup_path}")

        # 计算大小
        size = sum(f.stat().st_size for f in backup_path.rglob('*') if f.is_file())
        size_mb = size / (1024 * 1024)

        print(f"📊 备份大小: {size_mb:.2f} MB")

        # 清理旧备份（保留最近 7 天）
        cleanup_old_backups(backup_base, keep_days=7)

        return True

    except Exception as e:
        print(f"❌ 备份失败: {e}")
        return False

def cleanup_old_backups(backup_dir: Path, keep_days: int = 7):
    """清理旧备份"""

    print(f"\n🧹 清理 {keep_days} 天前的备份...")

    now = datetime.now()
    count = 0

    for backup in backup_dir.glob("memory_data_*"):
        try:
            # 从目录名提取时间戳
            timestamp_str = backup.name.split("_")[2:]
            backup_time = datetime.strptime("_".join(timestamp_str), "%Y%m%d_%H%M%S")

            # 计算天数差
            days_old = (now - backup_time).days

            if days_old > keep_days:
                shutil.rmtree(backup)
                count += 1
                print(f"   删除: {backup.name}")

        except Exception as e:
            print(f"   跳过 {backup.name}: {e}")

    print(f"✅ 清理完成，删除了 {count} 个旧备份")

if __name__ == "__main__":
    import sys

    # 默认路径
    source_dir = "./memory_data"
    backup_dir = "./backups"

    # 可以从命令行参数指定
    if len(sys.argv) > 1:
        source_dir = sys.argv[1]
    if len(sys.argv) > 2:
        backup_dir = sys.argv[2]

    # 执行备份
    success = backup_memory_data(source_dir, backup_dir)

    sys.exit(0 if success else 1)
```

#### 使用方法
```bash
# 默认备份
python3 backup_memory.py

# 指定路径
python3 backup_memory.py ./memory_data ./backups
```

### 3. 定时备份

#### Linux/macOS 使用 cron
```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点自动备份
0 2 * * * cd /path/to/hsmem && python3 backup_memory.py >> backup.log 2>&1
```

#### 使用 systemd（Linux）
```ini
# /etc/systemd/system/hsmem-backup.service
[Unit]
Description=HSMem Memory Backup
After=network.target

[Service]
Type=oneshot
User=your_user
WorkingDirectory=/path/to/hsmem
ExecStart=/usr/bin/python3 backup_memory.py

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/hsmem-backup.timer
[Unit]
Description=HSMem Memory Backup Timer
Requires=hsmem-backup.service

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# 启用定时器
sudo systemctl enable hsmem-backup.timer
sudo systemctl start hsmem-backup.timer
```

### 4. 云端备份

#### 同步到云存储
```bash
# 使用 rclone 同步到 Google Drive
rclone sync memory_data/ remote:hsmem_backup/memory_data/

# 同步到 Dropbox
rclone sync memory_data/ dropbox:hsmem_backup/

# 同步到 AWS S3
aws s3 sync memory_data/ s3://my-bucket/hsmem_backup/
```

#### 使用 rsync 同步到远程服务器
```bash
rsync -avz --delete \
  memory_data/ \
  user@remote-server:/backup/hsmem/memory_data/
```

## 🔍 数据恢复

### 1. 从备份恢复
```bash
# 恢复整个数据目录
rm -rf memory_data/
cp -r backup/memory_data_20260111/ memory_data/

# 或者只恢复特定层
cp -r backup/memory_data_20260111/items/ memory_data/items/
```

### 2. 部分恢复
```python
#!/usr/bin/env python3
"""
从备份恢复特定数据
"""

import json
import shutil
from pathlib import Path

def restore_category(backup_path: str, category_name: str):
    """恢复特定分类"""

    backup = Path(backup_path)
    categories_file = backup / "categories" / "categories_index.json"

    with open(categories_file, 'r') as f:
        index = json.load(f)

    # 找到目标分类
    target_cat_id = None
    for cat_id, cat_data in index['categories'].items():
        if cat_data['name'] == category_name:
            target_cat_id = cat_id
            break

    if target_cat_id:
        # 复制分类文件
        src_json = backup / "categories" / f"{target_cat_id}.json"
        src_md = backup / "categories" / f"{target_cat_id}.md"

        dst_json = Path("memory_data/categories") / f"{target_cat_id}.json"
        dst_md = Path("memory_data/categories") / f"{target_cat_id}.md"

        shutil.copy(src_json, dst_json)
        shutil.copy(src_md, dst_md)

        print(f"✅ 恢复分类: {category_name}")
    else:
        print(f"❌ 未找到分类: {category_name}")
```

## 📊 监控和维护

### 1. 数据完整性检查
```python
#!/usr/bin/env python3
"""
数据完整性检查
"""

import json
from pathlib import Path
from hscore import MemoryService

def check_integrity(base_path: str = "./memory_data"):
    """检查数据完整性"""

    service = MemoryService(base_path=base_path)
    issues = []

    # 1. 检查资源
    resources_dir = Path(base_path) / "resources"
    for modality_dir in resources_dir.iterdir():
        for resource_file in modality_dir.glob("*.json"):
            with open(resource_file, 'r') as f:
                resource = json.load(f)

            # 验证必需字段
            if 'id' not in resource:
                issues.append(f"资源缺少 ID: {resource_file}")

    # 2. 检查记忆项
    items_dir = Path(base_path) / "items"
    index_file = items_dir / "index.json"

    if index_file.exists():
        with open(index_file, 'r') as f:
            index = json.load(f)

        # 验证索引中的文件是否存在
        for item_id in index['items'].keys():
            item_file = items_dir / f"{item_id}.json"
            if not item_file.exists():
                issues.append(f"索引中的文件不存在: {item_id}")

    # 3. 检查分类
    categories_dir = Path(base_path) / "categories"
    cat_index_file = categories_dir / "categories_index.json"

    if cat_index_file.exists():
        with open(cat_index_file, 'r') as f:
            cat_index = json.load(f)

        # 验证分类中的记忆项是否存在
        for cat_id, cat_data in cat_index['categories'].items():
            cat_file = categories_dir / f"{cat_id}.json"
            if not cat_file.exists():
                issues.append(f"分类文件不存在: {cat_id}")

    if issues:
        print(f"❌ 发现 {len(issues)} 个问题:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("✅ 数据完整性检查通过")

    return len(issues) == 0
```

### 2. 存储空间监控
```python
def check_storage_usage(base_path: str = "./memory_data"):
    """检查存储使用情况"""

    path = Path(base_path)

    # 计算总大小
    total_size = sum(
        f.stat().st_size
        for f in path.rglob('*')
        if f.is_file()
    )

    # 统计文件数量
    file_count = len(list(path.rglob('*')))

    # 按类型统计
    resource_files = len(list(path.glob("resources/**/*.json")))
    item_files = len(list(path.glob("items/*.json")))
    category_files = len(list(path.glob("categories/*.json")))

    print(f"📊 存储使用情况:")
    print(f"  总大小: {total_size / (1024*1024):.2f} MB")
    print(f"  总文件数: {file_count}")
    print(f"  资源文件: {resource_files}")
    print(f"  记忆项文件: {item_files}")
    print(f"  分类文件: {category_files}")
```

## 🔐 数据安全

### 1. 访问控制
```python
# 设置文件权限（Unix）
import os
import stat

def set_secure_permissions(path: Path):
    """设置安全的文件权限"""

    # 目录权限：755 (rwxr-xr-x)
    path.chmod(0o755)

    # 文件权限：644 (rw-r--r--)
    for file in path.rglob("*"):
        if file.is_file():
            file.chmod(0o644)
```

### 2. 敏感数据处理
```python
import json

def save_with_redaction(data: dict, file_path: Path, sensitive_keys: list = None):
    """保存数据时脱敏敏感字段"""

    if sensitive_keys is None:
        sensitive_keys = ['password', 'token', 'api_key', 'secret']

    # 创建数据副本
    data_copy = data.copy()

    # 脱敏处理
    for key in sensitive_keys:
        if key in data_copy:
            data_copy[key] = "***REDACTED***"

    with open(file_path, 'w') as f:
        json.dump(data_copy, f)
```

## 📈 性能优化

### 1. 批量写入
```python
async def batch_store_items(items: list):
    """批量存储记忆项"""

    # 先写入临时文件
    temp_files = []
    for item in items:
        temp_file = tmp_path / f"{item['id']}.tmp"
        with open(temp_file, 'w') as f:
            json.dump(item, f)
        temp_files.append(temp_file)

    # 然后原子性地移动到目标位置
    for temp_file in temp_files:
        target_file = items_dir / f"{temp_file.stem}.json"
        shutil.move(temp_file, target_file)
```

### 2. 延迟写入
```python
class BufferedMemoryStore:
    """带缓冲的内存存储"""

    def __init__(self, buffer_size: int = 100):
        self.buffer = []
        self.buffer_size = buffer_size

    async def store(self, item: dict):
        """缓冲写入"""

        self.buffer.append(item)

        if len(self.buffer) >= self.buffer_size:
            await self.flush()

    async def flush(self):
        """刷新缓冲区到磁盘"""

        # 批量写入
        for item in self.buffer:
            # 写入逻辑
            pass

        self.buffer.clear()
```

## 🎯 最佳实践

### 1. 定期备份
- 每天自动备份
- 保留 7-30 天的备份
- 异地存储

### 2. 监控告警
- 监控存储空间
- 检查数据完整性
- 设置告警阈值

### 3. 文档记录
- 记录备份时间
- 记录恢复演练
- 记录问题处理

### 4. 测试恢复
- 定期测试备份恢复
- 验证数据完整性
- 更新恢复流程

## 📊 存储对比

| 特性 | 文件系统 | 数据库 | 对象存储 |
|------|---------|--------|----------|
| 复杂度 | ⭐ 简单 | ⭐⭐⭐ 复杂 | ⭐⭐ 中等 |
| 性能 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 高 | ⭐⭐⭐⭐ 高 |
| 可扩展性 | ⭐⭐ 受限 | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 很好 |
| 成本 | ⭐ 低 | ⭐⭐⭐ 中 | ⭐⭐ 中低 |
| 可读性 | ⭐⭐⭐⭐⭐ 很好 | ⭐⭐ 差 | ⭐⭐ 差 |
| 备份 | ⭐⭐⭐⭐ 简单 | ⭐⭐⭐ 需要 | ⭐⭐⭐⭐⭐ 很好 |

## 🚀 未来扩展

### 1. 数据库支持
- PostgreSQL 持久化
- MongoDB 文档存储
- Redis 缓存层

### 2. 分布式存储
- 分片策略
- 副本机制
- 一致性保障

### 3. 云原生
- Kubernetes 集成
- 对象存储集成
- 多云部署

---

**HSMem 存储架构** - 可靠、高效、可扩展 ❤️
