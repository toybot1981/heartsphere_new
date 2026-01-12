/**
 * 生活助手角色预设话术配置
 * 用于测试角色技能功能
 */

export interface SkillPrompt {
  id: string;
  text: string;
  skillName?: string; // 预期触发的技能名称（用于显示提示）
  category?: string; // 技能分类
}

export interface CharacterSkillPrompts {
  characterName: string;
  prompts: SkillPrompt[];
}

/**
 * 六个生活助手角色的预设话术
 * 每个角色包含8个话术，对应8个技能
 */
export const DAILY_LIFE_ASSISTANT_PROMPTS: CharacterSkillPrompts[] = [
  {
    characterName: '时小光',
    prompts: [
      {
        id: 'time_audit',
        text: '帮我分析一下今天的时间使用情况',
        skillName: '时间审计',
        category: '时间管理'
      },
      {
        id: 'task_breakdown',
        text: '把这个任务分解成小步骤',
        skillName: '任务分解',
        category: '任务管理'
      },
      {
        id: 'priority_matrix',
        text: '帮我分析一下这些任务的优先级',
        skillName: '优先级矩阵',
        category: '任务管理'
      },
      {
        id: 'time_blocking',
        text: '用时间块法帮我安排今天的工作',
        skillName: '时间块规划',
        category: '时间规划'
      },
      {
        id: 'deadline_management',
        text: '帮我管理一下这些截止日期',
        skillName: '截止日期管理',
        category: '任务管理'
      },
      {
        id: 'procrastination_coach',
        text: '我有点拖延，能帮我克服吗？',
        skillName: '拖延克服教练',
        category: '行为改变'
      },
      {
        id: 'pomodoro_assistant',
        text: '用番茄工作法来安排学习时间',
        skillName: '番茄工作法助手',
        category: '时间管理'
      },
      {
        id: 'habit_tracker',
        text: '帮我追踪一下我的习惯养成情况',
        skillName: '习惯养成追踪',
        category: '习惯管理'
      }
    ]
  },
  {
    characterName: '康小健',
    prompts: [
      {
        id: 'health_data_tracking',
        text: '我想记录一下今天的体重和运动情况',
        skillName: '健康数据追踪',
        category: '健康管理'
      },
      {
        id: 'nutrition_advice',
        text: '给我一些饮食建议',
        skillName: '个性化饮食建议',
        category: '营养指导'
      },
      {
        id: 'exercise_plan',
        text: '帮我制定一个运动计划',
        skillName: '运动计划制定',
        category: '运动规划'
      },
      {
        id: 'sleep_optimization',
        text: '我的睡眠质量不好，有什么建议吗？',
        skillName: '睡眠优化指导',
        category: '睡眠管理'
      },
      {
        id: 'stress_relief',
        text: '我感觉压力很大，有什么办法缓解吗？',
        skillName: '压力缓解技巧',
        category: '压力管理'
      },
      {
        id: 'hydration_reminder',
        text: '帮我养成多喝水的习惯',
        skillName: '水分摄入提醒',
        category: '习惯养成'
      },
      {
        id: 'health_habit',
        text: '我想养成早睡早起的习惯',
        skillName: '健康习惯养成',
        category: '习惯管理'
      },
      {
        id: 'wellness_check',
        text: '帮我做一次健康检查评估',
        skillName: '健康状态评估',
        category: '健康评估'
      }
    ]
  },
  {
    characterName: '学小知',
    prompts: [
      {
        id: 'study_plan',
        text: '我想制定一个学习计划',
        skillName: '学习计划制定',
        category: '学习规划'
      },
      {
        id: 'memory_technique',
        text: '有什么好的记忆方法吗？',
        skillName: '记忆技巧训练',
        category: '学习方法'
      },
      {
        id: 'note_taking',
        text: '教我如何做笔记',
        skillName: '笔记方法指导',
        category: '学习方法'
      },
      {
        id: 'focus_training',
        text: '我注意力不集中，能帮我提高专注力吗？',
        skillName: '专注力训练',
        category: '能力提升'
      },
      {
        id: 'exam_prep',
        text: '帮我制定一个考试复习计划',
        skillName: '考试复习规划',
        category: '学习规划'
      },
      {
        id: 'learning_style',
        text: '帮我分析一下我的学习风格',
        skillName: '学习风格分析',
        category: '学习评估'
      },
      {
        id: 'knowledge_map',
        text: '帮我整理一下这个知识点的知识图谱',
        skillName: '知识图谱构建',
        category: '知识管理'
      },
      {
        id: 'learning_motivation',
        text: '我学习没有动力，能激励一下我吗？',
        skillName: '学习动力激励',
        category: '动机激发'
      }
    ]
  },
  {
    characterName: '心小暖',
    prompts: [
      {
        id: 'emotion_journal',
        text: '我想记录一下今天的心情',
        skillName: '情绪日记',
        category: '情绪管理'
      },
      {
        id: 'emotional_support',
        text: '我今天心情不好，能陪我聊聊吗？',
        skillName: '情感支持',
        category: '情感陪伴'
      },
      {
        id: 'mood_tracking',
        text: '帮我追踪一下最近的情绪变化',
        skillName: '情绪变化追踪',
        category: '情绪管理'
      },
      {
        id: 'coping_strategies',
        text: '我感到焦虑，有什么应对方法吗？',
        skillName: '应对策略建议',
        category: '情绪调节'
      },
      {
        id: 'gratitude_practice',
        text: '帮我养成每天感恩的习惯',
        skillName: '感恩练习',
        category: '积极心理'
      },
      {
        id: 'crisis_support',
        text: '我感觉有危机，需要帮助',
        skillName: '危机支持',
        category: '紧急支持'
      },
      {
        id: 'companionship',
        text: '我感觉很孤单，能陪我吗？',
        skillName: '陪伴与鼓励',
        category: '情感陪伴'
      },
      {
        id: 'emotional_validation',
        text: '我想倾诉一下我的感受',
        skillName: '情绪确认与倾听',
        category: '情感支持'
      }
    ]
  },
  {
    characterName: '心小安',
    prompts: [
      {
        id: 'stress_assessment',
        text: '帮我评估一下我的压力水平',
        skillName: '压力源分析',
        category: '压力管理'
      },
      {
        id: 'cognitive_restructuring',
        text: '我的思维模式有问题，能帮我重构吗？',
        skillName: 'CBT认知重构',
        category: '认知治疗'
      },
      {
        id: 'mindfulness_guide',
        text: '教我如何进行正念冥想',
        skillName: '正念冥想指导',
        category: '正念练习'
      },
      {
        id: 'sleep_health',
        text: '我的睡眠有问题，能帮我分析吗？',
        skillName: '睡眠健康分析',
        category: '睡眠管理'
      },
      {
        id: 'relationship_advice',
        text: '我在人际关系上遇到问题',
        skillName: '人际关系指导',
        category: '社交支持'
      },
      {
        id: 'mental_health_check',
        text: '帮我做一次心理健康检查',
        skillName: '心理健康评估',
        category: '健康评估'
      },
      {
        id: 'anxiety_management',
        text: '我经常感到焦虑，怎么办？',
        skillName: '焦虑管理技巧',
        category: '情绪调节'
      },
      {
        id: 'self_care_plan',
        text: '帮我制定一个自我关爱计划',
        skillName: '自我关爱计划',
        category: '自我照顾'
      }
    ]
  },
  {
    characterName: '暖小阳',
    prompts: [
      {
        id: 'daily_chat',
        text: '今天过得怎么样？聊聊吧',
        skillName: '日常聊天',
        category: '情感陪伴'
      },
      {
        id: 'encouragement',
        text: '我最近很沮丧，能鼓励一下我吗？',
        skillName: '鼓励与支持',
        category: '情感支持'
      },
      {
        id: 'interest_sharing',
        text: '我想分享一些有趣的事情',
        skillName: '兴趣话题引导',
        category: '社交互动'
      },
      {
        id: 'warm_message',
        text: '给我一些温暖的话',
        skillName: '温暖消息生成',
        category: '情感陪伴'
      },
      {
        id: 'activity_suggestions',
        text: '今天不知道该做什么，有什么建议吗？',
        skillName: '活动建议',
        category: '生活建议'
      },
      {
        id: 'celebration',
        text: '我完成了一个目标，一起庆祝吧！',
        skillName: '成就庆祝',
        category: '积极反馈'
      },
      {
        id: 'comfort_conversation',
        text: '我感觉很累，想聊聊天放松一下',
        skillName: '安慰性对话',
        category: '情感陪伴'
      },
      {
        id: 'positive_reflection',
        text: '帮我回想一下最近开心的事情',
        skillName: '积极回忆引导',
        category: '积极心理'
      }
    ]
  }
];

/**
 * 检查角色是否是生活助手
 */
export function isDailyLifeAssistant(characterName: string): boolean {
  return DAILY_LIFE_ASSISTANT_PROMPTS.some(
    config => config.characterName === characterName
  );
}

/**
 * 获取角色的预设话术
 */
export function getCharacterPrompts(characterName: string): SkillPrompt[] {
  const config = DAILY_LIFE_ASSISTANT_PROMPTS.find(
    config => config.characterName === characterName
  );
  return config?.prompts || [];
}
