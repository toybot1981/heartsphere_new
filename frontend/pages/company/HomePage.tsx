import React from 'react';
import { SEOHead } from '../../components/company/SEOHead';
import { AnimatedPage, ScrollReveal } from '../../components/company/animations';
import { HeroSection } from '../../components/company/HeroSection';
import { PhilosophyVisualization } from '../../components/company/PhilosophyVisualization';
import { PhilosophySection } from '../../components/company/PhilosophySection';
import { ProductHighlights } from '../../components/company/ProductHighlights';

/**
 * 首页组件
 */
export const HomePage: React.FC = () => {
  return (
    <AnimatedPage>
      <SEOHead
        title="首页 - 泰安正心智能科技有限公司"
        description="泰安正心智能科技有限公司专注于人工智能领域，核心产品心域（HeartSphere）是一个数字生命体交互系统。正心理念来自《大学》八条目，连接内在修养与外在实践。"
        keywords="正心智能,心域,HeartSphere,数字生命体,AI对话,人工智能,泰安"
      />
      <div className="py-8 space-y-16">
        <HeroSection />
        <ScrollReveal delay={0.2}>
          <PhilosophyVisualization />
        </ScrollReveal>
        <ScrollReveal delay={0.4}>
          <PhilosophySection />
        </ScrollReveal>
        <ScrollReveal delay={0.6}>
          <ProductHighlights />
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
};
