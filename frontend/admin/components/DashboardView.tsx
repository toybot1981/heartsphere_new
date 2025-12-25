import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { DashboardStatistics, TrendData } from '../../services/api/admin/dashboard';

interface DashboardViewProps {
    adminToken: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ adminToken }) => {
    const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');

    useEffect(() => {
        if (adminToken) {
            loadStatistics();
        }
    }, [adminToken, period]);

    const loadStatistics = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const data = await adminApi.dashboard.getStatistics(adminToken, period);
            setStatistics(data);
        } catch (error: any) {
            showAlert('加载统计数据失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'day':
                return '最近30天';
            case 'month':
                return '最近12个月';
            case 'year':
                return '最近1年';
            default:
                return '最近30天';
        }
    };

    const formatDate = (date: string) => {
        if (period === 'year') {
            return date;
        } else if (period === 'month') {
            return date;
        } else {
            // day: 显示月-日
            const parts = date.split('-');
            return `${parts[1]}-${parts[2]}`;
        }
    };

    if (loading && !statistics) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-400">加载中...</div>
            </div>
        );
    }

    if (!statistics) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">注册用户</h3>
                    <p className="text-3xl font-bold text-white">{statistics.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">总注册用户数</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">用户场景</h3>
                    <p className="text-3xl font-bold text-indigo-400">{statistics.totalScenes.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">用户构建的场景总数</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">剧本数量</h3>
                    <p className="text-3xl font-bold text-pink-400">{statistics.totalScripts.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">用户创建的剧本总数</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">角色数量</h3>
                    <p className="text-3xl font-bold text-emerald-400">{statistics.totalCharacters.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">用户创建的角色总数</p>
                </div>
            </div>

            {/* 趋势分析 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-100 mb-1">趋势分析</h3>
                        <p className="text-sm text-slate-400">{getPeriodLabel()}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPeriod('day')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                period === 'day'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            日
                        </button>
                        <button
                            onClick={() => setPeriod('month')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                period === 'month'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            月
                        </button>
                        <button
                            onClick={() => setPeriod('year')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                period === 'year'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            年
                        </button>
                    </div>
                </div>

                {statistics.trends && statistics.trends.length > 0 ? (
                    <div className="space-y-4">
                        {/* 趋势图表 - 使用简单的柱状图展示 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 用户注册趋势 */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-300 mb-3">用户注册趋势</h4>
                                <div className="h-48 flex items-end gap-1 border-b border-slate-700" style={{ paddingBottom: '24px' }}>
                                    {statistics.trends.map((trend, index) => {
                                        const values = statistics.trends.map(t => t.users);
                                        const maxValue = Math.max(...values, 1);
                                        const calculatedHeight = maxValue > 0 ? (trend.users / maxValue) * 100 : 0;
                                        const height = Math.max(calculatedHeight, 2); // 最小高度2%
                                        const showLabel = statistics.trends.length <= 30 || index % Math.ceil(statistics.trends.length / 10) === 0;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center min-w-0 relative group">
                                                <div
                                                    className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-400 cursor-pointer"
                                                    style={{ height: `${height}%`, minHeight: '2px' }}
                                                    title={`${formatDate(trend.date)}: ${trend.users}人`}
                                                />
                                                {showLabel && (
                                                    <span className="text-xs text-slate-500 mt-1 absolute bottom-[-20px] whitespace-nowrap">
                                                        {formatDate(trend.date)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 场景创建趋势 */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-300 mb-3">场景创建趋势</h4>
                                <div className="h-48 flex items-end gap-1 border-b border-slate-700" style={{ paddingBottom: '24px' }}>
                                    {statistics.trends.map((trend, index) => {
                                        const values = statistics.trends.map(t => t.scenes);
                                        const maxValue = Math.max(...values, 1);
                                        const calculatedHeight = maxValue > 0 ? (trend.scenes / maxValue) * 100 : 0;
                                        const height = Math.max(calculatedHeight, 2); // 最小高度2%
                                        const showLabel = statistics.trends.length <= 30 || index % Math.ceil(statistics.trends.length / 10) === 0;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center min-w-0 relative group">
                                                <div
                                                    className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-400 cursor-pointer"
                                                    style={{ height: `${height}%`, minHeight: '2px' }}
                                                    title={`${formatDate(trend.date)}: ${trend.scenes}个`}
                                                />
                                                {showLabel && (
                                                    <span className="text-xs text-slate-500 mt-1 absolute bottom-[-20px] whitespace-nowrap">
                                                        {formatDate(trend.date)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 剧本创建趋势 */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-300 mb-3">剧本创建趋势</h4>
                                <div className="h-48 flex items-end gap-1 border-b border-slate-700" style={{ paddingBottom: '24px' }}>
                                    {statistics.trends.map((trend, index) => {
                                        const values = statistics.trends.map(t => t.scripts);
                                        const maxValue = Math.max(...values, 1);
                                        const calculatedHeight = maxValue > 0 ? (trend.scripts / maxValue) * 100 : 0;
                                        const height = Math.max(calculatedHeight, 2); // 最小高度2%
                                        const showLabel = statistics.trends.length <= 30 || index % Math.ceil(statistics.trends.length / 10) === 0;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center min-w-0 relative group">
                                                <div
                                                    className="w-full bg-pink-500 rounded-t transition-all hover:bg-pink-400 cursor-pointer"
                                                    style={{ height: `${height}%`, minHeight: '2px' }}
                                                    title={`${formatDate(trend.date)}: ${trend.scripts}个`}
                                                />
                                                {showLabel && (
                                                    <span className="text-xs text-slate-500 mt-1 absolute bottom-[-20px] whitespace-nowrap">
                                                        {formatDate(trend.date)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 角色创建趋势 */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-300 mb-3">角色创建趋势</h4>
                                <div className="h-48 flex items-end gap-1 border-b border-slate-700" style={{ paddingBottom: '24px' }}>
                                    {statistics.trends.map((trend, index) => {
                                        const values = statistics.trends.map(t => t.characters);
                                        const maxValue = Math.max(...values, 1);
                                        const calculatedHeight = maxValue > 0 ? (trend.characters / maxValue) * 100 : 0;
                                        const height = Math.max(calculatedHeight, 2); // 最小高度2%
                                        const showLabel = statistics.trends.length <= 30 || index % Math.ceil(statistics.trends.length / 10) === 0;
                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center min-w-0 relative group">
                                                <div
                                                    className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-400 cursor-pointer"
                                                    style={{ height: `${height}%`, minHeight: '2px' }}
                                                    title={`${formatDate(trend.date)}: ${trend.characters}个`}
                                                />
                                                {showLabel && (
                                                    <span className="text-xs text-slate-500 mt-1 absolute bottom-[-20px] whitespace-nowrap">
                                                        {formatDate(trend.date)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 趋势数据表格 */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-2 px-4 text-slate-400">日期</th>
                                        <th className="text-right py-2 px-4 text-slate-400">用户注册</th>
                                        <th className="text-right py-2 px-4 text-slate-400">场景创建</th>
                                        <th className="text-right py-2 px-4 text-slate-400">剧本创建</th>
                                        <th className="text-right py-2 px-4 text-slate-400">角色创建</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statistics.trends.slice().reverse().map((trend, index) => (
                                        <tr key={index} className="border-b border-slate-800 hover:bg-slate-800">
                                            <td className="py-2 px-4 text-slate-300">{trend.date}</td>
                                            <td className="py-2 px-4 text-right text-white">{trend.users}</td>
                                            <td className="py-2 px-4 text-right text-indigo-400">{trend.scenes}</td>
                                            <td className="py-2 px-4 text-right text-pink-400">{trend.scripts}</td>
                                            <td className="py-2 px-4 text-right text-emerald-400">{trend.characters}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-500 py-8">暂无趋势数据</div>
                )}
            </div>
        </div>
    );
};
