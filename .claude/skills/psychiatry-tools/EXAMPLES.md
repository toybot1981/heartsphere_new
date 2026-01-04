# 完整治疗案例示例

## 案例：抑郁症患者的完整治疗过程

### 患者背景
- 姓名：李明
- 年龄：32岁
- 性别：男
- 职业：IT工程师
- 主诉：情绪低落、失眠、工作效率下降2个月

---

## 第1次就诊：初次评估

### 1. 创建患者病历

```bash
/patient-record --action=create --data='{
  "name": "李明",
  "age": 32,
  "gender": "男",
  "contact": "138****8888",
  "education": "硕士",
  "occupation": "IT工程师",
  "maritalStatus": "已婚",
  "chiefComplaint": "情绪低落、失眠2个月",
  "presentIllness": "患者2个月前因工作压力增大，逐渐出现情绪低落，兴趣减退，入睡困难，早醒，工作效率明显下降。食欲减退，体重下降约3kg。曾有"活着没意思"的想法，但无自杀计划。",
  "pastHistory": "无重大躯体疾病史，无精神疾病史，无药物过敏史。",
  "familyHistory": "母亲有抑郁症史。",
  "socialHistory": "不吸烟，偶尔饮酒，已婚，育有一子。",
  "diagnosis": "抑郁症（中度）",
  "status": "active"
}'
```

**输出：**
```json
{
  "success": true,
  "message": "患者病历创建成功",
  "data": {
    "patientId": "P001",
    "record": {
      "name": "李明",
      "age": 32,
      "diagnosis": "抑郁症（中度）",
      "status": "active"
    }
  }
}
```

### 2. 心理评估

```bash
# PHQ-9 抑郁评估
/assessment-scale --scale=phq9 --action=evaluate \
  --answers=[2,2,1,2,2,1,0,2,1] \
  --patientId=P001
```

**结果：**
```json
{
  "scale": "PHQ-9",
  "totalScore": 13,
  "maxScore": 27,
  "severity": "中度抑郁",
  "recommendation": "建议心理治疗或药物治疗"
}
```

```bash
# GAD-7 焦虑评估
/assessment-scale --scale=gad7 --action=evaluate \
  --answers=[1,1,1,2,1,0,0] \
  --patientId=P001
```

**结果：**
```json
{
  "scale": "GAD-7",
  "totalScore": 6,
  "severity": "轻度焦虑"
}
```

### 3. 创建治疗计划

```bash
/treatment-plan --action=create \
  --patientId=P001 \
  --diagnosis="抑郁症" \
  --severity=moderate \
  --goals='[
    "改善睡眠质量",
    "提高情绪状态",
    "恢复工作功能",
    "减少自我负面评价"
  ]' \
  --preferences='{
    "medication": "open",
    "psychotherapy": "preferred",
    "frequency": "weekly"
  }'
```

**生成的治疗计划包括：**
- **急性期治疗** (6-12周)
  - 药物治疗: SSRIs
  - 心理治疗: CBT 每周1次
  - 生活方式干预: 睡眠卫生、运动、社交
- **巩固期治疗** (4-9个月)
- **维持期治疗** (1年以上)

### 4. 记录第一次会话

```bash
/session-record --action=create \
  --patientId=P001 \
  --chiefComplaint="情绪低落、失眠2个月" \
  --duration=50 \
  --mentalStatus='{
    "appearance": "衣着整洁，表情忧郁，目光接触减少",
    "behavior": "动作减少，反应迟缓",
    "speech": "语速缓慢，音量偏低",
    "mood": "抑郁",
    "affect": "情感低落，范围狭窄",
    "thought": "思维迟缓，内容以消极为主，无明显妄想",
    "perception": "未查及幻觉",
    "cognition": "注意力不集中，记忆力下降",
    "insight": "自知力存在，主动求医",
    "judgment": "存在"
  }' \
  --interventions='[
    "建立治疗关系",
    "心理教育（抑郁症）",
    "支持性心理治疗",
    "睡眠卫生指导"
  ]' \
  --homework="记录睡眠日记，每天记录睡眠时间、质量和白天情绪" \
  --recommendations="建议适当户外活动，避免独处" \
  --observations="患者有治疗动机，家庭支持良好" \
  --sessionRating=3 \
  --nextAppointment="1周后"
```

---

## 第2次就诊（1周后）：症状改善

### 情绪分析

```bash
/emotion-analysis --action=analyze \
  --text="这周稍微好一点，药开始吃了，晚上能睡着了，但还是没什么动力" \
  --patientId=P001
```

**结果：**
```json
{
  "primaryEmotion": "depression",
  "intensity": "medium",
  "detectedEmotions": [
    { "emotion": "depression", "count": 2 },
    { "emotion": "calm", "count": 1 }
  ],
  "riskLevel": "low"
}
```

### 会话记录

```bash
/session-record --action=create \
  --patientId=P001 \
  --chiefComplaint="睡眠改善，动力仍不足" \
  --duration=50 \
  --mentalStatus='{
    "mood": "抑郁，略有好转",
    "affect": "情感反应略有增强"
  }' \
  --interventions='[
    "评估药物反应",
    "认知行为治疗（识别负面思维）",
    "行为激活（制定活动计划）"
  ]' \
  --homework="每日进行至少一项愉快活动，记录感受" \
  --recommendations="继续药物治疗，增加日间活动" \
  --sessionRating=4 \
  --nextAppointment="1周后"
```

---

## 第4次就诊（1个月）：阶段性评估

### 重新评估

```bash
/assessment-scale --scale=phq9 --action=evaluate \
  --answers=[1,1,0,1,1,0,0,1,0] \
  --patientId=P001
```

**结果：**
```json
{
  "totalScore": 5,
  "severity": "轻度抑郁",
  "recommendation": "建议继续当前治疗"
}
```

### 生成会话摘要

```bash
/session-record --action=summary --patientId=P001
```

**摘要包括：**
- 会话次数：4次
- 总时长：200分钟
- 主诉变化：从"重度症状"到"轻度症状"
- 干预措施统计
- 进展评估：**改善中**
- 建议：继续当前治疗，6周后再次评估

### 情绪趋势

```bash
/emotion-analysis --action=trends --patientId=P001 --period=30d
```

**趋势图：**
- 第1周: depression (high)
- 第2周: depression (medium)
- 第3周: depression (medium-low)
- 第4周: calm (increasing)

**总体趋势：** 改善中 📈

---

## 第12次就诊（3个月）：进入巩固期

### 情绪报告

```bash
/emotion-analysis --action=report \
  --patientId=P001 \
  --period=90d
```

**报告要点：**
- 抑郁情绪明显减轻
- 睡眠质量改善
- 工作能力恢复
- 社交活动增加
- **总体评估：** 疗效显著

### 更新治疗计划

```bash
/treatment-plan --action=update \
  --patientId=P001 \
  --goals='[
    "巩固疗效",
    "预防复发",
    "提高生活质量"
  ]'
```

**调整：**
- 进入巩固期治疗
- 会话频率：每2周1次
- 继续药物治疗
- 重点转向预防复发

---

## 特殊情况：危机干预

假设患者在第6次就诊时提到自杀想法：

### 立即评估

```bash
/crisis-intervention --action=assess \
  --patientId=P001 \
  --situation="最近压力很大，有时候想不如死了算了" \
  --symptoms=["绝望感","自杀意念"]
```

**评估结果：**
```json
{
  "riskLevel": "high",
  "urgency": "24小时内",
  "totalScore": 12,
  "recommendation": "需要密切监测，考虑提高治疗强度"
}
```

### 应急指导

```bash
/crisis-intervention --action=guide --riskLevel=high
```

**指导包括：**
- ⚠️ 24小时内安排评估
- 📞 立即联系患者和家属
- 🏠 评估居家安全性
- 💊 调整药物方案
- 📋 制定安全计划

### 干预方案

```bash
/crisis-intervention --action=plan \
  --patientId=P001 \
  --riskLevel=high
```

**方案要点：**
- 每周2-3次会面
- 加强药物治疗
- 家庭参与治疗
- 24小时危机热线
- 定期风险评估

---

## 随访（6个月后）

### 最终评估

```bash
/assessment-scale --scale=phq9 --action=evaluate \
  --answers=[0,0,0,1,0,0,0,0,0] \
  --patientId=P001
```

**结果：**
```json
{
  "totalScore": 1,
  "severity": "无抑郁",
  "recommendation": "继续观察"
}
```

### 生成完整报告

所有工具的综合使用，生成完整的治疗报告：

```bash
# 患者基本信息
/patient-record --action=view --patientId=P001

# 治疗计划
/treatment-plan --action=view --patientId=P001

# 所有会话记录
/session-record --action=list --patientId=P001

# 情绪趋势
/emotion-analysis --action=trends --patientId=P001 --period=180d

# 情绪报告
/emotion-analysis --action=report --patientId=P001 --period=180d
```

**治疗结果：**
- ✅ 症状完全缓解
- ✅ 社会功能恢复
- ✅ 无自杀风险
- ✅ 进入维持期治疗
- ✅ 继续预防复发

---

## 💡 治疗要点总结

### 成功因素

1. **早期识别和干预**
2. **药物治疗 + 心理治疗**
3. **家庭支持良好**
4. **患者依从性好**
5. **定期评估和调整**

### 关键干预

- **药物治疗**: SSRIs，稳定剂量
- **心理治疗**: CBT，重点在于认知重构和行为激活
- **家庭干预**: 心理教育，支持性指导
- **危机处理**: 及时评估，积极干预
- **维持治疗**: 预防复发

### 经验教训

1. 定期评估很重要（每4-8周）
2. 关注自杀风险（每次会话都评估）
3. 家属参与可以提高疗效
4. 恢复期需要预防复发
5. 治疗关系是疗效的关键

---

## 📊 数据统计

整个治疗过程的数据：

- **治疗时长**: 6个月
- **总会话次数**: 24次
- **PHQ-9 评分变化**: 13 → 5 → 1
- **情绪趋势**: 持续改善
- **危机事件**: 1次（成功处理）
- **治疗结果**: 完全缓解

---

**这就是一个完整的抑郁症治疗案例！**
