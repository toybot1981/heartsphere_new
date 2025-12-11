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
  'university_era': 1,  // 大学时代
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
      const entriesToAdd = localEntries.filter(entry => !serverEntryMap.has(entry.id));
      
      // Entries to update on server (local entries that have changed)
      const entriesToUpdate = localEntries.filter(entry => {
        const serverEntry = serverEntryMap.get(entry.id);
        return serverEntry && 
               (entry.title !== serverEntry.title || 
                entry.content !== serverEntry.content || 
                entry.timestamp !== serverEntry.timestamp);
      });

      // Entries to add to local (server entries not local)
      const entriesToLocalAdd = formattedServerEntries.filter(entry => !localEntryMap.has(entry.id));

      // Process additions to server
      for (const entry of entriesToAdd) {
        await journalApi.createJournalEntry(
          {
            title: entry.title,
            content: entry.content,
            entryDate: new Date(entry.timestamp).toISOString(),
            worldId: undefined, // TODO: Map local scene ID to server world ID
            eraId: undefined,
            characterId: undefined
          },
          token
        );
        console.log('Added journal entry to server:', entry.id);
      }

      // Process updates to server
      for (const entry of entriesToUpdate) {
        await journalApi.updateJournalEntry(
          entry.id,
          {
            title: entry.title,
            content: entry.content,
            entryDate: new Date(entry.timestamp).toISOString(),
            worldId: undefined,
            eraId: undefined,
            characterId: undefined
          },
          token
        );
        console.log('Updated journal entry on server:', entry.id);
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
   */
  handleLocalDataChange: async (dataType: 'journal' | 'scene' | 'character' | 'scenario', data: any): Promise<void> => {
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
                worldId: undefined,
                eraId: undefined,
                characterId: undefined
              },
              token
            );
          }
          break;
        case 'character':
          if (data.id) {
            // Update existing character
            await characterApi.updateCharacter(
              parseInt(data.id),
              {
                name: data.name,
                description: data.description,
                age: data.age,
                gender: data.gender || data.role, // Use gender if available, otherwise role
                worldId: 1, // Default world ID
                eraId: 1 // Default era ID
              },
              token
            );
          } else {
            // Create new character
            await characterApi.createCharacter(
              {
                name: data.name,
                description: data.description,
                age: data.age,
                gender: data.gender || data.role, // Use gender if available, otherwise role
                worldId: 1, // Default world ID
                eraId: 1 // Default era ID
              },
              token
            );
          }
          break;
        case 'scenario':
          if (data.id) {
            // Update existing scenario/script
            await scriptApi.updateScript(
              parseInt(data.id),
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
            // Create new scenario/script
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
