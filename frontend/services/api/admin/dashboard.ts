// Dashboard统计API
import { request } from '../base/request';

export interface DashboardStatistics {
  totalUsers: number;
  totalScenes: number;
  totalScripts: number;
  totalCharacters: number;
  trends: TrendData[];
}

export interface TrendData {
  date: string;
  users: number;
  scenes: number;
  scripts: number;
  characters: number;
}

/**
 * Dashboard统计API
 */
export const adminDashboardApi = {
  /**
   * 获取Dashboard统计数据
   * @param token - 管理员token
   * @param period - 时间段：day（默认，最近30天）, month（最近12个月）, year（最近1年）
   */
  getStatistics: (token: string, period: 'day' | 'month' | 'year' = 'day'): Promise<DashboardStatistics> => {
    return request<DashboardStatistics>(`/admin/dashboard/statistics?period=${period}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};




