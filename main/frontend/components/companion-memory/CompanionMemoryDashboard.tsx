/**
 * 陪伴记忆仪表板组件
 * 展示陪伴记忆的统计和列表
 */

import React from 'react';
import { CompanionMemoryStatistics } from '../../services/companion-memory/types/CompanionMemoryTypes';
import { CompanionMemoryTimeline } from './CompanionMemoryTimeline';

interface CompanionMemoryDashboardProps {
  statistics: CompanionMemoryStatistics;
  className?: string;
}

export const CompanionMemoryDashboard: React.FC<CompanionMemoryDashboardProps> = ({
  statistics,
  className = '',
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="总记忆数"
          value={statistics.totalMemories.toString()}
          icon="📝"
          color="blue"
        />
        <StatCard
          title="对话记忆"
          value={statistics.memoriesByType.conversation.toString()}
          icon="💬"
          color="purple"
        />
        <StatCard
          title="里程碑记忆"
          value={statistics.memoriesByType.milestone.toString()}
          icon="⭐"
          color="yellow"
        />
        <StatCard
          title="重要记忆"
          value={statistics.importantMemories.length.toString()}
          icon="💎"
          color="pink"
        />
      </div>

      {/* 重要记忆 */}
      {statistics.importantMemories.length > 0 && (
        <section>
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            重要记忆
          </h2>
          <CompanionMemoryTimeline memories={statistics.importantMemories.slice(0, 5)} />
        </section>
      )}

      {/* 最近记忆 */}
      {statistics.recentMemories.length > 0 && (
        <section>
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            最近记忆
          </h2>
          <CompanionMemoryTimeline memories={statistics.recentMemories} />
        </section>
      )}

      {/* 记忆时间线 */}
      {statistics.memoryTimeline.length > 0 && (
        <section>
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            记忆时间线
          </h2>
          <CompanionMemoryTimeline
            memories={statistics.memoryTimeline.flatMap((day) => day.memories)}
          />
        </section>
      )}
    </div>
  );
};

/**
 * 统计卡片组件
 */
interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'purple' | 'yellow' | 'pink';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorStyles = {
    blue: {
      bg: 'var(--color-info, rgba(59, 130, 246, 0.2))',
      border: 'var(--color-info, rgba(59, 130, 246, 0.5))',
    },
    purple: {
      bg: 'var(--color-primary, rgba(168, 85, 247, 0.2))',
      border: 'var(--color-primary, rgba(168, 85, 247, 0.5))',
    },
    yellow: {
      bg: 'var(--color-warning, rgba(234, 179, 8, 0.2))',
      border: 'var(--color-warning, rgba(234, 179, 8, 0.5))',
    },
    pink: {
      bg: 'var(--color-primary, rgba(236, 72, 153, 0.2))',
      border: 'var(--color-primary, rgba(236, 72, 153, 0.5))',
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className="rounded-lg p-4 border backdrop-blur-md transition-all hover:scale-105"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span 
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
      </div>
      <p 
        className="text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        {title}
      </p>
    </div>
  );
};




