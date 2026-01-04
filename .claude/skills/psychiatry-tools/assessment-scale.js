// .claude/skills/psychiatry-tools/assessment-scale.js
/**
 * 心理评估量表 Skill
 * 包含常用的心理评估量表：PHQ-9, GAD-7, MMSE, HAMD 等
 */

module.exports = {
  name: "assessment-scale",
  description: "心理评估量表工具 - 执行和评分各种心理评估量表",
  version: "1.0.0",
  author: "HeartSphere Psychiatry Team",

  args: {
    scale: {
      type: "string",
      required: true,
      description: "量表类型: phq9, gad7, mmse, hamd",
      enum: ["phq9", "gad7", "mmse", "hamd"]
    },
    action: {
      type: "string",
      default: "evaluate",
      description: "操作类型: evaluate (评分), view (查看量表), compare (历史对比), report (生成报告)",
      enum: ["evaluate", "view", "compare", "report"]
    },
    answers: {
      type: "array",
      description: "患者答案 (数组格式)"
    },
    patientId: {
      type: "string",
      description: "患者ID"
    },
    period: {
      type: "string",
      default: "30d",
      description: "对比周期: 7d, 30d, 90d"
    }
  },

  usage: `
    查看量表内容:
      /assessment-scale --scale=phq9 --action=view

    评分:
      /assessment-scale --scale=phq9 --action=evaluate --answers=[0,1,2,3,2,1,0,2,1] --patientId=P001

    历史对比:
      /assessment-scale --scale=phq9 --action=compare --patientId=P001 --period=30d

    生成可视化报告:
      /assessment-scale --scale=phq9 --action=report --patientId=P001 --period=90d
  `,

  run: async (args, context) => {
    const { scale, action, answers, patientId, period } = args;
    const { Read, Write, Glob } = context.tools;

    try {
      switch (action) {
        case "view":
          return viewScale(scale);

        case "evaluate":
          if (!answers || answers.length === 0) {
            throw new Error("答案不能为空");
          }
          return await evaluateScale(scale, answers, patientId, { Read, Write });

        case "compare":
          if (!patientId) {
            throw new Error("历史对比需要患者ID");
          }
          return await compareHistory(scale, patientId, period, { Glob, Read });

        case "report":
          if (!patientId) {
            throw new Error("生成报告需要患者ID");
          }
          return await generateReport(scale, patientId, period, { Glob, Read, Write });

        default:
          throw new Error(`未知的操作类型: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestion: getScaleErrorSuggestion(error.message)
      };
    }
  }
};

/**
 * 查看量表内容
 */
function viewScale(scale) {
  const scales = {
    phq9: {
      name: "PHQ-9 患者健康问卷-9",
      description: "用于筛查抑郁症状",
      questions: [
        "做事时没兴趣或没乐趣",
        "感到心情低落、沮丧或绝望",
        "入睡困难、睡不安稳或睡眠过多",
        "感到疲倦或没有活力",
        "食欲不振或吃得太多",
        "觉得自己很糟，或觉得自己很失败",
        "对事物专注有困难",
        "动作或说话速度缓慢到别人已经察觉，或相反烦躁或坐立不安",
        "有不如死掉或用某种方式伤害自己的念头"
      ],
      options: [
        { value: 0, text: "完全不会" },
        { value: 1, text: "好几天" },
        { value: 2, text: "一半以上的天数" },
        { value: 3, text: "几乎每天" }
      ]
    },

    gad7: {
      name: "GAD-7 广泛性焦虑障碍-7",
      description: "用于筛查焦虑症状",
      questions: [
        "感觉紧张、焦虑或急切",
        "不能停止或控制担忧",
        "对各种各样的事情担忧过多",
        "很难放松下来",
        "变得烦躁或坐立不安",
        "变得容易烦恼或急躁",
        "感到好像有什么可怕的事发生"
      ],
      options: [
        { value: 0, text: "完全不会" },
        { value: 1, text: "好几天" },
        { value: 2, text: "一半以上的天数" },
        { value: 3, text: "几乎每天" }
      ]
    },

    mmse: {
      name: "MMSE 简易精神状态检查量表",
      description: "用于评估认知功能",
      questions: [
        "定向力 (10分): 年份、季节、日期、星期、月份、国家、省份、城市、医院、楼层",
        "记忆力 (3分): 记住三个词语",
        "注意力和计算力 (5分): 计算 100-7=93-7=...",
        "回忆能力 (3分): 回忆之前记住的三个词语",
        "语言能力 (9分): 命名、复述、三步指令、阅读、书写、画图"
      ],
      options: [
        { value: 0, text: "错误" },
        { value: 1, text: "正确" }
      ]
    },

    hamd: {
      name: "HAMD 汉密尔顿抑郁量表",
      description: "用于评估抑郁严重程度",
      questions: [
        "抑郁情绪",
        "有罪感",
        "自杀",
        "入睡困难",
        "睡眠不深",
        "早醒",
        "工作和兴趣",
        "迟缓",
        "激越",
        "精神性焦虑",
        "躯体性焦虑",
        "胃肠道症状",
        "全身症状",
        "性症状",
        "疑病",
        "体重减轻",
        "自知力"
      ],
      options: [
        { value: 0, text: "无" },
        { value: 1, text: "轻度" },
        { value: 2, text: "中度" },
        { value: 3, text: "重度" },
        { value: 4, text: "极重度" }
      ]
    }
  };

  const selectedScale = scales[scale];
  if (!selectedScale) {
    throw new Error(`未知的量表类型: ${scale}`);
  }

  return {
    success: true,
    data: selectedScale
  };
}

/**
 * 评分量表
 */
async function evaluateScale(scale, answers, patientId, { Read, Write }) {
  let result;

  switch (scale) {
    case "phq9":
      result = evaluatePHQ9(answers);
      break;
    case "gad7":
      result = evaluateGAD7(answers);
      break;
    case "mmse":
      result = evaluateMMSE(answers);
      break;
    case "hamd":
      result = evaluateHAMD(answers);
      break;
    default:
      throw new Error(`未知的量表类型: ${scale}`);
  }

  // 如果提供了患者ID，保存评估结果
  if (patientId) {
    await saveAssessmentResult(patientId, scale, result, { Read, Write });
  }

  return {
    success: true,
    message: "评分完成",
    data: result
  };
}

/**
 * PHQ-9 评分
 */
function evaluatePHQ9(answers) {
  if (answers.length !== 9) {
    throw new Error("PHQ-9 需要9个答案");
  }

  const totalScore = answers.reduce((sum, ans) => sum + ans, 0);

  let severity;
  let recommendation;

  if (totalScore <= 4) {
    severity = "无抑郁";
    recommendation = "继续观察";
  } else if (totalScore <= 9) {
    severity = "轻度抑郁";
    recommendation = "建议心理教育和随访";
  } else if (totalScore <= 14) {
    severity = "中度抑郁";
    recommendation = "建议心理治疗或药物治疗";
  } else if (totalScore <= 19) {
    severity = "中重度抑郁";
    recommendation = "建议药物治疗和心理治疗";
  } else {
    severity = "重度抑郁";
    recommendation = "建议立即药物治疗和密切随访";

    // 检查自杀风险
    if (answers[8] >= 2) {
      recommendation += " - ⚠️ 存在自杀风险，需要紧急干预";
    }
  }

  return {
    scale: "PHQ-9",
    totalScore,
    maxScore: 27,
    severity,
    recommendation,
    answers,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * GAD-7 评分
 */
function evaluateGAD7(answers) {
  if (answers.length !== 7) {
    throw new Error("GAD-7 需要7个答案");
  }

  const totalScore = answers.reduce((sum, ans) => sum + ans, 0);

  let severity;
  let recommendation;

  if (totalScore <= 4) {
    severity = "无焦虑";
    recommendation = "继续观察";
  } else if (totalScore <= 9) {
    severity = "轻度焦虑";
    recommendation = "建议心理教育和随访";
  } else if (totalScore <= 14) {
    severity = "中度焦虑";
    recommendation = "建议心理治疗或药物治疗";
  } else {
    severity = "重度焦虑";
    recommendation = "建议药物治疗和心理治疗";
  }

  return {
    scale: "GAD-7",
    totalScore,
    maxScore: 21,
    severity,
    recommendation,
    answers,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * MMSE 评分
 */
function evaluateMMSE(answers) {
  const totalScore = answers.reduce((sum, ans) => sum + ans, 0);

  let cognitiveLevel;
  let recommendation;

  if (totalScore >= 27) {
    cognitiveLevel = "认知功能正常";
    recommendation = "无需干预";
  } else if (totalScore >= 21) {
    cognitiveLevel = "轻度认知障碍";
    recommendation = "建议进一步评估";
  } else if (totalScore >= 10) {
    cognitiveLevel = "中度认知障碍";
    recommendation = "建议专业评估和干预";
  } else {
    cognitiveLevel = "重度认知障碍";
    recommendation = "需要专业医疗护理";
  }

  return {
    scale: "MMSE",
    totalScore,
    maxScore: 30,
    cognitiveLevel,
    recommendation,
    answers,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * HAMD 评分
 */
function evaluateHAMD(answers) {
  if (answers.length !== 17) {
    throw new Error("HAMD 需要17个答案");
  }

  const totalScore = answers.reduce((sum, ans) => sum + ans, 0);

  let severity;
  let recommendation;

  if (totalScore <= 7) {
    severity = "无抑郁";
    recommendation = "继续观察";
  } else if (totalScore <= 17) {
    severity = "轻度抑郁";
    recommendation = "建议心理治疗";
  } else if (totalScore <= 24) {
    severity = "中度抑郁";
    recommendation = "建议药物治疗";
  } else {
    severity = "重度抑郁";
    recommendation = "建议立即药物治疗和密切随访";
  }

  return {
    scale: "HAMD",
    totalScore,
    maxScore: 52,
    severity,
    recommendation,
    answers,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * 保存评估结果
 */
async function saveAssessmentResult(patientId, scale, result, { Read, Write }) {
  const assessmentsDir = ".claude/data/assessments";
  const filePath = `${assessmentsDir}/${patientId}-${scale}-${Date.now()}.json`;

  const assessment = {
    patientId,
    scale,
    result,
    createdAt: new Date().toISOString()
  };

  await Write(filePath, JSON.stringify(assessment, null, 2));

  return assessment;
}

/**
 * 历史对比
 */
async function compareHistory(scale, patientId, period, { Glob, Read }) {
  const assessmentsDir = ".claude/data/assessments";

  // 获取历史评估记录
  const files = await Glob(`${assessmentsDir}/${patientId}-${scale}-*.json`);

  if (files.length === 0) {
    return {
      success: true,
      message: "暂无历史评估记录",
      data: { history: [], trend: "no-data" }
    };
  }

  // 读取并解析所有评估
  const assessments = await Promise.all(
    files.map(async (file) => {
      const content = await Read(file);
      return JSON.parse(content);
    })
  );

  // 按时间排序
  assessments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // 过滤周期内的记录
  const periodMs = parsePeriod(period);
  const now = Date.now();
  const recentAssessments = assessments.filter(
    a => now - new Date(a.createdAt).getTime() <= periodMs
  );

  if (recentAssessments.length < 2) {
    return {
      success: true,
      message: `需要至少2次评估才能对比，当前只有${recentAssessments.length}次`,
      data: {
        history: recentAssessments,
        trend: "insufficient-data"
      }
    };
  }

  // 计算趋势
  const first = recentAssessments[0].result;
  const last = recentAssessments[recentAssessments.length - 1].result;
  const change = last.totalScore - first.totalScore;
  const changePercent = first.totalScore > 0
    ? ((change / first.totalScore) * 100).toFixed(1)
    : 0;

  let trend, trendDescription;
  if (scale === "phq9" || scale === "hamd") {
    // 抑郁量表：分数降低为好转
    if (change < -5) {
      trend = "improving";
      trendDescription = "明显好转";
    } else if (change < -2) {
      trend = "slight-improving";
      trendDescription = "有所好转";
    } else if (change > 5) {
      trend = "deteriorating";
      trendDescription = "明显恶化";
    } else if (change > 2) {
      trend = "slight-deteriorating";
      trendDescription = "有所恶化";
    } else {
      trend = "stable";
      trendDescription = "基本稳定";
    }
  } else {
    // 其他量表：根据具体情况判断
    if (Math.abs(change) <= 2) {
      trend = "stable";
      trendDescription = "基本稳定";
    } else {
      trend = change > 0 ? "changed" : "changed";
      trendDescription = change > 0 ? "评分上升" : "评分下降";
    }
  }

  return {
    success: true,
    message: `对比完成：${trendDescription}`,
    data: {
      period,
      history: recentAssessments,
      trend,
      trendDescription,
      change,
      changePercent,
      firstScore: first.totalScore,
      lastScore: last.totalScore,
      assessmentCount: recentAssessments.length
    }
  };
}

/**
 * 生成可视化报告
 */
async function generateReport(scale, patientId, period, { Glob, Read, Write }) {
  // 获取对比数据
  const compareResult = await compareHistory(scale, patientId, period, { Glob, Read });

  if (!compareResult.success) {
    throw new Error("无法生成报告");
  }

  const { history, trend, trendDescription, changePercent, assessmentCount } = compareResult.data;

  // 生成 Markdown 报告
  let report = `# ${getScaleFullName(scale)} 评估报告\n\n`;
  report += `**患者ID**: ${patientId}\n`;
  report += `**报告生成时间**: ${new Date().toLocaleString()}\n`;
  report += `**分析周期**: ${period}\n`;
  report += `**评估次数**: ${assessmentCount}\n\n`;

  // 总体趋势
  report += `## 📊 总体趋势\n\n`;
  report += `${getTrendEmoji(trend)} **${trendDescription}**`;
  if (changePercent && changePercent !== "0") {
    const changeNum = parseFloat(changePercent);
    report += ` (${changeNum > 0 ? '+' : ''}${changePercent}%)`;
  }
  report += `\n\n`;

  // 历史记录
  report += `## 📋 评估历史\n\n`;
  report += `| 日期 | 评分 | 严重程度 |\n`;
  report += `|------|------|----------|\n`;

  history.forEach(assessment => {
    const date = new Date(assessment.createdAt).toLocaleDateString();
    const score = assessment.result.totalScore;
    const severity = assessment.result.severity || assessment.result.cognitiveLevel || "未知";
    report += `| ${date} | ${score} | ${severity} |\n`;
  });

  // 详细分析
  if (history.length >= 2) {
    report += `\n## 📈 详细分析\n\n`;

    const first = history[0].result;
    const last = history[history.length - 1].result;

    report += `### 评分变化\n`;
    report += `- 首次评分: ${first.totalScore}\n`;
    report += `- 最新评分: ${last.totalScore}\n`;
    report += `- 变化: ${last.totalScore - first.totalScore > 0 ? '+' : ''}${last.totalScore - first.totalScore}\n\n`;

    // 建议
    report += `### 💡 建议\n\n`;
    report += generateTrendSuggestions(scale, trend, last.totalScore);
  }

  // 保存报告
  const reportsDir = ".claude/data/reports";
  const reportPath = `${reportsDir}/${patientId}-${scale}-report-${Date.now()}.md`;
  await Write(reportPath, report);

  return {
    success: true,
    message: "评估报告已生成",
    data: {
      reportPath,
      report
    }
  };
}

/**
 * 解析周期
 */
function parsePeriod(period) {
  const units = {
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000
  };

  const match = period.match(/^(\d+)([dwM])$/);
  if (!match) {
    return 30 * 24 * 60 * 60 * 1000; // 默认30天
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  return value * (units[unit] || units.d);
}

/**
 * 获取量表全名
 */
function getScaleFullName(scale) {
  const names = {
    phq9: "PHQ-9 抑郁筛查",
    gad7: "GAD-7 焦虑筛查",
    mmse: "MMSE 认知功能",
    hamd: "HAMD 抑郁严重程度"
  };
  return names[scale] || scale;
}

/**
 * 获取趋势图标
 */
function getTrendEmoji(trend) {
  const emojis = {
    improving: "✅",
    "slight-improving": "🙂",
    stable: "⚖️",
    "slight-deteriorating": "😟",
    deteriorating: "⚠️",
    "no-data": "❓",
    "insufficient-data": "📊"
  };
  return emojis[trend] || "📋";
}

/**
 * 生成趋势建议
 */
function generateTrendSuggestions(scale, trend, currentScore) {
  let suggestions = "";

  if (trend === "improving") {
    suggestions += "- ✅ 继续当前治疗方案，保持良好进展\n";
    suggestions += "- 定期监测，预防复发\n";
    suggestions += "- 逐步恢复社会功能\n";
  } else if (trend === "slight-improving") {
    suggestions += "- 继续当前治疗，观察进展\n";
    suggestions += "- 考虑增加支持性干预\n";
  } else if (trend === "stable") {
    suggestions += "- 评估当前方案有效性\n";
    suggestions += "- 考虑调整治疗策略\n";
    suggestions += "- 寻找突破口\n";
  } else if (trend === "deteriorating" || trend === "slight-deteriorating") {
    suggestions += "- ⚠️ 需要重新评估诊断和治疗方案\n";
    suggestions += "- 考虑增加药物剂量或更换药物\n";
    suggestions += "- 增加治疗频率\n";
    suggestions += "- 评估危机风险\n";
  }

  return suggestions;
}

/**
 * 获取错误建议
 */
function getScaleErrorSuggestion(errorMessage) {
  const suggestions = {
    "答案不能为空": "请提供量表答案数组",
    "PHQ-9 需要9个答案": "PHQ-9 量表需要9个问题答案，每个答案0-3分",
    "GAD-7 需要7个答案": "GAD-7 量表需要7个问题答案，每个答案0-3分",
    "HAMD 需要17个答案": "HAMD 量表需要17个问题答案，每个答案0-4分",
    "历史对比需要患者ID": "请提供患者ID以查看历史记录",
    "生成报告需要患者ID": "请提供患者ID以生成报告"
  };

  return suggestions[errorMessage] || "请检查输入参数";
}
