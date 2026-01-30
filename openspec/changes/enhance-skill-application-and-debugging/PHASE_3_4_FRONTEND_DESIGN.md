# 🎨 前端设计指南 - Phase 3-4

技能调试面板和可视化组件的前端实现指南。

## 项目结构

```
frontend/src/
├── components/
│   └── skill/
│       ├── SkillDebugPanel.tsx        # 主调试面板
│       ├── SkillDebugPanel.module.css # 样式
│       ├── SkillList.tsx              # 技能列表
│       ├── SkillCard.tsx              # 技能卡片
│       ├── SkillStatistics.tsx        # 统计信息
│       └── SkillScoreChart.tsx        # 评分图表
├── hooks/
│   └── useSkillDebug.ts               # 自定义 Hook
├── services/
│   └── skillDebugService.ts           # API 服务
├── types/
│   └── skill.ts                       # TypeScript 类型定义
└── utils/
    └── skillUtils.ts                  # 工具函数
```

## 核心组件

### 1. SkillDebugPanel - 主调试面板

**用途**: 在 ChatWindow 中显示技能执行的实时信息

**位置**: `frontend/src/components/skill/SkillDebugPanel.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { SkillExecutionRecord, SkillApplicationResult } from '@/types/skill';
import SkillList from './SkillList';
import SkillStatistics from './SkillStatistics';
import styles from './SkillDebugPanel.module.css';

interface SkillDebugPanelProps {
  conversationId: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

/**
 * 技能调试面板
 * 显示:
 * - 被应用的技能列表
 * - 每个技能的详细评分信息
 * - 执行状态和结果
 * - 统计数据
 */
export const SkillDebugPanel: React.FC<SkillDebugPanelProps> = ({
  conversationId,
  isVisible,
  onToggleVisibility,
}) => {
  const [records, setRecords] = useState<SkillExecutionRecord[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && conversationId) {
      loadSkillHistory();
    }
  }, [isVisible, conversationId]);

  const loadSkillHistory = async () => {
    setLoading(true);
    try {
      // 从后端 API 获取技能执行历史
      const response = await fetch(
        `/api/v1/skill/debug/conversation/${conversationId}/history`
      );
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load skill history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.debugPanel}>
      <div className={styles.header}>
        <h3>🛠️ 技能调试面板</h3>
        <button onClick={onToggleVisibility} className={styles.closeBtn}>
          ✕
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <>
            <SkillList records={records} />
            <SkillStatistics conversationId={conversationId} />
          </>
        )}
      </div>
    </div>
  );
};

export default SkillDebugPanel;
```

### 2. SkillList - 技能列表

**位置**: `frontend/src/components/skill/SkillList.tsx`

```typescript
import React from 'react';
import { SkillExecutionRecord } from '@/types/skill';
import SkillCard from './SkillCard';
import styles from './SkillDebugPanel.module.css';

interface SkillListProps {
  records: SkillExecutionRecord[];
}

/**
 * 技能列表组件
 * 按时间倒序显示所有被评估的技能
 */
export const SkillList: React.FC<SkillListProps> = ({ records }) => {
  const appliedSkills = records.filter(r => r.decision === 'APPLIED');
  const rejectedSkills = records.filter(r => r.decision === 'REJECTED');

  return (
    <div className={styles.skillList}>
      {/* 被应用的技能 */}
      <div className={styles.section}>
        <h4>✅ 被应用的技能 ({appliedSkills.length})</h4>
        <div className={styles.cards}>
          {appliedSkills.map(record => (
            <SkillCard key={record.id} record={record} type="applied" />
          ))}
        </div>
      </div>

      {/* 被拒绝的技能 */}
      {rejectedSkills.length > 0 && (
        <div className={styles.section}>
          <h4>❌ 被拒绝的技能 ({rejectedSkills.length})</h4>
          <div className={styles.cards}>
            {rejectedSkills.map(record => (
              <SkillCard key={record.id} record={record} type="rejected" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillList;
```

### 3. SkillCard - 技能卡片

**位置**: `frontend/src/components/skill/SkillCard.tsx`

```typescript
import React from 'react';
import { SkillExecutionRecord } from '@/types/skill';
import styles from './SkillDebugPanel.module.css';

interface SkillCardProps {
  record: SkillExecutionRecord;
  type: 'applied' | 'rejected';
}

/**
 * 单个技能卡片
 * 显示:
 * - 技能名称和ID
 * - 评分（语义、上下文、内存、综合）
 * - 执行状态
 * - 匹配的关键词
 */
export const SkillCard: React.FC<SkillCardProps> = ({ record, type }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'EXECUTING':
        return '⏳';
      case 'PENDING':
        return '⏸️';
      default:
        return '❓';
    }
  };

  const getScoreColor = (score: number | undefined) => {
    if (!score) return '#ccc';
    if (score >= 80) return '#4caf50';  // 绿色
    if (score >= 60) return '#ff9800';  // 橙色
    return '#f44336';                    // 红色
  };

  return (
    <div className={`${styles.card} ${styles[type]}`}>
      <div className={styles.cardHeader}>
        <h5>技能 ID: {record.skillId}</h5>
        <span className={styles.status}>
          {getStatusIcon(record.executionStatus)} {record.executionStatus}
        </span>
      </div>

      <div className={styles.scores}>
        <div className={styles.scoreItem}>
          <span className={styles.label}>语义:</span>
          <div className={styles.scoreBar}>
            <div
              className={styles.scoreFill}
              style={{
                width: `${record.semanticScore}%`,
                backgroundColor: getScoreColor(record.semanticScore),
              }}
            />
          </div>
          <span className={styles.value}>{record.semanticScore}</span>
        </div>

        <div className={styles.scoreItem}>
          <span className={styles.label}>上下文:</span>
          <div className={styles.scoreBar}>
            <div
              className={styles.scoreFill}
              style={{
                width: `${record.contextScore}%`,
                backgroundColor: getScoreColor(record.contextScore),
              }}
            />
          </div>
          <span className={styles.value}>{record.contextScore}</span>
        </div>

        <div className={styles.scoreItem}>
          <span className={styles.label}>内存:</span>
          <div className={styles.scoreBar}>
            <div
              className={styles.scoreFill}
              style={{
                width: `${record.memoryScore}%`,
                backgroundColor: getScoreColor(record.memoryScore),
              }}
            />
          </div>
          <span className={styles.value}>{record.memoryScore}</span>
        </div>

        <div className={styles.scoreItem}>
          <span className={styles.label}>综合:</span>
          <div className={styles.scoreBar}>
            <div
              className={styles.scoreFill}
              style={{
                width: `${record.compositeScore}%`,
                backgroundColor: getScoreColor(record.compositeScore),
              }}
            />
          </div>
          <span className={styles.value}>{record.compositeScore}</span>
        </div>
      </div>

      {record.keywordMatches && record.keywordMatches.length > 0 && (
        <div className={styles.keywords}>
          <span className={styles.label}>匹配关键词:</span>
          <div className={styles.tags}>
            {record.keywordMatches.map((kw, idx) => (
              <span key={idx} className={styles.tag}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {record.executionDurationMs && (
        <div className={styles.meta}>
          <span>执行耗时: {record.executionDurationMs}ms</span>
        </div>
      )}

      {record.errorMessage && (
        <div className={styles.error}>
          <span>❌ {record.errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default SkillCard;
```

### 4. 样式文件

**位置**: `frontend/src/components/skill/SkillDebugPanel.module.css`

```css
.debugPanel {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 8px;
}

.header h3 {
  margin: 0;
  color: #2196f3;
  font-size: 16px;
}

.closeBtn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.closeBtn:hover {
  color: #333;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #999;
}

/* 技能列表 */
.skillList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

/* 技能卡片 */
.card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card.applied {
  border-left: 4px solid #4caf50;
}

.card.rejected {
  border-left: 4px solid #f44336;
  opacity: 0.7;
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cardHeader h5 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.status {
  font-size: 12px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
}

/* 评分 */
.scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.scoreItem {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.label {
  width: 50px;
  color: #666;
  font-weight: 500;
}

.scoreBar {
  flex: 1;
  height: 16px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.scoreFill {
  height: 100%;
  transition: width 0.3s;
}

.value {
  width: 30px;
  text-align: right;
  color: #333;
  font-weight: 600;
}

/* 关键词标签 */
.keywords {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

/* 元数据和错误 */
.meta {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
}
```

## 类型定义

**位置**: `frontend/src/types/skill.ts`

```typescript
export interface SkillExecutionRecord {
  id: number;
  conversationId: number;
  skillId: number;
  userId: number;
  roleId?: number;
  
  // 评估阶段
  semanticScore?: number;
  contextScore?: number;
  memoryScore?: number;
  compositeScore?: number;
  decision: 'APPLIED' | 'REJECTED';
  rejectionReason?: string;
  evaluationTimestamp?: string;
  keywordMatches?: string[];
  
  // 执行阶段
  executionStatus: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  executionTimestamp?: string;
  executionDurationMs?: number;
  executionResult?: string;
  errorMessage?: string;
  
  // 时间戳
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillApplicationResult {
  totalEvaluated: number;
  totalApplied: number;
  applicationRate: string;
  appliedSkills: Record<number, string>;
  rejectedSkills: Record<number, string>;
  errors: Record<string, string>;
}

export interface SkillStatistics {
  totalCount: number;
  appliedCount: number;
  completedCount: number;
  failedCount: number;
  successRate: number;
  averageScore: number;
  averageDurationMs: number;
}
```

## 集成到 ChatWindow

在 `ChatWindow.tsx` 中添加技能调试面板：

```typescript
import SkillDebugPanel from '@/components/skill/SkillDebugPanel';

export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const [showSkillDebug, setShowSkillDebug] = useState(false);
  
  return (
    <div className={styles.container}>
      {/* 现有的聊天UI */}
      <div className={styles.chatArea}>
        {/* ... 聊天消息 ... */}
      </div>
      
      {/* 内存调试面板 */}
      <MemoryDebugPanel 
        conversationId={conversationId}
        isVisible={showMemoryDebug}
        onToggleVisibility={() => setShowMemoryDebug(!showMemoryDebug)}
      />
      
      {/* 技能调试面板（新增） */}
      <SkillDebugPanel 
        conversationId={conversationId}
        isVisible={showSkillDebug}
        onToggleVisibility={() => setShowSkillDebug(!showSkillDebug)}
      />
      
      {/* 调试面板切换按钮 */}
      <div className={styles.debugToggle}>
        <button onClick={() => setShowMemoryDebug(!showMemoryDebug)}>
          💾 {showMemoryDebug ? '隐藏' : '显示'}内存
        </button>
        <button onClick={() => setShowSkillDebug(!showSkillDebug)}>
          🛠️ {showSkillDebug ? '隐藏' : '显示'}技能
        </button>
      </div>
    </div>
  );
};
```

## API 服务

**位置**: `frontend/src/services/skillDebugService.ts`

```typescript
import axios from 'axios';
import { SkillExecutionRecord, SkillStatistics } from '@/types/skill';

const API_BASE = '/api/v1/skill/debug';

export const skillDebugService = {
  // 获取对话的技能历史
  async getConversationHistory(conversationId: string, limit = 100) {
    const response = await axios.get(
      `${API_BASE}/conversation/${conversationId}/history`,
      { params: { limit } }
    );
    return response.data;
  },

  // 分页查询
  async getConversationHistoryPaged(
    conversationId: string,
    pageNo = 0,
    pageSize = 20
  ) {
    const response = await axios.get(
      `${API_BASE}/conversation/${conversationId}/history/paged`,
      { params: { pageNo, pageSize } }
    );
    return response.data;
  },

  // 获取用户统计
  async getUserStatistics(userId: number, days = 7) {
    const response = await axios.get(
      `${API_BASE}/user/${userId}/statistics`,
      { params: { days } }
    );
    return response.data;
  },

  // 获取技能统计
  async getSkillStatistics(skillId: number, days = 7) {
    const response = await axios.get(
      `${API_BASE}/skill/${skillId}/statistics`,
      { params: { days } }
    );
    return response.data;
  },

  // 获取最近失败
  async getRecentFailures(limit = 10, hoursAgo = 1) {
    const response = await axios.get(
      `${API_BASE}/failures/recent`,
      { params: { limit, hoursAgo } }
    );
    return response.data;
  },

  // 健康检查
  async healthCheck() {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  }
};
```

## 自定义 Hook

**位置**: `frontend/src/hooks/useSkillDebug.ts`

```typescript
import { useState, useEffect } from 'react';
import { skillDebugService } from '@/services/skillDebugService';
import { SkillExecutionRecord } from '@/types/skill';

export const useSkillDebug = (conversationId: string) => {
  const [records, setRecords] = useState<SkillExecutionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await skillDebugService.getConversationHistory(conversationId);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      loadHistory();
      // 每 5 秒自动刷新一次
      const interval = setInterval(loadHistory, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  return { records, loading, error, refetch: loadHistory };
};
```

## 部署和测试

### 开发环境测试

```bash
# 1. 启动后端
cd main/backend
mvn spring-boot:run

# 2. 启动前端开发服务器
cd frontend
npm run dev

# 3. 访问 http://localhost:3000
# 打开聊天窗口，查看技能调试面板
```

### 生产环境部署

```bash
# 1. 构建前端
npm run build

# 2. 复制到后端静态资源目录
cp -r build/* main/backend/src/main/resources/static/

# 3. 构建后端
mvn clean package

# 4. 部署
java -jar target/heartsphere-service.jar
```

---

**前端设计完成！现在可以开始开发了！** 🎨✨
