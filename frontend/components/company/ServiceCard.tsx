import React from 'react';
import { motion } from 'framer-motion';
import { hoverLift } from './animations';

interface ServiceCardProps {
  title: string;
  description: string;
  scenarios: string[];
  icon?: string;
}

/**
 * 服务卡片组件
 * 单个AI服务的展示卡片，包含服务类型、描述、应用场景
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, scenarios, icon = '🤖' }) => {
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
      <p className="text-neutral-600 mb-4">{description}</p>
      <div className="border-t border-neutral-200 pt-4">
        <h4 className="text-sm font-semibold text-primary-500 mb-2">应用场景：</h4>
        <ul className="space-y-1">
          {scenarios.map((scenario, index) => (
            <motion.li
              key={index}
              className="text-sm text-neutral-600 flex items-start"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-primary-500 mr-2">•</span>
              <span>{scenario}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};
