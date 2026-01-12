// 教育版数据分析API
import { request } from "../../request";

/**
 * 总体统计响应
 */
export interface OverviewStatistics {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalContent: number;
  activeUsers: number;
}

/**
 * 用户增长数据
 */
export interface UserGrowthData {
  growthData: Record<string, number>; // 日期 -> 新增用户数
  totalGrowth: number;
}

/**
 * 学习活动数据
 */
export interface LearningActivitiesData {
  activities: Record<string, number>; // 活动类型 -> 数量
  totalActivities: number;
}

/**
 * 作业完成情况数据
 */
export interface HomeworkCompletionData {
  completionRate: number; // 完成率（0-1）
  totalHomework: number;
  completedHomework: number;
  pendingHomework: number;
}

/**
 * 教育版数据分析API
 */
export const adminEduAnalyticsApi = {
  /**
   * 获取教育版总体统计
   */
  getOverview: (token: string): Promise<OverviewStatistics> => {
    return request<OverviewStatistics>(`/edu/analytics/overview`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取用户增长趋势
   * @param token - 管理员token
   * @param startDate - 开始日期（YYYY-MM-DD）
   * @param endDate - 结束日期（YYYY-MM-DD）
   */
  getUserGrowth: (
    token: string,
    startDate: string,
    endDate: string
  ): Promise<UserGrowthData> => {
    const url = `/edu/analytics/user-growth?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    return request<UserGrowthData>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取学习活动统计
   * @param token - 管理员token
   * @param startDate - 开始日期（YYYY-MM-DD）
   * @param endDate - 结束日期（YYYY-MM-DD）
   */
  getLearningActivities: (
    token: string,
    startDate: string,
    endDate: string
  ): Promise<LearningActivitiesData> => {
    const url = `/edu/analytics/learning-activities?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    return request<LearningActivitiesData>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取作业完成情况统计
   * @param token - 管理员token
   * @param startDate - 开始日期（YYYY-MM-DD）
   * @param endDate - 结束日期（YYYY-MM-DD）
   */
  getHomeworkCompletion: (
    token: string,
    startDate: string,
    endDate: string
  ): Promise<HomeworkCompletionData> => {
    const url = `/edu/analytics/homework-completion?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    return request<HomeworkCompletionData>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
