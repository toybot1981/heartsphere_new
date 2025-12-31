/**
 * 卡片模板数据
 */

import { CardTemplate, CardType, CardBackground, CardLayout } from '../types/CardTypes';

/**
 * 预设卡片模板
 */
export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'greeting-001',
    name: '早安问候',
    type: CardType.GREETING,
    category: 'greeting',
    previewImage: '/templates/greeting-001.png',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #FFE5E5 0%, #FFB3B3 100%)',
    },
    layout: {
      type: 'centered',
      titlePosition: 'top',
      contentPosition: 'center',
    },
    defaultStyle: {
      titleFont: 'Microsoft YaHei',
      titleColor: '#333',
      titleSize: 32,
      contentFont: 'Microsoft YaHei',
      contentColor: '#666',
      contentSize: 18,
    },
  },
  {
    id: 'greeting-002',
    name: '晚安问候',
    type: CardType.GREETING,
    category: 'greeting',
    previewImage: '/templates/greeting-002.png',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    },
    layout: {
      type: 'centered',
      titlePosition: 'top',
      contentPosition: 'center',
    },
    defaultStyle: {
      titleFont: 'Microsoft YaHei',
      titleColor: '#1976D2',
      titleSize: 32,
      contentFont: 'Microsoft YaHei',
      contentColor: '#424242',
      contentSize: 18,
    },
  },
  {
    id: 'encouragement-001',
    name: '鼓励卡片',
    type: CardType.ENCOURAGEMENT,
    category: 'encouragement',
    previewImage: '/templates/encouragement-001.png',
    background: {
      type: 'color',
      value: '#FFF8E1',
    },
    layout: {
      type: 'centered',
      titlePosition: 'center',
      contentPosition: 'center',
    },
    defaultStyle: {
      titleFont: 'KaiTi',
      titleColor: '#FF6F00',
      titleSize: 36,
      contentFont: 'Microsoft YaHei',
      contentColor: '#FF8F00',
      contentSize: 20,
    },
  },
  {
    id: 'thanks-001',
    name: '感谢卡片',
    type: CardType.THANKS,
    category: 'thanks',
    previewImage: '/templates/thanks-001.png',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
    },
    layout: {
      type: 'centered',
      titlePosition: 'top',
      contentPosition: 'center',
    },
    defaultStyle: {
      titleFont: 'Microsoft YaHei',
      titleColor: '#7B1FA2',
      titleSize: 32,
      contentFont: 'Microsoft YaHei',
      contentColor: '#9C27B0',
      contentSize: 18,
    },
  },
  {
    id: 'blessing-001',
    name: '祝福卡片',
    type: CardType.BLESSING,
    category: 'blessing',
    previewImage: '/templates/blessing-001.png',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    },
    layout: {
      type: 'centered',
      titlePosition: 'top',
      contentPosition: 'center',
    },
    defaultStyle: {
      titleFont: 'KaiTi',
      titleColor: '#2E7D32',
      titleSize: 36,
      contentFont: 'Microsoft YaHei',
      contentColor: '#4CAF50',
      contentSize: 20,
    },
  },
  {
    id: 'congratulation-001',
    name: '祝贺卡片',
    type: CardType.CONGRATULATION,
    category: 'congratulation',
    previewImage: '/templates/congratulation-001.png',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    },
    layout: {
      type: 'centered',
      titlePosition: 'top',
      contentPosition: 'center',
    },
    defaultStyle: {
      titleFont: 'Microsoft YaHei',
      titleColor: '#E65100',
      titleSize: 32,
      contentFont: 'Microsoft YaHei',
      contentColor: '#FF6F00',
      contentSize: 18,
    },
  },
];

/**
 * 根据类型获取模板
 */
export function getTemplatesByType(type: CardType): CardTemplate[] {
  return CARD_TEMPLATES.filter((template) => template.type === type);
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id: string): CardTemplate | undefined {
  return CARD_TEMPLATES.find((template) => template.id === id);
}

/**
 * 获取所有模板
 */
export function getAllTemplates(): CardTemplate[] {
  return CARD_TEMPLATES;
}



