/**
 * 协作输入组件
 * 用户输入协作请求
 */

import React, { useState } from 'react';
import './CollaborationInput.css';

export interface CollaborationInputProps {
  onSubmit: (request: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const CollaborationInput: React.FC<CollaborationInputProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  disabled = false,
}) => {
  const [request, setRequest] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request.trim() && !isLoading && !disabled) {
      onSubmit(request);
      setRequest('');
    }
  };

  return (
    <div className="collaboration-input">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="描述您的需求，多个生活助手将协同为您解决..."
            disabled={isLoading || disabled}
            rows={3}
            className="request-input"
          />
        </div>
        <div className="input-actions">
          <button
            type="submit"
            disabled={!request.trim() || isLoading || disabled}
            className="submit-button"
          >
            {isLoading ? '协作中...' : '开始协作'}
          </button>
          {onCancel && (isLoading || disabled) && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
            >
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
