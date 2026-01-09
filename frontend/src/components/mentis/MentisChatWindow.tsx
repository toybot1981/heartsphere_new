import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { MentisApiService, ChatResponse, MentisMessage } from '../../services/mentis/mentisApi';

interface Message {
  id: string;
  role: 'user' | 'mentis' | 'system';
  content: string;
  timestamp: Date;
  taskId?: string;
}

interface MentisChatWindowProps {
  sessionId: string;
  onMessageSent?: (message: string) => void;
}

/**
 * Mentis 对话窗口组件
 */
export const MentisChatWindow: React.FC<MentisChatWindowProps> = ({
  sessionId,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStream, setUseStream] = useState(false); // 是否使用流式响应
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamCloseRef = useRef<(() => void) | null>(null);
  
  // 加载对话历史
  useEffect(() => {
    if (sessionId) {
      loadConversationHistory();
    }
  }, [sessionId]);

  // 组件卸载时关闭流
  useEffect(() => {
    return () => {
      if (streamCloseRef.current) {
        streamCloseRef.current();
      }
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * 加载对话历史
   */
  const loadConversationHistory = async () => {
    try {
      // 获取会话信息，会话中包含消息列表
      // 或者可以添加单独的获取历史消息接口
      // 这里暂时在发送消息时获取历史
    } catch (error) {
      console.error('加载对话历史失败:', error);
    }
  };
  
  /**
   * 转换 MentisMessage 为 Message
   */
  const convertToMessage = (msg: MentisMessage): Message => {
    return {
      id: msg.messageId,
      role: msg.role.toLowerCase() as 'user' | 'mentis' | 'system',
      content: msg.content,
      timestamp: new Date(msg.createdAt),
      taskId: msg.taskId
    };
  };
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // 如果是流式响应，先添加一个占位消息
    if (useStream) {
      const placeholderMessage: Message = {
        id: `mentis_${Date.now()}`,
        role: 'mentis',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, placeholderMessage]);
    }

    try {
      if (useStream) {
        // 使用流式响应
        const closeStream = await MentisApiService.sendMessageStream(
          {
            sessionId: sessionId,
            message: messageText,
            enableComputerUse: true
          },
          (chunk: ChatResponse) => {
            // 更新占位消息
            setMessages(prev => {
              const updated = [...prev];
              const lastMessage = updated[updated.length - 1];
              if (lastMessage && lastMessage.role === 'mentis' && lastMessage.content === '') {
                lastMessage.content = chunk.response || '';
                if (chunk.taskId) {
                  lastMessage.taskId = chunk.taskId;
                }
              }
              return updated;
            });
          },
          (error: Error) => {
            console.error('流式响应错误:', error);
            setError(error.message || '流式响应失败');
          },
          () => {
            setIsLoading(false);
            console.log('流式响应完成');
          }
        );
        streamCloseRef.current = closeStream;
      } else {
        // 使用同步响应
        const response: ChatResponse = await MentisApiService.sendMessage({
          sessionId: sessionId,
          message: messageText,
          enableComputerUse: true
        });

        // 添加 Mentis 响应消息
        const mentisMessage: Message = {
          id: response.messageId,
          role: 'mentis',
          content: response.response || '无响应内容',
          timestamp: new Date(),
          taskId: response.taskId
        };
        setMessages(prev => [...prev, mentisMessage]);

        // 如果有对话历史，更新消息列表
        if (response.conversationHistory && response.conversationHistory.length > 0) {
          const historyMessages = response.conversationHistory.map(convertToMessage);
          setMessages(historyMessages);
        }

        // 如果有任务，显示任务状态
        if (response.taskId) {
          console.log('任务已创建:', response.taskId, response.taskStatus);
        }
        
        setIsLoading(false);
        onMessageSent?.(messageText);
      }
    } catch (error: any) {
      console.error('发送消息失败:', error);
      setError(error.message || '发送消息失败，请重试');
      setIsLoading(false);
      
      // 移除占位消息（如果是流式响应）
      if (useStream) {
        setMessages(prev => prev.filter(msg => msg.content !== ''));
      }
      
      // 添加错误消息
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'system',
        content: `错误: ${error.message || '发送消息失败'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 错误提示 */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 1 }}>
          {error}
        </Alert>
      )}
      
      {/* 消息列表 */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Paper
            key={message.id}
            sx={{
              p: 2,
              mb: 1,
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: message.role === 'user' ? 'primary.light' : 'grey.200',
              maxWidth: '70%',
              ml: message.role === 'user' ? 'auto' : 0,
              mr: message.role === 'user' ? 0 : 'auto'
            }}
          >
            <Typography variant="body1">{message.content || '正在输入...'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {message.timestamp.toLocaleTimeString()}
              {message.taskId && ` [任务: ${message.taskId}]`}
            </Typography>
          </Paper>
        ))}
        {isLoading && !useStream && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* 输入区域 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="输入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            发送
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
