import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { EmptyState, EmptyStateMessages } from '../ui/EmptyState';
import { Loading, getRandomLoadingMessage } from '../ui/Loading';
import { ErrorState, ErrorMessages } from '../ui/ErrorState';
import { Toast, useToast } from '../ui/Toast';
import { FadeIn, SlideIn, ScaleIn, StaggeredList } from '../ui/Transition';
import { Character, useCharacterController } from '../character/Character';
import GreetingService from '../../services/GreetingService';
import DialogueService from '../../services/DialogueService';
import type { UserEmotion } from '../../services/GreetingService';

/**
 * 温度感系统演示组件
 * 展示所有温度感功能的使用
 */
export const TemperatureDemo: React.FC = () => {
  // Toast管理
  const { toasts, success, error, warning, info, removeToast } = useToast();
  
  // 角色控制
  const characterController = useCharacterController();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [message, setMessage] = useState('');
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [greeting, setGreeting] = useState('');
  const [userEmotion, setUserEmotion] = useState<UserEmotion>('neutral');
  
  // 初始化问候
  useEffect(() => {
    const context = GreetingService.buildGreetingContext({
      userEmotion: 'neutral',
    });
    const initialGreeting = GreetingService.selectGreeting(context);
    setGreeting(initialGreeting);
  }, []);
  
  // 处理消息发送
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // 添加用户消息
    setDialogueHistory(prev => [...prev, { role: 'user', content: message }]);
    
    // 角色处理消息
    characterController.processMessage(message);
    characterController.setProcessing(true);
    
    // 模拟AI响应
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      characterController.setProcessing(false);
      
      // 生成回应
      const response = DialogueService.processEmotionalResponse(message, userEmotion);
      setDialogueHistory(prev => [...prev, { role: 'assistant', content: response }]);
      
      success('发送成功！');
      setMessage('');
    }, 2000);
  };
  
  // 设置情绪
  const handleSetEmotion = (emotion: UserEmotion) => {
    setUserEmotion(emotion);
    characterController.processEmotion(emotion);
    info(`情绪已设置为：${emotion}`);
  };
  
  // 测试各种UI状态
  const testLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };
  
  const testError = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
    }, 3000);
  };
  
  const testEmpty = () => {
    setEmpty(true);
    setTimeout(() => {
      setEmpty(false);
    }, 3000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-bg p-6">
      {/* Toast容器 */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题 */}
        <FadeIn>
          <h1 className="text-hero font-title font-bold text-center mb-2 text-gradient">
            心域温度感系统演示
          </h1>
          <p className="text-center text-body text-text-secondary">
            展示温暖、友好的交互体验 ✨
          </p>
        </FadeIn>
        
        {/* 角色展示 */}
        <SlideIn>
          <Card hover>
            <CardHeader>
              <CardTitle>E-SOUL 角色</CardTitle>
              <CardDescription>
                看看我如何根据你的情绪和对话内容做出反应 💙
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center space-x-12 py-8">
                <Character
                  size={150}
                  onExpressionChange={(exp) => console.log('Expression changed:', exp)}
                  onActionComplete={(action) => console.log('Action completed:', action)}
                />
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      设置情绪
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['happy', 'sad', 'anxious', 'calm', 'neutral'] as UserEmotion[]).map((emotion) => (
                        <Button
                          key={emotion}
                          variant={userEmotion === emotion ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => handleSetEmotion(emotion)}
                        >
                          {emotion}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      角色动作
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="text" size="sm" onClick={() => characterController.setGreeting()}>
                        挥手
                      </Button>
                      <Button variant="text" size="sm" onClick={() => characterController.encourage()}>
                        鼓励
                      </Button>
                      <Button variant="text" size="sm" onClick={() => characterController.comfort()}>
                        安慰
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
        
        {/* 对话区域 */}
        <ScaleIn>
          <Card>
            <CardHeader>
              <CardTitle>对话区域</CardTitle>
              <CardDescription>
                与我对话，体验温度感交互 💙
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 问候语 */}
              {greeting && (
                <div className="mb-6 p-4 bg-warm-pink-lightest/30 rounded-lg border-2 border-warm-pink/20">
                  <p className="text-body text-text-primary">{greeting}</p>
                </div>
              )}
              
              {/* 对话历史 */}
              <div className="h-64 overflow-y-auto space-y-4 mb-4 p-4 bg-warm-beige-lightest/50 rounded-lg">
                {dialogueHistory.length === 0 ? (
                  <EmptyState
                    icon={
                      <svg
                        className="w-16 h-16 text-warm-pink"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8-4.03 8-9 8z"
                        />
                      </svg>
                    }
                    title="开始对话吧"
                    description="输入消息，开始与E-SOUL的温暖对话"
                  />
                ) : (
                  <StaggeredList staggerDelay={100}>
                    {dialogueHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-warm-pink text-white'
                              : 'bg-calm-blue-lightest text-text-primary'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </StaggeredList>
                )}
              </div>
              
              {/* 加载状态 */}
              {loading && (
                <div className="mb-4">
                  <Loading
                    size="sm"
                    message={getRandomLoadingMessage('generating')}
                  />
                </div>
              )}
              
              {/* 输入框 */}
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入消息..."
                showCount
                maxLength={200}
                fullWidth
              />
              
              <div className="mt-4 flex justify-end gap-2">
                <Button onClick={handleSendMessage} loading={loading}>
                  发送消息
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScaleIn>
        
        {/* UI组件测试 */}
        <SlideIn delay={200}>
          <Card>
            <CardHeader>
              <CardTitle>UI组件测试</CardTitle>
              <CardDescription>
                测试各种温度感UI组件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 按钮样式 */}
                <div className="space-y-3">
                  <h4 className="text-h4 font-semibold text-text-primary">按钮样式</h4>
                  <Button variant="primary" fullWidth>主要按钮</Button>
                  <Button variant="secondary" fullWidth>次要按钮</Button>
                  <Button variant="text" fullWidth>文本按钮</Button>
                  <Button variant="icon">👋</Button>
                </div>
                
                {/* 状态测试 */}
                <div className="space-y-3">
                  <h4 className="text-h4 font-semibold text-text-primary">状态测试</h4>
                  <Button variant="secondary" fullWidth onClick={testLoading}>
                    测试加载
                  </Button>
                  <Button variant="secondary" fullWidth onClick={testError}>
                    测试错误
                  </Button>
                  <Button variant="secondary" fullWidth onClick={testEmpty}>
                    测试空状态
                  </Button>
                </div>
                
                {/* Toast测试 */}
                <div className="space-y-3">
                  <h4 className="text-h4 font-semibold text-text-primary">Toast通知</h4>
                  <Button variant="secondary" fullWidth onClick={() => success('成功！')}>
                    成功提示
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => error('出错了！')}>
                    错误提示
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => warning('警告！')}>
                    警告提示
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => info('信息！')}>
                    信息提示
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
        
        {/* 条件渲染的状态展示 */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/50 backdrop-blur-sm">
            <Loading message={getRandomLoadingMessage('thinking')} />
          </div>
        )}
        
        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/50 backdrop-blur-sm">
            <ErrorState
              title={ErrorMessages.network.title}
              message={ErrorMessages.network.message}
              actionLabel={ErrorMessages.network.action}
              onAction={() => setError(false)}
            />
          </div>
        )}
        
        {empty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/50 backdrop-blur-sm">
            <EmptyState
              {...EmptyStateMessages.noCharacters}
              onAction={() => setEmpty(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TemperatureDemo;



