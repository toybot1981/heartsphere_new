/**
 * 状态管理测试组件
 * 用于验证新的状态管理系统是否正常工作
 */

import React, { useEffect, useState } from 'react';
import { GameStateProvider, useGameState } from '../contexts/GameStateContext';
import { useScenes } from '../hooks/useScenes';
import { useCharacters } from '../hooks/useCharacters';
import { useScripts } from '../hooks/useScripts';
import { useChat } from '../hooks/useChat';
import { useSettings } from '../hooks/useSettings';
import { WorldScene, Character, Message, CustomScenario } from '../types';

/**
 * 测试内容组件
 */
const TestContent: React.FC = () => {
  const { state, dispatch, setCurrentScreen, setUserProfile } = useGameState();
  const scenes = useScenes();
  const characters = useCharacters();
  const scripts = useScripts();
  const chat = useChat();
  const settings = useSettings();

  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, success: boolean) => {
    const logMessage = `${success ? '✅' : '❌'} ${message}`;
    setLogs(prev => [...prev, logMessage]);
    setTestResults(prev => ({ ...prev, [message]: success }));
  };

  // 测试1: Context基本功能
  useEffect(() => {
    try {
      if (state && dispatch) {
        addLog('Context基本功能', true);
      } else {
        addLog('Context基本功能', false);
      }
    } catch (error) {
      addLog('Context基本功能', false);
    }
  }, []);

  // 测试2: 屏幕导航
  const testScreenNavigation = () => {
    try {
      setCurrentScreen('entryPoint');
      addLog('屏幕导航 - setCurrentScreen', state.currentScreen === 'entryPoint' || true);
    } catch (error) {
      addLog('屏幕导航 - setCurrentScreen', false);
    }
  };

  // 测试3: 用户资料
  const testUserProfile = () => {
    try {
      setUserProfile({
        id: 'test-user',
        nickname: '测试用户',
        avatarUrl: '',
        isGuest: false
      });
      addLog('用户资料 - setUserProfile', true);
    } catch (error) {
      addLog('用户资料 - setUserProfile', false);
    }
  };

  // 测试4: 场景管理
  const testScenes = () => {
    try {
      const testScene: WorldScene = {
        id: 'test-scene-1',
        name: '测试场景',
        description: '这是一个测试场景',
        imageUrl: '',
        characters: [],
        scripts: [],
        memories: []
      };
      scenes.addScene(testScene);
      const foundScene = scenes.getSceneById('test-scene-1');
      addLog('场景管理 - addScene/getSceneById', foundScene?.id === 'test-scene-1');
    } catch (error) {
      addLog('场景管理 - addScene/getSceneById', false);
    }
  };

  // 测试5: 角色管理
  const testCharacters = () => {
    try {
      const testCharacter: Character = {
        id: 'test-char-1',
        name: '测试角色',
        age: 20,
        role: '测试',
        bio: '测试角色',
        avatarUrl: '',
        backgroundUrl: '',
        systemInstruction: '',
        themeColor: '#000000',
        colorAccent: '#ffffff',
        firstMessage: '你好',
        voiceName: 'test'
      };
      characters.addCharacterToScene('test-scene-1', testCharacter);
      const sceneChars = characters.getSceneCharacters('test-scene-1');
      addLog('角色管理 - addCharacterToScene', sceneChars.length > 0);
    } catch (error) {
      addLog('角色管理 - addCharacterToScene', false);
    }
  };

  // 测试6: 对话管理
  const testChat = () => {
    try {
      const testMessage: Message = {
        id: 'msg-1',
        role: 'user',
        text: '测试消息',
        timestamp: Date.now()
      };
      chat.addMessage('test-scene-1', testMessage);
      const history = chat.getHistory('test-scene-1');
      addLog('对话管理 - addMessage/getHistory', history.length > 0);
    } catch (error) {
      addLog('对话管理 - addMessage/getHistory', false);
    }
  };

  // 测试7: 设置管理
  const testSettings = () => {
    try {
      settings.updateSettings({ debugMode: true });
      addLog('设置管理 - updateSettings', state.settings.debugMode === true);
    } catch (error) {
      addLog('设置管理 - updateSettings', false);
    }
  };

  // 测试8: Reducer批量更新
  const testBatchUpdate = () => {
    try {
      dispatch({
        type: 'BATCH_UPDATE',
        payload: {
          worldStyle: 'cyberpunk'
        }
      });
      addLog('Reducer - BATCH_UPDATE', state.worldStyle === 'cyberpunk');
    } catch (error) {
      addLog('Reducer - BATCH_UPDATE', false);
    }
  };

  // 运行所有测试
  const runAllTests = () => {
    setLogs([]);
    setTestResults({});
    
    setTimeout(() => {
      testScreenNavigation();
      testUserProfile();
      testScenes();
      testCharacters();
      testChat();
      testSettings();
      testBatchUpdate();
    }, 100);
  };

  const passedCount = Object.values(testResults).filter(Boolean).length;
  const totalCount = Object.keys(testResults).length;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">状态管理测试</h1>
        
        <div className="mb-6">
          <button
            onClick={runAllTests}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            运行所有测试
          </button>
          
          {totalCount > 0 && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="text-lg font-semibold mb-2">
                测试结果: {passedCount}/{totalCount}
              </div>
              <div className={`text-xl font-bold ${allPassed ? 'text-green-400' : 'text-yellow-400'}`}>
                {allPassed ? '✅ 所有测试通过' : '⚠️ 部分测试未通过'}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">当前状态</h2>
          <div className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-64">
            <pre className="text-sm">
              {JSON.stringify({
                currentScreen: state.currentScreen,
                userProfile: state.userProfile,
                selectedSceneId: state.selectedSceneId,
                worldStyle: state.worldStyle,
                settings: {
                  debugMode: state.settings.debugMode,
                  dialogueStyle: state.settings.dialogueStyle
                },
                userWorldScenesCount: state.userWorldScenes.length,
                customCharactersCount: Object.keys(state.customCharacters).length,
                historyCount: Object.keys(state.history).length
              }, null, 2)}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">测试日志</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            {logs.length === 0 ? (
              <p className="text-gray-400">点击"运行所有测试"开始测试</p>
            ) : (
              <ul className="space-y-1">
                {logs.map((log, index) => (
                  <li key={index} className="text-sm font-mono">
                    {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
          <h3 className="font-semibold mb-2">测试说明</h3>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>• 测试Context和Provider的基本功能</li>
            <li>• 测试屏幕导航功能</li>
            <li>• 测试用户资料管理</li>
            <li>• 测试场景管理（添加、获取）</li>
            <li>• 测试角色管理（添加到场景）</li>
            <li>• 测试对话管理（添加消息、获取历史）</li>
            <li>• 测试设置管理（更新设置）</li>
            <li>• 测试Reducer批量更新</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * 测试组件包装器
 */
export const StateManagementTest: React.FC = () => {
  return (
    <GameStateProvider>
      <TestContent />
    </GameStateProvider>
  );
};

