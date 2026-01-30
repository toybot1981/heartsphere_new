import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { ScheduledTask, ScriptInfo } from '../../services/api/admin/devops';

export const ScheduledTasks: React.FC = () => {
    const [tasks, setTasks] = useState<ScheduledTask[]>([]);
    const [scripts, setScripts] = useState<ScriptInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);

    useEffect(() => {
        loadTasks();
        loadScripts();
    }, []);

    const loadTasks = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const data = await adminApi.devops.getScheduledTasks(token);
            setTasks(data);
        } catch (error: any) {
            showAlert('加载定时任务失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const loadScripts = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const data = await adminApi.devops.getScripts(token);
            setScripts(data);
        } catch (error: any) {
            console.error('Failed to load scripts', error);
        }
    };

    const handleCreate = () => {
        setEditingTask({
            name: '',
            scriptId: '',
            cronExpression: '',
            enabled: true,
        });
        setShowCreateModal(true);
    };

    const handleEdit = (task: ScheduledTask) => {
        setEditingTask(task);
        setShowCreateModal(true);
    };

    const handleDelete = async (taskId: number) => {
        if (!window.confirm('确定要删除这个定时任务吗？')) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.devops.deleteScheduledTask(token, taskId);
            showAlert('定时任务已删除', '成功', 'success');
            loadTasks();
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const handleToggle = async (task: ScheduledTask) => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            if (task.enabled) {
                await adminApi.devops.disableScheduledTask(token, task.id!);
            } else {
                await adminApi.devops.enableScheduledTask(token, task.id!);
            }
            showAlert('定时任务状态已更新', '成功', 'success');
            loadTasks();
        } catch (error: any) {
            showAlert('操作失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const handleSave = async (task: ScheduledTask) => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            setLoading(true);
            if (task.id) {
                await adminApi.devops.updateScheduledTask(token, task.id, task);
            } else {
                await adminApi.devops.createScheduledTask(token, task);
            }
            showAlert('定时任务已保存', '成功', 'success');
            setShowCreateModal(false);
            setEditingTask(null);
            loadTasks();
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '错误', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getCronDescription = (cron: string): string => {
        // 简单的 Cron 表达式说明
        const parts = cron.split(' ');
        if (parts.length >= 5) {
            const [second, minute, hour, day, month, weekday] = parts;
            if (minute === '0' && hour === '2' && day === '*' && month === '*') {
                return '每天凌晨2点';
            }
            if (minute === '0' && hour === '*' && day === '*' && month === '*') {
                return '每小时';
            }
            if (minute === '*/5' && hour === '*' && day === '*' && month === '*') {
                return '每5分钟';
            }
        }
        return cron;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">定时任务管理</h2>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                    + 新建定时任务
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg text-center">
                    <p className="text-slate-400">暂无定时任务</p>
                </div>
            ) : (
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="text-left py-3 px-4 text-slate-300 font-medium">任务名称</th>
                                <th className="text-left py-3 px-4 text-slate-300 font-medium">脚本</th>
                                <th className="text-left py-3 px-4 text-slate-300 font-medium">Cron表达式</th>
                                <th className="text-left py-3 px-4 text-slate-300 font-medium">状态</th>
                                <th className="text-left py-3 px-4 text-slate-300 font-medium">上次执行</th>
                                <th className="text-left py-3 px-4 text-slate-300 font-medium">下次执行</th>
                                <th className="text-left py-3 px-4 text-slate-300 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className="border-t border-slate-800">
                                    <td className="py-3 px-4 text-slate-300">{task.name}</td>
                                    <td className="py-3 px-4 text-slate-300">{task.scriptName}</td>
                                    <td className="py-3 px-4">
                                        <span className="text-slate-400 font-mono text-sm">{task.cronExpression}</span>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {getCronDescription(task.cronExpression)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            task.enabled 
                                                ? 'bg-green-900 text-green-300' 
                                                : 'bg-slate-700 text-slate-300'
                                        }`}>
                                            {task.enabled ? '✅ 启用' : '❌ 禁用'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-400 text-sm">
                                        {task.lastExecutedAt 
                                            ? new Date(task.lastExecutedAt).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-slate-400 text-sm">
                                        {task.nextExecutionTime 
                                            ? new Date(task.nextExecutionTime).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggle(task)}
                                                className="text-blue-400 hover:text-blue-300 text-sm"
                                            >
                                                {task.enabled ? '禁用' : '启用'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(task)}
                                                className="text-yellow-400 hover:text-yellow-300 text-sm"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task.id!)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 创建/编辑对话框 */}
            {showCreateModal && editingTask && (
                <ScheduledTaskModal
                    task={editingTask}
                    scripts={scripts}
                    onSave={handleSave}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingTask(null);
                    }}
                    loading={loading}
                />
            )}
        </div>
    );
};

interface ScheduledTaskModalProps {
    task: ScheduledTask;
    scripts: ScriptInfo[];
    onSave: (task: ScheduledTask) => void;
    onClose: () => void;
    loading: boolean;
}

const ScheduledTaskModal: React.FC<ScheduledTaskModalProps> = ({ task, scripts, onSave, onClose, loading }) => {
    const [formData, setFormData] = useState<ScheduledTask>({ ...task });

    const isValidCron = (cron: string): boolean => {
        if (!cron || cron.trim().length === 0) return false;
        const parts = cron.trim().split(/\s+/);
        return parts.length >= 5 && parts.length <= 6;
    };

    const getCronDescription = (cron: string): string => {
        const parts = cron.split(/\s+/);
        if (parts.length >= 5) {
            const [second, minute, hour, day, month, weekday] = parts;
            if (minute === '0' && hour === '2' && day === '*' && month === '*') {
                return '每天凌晨2点';
            }
            if (minute === '0' && hour === '*' && day === '*' && month === '*') {
                return '每小时整点';
            }
            if (minute === '*/5' && hour === '*' && day === '*' && month === '*') {
                return '每5分钟';
            }
            if (minute === '0' && hour === '0' && day === '*' && month === '*') {
                return '每天午夜';
            }
        }
        return '自定义时间';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidCron(formData.cronExpression)) {
            showAlert('Cron 表达式格式不正确', '错误', 'error');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-2xl">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">
                            {task.id ? '编辑定时任务' : '新建定时任务'}
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            任务名称 *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            执行脚本 *
                        </label>
                        <select
                            value={formData.scriptId}
                            onChange={(e) => {
                                const script = scripts.find(s => s.id === e.target.value);
                                setFormData({
                                    ...formData,
                                    scriptId: e.target.value,
                                    scriptName: script?.name,
                                });
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                            required
                        >
                            <option value="">选择脚本</option>
                            {scripts.map((script) => (
                                <option key={script.id} value={script.id}>
                                    {script.name} ({script.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Cron表达式 *
                        </label>
                        <input
                            type="text"
                            value={formData.cronExpression}
                            onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                            className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white font-mono ${
                                formData.cronExpression && !isValidCron(formData.cronExpression)
                                    ? 'border-red-500' : 'border-slate-700'
                            }`}
                            placeholder="0 0 2 * * ?"
                            required
                        />
                        {formData.cronExpression && (
                            <div className="mt-1">
                                {isValidCron(formData.cronExpression) ? (
                                    <p className="text-xs text-green-400">
                                        ✓ 格式正确: {getCronDescription(formData.cronExpression)}
                                    </p>
                                ) : (
                                    <p className="text-xs text-red-400">
                                        ✗ 格式错误：Cron 表达式应包含 5-6 个字段（秒 分 时 日 月 周）
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="mt-2 text-xs text-slate-400">
                            <p className="mb-1">常用示例：</p>
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, cronExpression: '0 0 2 * * ?' })}
                                    className="text-blue-400 hover:text-blue-300 mr-2"
                                >
                                    每天凌晨2点
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, cronExpression: '0 0 * * * ?' })}
                                    className="text-blue-400 hover:text-blue-300 mr-2"
                                >
                                    每小时
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, cronExpression: '0 */5 * * * ?' })}
                                    className="text-blue-400 hover:text-blue-300 mr-2"
                                >
                                    每5分钟
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, cronExpression: '0 0 0 * * ?' })}
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    每天午夜
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.enabled !== false}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-slate-300 text-sm">启用任务</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg"
                        >
                            {loading ? '保存中...' : '保存'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                        >
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
