# 温度感引擎 (Temperature Engine)

温度感引擎是一个独立的、可插拔的模块系统，负责计算和调节系统温度感，提供情感化的用户体验。

## 🚀 快速开始

### 基础使用

```typescript
import { TemperatureEngine } from './services/temperature-engine';

// 创建引擎实例
const engine = new TemperatureEngine({
  enabled: true,
  temperature: { default: 'warm' },
});

// 启动引擎
await engine.start();

// 计算温度感
const temperature = await engine.calculateTemperature({
  userEmotion: 'happy',
  context: {
    timeOfDay: 'morning',
    device: 'desktop',
    userActivity: {
      sessionDuration: 10000,
      messageCount: 5,
      lastInteraction: 1000,
    },
    conversation: {
      length: 10,
      sentiment: 'positive',
    },
  },
});

console.log('温度感:', temperature.level, temperature.score);
```

### 在React中使用

```typescript
import { useTemperatureEngine } from './services/temperature-engine';

function MyComponent() {
  const { engine, state, isReady } = useTemperatureEngine({
    enabled: true,
    temperature: { default: 'warm' },
  });

  useEffect(() => {
    if (!engine || !isReady) return;

    // 监听温度感变化
    engine.on('temperatureChanged', (temperature) => {
      console.log('温度感变化:', temperature);
    });
  }, [engine, isReady]);

  return (
    <div>
      {state?.currentTemperature && (
        <p>当前温度感: {state.currentTemperature.level}</p>
      )}
    </div>
  );
}
```

## 📁 文件结构

```
temperature-engine/
├── core/                    # 核心引擎
│   ├── TemperatureEngine.ts # 核心引擎类
│   ├── EngineState.ts       # 状态管理
│   └── EngineAPI.ts         # 对外API
├── config/                  # 配置系统
│   └── TemperatureConfig.ts # 配置管理
├── events/                 # 事件系统
│   ├── EventSystem.ts       # 事件系统
│   └── EventTypes.ts        # 事件类型
├── calculator/              # 计算层
│   ├── EmotionAnalyzer.ts  # 情绪分析器
│   ├── ContextAwareness.ts # 上下文感知
│   ├── TemperatureScorer.ts # 温度感评分器
│   └── TemperaturePredictor.ts # 温度感预测器
├── adjusters/              # 调节层
│   ├── UIAdjuster.ts       # UI调节器
│   ├── InteractionAdjuster.ts # 交互调节器
│   ├── ContentAdjuster.ts  # 内容调节器
│   └── CharacterAdjuster.ts # 角色调节器
├── plugins/                # 插件系统
│   ├── PluginInterface.ts  # 插件接口
│   ├── PluginManager.ts    # 插件管理器
│   └── builtin/            # 内置插件
│       ├── GreetingPlugin.ts # 问候插件
│       ├── ExpressionPlugin.ts # 表情插件
│       └── DialoguePlugin.ts # 对话插件
├── types/                   # 类型定义
│   └── TemperatureTypes.ts  # 核心类型
├── hooks/                   # React Hooks
│   └── useTemperatureEngine.ts
├── examples/                # 使用示例
│   ├── basic-usage.ts
│   ├── calculator-usage.ts
│   ├── adjuster-usage.ts
│   └── plugin-usage.ts
├── index.ts                 # 主入口
└── README.md               # 本文档
```

## 🔧 API文档

### TemperatureEngine

核心引擎类，提供完整的温度感计算和调节功能。

#### 方法

**生命周期**:
- `start()`: 启动引擎
- `stop()`: 停止引擎
- `destroy()`: 销毁引擎

**计算功能**:
- `calculateTemperature(input)`: 计算温度感
- `analyzeEmotion(input)`: 分析情绪
- `predictTemperature(timeRange)`: 预测温度感
- `analyzeContext(context)`: 分析上下文

**调节功能**:
- `adjustTemperature(target, options)`: 调节温度感（UI + 交互）
- `adjustContent(input)`: 调节内容温度感
- `adjustCharacter(target, options)`: 调节角色

**内容生成**:
- `generateGreeting(level, context)`: 生成问候语
- `generateEncouragement(level)`: 生成鼓励语
- `generateFarewell(level)`: 生成告别语

**事件和配置**:
- `on(event, listener)`: 注册事件监听
- `off(event, listener)`: 移除事件监听
- `getConfig()`: 获取配置
- `updateConfig(updates)`: 更新配置
- `getState()`: 获取状态

**获取调节器**:
- `getUIAdjuster()`: 获取UI调节器
- `getInteractionAdjuster()`: 获取交互调节器
- `getContentAdjuster()`: 获取内容调节器
- `getCharacterAdjuster()`: 获取角色调节器

**插件系统**:
- `registerPlugin(plugin)`: 注册插件
- `unregisterPlugin(pluginId)`: 注销插件
- `enablePlugin(pluginId)`: 启用插件
- `disablePlugin(pluginId)`: 禁用插件
- `callPluginMethod(pluginId, methodName, ...args)`: 调用插件方法
- `getPluginManager()`: 获取插件管理器

### EngineAPI

简化的API接口，提供更友好的使用方式。

#### 方法

- `start()`: 启动引擎
- `stop()`: 停止引擎
- `calculate(input)`: 计算温度感
- `analyzeEmotion(input)`: 分析情绪
- `adjust(target, options)`: 调节温度感
- `adjustContent(input)`: 调节内容
- `getTemperature()`: 获取当前温度感
- `getEmotion()`: 获取当前情绪
- `getConfig()`: 获取配置
- `updateConfig(updates)`: 更新配置

### useTemperatureEngine Hook

React Hook，方便在组件中使用。

#### 返回值

- `engine`: 引擎实例
- `state`: 引擎状态
- `isReady`: 是否就绪
- `isRunning`: 是否运行中

## 📖 更多文档

- [架构设计](../../../docs/开发/温度感引擎架构设计.md)
- [快速启动指南](../../../docs/开发/温度感引擎快速启动.md)
- [使用示例](./examples/basic-usage.ts)

## 🎯 完成状态

- ✅ **第一阶段**: 核心引擎（已完成）
- ✅ **第二阶段**: 温度感计算层（已完成）
- ✅ **第三阶段**: 温度感调节层（已完成）
- ✅ **第四阶段**: 插件系统（已完成）

**🎉 温度感引擎全部核心功能已完成！**

## 🎯 下一步

- 集成测试和优化（1-2天）
- 性能优化
- 用户体验测试

---

**版本**: 1.0.0  
**最后更新**: 2025-12-28

