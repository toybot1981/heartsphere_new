import { SectionType } from '../contexts/AdminStateContext';

interface SectionMetadata {
  title: string;
  icon: string;
}

const sectionMetadataMap: Record<SectionType, SectionMetadata> = {
  'dashboard': { title: '系统概览', icon: '📊' },
  'eras': { title: '场景管理', icon: '🌍' },
  'characters': { title: 'E-Soul 角色数据库', icon: '👥' },
  'scenarios': { title: '互动剧本库', icon: '📜' },
  'events': { title: '剧本事件管理', icon: '🎯' },
  'items': { title: '剧本物品管理', icon: '🎁' },
  'main-stories': { title: '主线剧情管理', icon: '📖' },
  'invite-codes': { title: '邀请码管理', icon: '🎫' },
  'api-keys': { title: 'API Key管理', icon: '🔑' },
  'settings': { title: '系统全局设置', icon: '⚙️' },
  'resources': { title: '资源管理', icon: '🖼️' },
  'subscription-plans': { title: '会员配置管理', icon: '💎' },
  'email-config': { title: '邮箱配置', icon: '📧' },
  'users': { title: '用户管理', icon: '👤' },
  'admins': { title: '系统管理员管理', icon: '🔐' },
  'billing': { title: '计费管理', icon: '💳' },
  'heartsphere-connection': { title: '心域连接管理', icon: '🔗' },
  'memory': { title: '记忆系统管理', icon: '🧠' },
  'graph': { title: 'Graph流程编辑器', icon: '🔄' },
  'skills': { title: '技能管理', icon: '⚡' },
  'chronos-letters': { title: '超时空信箱管理', icon: '✉️' },
  'plugins': { title: '插件管理', icon: '🔌' },
  'prompts': { title: '提示词管理', icon: '💬' },
  // 已禁用：AgentScope 演示管理（仅用于演示，不用于生产部署）
  // 'agentscope-demo': { title: 'AgentScope 演示管理', icon: '🔧' },
  'edu-dashboard': { title: '教育版概览', icon: '📊' },
  'edu-students': { title: '学生管理', icon: '👨‍🎓' },
  'edu-teachers': { title: '教师管理', icon: '👨‍🏫' },
  'edu-content': { title: '内容管理', icon: '📚' },
  'edu-content-review': { title: '内容审核', icon: '✅' },
  'edu-analytics': { title: '数据分析', icon: '📈' },
  'edu-settings': { title: '教育版系统设置', icon: '⚙️' },
  'mentis-management': { title: 'Mentis 管理', icon: '🤖' },
  'mcp-management': { title: 'MCP 管理', icon: '🔌' },
  'agent-mind-management': { title: 'Agent Mind 管理', icon: '🧠' },
  'devops-workbench': { title: 'DevOps 工作台', icon: '🔧' },
  'devops-overview': { title: '概览', icon: '📊' },
  'devops-scan': { title: '代码扫描', icon: '🔍' },
  'devops-test': { title: '测试', icon: '🧪' },
  'devops-build': { title: '构建部署', icon: '🚀' },
  'devops-database': { title: '数据库', icon: '💾' },
  'devops-server': { title: '服务器', icon: '🖥️' },
  'devops-scheduled': { title: '定时任务', icon: '⏰' },
  'devops-pipeline': { title: '部署流程', icon: '🔄' },
  'devops-cmdb': { title: 'CMDB', icon: '🗄️' },
  'devops-autofix': { title: '自动修复', icon: '🔧' },
  'multi-agent-management': { title: '多智能体协作', icon: '🤝' },
  'images': { title: '图片管理', icon: '🖼️' },
  'videos': { title: '视频管理', icon: '🎬' },
};

export const getSectionMetadata = (section: SectionType): SectionMetadata => {
  return sectionMetadataMap[section] || { title: section, icon: '📄' };
};

export const getSectionTitle = (section: SectionType): string => {
  return getSectionMetadata(section).title;
};

export const getSectionIcon = (section: SectionType): string => {
  return getSectionMetadata(section).icon;
};

/** 校验 URL 参数是否为合法 section，便于深链 /admin?section=skills */
export function isValidSection(s: string): s is SectionType {
  return s in sectionMetadataMap;
}
