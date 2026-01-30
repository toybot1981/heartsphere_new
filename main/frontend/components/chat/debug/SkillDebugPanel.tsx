/**
 * 技能调试面板组件
 * 显示技能执行的实时信息和历史记录
 */
import React, { useState } from 'react';
import { SkillDebugInfo, SkillExecutionRecord } from '../../../types/skill';
import { SkillActivationList } from './SkillActivationList';
import { SkillActivationItem } from './SkillActivationItem';
import './SkillDebugPanel.css';

interface SkillDebugPanelProps {
  debugInfo: SkillDebugInfo | null;
  conversationId?: number;
  isVisible: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const SkillDebugPanel: React.FC<SkillDebugPanelProps> = ({
  debugInfo,
  conversationId,
  isVisible,
  onClose,
  onRefresh,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<SkillExecutionRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  if (!isVisible) {
    return null;
  }

  const records = debugInfo?.records || [];
  
  // 过滤和搜索记录
  const filteredRecords = records.filter(record => {
    // 状态过滤
    if (filterStatus !== 'all' && record.executionStatus !== filterStatus && record.decision !== filterStatus) {
      return false;
    }
    
    // 搜索查询
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const skillName = (record.skillName || `技能 #${record.skillId}`).toLowerCase();
      const matchesName = skillName.includes(query);
      const matchesKeywords = record.keywordMatches?.some(kw => kw.toLowerCase().includes(query)) || false;
      const matchesError = record.errorMessage?.toLowerCase().includes(query) || false;
      const matchesReason = record.rejectionReason?.toLowerCase().includes(query) || false;
      
      if (!matchesName && !matchesKeywords && !matchesError && !matchesReason) {
        return false;
      }
    }
    
    return true;
  });
  
  // 切换展开/折叠
  const toggleExpand = (recordId: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  // 统计信息
  const stats = {
    total: records.length,
    applied: records.filter(r => r.decision === 'APPLIED').length,
    rejected: records.filter(r => r.decision === 'REJECTED').length,
    completed: records.filter(r => r.executionStatus === 'COMPLETED').length,
    failed: records.filter(r => r.executionStatus === 'FAILED').length,
  };

  return (
    <div className="skill-debug-panel">
      <div className="skill-debug-panel__header">
        <div className="skill-debug-panel__title">
          <span className="skill-debug-panel__icon">🛠️</span>
          <h3>技能调试面板</h3>
        </div>
        <div className="skill-debug-panel__actions">
          {onRefresh && (
            <button
              className="skill-debug-panel__refresh-btn"
              onClick={onRefresh}
              title="刷新"
            >
              🔄
            </button>
          )}
          <button
            className="skill-debug-panel__close-btn"
            onClick={onClose}
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="skill-debug-panel__stats">
        <div className="skill-debug-panel__stat-item">
          <span className="skill-debug-panel__stat-label">总计</span>
          <span className="skill-debug-panel__stat-value">{stats.total}</span>
        </div>
        <div className="skill-debug-panel__stat-item">
          <span className="skill-debug-panel__stat-label">已应用</span>
          <span className="skill-debug-panel__stat-value skill-debug-panel__stat-value--success">
            {stats.applied}
          </span>
        </div>
        <div className="skill-debug-panel__stat-item">
          <span className="skill-debug-panel__stat-label">已拒绝</span>
          <span className="skill-debug-panel__stat-value skill-debug-panel__stat-value--warning">
            {stats.rejected}
          </span>
        </div>
        <div className="skill-debug-panel__stat-item">
          <span className="skill-debug-panel__stat-label">已完成</span>
          <span className="skill-debug-panel__stat-value skill-debug-panel__stat-value--success">
            {stats.completed}
          </span>
        </div>
        <div className="skill-debug-panel__stat-item">
          <span className="skill-debug-panel__stat-label">失败</span>
          <span className="skill-debug-panel__stat-value skill-debug-panel__stat-value--error">
            {stats.failed}
          </span>
        </div>
      </div>

      <div className="skill-debug-panel__search">
        <input
          type="text"
          className="skill-debug-panel__search-input"
          placeholder="搜索技能名称、关键词、错误信息..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="skill-debug-panel__search-clear"
            onClick={() => setSearchQuery('')}
            title="清除搜索"
          >
            ✕
          </button>
        )}
      </div>

      <div className="skill-debug-panel__filters">
        <button
          className={`skill-debug-panel__filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          全部
        </button>
        <button
          className={`skill-debug-panel__filter-btn ${filterStatus === 'APPLIED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('APPLIED')}
        >
          已应用
        </button>
        <button
          className={`skill-debug-panel__filter-btn ${filterStatus === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('REJECTED')}
        >
          已拒绝
        </button>
        <button
          className={`skill-debug-panel__filter-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('COMPLETED')}
        >
          已完成
        </button>
        <button
          className={`skill-debug-panel__filter-btn ${filterStatus === 'FAILED' ? 'active' : ''}`}
          onClick={() => setFilterStatus('FAILED')}
        >
          失败
        </button>
      </div>

      <div className="skill-debug-panel__content">
        {filteredRecords.length === 0 ? (
          <div className="skill-debug-panel__empty">
            <p>暂无技能执行记录</p>
            {debugInfo?.lastUpdate && (
              <p className="skill-debug-panel__last-update">
                最后更新: {new Date(debugInfo.lastUpdate).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <SkillActivationList
            records={filteredRecords}
            onSelectRecord={setSelectedRecord}
            selectedRecordId={selectedRecord?.id}
            expandedItems={expandedItems}
            onToggleExpand={toggleExpand}
          />
        )}
      </div>

      {selectedRecord && (
        <div className="skill-debug-panel__detail">
          <SkillActivationItem
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        </div>
      )}
    </div>
  );
};
