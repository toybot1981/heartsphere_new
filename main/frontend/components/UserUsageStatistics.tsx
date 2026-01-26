/**
 * 用户使用统计组件
 * 显示用户实时的token、图片等使用数据，并与会员等级配额进行对比
 */
import React, { useState, useEffect } from 'react';
import { billingApi, UserUsageStatistics } from '../services/api/billing';
import { useAuth } from '../hooks/useAuth';

export const UserUsageStatistics: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<UserUsageStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
    // 每30秒刷新一次
    const interval = setInterval(loadStatistics, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const loadStatistics = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await billingApi.statistics.getMyStatistics(token);
      setStats(data);
    } catch (err: any) {
      setError(err.message || '加载统计失败');
      console.error('加载统计失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div style={{ color: 'var(--text-tertiary)' }}>加载中...</div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div 
        className="p-4 border rounded-lg"
        style={{
          backgroundColor: 'var(--bg-error-alpha, rgba(239, 68, 68, 0.2))',
          borderColor: 'var(--border-error-alpha, rgba(239, 68, 68, 0.5))',
        }}
      >
        <div style={{ color: 'var(--color-error, #f87171)' }}>错误: {error}</div>
        <button
          onClick={loadStatistics}
          className="mt-2 px-4 py-2 rounded-md text-sm transition-colors"
          style={{
            backgroundColor: 'var(--color-error, #dc2626)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-error-hover, #b91c1c)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-error, #dc2626)';
          }}
        >
          重试
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 会员信息 */}
      {stats.planName && (
        <div 
          className="border rounded-lg p-4"
          style={{
            backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))',
            borderColor: 'var(--border-color-overlay, #475569)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div 
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                当前会员
              </div>
              <div 
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {stats.planName}
              </div>
              {stats.planType && (
                <div 
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  类型: {stats.planType}
                </div>
              )}
            </div>
            <div className="text-right">
              <div 
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                统计月份
              </div>
              <div 
                className="text-lg font-semibold"
                style={{ color: 'var(--color-primary, #818cf8)' }}
              >
                {stats.currentMonth}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 文本Token统计 */}
      <StatCard
        title="文本Token"
        icon="📝"
        stats={stats.textTokenStats}
        formatValue={(v) => formatNumber(v)}
        unit="tokens"
        planQuota={stats.textTokenStats.planMonthlyQuota}
        permanentQuota={stats.textTokenStats.permanentQuota}
      />

      {/* 图片统计 */}
      <StatCard
        title="图片生成"
        icon="🖼️"
        stats={stats.imageStats}
        formatValue={(v) => formatNumber(v)}
        unit="张"
        planQuota={stats.imageStats.planMonthlyQuota}
      />

      {/* 音频统计 */}
      <StatCard
        title="音频处理"
        icon="🎵"
        stats={stats.audioStats}
        formatValue={(v) => formatNumber(v)}
        unit="分钟"
        planQuota={stats.audioStats.planMonthlyQuota}
      />

      {/* 视频统计 */}
      <StatCard
        title="视频生成"
        icon="🎬"
        stats={stats.videoStats}
        formatValue={(v) => formatNumber(v)}
        unit="秒"
        planQuota={stats.videoStats.planMonthlyQuota}
      />

      {/* 刷新按钮 */}
      <div className="flex justify-end">
        <button
          onClick={loadStatistics}
          disabled={loading}
          className="px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--bg-secondary-button, #475569)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary-button-hover, #64748b)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary-button, #475569)';
            }
          }}
        >
          {loading ? '刷新中...' : '🔄 刷新'}
        </button>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  icon: string;
  stats: any;
  formatValue: (v: number) => string;
  unit: string;
  planQuota?: number;
  permanentQuota?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  stats,
  formatValue,
  unit,
  planQuota,
  permanentQuota,
}) => {
  const monthlyUsageRate = stats.monthlyUsageRate || 0;
  const totalUsageRate = stats.totalUsageRate || 0;

  return (
    <div 
      className="border rounded-lg p-6"
      style={{
        backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))',
        borderColor: 'var(--border-color-overlay, #475569)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>
      </div>

      <div className="space-y-4">
        {/* 月度配额 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              月度配额
            </span>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {formatValue(stats.monthlyUsed)} / {formatValue(stats.monthlyQuota)} {unit}
            </span>
          </div>
          <div 
            className="w-full rounded-full h-2.5"
            style={{ backgroundColor: 'var(--bg-secondary, #475569)' }}
          >
            <div
              className="h-2.5 rounded-full transition-all"
              style={{
                width: `${Math.min(monthlyUsageRate, 100)}%`,
                backgroundColor: monthlyUsageRate >= 90
                  ? 'var(--color-error, #ef4444)'
                  : monthlyUsageRate >= 70
                  ? 'var(--color-warning, #fbbf24)'
                  : 'var(--color-primary, #6366f1)',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span 
              className="text-xs"
              style={{ color: 'var(--text-disabled)' }}
            >
              可用: {formatValue(stats.monthlyAvailable)} {unit}
            </span>
            <span 
              className="text-xs"
              style={{ color: 'var(--text-disabled)' }}
            >
              实际使用: {formatValue(stats.monthlyActualUsage)} {unit}
            </span>
          </div>
          {planQuota !== undefined && planQuota !== null && (
            <div 
              className="text-xs mt-1"
              style={{ color: 'var(--color-primary, #818cf8)' }}
            >
              会员配额: {formatValue(planQuota)} {unit}/月
            </div>
          )}
        </div>

        {/* 总配额 */}
        {stats.totalQuota > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span 
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                总配额
              </span>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {formatValue(stats.totalUsed)} / {formatValue(stats.totalQuota)} {unit}
              </span>
            </div>
            <div 
              className="w-full rounded-full h-2.5"
              style={{ backgroundColor: 'var(--bg-secondary, #475569)' }}
            >
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(totalUsageRate, 100)}%`,
                  backgroundColor: totalUsageRate >= 90
                    ? 'var(--color-error, #ef4444)'
                    : totalUsageRate >= 70
                    ? 'var(--color-warning, #fbbf24)'
                    : 'var(--color-success, #22c55e)',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span 
                className="text-xs"
                style={{ color: 'var(--text-disabled)' }}
              >
                可用: {formatValue(stats.totalAvailable)} {unit}
              </span>
            </div>
            {permanentQuota !== undefined && permanentQuota !== null && (
              <div 
                className="text-xs mt-1"
                style={{ color: 'var(--color-primary, #a855f7)' }}
              >
                永久配额: {formatValue(permanentQuota)} {unit}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toString();
}

