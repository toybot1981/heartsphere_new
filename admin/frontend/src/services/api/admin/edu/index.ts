// 教育版管理API统一导出
export * from './students';
export * from './teachers';
export * from './content';
export * from './analytics';

import { adminEduStudentsApi } from './students';
import { adminEduTeachersApi } from './teachers';
import { adminEduContentApi } from './content';
import { adminEduAnalyticsApi } from './analytics';

/**
 * 教育版管理API
 */
export const adminEduApi = {
  students: adminEduStudentsApi,
  teachers: adminEduTeachersApi,
  content: adminEduContentApi,
  analytics: adminEduAnalyticsApi,
};
