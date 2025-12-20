

import { GameState } from '../types';

const DB_NAME = 'HeartSphereDB';
const STORE_NAME = 'gameState';
const CUSTOM_SCENE_MAPPINGS_STORE = 'customSceneMappings';
const DB_VERSION = 2;
const LEGACY_STORAGE_KEY = 'HEARTSPHERE_MEMORY_CORE_V1';
const FALLBACK_STORAGE_KEY = 'HEARTSPHERE_MEMORY_CORE_V2'; // 降级到 localStorage 时使用的 key

// Definte a partial type for saving to avoid saving unnecessary UI state
type PersistedState = Omit<GameState, 'currentScreen' | 'currentScenarioState' | 'generatingAvatarId' | 'activeJournalEntryId' | 'tempStoryCharacter' | 'debugLogs'>;

// 检测 IndexedDB 是否可用
let indexedDBAvailable: boolean | null = null;
let useIndexedDB: boolean = true;

const checkIndexedDBAvailability = (): boolean => {
  if (indexedDBAvailable !== null) {
    return indexedDBAvailable;
  }
  
  try {
    if (!window.indexedDB) {
      console.warn('IndexedDB is not available, falling back to localStorage');
      indexedDBAvailable = false;
      useIndexedDB = false;
      return false;
    }
    indexedDBAvailable = true;
    return true;
  } catch (e) {
    console.warn('IndexedDB check failed, falling back to localStorage:', e);
    indexedDBAvailable = false;
    useIndexedDB = false;
    return false;
  }
};

export const storageService = {
  
  /**
   * Open the IndexedDB database
   */
  initDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (!checkIndexedDBAvailability()) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        const error = request.error;
        console.error("IndexedDB error:", error);
        
        // 如果是特定错误，降级到 localStorage
        if (error && (error.name === 'UnknownError' || error.name === 'QuotaExceededError')) {
          console.warn('IndexedDB failed, falling back to localStorage');
          useIndexedDB = false;
          indexedDBAvailable = false;
        }
        
        reject(error || new Error("Database error"));
      };

      request.onsuccess = (event) => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains(CUSTOM_SCENE_MAPPINGS_STORE)) {
          db.createObjectStore(CUSTOM_SCENE_MAPPINGS_STORE);
        }
      };
    });
  },

  /**
   * Save the current game state to IndexedDB or localStorage (fallback).
   */
  saveState: async (state: GameState): Promise<void> => {
    try {
      const stateToSave: PersistedState = {
        userProfile: state.userProfile,
        selectedSceneId: state.selectedSceneId, 
        selectedCharacterId: state.selectedCharacterId,
        selectedScenarioId: state.selectedScenarioId,
        editingScenarioId: null, 
        history: state.history,
        customAvatars: state.customAvatars,
        customScenarios: state.customScenarios,
        customScenes: state.customScenes,
        customCharacters: state.customCharacters, // Ensure user-created characters for default scenes are saved
        journalEntries: state.journalEntries,
        settings: state.settings,
        mailbox: state.mailbox,
        lastLoginTime: state.lastLoginTime,
        sceneMemories: state.sceneMemories || {},
        userWorldScenes: state.userWorldScenes || [], // Save remote world data for local-first loading
        showWelcomeOverlay: state.showWelcomeOverlay // Save welcome overlay state
      };

      // 如果 IndexedDB 不可用，降级到 localStorage
      if (!useIndexedDB || !checkIndexedDBAvailability()) {
        try {
          localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(stateToSave));
          return;
        } catch (e) {
          console.error("LocalStorage write error:", e);
          return; // 静默失败，避免影响用户体验
        }
      }

      try {
        const db = await storageService.initDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        
        // We store the whole state under a single key 'latest'
        const request = store.put(stateToSave, 'latest');

        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve();
          request.onerror = () => {
            // 如果 IndexedDB 写入失败，降级到 localStorage
            console.warn('IndexedDB write failed, falling back to localStorage');
            useIndexedDB = false;
            try {
              localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(stateToSave));
              resolve();
            } catch (e) {
              console.error("LocalStorage fallback write error:", e);
              reject(request.error);
            }
          };
        });
      } catch (e) {
        // IndexedDB 初始化失败，降级到 localStorage
        console.warn('IndexedDB init failed, falling back to localStorage:', e);
        useIndexedDB = false;
        try {
          localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (localStorageError) {
          console.error("LocalStorage fallback write error:", localStorageError);
        }
      }

    } catch (e) {
      console.error("Memory Core Write Error:", e);
      // 尝试降级到 localStorage
      try {
        const stateToSave: PersistedState = {
          userProfile: state.userProfile,
          selectedSceneId: state.selectedSceneId, 
          selectedCharacterId: state.selectedCharacterId,
          selectedScenarioId: state.selectedScenarioId,
          editingScenarioId: null, 
          history: state.history,
          customAvatars: state.customAvatars,
          customScenarios: state.customScenarios,
          customScenes: state.customScenes,
          customCharacters: state.customCharacters,
          journalEntries: state.journalEntries,
          settings: state.settings,
          mailbox: state.mailbox,
          lastLoginTime: state.lastLoginTime,
          sceneMemories: state.sceneMemories || {},
          userWorldScenes: state.userWorldScenes || [],
          showWelcomeOverlay: state.showWelcomeOverlay
        };
        localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (fallbackError) {
        console.error("All storage methods failed:", fallbackError);
      }
    }
  },

  /**
   * Load the game state from IndexedDB or localStorage (fallback).
   * Includes migration logic from LocalStorage.
   */
  loadState: async (): Promise<Partial<GameState> | null> => {
    try {
      // 如果 IndexedDB 不可用，直接从 localStorage 读取
      if (!useIndexedDB || !checkIndexedDBAvailability()) {
        const fallbackData = localStorage.getItem(FALLBACK_STORAGE_KEY);
        if (fallbackData) {
          try {
            return JSON.parse(fallbackData);
          } catch (e) {
            console.error("Failed to parse localStorage data:", e);
          }
        }
        // 检查旧版本的 localStorage
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
          try {
            return JSON.parse(legacyData);
          } catch (e) {
            console.error("Failed to parse legacy localStorage data:", e);
          }
        }
        return null;
      }

      try {
        const db = await storageService.initDB();
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('latest');

        const result = await new Promise<PersistedState | undefined>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => {
            // IndexedDB 读取失败，降级到 localStorage
            console.warn('IndexedDB read failed, falling back to localStorage');
            useIndexedDB = false;
            const fallbackData = localStorage.getItem(FALLBACK_STORAGE_KEY);
            if (fallbackData) {
              try {
                resolve(JSON.parse(fallbackData));
              } catch (e) {
                reject(request.error);
              }
            } else {
              reject(request.error);
            }
          };
        });

        if (result) {
          return result;
        }
      } catch (e) {
        // IndexedDB 初始化失败，降级到 localStorage
        console.warn('IndexedDB init failed, falling back to localStorage:', e);
        useIndexedDB = false;
        const fallbackData = localStorage.getItem(FALLBACK_STORAGE_KEY);
        if (fallbackData) {
          try {
            return JSON.parse(fallbackData);
          } catch (parseError) {
            console.error("Failed to parse localStorage data:", parseError);
          }
        }
      }

      // Fallback / Migration: Check LocalStorage
      const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyData) {
        console.log("Migrating data from LocalStorage...");
        try {
          const parsedData = JSON.parse(legacyData);
          // 如果 IndexedDB 可用，尝试保存到 IndexedDB
          if (useIndexedDB && checkIndexedDBAvailability()) {
            try {
              await storageService.saveState(parsedData as GameState);
            } catch (saveError) {
              console.warn('Failed to migrate to IndexedDB, will use localStorage:', saveError);
            }
          }
          // Clear Legacy
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          return parsedData;
        } catch (e) {
          console.error("Failed to parse legacy data:", e);
        }
      }

      return null;
    } catch (e) {
      console.error("Memory Core Read Error:", e);
      // 最后尝试从 localStorage 读取
      try {
        const fallbackData = localStorage.getItem(FALLBACK_STORAGE_KEY);
        if (fallbackData) {
          return JSON.parse(fallbackData);
        }
      } catch (fallbackError) {
        console.error("All read methods failed:", fallbackError);
      }
      return null;
    }
  },

  /**
   * Clear all data (Factory Reset)
   */
  clearMemory: async () => {
    try {
      if (useIndexedDB && checkIndexedDBAvailability()) {
        try {
          const db = await storageService.initDB();
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          store.clear();
        } catch (e) {
          console.warn('Failed to clear IndexedDB, clearing localStorage instead:', e);
        }
      }
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(FALLBACK_STORAGE_KEY);
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear memory", e);
      // 即使出错也尝试清除 localStorage
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
        window.location.reload();
      } catch (fallbackError) {
        console.error("Failed to clear localStorage:", fallbackError);
      }
    }
  },

  /**
   * Generate backup string from current state (Synchronous helper for the UI)
   */
  exportBackup: (currentState: GameState): string => {
     const stateToSave: PersistedState = {
        userProfile: currentState.userProfile,
        selectedSceneId: currentState.selectedSceneId, 
        selectedCharacterId: currentState.selectedCharacterId,
        selectedScenarioId: currentState.selectedScenarioId,
        editingScenarioId: null, 
        history: currentState.history,
        customAvatars: currentState.customAvatars,
        customScenarios: currentState.customScenarios,
        customScenes: currentState.customScenes,
        customCharacters: currentState.customCharacters,
        journalEntries: currentState.journalEntries,
        settings: currentState.settings,
        mailbox: currentState.mailbox,
        lastLoginTime: currentState.lastLoginTime,
        sceneMemories: currentState.sceneMemories || {},
        userWorldScenes: currentState.userWorldScenes || [],
        showWelcomeOverlay: currentState.showWelcomeOverlay
      };
      return JSON.stringify(stateToSave);
  },

  /**
   * Validate and Restore data from a JSON string to IndexedDB
   */
  restoreBackup: async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      // Basic validation: check if it looks like our state
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid backup format");
      }
      // Check for a few key fields to ensure it's a HeartSphere backup
      if (!data.history && !data.userProfile && !data.settings) {
        throw new Error("Data does not contain HeartSphere memory structures");
      }

      // Save to IndexedDB
      await storageService.saveState(data as GameState);
      return true;
    } catch (e) {
      console.error("Restore failed:", e);
      return false;
    }
  },

  /**
   * Save custom scene mappings to IndexedDB or localStorage (fallback)
   */
  saveCustomSceneMappings: async (mappings: { [sceneId: string]: number }): Promise<void> => {
    try {
      if (!useIndexedDB || !checkIndexedDBAvailability()) {
        localStorage.setItem('customSceneMappings', JSON.stringify(mappings));
        return;
      }

      try {
        const db = await storageService.initDB();
        const transaction = db.transaction(CUSTOM_SCENE_MAPPINGS_STORE, "readwrite");
        const store = transaction.objectStore(CUSTOM_SCENE_MAPPINGS_STORE);
        const request = store.put(mappings, 'customSceneMappings');

        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve();
          request.onerror = () => {
            // 降级到 localStorage
            try {
              localStorage.setItem('customSceneMappings', JSON.stringify(mappings));
              resolve();
            } catch (e) {
              reject(request.error);
            }
          };
        });
      } catch (e) {
        // 降级到 localStorage
        localStorage.setItem('customSceneMappings', JSON.stringify(mappings));
      }
    } catch (e) {
      console.error("Error saving custom scene mappings:", e);
      // 静默失败，避免影响用户体验
    }
  },

  /**
   * Load custom scene mappings from IndexedDB or localStorage (fallback)
   */
  getCustomSceneMappings: async (): Promise<{ [sceneId: string]: number } | null> => {
    try {
      if (!useIndexedDB || !checkIndexedDBAvailability()) {
        const data = localStorage.getItem('customSceneMappings');
        if (data) {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.error("Failed to parse custom scene mappings from localStorage:", e);
          }
        }
        return null;
      }

      try {
        const db = await storageService.initDB();
        const transaction = db.transaction(CUSTOM_SCENE_MAPPINGS_STORE, "readonly");
        const store = transaction.objectStore(CUSTOM_SCENE_MAPPINGS_STORE);
        const request = store.get('customSceneMappings');

        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            if (request.result) {
              resolve(request.result);
            } else {
              // 尝试从 localStorage 读取
              const data = localStorage.getItem('customSceneMappings');
              if (data) {
                try {
                  resolve(JSON.parse(data));
                } catch (e) {
                  resolve(null);
                }
              } else {
                resolve(null);
              }
            }
          };
          request.onerror = () => {
            // 降级到 localStorage
            const data = localStorage.getItem('customSceneMappings');
            if (data) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };
        });
      } catch (e) {
        // 降级到 localStorage
        const data = localStorage.getItem('customSceneMappings');
        if (data) {
          try {
            return JSON.parse(data);
          } catch (parseError) {
            console.error("Failed to parse custom scene mappings from localStorage:", parseError);
          }
        }
        return null;
      }
    } catch (e) {
      console.error("Error loading custom scene mappings:", e);
      // 最后尝试从 localStorage 读取
      try {
        const data = localStorage.getItem('customSceneMappings');
        if (data) {
          return JSON.parse(data);
        }
      } catch (fallbackError) {
        console.error("All read methods failed for custom scene mappings:", fallbackError);
      }
      return null;
    }
  }
};