# 心理医生专用工具集 (Psychiatry Tools)

一套为心理医生和心理健康专业人员设计的 Claude Code Skills 工具集。

## 📋 功能概览

### 1. **患者病历管理** (`patient-record`)
- ✅ 创建患者病历
- 📖 查看病历信息
- ✏️ 更新病历记录
- 📋 列出所有患者

**使用示例：**
```bash
# 创建病历
/patient-record --action=create --data='{"name":"张三","age":30,"gender":"男","diagnosis":"抑郁症"}'

# 查看病历
/patient-record --action=view --patientId=P001

# 列出所有患者
/patient-record --action=list
```

### 2. **心理评估量表** (`assessment-scale`)
包含常用心理评估量表的完整实现：
- **PHQ-9**: 患者健康问卷（抑郁症筛查）
- **GAD-7**: 广泛性焦虑障碍量表
- **MMSE**: 简易精神状态检查量表（认知功能）
- **HAMD**: 汉密尔顿抑郁量表

**使用示例：**
```bash
# 查看量表内容
/assessment-scale --scale=phq9 --action=view

# 评分
/assessment-scale --scale=phq9 --action=evaluate --answers=[0,1,2,3,2,1,0,2,1] --patientId=P001
```

### 3. **情绪分析** (`emotion-analysis`)
- 🔍 分析文本中的情绪
- 📈 查看情绪变化趋势
- 📊 生成情绪分析报告

**使用示例：**
```bash
# 分析文本情绪
/emotion-analysis --action=analyze --text="我今天感觉很糟糕" --patientId=P001

# 查看情绪趋势
/emotion-analysis --action=trends --patientId=P001 --period=7d

# 生成情绪报告
/emotion-analysis --action=report --patientId=P001 --period=30d
```

### 4. **治疗计划生成** (`treatment-plan`)
根据诊断自动生成个性化治疗计划：
- 📝 抑郁症治疗计划
- 😰 焦虑症治疗计划
- 🔄 双相情感障碍治疗计划
- 🧠 精神分裂症治疗计划

**使用示例：**
```bash
# 创建治疗计划
/treatment-plan --action=create --patientId=P001 --diagnosis="抑郁症" --severity=moderate

# 查看治疗计划
/treatment-plan --action=view --patientId=P001

# 跟踪进度
/treatment-plan --action=track --patientId=P001
```

### 5. **会话记录** (`session-record`)
- 📝 记录治疗会话
- 🔍 查看会话详情
- 📊 生成会话摘要
- 📈 评估治疗进展

**使用示例：**
```bash
# 创建会话记录
/session-record --action=create --patientId=P001 --chiefComplaint="失眠" --duration=50

# 查看所有会话
/session-record --action=list --patientId=P001

# 生成摘要
/session-record --action=summary --patientId=P001
```

### 6. **危机干预** (`crisis-intervention`)
- 🚨 危机风险评估
- 📋 制定干预方案
- 🆘 提供应急指导
- 📞 提供危机资源

**使用示例：**
```bash
# 评估危机风险
/crisis-intervention --action=assess --patientId=P001 --symptoms=["自杀意念","绝望感"]

# 制定干预方案
/crisis-intervention --action=plan --patientId=P001 --riskLevel=high

# 获取应急指导
/crisis-intervention --action=guide --riskLevel=critical
```

## 🚀 安装使用

### 安装步骤

1. **将工具集复制到项目目录**
```bash
# 确保 .claude/skills/psychiatry-tools/ 目录存在
ls .claude/skills/psychiatry-tools/
```

2. **重启 Claude Code**
```bash
# 重启 Claude Code 以加载新技能
```

3. **开始使用**
```bash
# 查看所有可用的 psychiatry 工具
/help psychiatry

# 或直接使用任何工具
/patient-record --action=list
```

## 📁 数据存储

所有数据存储在 `.claude/data/` 目录下：

```
.claude/data/
├── patients/              # 患者病历
├── assessments/           # 评估结果
├── emotions/              # 情绪记录
├── sessions/              # 会话记录
├── treatment-plans/       # 治疗计划
├── progress/              # 进度跟踪
├── summaries/             # 摘要报告
└── crisis/                # 危机干预
```

## 🔧 配置选项

### 自定义配置

可以在 `.claude/skills.config.js` 中添加自定义配置：

```javascript
module.exports = {
  skills: {
    "psychiatry-tools": {
      enabled: true,
      config: {
        // 默认会话时长（分钟）
        defaultSessionDuration: 50,

        // 评估量表语言
        assessmentLanguage: "zh-CN",

        // 危机干预热线
        crisisHotline: "400-161-9995",

        // 数据保留期限（天）
        dataRetentionDays: 365
      }
    }
  }
};
```

## 📊 数据导出

### 导出患者数据

```bash
# 导出所有患者数据
/export-patient-data --patientId=P001 --format=json
```

### 生成报告

```bash
# 生成完整的患者报告
/generate-report --patientId=P001 --include=all
```

## 🛡️ 隐私和安全

⚠️ **重要提示**：

1. **患者隐私**: 所有患者数据都存储在本地 `.claude/data/` 目录
2. **数据保护**: 不要将 `.claude/data/` 目录提交到版本控制系统
3. **访问控制**: 确保只有授权人员可以访问这些数据
4. **备份建议**: 定期备份患者数据

### .gitignore 配置

确保在项目根目录的 `.gitignore` 中添加：

```gitignore
# Claude Code 数据
.claude/data/
```

## 📝 示例工作流程

### 典型的工作流程

```bash
# 1. 创建新患者
/patient-record --action=create --data='{"name":"李四","age":28,"gender":"女"}'

# 2. 进行初次评估
/assessment-scale --scale=phq9 --action=evaluate --answers=[2,2,1,3,2,2,1,2,1] --patientId=P002
/assessment-scale --scale=gad7 --action=evaluate --answers=[1,2,2,1,2,1,1] --patientId=P002

# 3. 创建治疗计划
/treatment-plan --action=create --patientId=P002 --diagnosis="抑郁症" --severity=moderate

# 4. 记录第一次会话
/session-record --action=create --patientId=P002 --chiefComplaint="情绪低落2周" --duration=50

# 5. 情绪分析
/emotion-analysis --action=analyze --text="最近感觉很累，什么都不想做" --patientId=P002

# 6. 定期跟踪
/session-record --action=summary --patientId=P002 --period=30d
/emotion-analysis --action=trends --patientId=P002 --period=30d
/treatment-plan --action=track --patientId=P002
```

## 🆘 危机处理流程

当遇到危机情况时：

```bash
# 1. 评估风险
/crisis-intervention --action=assess --patientId=P001 --situation="患者表达自杀意念"

# 2. 获取应急指导
/crisis-intervention --action=guide --riskLevel=critical

# 3. 制定干预方案
/crisis-intervention --action=plan --patientId=P001 --riskLevel=critical

# 4. 获取危机资源
/crisis-intervention --action=resources
```

## 🔄 更新日志

### Version 1.0.0 (2025-01-03)
- ✅ 初始版本发布
- ✅ 患者病历管理
- ✅ 心理评估量表（PHQ-9, GAD-7, MMSE, HAMD）
- ✅ 情绪分析和趋势
- ✅ 治疗计划生成
- ✅ 会话记录管理
- ✅ 危机干预工具

## 💡 最佳实践

1. **定期备份**: 定期备份 `.claude/data/` 目录
2. **数据验证**: 重要数据应进行交叉验证
3. **专业判断**: 这些工具只是辅助，不能替代专业判断
4. **持续更新**: 根据使用反馈持续改进
5. **团队协作**: 与团队成员共享和同步数据

## 🤝 贡献

欢迎提出改进建议和功能需求！

## 📞 支持

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 加入讨论组

## ⚖️ 免责声明

本工具集仅作为辅助工具，不能替代专业医疗判断。使用者应：
- 遵守当地法律法规
- 遵循医疗伦理规范
- 承担专业责任
- 保护患者隐私

---

**Made with ❤️ for Mental Health Professionals**
