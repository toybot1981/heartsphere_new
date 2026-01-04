// .claude/skills/psychiatry-tools/session-record.js
/**
 * 会话记录 Skill
 * 记录和管理治疗会话
 */

module.exports = {
  name: "session-record",
  description: "会话记录工具 - 创建、查看、管理治疗会话记录",
  version: "1.0.0",
  author: "HeartSphere Psychiatry Team",

  args: {
    action: {
      type: "string",
      required: true,
      description: "操作类型: create, view, list, summary",
      enum: ["create", "view", "list", "summary"]
    },
    patientId: {
      type: "string",
      description: "患者ID"
    },
    sessionId: {
      type: "string",
      description: "会话ID"
    },
    content: {
      type: "string",
      description: "会话内容"
    },
    duration: {
      type: "number",
      description: "会话时长（分钟）"
    },
    chiefComplaint: {
      type: "string",
      description: "主诉"
    },
    mentalStatus: {
      type: "object",
      description: "精神状态检查"
    },
    interventions: {
      type: "array",
      description: "干预措施"
    },
    homework: {
      type: "string",
      description: "家庭作业"
    },
    nextAppointment: {
      type: "string",
      description: "下次预约"
    }
  },

  usage: `
    创建会话记录:
      /session-record --action=create --patientId=P001 --chiefComplaint="失眠" --duration=50

    查看会话记录:
      /session-record --action=view --sessionId=S001

    列出患者所有会话:
      /session-record --action=list --patientId=P001

    生成会话摘要:
      /session-record --action=summary --patientId=P001 --period=30d
  `,

  run: async (args, context) => {
    const { action, patientId, sessionId, ...sessionData } = args;
    const { Read, Write, Glob } = context.tools;

    try {
      switch (action) {
        case "create":
          return await createSession(patientId, sessionData, { Write });
        case "view":
          return await viewSession(sessionId, { Read });
        case "list":
          return await listSessions(patientId, { Glob, Read });
        case "summary":
          return await generateSummary(patientId, sessionData.period, { Glob, Read });
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
 * 创建会话记录
 */
async function createSession(patientId, data, { Write }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  const sessionId = generateSessionId();
  const now = new Date();

  const session = {
    sessionId,
    patientId,
    date: now.toISOString(),
    duration: data.duration || 50,
    chiefComplaint: data.chiefComplaint || "",
    content: data.content || "",

    // 精神状态检查
    mentalStatus: data.mentalStatus || {
      appearance: "",
      behavior: "",
      speech: "",
      mood: "",
      affect: "",
      thought: "",
      perception: "",
      cognition: "",
      insight: "",
      judgment: ""
    },

    // 干预措施
    interventions: data.interventions || [],

    // 家庭作业
    homework: data.homework || "",

    // 治疗师的观察和建议
    observations: data.observations || "",
    recommendations: data.recommendations || "",

    // 下次预约
    nextAppointment: data.nextAppointment || "",

    // 会话评分
    sessionRating: data.sessionRating || null,

    createdAt: now.toISOString()
  };

  const filePath = `.claude/data/sessions/${sessionId}.json`;
  await Write(filePath, JSON.stringify(session, null, 2));

  return {
    success: true,
    message: "会话记录创建成功",
    data: session
  };
}

/**
 * 查看会话记录
 */
async function viewSession(sessionId, { Read }) {
  if (!sessionId) {
    throw new Error("会话ID不能为空");
  }

  const filePath = `.claude/data/sessions/${sessionId}.json`;

  try {
    const content = await Read(filePath);
    const session = JSON.parse(content);

    return {
      success: true,
      message: "查询成功",
      data: session
    };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new Error(`会话记录不存在: ${sessionId}`);
    }
    throw error;
  }
}

/**
 * 列出患者所有会话
 */
async function listSessions(patientId, { Glob, Read }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  try {
    const files = await Glob(`.claude/data/sessions/${patientId}-*.json`);

    if (files.length === 0) {
      return {
        success: true,
        message: "暂无会话记录",
        data: []
      };
    }

    const sessions = await Promise.all(
      files.map(async (file) => {
        const content = await Read(file);
        const session = JSON.parse(content);
        return {
          sessionId: session.sessionId,
          date: session.date,
          duration: session.duration,
          chiefComplaint: session.chiefComplaint,
          interventions: session.interventions.length
        };
      })
    );

    // 按日期排序（最新的在前）
    sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      success: true,
      message: `共找到 ${sessions.length} 次会话记录`,
      data: sessions
    };
  } catch (error) {
    return {
      success: true,
      message: "获取会话列表失败",
      data: []
    };
  }
}

/**
 * 生成会话摘要
 */
async function generateSummary(patientId, period = "30d", { Glob, Read, Write }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  try {
    const files = await Glob(`.claude/data/sessions/${patientId}-*.json`);

    if (files.length === 0) {
      return {
        success: true,
        message: "暂无会话记录",
        data: null
      };
    }

    // 读取所有会话
    const sessions = await Promise.all(
      files.map(async (file) => {
        const content = await Read(file);
        return JSON.parse(content);
      })
    );

    // 按时间排序
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 生成摘要
    const summary = {
      patientId,
      period,
      totalSessions: sessions.length,
      totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      dateRange: {
        start: sessions[0]?.date,
        end: sessions[sessions.length - 1]?.date
      },

      // 主诉统计
      chiefComplaints: extractFrequentItems(sessions.map(s => s.chiefComplaint)),

      // 干预措施统计
      interventions: extractInterventions(sessions),

      // 情绪趋势
      moodTrend: extractMoodTrend(sessions),

      // 进展评估
      progress: assessProgress(sessions),

      // 建议
      recommendations: generateSessionRecommendations(sessions),

      generatedAt: new Date().toISOString()
    };

    // 保存摘要
    const summaryPath = `.claude/data/summaries/${patientId}-summary-${Date.now()}.json`;
    await Write(summaryPath, JSON.stringify(summary, null, 2));

    return {
      success: true,
      message: "会话摘要生成成功",
      data: summary
    };
  } catch (error) {
    throw new Error(`生成摘要失败: ${error.message}`);
  }
}

/**
 * 提取高频项目
 */
function extractFrequentItems(items) {
  const frequency = {};

  items.forEach(item => {
    if (item) {
      const keywords = item.split(/[,，、]/).map(s => s.trim()).filter(s => s);
      keywords.forEach(keyword => {
        frequency[keyword] = (frequency[keyword] || 0) + 1;
      });
    }
  });

  return Object.entries(frequency)
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * 提取干预措施
 */
function extractInterventions(sessions) {
  const interventions = {};

  sessions.forEach(session => {
    session.interventions?.forEach(intervention => {
      interventions[intervention] = (interventions[intervention] || 0) + 1;
    });
  });

  return Object.entries(interventions)
    .map(([intervention, count]) => ({ intervention, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 提取情绪趋势
 */
function extractMoodTrend(sessions) {
  return sessions.map(session => ({
    date: session.date,
    mood: session.mentalStatus?.mood || "",
    affect: session.mentalStatus?.affect || ""
  }));
}

/**
 * 评估进展
 */
function assessProgress(sessions) {
  if (sessions.length < 2) {
    return {
      status: "insufficient-data",
      message: "数据不足，无法评估进展"
    };
  }

  const recentSessions = sessions.slice(-5);
  const earlySessions = sessions.slice(0, Math.min(5, sessions.length));

  // 对比早期和近期会话
  const avgRatingEarly = earlySessions
    .filter(s => s.sessionRating)
    .reduce((sum, s) => sum + s.sessionRating, 0) / (earlySessions.filter(s => s.sessionRating).length || 1);

  const avgRatingRecent = recentSessions
    .filter(s => s.sessionRating)
    .reduce((sum, s) => sum + s.sessionRating, 0) / (recentSessions.filter(s => s.sessionRating).length || 1);

  let status, message;

  if (avgRatingRecent > avgRatingEarly * 1.2) {
    status = "improving";
    message = "患者状态有明显改善";
  } else if (avgRatingRecent < avgRatingEarly * 0.8) {
    status = "deteriorating";
    message = "患者状态有所恶化，需要关注";
  } else {
    status = "stable";
    message = "患者状态相对稳定";
  }

  return {
    status,
    message,
    avgRatingEarly: avgRatingEarly.toFixed(2),
    avgRatingRecent: avgRatingRecent.toFixed(2)
  };
}

/**
 * 生成会话建议
 */
function generateSessionRecommendations(sessions) {
  const recommendations = [];

  const lastSession = sessions[sessions.length - 1];

  if (!lastSession.homework) {
    recommendations.push("考虑布置家庭作业，促进治疗延续");
  }

  if (!lastSession.nextAppointment) {
    recommendations.push("安排下次预约");
  }

  const recentInterventions = sessions.slice(-3).flatMap(s => s.interventions || []);
  if (recentInterventions.length === 0) {
    recommendations.push("增加具体干预措施");
  }

  if (sessions.length >= 4) {
    recommendations.push("考虑进行阶段性评估");
  }

  return recommendations;
}

/**
 * 生成会话ID
 */
function generateSessionId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `S${timestamp}${random}`;
}
