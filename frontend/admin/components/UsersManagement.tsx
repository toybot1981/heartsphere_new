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
            showAlert('删除用户失败: ' + (error.message || '未知错误'), '删除失败', 'error');
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

                {/* 统计信息 */}
                <div className="mb-4 text-sm text-slate-400">
                    共 {totalElements} 个用户, 第 {currentPage + 1}/{totalPages || 1} 页
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

