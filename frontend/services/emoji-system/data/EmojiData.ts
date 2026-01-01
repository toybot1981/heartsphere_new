/**
 * 表情数据
 * 包含基础表情库
 */

import { Emoji, EmojiCategory } from '../types/EmojiTypes';

/**
 * 基础表情库
 */
export const EMOJI_DATA: Emoji[] = [
  // 笑脸和人物
  { id: 'smile', code: '😊', name: '微笑', category: EmojiCategory.SMILEYS, keywords: ['微笑', '开心', '高兴', 'smile', 'happy'], isCustom: false },
  { id: 'grinning', code: '😄', name: '大笑', category: EmojiCategory.SMILEYS, keywords: ['大笑', '开心', '高兴', 'grinning', 'laugh'], isCustom: false },
  { id: 'joy', code: '😂', name: '笑哭', category: EmojiCategory.SMILEYS, keywords: ['笑哭', '开心', 'joy', 'laugh'], isCustom: false },
  { id: 'heart_eyes', code: '😍', name: '花痴', category: EmojiCategory.SMILEYS, keywords: ['花痴', '喜欢', '爱', 'heart', 'love'], isCustom: false },
  { id: 'kissing_heart', code: '😘', name: '飞吻', category: EmojiCategory.SMILEYS, keywords: ['飞吻', '亲', 'kiss', 'love'], isCustom: false },
  { id: 'wink', code: '😉', name: '眨眼', category: EmojiCategory.SMILEYS, keywords: ['眨眼', 'wink'], isCustom: false },
  { id: 'thinking', code: '🤔', name: '思考', category: EmojiCategory.SMILEYS, keywords: ['思考', '想', 'thinking'], isCustom: false },
  { id: 'sad', code: '😢', name: '哭泣', category: EmojiCategory.SMILEYS, keywords: ['哭泣', '难过', 'sad', 'cry'], isCustom: false },
  { id: 'angry', code: '😠', name: '生气', category: EmojiCategory.SMILEYS, keywords: ['生气', '愤怒', 'angry', 'mad'], isCustom: false },
  { id: 'surprised', code: '😲', name: '惊讶', category: EmojiCategory.SMILEYS, keywords: ['惊讶', 'surprised', 'shocked'], isCustom: false },
  { id: 'sleepy', code: '😴', name: '睡觉', category: EmojiCategory.SMILEYS, keywords: ['睡觉', '困', 'sleepy', 'sleep'], isCustom: false },
  { id: 'cool', code: '😎', name: '酷', category: EmojiCategory.SMILEYS, keywords: ['酷', 'cool'], isCustom: false },
  { id: 'hug', code: '🤗', name: '拥抱', category: EmojiCategory.SMILEYS, keywords: ['拥抱', 'hug'], isCustom: false },
  { id: 'thumbsup', code: '👍', name: '点赞', category: EmojiCategory.SMILEYS, keywords: ['点赞', '好', 'thumbsup', 'like'], isCustom: false },
  { id: 'clap', code: '👏', name: '鼓掌', category: EmojiCategory.SMILEYS, keywords: ['鼓掌', 'clap', 'applause'], isCustom: false },
  { id: 'pray', code: '🙏', name: '祈祷', category: EmojiCategory.SMILEYS, keywords: ['祈祷', 'pray'], isCustom: false },
  { id: 'ok', code: '👌', name: '好的', category: EmojiCategory.SMILEYS, keywords: ['好的', 'ok'], isCustom: false },
  { id: 'love', code: '❤️', name: '爱心', category: EmojiCategory.SYMBOLS, keywords: ['爱心', '爱', 'love', 'heart'], isCustom: false },
  { id: 'sparkles', code: '✨', name: '闪光', category: EmojiCategory.SYMBOLS, keywords: ['闪光', '星星', 'sparkles', 'star'], isCustom: false },
  { id: 'fire', code: '🔥', name: '火焰', category: EmojiCategory.SYMBOLS, keywords: ['火焰', '火', 'fire'], isCustom: false },
  { id: 'star', code: '⭐', name: '星星', category: EmojiCategory.SYMBOLS, keywords: ['星星', 'star'], isCustom: false },
  { id: 'rainbow', code: '🌈', name: '彩虹', category: EmojiCategory.SYMBOLS, keywords: ['彩虹', 'rainbow'], isCustom: false },
  { id: 'sun', code: '☀️', name: '太阳', category: EmojiCategory.SYMBOLS, keywords: ['太阳', 'sun'], isCustom: false },
  { id: 'moon', code: '🌙', name: '月亮', category: EmojiCategory.SYMBOLS, keywords: ['月亮', 'moon'], isCustom: false },
  { id: 'heart_blue', code: '💙', name: '蓝心', category: EmojiCategory.SYMBOLS, keywords: ['蓝心', 'heart'], isCustom: false },
  { id: 'heart_green', code: '💚', name: '绿心', category: EmojiCategory.SYMBOLS, keywords: ['绿心', 'heart'], isCustom: false },
  { id: 'heart_yellow', code: '💛', name: '黄心', category: EmojiCategory.SYMBOLS, keywords: ['黄心', 'heart'], isCustom: false },
  { id: 'heart_purple', code: '💜', name: '紫心', category: EmojiCategory.SYMBOLS, keywords: ['紫心', 'heart'], isCustom: false },
  { id: 'rose', code: '🌹', name: '玫瑰', category: EmojiCategory.ANIMALS, keywords: ['玫瑰', '花', 'rose', 'flower'], isCustom: false },
  { id: 'coffee', code: '☕', name: '咖啡', category: EmojiCategory.FOOD, keywords: ['咖啡', 'coffee'], isCustom: false },
  { id: 'cake', code: '🎂', name: '蛋糕', category: EmojiCategory.FOOD, keywords: ['蛋糕', 'cake', 'birthday'], isCustom: false },
  { id: 'gift', code: '🎁', name: '礼物', category: EmojiCategory.OBJECTS, keywords: ['礼物', 'gift', 'present'], isCustom: false },
  { id: 'party', code: '🎉', name: '庆祝', category: EmojiCategory.ACTIVITIES, keywords: ['庆祝', 'party', 'celebration'], isCustom: false },
  { id: 'balloon', code: '🎈', name: '气球', category: EmojiCategory.OBJECTS, keywords: ['气球', 'balloon'], isCustom: false },
];

/**
 * 根据分类获取表情
 */
export function getEmojisByCategory(category: EmojiCategory): Emoji[] {
  if (category === EmojiCategory.RECENT || category === EmojiCategory.FREQUENT) {
    return []; // 这些需要从使用记录中获取
  }
  return EMOJI_DATA.filter((emoji) => emoji.category === category);
}

/**
 * 搜索表情
 */
export function searchEmojis(query: string): Emoji[] {
  if (!query.trim()) {
    return EMOJI_DATA;
  }

  const lowerQuery = query.toLowerCase();
  return EMOJI_DATA.filter(
    (emoji) =>
      emoji.name.toLowerCase().includes(lowerQuery) ||
      emoji.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 根据ID获取表情
 */
export function getEmojiById(id: string): Emoji | undefined {
  return EMOJI_DATA.find((emoji) => emoji.id === id);
}

/**
 * 获取分类图标
 */
export function getCategoryIcon(category: EmojiCategory): string {
  const icons: Record<EmojiCategory, string> = {
    [EmojiCategory.SMILEYS]: '😊',
    [EmojiCategory.ANIMALS]: '🐱',
    [EmojiCategory.FOOD]: '🍕',
    [EmojiCategory.ACTIVITIES]: '⚽',
    [EmojiCategory.TRAVEL]: '✈️',
    [EmojiCategory.OBJECTS]: '📱',
    [EmojiCategory.SYMBOLS]: '❤️',
    [EmojiCategory.FLAGS]: '🏳️',
    [EmojiCategory.CUSTOM]: '🎨',
    [EmojiCategory.RECENT]: '🕐',
    [EmojiCategory.FREQUENT]: '⭐',
  };
  return icons[category] || '😊';
}




