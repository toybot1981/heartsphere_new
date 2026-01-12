import React, { useState, useEffect } from 'react';
import { membershipApi } from '../../services/api';
import type { QuotaInfo } from '../../services/api/membership/types';
import './QuotaDashboard.css';

interface QuotaDashboardProps {
  token: string;
  onUpgrade?: () => void;
}

/**
 * 配额仪表盘组件
 * 展示用户的配额使用情况
 */
export const QuotaDashboard: React.FC<QuotaDashboardProps> = ({
  token,
  onUpgrade,
}) => {
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuotaInfo();
  }, [token]);

  const loadQuotaInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipApi.getQuotaInfo(token);
      setQuotaInfo(data);
    } catch (err) {
      console.error('加载配额信息失败:', err);
      setError('加载配额信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getUsagePercentage = (used: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return '#ff4757'; // 红色
    if (percentage >= 70) return '#ffa502'; // 橙色
    return '#2ed573'; // 绿色
  };

  if (loading) {
    return (
      <div className="quota-dashboard loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quota-dashboard error">
        <div className="error-message">{error}</div>
        <button onClick={loadQuotaInfo} className="retry-btn">
          重试
        </button>
      </div>
    );
  }

  if (!quotaInfo) {
    return null;
  }

  return (
    <div className="quota-dashboard">
      <div className="quota-header">
        <h3>配额使用情况</h3>
        <div className="plan-badge">{getPlanTypeName(quotaInfo.planType)}</div>
      </div>

      <div className="quota-cards">
        {/* 文本Token配额 */}
        <QuotaCard
          title="文本Token"
          icon="📝"
          used={quotaInfo.textTokenUsed}
          total={quotaInfo.textTokenQuota}
          available={quotaInfo.textTokenAvailable}
          unit="tokens"
          onUpgrade={onUpgrade}
        />

        {/* 图片生成配额 */}
        <QuotaCard
          title="图片生成"
          icon="🖼️"
          used={quotaInfo.imageUsed}
          total={quotaInfo.imageQuota}
          available={quotaInfo.imageAvailable}
          unit="张"
          onUpgrade={onUpgrade}
        />

        {/* 视频生成配额 */}
        <QuotaCard
          title="视频生成"
          icon="🎬"
          used={quotaInfo.videoUsed}
          total={quotaInfo.videoQuota}
          available={quotaInfo.videoAvailable}
          unit="秒"
          onUpgrade={onUpgrade}
        />

        {/* API调用配额 */}
        <QuotaCard
          title="API调用"
          icon="🔌"
          used={quotaInfo.apiCallUsedToday}
          total={quotaInfo.apiCallQuotaPerDay}
          available={quotaInfo.apiCallAvailableToday}
          unit="次/天"
          onUpgrade={onUpgrade}
        />
      </div>

      {quotaInfo.quotaResetDate && (
        <div className="quota-reset-info">
          <span>配额重置时间: {formatDate(quotaInfo.quotaResetDate)}</span>
        </div>
      )}
    </div>
  );
};

interface QuotaCardProps {
  title: string;
  icon: string;
  used: number;
  total: number;
  available: number;
  unit: string;
  onUpgrade?: () => void;
}

/**
 * 配额卡片组件
 */
const QuotaCard: React.FC<QuotaCardProps> = ({
  title,
  icon,
  used,
  total,
  available,
  unit,
  onUpgrade,
}) => {
  const percentage = getUsagePercentage(used, total);
  const progressColor = getProgressColor(percentage);
  const isLowQuota = percentage >= 80;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getUsagePercentage = (used: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return '#ff4757';
    if (percentage >= 70) return '#ffa502';
    return '#2ed573';
  };

  return (
    <div className={`quota-card ${isLowQuota ? 'low-quota' : ''}`}>
      <div className="quota-card-header">
        <span className="quota-icon">{icon}</span>
        <span className="quota-title">{title}</span>
      </div>

      <div className="quota-numbers">
        <div className="quota-used">
          {formatNumber(used)} / {formatNumber(total)} {unit}
        </div>
        <div className="quota-available">
          剩余: {formatNumber(available)} {unit}
        </div>
      </div>

      <div className="quota-progress">
        <div className="quota-progress-bar">
          <div
            className="quota-progress-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
        <div className="quota-percentage">{percentage}%</div>
      </div>

      {isLowQuota && onUpgrade && (
        <button className="quota-upgrade-btn" onClick={onUpgrade}>
          升级获取更多配额
        </button>
      )}
    </div>
  );
};

/**
 * 获取计划类型名称
 */
const getPlanTypeName = (planType: string): string => {
  const planNames: Record<string, string> = {
    free: '免费版',
    basic: '基础版',
    standard: '标准版',
    premium: '专业版',
  };
  return planNames[planType] || planType;
};

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
};
