# 日常生活助手技能测试工具

**文档版本**: V1.0  
**创建日期**: 2026-01-09  
**项目名称**: 数字生命体交互系统（HeartSphere）

---

## 一、工具概述

本工具用于自动化测试6个日常生活助手角色的48个技能，支持：

1. **批量测试执行**：自动执行预设话术测试和自然对话测试
2. **测试结果收集**：自动收集测试数据（激活状态、响应时间、评分等）
3. **测试报告生成**：自动生成Markdown格式的测试报告

## 二、工具结构

```
scripts/test-skills/
├── README.md              # 本文档
├── test-skill-api.py      # API测试脚本（通过API调用测试技能）
├── test-skill-browser.py  # 浏览器自动化测试脚本（通过浏览器UI测试技能）
├── collect-results.py     # 测试结果收集工具
├── generate-report.py     # 测试报告生成工具
└── data/                  # 测试数据目录
    ├── test-cases.json    # 测试用例定义
    └── results/           # 测试结果存储目录
        ├── results-YYYY-MM-DD.json
        └── reports/       # 测试报告存储目录
            └── report-YYYY-MM-DD.md
```

## 三、使用方法

### 3.1 准备测试用例

测试用例定义在 `data/test-cases.json` 文件中，包含：

- 6个角色的信息
- 48个技能的测试用例（预设话术 + 自然对话）
- 测试执行顺序

### 3.2 执行测试

#### 方式1：API测试（推荐，更快）

```bash
# 设置环境变量
export API_BASE_URL=http://localhost:8081
export FRONTEND_URL=http://localhost:3000
export TEST_USER_TOKEN=your_token_here

# 执行测试
python scripts/test-skills/test-skill-api.py
```

#### 方式2：浏览器自动化测试（更真实，但较慢）

```bash
# 设置环境变量
export FRONTEND_URL=http://localhost:3000
export TEST_USER_TOKEN=your_token_here

# 执行测试
python scripts/test-skills/test-skill-browser.py
```

### 3.3 收集测试结果

```bash
# 收集测试结果（如果使用手动测试）
python scripts/test-skills/collect-results.py --input data/results/manual-results.json --output data/results/results-YYYY-MM-DD.json
```

### 3.4 生成测试报告

```bash
# 生成测试报告
python scripts/test-skills/generate-report.py --input data/results/results-YYYY-MM-DD.json --output data/results/reports/report-YYYY-MM-DD.md
```

## 四、测试数据格式

### 4.1 测试用例格式（test-cases.json）

```json
{
  "characters": [
    {
      "name": "时小光",
      "id": "character_id_here",
      "skills": [
        {
          "id": "time_audit",
          "name": "时间审计",
          "prompts": [
            {
              "type": "preset",
              "text": "帮我分析一下今天的时间使用情况"
            },
            {
              "type": "natural",
              "text": "我想知道今天都做了什么"
            }
          ]
        }
      ]
    }
  ]
}
```

### 4.2 测试结果格式（results-YYYY-MM-DD.json）

```json
{
  "testDate": "2026-01-09",
  "testSummary": {
    "totalCases": 96,
    "successCases": 90,
    "failedCases": 6,
    "passRate": 93.75
  },
  "results": [
    {
      "testId": "TC-XIAOGUANG-001",
      "character": "时小光",
      "skillId": "time_audit",
      "skillName": "时间审计",
      "testType": "preset",
      "prompt": "帮我分析一下今天的时间使用情况",
      "status": "success",
      "functionCallingTriggered": true,
      "skillNameDisplayed": true,
      "responseTime": 2.5,
      "relevanceScore": 5,
      "completenessScore": 5,
      "userExperienceScore": 5,
      "errorType": null,
      "errorMessage": null,
      "testTime": "2026-01-09T10:00:00"
    }
  ]
}
```

## 五、注意事项

1. **API测试需要有效的认证Token**：确保设置了正确的 `TEST_USER_TOKEN`
2. **浏览器自动化测试需要安装Selenium**：`pip install selenium`
3. **测试执行可能需要较长时间**：48个技能 × 2种测试类型 = 96个测试用例
4. **建议分批执行**：可以按角色分批执行测试，避免一次性执行时间过长

## 六、故障排查

### 问题1：API测试失败

- **检查网络连接**：确保可以访问API服务器
- **检查认证Token**：确保Token有效且未过期
- **检查API端点**：确保API端点路径正确

### 问题2：浏览器自动化测试失败

- **检查浏览器驱动**：确保安装了正确的浏览器驱动（Chrome/Firefox等）
- **检查浏览器版本**：确保浏览器版本与驱动版本匹配
- **检查前端URL**：确保前端应用正常运行

### 问题3：测试报告生成失败

- **检查测试结果文件**：确保测试结果文件格式正确
- **检查文件路径**：确保输出路径存在且可写

---

**文档维护**: 本文档将根据工具使用情况持续更新。
