import { GameState, JournalEntry, WorldScene, CustomScenario, Character } from '../types';
import { storageService } from './storage';
import { journalApi, worldApi, eraApi, characterApi, scriptApi } from './api';
import { WORLD_SCENES } from '../constants';

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

// Scene ID to World ID mapping
// This should be maintained to map frontend scene IDs to backend world IDs
// For built-in scenes, we'll use default mappings
// For custom scenes, we'll need to store mappings when they are created
export const SCENE_WORLD_MAPPING: { [sceneId: string]: number } = {
  'university_era': 1,  // 大学场景
  'cyberpunk_city': 2,  // 赛博都市
  'clinic': 3           // 心域诊所
};

// Custom scene mappings - this will be loaded from storage
export let customSceneMappings: { [sceneId: string]: number } = {};

export interface SyncLog {
  id: string;
  timestamp: number;
  type: 'sync_start' | 'sync_complete' | 'sync_error' | 'data_conflict';
  message: string;
  details?: any;
}

// Data types for server API (matching backend models)
export interface ServerJournalEntry {
  id: string;
  title: string;
  content: string;
  entryDate: string;
  worldId?: string;
  eraId?: string;
  characterId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerWorld {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerEra {
  id: string;
  name: string;
  description: string;
  startYear?: number;
  endYear?: number;
  worldId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerCharacter {
  id: string;
  name: string;
  description: string;
  age?: number;
  gender?: string;
  worldId: string;
  eraId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const syncService = {
  // Current sync status
  syncStatus: 'idle' as SyncStatus,
  syncLogs: [] as SyncLog[],
  lastSyncTime: 0,
  syncInterval: 60000, // 1 minute
  syncIntervalId: null as NodeJS.Timeout | null,

  /**
   * Initialize the sync service and start periodic sync
   */
  init: async () => {
    console.log('Initializing sync service...');
    
    // Load custom scene mappings from storage service
    try {
      const storedMappings = await storageService.getCustomSceneMappings();
      customSceneMappings = storedMappings || {};
      console.log('Loaded custom scene mappings:', customSceneMappings);
    } catch (error) {
      console.error('Failed to load custom scene mappings:', error);
    }
    
    syncService.startPeriodicSync();
  },

  /**
   * Get world ID for a given scene ID
   */
  getWorldIdForSceneId: (sceneId: string): number => {
    // Check built-in scene mappings first
    if (SCENE_WORLD_MAPPING[sceneId]) {
      return SCENE_WORLD_MAPPING[sceneId];
    }
    
    // Then check custom scene mappings
    if (customSceneMappings[sceneId]) {
      return customSceneMappings[sceneId];
    }
    
    // Fallback to default world ID
    return 1;
  },

  /**
   * Save custom scene mapping
   */
  saveCustomSceneMapping: async (sceneId: string, worldId: number): Promise<void> => {
    customSceneMappings[sceneId] = worldId;
    await storageService.saveCustomSceneMappings(customSceneMappings);
    console.log('Saved custom scene mapping:', { sceneId, worldId });
  },

  /**
   * Start periodic syncing
   */
  startPeriodicSync: () => {
    if (syncService.syncIntervalId) {
      clearInterval(syncService.syncIntervalId);
    }

    syncService.syncIntervalId = setInterval(() => {
      if (navigator.onLine) {
        syncService.syncData();
      }
    }, syncService.syncInterval);

    console.log('Periodic sync started');
  },

  /**
   * Stop periodic syncing
   */
  stopPeriodicSync: () => {
    if (syncService.syncIntervalId) {
      clearInterval(syncService.syncIntervalId);
      syncService.syncIntervalId = null;
      console.log('Periodic sync stopped');
    }
  },

  /**
   * Log sync activity
   */
  log: (type: SyncLog['type'], message: string, details?: any) => {
    const log: SyncLog = {
      id: `sync_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      message,
      details
    };

    syncService.syncLogs.push(log);
    // Keep only the last 100 logs
    if (syncService.syncLogs.length > 100) {
      syncService.syncLogs.shift();
    }

    console.log(`[Sync] ${type}: ${message}`, details);
  },

  /**
   * Sync all data between local storage and server
   */
  syncData: async (): Promise<void> => {
    if (syncService.syncStatus === 'syncing') {
      console.log('Sync already in progress');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('No authentication token found, skipping sync');
      return;
    }

    syncService.syncStatus = 'syncing';
    syncService.log('sync_start', 'Starting data sync...');

    try {
      // Load local state
      const localState = await storageService.loadState();
      if (!localState) {
        throw new Error('No local state found');
      }

      // Sync journal entries
      await syncService.syncJournalEntries(localState.journalEntries || [], token);

      // Sync worlds (custom scenes)
      await syncService.syncWorlds(localState.customScenes || [], token);

      // TODO: Sync other data types (eras, characters, etc.) as needed

      syncService.syncStatus = 'synced';
      syncService.lastSyncTime = Date.now();
      syncService.log('sync_complete', 'Data sync completed successfully');
    } catch (error) {
      syncService.syncStatus = 'error';
      syncService.log('sync_error', 'Data sync failed', error);
      console.error('Sync error:', error);
    }
  },

  /**
   * Sync journal entries between local and server
   */
  syncJournalEntries: async (localEntries: JournalEntry[], token: string): Promise<void> => {
    try {
      // Get server entries
      const serverEntries = await journalApi.getAllJournalEntries(token);
      
      // Convert server entries to local format
      const formattedServerEntries: JournalEntry[] = serverEntries.map((entry: any) => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        timestamp: new Date(entry.entryDate).getTime(),
        imageUrl: entry.imageUrl
      }));

      // Create a map of server entries by ID
      const serverEntryMap = new Map(formattedServerEntries.map(entry => [entry.id, entry]));
      const localEntryMap = new Map(localEntries.map(entry => [entry.id, entry]));

      // Entries to add to server (local entries not on server)
      // 修复：只同步待同步(syncStatus=0)或同步失败(syncStatus=-1)的条目
      // 跳过已同步(syncStatus=1)的条目，避免重复保存
      // 同时跳过临时ID且正在被handleAddJournalEntry处理的条目（syncStatus=0的临时ID条目）
      const entriesToAdd = localEntries.filter(entry => {
        // 如果条目已同步，不需要再次保存
        if (entry.syncStatus === 1) {
          return false;
        }
        // 如果条目不在服务器上，且是待同步或同步失败状态，需要添加
        if (!serverEntryMap.has(entry.id)) {
          // 对于临时ID（entry_或e_开头）且syncStatus=0的条目，说明正在被handleAddJournalEntry处理
          // 应该跳过，让handleAddJournalEntry自己处理，避免重复保存
          if ((entry.id.startsWith('entry_') || entry.id.startsWith('e_')) && entry.syncStatus === 0) {
            console.log('[syncJournalEntries] 跳过正在处理的临时条目:', entry.id);
            return false;
          }
          return true;
        }
        return false;
      });
      
      // Entries to update on server (local entries that have changed)
      // 修复：只更新已同步但内容有变化的条目，跳过临时ID的条目
      const entriesToUpdate = localEntries.filter(entry => {
        // 跳过临时ID的条目（这些条目应该通过create处理，而不是update）
        if (entry.id.startsWith('entry_') || entry.id.startsWith('e_')) {
          return false;
        }
        const serverEntry = serverEntryMap.get(entry.id);
        if (!serverEntry) {
          return false;
        }
        // 只更新已同步但内容有变化的条目
        return entry.syncStatus === 1 && (
          entry.title !== serverEntry.title || 
          entry.content !== serverEntry.content || 
          entry.timestamp !== serverEntry.timestamp ||
          entry.tags !== (serverEntry.tags || null) ||
          entry.insight !== (serverEntry.insight || null)
        );
      });

      // Entries to add to local (server entries not local)
      const entriesToLocalAdd = formattedServerEntries.filter(entry => !localEntryMap.has(entry.id));

      // Process additions to server
      // 修复：添加去重检查，避免重复保存
      if (entriesToAdd.length > 0) {
        console.log(`[syncJournalEntries] 准备添加 ${entriesToAdd.length} 个日记条目到服务器`);
      }
      for (const entry of entriesToAdd) {
        try {
          // 再次检查：如果条目已同步，跳过
          if (entry.syncStatus === 1) {
            console.log(`[syncJournalEntries] 跳过已同步的条目: ${entry.id}`);
            continue;
          }
          
          await journalApi.createJournalEntry(
            {
              title: entry.title,
              content: entry.content,
              entryDate: new Date(entry.timestamp).toISOString(),
              tags: entry.tags,
              insight: entry.insight, // 包含insight字段，避免同步时丢失
              worldId: undefined, // TODO: Map local scene ID to server world ID
              eraId: undefined,
              characterId: undefined
            },
            token
          );
          console.log('[syncJournalEntries] 成功添加日记条目到服务器:', entry.id, entry.insight ? `(包含insight, 长度: ${entry.insight.length})` : '(无insight)');
        } catch (error) {
          console.error(`[syncJournalEntries] 添加日记条目失败: ${entry.id}`, error);
          // 继续处理其他条目，不中断整个同步过程
        }
      }

      // Process updates to server
      // 修复：添加日志和错误处理
      if (entriesToUpdate.length > 0) {
        console.log(`[syncJournalEntries] 准备更新 ${entriesToUpdate.length} 个日记条目`);
      }
      for (const entry of entriesToUpdate) {
        try {
          // 再次检查：确保不是临时ID
          if (entry.id.startsWith('entry_') || entry.id.startsWith('e_')) {
            console.log(`[syncJournalEntries] 跳过临时ID的条目: ${entry.id}`);
            continue;
          }
          
          await journalApi.updateJournalEntry(
            entry.id,
            {
              title: entry.title,
              content: entry.content,
              entryDate: new Date(entry.timestamp).toISOString(),
              tags: entry.tags,
              insight: entry.insight, // 包含insight字段，避免同步时覆盖为null
              worldId: undefined,
              eraId: undefined,
              characterId: undefined
            },
            token
          );
          console.log('[syncJournalEntries] 成功更新日记条目:', entry.id, entry.insight ? `(包含insight, 长度: ${entry.insight.length})` : '(无insight)');
        } catch (error) {
          console.error(`[syncJournalEntries] 更新日记条目失败: ${entry.id}`, error);
          // 继续处理其他条目，不中断整个同步过程
        }
      }

      // If there are new entries from server, update local state
      if (entriesToLocalAdd.length > 0) {
        // Load full state to update
        const currentState = await storageService.loadState();
        if (currentState) {
          await storageService.saveState({
            ...currentState,
            journalEntries: [...(currentState.journalEntries || []), ...entriesToLocalAdd]
          } as any);
          console.log('Added', entriesToLocalAdd.length, 'journal entries from server');
        }
      }

    } catch (error) {
      console.error('Error syncing journal entries:', error);
      throw error;
    }
  },

  /**
   * Sync worlds (custom scenes) between local and server
   */
  syncWorlds: async (localScenes: WorldScene[], token: string): Promise<void> => {
    try {
      // Get server worlds
      const serverWorlds = await worldApi.getAllWorlds(token);
      
      // Create a map of server worlds by name (since local IDs are different)
      const serverWorldMap = new Map(serverWorlds.map((world: any) => [world.name, world]));

      // Process local scenes to sync with server
      for (const scene of localScenes) {
        // Skip built-in scenes since they are predefined on both ends
        if (WORLD_SCENES.some(builtIn => builtIn.id === scene.id)) {
          continue;
        }
        
        const serverWorld = serverWorldMap.get(scene.name);
        
        if (serverWorld) {
          // Update existing world
          await worldApi.updateWorld(
            serverWorld.id,
            scene.name,
            scene.description,
            token
          );
          console.log('Updated world on server:', scene.name);
        } else {
          // Create new world
          await worldApi.createWorld(
            scene.name,
            scene.description,
            token
          );
          console.log('Created world on server:', scene.name);
        }
      }

    } catch (error) {
      console.error('Error syncing worlds:', error);
      throw error;
    }
  },

  /**
   * Handle local data changes and sync to server immediately
   * Returns the created/updated data if applicable
   */
  handleLocalDataChange: async (dataType: 'journal' | 'scene' | 'character' | 'scenario', data: any): Promise<any> => {
    if (!navigator.onLine) {
      console.log('Offline, will sync when online');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('No authentication token, skipping sync');
      return;
    }

    try {
      switch (dataType) {
        case 'journal':
          if (data.id) {
            // Update existing entry
            await journalApi.updateJournalEntry(
              data.id,
              {
                title: data.title,
                content: data.content,
                entryDate: new Date(data.timestamp).toISOString(),
                tags: data.tags,
                insight: data.insight, // 包含insight字段，避免同步时覆盖为null
                worldId: undefined,
                eraId: undefined,
                characterId: undefined
              },
              token
            );
          } else {
            // Create new entry
            await journalApi.createJournalEntry(
              {
                title: data.title,
                content: data.content,
                entryDate: new Date(data.timestamp).toISOString(),
                tags: data.tags,
                insight: data.insight, // 包含insight字段
                worldId: undefined,
                eraId: undefined,
                characterId: undefined
              },
              token
            );
          }
          break;
        case 'character':
          // 检查角色ID是否是数字（数据库ID）
          const characterId = data.id ? (typeof data.id === 'string' ? parseInt(data.id) : data.id) : null;
          const isNumericId = characterId !== null && !isNaN(characterId) && characterId > 0;
          
          console.log(`[syncService] 角色同步 - ID解析:`, {
            originalId: data.id,
            originalIdType: typeof data.id,
            parsedId: characterId,
            isNumericId: isNumericId,
            characterName: data.name
          });
          
          // 准备角色数据
          const characterData = {
            name: data.name,
            description: data.description || data.bio || '',
            age: data.age,
            gender: data.gender || data.role || '',
            role: data.role,
            bio: data.bio || data.description || '',
            avatarUrl: data.avatarUrl,
            backgroundUrl: data.backgroundUrl,
            themeColor: data.themeColor,
            colorAccent: data.colorAccent,
            firstMessage: data.firstMessage,
            systemInstruction: data.systemInstruction,
            voiceName: data.voiceName,
            mbti: data.mbti,
            tags: data.tags ? (typeof data.tags === 'string' ? data.tags : (Array.isArray(data.tags) ? data.tags.join(',') : null)) : null,
            speechStyle: data.speechStyle,
            catchphrases: data.catchphrases ? (typeof data.catchphrases === 'string' ? data.catchphrases : (Array.isArray(data.catchphrases) ? data.catchphrases.join(',') : null)) : null,
            secrets: data.secrets,
            motivations: data.motivations,
            relationships: data.relationships,
            worldId: data.worldId || 1,
            eraId: data.eraId || null
          };
          
          if (isNumericId) {
            // 更新现有角色（只更新属于当前用户的角色）
            try {
              await characterApi.updateCharacter(characterId, characterData, token);
              console.log(`[syncService] 角色更新成功: ID=${characterId}`);
            } catch (error: any) {
              // 更新失败，给出明确的错误提示
              const errorMsg = error.message || '';
              let errorReason = '未知错误';
              
              if (errorMsg.includes('403') || errorMsg.includes('权限拒绝')) {
                errorReason = '该角色不属于当前用户，无法更新。请确保您正在编辑自己的角色。';
              } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
                errorReason = '角色不存在或已被删除。';
              } else {
                errorReason = errorMsg || '更新失败，请稍后重试。';
              }
              
              console.error(`[syncService] 角色更新失败: ID=${characterId}, 原因: ${errorReason}`);
              throw new Error(`角色更新失败: ${errorReason}`);
            }
          } else {
            // 创建新角色（非数字ID表示是新创建的角色）
            const createdCharacter = await characterApi.createCharacter(characterData, token);
            console.log(`[syncService] 新角色创建成功: ID=${createdCharacter.id}`);
            return createdCharacter; // 返回创建的角色信息，包含服务器生成的ID
          }
          break;
        case 'scenario':
          // 检查ID是否是数字格式（后端数据库ID），只有数字ID才同步到服务器
          // 如果ID是字符串格式（如 scenario_xxx），说明是本地创建的临时剧本，不需要同步到服务器
          const scenarioIdNum = typeof data.id === 'string' ? parseInt(data.id) : data.id;
          const isScenarioNumericId = !isNaN(scenarioIdNum) && scenarioIdNum > 0;
          
          if (data.id && isScenarioNumericId) {
            // Update existing scenario/script (只有数字ID的才更新)
            console.log('[syncService] 更新scenario到服务器:', { id: scenarioIdNum, title: data.title });
            await scriptApi.updateScript(
              scenarioIdNum,
              {
                title: data.title,
                content: JSON.stringify(data),
                sceneCount: Object.keys(data.nodes || {}).length,
                worldId: data.sceneId ? syncService.getWorldIdForSceneId(data.sceneId) : 1, // Use proper mapping
                eraId: 1 // Default era ID
              },
              token
            );
          } else if (!data.id) {
            // Create new scenario/script (只有没有ID的才创建新剧本)
            console.log('[syncService] 创建新scenario到服务器:', { title: data.title });
            await scriptApi.createScript(
              {
                title: data.title,
                content: JSON.stringify(data),
                sceneCount: Object.keys(data.nodes || {}).length,
                worldId: data.sceneId ? syncService.getWorldIdForSceneId(data.sceneId) : 1, // Use proper mapping
                eraId: 1 // Default era ID
              },
              token
            );
          } else {
            // ID存在但不是数字格式，说明是本地临时剧本，不同步到服务器
            console.log('[syncService] 跳过本地临时scenario的同步:', { id: data.id, title: data.title });
          }
          break;
        // TODO: Handle scene data type
      }
    } catch (error) {
      console.error('Error syncing data change:', error);
    }
  },

  /**
   * Manually trigger a sync
   */
  manualSync: async (): Promise<void> => {
    await syncService.syncData();
  }
};

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('Network online, starting sync');
  syncService.syncData();
});

window.addEventListener('offline', () => {
  console.log('Network offline, stopping sync');
});
