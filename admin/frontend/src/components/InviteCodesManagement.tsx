import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Button } from "../components/Button";
import { InputGroup, TextInput } from './AdminUIComponents';
import { useAdminState } from '../contexts/AdminStateContext';
import { useAdminData } from '../hooks/useAdminData';
import { showAlert } from "../utils/dialog";

interface InviteCodesManagementProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const InviteCodesManagement: React.FC<InviteCodesManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const { inviteCodeFilter, setInviteCodeFilter } = useAdminState();
    const { inviteCodes, inviteCodeRequired, loadSystemData } = useAdminData(adminToken);
    const [generateQuantity, setGenerateQuantity] = useState(10);
    const [generateExpiresAt, setGenerateExpiresAt] = useState('');

    const handleGenerateCodes = async () => {
        if (!adminToken) return;
        if (!generateExpiresAt) {
            showAlert('请设置过期时间', '缺少参数', 'warning');
            return;
        }
        try {
            const codes = await adminApi.inviteCodes.generate(
                generateQuantity,
                new Date(generateExpiresAt).toISOString(),
                adminToken
            );
            showAlert(`成功生成 ${codes.length} 个邀请码`, '生成成功', 'success');
            await loadSystemData(adminToken);
        } catch (error: any) {
            showAlert('生成失败: ' + (error.message || '未知错误'), '生成失败', 'error');
        }
    };

    const handleToggleRequired = async (checked: boolean) => {
        if (!adminToken) return;
        try {
            await adminApi.config.setInviteCodeRequired(checked, adminToken);
            await loadSystemData(adminToken);
            showAlert('设置成功', '成功', 'success');
        } catch (error: any) {
            showAlert('设置失败: ' + (error.message || '未知错误'), '设置失败', 'error');
        }
    };

    const copyAllAvailable = () => {
        const availableCodes = inviteCodes
            .filter(code => !code.isUsed && new Date(code.expiresAt) >= new Date())
            .map(code => code.code)
            .join('\n');
        if (availableCodes) {
            navigator.clipboard.writeText(availableCodes).then(() => {
                showAlert('已复制所有可用邀请码到剪贴板', '复制成功', 'success');
            }).catch(() => {
                showAlert('复制失败，请手动复制', '复制失败', 'error');
            });
        } else {
            showAlert('没有可用的邀请码', '提示', 'warning');
        }
    };

    const exportCSV = () => {
        const csvContent = [
            ['邀请码', '状态', '使用用户', '使用时间', '过期时间', '创建时间'].join(','),
            ...inviteCodes.map(code => {
                const isExpired = new Date(code.expiresAt) < new Date();
                const status = code.isUsed ? '已使用' : isExpired ? '已过期' : '可用';
                return [
                    code.code,
                    status,
                    code.usedByUserId || '',
                    code.usedAt ? new Date(code.usedAt).toLocaleString('zh-CN') : '',
                    new Date(code.expiresAt).toLocaleString('zh-CN'),
                    new Date(code.createdAt).toLocaleString('zh-CN'),
                ].join(',');
            }),
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invite-codes-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportTXT = () => {
        const txtContent = inviteCodes
            .filter(code => !code.isUsed && new Date(code.expiresAt) >= new Date())
            .map(code => code.code)
            .join('\n');

        if (txtContent) {
            const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `invite-codes-${new Date().toISOString().split('T')[0]}.txt`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            showAlert('没有可用的邀请码', '提示', 'warning');
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            showAlert('已复制: ' + code, '复制成功', 'success');
        }).catch(() => {
            showAlert('复制失败，请手动复制: ' + code, '复制失败', 'error');
        });
    };

    const filteredCodes = inviteCodes && inviteCodes.length > 0 ? inviteCodes.filter((code) => {
        const isExpired = new Date(code.expiresAt) < new Date();
        if (inviteCodeFilter === 'all') return true;
        if (inviteCodeFilter === 'available') return !code.isUsed && !isExpired;
        if (inviteCodeFilter === 'used') return code.isUsed;
        if (inviteCodeFilter === 'expired') return !code.isUsed && isExpired;
        return true;
    }) : [];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* 邀请码开关 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-4">邀请码设置</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-300 mb-1">注册是否需要邀请码</p>
                        <p className="text-xs text-slate-500">开启后，用户注册时必须输入有效的邀请码</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={inviteCodeRequired}
                            onChange={(e) => handleToggleRequired(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            {/* 生成邀请码 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-4">生成邀请码</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <InputGroup label="生成数量">
                        <TextInput
                            type="number"
                            min="1"
                            max="100"
                            value={generateQuantity}
                            onChange={(e) => setGenerateQuantity(parseInt(e.target.value) || 10)}
                        />
                    </InputGroup>
                    <InputGroup label="过期时间">
                        <TextInput
                            type="datetime-local"
                            value={generateExpiresAt}
                            onChange={(e) => setGenerateExpiresAt(e.target.value)}
                        />
                    </InputGroup>
                    <div className="flex items-end">
                        <Button
                            onClick={handleGenerateCodes}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                            生成邀请码
                        </Button>
                    </div>
                </div>
            </div>

            {/* 邀请码列表 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-100">邀请码列表</h3>
                    <div className="flex gap-2 items-center">
                        {/* 筛选按钮 */}
                        <div className="flex gap-2 mr-4">
                            <button
                                onClick={() => setInviteCodeFilter('all')}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                    inviteCodeFilter === 'all'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                全部
                            </button>
                            <button
                                onClick={() => setInviteCodeFilter('available')}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                    inviteCodeFilter === 'available'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                可用
                            </button>
                            <button
                                onClick={() => setInviteCodeFilter('used')}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                    inviteCodeFilter === 'used'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                已使用
                            </button>
                            <button
                                onClick={() => setInviteCodeFilter('expired')}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                    inviteCodeFilter === 'expired'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                已过期
                            </button>
                        </div>
                        <Button onClick={copyAllAvailable} className="bg-indigo-600 hover:bg-indigo-700 text-sm">
                            复制所有可用
                        </Button>
                        <Button onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                            导出 CSV
                        </Button>
                        <Button onClick={exportTXT} className="bg-cyan-600 hover:bg-cyan-700 text-sm">
                            导出可用码 (TXT)
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">邀请码</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">状态</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">使用用户</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">使用时间</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">过期时间</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">创建时间</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-slate-500 py-8">
                                        {inviteCodes && inviteCodes.length > 0
                                            ? `没有${inviteCodeFilter === 'all' ? '' : inviteCodeFilter === 'available' ? '可用' : inviteCodeFilter === 'used' ? '已使用' : '已过期'}的邀请码`
                                            : '暂无邀请码，请先生成邀请码'}
                                    </td>
                                </tr>
                            ) : (
                                filteredCodes.map((code) => {
                                    const isExpired = new Date(code.expiresAt) < new Date();
                                    const status = code.isUsed ? '已使用' : isExpired ? '已过期' : '可用';
                                    const statusColor = code.isUsed ? 'text-red-400' : isExpired ? 'text-yellow-400' : 'text-green-400';
                                    return (
                                        <tr key={code.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <span>{code.code}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            navigator.clipboard.writeText(code.code).then(() => {
                                                                const btn = e.target as HTMLElement;
                                                                if (btn) {
                                                                    const originalText = btn.textContent;
                                                                    btn.textContent = '✓';
                                                                    btn.className = 'text-green-400 hover:text-green-300 text-xs';
                                                                    setTimeout(() => {
                                                                        btn.textContent = originalText;
                                                                        btn.className = 'text-slate-400 hover:text-slate-300 text-xs';
                                                                    }, 1000);
                                                                }
                                                            }).catch(() => {
                                                                showAlert('复制失败，请手动复制: ' + code.code, '复制失败', 'error');
                                                            });
                                                        }}
                                                        className="text-slate-400 hover:text-slate-300 text-xs"
                                                        title="复制邀请码"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                            </td>
                                            <td className={`py-3 px-4 ${statusColor} font-bold`}>{status}</td>
                                            <td className="py-3 px-4 text-slate-400">{code.usedByUserId || '-'}</td>
                                            <td className="py-3 px-4 text-slate-400">
                                                {code.usedAt ? new Date(code.usedAt).toLocaleString('zh-CN') : '-'}
                                            </td>
                                            <td className={`py-3 px-4 ${isExpired ? 'text-red-400' : 'text-slate-400'}`}>
                                                {new Date(code.expiresAt).toLocaleString('zh-CN')}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">
                                                {new Date(code.createdAt).toLocaleString('zh-CN')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => copyCode(code.code)}
                                                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
                                                >
                                                    复制
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


