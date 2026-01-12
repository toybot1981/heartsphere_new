/**
 * Gemini Service 兼容层
 * 
 * 注意：此文件仅用于向后兼容，新的代码应该直接使用 aiService
 * 
 * 迁移指南：
 * - 旧代码：import { geminiService } from './services/gemini'
 * - 新代码：import { aiService } from './services/ai/AIService'
 * 
 * 方法映射：
 * - geminiService.updateConfig(settings) → aiService.updateConfigFromAppSettings(settings)
 * - geminiService.setLogCallback(callback) → aiService.setLogCallback(callback)
 * - geminiService.resetSession() → aiService.resetSession()
 * - 其他业务方法已迁移到 aiService.businessServices.*
 */

// 兼容层：向后兼容旧代码
// 注意：新的代码应该使用 aiService 代替 geminiService
// 请使用 import { aiService } from './ai/AIService' 代替
export { aiService as geminiService } from './ai/AIService';
