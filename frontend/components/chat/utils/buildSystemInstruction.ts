/**
 * 系统指令构建工具函数
 * 统一构建AI调用的系统指令，消除重复代码
 */

import { Character, AppSettings, UserProfile } from '../../../types';
import { createScenarioContext } from '../../../constants';

/**
 * 获取对话风格指令
 */
function getDialogueStyleInstruction(dialogueStyle: string): string {
  switch (dialogueStyle) {
    case 'mobile-chat':
      return `\n\n[对话风格：即时网聊]
- 使用短句，像微信聊天一样自然
- 可以适当使用 Emoji 表情（😊、😢、🤔、💭 等）
- 动作描写用 *动作内容* 格式，例如：*轻轻拍了拍你的肩膀*
- 节奏要快，回复要简洁有力
- 语气要轻松、亲切，像和朋友聊天
- 避免冗长的描述，重点突出对话和互动`;
    case 'visual-novel':
      return `\n\n[对话风格：沉浸小说]
- 侧重心理描写和环境渲染
- 辞藻优美，富有文学性
- 像读轻小说一样，有代入感和画面感
- 可以详细描述角色的内心活动、表情、动作
- 适当描写周围环境，营造氛围
- 回复可以较长，但要保持节奏感
- 注重情感表达和细节刻画`;
    case 'stage-script':
      return `\n\n[对话风格：剧本独白]
- 格式严格：动作用 [动作内容] 表示，台词直接说
- 例如：[缓缓转身] 你来了...
- 干脆利落，适合作为创作大纲
- 动作和台词要清晰分离
- 避免过多的心理描写，重点在动作和对话
- 风格要简洁、有力，像舞台剧脚本`;
    case 'poetic':
      return `\n\n[对话风格：诗意留白]
- 极简、隐晦、富有哲理
- 像《主要还是看气质》或《光遇》的风格
- 用词要精炼，意境要深远
- 可以适当留白，让读者自己体会
- 避免直白的表达，多用隐喻和象征
- 节奏要慢，每个字都要有分量
- 注重氛围和情感，而非具体情节`;
    default:
      return '';
  }
}

/**
 * 构建系统指令
 * 
 * @param character 角色信息
 * @param settings 应用设置
 * @param userProfile 用户信息
 * @param additionalContext 额外上下文（如场景节点说明）
 * @returns 完整的系统指令字符串
 */
export function buildSystemInstruction(
  character: Character,
  settings: AppSettings,
  userProfile: UserProfile | null,
  additionalContext?: string
): string {
  let instruction = character.systemInstruction || '';
  
  // 角色属性
  if (character.mbti) {
    instruction += `\nMBTI: ${character.mbti}`;
  }
  if (character.speechStyle) {
    instruction += `\nSpeaking Style: ${character.speechStyle}`;
  }
  if (character.catchphrases && character.catchphrases.length > 0) {
    instruction += `\nCommon Phrases: ${character.catchphrases.join(', ')}`;
  }
  if (character.secrets) {
    instruction += `\nSecrets: ${character.secrets}`;
  }
  if (character.motivations) {
    instruction += `\nMotivations: ${character.motivations}`;
  }
  if (character.relationships) {
    instruction += `\nRelationships: ${character.relationships}`;
  }
  
  // 对话风格
  const dialogueStyle = settings?.dialogueStyle || 'mobile-chat';
  instruction += getDialogueStyleInstruction(dialogueStyle);
  
  // 用户上下文
  if (userProfile) {
    const scenarioContext = createScenarioContext(userProfile);
    instruction = `${scenarioContext}\n\n${instruction}`;
  }
  
  // 额外上下文（如场景节点说明、剧本上下文等）
  if (additionalContext) {
    instruction += `\n\n${additionalContext}`;
  }
  
  return instruction;
}
