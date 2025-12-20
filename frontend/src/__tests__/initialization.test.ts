/**
 * 初始化流程测试用例
 * 
 * 测试场景：
 * 1. 注册用户，执行初始化过程，期望：初始化完成后，用户无法看到大学时代、赛博都市等三个体验场景
 * 2. 期望：可正常获取初始化后的剧情
 * 3. 期望：初始化过程可以提取到"我的大学"这个场景下的主线剧情
 */

import { authApi, eraApi, presetMainStoryApi, presetScriptApi, worldApi, characterApi, scriptApi } from '../../services/api';
import { WORLD_SCENES } from '../../constants';

// Mock fetch
global.fetch = jest.fn();

describe('初始化流程测试', () => {
  const mockBaseUrl = 'http://localhost:8081/api';
  const mockToken = 'test-auth-token-12345';
  
  // 体验场景的ID（来自 constants.ts）
  const EXPERIENCE_SCENE_IDS = ['university_era', 'cyberpunk_city', 'clinic'];
  
  // Mock 数据
  const mockUser = {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    email: 'test@example.com',
    avatar: '',
  };

  const mockWorld = {
    id: 1,
    name: '心域',
    description: '一个平行于现实的记忆与情感世界',
    userId: 1,
  };

  // 模拟"我的大学"场景（系统预置场景）
  const mockMyUniversityEra = {
    id: 1, // systemEraId
    name: '我的大学',
    description: '重返青涩的校园时光',
    imageUrl: 'https://example.com/university.jpg',
    startYear: 2020,
    endYear: 2024,
    isActive: true,
    sortOrder: 1,
  };

  // 模拟"我的大学"场景的主线剧情
  const mockMyUniversityMainStory = {
    id: 1,
    name: '青春校园的序曲',
    description: '一段关于青春、梦想与成长的校园故事',
    systemEraId: 1, // 对应"我的大学"场景
    eraName: '我的大学',
    characterId: null,
    characterName: null,
    firstMessage: '欢迎来到大学校园...',
    systemInstruction: '你是大学场景主线故事的叙事者...',
    avatarUrl: 'https://example.com/main-story-avatar.jpg',
    backgroundUrl: 'https://example.com/main-story-bg.jpg',
    themeColor: 'blue-500',
    colorAccent: '#3b82f6',
    isActive: true,
    sortOrder: 1,
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  };

  // 模拟用户创建的场景（从系统预置场景创建）
  const mockUserEra = {
    id: 10, // 用户场景ID（不同于systemEraId）
    name: '我的大学', // 用户自定义的名称
    description: '重返青涩的校园时光',
    imageUrl: 'https://example.com/university.jpg',
    startYear: 2020,
    endYear: 2024,
    worldId: 1,
    userId: 1,
    systemEraId: 1, // 关联到系统预置场景
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  };

  // 模拟用户创建的剧本
  const mockUserScript = {
    id: 1,
    title: '校园生活',
    content: '{}',
    sceneCount: 5,
    eraId: 10, // 用户场景ID
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    // 重置 localStorage
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
  });

  describe('测试用例1: 注册用户并执行初始化，验证体验场景不显示', () => {
    it('应该注册新用户并完成初始化，初始化后不应看到体验场景', async () => {
      // Step 1: 注册用户
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          code: 200,
          message: '注册成功',
          data: {
            token: mockToken,
            user: mockUser,
          },
        }),
      });

      const registerResponse = await authApi.register({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      });

      expect(registerResponse).toBeDefined();
      expect(registerResponse.token).toBe(mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken);

      // Step 2: 获取系统预置场景列表（初始化向导第一步）
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockMyUniversityEra],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const presetEras = await eraApi.getSystemEras();
      expect(presetEras).toBeDefined();
      expect(Array.isArray(presetEras)).toBe(true);
      expect(presetEras.length).toBeGreaterThan(0);

      // Step 3: 获取"我的大学"场景的主线剧情（初始化向导第三步）
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMyUniversityMainStory,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const mainStory = await presetMainStoryApi.getByEraId(mockMyUniversityEra.id);
      expect(mainStory).toBeDefined();
      expect(mainStory?.systemEraId).toBe(mockMyUniversityEra.id);
      expect(mainStory?.name).toBe('青春校园的序曲');

      // Step 4: 获取"我的大学"场景的剧本（初始化向导第四步）
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const scripts = await presetScriptApi.getByEraId(mockMyUniversityEra.id);
      expect(scripts).toBeDefined();
      expect(Array.isArray(scripts)).toBe(true);

      // Step 5: 初始化完成后，获取用户的世界和场景列表
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockWorld],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockUserEra], // 只返回用户创建的场景
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [], // 角色列表
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockUserScript], // 剧本列表
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const worlds = await worldApi.getAllWorlds(mockToken);
      const eras = await eraApi.getAllEras(mockToken);
      const characters = await characterApi.getAllCharacters(mockToken);
      const scripts = await scriptApi.getAllScripts(mockToken);

      expect(worlds).toBeDefined();
      expect(eras).toBeDefined();
      expect(characters).toBeDefined();
      expect(scripts).toBeDefined();

      // Step 6: 构建用户场景列表（模拟 App.tsx 中的逻辑）
      const userWorldScenes = eras.map(era => ({
        id: era.id.toString(),
        name: era.name,
        description: era.description,
        imageUrl: era.imageUrl || '',
        systemEraId: era.systemEraId || undefined,
        characters: [],
        scripts: scripts.filter(s => s.eraId === era.id).map(s => ({
          id: s.id.toString(),
          title: s.title,
          content: s.content,
          sceneCount: s.sceneCount || 0,
        })),
        worldId: era.worldId,
      }));

      // Step 7: 验证体验场景不在用户场景列表中
      const userSceneIds = userWorldScenes.map(s => s.id);
      EXPERIENCE_SCENE_IDS.forEach(experienceSceneId => {
        expect(userSceneIds).not.toContain(experienceSceneId);
      });

      // Step 8: 验证用户场景列表只包含用户创建的场景
      expect(userWorldScenes.length).toBe(1);
      expect(userWorldScenes[0].name).toBe('我的大学');
      expect(userWorldScenes[0].systemEraId).toBe(mockMyUniversityEra.id);
    });
  });

  describe('测试用例2: 验证初始化后可以正常获取剧情', () => {
    it('应该能够获取初始化后创建的场景和剧本', async () => {
      // 设置 token
      (localStorage.getItem as jest.Mock).mockReturnValue(mockToken);

      // Mock 获取世界列表
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockWorld],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      // Mock 获取场景列表
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockUserEra],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      // Mock 获取角色列表
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      // Mock 获取剧本列表
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockUserScript],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const worlds = await worldApi.getAllWorlds(mockToken);
      const eras = await eraApi.getAllEras(mockToken);
      const characters = await characterApi.getAllCharacters(mockToken);
      const scripts = await scriptApi.getAllScripts(mockToken);

      // 验证数据获取成功
      expect(worlds.length).toBeGreaterThan(0);
      expect(eras.length).toBeGreaterThan(0);
      expect(Array.isArray(characters)).toBe(true);
      expect(Array.isArray(scripts)).toBe(true);

      // 验证剧本与场景的关联
      const eraScripts = scripts.filter(s => s.eraId === mockUserEra.id);
      expect(eraScripts.length).toBeGreaterThan(0);
      expect(eraScripts[0].title).toBe('校园生活');
    });
  });

  describe('测试用例3: 验证初始化过程可以提取"我的大学"场景的主线剧情', () => {
    it('应该在初始化过程中成功获取"我的大学"场景的主线剧情', async () => {
      // Step 1: 获取系统预置场景列表
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockMyUniversityEra],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const presetEras = await eraApi.getSystemEras();
      expect(presetEras).toBeDefined();
      expect(presetEras.length).toBeGreaterThan(0);

      // 找到"我的大学"场景
      const myUniversityEra = presetEras.find((era: any) => era.name === '我的大学' || era.id === mockMyUniversityEra.id);
      expect(myUniversityEra).toBeDefined();
      expect(myUniversityEra.id).toBe(mockMyUniversityEra.id);

      // Step 2: 获取"我的大学"场景的主线剧情
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMyUniversityMainStory,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const mainStory = await systemMainStoryApi.getByEraId(myUniversityEra.id);

      // 验证主线剧情获取成功
      expect(mainStory).toBeDefined();
      expect(mainStory).not.toBeNull();
      expect(mainStory?.id).toBe(mockMyUniversityMainStory.id);
      expect(mainStory?.name).toBe('青春校园的序曲');
      expect(mainStory?.systemEraId).toBe(mockMyUniversityEra.id);
      expect(mainStory?.systemEraId).toBe(mockMyUniversityMainStory.systemEraId);

      // 验证主线剧情的完整性
      expect(mainStory?.description).toBeDefined();
      expect(mainStory?.firstMessage).toBeDefined();
      expect(mainStory?.systemInstruction).toBeDefined();
    });

    it('应该正确处理场景没有主线剧情的情况（404响应）', async () => {
      const eraWithoutMainStory = {
        id: 999,
        name: '没有主线剧情的场景',
        description: '这是一个没有主线剧情的测试场景',
      };

      // Mock 404 响应
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
        text: async () => 'Not Found',
      });

      try {
        const mainStory = await systemMainStoryApi.getByEraId(eraWithoutMainStory.id);
        // 应该返回 null 而不是抛出错误
        expect(mainStory).toBeNull();
      } catch (error: any) {
        // 如果抛出错误，应该是预期的 404 错误
        expect(error?.message).toMatch(/404|not found/i);
      }
    });

    it('应该验证主线剧情的 systemEraId 与场景ID匹配', async () => {
      // Mock 获取场景
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockMyUniversityEra],
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const presetEras = await eraApi.getSystemEras();
      const myUniversityEra = presetEras.find((era: any) => era.id === mockMyUniversityEra.id);

      // Mock 获取主线剧情
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMyUniversityMainStory,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const mainStory = await systemMainStoryApi.getByEraId(myUniversityEra.id);

      // 验证 systemEraId 匹配
      expect(mainStory?.systemEraId).toBe(myUniversityEra.id);
      expect(mainStory?.systemEraId).toBe(mockMyUniversityMainStory.systemEraId);
    });
  });

  describe('测试用例4: 验证场景列表构建逻辑（不包含体验场景）', () => {
    it('登录用户应该只看到 userWorldScenes，不包含 WORLD_SCENES', () => {
      // 模拟登录用户的数据
      const userWorldScenes = [{
        id: '10',
        name: '我的大学',
        description: '重返青涩的校园时光',
        imageUrl: 'https://example.com/university.jpg',
        systemEraId: 1,
        characters: [],
        scripts: [],
        worldId: 1,
      }];

      const customScenes: any[] = [];
      const userProfile = {
        id: '1',
        nickname: '测试用户',
        avatarUrl: '',
        email: 'test@example.com',
        isGuest: false,
      };

      // 模拟 App.tsx 中的 getCurrentScenes 逻辑
      const allScenes = userProfile && !userProfile.isGuest && userWorldScenes && userWorldScenes.length > 0
        ? [...userWorldScenes, ...customScenes]
        : [...WORLD_SCENES, ...customScenes];

      // 验证不包含体验场景
      const sceneIds = allScenes.map(s => s.id);
      EXPERIENCE_SCENE_IDS.forEach(experienceSceneId => {
        expect(sceneIds).not.toContain(experienceSceneId);
      });

      // 验证只包含用户场景
      expect(allScenes.length).toBe(1);
      expect(allScenes[0].id).toBe('10');
      expect(allScenes[0].name).toBe('我的大学');
    });

    it('游客应该看到 WORLD_SCENES（体验场景）', () => {
      const userProfile = {
        id: '1',
        nickname: '游客',
        avatarUrl: '',
        email: '',
        isGuest: true,
      };

      const customScenes: any[] = [];
      const userWorldScenes: any[] = [];

      // 模拟游客场景列表构建逻辑
      const allScenes = userProfile && !userProfile.isGuest && userWorldScenes && userWorldScenes.length > 0
        ? [...userWorldScenes, ...customScenes]
        : [...WORLD_SCENES, ...customScenes];

      // 验证包含体验场景
      const sceneIds = allScenes.map(s => s.id);
      EXPERIENCE_SCENE_IDS.forEach(experienceSceneId => {
        expect(sceneIds).toContain(experienceSceneId);
      });

      // 验证包含 WORLD_SCENES
      expect(allScenes.length).toBeGreaterThanOrEqual(WORLD_SCENES.length);
    });
  });
});

