#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证物品和事件的时代匹配状态
"""

import mysql.connector
from mysql.connector import Error
from collections import defaultdict

# 数据库连接配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'heartsphere',
    'charset': 'utf8mb4'
}

def connect_database():
    """连接数据库"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"数据库连接错误: {e}")
        return None

def main():
    conn = connect_database()
    if not conn:
        return

    cursor = conn.cursor(dictionary=True)

    # 查询所有时代
    cursor.execute("SELECT id, name FROM system_eras ORDER BY id")
    eras = {era['id']: era['name'] for era in cursor.fetchall()}

    # 统计每个时代的物品数量
    cursor.execute("""
        SELECT system_era_id, COUNT(*) as count
        FROM system_era_items
        GROUP BY system_era_id
        ORDER BY system_era_id
    """)
    item_counts = defaultdict(int)
    for row in cursor.fetchall():
        item_counts[row['system_era_id']] = row['count']

    # 统计每个时代的事件数量
    cursor.execute("""
        SELECT system_era_id, COUNT(*) as count
        FROM system_era_events
        GROUP BY system_era_id
        ORDER BY system_era_id
    """)
    event_counts = defaultdict(int)
    for row in cursor.fetchall():
        event_counts[row['system_era_id']] = row['count']

    # 统计未匹配的物品和事件
    cursor.execute("SELECT COUNT(*) as count FROM system_era_items WHERE system_era_id IS NULL")
    unmatched_items = cursor.fetchone()['count']

    cursor.execute("SELECT COUNT(*) as count FROM system_era_events WHERE system_era_id IS NULL")
    unmatched_events = cursor.fetchone()['count']

    cursor.close()
    conn.close()

    # 打印报告
    print("\n" + "="*80)
    print("时代匹配状态报告")
    print("="*80)

    print(f"\n{'时代ID':<8} {'时代名称':<20} {'物品数量':<10} {'事件数量':<10}")
    print("-" * 80)

    for era_id in sorted(eras.keys()):
        era_name = eras[era_id]
        items = item_counts.get(era_id, 0)
        events = event_counts.get(era_id, 0)
        print(f"{era_id:<8} {era_name:<20} {items:<10} {events:<10}")

    print("-" * 80)
    print(f"{'未匹配':<8} {'NULL':<20} {unmatched_items:<10} {unmatched_events:<10}")
    print("="*80)

    # 显示未匹配的物品
    if unmatched_items > 0 or unmatched_events > 0:
        print(f"\n⚠️  警告：有 {unmatched_items} 个物品和 {unmatched_events} 个事件未匹配到任何时代")

        if unmatched_items > 0:
            conn = connect_database()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, item_id, name, description
                FROM system_era_items
                WHERE system_era_id IS NULL
                LIMIT 10
            """)
            print("\n未匹配的物品（前10条）:")
            for item in cursor.fetchall():
                print(f"  - [{item['item_id']}] {item['name']}: {item['description'] or '无描述'}")
            cursor.close()
            conn.close()

        if unmatched_events > 0:
            conn = connect_database()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, event_id, name, description
                FROM system_era_events
                WHERE system_era_id IS NULL
                LIMIT 10
            """)
            print("\n未匹配的事件（前10条）:")
            for event in cursor.fetchall():
                print(f"  - [{event['event_id']}] {event['name']}: {event['description'] or '无描述'}")
            cursor.close()
            conn.close()
    else:
        print("\n✅ 所有物品和事件都已成功匹配到时代！")

if __name__ == "__main__":
    main()
