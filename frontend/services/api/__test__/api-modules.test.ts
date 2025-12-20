/**
 * API模块导入测试
 * 验证所有新拆分的API模块能够正确导入和使用
 */

// 测试从统一导出文件导入
import { 
  eraApi,
  characterApi,
  scriptApi,
  presetScriptApi,
  systemScriptApi,
  userMainStoryApi,
  presetMainStoryApi,
  systemMainStoryApi,
  // 类型导入
  type SystemEra,
  type UserEra,
  type CreateEraDTO,
  type UpdateEraDTO,
  type SystemCharacter,
  type UserCharacter,
  type CreateCharacterDTO,
  type UpdateCharacterDTO,
  type UserScript,
  type SystemScript,
  type CreateScriptDTO,
  type UpdateScriptDTO,
  type UserMainStory,
  type SystemMainStory,
  type CreateUserMainStoryDTO,
  type UpdateUserMainStoryDTO,
} from '../index';

// 测试从旧api.ts导入（向后兼容性）
import {
  eraApi as eraApiOld,
  characterApi as characterApiOld,
  scriptApi as scriptApiOld,
  userMainStoryApi as userMainStoryApiOld,
} from '../../api';

// 测试API对象存在性
describe('API模块导入测试', () => {
  test('场景API模块应该存在', () => {
    expect(eraApi).toBeDefined();
    expect(eraApi.getSystemEras).toBeDefined();
    expect(eraApi.getAllEras).toBeDefined();
    expect(eraApi.getErasByWorldId).toBeDefined();
    expect(eraApi.createEra).toBeDefined();
    expect(eraApi.updateEra).toBeDefined();
    expect(eraApi.deleteEra).toBeDefined();
  });

  test('角色API模块应该存在', () => {
    expect(characterApi).toBeDefined();
    expect(characterApi.getSystemCharacters).toBeDefined();
    expect(characterApi.getAllCharacters).toBeDefined();
    expect(characterApi.getCharactersByWorldId).toBeDefined();
    expect(characterApi.getCharactersByEraId).toBeDefined();
    expect(characterApi.createCharacter).toBeDefined();
    expect(characterApi.updateCharacter).toBeDefined();
    expect(characterApi.deleteCharacter).toBeDefined();
  });

  test('剧本API模块应该存在', () => {
    expect(scriptApi).toBeDefined();
    expect(scriptApi.getAllScripts).toBeDefined();
    expect(scriptApi.getScriptsByWorldId).toBeDefined();
    expect(scriptApi.getScriptsByEraId).toBeDefined();
    expect(scriptApi.createScript).toBeDefined();
    expect(scriptApi.updateScript).toBeDefined();
    expect(scriptApi.deleteScript).toBeDefined();
    
    expect(presetScriptApi).toBeDefined();
    expect(presetScriptApi.getAll).toBeDefined();
    expect(presetScriptApi.getByEraId).toBeDefined();
    expect(presetScriptApi.getById).toBeDefined();
    
    expect(systemScriptApi).toBeDefined();
    expect(systemScriptApi.getAll).toBeDefined();
  });

  test('主线剧情API模块应该存在', () => {
    expect(userMainStoryApi).toBeDefined();
    expect(userMainStoryApi.getAll).toBeDefined();
    expect(userMainStoryApi.getByEraId).toBeDefined();
    expect(userMainStoryApi.getById).toBeDefined();
    expect(userMainStoryApi.create).toBeDefined();
    expect(userMainStoryApi.update).toBeDefined();
    expect(userMainStoryApi.delete).toBeDefined();
    
    expect(presetMainStoryApi).toBeDefined();
    expect(presetMainStoryApi.getAll).toBeDefined();
    expect(presetMainStoryApi.getByEraId).toBeDefined();
    expect(presetMainStoryApi.getById).toBeDefined();
    
    expect(systemMainStoryApi).toBeDefined();
    expect(systemMainStoryApi.getAll).toBeDefined();
  });

  test('向后兼容性：从旧api.ts导入应该与从新模块导入相同', () => {
    expect(eraApi).toBe(eraApiOld);
    expect(characterApi).toBe(characterApiOld);
    expect(scriptApi).toBe(scriptApiOld);
    expect(userMainStoryApi).toBe(userMainStoryApiOld);
  });
});

// 类型检查测试（这些会在编译时检查）
const testTypeImports = () => {
  // 场景类型
  const era: SystemEra = {} as SystemEra;
  const userEra: UserEra = {} as UserEra;
  const createEra: CreateEraDTO = {} as CreateEraDTO;
  const updateEra: UpdateEraDTO = {} as UpdateEraDTO;
  
  // 角色类型
  const character: SystemCharacter = {} as SystemCharacter;
  const userCharacter: UserCharacter = {} as UserCharacter;
  const createCharacter: CreateCharacterDTO = {} as CreateCharacterDTO;
  const updateCharacter: UpdateCharacterDTO = {} as UpdateCharacterDTO;
  
  // 剧本类型
  const script: UserScript = {} as UserScript;
  const systemScript: SystemScript = {} as SystemScript;
  const createScript: CreateScriptDTO = {} as CreateScriptDTO;
  const updateScript: UpdateScriptDTO = {} as UpdateScriptDTO;
  
  // 主线剧情类型
  const mainStory: UserMainStory = {} as UserMainStory;
  const systemMainStory: SystemMainStory = {} as SystemMainStory;
  const createMainStory: CreateUserMainStoryDTO = {} as CreateUserMainStoryDTO;
  const updateMainStory: UpdateUserMainStoryDTO = {} as UpdateUserMainStoryDTO;
  
  return {
    era,
    userEra,
    createEra,
    updateEra,
    character,
    userCharacter,
    createCharacter,
    updateCharacter,
    script,
    systemScript,
    createScript,
    updateScript,
    mainStory,
    systemMainStory,
    createMainStory,
    updateMainStory,
  };
};

