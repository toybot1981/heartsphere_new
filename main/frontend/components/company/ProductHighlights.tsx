import React from 'react';

/**
 * 产品亮点组件
 * 心域产品的核心功能亮点，链接到核心产品页面
 */
export const ProductHighlights: React.FC = () => {
  const features = [
    {
      title: 'AI对话系统',
      description: '与数字生命体进行智能对话，支持多轮对话和上下文理解',
      icon: '💬',
    },
    {
      title: '场景管理',
      description: '创建和管理不同的场景（时代切片），构建你的数字世界',
      icon: '🌍',
    },
    {
      title: '角色扮演',
      description: '与场景中的数字生命体进行角色扮演和互动',
      icon: '🎭',
    },
    {
      title: '剧本系统',
      description: '创建和管理剧本，定义剧情事件和触发条件',
      icon: '📜',
    },
  ];

  return (
    <div>
      <h2 
        className="text-3xl font-bold mb-8 text-center"
        style={{ color: 'var(--text-primary)' }}
      >
        核心产品：心域（HeartSphere）
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-lg p-6 border transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color-overlay)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
            }}
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {feature.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      <div className="text-center mt-8 space-x-4">
        <a
          href="/company/product"
          className="inline-flex items-center px-6 py-3 border-2 rounded-lg font-semibold focus:outline-none transition-colors"
          style={{
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          查看完整产品介绍
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
        <a
          href="http://heartsphere.cn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 rounded-lg font-semibold focus:outline-none transition-all hover:scale-105 shadow-lg"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }}
        >
          立即体验
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};
