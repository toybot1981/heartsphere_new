import React, { useState, useEffect, useRef } from 'react';
import { ToolCallMonitor, ToolCall } from './ToolCallMonitor';
import { VmStatusPanel, VmStatusInfo } from './VmStatusPanel';
import { ScenarioSelector, DemoScenario } from './ScenarioSelector';

interface AgentScopeDemoProps {
  token: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'mentis' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export const AgentScopeDemo: React.FC<AgentScopeDemoProps> = ({ token }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vmStatus, setVmStatus] = useState<VmStatusInfo | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'chat' | 'monitor'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessageRef = useRef<Message | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 初始化会话
  useEffect(() => {
    if (token) {
      createSession();
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [token]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 订阅 SSE 事件流
  useEffect(() => {
    if (!sessionId) return;

    const eventSource = new EventSource(`/api/mentis/events/session/${sessionId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (event.type === 'tool_call_start' || event.type === 'tool_call_end' || event.type === 'tool_call_error') {
          // 更新工具调用列表
          loadToolCalls();
        } else if (event.type === 'vm_status_change') {
          // 更新虚拟机状态
          loadVmStatus();
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  // 加载工具调用列表
  const loadToolCalls = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/mentis/tool-calls?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to load tool calls');
      
      const result = await response.json();
      if (result.success && result.data) {
        setToolCalls(result.data);
      }
    } catch (error) {
      console.error('Failed to load tool calls:', error);
    }
  };

  // 加载虚拟机状态
  const loadVmStatus = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/mentis/vm/${sessionId}/status`);
      if (!response.ok) throw new Error('Failed to load VM status');
      
      const result = await response.json();
      if (result.success && result.data) {
        setVmStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to load VM status:', error);
    }
  };

  // 创建会话
  const createSession = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/mentis/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'AgentScope Demo 会话' })
      });
      
      if (!response.ok) {
        throw new Error('创建会话失败');
      }
      
      const data = await response.json();
      const newSessionId = data.data?.sessionId || data.sessionId;
      setSessionId(newSessionId);
      
      // 加载初始数据
      loadToolCalls();
      loadVmStatus();
      
      // 添加欢迎消息
      setMessages([{
        id: 'welcome',
        role: 'system',
        content: '👋 欢迎体验 AgentScope Computer-Use 演示！\n\n我可以帮助你：\n• 执行系统命令\n• 运行脚本代码\n• GUI 自动化操作\n• 管理虚拟机生命周期\n\n选择演示场景或直接输入需求，我会通过工具调用完成！',
        timestamp: new Date()
      }]);
    } catch (err: any) {
      console.error('创建会话失败:', err);
      setError('创建会话失败: ' + (err.message || '未知错误'));
    }
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !sessionId || !token) return;

    const messageText = inputValue.trim();
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // 创建占位消息
    const tempMessageId = `mentis_${Date.now()}`;
    currentMessageRef.current = {
      id: tempMessageId,
      role: 'mentis',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };
    setMessages(prev => [...prev, currentMessageRef.current!]);

    try {
      const response = await fetch('/api/mentis/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          message: messageText,
          enableComputerUse: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const eventText of events) {
          if (!eventText.trim()) continue;

          const lines = eventText.split('\n');
          let eventType = 'message';
          let dataParts: string[] = [];

          for (const line of lines) {
            if (line.startsWith('event:')) {
              const colonIndex = line.indexOf(':');
              if (colonIndex !== -1) {
                eventType = line.substring(colonIndex + 1).trim();
              }
            } else if (line.startsWith('data:')) {
              const colonIndex = line.indexOf(':');
              if (colonIndex !== -1) {
                dataParts.push(line.substring(colonIndex + 1).trimStart());
              }
            }
          }

          const data = dataParts.join('\n').trim();
          
          if (eventType === 'message' && data) {
            try {
              let jsonStr = data;
              if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
                jsonStr = jsonStr.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              }
              
              const parsedData = JSON.parse(jsonStr);
              const responseText = parsedData.response || '';
              const messageId = parsedData.messageId || tempMessageId;

              if (messageId && currentMessageRef.current && currentMessageRef.current.id !== messageId) {
                currentMessageRef.current.id = messageId;
              }

              const targetMessageId = messageId || tempMessageId;
              setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === targetMessageId);
                if (idx !== -1) {
                  updated[idx] = {
                    ...updated[idx],
                    content: responseText,
                    isStreaming: true
                  };
                }
                return updated;
              });

              // 工具调用后刷新列表
              if (parsedData.taskId || responseText.includes('工具调用')) {
                setTimeout(() => loadToolCalls(), 500);
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          } else if (eventType === 'complete') {
            setMessages(prev => {
              const updated = [...prev];
              const idx = updated.findIndex(m => m.id === currentMessageRef.current?.id);
              if (idx !== -1) {
                updated[idx] = { ...updated[idx], isStreaming: false };
              }
              return updated;
            });
            setIsLoading(false);
            
            // 刷新工具调用和虚拟机状态
            loadToolCalls();
            loadVmStatus();
          } else if (eventType === 'error') {
            setError(data);
            setIsLoading(false);
          }
        }
      }
    } catch (err: any) {
      console.error('发送消息失败:', err);
      setError('发送消息失败: ' + (err.message || '未知错误'));
      setIsLoading(false);
    }
  };

  // 处理场景选择
  const handleScenarioSelect = (scenario: DemoScenario) => {
    if (scenario.exampleMessage) {
      setInputValue(scenario.exampleMessage);
    }
  };

  // 处理场景消息加载
  const handleLoadMessage = (message: string) => {
    setInputValue(message);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          AgentScope Computer-Use 演示
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView(activeView === 'chat' ? 'monitor' : 'chat')}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            {activeView === 'chat' ? '切换到监控' : '切换到聊天'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="flex border-b">
            <button
              onClick={() => setActiveView('chat')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeView === 'chat'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              演示场景
            </button>
            <button
              onClick={() => setActiveView('monitor')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeView === 'monitor'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              监控
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeView === 'chat' ? (
              <>
                <ScenarioSelector
                  onSelectScenario={handleScenarioSelect}
                  onLoadMessage={handleLoadMessage}
                />
                <div className="border-t h-64">
                  <VmStatusPanel
                    sessionId={sessionId}
                    vmStatus={vmStatus}
                    onRefresh={loadVmStatus}
                  />
                </div>
              </>
            ) : (
              <ToolCallMonitor
                sessionId={sessionId}
                toolCalls={toolCalls}
              />
            )}
          </div>
        </div>

        {/* 右侧聊天区域 */}
        <div className="flex-1 flex flex-col bg-white">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.role === 'system'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-50 text-gray-900 border'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入消息或选择演示场景..."
                disabled={isLoading || !sessionId}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !sessionId || !inputValue.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
