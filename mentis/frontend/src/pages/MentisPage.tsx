import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MentisMainPage } from '../components/MentisMainPage';
import { MentisApiService } from '../services/mentisApi';

/**
 * Mentis 页面
 */
export const MentisPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // 验证会话是否存在
      MentisApiService.getSession(sessionId)
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.error('加载会话失败:', err);
          setError('会话不存在');
          setLoading(false);
        });
    } else {
      // 如果没有 sessionId，创建新会话
      MentisApiService.createSession()
        .then((session) => {
          navigate(`/mentis/${session.sessionId}`, { replace: true });
        })
        .catch((err) => {
          console.error('创建会话失败:', err);
          setError('创建会话失败');
          setLoading(false);
        });
    }
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/mentis')}
          sx={{ mt: 2 }}
        >
          返回会话列表
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh' }}>
      <MentisMainPage sessionId={sessionId!} />
    </Box>
  );
};
