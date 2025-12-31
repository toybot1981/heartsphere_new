import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/dialog';
import { Button } from '../../components/Button';
import { InputGroup, TextInput } from './AdminUIComponents';

interface AdminsManagementProps {
    adminToken: string | null;
    onReload?: () => Promise<void>;
}

interface SystemAdmin {
    id: number;
    username: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export const AdminsManagement: React.FC<AdminsManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const [admins, setAdmins] = useState<SystemAdmin[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<SystemAdmin | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordAdminId, setPasswordAdminId] = useState<number | null>(null);
    
    // 表单数据
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN',
        isActive: true,
    });
    
    const [passwordFormData, setPasswordFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // 加载管理员列表
    const loadAdmins = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const data = await adminApi.admins.getAll(adminToken);
            setAdmins(data);
        } catch (error: any) {
            console.error('加载管理员列表失败:', error);
            showAlert('加载管理员列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, [adminToken]);

    // 重置表单
    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            email: '',
            role: 'ADMIN',
            isActive: true,
        });
        setEditingAdmin(null);
        setShowCreateForm(false);
    };

    // 重置密码表单
    const resetPasswordForm = () => {
        setPasswordFormData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setPasswordAdminId(null);
        setShowPasswordForm(false);
    };

    // 处理创建/编辑
    const handleSave = async () => {
        if (!adminToken) return;
        
        if (!formData.username || !formData.email) {
            showAlert('请填写用户名和邮箱', '缺少参数', 'warning');
            return;
        }
        
        if (showCreateForm && !formData.password) {
            showAlert('请填写密码', '缺少参数', 'warning');
            return;
        }

        setLoading(true);
        try {
            if (editingAdmin) {
                // 更新
                await adminApi.admins.update(editingAdmin.id, {
                    email: formData.email,
                    role: formData.role,
                    isActive: formData.isActive,
                }, adminToken);
                showAlert('更新成功', '成功', 'success');
            } else {
                // 创建
                await adminApi.admins.create({
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                    role: formData.role,
                    isActive: formData.isActive,
                }, adminToken);
                showAlert('创建成功', '成功', 'success');
            }
            resetForm();
            await loadAdmins();
            if (onReload) await onReload();
        } catch (error: any) {
            console.error('保存失败:', error);
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 处理删除
    const handleDelete = async (id: number, username: string) => {
        if (!adminToken) return;
        const confirmed = await showConfirm(
            `确定要删除管理员 "${username}" 吗？\n\n此操作不可恢复！`,
            '删除管理员',
            'danger'
        );
        if (!confirmed) return;

        try {
            await adminApi.admins.delete(id, adminToken);
            showAlert('删除成功', '成功', 'success');
            await loadAdmins();
            if (onReload) await onReload();
        } catch (error: any) {
            console.error('删除失败:', error);
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };

    // 处理修改密码
    const handleChangePassword = async () => {
        if (!adminToken || !passwordAdminId) return;
        
        if (!passwordFormData.oldPassword || !passwordFormData.newPassword) {
            showAlert('请填写旧密码和新密码', '缺少参数', 'warning');
            return;
        }
        
        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            showAlert('新密码和确认密码不一致', '密码错误', 'warning');
            return;
        }

        setLoading(true);
        try {
            await adminApi.admins.changePassword(passwordAdminId, {
                oldPassword: passwordFormData.oldPassword,
                newPassword: passwordFormData.newPassword,
            }, adminToken);
            showAlert('密码修改成功', '成功', 'success');
            resetPasswordForm();
        } catch (error: any) {
            console.error('修改密码失败:', error);
            showAlert('修改密码失败: ' + (error.message || '未知错误'), '修改失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 打开编辑表单
    const handleEdit = (admin: SystemAdmin) => {
        setEditingAdmin(admin);
        setFormData({
            username: admin.username,
            password: '',
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
        });
        setShowCreateForm(true);
    };

    // 打开密码修改表单
    const handleOpenPasswordForm = (id: number) => {
        setPasswordAdminId(id);
        setShowPasswordForm(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* 标题和创建按钮 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-100">系统管理员管理</h2>
                    <Button
                        onClick={() => {
                            resetForm();
                            setShowCreateForm(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        + 创建管理员
                    </Button>
                </div>

                {/* 创建/编辑表单 */}
                {showCreateForm && (
                    <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-slate-200 mb-4">
                            {editingAdmin ? '编辑管理员' : '创建管理员'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="用户名 *">
                                <TextInput
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="请输入用户名"
                                    disabled={!!editingAdmin}
                                />
                                {editingAdmin && <p className="text-xs text-slate-500 mt-1">用户名不可修改</p>}
                            </InputGroup>
                            {!editingAdmin && (
                                <InputGroup label="密码 *">
                                    <TextInput
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="请输入密码"
                                    />
                                </InputGroup>
                            )}
                            <InputGroup label="邮箱 *">
                                <TextInput
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="请输入邮箱"
                                />
                            </InputGroup>
                            <InputGroup label="角色 *">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'SUPER_ADMIN' | 'ADMIN' })}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                >
                                    <option value="ADMIN">普通管理员</option>
                                    <option value="SUPER_ADMIN">超级管理员</option>
                                </select>
                            </InputGroup>
                            <InputGroup label="状态">
                                <label className="flex items-center gap-2 text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                    />
                                    启用
                                </label>
                            </InputGroup>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button
                                onClick={resetForm}
                                className="bg-slate-700 hover:bg-slate-600"
                            >
                                取消
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {loading ? '保存中...' : '保存'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 修改密码表单 */}
                {showPasswordForm && passwordAdminId && (
                    <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="text-md font-semibold text-slate-200 mb-4">修改密码</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="旧密码 *">
                                <TextInput
                                    type="password"
                                    value={passwordFormData.oldPassword}
                                    onChange={(e) => setPasswordFormData({ ...passwordFormData, oldPassword: e.target.value })}
                                    placeholder="请输入旧密码"
                                />
                            </InputGroup>
                            <InputGroup label="新密码 *">
                                <TextInput
                                    type="password"
                                    value={passwordFormData.newPassword}
                                    onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                                    placeholder="请输入新密码"
                                />
                            </InputGroup>
                            <InputGroup label="确认新密码 *">
                                <TextInput
                                    type="password"
                                    value={passwordFormData.confirmPassword}
                                    onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                                    placeholder="请再次输入新密码"
                                />
                            </InputGroup>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button
                                onClick={resetPasswordForm}
                                className="bg-slate-700 hover:bg-slate-600"
                            >
                                取消
                            </Button>
                            <Button
                                onClick={handleChangePassword}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {loading ? '修改中...' : '修改密码'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 管理员列表 */}
                {loading && !showCreateForm && !showPasswordForm ? (
                    <p className="text-slate-400 text-center py-8">加载中...</p>
                ) : admins.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">暂无管理员</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-3 text-left">ID</th>
                                    <th className="p-3 text-left">用户名</th>
                                    <th className="p-3 text-left">邮箱</th>
                                    <th className="p-3 text-left">角色</th>
                                    <th className="p-3 text-left">状态</th>
                                    <th className="p-3 text-left">最后登录</th>
                                    <th className="p-3 text-left">创建时间</th>
                                    <th className="p-3 text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-800/50">
                                        <td className="p-3 text-slate-300">{admin.id}</td>
                                        <td className="p-3 text-slate-300 font-medium">{admin.username}</td>
                                        <td className="p-3 text-slate-400">{admin.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                admin.role === 'SUPER_ADMIN' 
                                                    ? 'bg-purple-900/30 text-purple-300 border border-purple-700' 
                                                    : 'bg-blue-900/30 text-blue-300 border border-blue-700'
                                            }`}>
                                                {admin.role === 'SUPER_ADMIN' ? '超级管理员' : '普通管理员'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                admin.isActive 
                                                    ? 'bg-green-900/30 text-green-300 border border-green-700' 
                                                    : 'bg-red-900/30 text-red-300 border border-red-700'
                                            }`}>
                                                {admin.isActive ? '启用' : '禁用'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-400 text-sm">
                                            {admin.lastLogin 
                                                ? new Date(admin.lastLogin).toLocaleString('zh-CN')
                                                : '从未登录'}
                                        </td>
                                        <td className="p-3 text-slate-400 text-sm">
                                            {new Date(admin.createdAt).toLocaleString('zh-CN')}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(admin)}
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={() => handleOpenPasswordForm(admin.id)}
                                                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                                                >
                                                    改密
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin.id, admin.username)}
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
            </div>
        </div>
    );
};



