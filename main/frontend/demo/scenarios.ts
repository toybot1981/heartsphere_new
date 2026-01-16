/**
 * 演示场景配置
 * 定义所有可用的演示场景
 */

export interface DemoScenario {
  id: string;
  name: string;
  category: string;
  description: string;
  exampleMessage: string;
  expectedResult?: string;
}

export const demoScenarios: DemoScenario[] = [
  // 命令执行场景
  {
    id: 'command-simple',
    name: '简单命令执行',
    category: '命令执行',
    description: '执行基本的系统命令，如 ls、pwd 等',
    exampleMessage: '请帮我执行 ls 命令查看当前目录的文件列表',
    expectedResult: '应该能看到当前目录的文件列表'
  },
  {
    id: 'command-complex',
    name: '复杂命令执行',
    category: '命令执行',
    description: '执行带管道、重定向的复杂命令',
    exampleMessage: '请帮我执行命令：cat /etc/passwd | grep root | wc -l',
    expectedResult: '应该返回包含 root 的行数'
  },
  {
    id: 'command-error',
    name: '命令执行失败处理',
    category: '命令执行',
    description: '演示命令执行失败时的错误处理',
    exampleMessage: '请执行一个不存在的命令：nonexistent_command_xyz',
    expectedResult: '应该显示错误信息，说明命令不存在'
  },
  
  // 脚本执行场景
  {
    id: 'script-python',
    name: 'Python 脚本执行',
    category: '脚本执行',
    description: '执行一个简单的 Python 脚本',
    exampleMessage: '请帮我执行一个 Python 脚本：\n```python\nprint("Hello from Python!")\nfor i in range(5):\n    print(f"Count: {i}")\n```',
    expectedResult: '应该输出 Hello from Python! 和 0-4 的计数'
  },
  {
    id: 'script-javascript',
    name: 'JavaScript 脚本执行',
    category: '脚本执行',
    description: '执行一个简单的 JavaScript 脚本',
    expectedResult: '应该输出 Hello from JavaScript! 和 Sum: 15'
  },
  {
    id: 'script-long-running',
    name: '长时间运行脚本',
    category: '脚本执行',
    description: '演示长时间运行脚本的处理',
    exampleMessage: '请帮我执行一个需要运行几秒钟的 Python 脚本：\n```python\nimport time\nfor i in range(5):\n    print(f"Step {i+1}/5")\n    time.sleep(1)\nprint("Done!")\n```',
    expectedResult: '应该能看到逐步输出的进度信息'
  },
  
  // GUI 操作场景
  {
    id: 'gui-screenshot',
    name: 'GUI 截图操作',
    category: 'GUI 操作',
    description: '获取虚拟机屏幕截图',
    exampleMessage: '请帮我获取虚拟机的屏幕截图',
    expectedResult: '应该能看到虚拟机的屏幕截图'
  },
  {
    id: 'gui-click',
    name: 'GUI 点击操作',
    category: 'GUI 操作',
    description: '在虚拟机中执行点击操作',
    exampleMessage: '请帮我在虚拟机中点击屏幕中央',
    expectedResult: '应该能执行点击操作'
  },
  {
    id: 'gui-type',
    name: 'GUI 输入文本操作',
    category: 'GUI 操作',
    description: '在虚拟机中输入文本',
    exampleMessage: '请帮我在虚拟机中输入文本 "Hello World"',
    expectedResult: '应该能在虚拟机中输入文本'
  },
  
  // 虚拟机生命周期场景
  {
    id: 'vm-lifecycle',
    name: '虚拟机生命周期',
    category: '虚拟机管理',
    description: '完整的虚拟机生命周期：创建 → 执行操作 → 删除',
    exampleMessage: '请帮我创建一个 Ubuntu 虚拟机，然后执行 ls 命令，最后删除虚拟机',
    expectedResult: '应该能完成虚拟机的创建、命令执行和删除'
  },
  {
    id: 'vm-status',
    name: '虚拟机状态查询',
    category: '虚拟机管理',
    description: '查询虚拟机的当前状态',
    exampleMessage: '请帮我查询当前虚拟机的状态',
    expectedResult: '应该能显示虚拟机的状态信息（ID、状态、创建时间等）'
  },
  {
    id: 'vm-snapshot',
    name: '虚拟机快照操作',
    category: '虚拟机管理',
    description: '创建和恢复虚拟机快照（如果支持）',
    exampleMessage: '请帮我创建一个名为 "backup" 的虚拟机快照',
    expectedResult: '应该能创建快照（如果功能已实现）'
  }
];

/**
 * 按分类获取场景
 */
export const getScenariosByCategory = (category: string): DemoScenario[] => {
  if (category === 'all') {
    return demoScenarios;
  }
  return demoScenarios.filter(s => s.category === category);
};

/**
 * 获取所有分类
 */
export const getCategories = (): string[] => {
  return Array.from(new Set(demoScenarios.map(s => s.category)));
};

/**
 * 根据 ID 获取场景
 */
export const getScenarioById = (id: string): DemoScenario | undefined => {
  return demoScenarios.find(s => s.id === id);
};
