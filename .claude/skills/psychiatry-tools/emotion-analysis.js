// .claude/skills/psychiatry-tools/emotion-analysis.js
/**
 * 情绪分析 Skill
 * 分析患者的情绪状态和情绪变化趋势
 */

module.exports = {
  name: "emotion-analysis",
  description: "情绪分析工具 - 分析患者情绪状态、识别情绪模式、生成情绪报告",
  version: "1.0.0",
  author: "HeartSphere Psychiatry Team",

  args: {
    action: {
      type: "string",
      required: true,
      description: "操作类型: analyze, trends, report",
      enum: ["analyze", "trends", "report"]
    },
    patientId: {
      type: "string",
      description: "患者ID"
    },
    text: {
      type: "string",
      description: "待分析的文本内容"
    },
    period: {
      type: "string",
      default: "7d",
      description: "分析周期: 1d, 7d, 30d, 90d"
    }
  },

  usage: `
    分析文本情绪:
      /emotion-analysis --action=analyze --text="我今天感觉很糟糕，什么都不想做" --patientId=P001

    查看情绪趋势:
      /emotion-analysis --action=trends --patientId=P001 --period=7d

    生成情绪报告:
      /emotion-analysis --action=report --patientId=P001 --period=30d
  `,

  run: async (args, context) => {
    const { action, patientId, text, period } = args;
    const { Read, Write, Glob } = context.tools;

    try {
      switch (action) {
        case "analyze":
          return await analyzeEmotion(text, patientId, { Write });
        case "trends":
          return await analyzeTrends(patientId, period, { Glob, Read });
        case "report":
          return await generateReport(patientId, period, { Glob, Read, Write });
        default:
          throw new Error(`未知的操作类型: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
};

/**
 * 分析文本中的情绪
 */
async function analyzeEmotion(text, patientId, { Write }) {
  if (!text) {
    throw new Error("分析文本不能为空");
  }

  // 增强的情绪词典（支持语境和程度）
  const emotionDictionary = {
    // 积极情绪
    joy: {
      keywords: ["开心", "快乐", "高兴", "愉快", "幸福", "兴奋", "满足", "舒适", "欢乐", "愉悦"],
      context: ["感觉", "觉得", "心情", "情绪"],
      weight: 1.0
    },
    hope: {
      keywords: ["希望", "期待", "憧憬", "向往", "盼望", "信心", "相信", "期待"],
      context: ["对", "有", "抱有"],
      weight: 1.2
    },
    calm: {
      keywords: ["平静", "安宁", "放松", "轻松", "宁静", "安稳", "舒适", "坦然"],
      context: ["感觉", "心情", "保持"],
      weight: 1.0
    },

    // 消极情绪
    sadness: {
      keywords: ["难过", "悲伤", "沮丧", "痛苦", "伤心", "哭泣", "失望", "痛苦", "哀伤"],
      context: ["感到", "觉得", "非常", "特别"],
      weight: 1.0
    },
    anxiety: {
      keywords: ["焦虑", "紧张", "担心", "害怕", "恐惧", "不安", "惊慌", "忧虑", "担忧"],
      context: ["感到", "觉得", "非常", "特别", "越来越"],
      weight: 1.3
    },
    anger: {
      keywords: ["生气", "愤怒", "恼火", "气愤", "烦躁", "愤怒", "生气"],
      context: ["感到", "觉得", "非常", "特别"],
      weight: 1.2
    },
    depression: {
      keywords: ["抑郁", "绝望", "无助", "空虚", "无意义", "不想活", "想死", "绝望"],
      context: ["感到", "觉得", "越来越", "非常"],
      weight: 1.5
    },
    guilt: {
      keywords: ["内疚", "羞愧", "自责", "后悔", "过错", "对不起"],
      context: ["感到", "觉得", "非常"],
      weight: 1.1
    },
    shame: {
      keywords: ["羞耻", "羞愧", "丢脸", "没面子", "尴尬"],
      context: ["感到", "觉得"],
      weight: 1.2
    }
  };

  // 程度副词
  const intensityModifiers = {
    "非常": 2.0,
    "特别": 2.0,
    "极其": 2.5,
    "超级": 2.0,
    "太": 1.8,
    "很": 1.5,
    "有点": 0.7,
    "稍微": 0.6,
    "还算": 0.8
  };

  // 检测情绪关键词并计算得分
  const detectedEmotions = [];
  const emotionScores = {};
  const textLower = text.toLowerCase();

  for (const [emotion, config] of Object.entries(emotionDictionary)) {
    let totalScore = 0;
    const matchedKeywords = [];

    // 检查关键词
    for (const keyword of config.keywords) {
      if (text.includes(keyword)) {
        let keywordScore = config.weight;

        // 检查程度副词
        for (const [modifier, multiplier] of Object.entries(intensityModifiers)) {
          if (text.includes(modifier + keyword) || text.includes(keyword + modifier)) {
            keywordScore *= multiplier;
            break;
          }
        }

        totalScore += keywordScore;
        matchedKeywords.push({
          keyword,
          score: keywordScore.toFixed(2)
        });
      }
    }

    if (totalScore > 0) {
      emotionScores[emotion] = parseFloat(totalScore.toFixed(2));
      detectedEmotions.push({
        emotion,
        score: parseFloat(totalScore.toFixed(2)),
        keywords: matchedKeywords
      });
    }
  }

  // 判断主要情绪
  let primaryEmotion = "neutral";
  let intensity = "low";
  let confidence = 0;

  if (detectedEmotions.length > 0) {
    detectedEmotions.sort((a, b) => b.score - a.score);
    primaryEmotion = detectedEmotions[0].emotion;

    const maxScore = detectedEmotions[0].score;
    const totalScore = detectedEmotions.reduce((sum, e) => sum + e.score, 0);
    confidence = (maxScore / totalScore * 100).toFixed(1);

    // 根据得分判断强度
    if (maxScore >= 3.0) intensity = "high";
    else if (maxScore >= 1.5) intensity = "medium";
    else intensity = "low";
  }

  // 检测情绪混合（复杂情绪）
  const emotionMix = detectEmotionMix(detectedEmotions);

  // 评估风险
  const riskLevel = assessRisk(detectedEmotions, text);

  // 分析结果
  const analysis = {
    patientId,
    text,
    primaryEmotion,
    intensity,
    confidence: parseFloat(confidence),
    emotionMix,
    detectedEmotions,
    emotionScores,
    riskLevel,
    textLength: text.length,
    analyzedAt: new Date().toISOString()
  };

  // 保存分析结果
  if (patientId) {
    const emotionDir = ".claude/data/emotions";
    const filePath = `${emotionDir}/${patientId}-${Date.now()}.json`;
    await Write(filePath, JSON.stringify(analysis, null, 2));
  }

  return {
    success: true,
    message: "情绪分析完成",
    data: analysis
  };
}

/**
 * 分析情绪趋势
 */
async function analyzeTrends(patientId, period, { Glob, Read }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  const emotionDir = ".claude/data/emotions";
  const files = await Glob(`${emotionDir}/${patientId}-*.json`);

  if (files.length === 0) {
    return {
      success: true,
      message: "暂无情绪记录",
      data: { trends: [] }
    };
  }

  // 读取所有情绪记录
  const records = await Promise.all(
    files.map(async (file) => {
      const content = await Read(file);
      return JSON.parse(content);
    })
  );

  // 按时间排序并过滤
  const now = Date.now();
  const periodMs = parsePeriod(period);
  const filteredRecords = records
    .filter(r => now - new Date(r.analyzedAt).getTime() <= periodMs)
    .sort((a, b) => new Date(a.analyzedAt) - new Date(b.analyzedAt));

  if (filteredRecords.length === 0) {
    return {
      success: true,
      message: `最近${period}内无情绪记录`,
      data: { trends: [] }
    };
  }

  // 统计情绪频率
  const emotionFrequency = {};
  const emotionTimeline = [];

  filteredRecords.forEach(record => {
    const emotion = record.primaryEmotion;
    emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;

    emotionTimeline.push({
      date: record.analyzedAt,
      emotion,
      intensity: record.intensity,
      riskLevel: record.riskLevel
    });
  });

  // 计算趋势
  const trends = Object.entries(emotionFrequency)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: (count / filteredRecords.length * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);

  // 评估总体趋势
  const recentRecords = filteredRecords.slice(-5);
  const avgRisk = recentRecords.reduce((sum, r) => {
    const riskScores = { low: 1, medium: 2, high: 3, critical: 4 };
    return sum + (riskScores[r.riskLevel] || 0);
  }, 0) / recentRecords.length;

  let overallTrend = "stable";
  if (avgRisk >= 3) overallTrend = "deteriorating";
  else if (avgRisk <= 1.5) overallTrend = "improving";

  return {
    success: true,
    message: "趋势分析完成",
    data: {
      period,
      totalRecords: filteredRecords.length,
      emotionFrequency: trends,
      emotionTimeline,
      overallTrend,
      avgRisk: avgRisk.toFixed(2)
    }
  };
}

/**
 * 生成情绪报告
 */
async function generateReport(patientId, period, { Glob, Read, Write }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  // 获取趋势数据
  const trendsResult = await analyzeTrends(patientId, period, { Glob, Read });

  if (!trendsResult.success) {
    throw new Error("无法获取趋势数据");
  }

  const { emotionFrequency, emotionTimeline, overallTrend, totalRecords } = trendsResult.data;

  // 生成 Markdown 报告
  let report = `# 情绪分析报告\n\n`;
  report += `**患者ID**: ${patientId}\n`;
  report += `**分析周期**: ${period}\n`;
  report += `**报告生成时间**: ${new Date().toLocaleString()}\n`;
  report += `**记录数量**: ${totalRecords}\n\n`;

  report += `## 总体趋势\n\n`;
  report += `- **趋势状态**: ${getTrendEmoji(overallTrend)} ${getTrendText(overallTrend)}\n\n`;

  report += `## 情绪分布\n\n`;
  report += `| 情绪 | 次数 | 占比 |\n`;
  report += `|------|------|------|\n`;

  emotionFrequency.forEach(({ emotion, count, percentage }) => {
    report += `| ${getEmotionEmoji(emotion)} ${getEmotionText(emotion)} | ${count} | ${percentage}% |\n`;
  });

  report += `\n## 情绪时间线\n\n`;
  emotionTimeline.slice(-10).forEach(record => {
    const date = new Date(record.date).toLocaleString();
    report += `- **${date}**: ${getEmotionEmoji(record.emotion)} ${getEmotionText(record.emotion)} (${record.intensity}) - 风险: ${record.riskLevel}\n`;
  });

  report += `\n## 建议和提示\n\n`;
  report += generateRecommendations(emotionFrequency, overallTrend);

  // 保存报告
  const reportsDir = ".claude/data/reports";
  const reportPath = `${reportsDir}/${patientId}-emotion-report-${Date.now()}.md`;
  await Write(reportPath, report);

  return {
    success: true,
    message: "报告生成成功",
    data: {
      reportPath,
      report
    }
  };
}

/**
 * 评估风险等级
 */
function assessRisk(detectedEmotions, text) {
  // 检查高风险关键词
  const highRiskKeywords = ["自杀", "想死", "不想活", "结束生命", "伤害自己", "自杀了"];
  const hasHighRisk = highRiskKeywords.some(keyword => text.includes(keyword));

  if (hasHighRisk) {
    return "critical";
  }

  // 检查中度风险情绪（基于得分）
  const mediumRiskEmotions = ["depression", "sadness", "anxiety"];
  const hasMediumRisk = detectedEmotions.some(e =>
    mediumRiskEmotions.includes(e.emotion) && e.score >= 2.0
  );

  if (hasMediumRisk) {
    return "high";
  }

  // 检查轻度风险
  const hasLowRisk = detectedEmotions.some(e =>
    ["guilt", "anger", "shame"].includes(e.emotion) && e.score >= 1.0
  );

  if (hasLowRisk) {
    return "medium";
  }

  return "low";
}

/**
 * 检测情绪混合
 */
function detectEmotionMix(detectedEmotions) {
  if (detectedEmotions.length === 0) {
    return "none";
  }

  if (detectedEmotions.length === 1) {
    return "pure";
  }

  // 检测积极+消极混合
  const hasPositive = detectedEmotions.some(e => ["joy", "hope", "calm"].includes(e.emotion));
  const hasNegative = detectedEmotions.some(e => ["sadness", "anxiety", "anger", "depression", "guilt", "shame"].includes(e.emotion));

  if (hasPositive && hasNegative) {
    return "mixed";
  }

  // 检测多种消极情绪
  const negativeCount = detectedEmotions.filter(e => ["sadness", "anxiety", "anger", "depression", "guilt", "shame"].includes(e.emotion)).length;

  if (negativeCount >= 3) {
    return "complex-distress";
  } else if (negativeCount >= 2) {
    return "multiple-distress";
  }

  return "mixed";
}

/**
 * 解析时间周期
 */
function parsePeriod(period) {
  const units = {
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000
  };

  const match = period.match(/^(\d+)([dwM])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // 默认7天
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  return value * (units[unit] || units.d);
}

/**
 * 获取趋势文本
 */
function getTrendText(trend) {
  const texts = {
    improving: "好转 📈",
    stable: "稳定 ➡️",
    deteriorating: "恶化 📉"
  };
  return texts[trend] || trend;
}

/**
 * 获取趋势图标
 */
function getTrendEmoji(trend) {
  const emojis = {
    improving: "✅",
    stable: "⚖️",
    deteriorating: "⚠️"
  };
  return emojis[trend] || "";
}

/**
 * 获取情绪文本
 */
function getEmotionText(emotion) {
  const texts = {
    joy: "快乐",
    hope: "希望",
    calm: "平静",
    sadness: "悲伤",
    anxiety: "焦虑",
    anger: "愤怒",
    depression: "抑郁",
    guilt: "内疚",
    neutral: "中性"
  };
  return texts[emotion] || emotion;
}

/**
 * 获取情绪图标
 */
function getEmotionEmoji(emotion) {
  const emojis = {
    joy: "😊",
    hope: "🌟",
    calm: "😌",
    sadness: "😢",
    anxiety: "😰",
    anger: "😠",
    depression: "😞",
    guilt: "😔",
    neutral: "😐"
  };
  return emojis[emotion] || "💭";
}

/**
 * 生成建议
 */
function generateRecommendations(emotionFrequency, overallTrend) {
  let recommendations = "";

  if (overallTrend === "deteriorating") {
    recommendations += "⚠️ **紧急提醒**: 患者情绪状态正在恶化，建议:\n";
    recommendations += "- 安排紧急会面\n";
    recommendations += "- 评估自杀风险\n";
    recommendations += "- 考虑调整治疗方案\n\n";
  }

  const topEmotions = emotionFrequency.slice(0, 3);
  topEmotions.forEach(({ emotion }) => {
    recommendations += `- ${getEmotionEmoji(emotion)} 针对${getEmotionText(emotion)}情绪: ${getEmotionRecommendation(emotion)}\n`;
  });

  return recommendations;
}

/**
 * 获取情绪建议
 */
function getEmotionRecommendation(emotion) {
  const recommendations = {
    joy: "继续保持积极状态，记录愉快的活动",
    hope: "利用希望感设定可达成的目标",
    calm: "保持放松状态，尝试冥想练习",
    sadness: "鼓励表达情感，安排支持性谈话",
    anxiety: "教授放松技巧，建立安全感",
    anger: "识别愤怒触发点，学习情绪调节",
    depression: "评估抑郁严重程度，考虑专业干预",
    guilt: "挑战不合理信念，建立自我同情",
    neutral: "继续观察，鼓励情绪表达"
  };
  return recommendations[emotion] || "继续观察和支持";
}
