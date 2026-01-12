#!/usr/bin/env python3
"""
HSMem 自动备份脚本

自动备份记忆数据，支持定期清理旧备份
"""

import shutil
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import argparse
import logging


# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MemoryBackup:
    """记忆数据备份管理器"""

    def __init__(self, source_dir: str, backup_dir: str, keep_days: int = 7):
        self.source_dir = Path(source_dir)
        self.backup_dir = Path(backup_dir)
        self.keep_days = keep_days

        # 创建备份目录
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def backup(self, full: bool = True) -> bool:
        """
        执行备份

        Args:
            full: 是否完整备份（False 则为增量备份）

        Returns:
            备份是否成功
        """
        if not self.source_dir.exists():
            logger.error(f"源目录不存在: {self.source_dir}")
            return False

        # 创建备份目录
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"memory_data_{timestamp}"
        backup_path = self.backup_dir / backup_name

        logger.info(f"📦 开始备份: {self.source_dir} -> {backup_path}")

        try:
            if full:
                # 完整备份
                shutil.copytree(self.source_dir, backup_path)
                logger.info("✅ 完整备份成功")
            else:
                # 增量备份（使用 rsync）
                import subprocess
                result = subprocess.run([
                    'rsync', '-av', '--delete',
                    str(self.source_dir / ''),
                    str(backup_path / '')
                ], capture_output=True, text=True)

                if result.returncode != 0:
                    logger.error(f"增量备份失败: {result.stderr}")
                    return False

                logger.info("✅ 增量备份成功")

            # 计算备份大小
            size = self._calculate_size(backup_path)
            size_mb = size / (1024 * 1024)

            logger.info(f"📊 备份大小: {size_mb:.2f} MB")

            # 创建备份信息文件
            self._create_backup_info(backup_path, size, full)

            # 清理旧备份
            self.cleanup_old_backups()

            # 验证备份
            if self.verify_backup(backup_path):
                logger.info(f"✅ 备份验证通过")
            else:
                logger.warning(f"⚠️  备份验证失败，但文件已创建")

            return True

        except Exception as e:
            logger.error(f"❌ 备份失败: {e}")
            # 删除不完整的备份
            if backup_path.exists():
                shutil.rmtree(backup_path)
            return False

    def _calculate_size(self, path: Path) -> int:
        """计算目录大小"""
        return sum(
            f.stat().st_size
            for f in path.rglob('*')
            if f.is_file()
        )

    def _create_backup_info(self, backup_path: Path, size: int, full: bool):
        """创建备份信息文件"""
        info = {
            "timestamp": datetime.now().isoformat(),
            "size_bytes": size,
            "size_mb": size / (1024 * 1024),
            "type": "full" if full else "incremental",
            "source": str(self.source_dir),
            "backup_path": str(backup_path)
        }

        info_file = backup_path / "backup_info.json"
        with open(info_file, 'w', encoding='utf-8') as f:
            import json
            json.dump(info, f, indent=2, ensure_ascii=False)

    def verify_backup(self, backup_path: Path) -> bool:
        """
        验证备份完整性

        Args:
            backup_path: 备份目录路径

        Returns:
            验证是否通过
        """
        try:
            # 检查必需的子目录
            required_dirs = ['resources', 'items', 'categories']
            for dir_name in required_dirs:
                if not (backup_path / dir_name).exists():
                    logger.warning(f"缺少目录: {dir_name}")
                    return False

            # 检查索引文件
            index_files = [
                backup_path / 'items' / 'index.json',
                backup_path / 'categories' / 'categories_index.json'
            ]

            for index_file in index_files:
                if not index_file.exists():
                    logger.warning(f"缺少索引文件: {index_file}")
                    return False

                # 验证 JSON 格式
                import json
                with open(index_file, 'r') as f:
                    json.load(f)

            return True

        except Exception as e:
            logger.error(f"验证失败: {e}")
            return False

    def cleanup_old_backups(self) -> int:
        """
        清理旧备份

        Returns:
            删除的备份数量
        """
        logger.info(f"\n🧹 清理 {self.keep_days} 天前的备份...")

        now = datetime.now()
        count = 0

        for backup in sorted(self.backup_dir.glob("memory_data_*")):
            try:
                # 从备份信息读取时间
                info_file = backup / "backup_info.json"

                if info_file.exists():
                    import json
                    with open(info_file, 'r') as f:
                        info = json.load(f)
                    backup_time = datetime.fromisoformat(info['timestamp'])
                else:
                    # 从目录名解析时间
                    timestamp_str = backup.name.split("_")[2:]
                    backup_time = datetime.strptime("_".join(timestamp_str), "%Y%m%d_%H%M%S")

                # 计算天数差
                days_old = (now - backup_time).days

                if days_old > self.keep_days:
                    shutil.rmtree(backup)
                    count += 1
                    logger.info(f"   删除: {backup.name} ({days_old} 天前)")

            except Exception as e:
                logger.warning(f"   跳过 {backup.name}: {e}")

        logger.info(f"✅ 清理完成，删除了 {count} 个旧备份")
        return count

    def list_backups(self) -> list:
        """
        列出所有备份

        Returns:
            备份信息列表
        """
        backups = []

        for backup_path in sorted(self.backup_dir.glob("memory_data_*"), reverse=True):
            try:
                info_file = backup_path / "backup_info.json"

                if info_file.exists():
                    import json
                    with open(info_file, 'r') as f:
                        info = json.load(f)
                    backups.append(info)
                else:
                    # 旧版本备份，没有 info 文件
                    size = self._calculate_size(backup_path)
                    backups.append({
                        "backup_path": str(backup_path),
                        "size_mb": size / (1024 * 1024),
                        "type": "unknown"
                    })

            except Exception as e:
                logger.warning(f"无法读取备份信息: {backup_path.name}")

        return backups

    def restore(self, backup_path: str, target_path: str = None) -> bool:
        """
        从备份恢复

        Args:
            backup_path: 备份目录路径
            target_path: 目标目录（默认为源目录）

        Returns:
            恢复是否成功
        """
        backup = Path(backup_path)

        if not backup.exists():
            logger.error(f"备份不存在: {backup_path}")
            return False

        target = Path(target_path) if target_path else self.source_dir

        logger.info(f"🔄 恢复备份: {backup} -> {target}")

        try:
            # 备份当前数据（如果存在）
            if target.exists():
                temp_backup = target.parent / f"{target.name}_restore_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                shutil.move(str(target), str(temp_backup))
                logger.info(f"✅ 当前数据已备份到: {temp_backup}")

            # 恢复数据
            shutil.copytree(backup, target)

            logger.info("✅ 恢复成功")

            # 验证恢复的数据
            if self.verify_backup(target):
                logger.info("✅ 恢复验证通过")
                return True
            else:
                logger.warning("⚠️  恢复验证失败")
                return False

        except Exception as e:
            logger.error(f"❌ 恢复失败: {e}")

            # 尝试恢复备份
            if 'temp_backup' in locals() and temp_backup.exists():
                shutil.move(str(temp_backup), str(target))
                logger.info("✅ 已回滚到恢复前的状态")

            return False


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='HSMem 记忆数据备份工具')

    parser.add_argument(
        'action',
        choices=['backup', 'restore', 'list', 'cleanup'],
        help='操作类型'
    )

    parser.add_argument(
        '--source',
        default='./memory_data',
        help='源数据目录（默认: ./memory_data）'
    )

    parser.add_argument(
        '--backup-dir',
        default='./backups',
        help='备份目录（默认: ./backups）'
    )

    parser.add_argument(
        '--keep-days',
        type=int,
        default=7,
        help='保留备份天数（默认: 7）'
    )

    parser.add_argument(
        '--incremental',
        action='store_true',
        help='增量备份（默认为完整备份）'
    )

    parser.add_argument(
        '--backup-path',
        help='要恢复的备份路径（用于 restore 操作）'
    )

    args = parser.parse_args()

    # 创建备份管理器
    backup_manager = MemoryBackup(
        args.source,
        args.backup_dir,
        args.keep_days
    )

    # 执行操作
    if args.action == 'backup':
        success = backup_manager.backup(full=not args.incremental)
        sys.exit(0 if success else 1)

    elif args.action == 'restore':
        if not args.backup_path:
            logger.error("请指定 --backup-path 参数")
            sys.exit(1)

        success = backup_manager.restore(args.backup_path)
        sys.exit(0 if success else 1)

    elif args.action == 'list':
        backups = backup_manager.list_backups()

        print("\n📋 备份列表:")
        print("-" * 80)

        if backups:
            for i, backup in enumerate(backups, 1):
                print(f"\n{i}. {Path(backup['backup_path']).name}")
                print(f"   类型: {backup.get('type', 'unknown')}")
                print(f"   大小: {backup.get('size_mb', 0):.2f} MB")
                if 'timestamp' in backup:
                    print(f"   时间: {backup['timestamp']}")
        else:
            print("   没有找到备份")

        print("-" * 80)
        sys.exit(0)

    elif args.action == 'cleanup':
        count = backup_manager.cleanup_old_backups()
        sys.exit(0)


if __name__ == "__main__":
    main()
