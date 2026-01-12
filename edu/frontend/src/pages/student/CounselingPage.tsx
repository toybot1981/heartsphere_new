import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mockEmotionRecords } from '../../types/mock';
import type { AgeGroup } from '../../types';

export const CounselingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ageGroup = (searchParams.get('ageGroup') || 'elementary') as AgeGroup;
  const isElementary = ageGroup === 'elementary';
  const bgGradient = isElementary 
    ? 'bg-gradient-to-br from-primary-elementary-50 to-primary-elementary-100' 
    : 'bg-gradient-to-br from-primary-middle-50 to-primary-middle-100';
  
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{id: string, role: 'student' | 'counselor', content: string, timestamp: string}>>([]);
  const [input, setInput] = useState('');

  const recentEmotions = mockEmotionRecords.slice(0, 5);

  const handleStartSession = () => {
    setSelectedSession('new');
    setMessages([{
      id: '1',
      role: 'counselor',
      content: isElementary 
        ? '你好！我是你的心理辅导小助手，你有什么想说的吗？😊 我会认真倾听，帮助你解决问题。' 
        : '你好！我是你的心理辅导助手，很高兴与你交流。请告诉我你今天感觉如何，或者有什么想要分享的？',
      timestamp: new Date().toISOString(),
    }]);
  };

  const handleMoodCheck = (emotion: string) => {
    const moodMessages = {
      happy: isElementary ? '太好了！继续保持好心情！😊' : '很高兴听到你心情不错，保持积极的心态很重要。',
      sad: isElementary ? '我理解你的感受，每个人都会有难过的时候。要不要和我聊聊发生了什么？💙' : '我理解你现在的感受。每个人都有低落的时候，这很正常。你愿意和我分享发生了什么吗？',
      anxious: isElementary ? '焦虑的时候确实不好受。让我们一起想想办法吧！💪' : '焦虑是正常的情绪反应。让我们一起来分析一下焦虑的来源，找到应对的方法。',
      frustrated: isElementary ? '挫折感确实让人不舒服。我们可以一起想想解决办法！🤔' : '挫折感有时会让我们感到困扰。我们可以一起分析一下原因，找到前进的方向。',
      excited: isElementary ? '太棒了！好心情很有感染力！🌟' : '很高兴你感到兴奋！积极情绪很有助于学习和生活。',
      calm: isElementary ? '平静的心情很棒！继续保持哦！☮️' : '平静的心态很好，这有助于清晰的思考。',
    };
    setMessages([{
      id: '1',
      role: 'counselor',
      content: moodMessages[emotion as keyof typeof moodMessages] || '我理解你的感受。',
      timestamp: new Date().toISOString(),
    }]);
    setSelectedSession('new');
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'student' as const,
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const counselorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'counselor' as const,
        content: isElementary
          ? '我理解你的感受。让我们一起来想想办法，你觉得自己可以做些什么来改善这种情况呢？💙'
          : '我理解你现在的感受。这是正常的情绪反应。让我们一起来分析一下情况，找到应对的方法。你觉得有哪些方式可以帮助自己？',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, counselorMessage]);
    }, 1000);

    setInput('');
  };

  const emotions = [
    { id: 'happy', emoji: '😊', name: '开心', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' },
    { id: 'sad', emoji: '😢', name: '难过', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
    { id: 'anxious', emoji: '😰', name: '焦虑', color: 'bg-orange-100 hover:bg-orange-200 text-orange-800' },
    { id: 'frustrated', emoji: '😤', name: '沮丧', color: 'bg-red-100 hover:bg-red-200 text-red-800' },
    { id: 'excited', emoji: '🤩', name: '兴奋', color: 'bg-pink-100 hover:bg-pink-200 text-pink-800' },
    { id: 'calm', emoji: '😌', name: '平静', color: 'bg-green-100 hover:bg-green-200 text-green-800' },
  ];

  return (
    <div className={`min-h-screen ${bgGradient} p-6`}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Button 
            ageGroup={ageGroup}
            variant="outline"
            onClick={() => navigate(`/student/dashboard/${ageGroup}`)}
            className="mb-4"
          >
            ← 返回
          </Button>
          <h1 className={`text-4xl font-bold ${isElementary ? 'text-primary-elementary-700' : 'text-primary-middle-700'} mb-2`}>
            {isElementary ? '💚 心理辅导' : '心理辅导'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isElementary ? '在这里，你可以随时分享你的感受，我会认真倾听！' : '安全、私密的空间，分享你的感受和困扰'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主对话区域 */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <Card className="h-[calc(100vh-12rem)] flex flex-col">
                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'student'
                            ? isElementary
                              ? 'bg-primary-elementary-500 text-white'
                              : 'bg-primary-middle-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.role === 'student' ? 'text-white/70' : 'text-gray-500'}`}>
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
                      placeholder={isElementary ? '输入你想说的话...' : '输入你想说的话，按 Enter 发送'}
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
                </div>
              </Card>
            ) : (
              <>
                {/* 心情检查 */}
                <Card className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {isElementary ? '😊 心情打卡' : '心情打卡'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {isElementary ? '告诉我你今天心情怎么样？' : '今天你的心情如何？选择一个最能代表你当前感受的情绪。'}
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {emotions.map((emotion) => (
                      <button
                        key={emotion.id}
                        onClick={() => handleMoodCheck(emotion.id)}
                        className={`p-4 rounded-lg transition-all hover:scale-105 ${emotion.color}`}
                      >
                        <div className="text-3xl mb-2">{emotion.emoji}</div>
                        <div className="text-sm font-medium">{emotion.name}</div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* 开始对话 */}
                <Card>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💚</div>
                    <h2 className="text-2xl font-semibold mb-2">
                      {isElementary ? '准备好开始对话了吗？' : '准备开始心理辅导对话'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {isElementary 
                        ? '在这里，你可以随时分享你的感受，我会认真倾听并帮助你！' 
                        : '这是一个安全、私密的空间。你可以分享任何困扰、压力或情感问题。'}
                    </p>
                    <Button ageGroup={ageGroup} onClick={handleStartSession}>
                      {isElementary ? '💬 开始对话' : '开始对话'}
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 最近的情绪记录 */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                {isElementary ? '📊 最近心情' : '情绪记录'}
              </h2>
              {recentEmotions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  {isElementary ? '还没有记录' : '暂无记录'}
                </p>
              ) : (
                <div className="space-y-3">
                  {recentEmotions.map((record) => (
                    <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{record.emotion}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-elementary-500 h-2 rounded-full" 
                          style={{ width: `${(record.intensity / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 紧急资源 */}
            <Card className="bg-red-50 border-red-200">
              <h2 className="text-xl font-semibold mb-3 text-red-700">
                {isElementary ? '⚠️ 紧急情况' : '紧急资源'}
              </h2>
              <p className="text-sm text-red-700 mb-4">
                {isElementary 
                  ? '如果你感到非常难过或者有危险的想法，一定要告诉家长或老师！' 
                  : '如果你遇到紧急情况或感到极度困扰，请立即联系信任的成年人或专业机构。'}
              </p>
              <div className="space-y-2 text-sm">
                <Button ageGroup={ageGroup} variant="outline" size="sm" className="w-full">
                  {isElementary ? '📞 联系家长' : '联系家长'}
                </Button>
                <Button ageGroup={ageGroup} variant="outline" size="sm" className="w-full">
                  {isElementary ? '👨‍🏫 联系老师' : '联系老师'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};