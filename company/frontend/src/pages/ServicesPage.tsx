import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { AnimatedPage, ScrollReveal } from '../components/animations';
import { ServiceList } from '../components/ServiceList';

/**
 * AI服务页面
 */
export const ServicesPage: React.FC = () => {
  return (
    <AnimatedPage>
      <SEOHead
        title="AI服务 - 人工智能解决方案"
        description="正心智能提供专业的AI服务，包括AI对话系统开发、自然语言处理、计算机视觉、AI模型定制、智能推荐系统等。"
        keywords="AI服务,人工智能,自然语言处理,计算机视觉,AI模型定制,智能推荐,AI开发"
      />
      <div className="py-12">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              AI服务
            </h1>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              我们在人工智能领域的专业服务
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <ServiceList />
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
};
