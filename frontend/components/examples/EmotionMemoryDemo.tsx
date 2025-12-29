/**
 * 情绪与记忆系统演示组件
 * 展示情绪分析和记忆提取的功能
 */

import React, { useState } from 'react';
import { useEmotionSystem } from '../../services/emotion-system';
import { useMemorySystem } from '../../services/memory-system';
import { EmotionMemoryFusion } from '../../services/emotion-memory-fusion';
import { MemorySource } from '../../services/memory-system/types/MemoryTypes';

interface EmotionMemoryDemoProps {
  userId: number;
}

export const EmotionMemoryDemo: React.FC<EmotionMemoryDemoProps> = ({ userId }) => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 初始化系统
  const emotionSystem = useEmotionSystem({
    enabled: true,
    fusionEnabled: true,
    storageEnabled: true,
    autoAnalysis: true,
    aiEnhanced: true,
    userId,
  });

  const memorySystem = useMemorySystem({
    enabled: true,
    autoExtraction: true,
    aiEnhanced: true,
    userId,
  });

  const [fusion, setFusion] = React.useState<EmotionMemoryFusion | null>(null);

  React.useEffect(() => {
    if (emotionSystem.system && memorySystem.system) {
      const fusionSystem = new EmotionMemoryFusion(
        emotionSystem.system,
        memorySystem.system
      );
      setFusion(fusionSystem);
    }
  }, [emotionSystem.system, memorySystem.system]);

  const handleAnalyze = async () => {
    if (!inputText.trim() || !emotionSystem.isReady || !memorySystem.isReady) {
      return;
    }

    setIsProcessing(true);
    try {
      // 1. 分析情绪
      const emotion = await emotionSystem.analyzeEmotion(inputText, 'conversation');
      console.log('情绪分析:', emotion);

      // 2. 提取记忆
      const memories = await memorySystem.extractAndSave(
        inputText,
        MemorySource.CONVERSATION
      );
      console.log('提取的记忆:', memories);

      // 3. 获取相关记忆
      const relevantMemories = await memorySystem.getRelevantMemories(inputText, 3);

      // 4. 生成个性化回应
      let personalizedResponse: string | undefined;
      if (fusion) {
        personalizedResponse = await fusion.generatePersonalizedResponse(
          emotion.primaryEmotion,
        inputText,
          { userId }
        );
      }

      setResults({
        emotion,
        memories,
        relevantMemories,
        personalizedResponse,
      });
    } catch (error) {
      console.error('分析失败:', error);
      alert('分析失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetTrend = async () => {
    if (!emotionSystem.isReady) return;

    try {
      const trend = await emotionSystem.getTrend('week');
      console.log('情绪趋势:', trend);
      alert(`情绪趋势: ${trend.trend} (${trend.trendDescription})`);
    } catch (error) {
      console.error('获取趋势失败:', error);
    }
  };

  const handleGetStatistics = async () => {
    if (!emotionSystem.isReady) return;

    try {
      const statistics = await emotionSystem.getStatistics('week');
      console.log('情绪统计:', statistics);
      setResults({ statistics });
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  };

  if (!emotionSystem.isReady || !memorySystem.isReady) {
    return (
      <div className="p-4 bg-slate-900/50 rounded-lg text-white">
        <p>系统初始化中...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900/50 rounded-lg text-white space-y-4">
      <h2 className="text-2xl font-bold mb-4">情绪与记忆系统演示</h2>

      {/* 输入区域 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">输入文本（测试情绪分析）</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="例如：我今天非常开心！或者：今天工作很累，心情不好..."
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={handleAnalyze}
            disabled={isProcessing || !inputText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isProcessing ? '分析中...' : '分析情绪和提取记忆'}
          </button>
          <button
            onClick={handleGetTrend}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            查看情绪趋势
          </button>
          <button
            onClick={handleGetStatistics}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            查看统计
          </button>
        </div>
      </div>

      {/* 结果显示 */}
      {results && (
        <div className="mt-6 space-y-4">
          {/* 情绪分析结果 */}
          {results.emotion && (
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">情绪分析结果</h3>
              <div className="space-y-1 text-sm">
                <p><strong>主要情绪:</strong> {results.emotion.primaryEmotion}</p>
                <p><strong>强度:</strong> {results.emotion.intensity}</p>
                <p><strong>置信度:</strong> {(results.emotion.confidence * 100).toFixed(0)}%</p>
                {results.emotion.emotionTags && results.emotion.emotionTags.length > 0 && (
                  <p><strong>标签:</strong> {results.emotion.emotionTags.join(', ')}</p>
                )}
                {results.emotion.keyPhrases && results.emotion.keyPhrases.length > 0 && (
                  <p><strong>关键短语:</strong> {results.emotion.keyPhrases.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* 提取的记忆 */}
          {results.memories && results.memories.length > 0 && (
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">提取的记忆 ({results.memories.length}条)</h3>
              <div className="space-y-2">
                {results.memories.map((memory: any, index: number) => (
                  <div key={index} className="p-2 bg-slate-700 rounded text-sm">
                    <p><strong>类型:</strong> {memory.memoryType}</p>
                    <p><strong>内容:</strong> {memory.content}</p>
                    <p><strong>重要性:</strong> {memory.importance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 相关记忆 */}
          {results.relevantMemories && results.relevantMemories.length > 0 && (
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">相关记忆 ({results.relevantMemories.length}条)</h3>
              <div className="space-y-2">
                {results.relevantMemories.map((memory: any, index: number) => (
                  <div key={index} className="p-2 bg-slate-700 rounded text-sm">
                    <p>{memory.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 个性化回应 */}
          {results.personalizedResponse && (
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">个性化回应</h3>
              <p className="text-indigo-300">{results.personalizedResponse}</p>
            </div>
          )}

          {/* 统计结果 */}
          {results.statistics && (
            <div className="p-4 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">情绪统计</h3>
              <div className="space-y-1 text-sm">
                <p><strong>总记录数:</strong> {results.statistics.total}</p>
                <p><strong>平均置信度:</strong> {(results.statistics.averageConfidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

