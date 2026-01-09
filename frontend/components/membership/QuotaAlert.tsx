import React, { useState, useEffect } from 'react';
import { membershipApi } from '../../services/api';
import type { QuotaInfo } from '../../services/api/membership/types';
import { showAlert } from '../../utils/dialog';
import './QuotaAlert.css';

interface QuotaAlertProps {
  token: string;
  onUpgrade?: () => void;
  thresholds?: {
    warning?: number; // 警告阈值，默认80%
    critical?: number; // 严重阈值，默认90%
  };
}

/**
 * 配额使用提示组件
 * 监控配额使用情况，在达到阈值时显示警告
 */
export const QuotaAlert: React.FC<QuotaAlertProps> = ({
  token,
  onUpgrade,
  thresholds = { warning: 80, critical: 90 },
}) => {
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [alerts, setAlerts] = useState<QuotaAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadQuotaInfo();
    // 每5分钟检查一次配额
    const interval = setInterval(loadQuotaInfo, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    checkQuotaAlerts();
  }, [quotaInfo, thresholds]);

  const loadQuotaInfo = async () => {
    try {
      const data = await membershipApi.getQuotaInfo(token);
      setQuotaInfo(data);
    } catch (error) {
      console.error('加载配额信息失败:', error);
    }
  };

  interface QuotaAlert {
    id: string;
    type: 'warning' | 'critical';
    quotaType: string;
    quotaTypeName: string;
    usageRate: number;
    message: string;
  }

  const checkQuotaAlerts = () => {
    if (!quotaInfo) return;

    const newAlerts: QuotaAlert[] = [];
    const warningThreshold = thresholds.warning || 80;
    const criticalThreshold = thresholds.critical || 90;

    // 检查各类配额
    const quotaTypes = [
      {
        type: 'textToken',
        name: '文本Token',
        used: quotaInfo.textTokenUsed,
        total: quotaInfo.textTokenQuota,
      },
      {
        type: 'image',
        name: '图片生成',
        used: quotaInfo.imageUsed,
        total: quotaInfo.imageQuota,
      },
      {
        type: 'video',
        name: '视频生成',
        used: quotaInfo.videoUsed,
        total: quotaInfo.videoQuota,
      },
      {
        type: 'apiCall',
        name: 'API调用',
        used: quotaInfo.apiCallUsedToday,
        total: quotaInfo.apiCallQuotaPerDay,
      },
    ];

    quotaTypes.forEach(({ type, name, used, total }) => {
      if (total === 0) return; // 配额为0表示无限制

      const usageRate = (used / total) * 100;
      const alertId = `quota-${type}`;

      // 如果已经关闭，不显示
      if (dismissedAlerts.has(alertId)) return;

      if (usageRate >= criticalThreshold) {
        newAlerts.push({
          id: alertId,
          type: 'critical',
          quotaType: type,
          quotaTypeName: name,
          usageRate,
          message: `${name}配额已使用 ${usageRate.toFixed(1)}%，即将用尽！`,
        });
      } else if (usageRate >= warningThreshold) {
        newAlerts.push({
          id: alertId,
          type: 'warning',
          quotaType: type,
          quotaTypeName: name,
          usageRate,
          message: `${name}配额已使用 ${usageRate.toFixed(1)}%，建议及时关注`,
        });
      }
    });

    setAlerts(newAlerts);

    // 如果是严重警告，显示提示
    const criticalAlerts = newAlerts.filter((a) => a.type === 'critical');
    if (criticalAlerts.length > 0) {
      const message = criticalAlerts.map((a) => a.message).join('\n');
      showAlert(message, '配额警告', 'warning');
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleUpgrade = () => {
    onUpgrade?.();
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="quota-alert-container">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`quota-alert quota-alert-${alert.type}`}
        >
          <div className="alert-icon">
            {alert.type === 'critical' ? '⚠️' : '💡'}
          </div>
          <div className="alert-content">
            <div className="alert-message">{alert.message}</div>
            <div className="alert-progress">
              <div className="alert-progress-bar">
                <div
                  className="alert-progress-fill"
                  style={{
                    width: `${alert.usageRate}%`,
                    backgroundColor:
                      alert.type === 'critical' ? '#ff4757' : '#ffa502',
                  }}
                />
              </div>
              <span className="alert-percentage">
                {alert.usageRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="alert-actions">
            {alert.type === 'critical' && onUpgrade && (
              <button className="alert-upgrade-btn" onClick={handleUpgrade}>
                立即升级
              </button>
            )}
            <button
              className="alert-dismiss-btn"
              onClick={() => handleDismiss(alert.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
