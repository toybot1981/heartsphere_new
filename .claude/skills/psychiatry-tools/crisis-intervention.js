// .claude/skills/psychiatry-tools/crisis-intervention.js
/**
 * 危机干预 Skill
 * 评估和处理自杀、暴力等危机情况
 */

module.exports = {
  name: "crisis-intervention",
  description: "危机干预工具 - 评估风险、制定干预方案、提供应急指导",
  version: "1.0.0",
  author: "HeartSphere Psychiatry Team",

  args: {
    action: {
      type: "string",
      required: true,
      description: "操作类型: assess, plan, guide, resources",
      enum: ["assess", "plan", "guide", "resources"]
    },
    patientId: {
      type: "string",
      description: "患者ID"
    },
    riskLevel: {
      type: "string",
      description: "风险等级: low, medium, high, critical"
    },
    symptoms: {
      type: "array",
      description: "危机症状"
    },
    situation: {
      type: "string",
      description: "危机情况描述"
    }
  },

  usage: `
    评估危机风险:
      /crisis-intervention --action=assess --patientId=P001 --symptoms=["自杀意念","绝望感"]

    制定干预方案:
      /crisis-intervention --action=plan --patientId=P001 --riskLevel=high

    获取应急指导:
      /crisis-intervention --action=guide --riskLevel=critical

    查看危机资源:
      /crisis-intervention --action=resources
  `,

  run: async (args, context) => {
    const { action, patientId, riskLevel, symptoms, situation } = args;
    const { Read, Write } = context.tools;

    try {
      switch (action) {
        case "assess":
          return await assessCrisis(patientId, { symptoms, situation }, { Write });
        case "plan":
          return await createInterventionPlan(patientId, riskLevel, { Write });
        case "guide":
          return getEmergencyGuide(riskLevel);
        case "resources":
          return getCrisisResources();
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
 * 评估危机风险
 */
async function assessCrisis(patientId, data, { Write }) {
  const { symptoms, situation } = data;

  // 危机症状评估
  const symptomScores = {
    // 自杀风险症状
    suicideIdeation: {
      keywords: ["自杀", "想死", "不想活", "结束生命", "死了更好"],
      weight: 5
    },
    suicidePlan: {
      keywords: ["计划", "方法", "时间", "准备", "遗书"],
      weight: 10
    },
    suicideAttempt: {
      keywords: ["尝试过", "曾经", "过去", "上次"],
      weight: 8
    },

    // 绝望感
    hopelessness: {
      keywords: ["绝望", "没希望", "没有意义", "无助", "困住"],
      weight: 3
    },

    // 情绪症状
    severeDepression: {
      keywords: ["极度抑郁", "崩溃", "撑不住", "受不了"],
      weight: 4
    },
    agitation: {
      keywords: ["激动", "烦躁", "坐立不安", "无法控制"],
      weight: 3
    },

    // 精神病性症状
    psychosis: {
      keywords: ["幻觉", "妄想", "命令", "声音说"],
      weight: 6
    },

    // 物质使用
    substanceUse: {
      keywords: ["喝酒", "药物", "吸毒", "过量"],
      weight: 4
    }
  };

  let totalScore = 0;
  const detectedSymptoms = [];
  const situationLower = (situation || "").toLowerCase();

  // 评估症状
  for (const [symptom, config] of Object.entries(symptomScores)) {
    const detected = config.keywords.filter(keyword =>
      situationLower.includes(keyword) ||
      (symptoms || []).some(s => s.toLowerCase().includes(keyword))
    );

    if (detected.length > 0) {
      totalScore += config.weight * detected.length;
      detectedSymptoms.push({
        symptom,
        count: detected.length,
        keywords: detected
      });
    }
  }

  // 确定风险等级
  let riskLevel, urgency, recommendation;

  if (totalScore >= 20 || detectedSymptoms.some(s => s.symptom === "suicidePlan")) {
    riskLevel = "critical";
    urgency = "立即";
    recommendation = "需要紧急干预，可能需要住院治疗";
  } else if (totalScore >= 10) {
    riskLevel = "high";
    urgency = "24小时内";
    recommendation = "需要密切监测，考虑提高治疗强度";
  } else if (totalScore >= 5) {
    riskLevel = "medium";
    urgency = "尽快（3-7天内）";
    recommendation = "需要评估和干预，加强支持";
  } else {
    riskLevel = "low";
    urgency = "常规随访";
    recommendation = "继续监测，提供支持";
  }

  const assessment = {
    patientId,
    assessedAt: new Date().toISOString(),
    riskLevel,
    urgency,
    totalScore,
    detectedSymptoms,
    recommendation,
    situation: situation || ""
  };

  // 保存评估结果
  if (patientId) {
    const crisisDir = ".claude/data/crisis";
    const filePath = `${crisisDir}/${patientId}-crisis-${Date.now()}.json`;
    await Write(filePath, JSON.stringify(assessment, null, 2));
  }

  return {
    success: true,
    message: "危机风险评估完成",
    data: assessment
  };
}

/**
 * 创建干预方案
 */
async function createInterventionPlan(patientId, riskLevel, { Write }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  if (!riskLevel) {
    throw new Error("风险等级不能为空");
  }

  const plan = generateInterventionPlan(riskLevel);

  const interventionPlan = {
    patientId,
    riskLevel,
    plan,
    createdAt: new Date().toISOString(),
    status: "active"
  };

  const filePath = `.claude/data/crisis/${patientId}-intervention-plan.json`;
  await Write(filePath, JSON.stringify(interventionPlan, null, 2));

  return {
    success: true,
    message: "危机干预方案创建成功",
    data: interventionPlan
  };
}

/**
 * 生成干预方案
 */
function generateInterventionPlan(riskLevel) {
  const plans = {
    critical: {
      immediateActions: [
        "🚨 立即评估自杀风险",
        "📞 联系紧急联系人（家人/朋友）",
        "🏥 考虑紧急住院治疗",
        "⚕️ 24小时监护",
        "💊 调整药物治疗（如适用）"
      ],
      shortTermActions: [
        "每日会面或电话随访",
        "移除危险物品（药物、武器等）",
        "提供24小时危机热线",
        "评估精神病性症状",
        "考虑电休克治疗(ECT)（如果适用）"
      ],
      longTermActions: [
        "强化治疗联盟",
        "制定安全计划",
        "定期重新评估风险",
        "家庭心理教育",
        "长期药物治疗"
      ],
      contacts: [
        { name: "急救电话", number: "120" },
        { name: "心理危机热线", number: "400-161-9995" },
        { name: "当地精神卫生中心", note: "立即联系" }
      ],
      monitoring: {
        frequency: "每日至少1次",
        duration: "至少1周",
        indicators: ["自杀意念", "情绪状态", "睡眠", "药物依从性"]
      }
    },

    high: {
      immediateActions: [
        "⚠️ 24小时内安排评估",
        "📞 联系患者和家属",
        "🏠 评估居家安全性",
        "💊 调整药物剂量或种类",
        "📋 制定安全计划"
      ],
      shortTermActions: [
        "每周2-3次会面",
        "加强药物治疗",
        "家庭参与治疗",
        "移除危险物品",
        "提供危机热线信息"
      ],
      longTermActions: [
        "定期评估风险",
        "持续心理治疗",
        "维持药物治疗",
        "家庭支持",
        "康复计划"
      ],
      contacts: [
        { name: "主治医生", note: "24小时内联系" },
        { name: "心理危机热线", number: "400-161-9995" },
        { name: "家属", note: "通知并提供指导" }
      ],
      monitoring: {
        frequency: "每日1次",
        duration: "至少2周",
        indicators: ["自杀意念", "情绪状态", "社会功能", "副作用"]
      }
    },

    medium: {
      immediateActions: [
        "3-7天内安排评估",
        "📞 电话联系患者",
        "📊 评估症状严重程度",
        "💊 考虑调整治疗"
      ],
      shortTermActions: [
        "每周1次会面",
        "优化药物治疗",
        "增加支持性治疗",
        "家属教育"
      ],
      longTermActions: [
        "维持治疗",
        "预防复发",
        "改善社会功能",
        "提高生活质量"
      ],
      contacts: [
        { name: "治疗团队", note: "安排随访" },
        { name: "家属", note: "提供支持" }
      ],
      monitoring: {
        frequency: "每周2-3次",
        duration: "4周",
        indicators: ["症状", "功能", "依从性"]
      }
    },

    low: {
      immediateActions: [
        "常规随访",
        "📞 定期电话联系",
        "📊 监测症状变化"
      ],
      shortTermActions: [
        "按计划治疗",
        "提供心理教育",
        "增强应对技能"
      ],
      longTermActions: [
        "维持治疗",
        "预防复发",
        "健康生活方式"
      ],
      contacts: [
        { name: "治疗团队", note: "按计划随访" }
      ],
      monitoring: {
        frequency: "每周1次",
        duration: "根据情况",
        indicators: ["症状", "功能"]
      }
    }
  };

  return plans[riskLevel] || plans.low;
}

/**
 * 获取应急指导
 */
function getEmergencyGuide(riskLevel) {
  const guides = {
    critical: {
      title: "🚨 紧急危机应对指南",
      steps: [
        "1. **立即行动**",
        "   - 不要让患者独处",
        "   - 移除所有危险物品",
        "   - 拨打120急救电话",
        "",
        "2. **寻求帮助**",
        "   - 联系精神科医生",
        "   - 通知患者家属",
        "   - 如有需要，联系警方",
        "",
        "3. **安全措施**",
        "   - 全天候监护",
        "   - 记录所有言行",
        "   - 准备就医资料",
        "",
        "4. **就医准备**",
        "   - 选择最近的精神卫生机构",
        "   - 准备既往病史",
        "   - 携带当前用药清单"
      ],
      warning: "⚠️ 这是紧急情况，需要立即专业干预！"
    },

    high: {
      title: "⚠️ 高风险危机应对指南",
      steps: [
        "1. **24小时内评估**",
        "   - 安排专业评估",
        "   - 联系患者和家属",
        "   - 评估居家环境",
        "",
        "2. **制定安全计划**",
        "   - 识别警示信号",
        "   - 列出应对策略",
        "   - 准备紧急联系人",
        "",
        "3. **加强治疗**",
        "   - 调整药物方案",
        "   - 增加治疗频率",
        "   - 考虑住院治疗",
        "",
        "4. **动员支持**",
        "   - 家属参与",
        "   - 朋友支持",
        "   - 社区资源"
      ],
      warning: "⚠️ 需要密切监测和积极干预！"
    },

    medium: {
      title: "⚡ 中等风险应对指南",
      steps: [
        "1. **近期评估**",
        "   - 3-7天内安排评估",
        "   - 电话随访",
        "   - 症状监测",
        "",
        "2. **优化治疗**",
        "   - 调整药物",
        "   - 增加心理治疗",
        "   - 强化支持",
        "",
        "3. **预防措施**",
        "   - 教育识别征象",
        "   - 制定应对计划",
        "   - 建立支持网络"
      ],
      warning: "⚡ 需要关注和干预，防止恶化"
    },

    low: {
      title: "✓ 低风险应对指南",
      steps: [
        "1. **常规随访**",
        "   - 按计划治疗",
        "   - 定期评估",
        "   - 持续支持",
        "",
        "2. **健康促进**",
        "   - 心理教育",
        "   - 生活方式指导",
        "   - 技能训练"
      ],
      warning: "✓ 继续监测，保持警惕"
    }
  };

  return {
    success: true,
    message: "应急指导",
    data: guides[riskLevel] || guides.low
  };
}

/**
 * 获取危机资源
 */
function getCrisisResources() {
  return {
    success: true,
    message: "危机干预资源",
    data: {
      emergency: [
        { name: "急救电话", number: "120", description: "医疗急救" },
        { name: "报警电话", number: "110", description: "紧急情况" }
      ],

      hotlines: [
        {
          name: "全国心理援助热线",
          number: "400-161-9995",
          hours: "24小时",
          description: "心理危机干预"
        },
        {
          name: "北京心理危机研究与干预中心",
          number: "010-82951332",
          hours: "24小时",
          description: "专业心理危机干预"
        },
        {
          name: "上海市心理热线",
          number: "021-12320-5",
          hours: "24小时",
          description: "心理健康服务"
        },
        {
          name: "广州市心理援助热线",
          number: "020-81899120",
          hours: "24小时",
          description: "心理危机干预"
        }
      ],

      hospitals: [
        {
          type: "精神卫生中心",
          description: "提供24小时急诊服务",
          examples: [
            "北京市精神卫生中心",
            "上海市精神卫生中心",
            "广州市惠爱医院",
            "深圳市精神卫生中心"
          ]
        }
      ],

      online: [
        {
          name: "好心情",
          platform: "APP/网站",
          description: "在线心理咨询"
        },
        {
          name: "简单心理",
          platform: "APP/网站",
          description: "专业心理咨询平台"
        },
        {
          name: "壹心理",
          platform: "APP/网站",
          description: "心理健康服务平台"
        }
      ],

      apps: [
        {
          name: "正念冥想",
          description: "放松和减压",
          platforms: ["iOS", "Android"]
        },
        {
          name: "潮汐",
          description: "冥想和睡眠",
          platforms: ["iOS", "Android"]
        },
        {
          name: "Headspace",
          description: "正念和冥想",
          platforms: ["iOS", "Android"]
        }
      ],

      selfHelp: [
        {
          title: "应对自杀意念的5步法",
          steps: [
            "1. **承诺安全**: 承诺在联系专业人士前不采取任何行动",
            "2. **移除危险物品**: 把药物、武器等收起来",
            "3. **联系信任的人**: 告诉家人、朋友或医生你的感受",
            "4. **寻求专业帮助**: 拨打危机热线或去急诊",
            "5. **记住感受会改变**: 绝望感是暂时的，可以获得帮助"
          ]
        },
        {
          title: "快速放松技巧",
          steps: [
            "1. **深呼吸**: 缓慢深呼吸5次",
            "2. **握拳放松**: 用力握拳5秒，然后放松",
            "3. **正念观察**: 观察周围5样东西",
            "4. **安全想象**: 想象一个让你感到安全的地方"
          ]
        }
      ],

      warning: "⚠️ 如果情况紧急，请立即拨打120或前往最近的急诊室！"
    }
  };
}
