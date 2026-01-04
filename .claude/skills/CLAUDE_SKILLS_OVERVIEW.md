# Claude Skills 综合指南

## 📚 目录

1. [什么是 Claude Skills](#什么是-claude-skills)
2. [核心概念](#核心概念)
3. [架构设计](#架构设计)
4. [开发指南](#开发指南)
5. [工具与API](#工具与api)
6. [最佳实践](#最佳实践)
7. [实际案例：心理医生工具集](#实际案例心理医生工具集)
8. [Skills vs MCP Servers](#skills-vs-mcp-servers)
9. [常见问题](#常见问题)
10. [进阶技巧](#进阶技巧)

---

## 什么是 Claude Skills

### 定义

**Claude Skills** 是 Claude Code 的原生扩展机制，允许用户通过简单的 JavaScript 模块创建自定义命令和工具，扩展 Claude 的功能。

### 特点

✅ **简单易用** - 纯 JavaScript 编写，无需复杂配置
✅ **模块化设计** - 每个 Skill 是独立的模块
✅ **命令驱动** - 通过自然语言或斜杠命令调用
✅ **完整工具访问** - 可使用 Claude Code 的所有工具能力
✅ **上下文感知** - 访问对话历史和用户上下文
✅ **即时生效** - 创建后立即可用，无需重启

### 应用场景

- **自动化工作流** - 重复性任务的自动化
- **领域工具** - 特定专业的辅助工具（如医疗、法律、编程）
- **数据处理** - 特定格式的数据转换和分析
- **集成扩展** - 连接外部 API 和服务
- **知识管理** - 组织和检索项目知识

---

## 核心概念

### 1. Skill 模块结构

每个 Skill 是一个 Node.js 风格的模块，导出以下内容：

```javascript
module.exports = {
  name: "skill-name",              // Skill 名称
  description: "描述这个功能",      // 功能描述
  options: {},                      // 可选配置
  args: {                           // 参数定义
    param1: {
      type: "string",               // 参数类型
      required: true,               // 是否必填
      description: "参数说明"
    }
  },
  run: async (args, context) => {   // 执行函数
    // 实现逻辑
    return result;
  }
};
```

### 2. 参数类型系统

| 类型 | 说明 | 示例 |
|------|------|------|
| `string` | 文本字符串 | `{"type": "string"}` |
| `number` | 数字 | `{"type": "number"}` |
| `boolean` | 布尔值 | `{"type": "boolean"}` |
| `array` | 数组 | `{"type": "array"}` |
| `object` | 对象 | `{"type": "object"}` |
| `enum` | 枚举选择 | `{"enum": ["a", "b", "c"]}` |

### 3. 上下文对象 (Context)

`run` 函数接收的第二个参数 `context` 包含：

```javascript
{
  tools: {
    Read: Function,      // 读取文件
    Write: Function,     // 写入文件
    Edit: Function,      // 编辑文件
    Glob: Function,      // 文件搜索
    Grep: Function,      // 内容搜索
    Bash: Function,      // 执行命令
    AskUserQuestion: Function,  // 向用户提问
    // ... 更多工具
  },
  log: Function,         // 日志输出
  cwd: string,           // 当前工作目录
  env: object            // 环境变量
}
```

---

## 架构设计

### 文件组织结构

```
.claude/
├── skills/                    # Skills 根目录
│   ├── my-skill/
│   │   ├── index.js          # Skill 主文件
│   │   ├── utils.js          # 辅助函数
│   │   └── README.md         # 文档
│   └── another-skill/
│       └── index.js
├── data/                      # 数据存储目录
│   ├── patients/
│   ├── sessions/
│   └── assessments/
└── config/                    # 配置文件
```

### Skill 加载机制

1. **发现阶段** - Claude Code 扫描 `.claude/skills/` 目录
2. **注册阶段** - 加载每个 Skill 的元数据（name, description, args）
3. **调用阶段** - 用户触发时，执行 `run` 函数
4. **结果返回** - 将结果展示给用户或用于后续处理

### 执行流程

```
用户输入
    ↓
意图识别（是否调用 Skill）
    ↓
参数解析与验证
    ↓
执行 Skill.run()
    ↓
访问工具（Read/Write/Bash 等）
    ↓
返回结果
    ↓
展示给用户
```

---

## 开发指南

### 快速开始

#### 1. 创建基础 Skill

```javascript
// .claude/skills/hello/index.js
module.exports = {
  name: "hello",
  description: "向用户打招呼",
  args: {
    name: {
      type: "string",
      required: true,
      description: "要问候的名字"
    }
  },
  run: async (args, context) => {
    const { name } = args;
    const { log } = context;

    const message = `你好，${name}！欢迎使用 Claude Skills！`;
    log(message);

    return {
      success: true,
      message: message
    };
  }
};
```

#### 2. 带文件操作的 Skill

```javascript
module.exports = {
  name: "create-note",
  description: "创建笔记文件",
  args: {
    title: {
      type: "string",
      required: true,
      description: "笔记标题"
    },
    content: {
      type: "string",
      required: true,
      description: "笔记内容"
    }
  },
  run: async (args, context) => {
    const { title, content } = args;
    const { Write, log, cwd } = context;

    const filename = `${title}-${Date.now()}.md`;
    const filepath = `${cwd}/notes/${filename}`;

    await Write(filepath, `# ${title}\n\n${content}`);

    log(`✅ 笔记已创建: ${filepath}`);

    return {
      success: true,
      filepath: filepath
    };
  }
};
```

#### 3. 复杂的多步骤 Skill

```javascript
module.exports = {
  name: "analyze-project",
  description: "分析项目结构并生成报告",
  args: {
    path: {
      type: "string",
      required: false,
      description: "项目路径（默认当前目录）"
    }
  },
  run: async (args, context) => {
    const { path } = args;
    const { Glob, Read, Bash, Write, log, cwd } = context;

    const targetPath = path || cwd;

    // 1. 统计文件数量
    const jsFiles = await Glob(`${targetPath}/**/*.js`);
    const tsFiles = await Glob(`${targetPath}/**/*.ts`);
    const jsonFiles = await Glob(`${targetPath}/**/*.json`);

    // 2. 读取 package.json
    let packageInfo = {};
    try {
      const pkgPath = `${targetPath}/package.json`;
      const pkgContent = await Read(pkgPath);
      packageInfo = JSON.parse(pkgContent);
    } catch (e) {
      log('未找到 package.json');
    }

    // 3. 生成报告
    const report = `
# 项目分析报告

## 文件统计
- JavaScript: ${jsFiles.length} 个
- TypeScript: ${tsFiles.length} 个
- JSON: ${jsonFiles.length} 个

## 项目信息
- 名称: ${packageInfo.name || '未知'}
- 版本: ${packageInfo.version || '未知'}
- 依赖: ${Object.keys(packageInfo.dependencies || {}).length} 个
`;

    // 4. 保存报告
    await Write(`${cwd}/project-report.md`, report);

    log('✅ 分析完成，报告已生成');

    return {
      success: true,
      stats: {
        js: jsFiles.length,
        ts: tsFiles.length,
        json: jsonFiles.length
      }
    };
  }
};
```

### 参数验证

```javascript
module.exports = {
  name: "validated-task",
  description: "带参数验证的示例",
  args: {
    age: {
      type: "number",
      required: true,
      description: "年龄（必须大于0）",
      validate: (value) => {
        if (value <= 0) {
          throw new Error("年龄必须大于0");
        }
        if (value > 150) {
          throw new Error("年龄不能超过150");
        }
        return true;
      }
    },
    email: {
      type: "string",
      required: true,
      description: "邮箱地址",
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // 正则验证
    }
  },
  run: async (args, context) => {
    // 参数已自动验证
    const { age, email } = args;
    // ... 业务逻辑
  }
};
```

### 错误处理

```javascript
module.exports = {
  name: "robust-skill",
  description: "健壮的错误处理示例",
  args: {
    filepath: {
      type: "string",
      required: true
    }
  },
  run: async (args, context) => {
    const { filepath } = args;
    const { Read, log } = context;

    try {
      // 尝试读取文件
      const content = await Read(filepath);

      // 处理内容
      const processed = content.toUpperCase();

      return {
        success: true,
        data: processed
      };

    } catch (error) {
      // 错误处理
      log(`❌ 错误: ${error.message}`);

      return {
        success: false,
        error: error.message,
        suggestion: "请检查文件路径是否正确"
      };
    }
  }
};
```

---

## 工具与API

### 可用工具列表

#### 文件操作

| 工具 | 用途 | 示例 |
|------|------|------|
| `Read` | 读取文件 | `await Read('/path/to/file.txt')` |
| `Write` | 写入文件 | `await Write('/path/to/file.txt', 'content')` |
| `Edit` | 编辑文件 | `await Edit('/path/to/file.txt', oldText, newText)` |
| `Glob` | 文件搜索 | `await Glob('src/**/*.js')` |

#### 代码分析

| 工具 | 用途 | 示例 |
|------|------|------|
| `Grep` | 内容搜索 | `await Grep('function name', {path: 'src/'})` |
| `Task` | 启动子任务 | `await Task({subagent_type: 'Explore', ...})` |

#### 系统操作

| 工具 | 用途 | 示例 |
|------|------|------|
| `Bash` | 执行命令 | `await Bash('npm install')` |
| `AskUserQuestion` | 向用户提问 | `await AskUserQuestion({questions: [...]})` |

#### 其他工具

| 工具 | 用途 | 示例 |
|------|------|------|
| `TodoWrite` | 任务管理 | `await TodoWrite({todos: [...]})` |
| `WebSearch` | 网络搜索 | `await WebSearch('query')` |
| `mcp__web_reader__webReader` | 网页阅读 | `await mcp__web_reader__webReader({url: '...'})` |

### 工具使用示例

#### 批量文件处理

```javascript
run: async (args, context) => {
  const { Glob, Read, Write } = context;

  // 查找所有 Markdown 文件
  const files = await Glob('docs/**/*.md');

  const results = [];
  for (const file of files) {
    const content = await Read(file);

    // 处理内容
    const updated = content.replace(/旧文本/g, '新文本');

    // 写回文件
    await Write(file, updated);

    results.push(file);
  }

  return { updated: results };
}
```

#### 并行执行

```javascript
run: async (args, context) => {
  const { Bash } = context;

  // 并行执行多个命令
  await Promise.all([
    Bash('npm test'),
    Bash('npm run lint'),
    Bash('npm run build')
  ]);

  return { success: true };
}
```

#### 条件逻辑

```javascript
run: async (args, context) => {
  const { Read, AskUserQuestion } = context;

  const config = await Read('config.json');
  const userChoice = await AskUserQuestion({
    questions: [{
      question: "是否继续？",
      header: "确认",
      options: [
        { label: "是", description: "继续执行" },
        { label: "否", description: "取消操作" }
      ],
      multiSelect: false
    }]
  });

  if (userChoice["是否继续？"] === "是") {
    // 继续执行
  }

  return { success: true };
}
```

---

## 最佳实践

### 1. 命名规范

✅ **推荐命名**:
- `create-user-profile` - 清晰描述功能
- `analyze-code-quality` - 动词开头
- `generate-api-docs` - 简洁明了

❌ **避免命名**:
- `do-something` - 太模糊
- `helper` - 不够具体
- `test1` - 无意义

### 2. 参数设计

**原则**: 最少化参数，提供合理默认值

```javascript
// ✅ 好的设计
args: {
  path: {
    type: "string",
    required: false,  // 可选
    description: "分析路径（默认当前目录）",
    default: "."      // 提供默认值
  }
}

// ❌ 不好的设计
args: {
  path: { type: "string", required: true },
  recursive: { type: "boolean", required: true },
  followSymlinks: { type: "boolean", required: true },
  maxDepth: { type: "number", required: true },
  // 太多必填参数，使用体验差
}
```

### 3. 返回值规范

```javascript
return {
  success: boolean,      // 是否成功
  data?: any,           // 成功时的数据
  error?: string,       // 失败时的错误信息
  metadata?: {          // 元数据
    duration: number,
    filesProcessed: number,
    // ...
  }
};
```

### 4. 错误处理

```javascript
run: async (args, context) => {
  const { log } = context;

  try {
    // 业务逻辑
    return { success: true, data: result };
  } catch (error) {
    log(`❌ 错误: ${error.message}`);

    // 提供有用的错误信息
    return {
      success: false,
      error: error.message,
      suggestion: "建议的解决方案"
    };
  }
};
```

### 5. 文档编写

每个 Skill 应包含：
- 清晰的描述（description）
- 每个参数的说明（description）
- 使用示例（README.md）
- 注意事项

### 6. 性能优化

```javascript
// ✅ 批量操作
const files = await Glob('src/**/*.js');
const results = await Promise.all(
  files.map(file => processFile(file))
);

// ❌ 串行操作
for (const file of files) {
  await processFile(file);  // 慢
}
```

### 7. 数据管理

**推荐的数据存储结构**:

```
.claude/
└── data/
    ├── {category}/
    │   ├── {id}-{timestamp}.json
    │   └── {id}-{timestamp}.json
    └── {category}/
        └── ...
```

**文件命名规则**:
- 使用 `{entityId}-{timestamp}.{ext}` 格式
- 时间戳使用 ISO 8601 格式
- JSON 文件用于结构化数据
- MD 文件用于可读性报告

---

## 实际案例：心理医生工具集

### 项目概述

创建了一套完整的**精神科临床辅助工具**，包含 6 个 Skill 模块：

| Skill | 功能 | 代码行数 |
|-------|------|----------|
| [patient-record](.claude/skills/psychiatry-tools/patient-record.js) | 患者病历管理 | 220 |
| [assessment-scale](.claude/skills/psychiatry-tools/assessment-scale.js) | 标准化量表评估 | 388 |
| [emotion-analysis](.claude/skills/psychiatry-tools/emotion-analysis.js) | 情感分析 | 454 |
| [treatment-plan](.claude/skills/psychiatry-tools/treatment-plan.js) | 治疗方案生成 | 732 |
| [session-record](.claude/skills/psychiatry-tools/session-record.js) | 会话记录 | 439 |
| [crisis-intervention](.claude/skills/psychiatry-tools/crisis-intervention.js) | 危机干预 | 578 |

### 技术亮点

#### 1. 复杂参数系统

```javascript
args: {
  action: {
    type: "string",
    required: true,
    enum: ["create", "view", "update", "list"]
  },
  data: {
    type: "object",
    required: false,
    description: "患者数据（对象类型）"
  }
}
```

#### 2. 量表自动评分

```javascript
function evaluatePHQ9(answers) {
  const totalScore = answers.reduce((sum, ans) => sum + ans, 0);

  let severity, recommendation;
  if (totalScore <= 4) {
    severity = "无抑郁";
    recommendation = "继续观察";
  } else if (totalScore <= 9) {
    severity = "轻度抑郁";
    recommendation = "建议心理教育和随访";
  }
  // ... 更多分级

  return { totalScore, severity, recommendation };
}
```

#### 3. 情感词典匹配

```javascript
const emotionDictionary = {
  joy: ["开心", "快乐", "高兴", "愉快", "欣喜"],
  sadness: ["难过", "悲伤", "沮丧", "痛苦"],
  anxiety: ["焦虑", "紧张", "担心", "害怕"],
  depression: ["抑郁", "绝望", "无助", "空虚"]
};

function detectEmotions(text) {
  const detected = {};
  for (const [emotion, keywords] of Object.entries(emotionDictionary)) {
    const count = keywords.filter(kw => text.includes(kw)).length;
    if (count > 0) {
      detected[emotion] = { count, keywords: keywords.filter(kw => text.includes(kw)) };
    }
  }
  return detected;
}
```

#### 4. 分阶段治疗计划

```javascript
function generateDepressionPlan(plan, severity, goals, preferences) {
  plan.phases = [
    {
      name: "急性期治疗",
      duration: "6-12周",
      objectives: ["缓解症状", "恢复功能", "降低风险"],
      medications: ["SSRI类抗抑郁药"],
      psychotherapy: ["CBT认知行为治疗", "支持性心理治疗"]
    },
    {
      name: "巩固期治疗",
      duration: "4-9个月",
      objectives: ["预防复发", "巩固疗效"]
    },
    {
      name: "维持期治疗",
      duration: "1年及以上",
      objectives: ["长期稳定", "减少复发"]
    }
  ];
}
```

#### 5. 危机风险评估

```javascript
function assessCrisis(patientId, data, { Write }) {
  const symptomScores = {
    suicideIdeation: {
      keywords: ["自杀", "想死", "不想活"],
      weight: 5
    },
    suicidePlan: {
      keywords: ["计划", "方法", "时间", "准备"],
      weight: 10
    },
    hopelessness: {
      keywords: ["绝望", "没希望", "无意义"],
      weight: 3
    }
  };

  let totalScore = 0;
  const detectedSymptoms = [];

  for (const [symptom, config] of Object.entries(symptomScores)) {
    const count = config.keywords.filter(kw =>
      data.situation.includes(kw)
    ).length;

    if (count > 0) {
      totalScore += count * config.weight;
      detectedSymptoms.push({
        symptom,
        count,
        keywords: config.keywords.filter(kw => data.situation.includes(kw))
      });
    }
  }

  // 风险分级
  let riskLevel, urgency;
  if (totalScore >= 20) {
    riskLevel = "critical";
    urgency = "立即";
  } else if (totalScore >= 10) {
    riskLevel = "high";
    urgency = "24小时内";
  } else if (totalScore >= 5) {
    riskLevel = "medium";
    urgency = "48-72小时";
  } else {
    riskLevel = "low";
    urgency = "1周内";
  }

  return { totalScore, riskLevel, urgency, detectedSymptoms };
}
```

### 数据管理

采用结构化 JSON 存储：

```
.claude/data/
├── patients/           # 患者档案
│   └── P001.json
├── assessments/        # 评估量表
│   ├── P001-phq9-001.json
│   └── P001-phq9-002.json
├── treatment-plans/    # 治疗方案
│   └── P001.json
├── sessions/           # 会话记录
│   ├── P001-20250103.json
│   └── P001-20250110.json
├── emotions/           # 情感分析
│   └── P001-week1.json
├── crisis/             # 危机干预
│   └── P001-crisis-001.json
└── summaries/          # 治疗总结
    └── P001-1month-summary.md
```

### 使用流程

**完整治疗流程示例**：

1. **创建患者档案**
```
"帮我创建患者李明的档案，32岁，男性"
```

2. **初始评估**
```
"使用PHQ-9量表评估患者抑郁程度"
```

3. **制定治疗方案**
```
"根据PHQ-9评分结果，为P001生成抑郁症治疗计划"
```

4. **记录会话**
```
"记录今天的治疗会话，患者情绪有所好转"
```

5. **情感分析**
```
"分析患者这段话的情感：'医生，这周感觉稍微好一点...'"
```

6. **危机干预**
```
"患者说'有时候想不如死了算了'，评估自杀风险"
```

7. **生成总结**
```
"生成患者P001的1个月治疗总结"
```

---

## Skills vs MCP Servers

### 对比表

| 特性 | Claude Skills | MCP Servers |
|------|---------------|-------------|
| **复杂度** | 简单（纯JS） | 复杂（需服务器） |
| **适用场景** | 项目内工具、数据处理 | 外部API集成、跨项目 |
| **工具访问** | 完整工具集 | 需通过 MCP 协议 |
| **上下文** | 完整对话上下文 | 受限 |
| **部署** | 无需部署 | 需要独立服务器 |
| **维护** | 低维护成本 | 需维护服务器 |
| **性能** | 快速（本地执行） | 较慢（网络请求） |

### 选择建议

**使用 Skills 当**:
- ✅ 主要在 Claude Code 内使用
- ✅ 需要访问文件系统
- ✅ 需要完整工具能力
- ✅ 简单到中等复杂度
- ✅ 项目特定功能

**使用 MCP Servers 当**:
- ✅ 需要跨项目共享
- ✅ 集成外部服务（如数据库、API）
- ✅ 需要独立服务
- ✅ 多用户协作
- ✅ 复杂的业务逻辑

### 混合使用

可以同时使用两者：

```
Claude Code
    ↓
Skill (本地处理)
    ↓
MCP Server (外部服务)
    ↓
结果返回
```

**示例**:
```javascript
// 在 Skill 中调用 MCP Server
run: async (args, context) => {
  const { mcp__my_server__getData } = context.tools;

  // 本地处理
  const localData = await processLocalData(args);

  // 调用 MCP 服务
  const externalData = await mcp__my_server__getData({
    query: localData
  });

  return {
    local: localData,
    external: externalData
  };
};
```

---

## 常见问题

### Q1: Skill 支持 TypeScript 吗？

**A**: 当前不支持，但可以：
1. 使用 JSDoc 注释提供类型信息
2. 在单独的项目开发，编译后复制到 `.claude/skills/`
3. 使用 VS Code 的类型检查功能

```javascript
/**
 * @param {string} name - 用户名
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function greet(name) {
  return { success: true, message: `Hello ${name}` };
}
```

### Q2: 如何调试 Skill？

**A**:
1. 使用 `context.log()` 输出调试信息
2. 在 `run` 函数开头添加 `console.log()`
3. 使用 try-catch 捕获错误
4. 测试时使用简单的参数

```javascript
run: async (args, context) => {
  const { log } = context;

  log('🔍 调试: 参数 = ' + JSON.stringify(args));

  try {
    // ... 逻辑
    log('✅ 调试: 执行成功');
  } catch (error) {
    log('❌ 调试: 错误 = ' + error.message);
    throw error;
  }
};
```

### Q3: Skill 可以访问网络吗？

**A**: 可以，通过以下方式：
1. 使用 `WebSearch` 工具搜索
2. 使用 `mcp__web_reader__webReader` 读取网页
3. 使用 `Bash` 执行 `curl` 命令
4. 如果需要 REST API，考虑使用 MCP Server

```javascript
run: async (args, context) => {
  const { WebSearch, Bash } = context;

  // 方法1: 使用 WebSearch
  const results = await WebSearch("最新 AI 新闻");

  // 方法2: 使用 curl
  const { stdout } = await Bash('curl https://api.example.com/data');

  return { data: JSON.parse(stdout) };
};
```

### Q4: 如何共享 Skill？

**A**:
1. **文件共享** - 复制 Skill 文件到 `.claude/skills/`
2. **Git 仓库** - 将 Skills 纳入版本控制
3. **npm 包** - 发布为 npm 包（需要手动安装）

```bash
# 复制 Skill
cp -r my-skill /path/to/project/.claude/skills/

# Git 方式
git clone https://github.com/user/my-skills.git
cp -r my-skills/* .claude/skills/
```

### Q5: Skill 的性能限制？

**A**:
- ✅ 无明显内存限制
- ✅ 执行时间建议 < 2 分钟
- ⚠️ 避免无限循环
- ⚠️ 大文件操作要分批

```javascript
// ✅ 好的做法
const files = await Glob('src/**/*.js');
for (const file of files.slice(0, 100)) {  // 限制数量
  await processFile(file);
}

// ❌ 不好的做法
while (true) {  // 无限循环
  await something();
}
```

### Q6: 如何处理敏感数据？

**A**:
1. 使用环境变量存储密钥
2. 不要在代码中硬编码密码
3. 考虑加密存储
4. 使用 `.gitignore` 排除敏感文件

```javascript
run: async (args, context) => {
  const { env } = context;

  // 从环境变量读取
  const apiKey = env.MY_API_KEY;

  if (!apiKey) {
    throw new Error('缺少 API 密钥');
  }

  // 使用密钥
  const result = await callApi(apiKey);

  return result;
};
```

---

## 进阶技巧

### 1. Skill 组合

多个 Skill 可以协同工作：

```javascript
// skill1: analyze-code
module.exports = {
  name: "analyze-code",
  run: async (args, context) => {
    // 分析代码
    return { issues: [...] };
  }
};

// skill2: fix-code
module.exports = {
  name: "fix-code",
  run: async (args, context) => {
    // 修复问题
    return { fixed: true };
  }
};

// 在对话中组合使用
// "分析代码并修复问题"
```

### 2. 插件架构

创建可扩展的 Skill：

```javascript
// plugin-loader.js
const plugins = {
  formatter: [],
  validator: []
};

async function loadPlugin(pluginName, type) {
  const plugin = await loadSkill(pluginName);
  plugins[type].push(plugin);
  return plugin;
}

async function runPlugins(type, data) {
  const results = [];
  for (const plugin of plugins[type]) {
    const result = await plugin.run(data);
    results.push(result);
  }
  return results;
}

module.exports = { loadPlugin, runPlugins };
```

### 3. 数据流管道

```javascript
// pipeline.js
async function pipeline(data, steps) {
  let result = data;

  for (const step of steps) {
    result = await step(result);
  }

  return result;
}

// 使用
const result = await pipeline(rawData, [
  validateData,
  transformData,
  enrichData,
  saveData
]);
```

### 4. 事件驱动

```javascript
// event-bus.js
const listeners = {};

function on(event, callback) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);
}

async function emit(event, data) {
  if (listeners[event]) {
    await Promise.all(
      listeners[event].map(cb => cb(data))
    );
  }
}

module.exports = { on, emit };
```

### 5. 缓存机制

```javascript
// cache.js
const cache = new Map();

async function getCached(key, fn) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const value = await fn();
  cache.set(key, value);
  return value;
}

// 使用
const data = await getCached('user-123', async () => {
  return await fetchUser('123');
});
```

### 6. 批量处理

```javascript
// batch.js
async function batch(items, batchSize, processor) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
  }

  return results;
}

// 使用
const results = await batch(largeArray, 10, processItem);
```

### 7. 重试机制

```javascript
// retry.js
async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

// 使用
const result = await retry(async () => {
  return await fetch(url);
}, { maxAttempts: 5, delay: 1000 });
```

---

## 总结

### Claude Skills 核心优势

1. **简单高效** - 纯 JavaScript，无需复杂配置
2. **功能强大** - 访问完整工具集
3. **上下文丰富** - 理解对话历史
4. **即用即走** - 创建后立即可用
5. **易于维护** - 代码简洁，易于调试

### 适用场景总结

| 场景 | 推荐方案 |
|------|----------|
| 项目自动化 | Skills ⭐⭐⭐⭐⭐ |
| 数据处理 | Skills ⭐⭐⭐⭐⭐ |
| 外部 API | MCP Servers ⭐⭐⭐⭐⭐ |
| 跨项目共享 | MCP Servers ⭐⭐⭐⭐ |
| 快速原型 | Skills ⭐⭐⭐⭐⭐ |
| 企业集成 | MCP Servers ⭐⭐⭐⭐⭐ |

### 学习路径

1. **入门** - 创建简单的 Hello World Skill
2. **进阶** - 实现文件操作和数据处理
3. **熟练** - 构建复杂的多步骤工作流
4. **专家** - 开发专业的领域工具集

### 参考资源

- [Claude Code 官方文档](https://github.com/anthropics/claude-code)
- [心理医生工具集](.claude/skills/psychiatry-tools/) - 完整案例
- [Skills 示例库](https://github.com/topics/claude-code-skills)

---

## 附录

### 完整 Skill 模板

```javascript
/**
 * Skill 名称
 * 详细描述
 */

module.exports = {
  name: "skill-name",
  description: "简洁描述（1-2句话）",

  args: {
    param1: {
      type: "string",
      required: true,
      description: "参数说明",
      default: "default-value"
    },
    param2: {
      type: "number",
      required: false,
      description: "可选参数"
    }
  },

  options: {
    // 可选配置
    timeout: 30000,  // 超时时间
    retry: 3         // 重试次数
  },

  run: async (args, context) => {
    const { param1, param2 } = args;
    const { Read, Write, Bash, log, cwd } = context;

    try {
      // 1. 参数验证
      if (!param1) {
        throw new Error("param1 是必需的");
      }

      // 2. 业务逻辑
      const result = await doSomething(param1, param2);

      // 3. 返回结果
      return {
        success: true,
        data: result,
        metadata: {
          processedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      log(`❌ 错误: ${error.message}`);

      return {
        success: false,
        error: error.message,
        suggestion: "建议的解决方案"
      };
    }
  }
};

// 辅助函数
async function doSomething(input, options) {
  // 实现细节
  return { processed: input };
}
```

### 常用代码片段

#### 当前时间戳
```javascript
const timestamp = new Date().toISOString();
```

#### 生成唯一ID
```javascript
const id = `ID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

#### 延迟执行
```javascript
await new Promise(resolve => setTimeout(resolve, 1000));
```

#### 数组去重
```javascript
const unique = [...new Set(array)];
```

#### 对象深拷贝
```javascript
const copy = JSON.parse(JSON.stringify(obj));
```

---

**文档版本**: 1.0
**最后更新**: 2025-01-04
**作者**: Claude Sonnet 4.5
