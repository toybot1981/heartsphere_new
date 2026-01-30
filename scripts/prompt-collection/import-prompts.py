#!/usr/bin/env python3
"""
提示词导入脚本
将分类好的提示词导入到数据库
支持通过API或SQL脚本导入
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any

def generate_sql_insert(prompts: List[Dict[str, Any]], admin_id: int = 1) -> str:
    """生成SQL INSERT语句"""
    sql_statements = []
    
    for prompt in prompts:
        # 转义SQL字符串
        def escape_sql(s):
            if s is None:
                return 'NULL'
            return "'" + s.replace("'", "''").replace("\\", "\\\\") + "'"
        
        name = escape_sql(prompt['name'])
        category_code = escape_sql(prompt['category_code'])
        description = escape_sql(prompt.get('description', ''))
        system_prompt = escape_sql(prompt.get('system_prompt'))
        user_prompt = escape_sql(prompt.get('user_prompt', ''))
        variables = escape_sql(json.dumps(prompt.get('variables', {}), ensure_ascii=False))
        example_data = escape_sql(json.dumps(prompt.get('example_data', {}), ensure_ascii=False))
        
        sql = f"""INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_by, created_at, updated_at)
VALUES ({name}, {category_code}, {description}, {system_prompt}, {user_prompt}, {variables}, {example_data}, 1, true, {admin_id}, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = {description},
  system_prompt = {system_prompt},
  user_prompt = {user_prompt},
  variables = {variables},
  example_data = {example_data},
  updated_at = NOW();"""
        
        sql_statements.append(sql)
    
    return '\n\n'.join(sql_statements)

def main():
    """主函数"""
    base_dir = Path(__file__).parent.parent.parent
    
    # 读取分类好的提示词
    categorized_file = base_dir / 'scripts' / 'prompt-collection' / 'categorized-prompts.json'
    manual_file = base_dir / 'scripts' / 'prompt-collection' / 'manual-prompts.json'
    
    all_prompts = []
    
    if categorized_file.exists():
        with open(categorized_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_prompts.extend(data['prompts'])
    
    if manual_file.exists():
        with open(manual_file, 'r', encoding='utf-8') as f:
            manual_prompts = json.load(f)
            all_prompts.extend(manual_prompts)
    
    print(f"Total prompts to import: {len(all_prompts)}")
    
    # 生成SQL脚本
    sql_output = base_dir / 'scripts' / 'prompt-collection' / 'import-prompts.sql'
    
    # 先写入分类创建SQL
    categories_sql = (base_dir / 'scripts' / 'prompt-collection' / 'create-categories.sql').read_text(encoding='utf-8')
    
    # 生成提示词导入SQL
    prompts_sql = generate_sql_insert(all_prompts)
    
    # 合并SQL
    full_sql = f"""-- 提示词分类和模板导入脚本
-- 生成时间: {Path(__file__).stat().st_mtime}
-- 提示词总数: {len(all_prompts)}

-- ============================================
-- 第一部分：创建分类体系
-- ============================================

{categories_sql}

-- ============================================
-- 第二部分：导入提示词模板
-- ============================================

{prompts_sql}
"""
    
    with open(sql_output, 'w', encoding='utf-8') as f:
        f.write(full_sql)
    
    print(f"SQL script generated: {sql_output}")
    print(f"\nTo import, run:")
    print(f"  mysql -u <username> -p <database> < {sql_output}")
    
    # 打印统计
    by_category = {}
    for p in all_prompts:
        cat = p['category_code']
        by_category[cat] = by_category.get(cat, 0) + 1
    
    print("\n=== Prompts by Category ===")
    for cat, count in sorted(by_category.items()):
        print(f"{cat}: {count} prompts")

if __name__ == '__main__':
    main()
