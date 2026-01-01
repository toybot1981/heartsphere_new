/**
 * 温度感引擎集成测试组件
 * 用于测试和演示温度感引擎的集成效果
 */

import React, { useEffect, useState } from 'react';
import { useTemperatureEngine } from '../services/temperature-engine';
import { TemperatureLevel } from '../services/temperature-engine/types/TemperatureTypes';

interface TemperatureEngineIntegrationProps {
  characterName?: string;
  onTemperatureChange?: (level: TemperatureLevel) => void;
}

export const TemperatureEngineIntegration: React.FC<TemperatureEngineIntegrationProps> = ({
  characterName,
  onTemperatureChange,
}) => {
  const { engine, state, isReady } = useTemperatureEngine({
    enabled: true,
    plugins: {
      enabled: ['greeting', 'expression', 'dialogue'],
    },
  });

  const [currentExpression, setCurrentExpression] = useState<string | null>(null);

  useEffect(() => {
    if (!engine || !isReady) return;

    // 监听表情变化
    const handleExpressionChange = (event: CustomEvent) => {
      setCurrentExpression(event.detail.expression);
    };

    window.addEventListener('temperatureExpressionChanged', handleExpressionChange as EventListener);

    return () => {
      window.removeEventListener('temperatureExpressionChanged', handleExpressionChange as EventListener);
    };
  }, [engine, isReady]);

  useEffect(() => {
    if (state?.currentTemperature && onTemperatureChange) {
      onTemperatureChange(state.currentTemperature.level);
    }
  }, [state?.currentTemperature, onTemperatureChange]);

  if (!isReady) {
    return (
      <div className="fixed bottom-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-lg p-3 border border-slate-700 text-xs text-slate-400">
        温度感引擎初始化中...
      </div>
    );
  }

  const temperature = state?.currentTemperature;
  const emotion = state?.currentEmotion;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-lg p-4 border border-slate-700 text-xs space-y-2 min-w-[200px] z-50">
      <div className="text-white font-bold mb-2">温度感引擎</div>
      
      {temperature && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">温度感:</span>
            <span className={`font-bold ${
              temperature.level === 'hot' ? 'text-red-400' :
              temperature.level === 'warm' ? 'text-pink-400' :
              temperature.level === 'neutral' ? 'text-gray-400' :
              'text-blue-400'
            }`}>
              {temperature.level} ({temperature.score.toFixed(0)})
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                temperature.level === 'hot' ? 'bg-red-500' :
                temperature.level === 'warm' ? 'bg-pink-500' :
                temperature.level === 'neutral' ? 'bg-gray-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${temperature.score}%` }}
            />
          </div>
        </div>
      )}

      {emotion && (
        <div className="flex items-center justify-between">
          <span className="text-slate-400">情绪:</span>
          <span className="text-white font-medium">{emotion.type}</span>
        </div>
      )}

      {currentExpression && (
        <div className="flex items-center justify-between">
          <span className="text-slate-400">表情:</span>
          <span className="text-white font-medium">{currentExpression}</span>
        </div>
      )}

      <div className="pt-2 border-t border-slate-700 text-slate-500 text-[10px]">
        引擎状态: {state?.isEngineRunning ? '运行中' : '已停止'}
      </div>
    </div>
  );
};




