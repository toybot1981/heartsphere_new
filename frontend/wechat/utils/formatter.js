// utils/formatter.js
// 格式化工具函数

// 格式化日期
export function formatDate(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 格式化时间
export function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

// 格式化日期时间
export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}




