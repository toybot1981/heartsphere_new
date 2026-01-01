/**
 * 邮箱相关工具函数
 * 
 * @author HeartSphere
 * @version 1.0
 */

import { MailboxMessage, MessageCategory, SenderType } from '../types/mailbox';

/**
 * 判断是否为E-SOUL来信
 */
export function isESoulLetter(message: MailboxMessage): boolean {
  return message.messageCategory === MessageCategory.ESOUL_LETTER || 
         message.senderType === SenderType.ESOUL;
}

/**
 * 判断是否为共鸣消息
 */
export function isResonanceMessage(message: MailboxMessage): boolean {
  return message.messageCategory === MessageCategory.RESONANCE || 
         message.senderType === SenderType.HEARTSPHERE;
}

/**
 * 判断是否为系统消息
 */
export function isSystemMessage(message: MailboxMessage): boolean {
  return message.messageCategory === MessageCategory.SYSTEM || 
         message.senderType === SenderType.SYSTEM;
}

/**
 * 判断是否为用户消息
 */
export function isUserMessage(message: MailboxMessage): boolean {
  return message.messageCategory === MessageCategory.USER_MESSAGE || 
         message.senderType === SenderType.USER;
}
