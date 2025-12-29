/**
 * 温度感引擎 React Hook
 */

import { useEffect, useRef, useState } from 'react';
import { TemperatureEngine } from '../core/TemperatureEngine';
import { TemperatureEngineConfig, EngineState } from '../types/TemperatureTypes';

/**
 * 使用温度感引擎的Hook
 */
export function useTemperatureEngine(config?: Partial<TemperatureEngineConfig>) {
  const engineRef = useRef<TemperatureEngine | null>(null);
  const [state, setState] = useState<EngineState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 创建引擎实例
    const engine = new TemperatureEngine(config);
    engineRef.current = engine;

    // 启动引擎
    engine.start().then(() => {
      setIsReady(true);
      setState(engine.getState());
    });

    // 监听状态变化
    const updateState = () => {
      setState(engine.getState());
    };

    engine.on('temperatureChanged', updateState);
    engine.on('emotionDetected', updateState);
    engine.on('contextUpdated', updateState);
    engine.on('configUpdated', updateState);

    // 清理函数
    return () => {
      engine.off('temperatureChanged', updateState);
      engine.off('emotionDetected', updateState);
      engine.off('contextUpdated', updateState);
      engine.off('configUpdated', updateState);
      engine.destroy();
      engineRef.current = null;
      setIsReady(false);
      setState(null);
    };
  }, []);

  return {
    engine: engineRef.current,
    state,
    isReady,
    isRunning: state?.isRunning || false,
  };
}

