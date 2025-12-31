/**
 * 同步配置初始化
 * 注册所有需要同步的实体类型的配置
 * 
 * 注意：日志已移除本地缓存同步机制，全部从后台获取
 */

import { syncService } from './SyncService';
import { characterApi } from '../api/character';
import type { Character } from '../../types';
import type { UserCharacter, CreateCharacterDTO, UpdateCharacterDTO } from '../api/character/types';
import type { SyncableEntity } from './SyncService';

/**
 * Character 同步实体接口（扩展 SyncableEntity）
 */
interface CharacterSyncEntity extends SyncableEntity {
  id: string;
  name: string;
  avatarUrl: string;
  backgroundUrl: string;
  description: string;
  age: number;
  gender: string;
  role: string;
  bio: string;
  worldId: number;
  eraId?: number | null;
  [key: string]: any; // 允许其他字段
}

/**
 * 将前端 Character 转换为 CreateCharacterDTO
 */
function convertCharacterToCreateDTO(character: CharacterSyncEntity): CreateCharacterDTO {
  return {
    name: character.name,
    description: character.description || character.bio || '',
    age: character.age,
    gender: character.gender || character.role || '',
    worldId: character.worldId,
    eraId: character.eraId || null,
    role: character.role,
    bio: character.bio,
    avatarUrl: character.avatarUrl,
    backgroundUrl: character.backgroundUrl,
    themeColor: character.themeColor,
    colorAccent: character.colorAccent,
    firstMessage: character.firstMessage,
    systemInstruction: character.systemInstruction,
    voiceName: character.voiceName,
    mbti: character.mbti,
    tags: Array.isArray(character.tags) ? character.tags.join(',') : character.tags,
    speechStyle: character.speechStyle,
    catchphrases: Array.isArray(character.catchphrases) ? character.catchphrases : undefined,
    secrets: character.secrets,
    motivations: character.motivations,
    relationships: character.relationships,
  };
}

/**
 * 将前端 Character 转换为 UpdateCharacterDTO
 */
function convertCharacterToUpdateDTO(character: Partial<CharacterSyncEntity>): UpdateCharacterDTO {
  return {
    name: character.name,
    description: character.description || character.bio,
    age: character.age,
    gender: character.gender || character.role,
    worldId: character.worldId,
    eraId: character.eraId || null,
    role: character.role,
    bio: character.bio,
    avatarUrl: character.avatarUrl,
    backgroundUrl: character.backgroundUrl,
    themeColor: character.themeColor,
    colorAccent: character.colorAccent,
    firstMessage: character.firstMessage,
    systemInstruction: character.systemInstruction,
    voiceName: character.voiceName,
    mbti: character.mbti,
    tags: Array.isArray(character.tags) ? character.tags.join(',') : character.tags,
    speechStyle: character.speechStyle,
    catchphrases: Array.isArray(character.catchphrases) ? character.catchphrases : undefined,
    secrets: character.secrets,
    motivations: character.motivations,
    relationships: character.relationships,
  };
}

/**
 * 将后端 UserCharacter 转换为前端 CharacterSyncEntity
 */
function convertUserCharacterToSyncEntity(userChar: UserCharacter): CharacterSyncEntity {
  return {
    id: userChar.id.toString(),
    name: userChar.name,
    description: userChar.description,
    age: userChar.age,
    gender: userChar.gender,
    role: userChar.role,
    bio: userChar.bio,
    avatarUrl: userChar.avatarUrl,
    backgroundUrl: userChar.backgroundUrl,
    themeColor: userChar.themeColor,
    colorAccent: userChar.colorAccent,
    firstMessage: userChar.firstMessage,
    systemInstruction: userChar.systemInstruction,
    voiceName: userChar.voiceName,
    mbti: userChar.mbti,
    tags: userChar.tags ? (typeof userChar.tags === 'string' ? userChar.tags.split(',') : [userChar.tags]) : [],
    speechStyle: userChar.speechStyle,
    catchphrases: userChar.catchphrases ? (typeof userChar.catchphrases === 'string' ? userChar.catchphrases.split(',') : [userChar.catchphrases]) : [],
    secrets: userChar.secrets,
    motivations: userChar.motivations,
    relationships: userChar.relationships,
    worldId: userChar.worldId,
    eraId: userChar.eraId,
    syncStatus: 1 as const, // 从服务器获取的，标记为已同步
    lastSyncTime: new Date(userChar.updatedAt).getTime(),
  };
}

/**
 * 初始化同步配置
 * 注意：日志已移除本地缓存同步机制，全部从后台获取
 */
export function initSyncConfigs(): void {
  // 日志不再使用同步服务，全部从后台获取
  
  // 注册角色（Character）同步配置
  syncService.registerSyncConfig<CharacterSyncEntity>({
    entityType: 'character',
    storageKey: 'sync_characters',
    createApi: async (entity: CharacterSyncEntity, token: string): Promise<CharacterSyncEntity> => {
      const createDTO = convertCharacterToCreateDTO(entity);
      const userChar = await characterApi.createCharacter(createDTO, token);
      return convertUserCharacterToSyncEntity(userChar);
    },
    updateApi: async (id: string, entity: Partial<CharacterSyncEntity>, token: string): Promise<CharacterSyncEntity> => {
      // id 可能是字符串（前端临时ID）或数字字符串（服务器ID）
      // 如果是临时ID（preset_、temp_、entry_、e_开头），应该执行创建操作而不是更新
      const isTemporaryId = id.startsWith('preset_') || id.startsWith('temp_') || id.startsWith('entry_') || id.startsWith('e_');
      if (isTemporaryId) {
        // 临时ID，执行创建操作
        const createDTO = convertCharacterToCreateDTO(entity as CharacterSyncEntity);
        const userChar = await characterApi.createCharacter(createDTO, token);
        return convertUserCharacterToSyncEntity(userChar);
      }
      
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error(`无效的角色ID: ${id}`);
      }
      const updateDTO = convertCharacterToUpdateDTO(entity);
      const userChar = await characterApi.updateCharacter(numericId, updateDTO, token);
      return convertUserCharacterToSyncEntity(userChar);
    },
    deleteApi: async (id: string, token: string): Promise<void> => {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error(`无效的角色ID: ${id}`);
      }
      await characterApi.deleteCharacter(numericId, token);
    },
    queryApi: async (token: string): Promise<CharacterSyncEntity[]> => {
      const userChars = await characterApi.getAllCharacters(token);
      return userChars.map(convertUserCharacterToSyncEntity);
    },
  });

  console.log('[syncConfig] 同步配置初始化完成（角色同步已注册，日志已移除同步机制）');
}

