/**
 * 同步服务
 * 管理所有需要同步的实体的同步状态和同步逻辑
 */

// 同步状态类型
export type SyncStatus = 0 | 1 | -1; // 0: 待同步, 1: 同步成功, -1: 同步失败

// 可同步实体接口
export interface SyncableEntity {
  id: string;
  syncStatus: SyncStatus;
  lastSyncTime?: number;
  syncError?: string;
}

// 同步操作类型
export type SyncOperation = 'create' | 'update' | 'delete';

// 同步配置
export interface SyncConfig<T extends SyncableEntity> {
  entityType: string; // 实体类型，如 'journal', 'character', 'world' 等
  storageKey: string; // 存储键名
  createApi: (entity: T, token: string) => Promise<T>; // 创建API
  updateApi: (id: string, entity: Partial<T>, token: string) => Promise<T>; // 更新API
  deleteApi: (id: string, token: string) => Promise<void>; // 删除API
  queryApi?: (token: string) => Promise<T[]>; // 查询API（获取所有实体）
  transformQueryResult?: (serverEntity: any) => T; // 转换查询结果（可选）
  onEntityUpdated?: (entity: T) => void; // 实体更新回调
  onEntityDeleted?: (id: string) => void; // 实体删除回调
  onEntitiesQueried?: (entities: T[]) => void; // 实体查询回调
}

/**
 * 同步服务类
 */
export class SyncService {
  private static instance: SyncService;
  private syncConfigs: Map<string, SyncConfig<any>> = new Map();
  private syncInterval: number | null = null;
  private isSyncing: boolean = false;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * 注册同步配置
   */
  registerSyncConfig<T extends SyncableEntity>(config: SyncConfig<T>): void {
    this.syncConfigs.set(config.entityType, config);
  }

  /**
   * 标记实体为待同步（添加/更新操作）
   */
  markEntityForSync<T extends SyncableEntity>(
    entityType: string,
    entity: T,
    operation: 'create' | 'update'
  ): T {
    const entityWithSync: T = {
      ...entity,
      syncStatus: 0, // 待同步
      lastSyncTime: undefined,
      syncError: undefined,
    };
    
    // 保存到本地存储
    this.saveEntityToLocal(entityType, entityWithSync);
    
    
    return entityWithSync;
  }

  /**
   * 标记实体同步成功
   */
  markEntitySynced<T extends SyncableEntity>(
    entityType: string,
    entity: T,
    serverEntity?: T
  ): T {
    // 记录旧的 ID（如果是临时 ID）
    const oldId = entity.id;
    const isTemporaryId = oldId.startsWith('entry_') || oldId.startsWith('temp_') || oldId.startsWith('e_') || oldId.startsWith('preset_');
    
    // 合并数据：优先使用服务器返回的数据，但保留本地缓存中可能存在的额外字段（如insight）
    // 如果服务器返回的insight为null或undefined，保留本地缓存中的insight
    const syncedEntity: T = {
      ...entity, // 先使用本地实体（保留本地缓存中的字段）
      ...(serverEntity || {}), // 然后用服务器实体覆盖（包括新的 ID）
      // 如果服务器返回的insight为null或undefined，保留本地缓存中的insight
      insight: (serverEntity && (serverEntity as any).insight !== undefined && (serverEntity as any).insight !== null)
        ? (serverEntity as any).insight
        : (entity as any).insight,
      syncStatus: 1 as SyncStatus, // 同步成功
      lastSyncTime: Date.now(),
      syncError: undefined,
    } as T;
    
    // 如果 ID 发生了变化（从临时 ID 变为真实 ID），先删除旧的本地存储项
    if (isTemporaryId && oldId !== syncedEntity.id) {
      const oldKey = `sync_${entityType}_${oldId}`;
      localStorage.removeItem(oldKey);
    }
    
    // 更新本地存储（使用新的真实 ID）
    this.saveEntityToLocal(entityType, syncedEntity);
    
    // 验证保存后的状态
    const savedEntity = this.loadEntityFromLocal(entityType, syncedEntity.id);
    if (!savedEntity) {
      console.error(`[SyncService] ❌ 保存后无法读取实体: ${entityType}, ID: ${syncedEntity.id}`);
    }
    
    return syncedEntity;
  }

  /**
   * 标记实体同步失败
   */
  markEntitySyncFailed<T extends SyncableEntity>(
    entityType: string,
    entity: T,
    error: string
  ): T {
    const failedEntity: T = {
      ...entity,
      syncStatus: -1, // 同步失败
      syncError: error,
    };
    
    // 更新本地存储
    this.saveEntityToLocal(entityType, failedEntity);
    
    console.error(`[SyncService] 标记实体同步失败: ${entityType}, ID: ${entity.id}, 错误: ${error}`);
    
    return failedEntity;
  }

  /**
   * 执行同步操作（创建或更新）
   */
  async syncEntity<T extends SyncableEntity>(
    entityType: string,
    entity: T
  ): Promise<T> {
    const config = this.syncConfigs.get(entityType);
    if (!config) {
      throw new Error(`未找到实体类型 ${entityType} 的同步配置`);
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('未找到认证token');
    }

    // 检查是否已经同步过（防止重复同步）
    const currentEntity = this.loadEntityFromLocal(entityType, entity.id);
    
    if (currentEntity && currentEntity.syncStatus === 1) {
      return currentEntity as T;
    }

    try {
      const isTemporaryId = entity.id.startsWith('entry_') || entity.id.startsWith('temp_') || entity.id.startsWith('e_') || entity.id.startsWith('preset_');
      let syncedEntity: T;

      if (isTemporaryId) {
        // 临时ID，执行创建操作
        // 注意：日志已移除本地缓存同步机制，不再处理日志类型
        // 执行创建操作
        syncedEntity = await config.createApi(entity, token);
      } else {
        // 已有ID，执行更新操作
        syncedEntity = await config.updateApi(entity.id, entity, token);
      }

      // 标记为同步成功
      const finalEntity = this.markEntitySynced(entityType, entity, syncedEntity);
      
      // 触发更新回调
      if (config.onEntityUpdated) {
        config.onEntityUpdated(finalEntity);
      }

      return finalEntity;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // 标记为同步失败
      this.markEntitySyncFailed(entityType, entity, errorMessage);
      throw error;
    }
  }

  /**
   * 执行删除操作
   */
  async deleteEntity(
    entityType: string,
    entityId: string
  ): Promise<void> {
    const config = this.syncConfigs.get(entityType);
    if (!config) {
      throw new Error(`未找到实体类型 ${entityType} 的同步配置`);
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('未找到认证token');
    }

    try {
      // 先调用后台API删除
      await config.deleteApi(entityId, token);
      
      // 删除成功后，删除本地缓存
      this.removeEntityFromLocal(entityType, entityId);
      
      // 触发删除回调
      if (config.onEntityDeleted) {
        config.onEntityDeleted(entityId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SyncService] 删除实体失败: ${entityType}, ID: ${entityId}, 错误: ${errorMessage}`);
      // 删除失败，保留本地缓存
      throw error;
    }
  }

  /**
   * 同步所有待同步的实体
   */
  async syncAllPendingEntities(entityType?: string): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      const typesToSync = entityType ? [entityType] : Array.from(this.syncConfigs.keys());
      
      for (const type of typesToSync) {
        const config = this.syncConfigs.get(type);
        if (!config) continue;

        const entities = this.loadEntitiesFromLocal(type);
        
        const pendingEntities = entities.filter(
          (e: SyncableEntity) => e.syncStatus === 0 || e.syncStatus === -1
        );

        if (pendingEntities.length === 0) {
          continue;
        }

        // 用于跟踪已处理的实体，避免重复处理
        const processedIds = new Set<string>();

        for (const entity of pendingEntities) {
          // 检查是否已处理（防止重复）
          if (processedIds.has(entity.id)) {
            continue;
          }

          // 再次检查同步状态（可能在处理过程中被其他流程更新）
          const currentEntity = this.loadEntityFromLocal(type, entity.id);
          
          if (currentEntity && currentEntity.syncStatus === 1) {
            processedIds.add(entity.id);
            continue;
          }

          // 注意：日志已移除本地缓存同步机制，不再处理日志类型

          try {
            await this.syncEntity(type, entity);
            processedIds.add(entity.id);
          } catch (error) {
            console.error(`[SyncService] 同步实体失败: ${type}, ID: ${entity.id}`, error);
            // 继续同步其他实体
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 启动自动同步（定期同步）
   */
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = window.setInterval(() => {
      this.syncAllPendingEntities().catch(error => {
        console.error('[SyncService] 自动同步失败:', error);
      });
    }, intervalMs);

  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * 保存实体到本地存储
   */
  private saveEntityToLocal<T extends SyncableEntity>(entityType: string, entity: T): void {
    try {
      const key = `sync_${entityType}_${entity.id}`;
      const serialized = JSON.stringify(entity);
      
      // 如果 ID 发生了变化（从临时 ID 变为真实 ID），需要删除旧的 key
      // 注意：日志已移除本地缓存同步机制，不再处理日志类型
      const oldKey = (entity as any)._oldId 
        ? `sync_${entityType}_${(entity as any)._oldId}`
        : null;
      
      if (oldKey && oldKey !== key) {
        localStorage.removeItem(oldKey);
      }
      
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`[SyncService] 保存实体到本地存储失败: ${entityType}, ID: ${entity.id}`, error);
    }
  }

  /**
   * 从本地存储加载单个实体
   */
  private loadEntityFromLocal<T extends SyncableEntity>(entityType: string, entityId: string): T | null {
    try {
      const key = `sync_${entityType}_${entityId}`;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (error) {
      console.error(`[SyncService] 加载实体失败: ${entityType}, ID: ${entityId}`, error);
    }
    return null;
  }

  /**
   * 从本地存储加载实体
   * 注意：日志和场景已移除本地缓存同步机制，不会加载这些类型
   */
  private loadEntitiesFromLocal<T extends SyncableEntity>(entityType: string): T[] {
    // 日志和场景不再使用同步服务，直接返回空数组
    if (entityType === 'journal') {
      return [];
    }
    
    if (entityType === 'scene') {
      return [];
    }
    
    const entities: T[] = [];
    const prefix = `sync_${entityType}_`;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const entity = JSON.parse(value) as T;
              entities.push(entity);
            } catch (e) {
              console.error(`[SyncService] 解析实体失败: ${key}`, e);
            }
          }
        }
      }
    } catch (error) {
      console.error(`[SyncService] 从本地存储加载实体失败: ${entityType}`, error);
    }

    return entities;
  }

  /**
   * 从本地存储删除实体
   */
  private removeEntityFromLocal(entityType: string, entityId: string): void {
    try {
      const key = `sync_${entityType}_${entityId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[SyncService] 从本地存储删除实体失败: ${entityType}, ID: ${entityId}`, error);
    }
  }

  /**
   * 处理本地数据变化并立即同步到服务器
   * 这是为了兼容旧的 handleLocalDataChange API
   * 注意：新的代码应该使用 markEntityForSync + syncEntity 的方式
   * 注意：日志已移除本地缓存同步机制，全部从后台获取
   */
  async handleLocalDataChange(dataType: 'journal' | 'scene' | 'character' | 'scenario', data: any): Promise<any> {
    // 日志和场景不再使用同步服务，直接返回
    if (dataType === 'journal') {
      return;
    }
    
    if (dataType === 'scene') {
      return;
    }

    if (!navigator.onLine) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    try {
      // 检查是否已经同步过（防止重复同步）
      const entityId = data.id || `temp_${Date.now()}`;
      const currentEntity = this.loadEntityFromLocal(dataType, entityId);
      
      if (currentEntity && currentEntity.syncStatus === 1) {
        return currentEntity;
      }

      // 使用新的同步机制
      const entity = {
        ...data,
        id: entityId,
        syncStatus: 0 as SyncStatus, // 标记为待同步
      };

      // 标记为待同步并立即同步
      this.markEntityForSync(dataType, entity, data.id && !data.id.startsWith('entry_') && !data.id.startsWith('temp_') && !data.id.startsWith('e_') && !data.id.startsWith('preset_') ? 'update' : 'create');
      const syncedEntity = await this.syncEntity(dataType, entity);
      
      return syncedEntity;
    } catch (error) {
      console.error(`[SyncService] 处理本地数据变化失败: ${dataType}`, error);
      throw error;
    }
  }

  /**
   * 获取待同步实体数量
   */
  getPendingCount(entityType?: string): number {
    const typesToCheck = entityType ? [entityType] : Array.from(this.syncConfigs.keys());
    let count = 0;

    for (const type of typesToCheck) {
      const entities = this.loadEntitiesFromLocal(type);
      count += entities.filter(
        (e: SyncableEntity) => e.syncStatus === 0 || e.syncStatus === -1
      ).length;
    }

    return count;
  }

  /**
   * 查询实体（先展示本地缓存，然后后台查询并更新）
   * @param entityType 实体类型
   * @param token 认证token
   * @returns 返回本地缓存的数据（立即返回），后台查询会在后台进行
   */
  async queryEntities<T extends SyncableEntity>(
    entityType: string,
    token: string
  ): Promise<T[]> {
    const config = this.syncConfigs.get(entityType);
    if (!config) {
      throw new Error(`未找到实体类型 ${entityType} 的同步配置`);
    }

    // 1. 先返回本地缓存数据（立即返回，不等待后台查询）
    const localEntities = this.loadEntitiesFromLocal<T>(entityType);

    // 2. 后台异步查询并更新（不阻塞返回）
    if (config.queryApi) {
      (async () => {
        try {
          const serverEntities = await config.queryApi(token);
          
          // 将服务器返回的实体标记为同步成功（syncStatus=1）
          const syncedEntities: T[] = serverEntities.map(serverEntity => {
            // 如果配置了转换函数，使用转换函数
            const entity = config.transformQueryResult 
              ? config.transformQueryResult(serverEntity)
              : serverEntity;
            
            // 查找本地缓存中是否已有该实体，如果有，合并数据（保留本地缓存中的字段，如insight）
            const localEntity = localEntities.find(e => e.id === entity.id);
            
            // 合并数据：优先使用服务器返回的数据，但保留本地缓存中可能存在的额外字段（如insight）
            // 如果服务器返回的insight为null或undefined，保留本地缓存中的insight
            const mergedEntity = {
              ...(localEntity || {}), // 先使用本地缓存的数据（如果有）
              ...entity, // 然后用服务器数据覆盖
              // 如果服务器返回的insight为null或undefined，保留本地缓存中的insight
              insight: (entity as any).insight !== undefined && (entity as any).insight !== null
                ? (entity as any).insight
                : (localEntity ? (localEntity as any).insight : undefined),
              syncStatus: 1 as SyncStatus, // 同步成功
              lastSyncTime: Date.now(),
              syncError: undefined,
            } as T;
            
            return mergedEntity;
          });

          // 更新本地缓存
          for (const entity of syncedEntities) {
            this.saveEntityToLocal(entityType, entity);
          }

          // 删除服务器中不存在但本地存在且已同步的实体（清理已删除的实体）
          const serverEntityIds = new Set(serverEntities.map(e => {
            const entity = config.transformQueryResult 
              ? config.transformQueryResult(e)
              : e;
            return entity.id;
          }));
          const localEntityIds = new Set(localEntities.map(e => e.id));
          for (const localId of localEntityIds) {
            if (!serverEntityIds.has(localId)) {
              // 服务器中不存在，但本地存在，可能是已删除的实体
              // 检查同步状态，如果是已同步的，则删除本地缓存
              const localEntity = localEntities.find(e => e.id === localId);
              if (localEntity && localEntity.syncStatus === 1) {
                this.removeEntityFromLocal(entityType, localId);
              }
            }
          }


          // 触发查询回调
          if (config.onEntitiesQueried) {
            config.onEntitiesQueried(syncedEntities);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[SyncService] 后台查询失败: ${entityType}`, error);
          // 查询失败不影响本地缓存的使用
        }
      })();
    } else {
      console.warn(`[SyncService] 实体类型 ${entityType} 未配置查询API`);
    }

    // 立即返回本地缓存数据
    return localEntities;
  }

  /**
   * 从本地存储加载所有实体（不包含同步状态过滤）
   */
  loadAllEntitiesFromLocal<T extends SyncableEntity>(entityType: string): T[] {
    return this.loadEntitiesFromLocal<T>(entityType);
  }
}

// 导出单例
export const syncService = SyncService.getInstance();

