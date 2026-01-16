/**
 * 状态管理单元测试
 * 使用简单的测试框架验证状态管理功能
 */

import { gameStateReducer } from '../reducers/gameStateReducer';
import { DEFAULT_GAME_STATE } from '../contexts/constants/defaultState';
import { GameStateAction } from '../contexts/types/gameState.types';

// 简单的测试框架
class TestRunner {
  private tests: Array<{ name: string; fn: () => void }> = [];
  private passed = 0;
  private failed = 0;

  test(name: string, fn: () => void) {
    this.tests.push({ name, fn });
  }

  assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(message);
    }
  }

  async run() {

    for (const test of this.tests) {
      try {
        test.fn();
        this.passed++;
      } catch (error: any) {
        this.failed++;
        console.error(`❌ ${test.name}`);
        console.error(`   错误: ${error.message}`);
      }
    }

    return this.failed === 0;
  }
}

const runner = new TestRunner();

// 测试1: Reducer初始状态
runner.test('Reducer初始状态', () => {
  const state = gameStateReducer(DEFAULT_GAME_STATE, { type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
  runner.assert(state.currentScreen === 'entryPoint', '应该设置currentScreen');
});

// 测试2: 屏幕导航
runner.test('屏幕导航', () => {
  const state = gameStateReducer(DEFAULT_GAME_STATE, { type: 'SET_CURRENT_SCREEN', payload: 'chat' });
  runner.assert(state.currentScreen === 'chat', '应该设置currentScreen为chat');
});

// 测试3: 用户资料
runner.test('用户资料设置', () => {
  const profile = { id: 'test', nickname: '测试', avatarUrl: '', isGuest: false };
  const state = gameStateReducer(DEFAULT_GAME_STATE, { type: 'SET_USER_PROFILE', payload: profile });
  runner.assert(state.userProfile?.id === 'test', '应该设置userProfile');
});

// 测试4: 场景选择
runner.test('场景选择', () => {
  const state = gameStateReducer(DEFAULT_GAME_STATE, { type: 'SET_SELECTED_SCENE_ID', payload: 'scene-1' });
  runner.assert(state.selectedSceneId === 'scene-1', '应该设置selectedSceneId');
});

// 测试5: 添加消息
runner.test('添加消息到对话历史', () => {
  const message = { id: 'msg-1', role: 'user' as const, text: '测试', timestamp: Date.now() };
  const state = gameStateReducer(DEFAULT_GAME_STATE, {
    type: 'ADD_MESSAGE',
    payload: { sceneId: 'scene-1', message }
  });
  runner.assert(state.history['scene-1']?.length === 1, '应该在history中添加消息');
  runner.assert(state.history['scene-1'][0].id === 'msg-1', '消息ID应该正确');
});

// 测试6: 批量更新
runner.test('批量更新状态', () => {
  const state = gameStateReducer(DEFAULT_GAME_STATE, {
    type: 'BATCH_UPDATE',
    payload: { worldStyle: 'cyberpunk' as const }
  });
  runner.assert(state.worldStyle === 'cyberpunk', '应该更新worldStyle');
});

// 测试7: 更新设置
runner.test('更新设置', () => {
  const state = gameStateReducer(DEFAULT_GAME_STATE, {
    type: 'UPDATE_SETTINGS',
    payload: { debugMode: true }
  });
  runner.assert(state.settings.debugMode === true, '应该更新settings.debugMode');
});

// 测试8: 重置状态
runner.test('重置状态', () => {
  const modifiedState = { ...DEFAULT_GAME_STATE, currentScreen: 'chat' as const };
  const state = gameStateReducer(modifiedState, { type: 'RESET_STATE' });
  runner.assert(state.currentScreen === 'profileSetup', '应该重置为默认状态');
});

// 运行测试
if (typeof window === 'undefined') {
  // Node.js环境
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  // 浏览器环境
  runner.run();
}

export { runner };

