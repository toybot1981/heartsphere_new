import React from 'react';
import { motion } from 'framer-motion';
import { hoverLift } from './animations';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

/**
 * 功能卡片组件
 * 单个功能模块的展示卡片，包含图标、标题、描述
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <motion.div
      className="bg-white rounded-lg p-6 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
      whileHover={{ borderColor: '#60A5FA', backgroundColor: '#F9FAFB' }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="text-4xl mb-4"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </motion.div>
  );
};
