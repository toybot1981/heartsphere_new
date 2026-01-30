/**
 * 多智能体协作组件
 * 展示多智能体协作过程和结果
 */

import React, { useState, useEffect, useCallback } from 'react';
import { multiAgentApi, CollaborationRequest, CollaborationResult, CollaborationStatus } from '../../services/api/multiAgentApi';
import { CollaborationFlow } from './CollaborationFlow';
import { CollaborationResultPanel } from './CollaborationResultPanel';
import { CollaborationInput } from './CollaborationInput';
import './MultiAgentCollaboration.css';

export interface MultiAgentCollaborationProps {
  userId?: string;
  sessionId?: string;
  onClose?: () => void;
}

export const MultiAgentCollaboration: React.FC<MultiAgentCollaborationProps> = ({
  userId,
  sessionId = 'default',
  onClose,
}) => {
  const [collaborationId, setCollaborationId] = useState<string | null>(null);
  const [status, setStatus] = useState<CollaborationStatus['status']>('PENDING');
  const [result, setResult] = useState<CollaborationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 轮询状态
  useEffect(() => {
    if (!collaborationId || status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const statusData = await multiAgentApi.getStatus(collaborationId);
        setStatus(statusData.status);

        if (statusData.status === 'COMPLETED') {
          // 获取结果
          const resultData = await multiAgentApi.execute(collaborationId);
          setResult(resultData);
          setIsLoading(false);
        } else if (statusData.status === 'FAILED') {
          setIsLoading(false);
          setError('协作执行失败');
        }
      } catch (err: any) {
        console.error('获取协作状态失败:', err);
        setError(err.message || '获取状态失败');
      }
    }, 1000); // 每秒轮询一次

    return () => clearInterval(interval);
  }, [collaborationId, status]);

  const handleSubmit = useCallback(async (request: string) => {
    if (!request.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const collaborationRequest: CollaborationRequest = {
        request,
        sessionId,
      };

      const response = await multiAgentApi.collaborate(collaborationRequest);
      setCollaborationId(response.collaborationId);
      setStatus('RUNNING');
    } catch (err: any) {
      console.error('创建协作失败:', err);
      setError(err.message || '创建协作失败');
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleCancel = useCallback(async () => {
    if (!collaborationId) {
      return;
    }

    try {
      await multiAgentApi.cancel(collaborationId);
      setStatus('CANCELLED');
      setIsLoading(false);
    } catch (err: any) {
      console.error('取消协作失败:', err);
      setError(err.message || '取消协作失败');
    }
  }, [collaborationId]);

  return (
    <div className="multi-agent-collaboration">
      <div className="multi-agent-collaboration-header">
        <h2>多智能体协作</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="multi-agent-collaboration-content">
        {/* 输入区域 */}
        <CollaborationInput
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          disabled={status === 'RUNNING'}
        />

        {/* 错误提示 */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* 协作流程可视化 */}
        {collaborationId && (
          <CollaborationFlow
            collaborationId={collaborationId}
            status={status}
            result={result}
          />
        )}

        {/* 结果展示 */}
        {result && (
          <CollaborationResultPanel
            result={result}
            onClose={() => setResult(null)}
          />
        )}
      </div>
    </div>
  );
};
