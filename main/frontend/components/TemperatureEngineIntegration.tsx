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
      <div 
        className="fixed bottom-4 right-4 backdrop-blur-md rounded-lg p-3 border text-xs"
        style={{
          backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.9))',
          borderColor: 'var(--border-color-overlay, #334155)',
          color: 'var(--text-tertiary)',
        }}
      >
        温度感引擎初始化中...
      </div>
    );
  }

  const temperature = state?.currentTemperature;
  const emotion = state?.currentEmotion;

  return (
    <div 
      className="fixed bottom-4 right-4 backdrop-blur-md rounded-lg p-4 border text-xs space-y-2 min-w-[200px] z-50"
      style={{
        backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.9))',
        borderColor: 'var(--border-color-overlay, #334155)',
      }}
    >
      <div 
        className="font-bold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        温度感引擎
      </div>
      
      {temperature && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>温度感:</span>
            <span 
              className="font-bold"
              style={{
                color: temperature.level === 'hot' 
                  ? 'var(--color-error, #f87171)'
                  : temperature.level === 'warm'
                  ? 'var(--color-primary, #f472b6)'
                  : temperature.level === 'neutral'
                  ? 'var(--text-tertiary)'
                  : 'var(--color-info, #60a5fa)',
              }}
            >
              {temperature.level} ({temperature.score.toFixed(0)})
            </span>
          </div>
          <div 
            className="w-full rounded-full h-2"
            style={{ backgroundColor: 'var(--bg-secondary, #475569)' }}
          >
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${temperature.score}%`,
                backgroundColor: temperature.level === 'hot'
                  ? 'var(--color-error, #ef4444)'
                  : temperature.level === 'warm'
                  ? 'var(--color-primary, #ec4899)'
                  : temperature.level === 'neutral'
                  ? 'var(--text-tertiary)'
                  : 'var(--color-info, #3b82f6)',
              }}
            />
          </div>
        </div>
      )}

      {emotion && (
        <div className="flex items-center justify-between">
          <span style={{ color: 'var(--text-tertiary)' }}>情绪:</span>
          <span 
            className="font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {emotion.type}
          </span>
        </div>
      )}

      {currentExpression && (
        <div className="flex items-center justify-between">
          <span style={{ color: 'var(--text-tertiary)' }}>表情:</span>
          <span 
            className="font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {currentExpression}
          </span>
        </div>
      )}

      <div 
        className="pt-2 border-t text-[10px]"
        style={{
          borderColor: 'var(--border-color-overlay, #475569)',
          color: 'var(--text-disabled)',
        }}
      >
        引擎状态: {state?.isEngineRunning ? '运行中' : '已停止'}
      </div>
    </div>
  );
};




