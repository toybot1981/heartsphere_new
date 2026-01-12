import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  hsmemApi,
  MemorizeResponse,
} from '../../services/api/hsmem/hsmemApi';
import { MUIProvider } from '../MUIProvider';

/**
 * 记忆测试组件
 * 提供对话、文本、文档三种类型的记忆模拟测试
 */
interface MemoryTestingProps {
  adminToken: string | null;
}

const MemoryTestingContent: React.FC<MemoryTestingProps> = ({ adminToken }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MemorizeResponse | null>(null);

  // 对话记忆测试状态
  const [conversationMessages, setConversationMessages] = useState([
    { role: 'user', content: { text: '' } },
    { role: 'assistant', content: { text: '' } },
  ]);
  const [conversationUserId, setConversationUserId] = useState('');
  const [conversationAgentId, setConversationAgentId] = useState('');

  // 文本记忆测试状态
  const [textContent, setTextContent] = useState('');
  const [textContext, setTextContext] = useState('');
  const [textUserId, setTextUserId] = useState('');

  // 文档记忆测试状态
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docAuthor, setDocAuthor] = useState('');
  const [docUserId, setDocUserId] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
    setResult(null);
  };

  const handleTestConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const messages = conversationMessages
        .filter((msg) => msg.content.text.trim())
        .map((msg) => ({
          role: msg.role,
          content: { text: msg.content.text.trim() },
        }));

      if (messages.length === 0) {
        setError('请至少输入一条消息');
        return;
      }

      const response = await hsmemApi.memorizeConversation({
        messages,
        user_id: conversationUserId || undefined,
        agent_id: conversationAgentId || undefined,
      });

      setResult(response);
    } catch (err: any) {
      setError(err.message || '测试失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestText = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      if (!textContent.trim()) {
        setError('请输入文本内容');
        return;
      }

      let context: Record<string, any> | undefined;
      if (textContext.trim()) {
        try {
          context = JSON.parse(textContext);
        } catch {
          context = { note: textContext };
        }
      }

      const response = await hsmemApi.memorizeText({
        text: textContent.trim(),
        context,
        user_id: textUserId || undefined,
      });

      setResult(response);
    } catch (err: any) {
      setError(err.message || '测试失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      if (!docTitle.trim() || !docContent.trim()) {
        setError('请输入文档标题和内容');
        return;
      }

      const response = await hsmemApi.memorizeDocument({
        title: docTitle.trim(),
        content: docContent.trim(),
        author: docAuthor || undefined,
        user_id: docUserId || undefined,
      });

      setResult(response);
    } catch (err: any) {
      setError(err.message || '测试失败');
    } finally {
      setLoading(false);
    }
  };

  const addConversationMessage = () => {
    setConversationMessages([
      ...conversationMessages,
      { role: 'user', content: { text: '' } },
    ]);
  };

  const removeConversationMessage = (index: number) => {
    if (conversationMessages.length > 2) {
      setConversationMessages(conversationMessages.filter((_, i) => i !== index));
    }
  };

  const updateConversationMessage = (index: number, field: 'role' | 'content', value: any) => {
    const newMessages = [...conversationMessages];
    if (field === 'role') {
      newMessages[index].role = value;
    } else {
      newMessages[index].content = { text: value };
    }
    setConversationMessages(newMessages);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        记忆模拟测试
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        通过可视化界面测试hsmem服务的记忆化功能，支持对话、文本、文档三种类型
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="对话记忆" />
        <Tab label="文本记忆" />
        <Tab label="文档记忆" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 对话记忆测试 */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            对话记忆测试
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            输入对话消息，测试对话记忆化功能
          </Typography>

          <Box sx={{ mb: 3 }}>
            {conversationMessages.map((msg, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField
                    select
                    label="角色"
                    value={msg.role}
                    onChange={(e) => updateConversationMessage(index, 'role', e.target.value)}
                    SelectProps={{ native: true }}
                    sx={{ minWidth: 120 }}
                  >
                    <option value="user">用户</option>
                    <option value="assistant">助手</option>
                  </TextField>
                  <TextField
                    label={`${msg.role === 'user' ? '用户' : '助手'}消息`}
                    value={msg.content.text}
                    onChange={(e) => updateConversationMessage(index, 'content', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  {conversationMessages.length > 2 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeConversationMessage(index)}
                    >
                      删除
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
            <Button variant="outlined" onClick={addConversationMessage} sx={{ mb: 2 }}>
              添加消息
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="用户ID（可选）"
              value={conversationUserId}
              onChange={(e) => setConversationUserId(e.target.value)}
              placeholder="user_123"
            />
            <TextField
              label="代理ID（可选）"
              value={conversationAgentId}
              onChange={(e) => setConversationAgentId(e.target.value)}
              placeholder="agent_1"
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleTestConversation}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : '测试对话记忆'}
          </Button>

          {result && (
            <Card sx={{ mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  测试成功
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>资源ID:</strong> {result.data.resource_id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>记忆项数量:</strong> {result.data.items_count}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>分类:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {result.data.categories.map((cat, idx) => (
                    <Chip
                      key={idx}
                      label={`${cat.name} (${cat.item_count})`}
                      size="small"
                      sx={{ bgcolor: 'success.main', color: 'white' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Paper>
      )}

      {/* 文本记忆测试 */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            文本记忆测试
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            输入文本内容，测试文本记忆化功能
          </Typography>

          <TextField
            label="文本内容"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            fullWidth
            multiline
            rows={6}
            sx={{ mb: 2 }}
            placeholder="输入要记忆的文本内容..."
          />

          <TextField
            label="上下文信息（可选，JSON格式）"
            value={textContext}
            onChange={(e) => setTextContext(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
            placeholder='{"topic": "general", "source": "manual"}'
          />

          <TextField
            label="用户ID（可选）"
            value={textUserId}
            onChange={(e) => setTextUserId(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="user_123"
          />

          <Button
            variant="contained"
            onClick={handleTestText}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : '测试文本记忆'}
          </Button>

          {result && (
            <Card sx={{ mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  测试成功
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>资源ID:</strong> {result.data.resource_id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>记忆项数量:</strong> {result.data.items_count}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>分类:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {result.data.categories.map((cat, idx) => (
                    <Chip
                      key={idx}
                      label={`${cat.name} (${cat.item_count})`}
                      size="small"
                      sx={{ bgcolor: 'success.main', color: 'white' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Paper>
      )}

      {/* 文档记忆测试 */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            文档记忆测试
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            输入文档信息，测试文档记忆化功能
          </Typography>

          <TextField
            label="文档标题"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            placeholder="输入文档标题..."
          />

          <TextField
            label="文档内容"
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
            fullWidth
            multiline
            rows={8}
            sx={{ mb: 2 }}
            placeholder="输入文档内容..."
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="作者（可选）"
              value={docAuthor}
              onChange={(e) => setDocAuthor(e.target.value)}
              placeholder="作者名称"
            />
            <TextField
              label="用户ID（可选）"
              value={docUserId}
              onChange={(e) => setDocUserId(e.target.value)}
              placeholder="user_123"
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleTestDocument}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : '测试文档记忆'}
          </Button>

          {result && (
            <Card sx={{ mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  测试成功
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>资源ID:</strong> {result.data.resource_id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>记忆项数量:</strong> {result.data.items_count}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>分类:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {result.data.categories.map((cat, idx) => (
                    <Chip
                      key={idx}
                      label={`${cat.name} (${cat.item_count})`}
                      size="small"
                      sx={{ bgcolor: 'success.main', color: 'white' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Paper>
      )}
    </Box>
  );
};

// 使用 MUI Provider 包装组件
const MemoryTesting: React.FC<MemoryTestingProps> = (props) => {
  return (
    <MUIProvider>
      <MemoryTestingContent {...props} />
    </MUIProvider>
  );
};

export default MemoryTesting;
