/**
 * 会话导出工具
 */

export interface SessionExportData {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  messages?: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  tasks?: Array<{
    taskId: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
}

/**
 * 导出会话为 JSON 格式
 */
export const exportSessionAsJSON = (data: SessionExportData): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.title || 'session'}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 导出会话为 CSV 格式
 */
export const exportSessionAsCSV = (data: SessionExportData): void => {
  const rows: string[] = [];
  
  // 会话信息
  rows.push('会话信息');
  rows.push(`会话ID,${data.sessionId}`);
  rows.push(`标题,${data.title || '未命名'}`);
  rows.push(`创建时间,${data.createdAt}`);
  rows.push(`更新时间,${data.updatedAt || ''}`);
  rows.push('');
  
  // 消息列表
  if (data.messages && data.messages.length > 0) {
    rows.push('消息列表');
    rows.push('角色,内容,时间');
    data.messages.forEach((msg) => {
      const content = msg.content.replace(/"/g, '""'); // 转义 CSV 中的引号
      rows.push(`"${msg.role}","${content}","${msg.timestamp}"`);
    });
    rows.push('');
  }
  
  // 任务列表
  if (data.tasks && data.tasks.length > 0) {
    rows.push('任务列表');
    rows.push('任务ID,描述,状态,创建时间');
    data.tasks.forEach((task) => {
      const description = task.description.replace(/"/g, '""');
      rows.push(`"${task.taskId}","${description}","${task.status}","${task.createdAt}"`);
    });
  }
  
  const csvString = rows.join('\n');
  const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.title || 'session'}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 导出会话（自动选择格式）
 */
export const exportSession = (data: SessionExportData, format: 'json' | 'csv' = 'json'): void => {
  if (format === 'json') {
    exportSessionAsJSON(data);
  } else {
    exportSessionAsCSV(data);
  }
};
