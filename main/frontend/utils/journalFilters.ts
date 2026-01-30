/**
 * 日志筛选工具函数
 * 用于日期范围筛选、排序、分组等
 */

import { JournalEntry } from '../types';

export type DateRange = 'today' | 'week' | 'month' | 'custom' | null;

export interface DateRangeFilter {
  range: DateRange;
  customStart?: Date;
  customEnd?: Date;
}

/**
 * 按日期范围筛选日志条目
 */
export function filterEntriesByDateRange(
  entries: JournalEntry[],
  filter: DateRangeFilter
): JournalEntry[] {
  if (!filter.range) return entries;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1); // 今天 23:59:59

  switch (filter.range) {
    case 'today':
      startDate = today;
      break;
    case 'week':
      // 本周一（周一为一周开始）
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 周日算作上周
      startDate = new Date(today);
      startDate.setDate(today.getDate() + mondayOffset);
      break;
    case 'month':
      // 本月第一天
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'custom':
      if (filter.customStart && filter.customEnd) {
        startDate = new Date(filter.customStart);
        endDate = new Date(filter.customEnd);
        endDate.setHours(23, 59, 59, 999);
      } else {
        return entries; // 自定义但未设置日期，返回全部
      }
      break;
    default:
      return entries;
  }

  return entries.filter(entry => {
    const entryDate = new Date(entry.entryDate || entry.timestamp);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * 按日期分组日志条目
 */
export type GroupBy = 'day' | 'week' | null;

export interface GroupedEntries {
  [key: string]: JournalEntry[];
}

export function groupEntriesByDate(
  entries: JournalEntry[],
  groupBy: GroupBy
): GroupedEntries {
  if (!groupBy) {
    return { all: entries };
  }

  const grouped: GroupedEntries = {};

  entries.forEach(entry => {
    const entryDate = new Date(entry.entryDate || entry.timestamp);
    let key: string;

    if (groupBy === 'day') {
      key = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (groupBy === 'week') {
      // 计算周数（ISO 周）
      const year = entryDate.getFullYear();
      const d = new Date(Date.UTC(year, 0, 1));
      const dayNum = entryDate.getDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const weekNum = Math.ceil((((entryDate.getTime() - d.getTime()) / 86400000) + 1) / 7);
      key = `${year}-W${weekNum.toString().padStart(2, '0')}`;
    } else {
      key = 'all';
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(entry);
  });

  return grouped;
}

/**
 * 排序日志条目
 */
export type SortBy = 'date' | 'updated';

export function sortEntries(
  entries: JournalEntry[],
  sortBy: SortBy
): JournalEntry[] {
  const sorted = [...entries];
  
  if (sortBy === 'date') {
    sorted.sort((a, b) => {
      const dateA = new Date(a.entryDate || a.timestamp).getTime();
      const dateB = new Date(b.entryDate || b.timestamp).getTime();
      return dateB - dateA; // 倒序
    });
  } else if (sortBy === 'updated') {
    sorted.sort((a, b) => {
      const updatedA = new Date(a.updatedAt || a.timestamp).getTime();
      const updatedB = new Date(b.updatedAt || b.timestamp).getTime();
      return updatedB - updatedA; // 倒序
    });
  }
  
  return sorted;
}

/**
 * 获取今天的日期字符串（ISO 格式，仅日期部分）
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
