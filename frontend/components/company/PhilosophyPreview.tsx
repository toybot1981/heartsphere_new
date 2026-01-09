import React from 'react';

/**
 * 核心理念预览组件
 * 正心理念的简要介绍，链接到关于我们页面
 */
export const PhilosophyPreview: React.FC = () => {
  return (
    <div className="bg-neutral-50 rounded-lg p-8 border border-neutral-200">
      <h2 className="text-3xl font-bold text-neutral-900 mb-4">正心理念</h2>
      <p className="text-neutral-700 text-lg mb-6 leading-relaxed">
        "正心"来自《大学》八条目："格物、致知、诚意、正心、修身、齐家、治国、平天下"。
        正心在其中起到承上启下的作用，连接内在修养（格物、致知、诚意）与外在实践（修身、齐家、治国、平天下）。
      </p>
      <p className="text-neutral-600 mb-6">
        在人工智能领域，我们追求技术与人文的平衡，用"正心"的理念指导产品的设计与开发，
        创造既有科技感又有温度的数字世界。
      </p>
      <a
        href="/company/about"
        className="inline-flex items-center text-primary-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded transition-colors font-medium"
      >
        了解更多
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
};
