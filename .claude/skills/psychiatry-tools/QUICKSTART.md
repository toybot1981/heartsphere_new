# 心理医生工具集 - 快速上手指南

## 🎯 工具集总览

这套工具集包含 6 个核心 Skill，覆盖心理治疗的主要场景：

### 工具清单

1. **patient-record** - 患者病历管理
2. **assessment-scale** - 心理评估量表
3. **emotion-analysis** - 情绪分析
4. **treatment-plan** - 治疗计划生成
5. **session-record** - 会话记录
6. **crisis-intervention** - 危机干预

---

## 📖 典型使用场景

### 场景 1：接诊新患者

```bash
# 步骤 1: 创建患者病历
/patient-record --action=create --data='{
  "name": "王小明",
  "age": 35,
  "gender": "男",
  "contact": "138****1234",
  "education": "本科",
  "occupation": "软件工程师"
}'

# 步骤 2: 进行初步评估
/assessment-scale --scale=phq9 --action=evaluate \
  --answers=[1,2,2,3,2,1,0,2,1] \
  --patientId=P001

/assessment-scale --scale=gad7 --action=evaluate \
  --answers=[1,2,1,2,1,1,0] \
  --patientId=P001

# 步骤 3: 生成治疗计划
/treatment-plan --action=create \
  --patientId=P001 \
  --diagnosis="抑郁症" \
  --severity=moderate \
  --goals=["改善睡眠","提高工作动力","减少自我批评"]
```

**预期输出：**
```
✅ 患者病历创建成功
   Patient ID: P001

✅ 评估完成
   PHQ-9: 14分 (中度抑郁)
   建议: 心理治疗或药物治疗

✅ 治疗计划创建成功
   - 急性期治疗: 6-12周
   - 巩固期治疗: 4-9个月
   - 维持期治疗: 1年以上
```

---

### 场景 2：记录治疗会话

```bash
# 第一次治疗会话
/session-record --action=create \
  --patientId=P001 \
  --chiefComplaint="失眠2周，情绪低落，兴趣减退" \
  --duration=50 \
  --mentalStatus='{
    "appearance": "衣着整洁，神情疲惫",
    "mood": "抑郁",
    "affect": "情感低落，反应迟钝",
    "speech": "语速缓慢，音量低",
    "thought": "思维迟缓，内容消极",
    "insight": "自知力存在"
  }' \
  --interventions='["支持性心理治疗","心理教育"]' \
  --homework="记录睡眠日记" \
  --recommendations="建议增加户外活动"
```

---

### 场景 3：分析情绪变化

```bash
# 记录情绪状态
/emotion-analysis --action=analyze \
  --text="今天感觉稍微好一点，能起来吃早饭了" \
  --patientId=P001

# 查看一周情绪趋势
/emotion-analysis --action=trends \
  --patientId=P001 \
  --period=7d

# 生成月度情绪报告
/emotion-analysis --action=report \
  --patientId=P001 \
  --period=30d
```

---

### 场景 4：危机处理

```bash
# 发现患者有自杀意念，立即评估
/crisis-intervention --action=assess \
  --patientId=P001 \
  --situation="患者说想死了算了，活着没意思" \
  --symptoms=["自杀意念","绝望感"]

# 如果风险等级为 high 或 critical，立即干预
/crisis-intervention --action=guide --riskLevel=critical

# 制定危机干预方案
/crisis-intervention --action=plan \
  --patientId=P001 \
  --riskLevel=critical

# 查看危机资源
/crisis-intervention --action=resources
```

---

### 场景 5：阶段性评估

```bash
# 生成会话摘要
/session-record --action=summary --patientId=P001

# 跟踪治疗进度
/treatment-plan --action=track --patientId=P001

# 重新评估
/assessment-scale --scale=phq9 --action=evaluate \
  --answers=[0,1,1,2,1,0,0,1,0] \
  --patientId=P001
```

---

## 💡 专业提示

### 1. 患者ID 管理
- 每个新患者会自动生成唯一 ID (如 P001, P002...)
- 建议在医院内部也使用相同的 ID
- 可以在病历中备注医院 ID

### 2. 数据安全
```bash
# 定期备份数据
cp -r .claude/data ~/backup/claude-data-$(date +%Y%m%d)

# 或使用 tar 打包
tar -czf claude-data-backup.tar.gz .claude/data/
```

### 3. 评估量表选择

| 情况 | 推荐量表 |
|------|---------|
| 抑郁症状筛查 | PHQ-9 |
| 焦虑症状筛查 | GAD-7 |
| 认知功能评估 | MMSE |
| 抑郁严重程度 | HAMD |

### 4. 治疗计划定制

根据患者具体情况调整：

```bash
# 轻度抑郁
/treatment-plan --action=create \
  --patientId=P001 \
  --diagnosis="抑郁症" \
  --severity=mild \
  --preferences={"medication":"avoid"}

# 重度抑郁（需要药物治疗）
/treatment-plan --action=create \
  --patientId=P002 \
  --diagnosis="抑郁症" \
  --severity=severe \
  --preferences={"medication":"preferred"}
```

---

## 📊 工作流程最佳实践

### 标准治疗流程

```
初次就诊
  ↓
1. 创建病历 → /patient-record --action=create
  ↓
2. 基线评估 → /assessment-scale --scale=phq9 --action=evaluate
  ↓
3. 制定计划 → /treatment-plan --action=create
  ↓
定期治疗（每周1-2次）
  ↓
4. 记录会话 → /session-record --action=create
5. 情绪跟踪 → /emotion-analysis --action=analyze
  ↓
每4-8周
  ↓
6. 阶段评估 → /session-record --action=summary
 7. 重新评估 → /assessment-scale --scale=phq9 --action=evaluate
 8. 调整计划 → /treatment-plan --action=update
  ↓
维持治疗
  ↓
9. 继续跟踪 → /emotion-analysis --action=trends
10. 预防复发 → 定期评估和支持
```

---

## 🆘 常见问题

### Q1: 如何查看所有患者？
```bash
/patient-record --action=list
```

### Q2: 如何查找某个患者的所有记录？
```bash
# 查看病历
/patient-record --action=view --patientId=P001

# 查看治疗计划
/treatment-plan --action=view --patientId=P001

# 查看会话记录
/session-record --action=list --patientId=P001

# 查看情绪趋势
/emotion-analysis --action=trends --patientId=P001
```

### Q3: 如何更新患者信息？
```bash
/patient-record --action=update \
  --patientId=P001 \
  --data='{"diagnosis":"抑郁症，广泛性焦虑障碍"}'
```

### Q4: 危机情况如何处理？
1. 立即评估风险
2. 获取应急指导
3. 制定干预方案
4. 联系紧急联系人
5. 必要时建议住院

---

## 🎓 学习资源

### 推荐阅读

- **PHQ-9 量表**: https://www.phqscreeners.com/
- **GAD-7 量表**: 焦虑障碍评估指南
- **CBT 技术**: 认知行为治疗实践
- **危机干预**: 自杀预防指南

### 专业培训

建议定期参加：
- 心理评估技能培训
- 危机干预培训
- 心理治疗技术培训

---

## 📞 技术支持

如有问题或建议：
1. 查看完整文档: `README.md`
2. 提交 Issue
3. 联系开发团队

---

**祝你使用愉快！为心理健康事业贡献力量！** ❤️
