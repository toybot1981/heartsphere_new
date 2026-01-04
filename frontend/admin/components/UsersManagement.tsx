import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/dialog';
import { Button } from '../../components/Button';
import { InputGroup, TextInput } from './AdminUIComponents';

interface UsersManagementProps {
    adminToken: string | null;
    onRefresh?: () => void;
}

interface User {
    id: number;
    username: string;
    email: string;
    nickname: string | null;
    avatar: string | null;
    wechatOpenid: string | null;
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
    adminToken,
    onRefresh
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

    const loadUsers = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const response = await adminApi.users.getAll(adminToken, currentPage, pageSize, search || undefined);
            setUsers(response.users);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error: any) {
            console.error('加载用户失败:', error);
            showAlert('加载用户失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [currentPage, search, adminToken]);

    // 当用户列表变化时，清除已删除用户的选中状态
    useEffect(() => {
        const existingIds = new Set(users.map(u => u.id));
        setSelectedUserIds(prev => {
            const newSet = new Set<number>();
            prev.forEach(id => {
                if (existingIds.has(id)) {
                    newSet.add(id);
                }
            });
            return newSet;
        });
    }, [users]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(0); // 搜索时重置到第一页
    };

    const handleToggleEnabled = async (userId: number, username: string, isEnabled: boolean) => {
        if (!adminToken) return;
        const action = isEnabled ? '启用' : '禁用';
        const confirmed = await showConfirm(
            `确定要${action}用户 "${username}" 吗？`,
            `${action}用户`,
            'warning'
        );
        if (!confirmed) return;

        try {
            await adminApi.users.updateStatus(userId, !isEnabled, adminToken);
            showAlert(`用户已${action}`, '操作成功', 'success');
            loadUsers();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error(`${action}用户失败:`, error);
            showAlert(`${action}用户失败: ` + (error.message || '未知错误'), '操作失败', 'error');
        }
    };

    const handleDelete = async (userId: number, username: string) => {
        if (!adminToken) return;
        const confirmed = await showConfirm(
            `确定要删除用户 "${username}" 吗？\n\n此操作不可恢复！`,
            '删除用户',
            'danger'
        );
        if (!confirmed) return;

        try {
            await adminApi.users.delete(userId, adminToken);
            showAlert('用户已删除', '删除成功', 'success');
            loadUsers();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('删除用户失败:', error);
            const errorMessage = error.message || '未知错误';
            
            // 检查是否是外键约束错误
            if (errorMessage.includes('外键关联约束') || errorMessage.includes('foreign key') || errorMessage.includes('DataIntegrityViolationException')) {
                // 显示强制删除选项
                const forceDeleteConfirmed = await showConfirm(
                    `无法删除用户 "${username}"：存在外键关联约束。\n\n` +
                    `⚠️ 强制删除将清空以下所有关联数据：\n` +
                    `• 角色数据\n` +
                    `• 日记记录\n` +
                    `• 场景数据\n` +
                    `• 脚本数据\n` +
                    `• 世界数据\n` +
                    `• 主线剧情\n` +
                    `• 笔记数据\n` +
                    `• 会员记录\n` +
                    `• 支付订单\n` +
                    `• 积分交易记录\n\n` +
                    `此操作不可恢复，确定要继续吗？`,
                    '强制删除用户',
                    'danger'
                );
                
                if (forceDeleteConfirmed) {
                    try {
                        await adminApi.users.forceDelete(userId, adminToken);
                        showAlert('用户已强制删除', '删除成功', 'success');
                        loadUsers();
                        if (onRefresh) onRefresh();
                    } catch (forceError: any) {
                        console.error('强制删除用户失败:', forceError);
                        showAlert('强制删除用户失败: ' + (forceError.message || '未知错误'), '删除失败', 'error');
                    }
                }
            } else {
                showAlert('删除用户失败: ' + errorMessage, '删除失败', 'error');
            }
        }
    };

    const handleSelectUser = (userId: number, checked: boolean) => {
        const newSelected = new Set(selectedUserIds);
        if (checked) {
            newSelected.add(userId);
        } else {
            newSelected.delete(userId);
        }
        setSelectedUserIds(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUserIds(new Set(users.map(u => u.id)));
        } else {
            setSelectedUserIds(new Set());
        }
    };

    const handleBatchDelete = async () => {
        if (!adminToken) return;
        if (selectedUserIds.size === 0) {
            showAlert('请先选择要删除的用户', '提示', 'warning');
            return;
        }

        const selectedUsers = users.filter(u => selectedUserIds.has(u.id));
        const usernames = selectedUsers.map(u => u.username).join('、');
        
        const confirmed = await showConfirm(
            `确定要删除选中的 ${selectedUserIds.size} 个用户吗？\n\n` +
            `用户：${usernames}\n\n` +
            `此操作不可恢复！`,
            '批量删除用户',
            'danger'
        );
        if (!confirmed) return;

        try {
            const userIds = Array.from(selectedUserIds);
            const result = await adminApi.users.batchDelete(userIds, false, adminToken);
            
            // 根据实际删除结果显示消息
            if (result.deletedCount === result.totalCount) {
                // 全部删除成功
                showAlert(`已成功删除 ${result.deletedCount} 个用户`, '删除成功', 'success');
            } else if (result.deletedCount > 0) {
                // 部分删除成功
                const failedUsernames = users
                    .filter(u => result.failedUserIds.includes(u.id))
                    .map(u => u.username)
                    .join('、');
                showAlert(
                    `成功删除 ${result.deletedCount} 个用户，${result.failedCount} 个用户删除失败。\n\n` +
                    `失败用户：${failedUsernames}\n\n` +
                    `部分用户可能存在外键关联约束，请使用强制删除。`,
                    '部分删除成功',
                    'warning'
                );
            } else {
                // 全部删除失败
                throw new Error('所有用户删除失败，可能存在外键关联约束');
            }
            
            setSelectedUserIds(new Set());
            loadUsers();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('批量删除用户失败:', error);
            const errorMessage = error.message || '未知错误';
            
            // 检查是否是外键约束错误
            if (errorMessage.includes('外键关联约束') || errorMessage.includes('foreign key') || errorMessage.includes('DataIntegrityViolationException')) {
                // 显示强制删除选项
                const forceDeleteConfirmed = await showConfirm(
                    `部分用户无法删除：存在外键关联约束。\n\n` +
                    `⚠️ 强制删除将清空以下所有关联数据：\n` +
                    `• 角色数据\n` +
                    `• 日记记录\n` +
                    `• 场景数据\n` +
                    `• 脚本数据\n` +
                    `• 世界数据\n` +
                    `• 主线剧情\n` +
                    `• 笔记数据\n` +
                    `• 会员记录\n` +
                    `• 支付订单\n` +
                    `• 积分交易记录\n\n` +
                    `此操作不可恢复，确定要继续吗？`,
                    '强制批量删除用户',
                    'danger'
                );
                
                if (forceDeleteConfirmed) {
                    try {
                        const userIds = Array.from(selectedUserIds);
                        const result = await adminApi.users.batchDelete(userIds, true, adminToken);
                        
                        // 根据实际删除结果显示消息
                        if (result.deletedCount === result.totalCount) {
                            // 全部删除成功
                            showAlert(`已成功强制删除 ${result.deletedCount} 个用户`, '删除成功', 'success');
                        } else if (result.deletedCount > 0) {
                            // 部分删除成功
                            const failedUsernames = users
                                .filter(u => result.failedUserIds.includes(u.id))
                                .map(u => u.username)
                                .join('、');
                            showAlert(
                                `成功强制删除 ${result.deletedCount} 个用户，${result.failedCount} 个用户删除失败。\n\n` +
                                `失败用户：${failedUsernames}`,
                                '部分删除成功',
                                'warning'
                            );
                        } else {
                            // 全部删除失败
                            showAlert('所有用户强制删除失败，请查看日志了解详情', '删除失败', 'error');
                        }
                        
                        setSelectedUserIds(new Set());
                        loadUsers();
                        if (onRefresh) onRefresh();
                    } catch (forceError: any) {
                        console.error('强制批量删除用户失败:', forceError);
                        showAlert('强制批量删除用户失败: ' + (forceError.message || '未知错误'), '删除失败', 'error');
                    }
                }
            } else {
                showAlert('批量删除用户失败: ' + errorMessage, '删除失败', 'error');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h2 className="text-lg font-bold text-slate-100 mb-5">用户管理</h2>
                
                {/* 搜索栏 */}
                <div className="flex items-center gap-3 mb-4">
                    <TextInput
                        placeholder="搜索用户名或邮箱..."
                        value={search}
                        onChange={handleSearchChange}
                        className="flex-1"
                    />
                    <Button 
                        onClick={() => {
                            setCurrentPage(0);
                            loadUsers();
                        }} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-sm px-4 py-2"
                    >
                        搜索
                    </Button>
                </div>

                {/* 统计信息和批量操作 */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        共 {totalElements} 个用户, 第 {currentPage + 1}/{totalPages || 1} 页
                        {selectedUserIds.size > 0 && (
                            <span className="ml-3 text-indigo-400">
                                已选择 {selectedUserIds.size} 个用户
                            </span>
                        )}
                    </div>
                    {selectedUserIds.size > 0 && (
                        <Button
                            onClick={handleBatchDelete}
                            className="bg-red-600 hover:bg-red-700 text-sm px-4 py-2"
                        >
                            批量删除 ({selectedUserIds.size})
                        </Button>
                    )}
                </div>

                {/* 用户列表 */}
                {loading ? (
                    <p className="text-slate-400 text-center py-8">加载中...</p>
                ) : users.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">暂无用户</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={users.length > 0 && selectedUserIds.size === users.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                                        />
                                    </th>
                                    <th className="p-3 text-left">ID</th>
                                    <th className="p-3 text-left">用户名</th>
                                    <th className="p-3 text-left">邮箱</th>
                                    <th className="p-3 text-left">昵称</th>
                                    <th className="p-3 text-left">状态</th>
                                    <th className="p-3 text-left">注册时间</th>
                                    <th className="p-3 text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.has(user.id)}
                                                onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                                            />
                                        </td>
                                        <td className="p-3 text-sm text-slate-400">{user.id}</td>
                                        <td className="p-3 text-sm font-medium text-white">{user.username}</td>
                                        <td className="p-3 text-sm text-slate-400">{user.email}</td>
                                        <td className="p-3 text-sm text-slate-400">{user.nickname || 'N/A'}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                user.isEnabled 
                                                    ? 'bg-green-600/20 text-green-300' 
                                                    : 'bg-red-600/20 text-red-300'
                                            }`}>
                                                {user.isEnabled ? '启用' : '禁用'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-slate-400">
                                            {new Date(user.createdAt).toLocaleString('zh-CN')}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-2 items-end">
                                                <button
                                                    onClick={() => handleToggleEnabled(user.id, user.username, user.isEnabled)}
                                                    className={`${
                                                        user.isEnabled 
                                                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                                                            : 'bg-green-600 hover:bg-green-700'
                                                    } text-white text-sm px-3 py-1.5 rounded-lg transition-colors min-w-[60px] font-medium`}
                                                >
                                                    {user.isEnabled ? '禁用' : '启用'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.username)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors min-w-[60px] font-medium"
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

                {/* 分页 */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            上一页
                        </Button>
                        <span className="text-sm text-slate-400">
                            页 {currentPage + 1} / {totalPages}
                        </span>
                        <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            下一页
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

