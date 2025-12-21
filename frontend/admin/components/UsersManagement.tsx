import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/dialog';
import { Button } from '../../components/Button';
import { InputGroup, TextInput } from './AdminUIComponents';

interface UsersManagementProps {
    adminToken: string | null;
    onRefresh?: () => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
    adminToken,
    onRefresh
}) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(20);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        if (adminToken) {
            loadUsers();
        }
    }, [adminToken, currentPage]);

    const loadUsers = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const response = await adminApi.users.getAll(currentPage, pageSize, search || undefined, adminToken);
            setUsers(response.users);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error: any) {
            console.error('加载用户列表失败:', error);
            showAlert('加载用户列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setSearch(searchInput);
        setCurrentPage(0);
    };

    const handleUpdateStatus = async (userId: number, isEnabled: boolean) => {
        if (!adminToken) return;
        const action = isEnabled ? '启用' : '禁用';
        const confirmed = await showConfirm(`确定要${action}此用户吗？`, `${action}用户`, 'warning');
        if (!confirmed) return;

        try {
            await adminApi.users.updateStatus(userId, isEnabled, adminToken);
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">管理注册用户，查看用户信息、启用/禁用用户账户。</p>
                <div className="flex gap-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="搜索用户名或邮箱..."
                            className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-64"
                        />
                        <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-500 text-sm">
                            搜索
                        </Button>
                        {search && (
                            <Button 
                                onClick={() => {
                                    setSearchInput('');
                                    setSearch('');
                                    setCurrentPage(0);
                                }} 
                                className="bg-slate-600 hover:bg-slate-500 text-sm"
                            >
                                清除
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-sm text-slate-400">
                        共 {totalElements} 个用户
                    </span>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0 || loading}
                            className="bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-50"
                        >
                            上一页
                        </Button>
                        <span className="text-sm text-slate-400 px-3 py-2">
                            第 {currentPage + 1} / {totalPages || 1} 页
                        </span>
                        <Button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage >= totalPages - 1 || loading}
                            className="bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-50"
                        >
                            下一页
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">加载中...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">用户名</th>
                                <th className="p-4">邮箱</th>
                                <th className="p-4">昵称</th>
                                <th className="p-4">状态</th>
                                <th className="p-4">注册时间</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 text-sm text-slate-400">{user.id}</td>
                                    <td className="p-4 font-bold text-white">{user.username}</td>
                                    <td className="p-4 text-sm text-slate-400">{user.email}</td>
                                    <td className="p-4 text-sm text-slate-400">{user.nickname || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            user.isEnabled 
                                                ? 'bg-green-900/30 text-green-400 border border-green-800' 
                                                : 'bg-red-900/30 text-red-400 border border-red-800'
                                        }`}>
                                            {user.isEnabled ? '启用' : '禁用'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {new Date(user.createdAt).toLocaleString('zh-CN')}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleUpdateStatus(user.id, !user.isEnabled)}
                                            className={`text-sm font-medium ${
                                                user.isEnabled 
                                                    ? 'text-yellow-400 hover:text-yellow-300' 
                                                    : 'text-green-400 hover:text-green-300'
                                            }`}
                                        >
                                            {user.isEnabled ? '禁用' : '启用'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id, user.username)}
                                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                                        >
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        {search ? '未找到匹配的用户' : '暂无用户'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

