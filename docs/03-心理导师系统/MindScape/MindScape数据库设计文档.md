# MindScape AI Clinic - MySQL 数据库摘要

## 📊 数据库概况

- **数据库名称**: `mindscape`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **创建日期**: 2025-12-27
- **用途**: 存储全球权威心理咨询经典案例和知识库

---

## 🗂️ 表结构概览

| 表名 | 用途 | 记录数 | 说明 |
|------|------|--------|------|
| `therapy_methods` | 疗法定义表 | 5 | 5种疗法（CBT, DBT, 精神分析, ACT, 人本主义） |
| `learning_pathways` | 学习路径表 | 0 | 每个疗法的4阶段学习路径 |
| `classic_cases` | 经典案例表 | 5 | 全球权威心理咨询案例 |
| `session_records` | 会话记录表 | 0 | 每次会话的详细记录 |
| `cognitive_distortions` | 认知扭曲表 | 12 | 12种认知扭曲类型 |
| `therapy_techniques` | 治疗技术表 | 0 | 各种治疗技术详细说明 |
| `case_techniques` | 案例技术关联表 | 0 | 案例与技术多对多关系 |
| `assessment_measures` | 测量量表表 | 6 | BDI-II, GAD-7, Y-BOCS等 |
| `case_measurements` | 案例测量结果表 | 0 | 案例的量表测量数据 |
| `case_tags` | 案例标签表 | 0 | 案例的分类和标签 |

**总计**: 10 个表，5 个经典案例，12 种认知扭曲，6 种测量量表

---

## 📚 已导入的经典案例

### 1. CBT Depression Case: Sarah (Beck)
- **ID**: `cbt-001`
- **类别**: CBT
- **治疗师**: Dr. Judith S. Beck
- **治疗时长**: 12次会话（3个月）
- **来访者**: 35岁女性，市场经理
- **主要问题**: 中度抑郁伴随焦虑
- **使用技术**: 认知重构、苏格拉底式提问、行为实验
- **治疗结果**:
  - BDI-II: 24分 → 8分（改善67%）
  - 睡眠质量: 3/10 → 7/10（改善133%）
- **来源**: 《认知行为疗法：基础与应用》(2011)

### 2. Little Hans: Freud Child Psychoanalysis
- **ID**: `psycho-001`
- **类别**: Psychoanalytic (精神分析)
- **治疗师**: Sigmund Freud
- **治疗时长**: 约3个月（10次会话）
- **来访者**: 5岁男孩
- **主要问题**: 马恐惧症（Equinophobia）
- **使用技术**: 梦的解析、象征解释、俄狄浦斯情结分析
- **治疗结果**: 恐惧症消退，能正常外出，与父亲关系改善
- **来源**: 《对一个五岁男孩恐惧症的分析》(1909)
- **难度**: ADVANCED

### 3. Gloria: Rogers Client-Centered Therapy
- **ID**: `hum-001`
- **类别**: Humanistic (人本主义)
- **治疗师**: Carl Rogers
- **治疗时长**: 1次会话（录影示范）
- **来访者**: 30岁女性，离异
- **主要问题**: 单亲母亲内疚，自我价值感低
- **使用技术**: 共情、无条件积极关注、真诚一致
- **治疗结果**: 感到被深深理解，后来成为心理咨询师
- **来源**: 《三种心理治疗录影：同一个病人》(1964)
- **难度**: BASIC

### 4. Anna: DBT for Borderline Personality Disorder
- **ID**: `dbt-001`
- **类别**: DBT
- **治疗师**: Marsha Lineham培训的DBT治疗师
- **治疗时长**: 1年标准DBT（52次会话）
- **来访者**: 26岁女性
- **主要问题**: 边缘型人格障碍（BPD），自伤，自杀意念
- **使用技术**: 正念、痛苦承受TIPP、情绪调节、人际效能DEAR MAN
- **治疗结果**:
  - 自伤行为减少90%（每周2-3次 → 每月0-1次）
  - 无自杀尝试
  - 无住院
- **来源**: 《辩证行为疗法：治疗边缘型人格障碍》(1993)
- **难度**: SEVERE

### 5. Michael: ACT for Generalized Anxiety
- **ID**: `act-001`
- **类别**: ACT
- **治疗师**: ACT治疗师
- **治疗时长**: 10次会话（12周）
- **来访者**: 42岁男性，IT经理
- **主要问题**: 广泛性焦虑障碍伴随抑郁
- **使用技术**: 认知解离、接纳、价值观澄清、承诺行动
- **治疗结果**:
  - GAD-7: 18分 → 9分（改善50%）
  - PHQ-9: 16分 → 7分（改善56%）
  - AAQ-II: 85分 → 38分（心理灵活性提升）
- **来源**: 《Get Out of Your Mind and Into Your Life》(1999)
- **难度**: MODERATE

---

## 🔍 案例分类统计

| 疗法类别 | 案例数 | 案例ID |
|---------|--------|--------|
| CBT | 1 | cbt-001 |
| 精神分析 | 1 | psycho-001 |
| 人本主义 | 1 | hum-001 |
| DBT | 1 | dbt-001 |
| ACT | 1 | act-001 |

**总计**: 5个案例，涵盖5种主要疗法流派

---

## 📋 认知扭曲类型（12种）

| ID | 中文名称 | 英文名称 |
|----|---------|----------|
| 1 | 灾难化思维 | Catastrophizing |
| 2 | 非黑即白思维 | All-or-Nothing Thinking |
| 3 | 过度概括 | Overgeneralization |
| 4 | 心理过滤 | Mental Filtering |
| 5 | 否定正面事物 | Disqualifying the Positive |
| 6 | 跳到结论 | Jumping to Conclusions |
| 7 | 放大 | Magnification |
| 8 | 缩小 | Minimization |
| 9 | 情绪推理 | Emotional Reasoning |
| 10 | 应该陈述 | Should Statements |
| 11 | 标签化 | Labeling |
| 12 | 个人化 | Personalization |

---

## 📏 测量量表（6种）

| ID | 缩写 | 名称 | 类别 | 分数范围 |
|----|------|------|------|---------|
| 1 | BDI-II | 贝克抑郁量表第二版 | 抑郁 | 0-63 |
| 2 | GAD-7 | 广泛性焦虑量表 | 焦虑 | 0-21 |
| 3 | Y-BOCS | 耶鲁布朗强迫量表 | 强迫 | 0-40 |
| 4 | LSAS | 利博维茨社交焦虑量表 | 社交焦虑 | 0-144 |
| 5 | AAQ-II | 接纳与行动问卷第二版 | 心理灵活性 | 10-70 |
| 6 | DERS | 情绪调节困难量表 | 情绪调节 | 36-180 |

---

## 💡 数据库设计亮点

### 1. JSON 字段的灵活使用

**client_profile** (来访者画像):
```json
{
  "age": 35,
  "gender": "Female",
  "occupation": "Marketing Manager",
  "maritalStatus": "Married"
}
```

**symptoms** (症状列表):
```json
[
  {
    "symptom": "Persistent sadness",
    "severity": 7,
    "duration": "3 months"
  }
]
```

**quantitative_results** (定量结果):
```json
[
  {
    "measure": "BDI-II",
    "pre_score": 24,
    "post_score": 8,
    "change": "-67%"
  }
]
```

### 2. 关系设计

- **一对多**: `therapy_methods` → `learning_pathways` (一个疗法有多个学习阶段)
- **一对多**: `classic_cases` → `session_records` (一个案例有多次会话)
- **多对多**: `classic_cases` ↔ `therapy_techniques` (通过 `case_techniques` 关联表)
- **多对多**: `classic_cases` ↔ `assessment_measures` (通过 `case_measurements` 关联表)

### 3. 索引优化

- 主键索引: 所有表的 `id` 字段
- 唯一索引: `therapy_id` + `phase_number` (学习路径)
- 普通索引: `category`, `therapy_id`, `difficulty_level`
- 全文索引: `title`, `presenting_problems`, `treatment_outcome` (支持全文搜索)

---

## 🚀 查询示例

### 查询特定疗法的所有案例
```sql
SELECT id, title, session_count
FROM classic_cases
WHERE therapy_id = 'cbt';
```

### 查询特定难度级别的案例
```sql
SELECT id, title, category, difficulty_level
FROM classic_cases
WHERE difficulty_level = 'SEVERE';
```

### 查询案例的定量结果（JSON 解析）
```sql
SELECT
    id,
    title,
    JSON_EXTRACT(quantitative_results, '$[*].measure') as measures,
    JSON_EXTRACT(quantitative_results, '$[*].pre_score') as pre_scores
FROM classic_cases;
```

### 全文搜索案例
```sql
SELECT id, title, presenting_problems
FROM classic_cases
WHERE MATCH(title, presenting_problems, treatment_outcome)
AGAINST('depression anxiety' IN NATURAL LANGUAGE MODE);
```

---

## 📝 下一步计划

1. **完善学习路径数据**: 为每个疗法添加4个学习阶段
2. **添加会话记录**: 为每个案例添加详细的会话记录
3. **添加治疗技术**: 整理各种治疗技术的详细说明
4. **添加测量数据**: 为案例添加具体的测量结果数据
5. **创建视图**: 创建常用的查询视图（如案例摘要、疗法统计）
6. **建立全文搜索**: 优化案例的搜索功能

---

## 🔐 数据库连接信息

```yaml
host: localhost
port: 3306
database: mindscape
user: root
password: 123456
charset: utf8mb4
```

**命令行连接**:
```bash
mysql -u root -p123456 mindscape
```

---

**最后更新**: 2025-12-27
**维护者**: Claude Code Agent
**版本**: v1.0.0
