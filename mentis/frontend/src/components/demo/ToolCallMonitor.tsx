import React, { useState } from 'react';

export interface ToolCall {
  id: number;
  sessionId: string;
  toolName: string;
  parameters: string;
  result: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  startTime: string;
  endTime?: string;
  duration?: number;
  errorMessage?: string;
}

interface ToolCallMonitorProps {
  sessionId: string | null;
  toolCalls: ToolCall[];
  onToolCallClick?: (toolCall: ToolCall) => void;
}

export const ToolCallMonitor: React.FC<ToolCallMonitorProps> = ({
  sessionId,
  toolCalls,
  onToolCallClick,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getStatusColor = (status: ToolCall['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800';
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const formatTime = (timeStr: string) => {
    try {
      return new Date(timeStr).toLocaleTimeString();
    } catch {
      return timeStr;
    }
  };

  if (!sessionId) {
    return (
      <div className="p-4 text-gray-500 text-center">
        请先创建会话以查看工具调用
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">工具调用监控</h3>
        <p className="text-xs text-gray-500 mt-1">
          共 {toolCalls.length} 次调用
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {toolCalls.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            暂无工具调用记录
          </div>
        ) : (
          <div className="divide-y">
            {toolCalls.map((toolCall) => (
              <div
                key={toolCall.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  expandedId === toolCall.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  setExpandedId(expandedId === toolCall.id ? null : toolCall.id);
                  onToolCallClick?.(toolCall);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {toolCall.toolName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                          toolCall.status
                        )}`}
                      >
                        {toolCall.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(toolCall.startTime)} · {formatDuration(toolCall.duration)}
                    </div>
                  </div>
                  <button
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(expandedId === toolCall.id ? null : toolCall.id);
                    }}
                  >
                    {expandedId === toolCall.id ? '▼' : '▶'}
                  </button>
                </div>

                {expandedId === toolCall.id && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">参数:</div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {toolCall.parameters || '无'}
                      </pre>
                    </div>
                    {toolCall.result && (
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-1">结果:</div>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {toolCall.result}
                        </pre>
                      </div>
                    )}
                    {toolCall.errorMessage && (
                      <div>
                        <div className="text-xs font-medium text-red-600 mb-1">错误:</div>
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {toolCall.errorMessage}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
