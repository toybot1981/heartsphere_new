/**
 * 旧新信箱系统数据迁移服务
 * 
 * 负责将旧的信箱数据（Mail）迁移到新的统一信箱系统（MailboxMessage）
 * 
 * @author HeartSphere
 * @version 1.0
 */

import { MessageCategory, MessageType, SenderType, CreateMessageRequest } from '../../types/mailbox';
import { mailboxApi } from '../api/mailbox';

// 旧的Mail类型定义（从types/index.ts推断）
export interface OldMail {
  id: string;
  type: string; // 'chronos_letter', 'user_feedback' 等
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  themeColor?: string;
  timestamp: number; // Unix timestamp
  isRead: boolean;
  replies?: OldMail[];
}

/**
 * 将旧Mail类型转换为新MailboxMessage的CreateMessageRequest
 */
export function convertOldMailToNewMessage(
  oldMail: OldMail, 
  userId: number
): CreateMessageRequest {
  // 根据旧的type字段确定新的分类和类型
  let messageCategory: MessageCategory;
  let messageType: MessageType;
  let senderType: SenderType;
  
  if (oldMail.type === 'chronos_letter') {
    messageCategory = MessageCategory.ESOUL_LETTER;
    messageType = MessageType.ESOUL_GREETING; // 默认，可能需要根据内容判断
    senderType = SenderType.ESOUL;
  } else if (oldMail.type === 'user_feedback') {
    messageCategory = MessageCategory.SYSTEM;
    messageType = MessageType.SYSTEM_FEEDBACK;
    senderType = SenderType.SYSTEM;
  } else {
    // 默认处理
    messageCategory = MessageCategory.SYSTEM;
    messageType = MessageType.SYSTEM_NOTIFICATION;
    senderType = SenderType.SYSTEM;
  }
  
  // 确保senderType使用枚举值（字符串形式）
  return {
    receiverId: userId,
    senderType: senderType, // 已经是枚举值，会被序列化为字符串
    senderId: senderType === SenderType.USER ? parseInt(oldMail.senderId) : undefined,
    senderName: oldMail.senderName,
    senderAvatar: oldMail.senderAvatarUrl,
    messageType: messageType, // 枚举值，会被序列化为字符串
    messageCategory: messageCategory, // 枚举值，会被序列化为字符串
    title: oldMail.subject,
    content: oldMail.content,
    isRead: oldMail.isRead,
    isImportant: false,
    isStarred: false,
    contentData: oldMail.themeColor ? JSON.stringify({ themeColor: oldMail.themeColor }) : undefined,
  };
}

/**
 * 批量迁移旧信箱数据到新系统
 */
export async function migrateOldMailsToNewSystem(
  oldMails: OldMail[],
  userId: number,
  token: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };
  
  console.log('[MailMigrationService] 开始迁移旧信箱数据，数量:', oldMails.length);
  
  for (const oldMail of oldMails) {
    try {
      // 检查是否已迁移（通过title和content匹配，或者使用contentData存储旧ID）
      const createRequest = convertOldMailToNewMessage(oldMail, userId);
      
      // 在contentData中保存旧的ID，用于去重检查
      let existingData: any = {};
      if (createRequest.contentData) {
        try {
          existingData = typeof createRequest.contentData === 'string' 
            ? JSON.parse(createRequest.contentData) 
            : createRequest.contentData;
        } catch {
          existingData = {};
        }
      }
      existingData.oldMailId = oldMail.id;
      existingData.migratedFrom = 'old_mailbox';
      existingData.oldTimestamp = oldMail.timestamp;
      createRequest.contentData = JSON.stringify(existingData);
      
      // 调用新API创建消息
      await mailboxApi.createMessage(createRequest, token);
      results.success++;
      
      console.log(`[MailMigrationService] ✅ 迁移成功: ${oldMail.id} -> ${oldMail.subject}`);
    } catch (error: any) {
      results.failed++;
      const errorMsg = `迁移失败 ${oldMail.id}: ${error.message}`;
      results.errors.push(errorMsg);
      console.error(`[MailMigrationService] ❌ ${errorMsg}`, error);
    }
  }
  
  console.log('[MailMigrationService] 迁移完成:', results);
  return results;
}

/**
 * 检查是否有旧信箱数据需要迁移
 */
export function hasOldMailData(mails: OldMail[] | undefined | null): boolean {
  return mails && mails.length > 0;
}

/**
 * 检查用户是否已迁移过数据（通过检查新系统中是否有migratedFrom标记的消息）
 */
export async function checkMigrationStatus(
  userId: number,
  token: string
): Promise<{ migrated: boolean; migratedCount: number }> {
  try {
    // 查询新系统中是否有标记为已迁移的消息
    const messages = await mailboxApi.getMessages({
      page: 0,
      size: 100, // 获取足够多的消息来检查
    }, token);
    
    let migratedCount = 0;
    for (const msg of messages.content || []) {
      if (msg.contentData) {
        try {
          const data = JSON.parse(msg.contentData);
          if (data.migratedFrom === 'old_mailbox') {
            migratedCount++;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
    
    return {
      migrated: migratedCount > 0,
      migratedCount,
    };
  } catch (error) {
    console.error('[MailMigrationService] 检查迁移状态失败:', error);
    return { migrated: false, migratedCount: 0 };
  }
}

