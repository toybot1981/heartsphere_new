import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { MentisApiService, ChatResponse, MentisMessage } from '../services/mentisApi';
import { useToast } from './Toast';

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
 * 支持消息搜索、快捷操作（复制、删除、重新生成）、导出等功能
 */
export const MentisChatWindow: React.FC<MentisChatWindowProps> = ({
  sessionId,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStream] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamCloseRef = useRef<(() => void) | null>(null);
  const toast = useToast();
  
  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [sessionId, isLoading]);
  
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

  // 消息快捷操作
  const handleMessageMenuOpen = (event: React.MouseEvent<HTMLElement>, message: Message) => {
    event.stopPropagation();
    setMessageMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
    setSelectedMessage(null);
  };

  const handleCopyMessage = async () => {
    if (selectedMessage) {
      try {
        await navigator.clipboard.writeText(selectedMessage.content);
        toast.showSuccess('已复制到剪贴板');
        handleMessageMenuClose();
      } catch (error) {
        toast.showError('复制失败');
      }
    }
  };

  const handleDeleteMessage = () => {
    if (selectedMessage) {
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      toast.showSuccess('消息已删除');
      handleMessageMenuClose();
    }
  };

  const handleRegenerateMessage = async (message?: Message) => {
    const messageToRegenerate = message || selectedMessage;
    if (messageToRegenerate && messageToRegenerate.role === 'user') {
      // 找到用户消息后的第一个 mentis 消息并重新生成
      const messageIndex = messages.findIndex(msg => msg.id === messageToRegenerate.id);
      if (messageIndex >= 0 && messageIndex < messages.length - 1) {
        const nextMentisMessage = messages[messageIndex + 1];
        if (nextMentisMessage.role === 'mentis') {
          // 删除旧的响应，重新发送
          setMessages(prev => prev.filter(msg => msg.id !== nextMentisMessage.id));
          setInputValue(messageToRegenerate.content);
          handleMessageMenuClose();
          // 触发发送
          setTimeout(() => {
            handleSend();
          }, 100);
        }
      }
    }
  };

  // 消息搜索
  const filteredMessages = searchQuery
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // 消息导出
  const handleExportMessages = (format: 'json' | 'csv' | 'txt') => {
    if (messages.length === 0) {
      toast.showWarning('没有消息可导出');
      return;
    }

    let content = '';
    let filename = `mentis-messages-${sessionId}-${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      filename += '.json';
    } else if (format === 'csv') {
      const headers = ['ID', '角色', '内容', '时间', '任务ID'];
      const rows = messages.map(msg => [
        msg.id,
        msg.role,
        `"${msg.content.replace(/"/g, '""')}"`,
        msg.timestamp.toISOString(),
        msg.taskId || ''
      ]);
      content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      filename += '.csv';
    } else {
      content = messages
        .map(msg => `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
      filename += '.txt';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.showSuccess(`消息已导出为 ${format.toUpperCase()}`);
    setExportDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 工具栏 */}
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
        <Tooltip title="搜索消息">
          <IconButton size="small" onClick={() => setSearchOpen(!searchOpen)}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="导出消息">
          <IconButton size="small" onClick={() => setExportDialogOpen(true)}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        {searchOpen && (
          <TextField
            size="small"
            placeholder="搜索消息..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, maxWidth: 400 }}
            autoFocus
          />
        )}
        {searchQuery && (
          <Chip
            label={`找到 ${filteredMessages.length} 条消息`}
            size="small"
            onDelete={() => setSearchQuery('')}
          />
        )}
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 1 }}>
          {error}
        </Alert>
      )}
      
      {/* 消息列表 */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {filteredMessages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? '没有找到匹配的消息' : '暂无消息，开始对话吧'}
            </Typography>
          </Box>
        ) : (
          filteredMessages.map((message) => (
            <Card
              key={message.id}
              sx={{
                mb: 2,
                maxWidth: '75%',
                ml: message.role === 'user' ? 'auto' : 0,
                mr: message.role === 'user' ? 0 : 'auto',
                backgroundColor: message.role === 'user' ? 'primary.light' : 'background.paper',
                position: 'relative',
                '&:hover .message-actions': {
                  opacity: 1,
                },
              }}
            >
              <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="body1" sx={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content || '正在输入...'}
                  </Typography>
                  <Stack direction="row" spacing={0.5} className="message-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                    <Tooltip title="复制">
                      <IconButton
                        size="small"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(message.content);
                            toast.showSuccess('已复制');
                          } catch (error) {
                            toast.showError('复制失败');
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {message.role === 'user' && (
                      <Tooltip title="重新生成">
                        <IconButton size="small" onClick={() => handleRegenerateMessage(message)}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {message.role !== 'system' && (
                      <Tooltip title="更多">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMessageMenuOpen(e, message)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                  {message.taskId && (
                    <Chip label={`任务: ${message.taskId}`} size="small" variant="outlined" />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))
        )}
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
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="输入消息... (Shift+Enter 换行, Enter 发送)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            autoFocus
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

      {/* 消息操作菜单 */}
      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={handleMessageMenuClose}
      >
        <MenuItem onClick={handleCopyMessage}>
          <ContentCopyIcon sx={{ mr: 1 }} fontSize="small" />
          复制
        </MenuItem>
        {selectedMessage?.role === 'user' && (
          <MenuItem onClick={() => handleRegenerateMessage(selectedMessage)}>
            <RefreshIcon sx={{ mr: 1 }} fontSize="small" />
            重新生成
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteMessage} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          删除
        </MenuItem>
      </Menu>

      {/* 导出对话框 */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>导出消息</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            选择导出格式 (共 {messages.length} 条消息)
          </Typography>
          <Stack spacing={1}>
            <Button variant="outlined" onClick={() => handleExportMessages('json')} startIcon={<DownloadIcon />}>
              导出为 JSON
            </Button>
            <Button variant="outlined" onClick={() => handleExportMessages('csv')} startIcon={<DownloadIcon />}>
              导出为 CSV
            </Button>
            <Button variant="outlined" onClick={() => handleExportMessages('txt')} startIcon={<DownloadIcon />}>
              导出为 TXT
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>取消</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
