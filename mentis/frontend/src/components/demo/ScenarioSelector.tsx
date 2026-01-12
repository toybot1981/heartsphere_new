import React, { useState, useEffect } from 'react';

export interface DemoScenario {
  id: string;
  name: string;
  category: string;
  description: string;
  exampleMessage?: string;
}

interface ScenarioSelectorProps {
  onSelectScenario?: (scenario: DemoScenario) => void;
  onLoadMessage?: (message: string) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  onSelectScenario,
  onLoadMessage,
}) => {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      // 优先从后端 API 加载，如果失败则使用本地配置
      try {
        const response = await fetch('/api/mentis/demo/scenarios');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setScenarios(result.data);
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn('Failed to load scenarios from API, using local config:', apiError);
      }
      
      // 使用本地配置（如果需要）
      // const { demoScenarios: localScenarios } = await import('../scenarios');
      // setScenarios(localScenarios);
      setScenarios([]);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(scenarios.map(s => s.category)));

  const filteredScenarios =
    selectedCategory === 'all'
      ? scenarios
      : scenarios.filter(s => s.category === selectedCategory);

  const handleScenarioClick = (scenario: DemoScenario) => {
    onSelectScenario?.(scenario);
    if (scenario.exampleMessage && onLoadMessage) {
      onLoadMessage(scenario.exampleMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        加载演示场景中...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">演示场景</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 text-xs rounded ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-xs rounded ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredScenarios.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            暂无演示场景
          </div>
        ) : (
          <div className="space-y-2">
            {filteredScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="p-3 border rounded hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleScenarioClick(scenario)}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {scenario.name}
                </div>
                <div className="text-xs text-gray-600">{scenario.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
