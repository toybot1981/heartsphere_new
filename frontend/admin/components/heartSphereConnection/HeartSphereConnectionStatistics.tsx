import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import { showAlert } from '../../../utils/dialog';
import { Button } from '../../../components/Button';
import { InputGroup } from '../AdminUIComponents';
import type { HeartSphereConnectionStatisticsDTO } from '../../../services/api/admin/heartSphereConnection';

interface HeartSphereConnectionStatisticsProps {
  adminToken: string | null;
}

export const HeartSphereConnectionStatistics: React.FC<HeartSphereConnectionStatisticsProps> = ({
  adminToken
}) => {
  const [statistics, setStatistics] = useState<HeartSphereConnectionStatisticsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadStatistics = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const data = await adminApi.heartSphereConnection.getStatistics(adminToken, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setStatistics(data);
    } catch (error: any) {
      console.error('加载统计数据失败:', error);
      showAlert('加载统计数据失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [adminToken]);

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number | undefined; subtitle?: string }) => (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="text-sm text-slate-400 mb-2">{title}</div>
      <div className="text-2xl font-bold text-white">{value ?? '-'}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 时间筛选 */}
      <div className="flex gap-4 items-end">
        <InputGroup label="开始日期">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
          />
        </InputGroup>
        <InputGroup label="结束日期">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
          />
        </InputGroup>
        <Button onClick={loadStatistics} disabled={loading}>
          {loading ? '加载中...' : '查询'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : statistics ? (
        <>
          {/* 用户统计 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">用户统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="共享用户总数" value={statistics.totalShareUsers} />
              <StatCard title="连接用户总数" value={statistics.totalConnectionUsers} />
              <StatCard title="访问用户总数" value={statistics.totalAccessUsers} />
              <StatCard title="活跃共享用户数" value={statistics.activeShareUsers} />
            </div>
          </div>

          {/* 共享统计 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">共享统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="共享配置总数" value={statistics.totalShareConfigs} />
              <StatCard title="活跃共享配置数" value={statistics.activeShareConfigs} />
              <StatCard 
                title="连接成功率" 
                value={statistics.connectionSuccessRate ? `${statistics.connectionSuccessRate.toFixed(2)}%` : '-'} 
              />
            </div>
          </div>

          {/* 连接统计 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">连接统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="连接请求总数" value={statistics.totalConnectionRequests} />
              <StatCard title="已批准请求数" value={statistics.approvedRequests} />
              <StatCard title="已拒绝请求数" value={statistics.rejectedRequests} />
              <StatCard title="待处理请求数" value={statistics.pendingRequests} />
            </div>
          </div>

          {/* 访问统计 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">访问统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="访问总次数" value={statistics.totalAccessCount} />
              <StatCard 
                title="访问总时长" 
                value={statistics.totalAccessDuration ? `${Math.floor(statistics.totalAccessDuration / 3600)}小时` : '-'} 
              />
              <StatCard 
                title="平均访问时长" 
                value={statistics.averageAccessDuration ? `${Math.floor(statistics.averageAccessDuration / 60)}分钟` : '-'} 
              />
              <StatCard title="独立访问者数" value={statistics.uniqueVisitors} />
            </div>
          </div>

          {/* 留言统计 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">留言统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="留言总数" value={statistics.totalMessages} />
              <StatCard title="已审核留言数" value={statistics.approvedMessages} />
              <StatCard title="已拒绝留言数" value={statistics.rejectedMessages} />
              <StatCard 
                title="回复率" 
                value={statistics.replyRate ? `${statistics.replyRate.toFixed(2)}%` : '-'} 
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">暂无数据</div>
      )}
    </div>
  );
};



