import React, { useState, useEffect } from 'react';
import { adminAutoFixApi } from '../../services/api/admin';
import type { AutoFixRecord } from '../../services/api/admin/autoFix';

/**
 * 自动修复管理组件
 */
export const AutoFixManager: React.FC<{ executionId?: number }> = ({ executionId }) => {
    const [token, setToken] = useState<string | null>(null);
    
    useEffect(() => {
        const storedToken = localStorage.getItem('admin_token');
        setToken(storedToken);
    }, []);
    const [fixRecords, setFixRecords] = useState<AutoFixRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AutoFixRecord | null>(null);

    useEffect(() => {
        if (token) {
            loadFixRecords();
        }
    }, [token, executionId]);

    const loadFixRecords = async () => {
        if (!token) return;
        
        setLoading(true);
        try {
            const records = await adminAutoFixApi.getFixRecords(token, executionId);
            setFixRecords(records);
        } catch (error) {
            console.error('加载修复记录失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDetectAndFix = async () => {
        if (!token || !executionId) return;
        
        setLoading(true);
        try {
            const records = await adminAutoFixApi.detectAndFix(token, executionId);
            setFixRecords(records);
            alert(`检测到 ${records.length} 个问题，已生成修复方案`);
        } catch (error) {
            console.error('检测和修复失败:', error);
            alert('检测和修复失败');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!token) return;
        
        try {
            // TODO: 获取当前用户ID
            const approvedBy = 1; // 临时值
            await adminAutoFixApi.approveFix(token, id, approvedBy);
            alert('修复已批准');
            loadFixRecords();
        } catch (error) {
            console.error('批准失败:', error);
            alert('批准失败');
        }
    };

    const handleReject = async (id: number) => {
        if (!token) return;
        
        try {
            await adminAutoFixApi.rejectFix(token, id);
            alert('修复已拒绝');
            loadFixRecords();
        } catch (error) {
            console.error('拒绝失败:', error);
            alert('拒绝失败');
        }
    };

    const handleVerify = async (id: number) => {
        if (!token) return;
        
        try {
            await adminAutoFixApi.verifyFix(token, id);
            alert('修复验证完成');
            loadFixRecords();
        } catch (error) {
            console.error('验证失败:', error);
            alert('验证失败');
        }
    };

    const handleRollback = async (id: number) => {
        if (!token) return;
        
        if (!confirm('确定要回滚此修复吗？')) return;
        
        try {
            await adminAutoFixApi.rollbackFix(token, id);
            alert('修复已回滚');
            loadFixRecords();
        } catch (error) {
            console.error('回滚失败:', error);
            alert('回滚失败');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VERIFIED':
            case 'APPLIED':
                return 'green';
            case 'FAILED':
            case 'REJECTED':
                return 'red';
            case 'PROPOSED':
            case 'PENDING':
                return 'orange';
            default:
                return 'gray';
        }
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'LOW':
                return 'green';
            case 'MEDIUM':
                return 'orange';
            case 'HIGH':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>自动修复管理</h2>
                {executionId && (
                    <button
                        onClick={handleDetectAndFix}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? '处理中...' : '检测并修复'}
                    </button>
                )}
            </div>

            {loading && fixRecords.length === 0 ? (
                <div>加载中...</div>
            ) : fixRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    暂无修复记录
                </div>
            ) : (
                <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>问题类型</th>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>问题描述</th>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>风险级别</th>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>状态</th>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fixRecords.map((record) => (
                                <tr key={record.id}>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{record.id}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{record.problemType}</td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                        {record.problemDescription}
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                        <span style={{ color: getRiskLevelColor(record.riskLevel) }}>
                                            {record.riskLevel}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                        <span style={{ color: getStatusColor(record.status) }}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {record.status === 'PROPOSED' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(record.id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#52c41a',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        批准
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(record.id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#ff4d4f',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        拒绝
                                                    </button>
                                                </>
                                            )}
                                            {record.status === 'APPLIED' && (
                                                <button
                                                    onClick={() => handleVerify(record.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#1890ff',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    验证
                                                </button>
                                            )}
                                            {(record.status === 'APPLIED' || record.status === 'VERIFIED') && (
                                                <button
                                                    onClick={() => handleRollback(record.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#ff9800',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    回滚
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedRecord(record)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#722ed1',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                详情
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedRecord && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setSelectedRecord(null)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            overflow: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>修复记录详情</h3>
                        <div style={{ marginTop: '16px' }}>
                            <p><strong>问题类型:</strong> {selectedRecord.problemType}</p>
                            <p><strong>问题描述:</strong> {selectedRecord.problemDescription}</p>
                            <p><strong>风险级别:</strong> {selectedRecord.riskLevel}</p>
                            <p><strong>状态:</strong> {selectedRecord.status}</p>
                            {selectedRecord.fixSolution && (
                                <p><strong>修复方案:</strong> {selectedRecord.fixSolution}</p>
                            )}
                            {selectedRecord.verificationResult && (
                                <p><strong>验证结果:</strong> {selectedRecord.verificationResult}</p>
                            )}
                            {selectedRecord.fixEffective !== undefined && (
                                <p><strong>修复有效:</strong> {selectedRecord.fixEffective ? '是' : '否'}</p>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedRecord(null)}
                            style={{
                                marginTop: '16px',
                                padding: '8px 16px',
                                backgroundColor: '#1890ff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            关闭
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
