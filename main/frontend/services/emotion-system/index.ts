/**
 * 情绪感知系统入口
 */

export { EmotionSystem } from './EmotionSystem';
export { TextEmotionRecognizer } from './recognizers/TextEmotionRecognizer';
export { BehaviorEmotionRecognizer } from './recognizers/BehaviorEmotionRecognizer';
export { TimeEmotionRecognizer } from './recognizers/TimeEmotionRecognizer';
export { EmotionFusion } from './EmotionFusion';
export { EmotionAnalyzer, LocalEmotionStorage } from './storage/EmotionStorage';
export type { IEmotionStorage } from './storage/EmotionStorage';
export { EmotionResponseGenerator } from './response/EmotionResponseGenerator';
export { useEmotionSystem } from './hooks/useEmotionSystem';

export * from './types/EmotionTypes';

