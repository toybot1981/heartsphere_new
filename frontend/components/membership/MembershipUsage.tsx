import React, { useState, useEffect } from 'react';
import { membershipApi } from '../../services/api';
import type { UsageStats, DailyUsage } from '../../services/api/membership/types';
import './MembershipUsage.css';

interface MembershipUsageProps {
  token: string;
}

/**
 * 会员使用统计页面
 * 展示用户的使用统计数据和图表
 */
export const MembershipUsage: React.FC<MembershipUsageProps> = ({ token }) => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
  });

  useEffect(() => {
    loadUsageStats();
    loadDailyUsage();
  }, [token, dateRange]);

  const loadUsageStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipApi.getUsageStats(token);
      setUsageStats(data);
    } catch (err) {
      console.error('加载使用统计失败:', err);
      setError('加载使用统计失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const loadDailyUsage = async () => {
    try {
      const data = await membershipApi.getDailyUsage(
        dateRange.startDate,
        dateRange.endDate,
        token
      );
      setDailyUsage(data);
    } catch (err) {
      console.error('加载每日使用统计失败:', err);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getMaxUsage = (dailyData: DailyUsage[]): number => {
    if (dailyData.length === 0) return 1;
    const max = Math.max(
      ...dailyData.map((d) => d.textTokenUsed),
      ...dailyData.map((d) => d.imageUsed),
      ...dailyData.map((d) => d.videoUsed),
      ...dailyData.map((d) => d.apiCallUsed)
    );
    return max || 1;
  };

  if (loading) {
    return (
      <div className="membership-usage loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="membership-usage error">
        <div className="error-message">{error}</div>
        <button onClick={loadUsageStats} className="retry-btn">
          重试
        </button>
      </div>
    );
  }

  if (!usageStats) {
    return null;
  }

  const maxUsage = getMaxUsage(dailyUsage);

  return (
    <div className="membership-usage">
      <div className="usage-header">
        <h2>使用统计</h2>
        <div className="date-range-selector">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
          />
          <span>至</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
          />
        </div>
      </div>

      {/* 统计概览 */}
      <div className="usage-overview">
        <div className="overview-card">
          <div className="overview-icon">📝</div>
          <div className="overview-info">
            <div className="overview-label">文本Token</div>
            <div className="overview-value">
              {formatNumber(usageStats.textTokenStats.used)} /{' '}
              {formatNumber(usageStats.textTokenStats.quotaTotal)}
            </div>
            <div className="overview-percentage">
              使用率: {usageStats.textTokenStats.usageRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">🖼️</div>
          <div className="overview-info">
            <div className="overview-label">图片生成</div>
            <div className="overview-value">
              {formatNumber(usageStats.imageStats.used)} /{' '}
              {formatNumber(usageStats.imageStats.quotaTotal)}
            </div>
            <div className="overview-percentage">
              使用率: {usageStats.imageStats.usageRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">🎬</div>
          <div className="overview-info">
            <div className="overview-label">视频生成</div>
            <div className="overview-value">
              {formatNumber(usageStats.videoStats.used)} /{' '}
              {formatNumber(usageStats.videoStats.quotaTotal)}
            </div>
            <div className="overview-percentage">
              使用率: {usageStats.videoStats.usageRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">🔌</div>
          <div className="overview-info">
            <div className="overview-label">API调用</div>
            <div className="overview-value">
              {formatNumber(usageStats.apiCallStats.used)} /{' '}
              {formatNumber(usageStats.apiCallStats.quotaTotal)}
            </div>
            <div className="overview-percentage">
              使用率: {usageStats.apiCallStats.usageRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* 使用趋势图 */}
      <div className="usage-chart">
        <h3>使用趋势</h3>
        <div className="chart-container">
          {dailyUsage.map((daily, index) => (
            <div key={index} className="chart-day">
              <div className="chart-bars">
                <div
                  className="chart-bar text-token"
                  style={{
                    height: `${(daily.textTokenUsed / maxUsage) * 100}%`,
                  }}
                  title={`文本Token: ${daily.textTokenUsed}`}
                />
                <div
                  className="chart-bar image"
                  style={{
                    height: `${(daily.imageUsed / maxUsage) * 100}%`,
                  }}
                  title={`图片: ${daily.imageUsed}`}
                />
                <div
                  className="chart-bar video"
                  style={{
                    height: `${(daily.videoUsed / maxUsage) * 100}%`,
                  }}
                  title={`视频: ${daily.videoUsed}秒`}
                />
                <div
                  className="chart-bar api-call"
                  style={{
                    height: `${(daily.apiCallUsed / maxUsage) * 100}%`,
                  }}
                  title={`API调用: ${daily.apiCallUsed}`}
                />
              </div>
              <div className="chart-label">{formatDate(daily.date)}</div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color text-token"></span>
            <span>文本Token</span>
          </div>
          <div className="legend-item">
            <span className="legend-color image"></span>
            <span>图片</span>
          </div>
          <div className="legend-item">
            <span className="legend-color video"></span>
            <span>视频</span>
          </div>
          <div className="legend-item">
            <span className="legend-color api-call"></span>
            <span>API调用</span>
          </div>
        </div>
      </div>

      {/* 使用明细 */}
      <div className="usage-details">
        <h3>使用明细</h3>
        <div className="details-table">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>文本Token</th>
                <th>图片</th>
                <th>视频(秒)</th>
                <th>API调用</th>
              </tr>
            </thead>
            <tbody>
              {dailyUsage.map((daily, index) => (
                <tr key={index}>
                  <td>{formatDate(daily.date)}</td>
                  <td>{formatNumber(daily.textTokenUsed)}</td>
                  <td>{daily.imageUsed}</td>
                  <td>{daily.videoUsed}</td>
                  <td>{daily.apiCallUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * 获取默认开始日期（7天前）
 */
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

/**
 * 获取默认结束日期（今天）
 */
function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}
