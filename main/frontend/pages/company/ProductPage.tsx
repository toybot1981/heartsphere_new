import React from 'react';
import { SEOHead } from '../../components/company/SEOHead';
import { AnimatedPage, ScrollReveal } from '../../components/company/animations';
import { ProductShowcase } from '../../components/company/ProductShowcase';
import { ProductScreenshots } from '../../components/company/ProductScreenshots';

/**
 * 核心产品页面
 */
export const ProductPage: React.FC = () => {
  return (
    <AnimatedPage>
      <SEOHead
        title="核心产品 - 心域（HeartSphere）数字生命体交互系统"
        description="心域（HeartSphere）是一个数字生命体交互系统，提供AI对话、场景管理、角色扮演、剧本系统等核心功能，让用户与数字生命体进行深度交互。"
        keywords="心域,HeartSphere,数字生命体,AI对话,场景管理,角色扮演,剧本系统,AI产品"
      />
      <div className="py-12 pb-20">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              核心产品
            </h1>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              心域（HeartSphere）数字生命体交互系统
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <ProductShowcase />
        </ScrollReveal>
        <ScrollReveal delay={0.4}>
          <div className="mt-12">
            <ProductScreenshots />
          </div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
};
