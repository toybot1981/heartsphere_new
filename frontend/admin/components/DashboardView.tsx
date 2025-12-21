import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { GameState } from '../../types';
import { WORLD_SCENES } from '../../constants';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';

interface DashboardViewProps {
    gameState: GameState;
    onResetWorld: () => void;
    adminToken: string | null;
}

interface StatisticsOverview {
    totalUsers: number;
    enabledUsers: number;
    totalJournals: number;
    totalCharacters: number;
    totalEras: number;
}

interface DailyStat {
    date: string;
    newUsers: number;
    newJournals: number;
    newCharacters: number;
    newEras: number;
}

interface WeeklyStat {
    weekStart: string;
    weekEnd: string;
    weekLabel: string;
    newUsers: number;
    newJournals: number;
    newCharacters: number;
    newEras: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ gameState, onResetWorld, adminToken }) => {
    const [overview, setOverview] = useState<StatisticsOverview | null>(null);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'weeks'>('7days');

    useEffect(() => {
        if (adminToken) {
            loadStatistics();
        }
    }, [adminToken, timeRange]);

    const loadStatistics = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            // 加载总体统计
            const overviewData = await adminApi.statistics.getOverview(adminToken);
            setOverview(overviewData);

            // 加载每日统计或周统计
            if (timeRange === 'weeks') {
                const trendsData = await adminApi.statistics.getTrends(4, adminToken);
                setWeeklyStats(trendsData.weeklyStats);
                setDailyStats([]);
            } else {
                const days = timeRange === '7days' ? 7 : 30;
                const dailyData = await adminApi.statistics.getDaily(undefined, undefined, days, adminToken);
                setDailyStats(dailyData.dailyStats);
                setWeeklyStats([]);
            }
        } catch (error: any) {
            console.error('加载统计数据失败:', error);
            showAlert('加载统计数据失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const allScenes = [...WORLD_SCENES, ...gameState.customScenes];
    
    const getAllCharacters = () => {
        const list: any[] = [];
        allScenes.forEach(scene => {
            scene.characters.forEach(c => list.push(c));
            const customs = gameState.customCharacters[scene.id] || [];
            customs.forEach(c => list.push(c));
        });
        return list;
    };

    // 格式化日期显示
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    };

    // 计算图表数据
    const getChartData = () => {
        if (timeRange === 'weeks') {
            return weeklyStats.map(stat => ({
                label: stat.weekLabel.split(' ~ ')[0],
                users: stat.newUsers,
                journals: stat.newJournals,
                characters: stat.newCharacters,
                eras: stat.newEras,
            }));
        } else {
            return dailyStats.map(stat => ({
                label: formatDate(stat.date),
                users: stat.newUsers,
                journals: stat.newJournals,
                characters: stat.newCharacters,
                eras: stat.newEras,
            }));
        }
    };

    const chartData = getChartData();
    const maxValue = Math.max(
        ...chartData.flatMap(d => [d.users, d.journals, d.characters, d.eras]),
        1
    );

    return (
        <div className="space-y-6">
            {/* 总体统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">总用户数</h3>
                    <p className="text-3xl font-bold text-white">
                        {loading ? '...' : (overview?.totalUsers || 0)}
                    </p>
                    {overview && (
                        <p className="text-xs text-slate-500 mt-1">
                            启用: {overview.enabledUsers}
                        </p>
                    )}
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">总日记数</h3>
                    <p className="text-3xl font-bold text-indigo-400">
                        {loading ? '...' : (overview?.totalJournals || 0)}
                    </p>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">总角色数</h3>
                    <p className="text-3xl font-bold text-pink-400">
                        {loading ? '...' : (overview?.totalCharacters || 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        本地: {getAllCharacters().length}
                    </p>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">总场景数</h3>
                    <p className="text-3xl font-bold text-emerald-400">
                        {loading ? '...' : (overview?.totalEras || 0)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        本地: {allScenes.length}
                    </p>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">剧本数</h3>
                    <p className="text-3xl font-bold text-purple-400">
                        {gameState.customScenarios.length}
                    </p>
                </div>
            </div>

            {/* 趋势分析 */}
            {adminToken && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">趋势分析</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTimeRange('7days')}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    timeRange === '7days'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                最近7天
                            </button>
                            <button
                                onClick={() => setTimeRange('30days')}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    timeRange === '30days'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                最近30天
                            </button>
                            <button
                                onClick={() => setTimeRange('weeks')}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    timeRange === 'weeks'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                最近4周
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">加载中...</div>
                    ) : chartData.length > 0 ? (
                        <div className="space-y-4">
                            {/* 图表 */}
                            <div className="relative h-64 flex items-end gap-2">
                                {chartData.map((data, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full flex flex-col items-center gap-1" style={{ height: '200px' }}>
                                            {/* 用户数 */}
                                            <div
                                                className="w-full bg-blue-500/80 hover:bg-blue-500 rounded-t transition-colors cursor-pointer group relative"
                                                style={{ height: `${(data.users / maxValue) * 100}%` }}
                                                title={`注册用户: ${data.users}`}
                                            >
                                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                                    {data.users}
                                                </span>
                                            </div>
                                            {/* 日记数 */}
                                            <div
                                                className="w-full bg-indigo-500/80 hover:bg-indigo-500 transition-colors cursor-pointer group relative"
                                                style={{ height: `${(data.journals / maxValue) * 100}%` }}
                                                title={`新增日记: ${data.journals}`}
                                            >
                                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                                    {data.journals}
                                                </span>
                                            </div>
                                            {/* 角色数 */}
                                            <div
                                                className="w-full bg-pink-500/80 hover:bg-pink-500 transition-colors cursor-pointer group relative"
                                                style={{ height: `${(data.characters / maxValue) * 100}%` }}
                                                title={`新增角色: ${data.characters}`}
                                            >
                                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                                    {data.characters}
                                                </span>
                                            </div>
                                            {/* 场景数 */}
                                            <div
                                                className="w-full bg-emerald-500/80 hover:bg-emerald-500 rounded-b transition-colors cursor-pointer group relative"
                                                style={{ height: `${(data.eras / maxValue) * 100}%` }}
                                                title={`新增场景: ${data.eras}`}
                                            >
                                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                                    {data.eras}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 mt-2 text-center">{data.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* 图例 */}
                            <div className="flex justify-center gap-6 pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                    <span className="text-xs text-slate-400">注册用户</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                                    <span className="text-xs text-slate-400">新增日记</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-pink-500 rounded"></div>
                                    <span className="text-xs text-slate-400">新增角色</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                                    <span className="text-xs text-slate-400">新增场景</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">暂无数据</div>
                    )}
                </div>
            )}

            {/* 危险操作区 */}
            <div className="col-span-full mt-8 p-6 bg-red-900/10 border border-red-900/50 rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="text-red-400 font-bold">危险操作区</h3>
                    <p className="text-red-400/60 text-sm">重置所有数据将无法恢复。</p>
                </div>
                <Button onClick={onResetWorld} className="bg-red-600 hover:bg-red-500 border-none">恢复出厂设置</Button>
            </div>
        </div>
    );
};
