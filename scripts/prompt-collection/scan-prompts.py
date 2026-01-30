#!/usr/bin/env python3
"""
提示词模板扫描脚本
扫描代码库中的硬编码提示词模板
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class PromptTemplate:
    """提示词模板数据结构"""
    file_path: str
    line_number: int
    variable_name: str
    prompt_content: str
    prompt_type: str  # 'static_final', 'string_literal', 'stringbuilder'
    context: str  # 所属类和方法
    variables: List[str]  # 识别的变量占位符
    project: str  # main, mentis, admin

def scan_java_file(file_path: Path, project: str) -> List[PromptTemplate]:
    """扫描单个Java文件中的提示词"""
    templates = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return templates
    
    # 提取类名和方法名（用于上下文）
    class_match = re.search(r'class\s+(\w+)', content)
    class_name = class_match.group(1) if class_match else "Unknown"
    
    # 模式1: private static final String XXX_PROMPT = """
    pattern1 = re.compile(
        r'private\s+static\s+final\s+String\s+(\w+_?PROMPT\w*)\s*=\s*"""\s*\n(.*?)"""',
        re.DOTALL | re.MULTILINE
    )
    
    # 模式2: String xxxPrompt = """
    pattern2 = re.compile(
        r'String\s+(\w+[Pp]rompt\w*)\s*=\s*"""\s*\n(.*?)"""',
        re.DOTALL | re.MULTILINE
    )
    
    # 模式3: StringBuilder prompt = new StringBuilder() 后跟 append
    # 这个需要更复杂的处理，先处理简单的模式
    
    # 查找所有匹配
    for match in pattern1.finditer(content):
        var_name = match.group(1)
        prompt_content = match.group(2).strip()
        
        # 计算行号
        line_num = content[:match.start()].count('\n') + 1
        
        # 识别变量占位符 {variableName}
        variables = re.findall(r'\{(\w+)\}', prompt_content)
        
        # 查找方法上下文
        method_context = find_method_context(content, match.start())
        
        templates.append(PromptTemplate(
            file_path=str(file_path.relative_to(Path.cwd())),
            line_number=line_num,
            variable_name=var_name,
            prompt_content=prompt_content,
            prompt_type='static_final',
            context=f"{class_name}.{method_context}",
            variables=list(set(variables)),
            project=project
        ))
    
    for match in pattern2.finditer(content):
        var_name = match.group(1)
        prompt_content = match.group(2).strip()
        
        # 跳过已经在pattern1中匹配的
        if any(t.variable_name == var_name for t in templates):
            continue
        
        line_num = content[:match.start()].count('\n') + 1
        variables = re.findall(r'\{(\w+)\}', prompt_content)
        method_context = find_method_context(content, match.start())
        
        templates.append(PromptTemplate(
            file_path=str(file_path.relative_to(Path.cwd())),
            line_number=line_num,
            variable_name=var_name,
            prompt_content=prompt_content,
            prompt_type='string_literal',
            context=f"{class_name}.{method_context}",
            variables=list(set(variables)),
            project=project
        ))
    
    return templates

def find_method_context(content: str, position: int) -> str:
    """查找方法上下文"""
    # 向前查找最近的方法定义
    before = content[:position]
    method_match = re.search(r'(\w+)\s*\([^)]*\)\s*\{[^}]*$', before, re.MULTILINE)
    if method_match:
        return method_match.group(1)
    return "unknown"

def scan_directory(directory: Path, project: str) -> List[PromptTemplate]:
    """扫描目录中的所有Java文件"""
    templates = []
    
    for java_file in directory.rglob('*.java'):
        # 跳过测试文件
        if 'test' in str(java_file).lower():
            continue
        
        file_templates = scan_java_file(java_file, project)
        templates.extend(file_templates)
    
    return templates

def main():
    """主函数"""
    base_dir = Path(__file__).parent.parent.parent
    
    all_templates = []
    
    # 扫描各个项目
    projects = {
        'main': base_dir / 'main' / 'backend',
        'mentis': base_dir / 'mentis' / 'backend',
        'admin': base_dir / 'admin' / 'backend'
    }
    
    for project_name, project_path in projects.items():
        if project_path.exists():
            print(f"Scanning {project_name} project...")
            templates = scan_directory(project_path, project_name)
            all_templates.extend(templates)
            print(f"Found {len(templates)} prompts in {project_name}")
        else:
            print(f"Project path not found: {project_path}")
    
    # 转换为字典格式
    result = {
        'scan_date': datetime.now().isoformat(),
        'total_prompts': len(all_templates),
        'prompts': [asdict(t) for t in all_templates]
    }
    
    # 保存结果
    output_file = base_dir / 'scripts' / 'prompt-collection' / 'scan-results.json'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\nScan complete! Found {len(all_templates)} prompts.")
    print(f"Results saved to: {output_file}")
    
    # 打印摘要
    print("\n=== Summary by Project ===")
    by_project = {}
    for t in all_templates:
        by_project[t.project] = by_project.get(t.project, 0) + 1
    
    for project, count in sorted(by_project.items()):
        print(f"{project}: {count} prompts")
    
    print("\n=== Summary by Type ===")
    by_type = {}
    for t in all_templates:
        by_type[t.prompt_type] = by_type.get(t.prompt_type, 0) + 1
    
    for ptype, count in sorted(by_type.items()):
        print(f"{ptype}: {count} prompts")

if __name__ == '__main__':
    main()
