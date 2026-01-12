import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockCharacters } from '../../types/mock';
import type { AgeGroup } from '../../types';

export const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const characterId = searchParams.get('characterId');
  const isElementary = ageGroup === 'elementary';
  const bgGradient = isElementary 
    ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' 
    : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100';
  
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: string}>>([
    {
      id: '1',
      role: 'assistant',
      content: isElementary ? '你好！我是你的AI学习助手，有什么问题可以问我哦！😊' : '你好！我是你的AI学习助手，很高兴帮助你学习。',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');

  const character = characterId ? mockCharacters.find(c => c.id === characterId) : null;

  const handleSend = () => {
    if (!input.trim()) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: isElementary 
          ? '这是一个很好的问题！让我们一起来探索答案吧！🎓' 
          : '这是一个很好的问题。让我为你详细解释一下...',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInput('');
  };

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-4xl mx-auto h-[calc(100vh-3rem)] flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <Button 
              ageGroup={ageGroup}
              variant="outline"
              onClick={() => navigate(`/student/dashboard/${ageGroup}`)}
              className="mb-2"
            >
              ← 返回
            </Button>
            <h1 className={`text-2xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'}`}>
              {character ? character.name : (isElementary ? '💬 AI对话' : 'AI对话')}
            </h1>
            {character && (
              <p className="text-gray-600">{character.description}</p>
            )}
          </div>
        </header>

        <Card className="flex-1 flex flex-col mb-4 overflow-hidden">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? isElementary
                        ? 'bg-primary-elementary-500 text-white'
                        : 'bg-primary-middle-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 输入区域 */}
          <div className="border-t p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isElementary ? '输入你的问题...' : '输入你的问题，按 Enter 发送，Shift+Enter 换行'}
                rows={3}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-elementary-500 focus:border-transparent resize-none"
              />
              <Button 
                ageGroup={ageGroup}
                onClick={handleSend}
                disabled={!input.trim()}
                className="self-end"
              >
                {isElementary ? '📤 发送' : '发送'}
              </Button>
            </div>
            
            {isElementary && (
              <div className="mt-2 flex gap-2">
                {['帮我解释一下', '举个例子', '再详细一点'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            size="sm"
            onClick={() => navigate(`/student/characters?ageGroup=${ageGroup}`)}
          >
            {isElementary ? '👤 选择角色' : '选择角色'}
          </Button>
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            size="sm"
            onClick={() => navigate(`/student/scenes?ageGroup=${ageGroup}`)}
          >
            {isElementary ? '🎨 创建场景' : '创建场景'}
          </Button>
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            size="sm"
            onClick={() => setMessages([])}
          >
            {isElementary ? '🔄 清空对话' : '清空对话'}
          </Button>
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            size="sm"
            onClick={() => console.log('导出对话')}
          >
            {isElementary ? '💾 保存对话' : '保存对话'}
          </Button>
        </div>
      </div>
    </div>
  );
};