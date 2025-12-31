/**
 * 成长仪表板组件
 * 整合成长统计和里程碑展示
 */

import React from 'react';
import { GrowthStatistics } from '../../services/growth-system/types/GrowthTypes';
import { GrowthStatisticsComponent } from './GrowthStatistics';
import { MilestoneDisplay } from './MilestoneDisplay';

interface GrowthDashboardProps {
  statistics: GrowthStatistics;
  className?: string;
}

export const GrowthDashboard: React.FC<GrowthDashboardProps> = ({
  statistics,
  className = '',
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* 成长统计 */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">成长统计</h2>
        <GrowthStatisticsComponent statistics={statistics} />
      </section>

      {/* 里程碑展示 */}
      <section>
        <MilestoneDisplay
          milestones={statistics.milestones}
          recentOnly={true}
          maxDisplay={8}
        />
      </section>
    </div>
  );
};



