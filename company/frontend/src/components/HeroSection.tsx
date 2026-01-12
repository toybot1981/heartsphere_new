import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from './animations';

/**
 * Hero区域组件
 * 公司名称和slogan、核心理念简要介绍、CTA按钮
 */
export const HeroSection: React.FC = () => {
  return (
    <div className="py-20 text-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
      {/* 科技感装饰元素 - 蓝色渐变 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
      </div>
      {/* 网格背景 - 蓝色调 */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      <div className="relative z-10">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          {...fadeIn}
        >
          <span className="text-neutral-900">
            泰安正心智能科技有限公司
          </span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-neutral-700 mb-4 max-w-3xl mx-auto"
          {...slideUp}
          transition={{ delay: 0.2 }}
        >
          专注于人工智能领域，致力于将技术与人文相结合
        </motion.p>
        <motion.p
          className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto"
          {...slideUp}
          transition={{ delay: 0.4 }}
        >
          "正心"来自《大学》八条目，连接内在修养与外在实践，创造有温度的数字世界
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          {...slideUp}
          transition={{ delay: 0.6 }}
        >
          <motion.a
            href="/company/about"
            className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
            whileHover={{ backgroundColor: '#2563EB' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            了解更多
          </motion.a>
          <motion.a
            href="http://heartsphere.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border-2 border-primary-500 text-primary-500 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 relative overflow-hidden group"
            whileHover={{ backgroundColor: '#EFF6FF', borderColor: '#2563EB', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              体验产品
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};
