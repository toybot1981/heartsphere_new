// .claude/skills/psychiatry-tools/treatment-plan.js
/**
 * 治疗计划生成 Skill
 * 根据患者情况生成个性化治疗计划
 */

module.exports = {
  name: "treatment-plan",
  description: "治疗计划工具 - 生成、管理和跟踪个性化治疗计划",
  version: "1.0.0",
  author: "HeartSphere Psychiatry Team",

  args: {
    action: {
      type: "string",
      required: true,
      description: "操作类型: create, view, update, track",
      enum: ["create", "view", "update", "track"]
    },
    patientId: {
      type: "string",
      description: "患者ID"
    },
    diagnosis: {
      type: "string",
      description: "诊断结果"
    },
    severity: {
      type: "string",
      description: "严重程度: mild, moderate, severe",
      enum: ["mild", "moderate", "severe"]
    },
    goals: {
      type: "array",
      description: "治疗目标"
    },
    preferences: {
      type: "object",
      description: "患者偏好"
    }
  },

  usage: `
    创建治疗计划:
      /treatment-plan --action=create --patientId=P001 --diagnosis="抑郁症" --severity=moderate --goals=["改善睡眠","提高社交"]

    查看治疗计划:
      /treatment-plan --action=view --patientId=P001

    更新治疗计划:
      /treatment-plan --action=update --patientId=P001 --goals=["改善睡眠","提高社交","减少焦虑"]

    跟踪进度:
      /treatment-plan --action=track --patientId=P001
  `,

  run: async (args, context) => {
    const { action, patientId, diagnosis, severity, goals, preferences } = args;
    const { Read, Write, Glob } = context.tools;

    try {
      switch (action) {
        case "create":
          return await createTreatmentPlan(
            { patientId, diagnosis, severity, goals, preferences },
            { Write }
          );
        case "view":
          return await viewTreatmentPlan(patientId, { Read });
        case "update":
          return await updateTreatmentPlan(patientId, { goals }, { Read, Write });
        case "track":
          return await trackProgress(patientId, { Read, Write });
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
 * 创建治疗计划
 */
async function createTreatmentPlan(data, { Write }) {
  const { patientId, diagnosis, severity, goals, preferences } = data;

  if (!patientId || !diagnosis || !severity) {
    throw new Error("患者ID、诊断和严重程度不能为空");
  }

  // 生成治疗计划
  const plan = generatePlan(diagnosis, severity, goals, preferences);

  const treatmentPlan = {
    patientId,
    diagnosis,
    severity,
    goals: goals || [],
    preferences: preferences || {},
    plan,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "active",
    progress: []
  };

  const filePath = `.claude/data/treatment-plans/${patientId}.json`;
  await Write(filePath, JSON.stringify(treatmentPlan, null, 2));

  return {
    success: true,
    message: "治疗计划创建成功",
    data: treatmentPlan
  };
}

/**
 * 生成治疗计划
 */
function generatePlan(diagnosis, severity, goals, preferences) {
  const plan = {
    phases: [],
    interventions: [],
    medications: [],
    psychotherapy: [],
    lifestyle: [],
    monitoring: [],
    crisisPlan: null
  };

  // 根据诊断生成计划
  switch (diagnosis.toLowerCase()) {
    case "抑郁症":
    case "抑郁发作":
      generateDepressionPlan(plan, severity, goals, preferences);
      break;

    case "焦虑症":
    case "广泛性焦虑障碍":
      generateAnxietyPlan(plan, severity, goals, preferences);
      break;

    case "双相情感障碍":
      generateBipolarPlan(plan, severity, goals, preferences);
      break;

    case "精神分裂症":
      generateSchizophreniaPlan(plan, severity, goals, preferences);
      break;

    default:
      generateGenericPlan(plan, severity, goals, preferences);
  }

  return plan;
}

/**
 * 抑郁症治疗计划
 */
function generateDepressionPlan(plan, severity, goals, preferences) {
  // 急性期治疗
  plan.phases.push({
    name: "急性期治疗",
    duration: "6-12周",
    objectives: [
      "缓解抑郁症状",
      "恢复社会功能",
      "降低自杀风险"
    ],
    frequency: "每周1-2次"
  });

  // 巩固期治疗
  plan.phases.push({
    name: "巩固期治疗",
    duration: "4-9个月",
    objectives: [
      "巩固疗效",
      "预防复发",
      "改善认知功能"
    ],
    frequency: "每2-4周1次"
  });

  // 维持期治疗
  plan.phases.push({
    name: "维持期治疗",
    duration: "1年以上",
    objectives: [
      "预防复发",
      "维持社会功能",
      "提高生活质量"
    ],
    frequency: "每月1-2次"
  });

  // 药物治疗
  if (severity !== "mild") {
    plan.medications.push({
      class: "抗抑郁药",
      examples: ["SSRIs", "SNRIs"],
      firstLine: "舍曲林、艾司西酞普兰、氟西汀",
      notes: "从小剂量开始，逐渐滴定至有效剂量"
    });
  }

  // 心理治疗
  plan.psychotherapy.push({
    type: "认知行为治疗(CBT)",
    frequency: "每周1次，12-20次",
    techniques: [
      "认知重构",
      "行为激活",
      "问题解决训练"
    ]
  });

  if (severity === "severe") {
    plan.psychotherapy.push({
      type: "人际治疗(IPT)",
      frequency: "每周1次，12-16次",
      focus: "改善人际关系和社交功能"
    });
  }

  // 生活方式干预
  plan.lifestyle.push({
    area: "睡眠",
    recommendations: [
      "建立规律作息时间",
      "避免睡前刺激活动",
      "创造舒适的睡眠环境"
    ]
  });

  plan.lifestyle.push({
    area: "运动",
    recommendations: [
      "每周3-5次有氧运动，每次30分钟",
      "从轻度活动开始，逐渐增加强度"
    ]
  });

  plan.lifestyle.push({
    area: "社交",
    recommendations: [
      "逐步增加社交活动",
      "参加支持小组",
      "与家人朋友保持联系"
    ]
  });

  // 监测指标
  plan.monitoring = [
    {
      scale: "PHQ-9",
      frequency: "每周1次",
      target: "分数降低50%或<5分"
    },
    {
      scale: "自杀风险评估",
      frequency: "每次就诊",
      target: "低风险"
    }
  ];

  // 危机干预计划
  if (severity === "severe") {
    plan.crisisPlan = {
      warningSigns: [
        "自杀意念增强",
        "社交退缩加重",
        "绝望感明显"
      ],
      actions: [
        "24小时危机热线",
        "紧急联系人",
        "最近的精神科急诊"
      ]
    };
  }
}

/**
 * 焦虑症治疗计划
 */
function generateAnxietyPlan(plan, severity, goals, preferences) {
  plan.phases.push({
    name: "急性期治疗",
    duration: "8-12周",
    objectives: [
      "缓解焦虑症状",
      "改善日常功能",
      "学习应对技巧"
    ],
    frequency: "每周1-2次"
  });

  plan.phases.push({
    name: "维持期治疗",
    duration: "6-12个月",
    objectives: [
      "巩固疗效",
      "预防复发",
      "提高应对能力"
    ],
    frequency: "每月1-2次"
  });

  // 心理治疗（一线治疗）
  plan.psychotherapy.push({
    type: "认知行为治疗(CBT)",
    frequency: "每周1次，12-20次",
    techniques: [
      "焦虑教育",
      "认知重构",
      "暴露疗法",
      "放松训练"
    ]
  });

  // 药物治疗（中重度）
  if (severity !== "mild" || preferences?.medication === "preferred") {
    plan.medications.push({
      class: "抗焦虑药/抗抑郁药",
      firstLine: "SSRIs (艾司西酞普兰、舍曲林)",
      alternatives: "SNRIs (文拉法辛)",
      notes: "短期可联用苯二氮卓类(不超过2-4周)"
    });
  }

  // 生活方式
  plan.lifestyle.push({
    area: "放松训练",
    recommendations: [
      "每日练习深呼吸或渐进性肌肉放松",
      "正念冥想，每日10-15分钟"
    ]
  });

  plan.lifestyle.push({
    area: "生活方式",
    recommendations: [
      "减少咖啡因摄入",
      "规律运动",
      "充足睡眠"
    ]
  });

  // 监测
  plan.monitoring = [
    {
      scale: "GAD-7",
      frequency: "每周1次",
      target: "分数降低50%或<7分"
    }
  ];
}

/**
 * 双相情感障碍治疗计划
 */
function generateBipolarPlan(plan, severity, goals, preferences) {
  plan.phases.push({
    name: "急性期治疗",
    duration: "6-12周",
    objectives: [
      "控制急性症状",
      "稳定情绪",
      "降低自杀风险"
    ],
    frequency: "每周1-2次"
  });

  plan.phases.push({
    name: "维持期治疗",
    duration: "长期（数年）",
    objectives: [
      "预防复发",
      "维持稳定",
      "改善功能"
    ],
    frequency: "每月1次"
  });

  // 心境稳定剂（必须）
  plan.medications.push({
    class: "心境稳定剂",
    firstLine: "锂盐、丙戊酸钠、拉莫三嗪",
    notes: "需要定期监测血药浓度"
  });

  // 根据相期添加其他药物
  plan.medications.push({
    class: "抗精神病药",
    indication: "躁狂发作或混合发作",
    examples: "奥氮平、喹硫平"
  });

  plan.medications.push({
    class: "抗抑郁药",
    indication: "抑郁发作（需联用心境稳定剂）",
    warning: "可能诱发转躁，需谨慎使用"
  });

  // 心理教育
  plan.psychotherapy.push({
    type: "心理教育",
    focus: [
      "疾病知识",
      "早期识别复发征象",
      "服药依从性"
    ]
  });

  plan.psychotherapy.push({
    type: "认知行为治疗(CBT)",
    focus: [
      "规律作息",
      "压力管理",
      "应对技能"
    ]
  });

  // 生活方式（非常重要）
  plan.lifestyle.push({
    area: "作息规律",
    recommendations: [
      "保持规律的睡眠-觉醒周期",
      "避免夜间活动和轮班工作",
      "建立日常例程"
    ]
  });

  // 监测
  plan.monitoring = [
    {
      scale: "心境图表",
      frequency: "每日",
      target: "情绪稳定，无极端波动"
    },
    {
      scale: "血药浓度",
      frequency: "定期（锂盐：每周1次×4周，后每月1次）",
      target: "治疗窗范围内"
    }
  ];

  // 危机计划
  plan.crisisPlan = {
    warningSigns: [
      "睡眠需求明显减少",
      "言语加速或活动增多",
      "冲动行为",
      "绝望感或自杀意念"
    ],
    actions: [
      "立即联系治疗团队",
      "调整药物方案",
      "必要时住院治疗"
    ]
  };
}

/**
 * 精神分裂症治疗计划
 */
function generateSchizophreniaPlan(plan, severity, goals, preferences) {
  plan.phases.push({
    name: "急性期治疗",
    duration: "6-12周",
    objectives: [
      "控制精神病性症状",
      "稳定病情",
      "建立治疗联盟"
    ],
    frequency: "每周2-3次"
  });

  plan.phases.push({
    name: "巩固期治疗",
    duration: "6-12个月",
    objectives: [
      "预防复发",
      "改善社会功能",
      "促进康复"
    ],
    frequency: "每2-4周1次"
  });

  plan.phases.push({
    name: "维持期治疗",
    duration: "长期（至少2年，首次发作）",
    objectives: [
      "维持疗效",
      "预防复发",
      "最大程度恢复功能"
    ],
    frequency: "每月1-2次"
  });

  // 抗精神病药物（核心治疗）
  plan.medications.push({
    class: "抗精神病药",
    firstLine: "第二代抗精神病药（利培酮、奥氮平、喹硫平）",
    notes: "急性期可使用第一代药物（氟哌啶醇）控制兴奋激越"
  });

  // 心理社会干预
  plan.psychotherapy.push({
    type: "认知行为治疗(CBT)",
    focus: [
      "应对妄想和幻觉",
      "改善自知力",
      "减少再住院"
    ]
  });

  plan.psychotherapy.push({
    type: "家庭心理教育",
    focus: [
      "改善家庭沟通",
      "降低情感表达(EE)",
      "提高治疗依从性"
    ]
  });

  // 康复训练
  plan.lifestyle.push({
    area: "社交技能训练",
    recommendations: [
      "基本会话技巧",
      "非语言沟通",
      "冲突解决"
    ]
  });

  plan.lifestyle.push({
    area: "认知康复",
    recommendations: [
      "注意力训练",
      "记忆力训练",
      "执行功能训练"
    ]
  });

  plan.lifestyle.push({
    area: "职业康复",
    recommendations: [
      "职业评估",
      "工作技能培训",
      "支持性就业"
    ]
  });

  // 监测
  plan.monitoring = [
    {
      scale: "PANSS (阳性和阴性症状量表)",
      frequency: "急性期每周1次，稳定期每月1次",
      target: "总分降低30%或更低"
    },
    {
      scale: "药物副作用监测",
      frequency: "每次就诊",
      items: ["EPS", "代谢指标", "催乳素", "心电图"]
    }
  ];

  // 危机计划
  plan.crisisPlan = {
    warningSigns: [
      "症状明显加重",
      "自杀或攻击行为",
      "严重药物副作用",
      "完全丧失自知力"
    ],
    actions: [
      "24小时家属监护",
      "联系主治医生",
      "必要时住院治疗"
    ]
  };
}

/**
 * 通用治疗计划
 */
function generateGenericPlan(plan, severity, goals, preferences) {
  plan.phases.push({
    name: "评估阶段",
    duration: "1-2次",
    objectives: [
      "全面评估",
      "制定治疗目标",
      "建立治疗关系"
    ]
  });

  plan.phases.push({
    name: "治疗阶段",
    duration: "根据病情决定",
    objectives: goals || ["改善症状", "提高功能"]
  });

  plan.psychotherapy.push({
    type: "支持性心理治疗",
    frequency: "每周1次"
  });

  plan.monitoring = [
    {
      scale: "症状自评",
      frequency: "每周1次"
    }
  ];
}

/**
 * 查看治疗计划
 */
async function viewTreatmentPlan(patientId, { Read }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  const filePath = `.claude/data/treatment-plans/${patientId}.json`;

  try {
    const content = await Read(filePath);
    const plan = JSON.parse(content);

    return {
      success: true,
      message: "查询成功",
      data: plan
    };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new Error(`治疗计划不存在: ${patientId}`);
    }
    throw error;
  }
}

/**
 * 更新治疗计划
 */
async function updateTreatmentPlan(patientId, data, { Read, Write }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  const filePath = `.claude/data/treatment-plans/${patientId}.json`;

  try {
    const content = await Read(filePath);
    const plan = JSON.parse(content);

    // 更新字段
    const updated = {
      ...plan,
      ...data,
      patientId: plan.patientId,
      createdAt: plan.createdAt,
      updatedAt: new Date().toISOString()
    };

    await Write(filePath, JSON.stringify(updated, null, 2));

    return {
      success: true,
      message: "治疗计划更新成功",
      data: updated
    };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new Error(`治疗计划不存在: ${patientId}`);
    }
    throw error;
  }
}

/**
 * 跟踪进度
 */
async function trackProgress(patientId, { Read, Write, Glob }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  const planResult = await viewTreatmentPlan(patientId, { Read });
  if (!planResult.success) {
    throw new Error("无法获取治疗计划");
  }

  const plan = planResult.data;

  // 获取评估数据来计算真实进度
  const assessmentsDir = ".claude/data/assessments";
  const assessmentFiles = await Glob(`${assessmentsDir}/${patientId}-*.json`);

  let progressData = {};
  let totalScore = 0;
  let assessmentCount = 0;

  if (assessmentFiles.length > 0) {
    // 读取最近的评估
    const recentAssessments = await Promise.all(
      assessmentFiles.slice(-5).map(async (file) => {
        const content = await Read(file);
        return JSON.parse(content);
      })
    );

    // 计算平均评分
    assessmentCount = recentAssessments.length;
    totalScore = recentAssessments.reduce((sum, a) => sum + (a.result.totalScore || 0), 0) / assessmentCount;
  }

  // 计算目标完成度（基于评估结果）
  const goalsProgress = plan.goals.map(goal => {
    let progress = 0;
    let status = "not-started";

    // 根据目标类型估算进度
    if (goal.includes("改善") || goal.includes("缓解")) {
      if (assessmentCount > 0) {
        // 基于症状改善程度
        progress = Math.min(100, Math.max(0, 100 - totalScore * 10));
        status = progress >= 50 ? "on-track" : "in-progress";
      }
    } else if (goal.includes("恢复") || goal.includes("提高")) {
      if (assessmentCount > 0) {
        progress = Math.min(100, assessmentCount * 15);
        status = progress >= 30 ? "on-track" : "in-progress";
      }
    } else {
      if (assessmentCount > 0) {
        progress = Math.min(100, assessmentCount * 20);
        status = "in-progress";
      }
    }

    // 确保进度不为0（如果已有评估）
    if (progress === 0 && assessmentCount > 0) {
      progress = 10;
      status = "in-progress";
    }

    return {
      goal,
      status,
      progress: Math.floor(progress)
    };
  });

  // 计算总体进度
  const avgProgress = goalsProgress.reduce((sum, g) => sum + g.progress, 0) / goalsProgress.length;

  let overallProgress, overallStatus;
  if (avgProgress >= 70) {
    overallProgress = "excellent";
    overallStatus = "进展优秀";
  } else if (avgProgress >= 50) {
    overallProgress = "on-track";
    overallStatus = "进展顺利";
  } else if (avgProgress >= 30) {
    overallProgress = "making-progress";
    overallStatus = "有所进展";
  } else if (avgProgress > 0) {
    overallProgress = "slow";
    overallStatus = "进展缓慢";
  } else {
    overallProgress = "not-started";
    overallStatus = "尚未开始";
  }

  // 生成建议
  const recommendations = generateProgressRecommendations(avgProgress, assessmentCount, plan);

  // 进度报告
  const progress = {
    patientId,
    trackedAt: new Date().toISOString(),
    goalsProgress,
    overallProgress,
    overallStatus,
    assessmentCount,
    avgProgress: Math.floor(avgProgress),
    recommendations,
    nextReview: calculateNextReview(plan.createdAt)
  };

  // 保存进度记录
  const progressFilePath = `.claude/data/progress/${patientId}-${Date.now()}.json`;
  await Write(progressFilePath, JSON.stringify(progress, null, 2));

  return {
    success: true,
    message: "进度跟踪完成",
    data: progress
  };
}

/**
 * 生成进度建议
 */
function generateProgressRecommendations(avgProgress, assessmentCount, plan) {
  const recommendations = [];

  if (assessmentCount === 0) {
    recommendations.push("建议进行首次评估以建立基线");
    return recommendations;
  }

  if (avgProgress >= 70) {
    recommendations.push("✅ 治疗进展良好，继续当前方案");
    recommendations.push("考虑逐步降低治疗频率");
    recommendations.push("开始规划维持期治疗");
  } else if (avgProgress >= 50) {
    recommendations.push("📈 治疗进展顺利，保持当前方向");
    recommendations.push("定期评估效果");
    recommendations.push("根据需要微调方案");
  } else if (avgProgress >= 30) {
    recommendations.push("⚠️ 治疗有所进展但较慢");
    recommendations.push("评估当前方案的有效性");
    recommendations.push("考虑调整治疗策略");
  } else {
    recommendations.push("⚠️ 治疗进展不理想");
    recommendations.push("重新评估诊断和治疗目标");
    recommendations.push("考虑更换治疗方案");
    recommendations.push("增加治疗频率或强度");
  }

  if (assessmentCount < 3) {
    recommendations.push("建议增加评估频率以更好监测进展");
  }

  return recommendations;
}

/**
 * 计算下次复查时间
 */
function calculateNextReview(planCreatedAt) {
  const created = new Date(planCreatedAt);
  const now = new Date();
  const daysSinceCreation = Math.floor((now - created) / (1000 * 60 * 60 * 24));

  // 默认4周复查
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + 28 - (daysSinceCreation % 28));

  return nextReview.toISOString().split('T')[0];
}
