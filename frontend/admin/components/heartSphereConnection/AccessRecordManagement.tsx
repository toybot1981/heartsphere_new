import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import { showAlert } from '../../../utils/dialog';
import { Button } from '../../../components/Button';
import { InputGroup } from '../AdminUIComponents';
import type { AccessRecordDTO } from '../../../services/api/admin/heartSphereConnection';

interface AccessRecordManagementProps {
  adminToken: string | null;
  onRefresh?: () => void;
}

export const AccessRecordManagement: React.FC<AccessRecordManagementProps> = ({
  adminToken,
  onRefresh
}) => {
  const [records, setRecords] = useState<AccessRecordDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const loadRecords = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.heartSphereConnection.getAccessRecords(adminToken, {
        page: currentPage,
        size: pageSize,
      });
      setRecords(response.content);
      setTotal(response.total);
    } catch (error: any) {
      console.error('加载访问记录失败:', error);
      showAlert('加载访问记录失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [currentPage, adminToken]);

  const handleExport = async () => {
    if (!adminToken) return;
    try {
      const data = await adminApi.heartSphereConnection.exportAccessRecords(adminToken);
      // 转换为CSV并下载
      const csv = [
        ['访问者', '被访问者', '访问类型', '访问时间', '访问时长(秒)', '对话轮数'].join(','),
        ...data.map(r => [
          r.visitorUsername || r.visitorId,
          r.ownerUsername || r.ownerId,
          r.accessType,
          r.accessTime || '',
          r.durationSeconds || 0,
          r.conversationRounds || 0,
        ].join(','))
      ].join('\n');
      
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `访问记录_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      showAlert('导出成功', '操作成功', 'success');
    } catch (error: any) {
      showAlert('导出失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">访问记录管理</div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="primary">
            导出数据
          </Button>
          <Button onClick={loadRecords} disabled={loading}>
            {loading ? '加载中...' : '刷新'}
          </Button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">访问者</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">被访问者</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">访问类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">访问时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">访问时长</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">对话轮数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  {loading ? '加载中...' : '暂无访问记录'}
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-sm text-slate-300">{record.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    <div>
                      <div className="font-medium">{record.visitorUsername || record.visitorId}</div>
                      {record.visitorEmail && (
                        <div className="text-xs text-slate-400">{record.visitorEmail}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    <div>
                      <div className="font-medium">{record.ownerUsername || record.ownerId}</div>
                      {record.ownerEmail && (
                        <div className="text-xs text-slate-400">{record.ownerEmail}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    <span className={`px-2 py-1 rounded text-xs ${
                      record.accessType === 'EXPERIENCE' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {record.accessType === 'EXPERIENCE' ? '体验模式' : '正常访问'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {record.accessTime ? new Date(record.accessTime).toLocaleString('zh-CN') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {record.durationSeconds ? `${Math.floor(record.durationSeconds / 60)}分钟` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{record.conversationRounds || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {total > pageSize && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-400">
            共 {total} 条记录，第 {currentPage + 1} 页，共 {Math.ceil(total / pageSize)} 页
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              上一页
            </Button>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(total / pageSize) - 1}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};




