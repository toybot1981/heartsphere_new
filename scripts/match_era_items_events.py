#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
匹配物品、事件到时代的脚本
通过关键词分析将物品和事件匹配到正确的system_era_id
"""

import mysql.connector
from mysql.connector import Error
import re
from typing import Dict, List, Tuple

# 数据库连接配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'heartsphere',
    'charset': 'utf8mb4'
}

# 时代关键词映射表
ERA_KEYWORDS = {
    23: {  # 我的大学
        'keywords': ['大学', '学生证', '课本', '图书馆', '社团', '奖学金', '实验', '毕业设计', '校园卡', '课堂笔记', '宿舍', '食堂', '选修课'],
        'name': '我的大学'
    },
    24: {  # 我的中学
        'keywords': ['中学', '校服', '作业本', '试卷', '学生证', '奖状', '同学录', '运动鞋', '书包', '高中', '初中', '中学'],
        'name': '我的中学'
    },
    25: {  # 我的工作
        'keywords': ['工牌', '工作', '公司', '办公室', '笔记本电脑', '名片', '项目', '会议', '咖啡', '年终奖', '员工', '职场'],
        'name': '我的工作'
    },
    26: {  # 我的童年
        'keywords': ['童年', '玩具', '糖果', '小红花', '彩色笔', '零食', '照片', '小伙伴', '上学第一天', '老师'],
        'name': '我的童年'
    },
    27: {  # 我的故乡
        'keywords': ['故乡', '家乡', '特产', '老照片', '门钥匙', '纪念品', '地图', '旧物', '信件', '味道', '乡亲', '故地'],
        'name': '我的故乡'
    },
    28: {  # 三国时代
        'keywords': ['三国', '关羽', '青龙', '偃月刀', '张飞', '丈八', '蛇矛', '赤兔马', '诸葛亮', '羽扇', '兵符', '玉玺', '箭矢', '刘备', '曹操', '孙权', '赤壁', '桃园', '结义', '茅庐', '借箭', '空城', '麦城'],
        'name': '三国时代'
    },
    29: {  # 秦王朝
        'keywords': ['秦', '秦朝', '秦始皇', '兵马俑', '长城', '统一', '六国', '青铜剑', '竹简', '驽机', '传国玉玺', '焚书'],
        'name': '秦王朝'
    },
    30: {  # 唐朝盛世
        'keywords': ['唐', '唐朝', '诗', '丝绸', '陶瓷', '茶', '扇子', '长安', '科举', '夜市', '丝绸之路', '西游'],
        'name': '唐朝盛世'
    },
    31: {  # 宋朝文雅
        'keywords': ['宋', '宋朝', '词', '茶具', '画', '瓷器', '书院', '花朝节', '欣赏艺术', '靖康', '江南'],
        'name': '宋朝文雅'
    },
    32: {  # 明朝江湖
        'keywords': ['明', '明朝', '江湖', '武侠', '秘籍', '暗器', '解药', '银两', '锦衣卫', '英雄', '门派'],
        'name': '明朝江湖'
    },
    33: {  # 未来世界
        'keywords': ['未来', '太空', 'AI', 'VR', '虚拟', '量子', '基因', '外星', '反重力', '科技', '飞船', '芯片', '能量', '全息', '神经'],
        'name': '未来世界'
    },
    35: {  # 废土世界
        'keywords': ['废土', '辐射', '避难', '掠夺', '幸存者', '干净水', '罐头', '废料', '地图', '医疗包', '瓦斯'],
        'name': '废土世界'
    },
    36: {  # 魔法世界
        'keywords': ['魔法', '法师', '魔杖', '魔法书', '水晶', '药水', '戒指', '符文', '卷轴', '宝石', '觉醒', '召唤', '精灵', '禁忌'],
        'name': '魔法世界'
    },
    37: {  # 童话世界
        'keywords': ['童话', '仙女', '森林', '会说话的动物', '愿望', '王子', '女巫', '城堡', '水晶鞋', '苹果', '玫瑰', '魔镜', '金钥匙', '八音盒', '星星'],
        'name': '童话世界'
    },
    38: {  # 蒸汽朋克
        'keywords': ['蒸汽', '朋克', '齿轮', '发条', '机械', '黄铜', '护目镜', '飞艇', '列车', '改造', '义体', '网络', '赛博', '霓虹'],
        'name': '蒸汽朋克'
    },
    39: {  # 古代埃及
        'keywords': ['埃及', '法老', '金字塔', '尼罗河', '圣甲虫', '纸莎草', '黄金面具', '狮身人面', '木乃伊', '象形文字', '神庙', '诅咒', '沙漠', '权杖', '印章'],
        'name': '古代埃及'
    },
    40: {  # 古希腊
        'keywords': ['希腊', '奥林匹克', '哲学', '神庙', '特洛伊', '剧院', '神谕', '民主', '英雄', '橄榄', '月桂', '陶罐', '雕塑', '葡萄酒'],
        'name': '古希腊'
    },
    41: {  # 中世纪欧洲
        'keywords': ['中世纪', '骑士', '城堡', '盾牌', '盔甲', '纹章', '圣经', '圣水', '面包', '蜡烛', '册封', '十字军', '修道院', '吟游诗人'],
        'name': '中世纪欧洲'
    },
    42: {  # 文艺复兴
        'keywords': ['文艺复兴', '绘画', '书籍', '羽毛笔', '颜料', '雕塑', '望远镜', '音乐', '珠宝', '美第奇', '科学', '沙龙', '建筑', '印刷', '新大陆', '人文'],
        'name': '文艺复兴'
    },
    43: {  # 工业革命
        'keywords': ['工业', '革命', '蒸汽机', '煤炭', '扳手', '怀表', '蓝图', '产品', '车票', '帽子', '工厂', '火车', '劳工', '城市化', '创新', '社会'],
        'name': '工业革命'
    },
    44: {  # 心理治疗诊所
        'keywords': ['心理', '治疗', '诊所', '咨询', '医师', '疗法'],
        'name': '心理治疗诊所'
    },
    45: {  # 我的家庭
        'keywords': ['家庭', '温馨', '父亲', '母亲', '孩子', '亲情'],
        'name': '我的家庭'
    }
}

def connect_database():
    """连接数据库"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"数据库连接错误: {e}")
        return None

# 物品和事件ID前缀到时代的映射
ID_PREFIX_TO_ERA = {
    'university': 23,      # 我的大学
    'high_school': 24,     # 我的中学
    'work': 25,            # 我的工作
    'childhood': 26,       # 我的童年
    'hometown': 27,        # 我的故乡
    'three_kingdoms': 28,  # 三国时代
    'qin': 29,             # 秦王朝
    'tang': 30,            # 唐朝盛世
    'song': 31,            # 宋朝文雅
    'ming': 32,            # 明朝江湖
    'future': 33,          # 未来世界
    'wasteland': 35,       # 废土世界
    'magic': 36,           # 魔法世界
    'fairy_tale': 37,      # 童话世界
    'cyberpunk': 38,       # 赛博朋克
    'steampunk': 38,       # 蒸汽朋克
    'egypt': 39,           # 古代埃及
    'greece': 40,          # 古希腊
    'medieval': 41,        # 中世纪欧洲
    'renaissance': 42,     # 文艺复兴
    'industrial': 43,      # 工业革命
}

def match_era_by_id_prefix(item_id: str) -> Tuple[int, str, str]:
    """
    通过物品/事件ID前缀匹配时代
    返回: (era_id, era_name, matched_prefix)
    """
    if not item_id:
        return None, None, None

    # item_id格式示例: item_university_student_id
    # event_id格式示例: event_university_late_to_class
    parts = item_id.split('_')
    if len(parts) >= 2:
        # 提取前缀部分，如 'university', 'high_school', 'three_kingdoms'
        # 处理多词前缀，如 'high_school', 'three_kingdoms'
        prefix = parts[1]
        if len(parts) >= 3 and f"{parts[1]}_{parts[2]}" in ID_PREFIX_TO_ERA:
            prefix = f"{parts[1]}_{parts[2]}"

        if prefix in ID_PREFIX_TO_ERA:
            era_id = ID_PREFIX_TO_ERA[prefix]
            era_name = ERA_KEYWORDS.get(era_id, {}).get('name', '未知')
            return era_id, era_name, prefix

    return None, None, None

def match_era_by_keywords(text: str) -> Tuple[int, str, List[str]]:
    """
    通过关键词匹配时代
    返回: (era_id, era_name, matched_keywords)
    """
    if not text:
        return None, None, []

    best_match = None
    best_score = 0
    best_keywords = []

    for era_id, era_info in ERA_KEYWORDS.items():
        keywords = era_info['keywords']
        matched = [kw for kw in keywords if kw in text]
        score = len(matched)

        if score > best_score:
            best_score = score
            best_match = era_id
            best_keywords = matched

    if best_match:
        return best_match, ERA_KEYWORDS[best_match]['name'], best_keywords
    return None, None, []

def match_era(item_id: str, text: str) -> Tuple[int, str, List[str], str]:
    """
    综合匹配：优先使用ID前缀匹配，如果ID前缀无法匹配则使用关键词匹配
    返回: (era_id, era_name, matched_keywords, match_method)
    match_method: 'id_prefix' 或 'keywords' 或 None
    """
    # 优先使用ID前缀匹配
    era_id, era_name, prefix = match_era_by_id_prefix(item_id)
    if era_id:
        return era_id, era_name, [prefix], 'id_prefix'

    # 如果ID前缀无法匹配，使用关键词匹配
    era_id, era_name, keywords = match_era_by_keywords(text)
    if era_id:
        return era_id, era_name, keywords, 'keywords'

    return None, None, [], None

def process_items():
    """处理并更新物品的system_era_id"""
    conn = connect_database()
    if not conn:
        return

    cursor = conn.cursor(dictionary=True)

    # 查询所有物品
    cursor.execute("""
        SELECT id, item_id, name, description, system_era_id
        FROM system_era_items
        ORDER BY id
    """)
    items = cursor.fetchall()

    updates = []
    for item in items:
        text = f"{item['name']} {item['description'] or ''}"
        era_id, era_name, keywords, match_method = match_era(item['item_id'], text)

        if era_id and era_id != item['system_era_id']:
            updates.append({
                'id': item['id'],
                'item_id': item['item_id'],
                'name': item['name'],
                'old_era_id': item['system_era_id'],
                'new_era_id': era_id,
                'era_name': era_name,
                'keywords': keywords,
                'match_method': match_method
            })

    # 执行更新
    for update in updates:
        cursor.execute("""
            UPDATE system_era_items
            SET system_era_id = %s
            WHERE id = %s
        """, (update['new_era_id'], update['id']))

    conn.commit()
    cursor.close()
    conn.close()

    return updates

def process_events():
    """处理并更新事件的system_era_id"""
    conn = connect_database()
    if not conn:
        return

    cursor = conn.cursor(dictionary=True)

    # 查询所有事件
    cursor.execute("""
        SELECT id, event_id, name, description, system_era_id
        FROM system_era_events
        ORDER BY id
    """)
    events = cursor.fetchall()

    updates = []
    for event in events:
        text = f"{event['name']} {event['description'] or ''}"
        era_id, era_name, keywords, match_method = match_era(event['event_id'], text)

        if era_id and era_id != event['system_era_id']:
            updates.append({
                'id': event['id'],
                'event_id': event['event_id'],
                'name': event['name'],
                'old_era_id': event['system_era_id'],
                'new_era_id': era_id,
                'era_name': era_name,
                'keywords': keywords,
                'match_method': match_method
            })

    # 执行更新
    for update in updates:
        cursor.execute("""
            UPDATE system_era_events
            SET system_era_id = %s
            WHERE id = %s
        """, (update['new_era_id'], update['id']))

    conn.commit()
    cursor.close()
    conn.close()

    return updates

def print_report(items_updates, events_updates):
    """打印更新报告"""
    print("\n" + "="*100)
    print("匹配和更新报告")
    print("="*100)

    print(f"\n【物品更新】共 {len(items_updates)} 条")
    if items_updates:
        print("\n物品ID   | 物品名称      | 原时代ID | 新时代ID | 新时代名称    | 匹配方式 | 匹配关键词")
        print("-" * 100)
        for u in items_updates[:30]:  # 显示前30条
            match_method_str = 'ID前缀' if u['match_method'] == 'id_prefix' else '关键词'
            print(f"{u['id']:>7} | {u['name']:<12} | {u['old_era_id'] or 'NULL':>8} | {u['new_era_id']:>8} | {u['era_name']:<12} | {match_method_str:<6} | {', '.join(u['keywords'])}")
        if len(items_updates) > 30:
            print(f"... 还有 {len(items_updates) - 30} 条更新")

    print(f"\n【事件更新】共 {len(events_updates)} 条")
    if events_updates:
        print("\n事件ID   | 事件名称      | 原时代ID | 新时代ID | 新时代名称    | 匹配方式 | 匹配关键词")
        print("-" * 100)
        for u in events_updates[:30]:  # 显示前30条
            match_method_str = 'ID前缀' if u['match_method'] == 'id_prefix' else '关键词'
            print(f"{u['id']:>7} | {u['name']:<12} | {u['old_era_id'] or 'NULL':>8} | {u['new_era_id']:>8} | {u['era_name']:<12} | {match_method_str:<6} | {', '.join(u['keywords'])}")
        if len(events_updates) > 30:
            print(f"... 还有 {len(events_updates) - 30} 条更新")

    print("\n" + "="*100)

def main():
    """主函数"""
    print("开始匹配物品和事件到对应的时代...")

    print("\n处理物品数据...")
    items_updates = process_items()

    print("处理事件数据...")
    events_updates = process_events()

    print_report(items_updates, events_updates)

    print("\n✅ 匹配和更新完成！")

if __name__ == "__main__":
    main()
