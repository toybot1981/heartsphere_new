/**
 * 卡片系统类型定义
 */

/**
 * 卡片类型
 */
export enum CardType {
  GREETING = 'greeting', // 问候
  BLESSING = 'blessing', // 祝福
  THANKS = 'thanks', // 感谢
  ENCOURAGEMENT = 'encouragement', // 鼓励
  CONGRATULATION = 'congratulation', // 祝贺
  SYMPATHY = 'sympathy', // 慰问
  CUSTOM = 'custom', // 自定义
}

/**
 * 背景类型
 */
export type BackgroundType = 'color' | 'image' | 'gradient';

/**
 * 卡片布局类型
 */
export type LayoutType = 'simple' | 'centered' | 'split' | 'framed';

/**
 * 位置类型
 */
export type PositionType = 'top' | 'center' | 'bottom';

/**
 * 卡片布局
 */
export interface CardLayout {
  type: LayoutType;
  titlePosition: PositionType;
  contentPosition: PositionType;
  imagePosition?: 'left' | 'right' | 'center' | 'background';
}

/**
 * 卡片背景
 */
export interface CardBackground {
  type: BackgroundType;
  value: string; // 颜色值、图片URL或渐变配置
}

/**
 * 卡片样式
 */
export interface CardStyle {
  titleFont: string;
  titleColor: string;
  titleSize: number;
  contentFont: string;
  contentColor: string;
  contentSize: number;
  layout: CardLayout;
}

/**
 * 卡片装饰
 */
export interface CardDecorations {
  emojis?: string[]; // 装饰表情
  images?: string[]; // 装饰图片
  patterns?: string[]; // 装饰图案
}

/**
 * 卡片模板
 */
export interface CardTemplate {
  id: string;
  name: string;
  type: CardType;
  category: string;
  previewImage: string; // 预览图URL
  background: CardBackground;
  layout: CardLayout;
  defaultStyle: {
    titleFont: string;
    titleColor: string;
    titleSize: number;
    contentFont: string;
    contentColor: string;
    contentSize: number;
  };
}

/**
 * 卡片
 */
export interface Card {
  id: string;
  userId: number;
  templateId?: string;
  type: CardType;
  title: string;
  content: string;
  background: CardBackground;
  style: CardStyle;
  decorations?: CardDecorations;
  createdAt: number;
}

/**
 * 卡片消息
 */
export interface CardMessage {
  id: string;
  senderId: number;
  recipientId: number;
  cardId: string;
  message?: string; // 附加消息
  isRead: boolean;
  sentAt: number;
  readAt?: number;
}

/**
 * 卡片制作器配置
 */
export interface CardMakerConfig {
  templateId?: string; // 预设模板ID
  initialCard?: Partial<Card>; // 初始卡片数据
  onSave?: (card: Card) => void;
  onSend?: (card: Card, recipientId: number) => void;
  onClose: () => void;
}



