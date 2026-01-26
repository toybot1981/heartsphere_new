import React from 'react';
import { FeatureCard } from './FeatureCard';

/**
 * 产品展示组件
 * 产品概述、核心功能模块介绍、使用场景说明
 */
export const ProductShowcase: React.FC = () => {
  const features = [
    {
      title: 'AI对话系统',
      description: '与数字生命体进行智能对话，支持多轮对话和上下文理解，提供自然流畅的交互体验',
      icon: '💬',
    },
    {
      title: '场景管理',
      description: '创建和管理不同的场景（时代切片），如"我的大学"、"赛博都市"等，构建你的数字世界',
      icon: '🌍',
    },
    {
      title: '角色扮演',
      description: '与场景中的数字生命体进行角色扮演和互动，每个角色都有独特的性格和记忆',
      icon: '🎭',
    },
    {
      title: '剧本系统',
      description: '创建和管理剧本，定义剧情事件和触发条件，体验丰富的剧情内容',
      icon: '📜',
    },
    {
      title: '插件系统',
      description: '可扩展的插件机制，支持功能扩展，满足个性化需求',
      icon: '🔌',
    },
    {
      title: '心域连接',
      description: '心域共享、快速连接、体验模式，与朋友分享你的数字世界',
      icon: '🔗',
    },
    {
      title: '跨时空信箱',
      description: '在不同场景之间发送和接收消息，实现跨场景的通信',
      icon: '📮',
    },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 
          className="text-3xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          产品概述
        </h2>
        <p 
          className="text-lg max-w-3xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          心域（HeartSphere）是一个数字生命体交互系统，用户可以创建和管理自己的数字世界。
          系统提供AI对话、场景管理、角色扮演、剧本系统等核心功能，让用户与数字生命体进行深度交互，
          创造属于自己的数字世界。
        </p>
      </div>

      <div>
        <h2 
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          核心功能模块
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      <div 
        className="rounded-lg p-8 border"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color-overlay)',
        }}
      >
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          使用场景
        </h2>
        <ul 
          className="space-y-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          <li className="flex items-start">
            <span 
              className="mr-3"
              style={{ color: 'var(--color-primary)' }}
            >
              •
            </span>
            <span>教育场景：创建历史人物角色，进行历史对话和学习</span>
          </li>
          <li className="flex items-start">
            <span 
              className="mr-3"
              style={{ color: 'var(--color-primary)' }}
            >
              •
            </span>
            <span>娱乐场景：创建喜欢的角色，进行角色扮演和剧情体验</span>
          </li>
          <li className="flex items-start">
            <span 
              className="mr-3"
              style={{ color: 'var(--color-primary)' }}
            >
              •
            </span>
            <span>创作场景：创建剧本和场景，进行内容创作和故事创作</span>
          </li>
          <li className="flex items-start">
            <span 
              className="mr-3"
              style={{ color: 'var(--color-primary)' }}
            >
              •
            </span>
            <span>社交场景：与朋友分享心域，体验不同的数字世界</span>
          </li>
        </ul>
      </div>

      <div className="text-center pt-8">
        <a
          href="http://heartsphere.cn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-8 py-4 rounded-lg font-semibold focus:outline-none transition-all hover:scale-105 shadow-lg"
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
          立即体验心域
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};
