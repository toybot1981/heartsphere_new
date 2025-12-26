/**
 * 同步配置初始化
 * 注册所有需要同步的实体类型的配置
 */

import { syncService } from './SyncService';
import { journalApi } from '../../services/api';
import { JournalEntry, SyncStatus } from '../../types';

/**
 * 初始化同步配置
 */
export function initSyncConfigs(): void {
  // 注册日记条目的同步配置
  syncService.registerSyncConfig<JournalEntry>({
    entityType: 'journal',
    storageKey: 'journal_entries',
    createApi: async (entity: JournalEntry, token: string) => {
      const apiRequestData: any = {
        title: entity.title,
        content: entity.content,
        entryDate: new Date(entity.timestamp).toISOString()
      };
      if (entity.tags) {
        apiRequestData.tags = entity.tags;
      }
      if (entity.insight) {
        apiRequestData.insight = entity.insight;
      }
      if (entity.imageUrl) {
        apiRequestData.imageUrl = entity.imageUrl;
      }
      const savedEntry = await journalApi.createJournalEntry(apiRequestData, token);
      return {
        ...entity,
        id: savedEntry.id.toString(),
        timestamp: new Date(savedEntry.entryDate || Date.now()).getTime(),
        insight: savedEntry.insight,
        tags: savedEntry.tags,
        imageUrl: savedEntry.imageUrl,
      } as JournalEntry;
    },
    updateApi: async (id: string, entity: Partial<JournalEntry>, token: string) => {
      const apiRequestData: any = {
        title: entity.title,
        content: entity.content,
        entryDate: entity.timestamp ? new Date(entity.timestamp).toISOString() : new Date().toISOString()
      };
      if (entity.tags) {
        apiRequestData.tags = entity.tags;
      }
      if (entity.insight !== undefined && entity.insight !== null) {
        apiRequestData.insight = entity.insight;
      }
      if (entity.imageUrl) {
        apiRequestData.imageUrl = entity.imageUrl;
      }
      const savedEntry = await journalApi.updateJournalEntry(id, apiRequestData, token);
      return {
        ...entity,
        id: savedEntry.id.toString(),
        timestamp: new Date(savedEntry.entryDate || Date.now()).getTime(),
        insight: savedEntry.insight,
        tags: savedEntry.tags,
        imageUrl: savedEntry.imageUrl,
      } as JournalEntry;
    },
    deleteApi: async (id: string, token: string) => {
      await journalApi.deleteJournalEntry(id, token);
    },
    queryApi: async (token: string) => {
      const entries = await journalApi.getAllJournalEntries(token);
      return entries;
    },
    transformQueryResult: (serverEntry: any): JournalEntry => {
      return {
        id: serverEntry.id.toString(),
        title: serverEntry.title,
        content: serverEntry.content,
        timestamp: new Date(serverEntry.entryDate).getTime(),
        imageUrl: serverEntry.imageUrl || undefined,
        insight: serverEntry.insight || undefined,
        tags: serverEntry.tags || undefined,
      } as JournalEntry;
    },
  });

  console.log('[syncConfig] 同步配置初始化完成');
}

