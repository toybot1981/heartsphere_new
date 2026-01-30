#!/usr/bin/env python3
"""
提示词分析和分类脚本
分析扫描结果，进行分类和命名
"""

import json
from pathlib import Path
from typing import Dict, List, Any

def categorize_prompt(prompt: Dict[str, Any]) -> Dict[str, Any]:
    """对提示词进行分类和命名"""
    file_path = prompt['file_path']
    var_name = prompt['variable_name']
    content = prompt['prompt_content']
    project = prompt['project']
    
    # 根据文件路径和变量名判断功能
    category_code = None
    template_name = None
    description = None
    
    # Mentis项目提示词
    if project == 'mentis':
        if 'IntentRecognizer' in file_path or 'INTENT' in var_name:
            category_code = 'mentis-intent-recognition'
            template_name = 'mentis-intent-recognition-basic'
            description = 'Mentis项目的基础意图识别提示词'
        elif 'TaskDecomposer' in file_path and 'MULTI_AGENT' in var_name:
            category_code = 'mentis-task-decomposition'
            template_name = 'mentis-task-decomposition-multi-agent'
            description = 'Mentis项目的多智能体任务分解提示词'
        elif 'TaskDecomposer' in file_path and 'DECOMPOSE' in var_name:
            category_code = 'mentis-task-decomposition'
            template_name = 'mentis-task-decomposition-single'
            description = 'Mentis项目的单任务分解提示词'
        elif 'ResponseGenerator' in file_path or 'RESPONSE' in var_name:
            category_code = 'mentis-response-generation'
            template_name = 'mentis-response-generation-friendly'
            description = 'Mentis项目的友好响应生成提示词'
    
    # Main项目提示词（需要手动添加）
    elif project == 'main':
        if 'EmotionService' in file_path or 'emotion' in file_path.lower():
            category_code = 'main-emotion-analysis'
            template_name = 'main-emotion-analysis-default'
            description = '主项目的默认情感分析提示词'
        elif 'ESoulLetterGenerator' in file_path or 'letter' in file_path.lower():
            category_code = 'main-letter-generation'
            template_name = 'main-letter-generation-character'
            description = '主项目的角色信件生成提示词'
        elif 'LLMMemoryExtractor' in file_path or 'memory' in file_path.lower():
            category_code = 'main-ai-service'
            template_name = 'main-memory-extraction-default'
            description = '主项目的记忆提取提示词'
        elif 'LLMBasedSkillExecutor' in file_path or 'skill' in file_path.lower():
            category_code = 'main-skill-execution'
            template_name = 'main-skill-execution-default'
            description = '主项目的技能执行提示词'
    
    return {
        'category_code': category_code,
        'template_name': template_name,
        'description': description
    }

def extract_system_prompt(content: str) -> tuple[str, str]:
    """尝试从内容中分离systemPrompt和userPrompt"""
    # 简单策略：如果内容以"你是一个"或"你是"开头，可能是system prompt
    lines = content.split('\n')
    system_lines = []
    user_lines = []
    
    in_system = True
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if in_system:
                system_lines.append(line)
            else:
                user_lines.append(line)
            continue
        
        # 如果遇到明显的用户提示词标记，切换到user prompt
        if any(marker in stripped for marker in ['用户', '请', '要求：', '请按照']):
            if in_system and system_lines:
                in_system = False
        
        if in_system:
            system_lines.append(line)
        else:
            user_lines.append(line)
    
    system_prompt = '\n'.join(system_lines).strip()
    user_prompt = '\n'.join(user_lines).strip()
    
    # 如果没有分离出system prompt，将整个内容作为user prompt
    if not system_prompt or len(system_prompt) < 20:
        return None, content
    
    return system_prompt, user_prompt

def main():
    """主函数"""
    base_dir = Path(__file__).parent.parent.parent
    scan_file = base_dir / 'scripts' / 'prompt-collection' / 'scan-results.json'
    
    with open(scan_file, 'r', encoding='utf-8') as f:
        scan_data = json.load(f)
    
    categorized = []
    
    for prompt in scan_data['prompts']:
        category_info = categorize_prompt(prompt)
        
        # 提取systemPrompt和userPrompt
        system_prompt, user_prompt = extract_system_prompt(prompt['prompt_content'])
        
        # 构建变量定义
        variables = {}
        for var in prompt['variables']:
            variables[var] = {
                'type': 'string',
                'description': f'变量 {var}',
                'required': True
            }
        
        categorized_prompt = {
            'name': category_info['template_name'],
            'category_code': category_info['category_code'],
            'description': category_info['description'],
            'system_prompt': system_prompt,
            'user_prompt': user_prompt,
            'variables': variables,
            'example_data': {},
            'source_file': prompt['file_path'],
            'source_line': prompt['line_number'],
            'source_variable': prompt['variable_name']
        }
        
        categorized.append(categorized_prompt)
    
    # 保存分类结果
    output_file = base_dir / 'scripts' / 'prompt-collection' / 'categorized-prompts.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total': len(categorized),
            'prompts': categorized
        }, f, ensure_ascii=False, indent=2)
    
    print(f"Analyzed and categorized {len(categorized)} prompts")
    print(f"Results saved to: {output_file}")
    
    # 打印分类统计
    categories = {}
    for p in categorized:
        cat = p['category_code']
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n=== Categories ===")
    for cat, count in sorted(categories.items()):
        print(f"{cat}: {count} prompts")

if __name__ == '__main__':
    main()
