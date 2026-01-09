import React from 'react';
import { SEOHead } from '../../components/company/SEOHead';
import { AnimatedPage, ScrollReveal } from '../../components/company/animations';
import { ContactForm } from '../../components/company/ContactForm';

/**
 * 联系我们页面
 */
export const ContactPage: React.FC = () => {
  return (
    <AnimatedPage>
      <SEOHead
        title="联系我们 - 业务咨询"
        description="联系我们获取更多关于心域（HeartSphere）产品和AI服务的信息。我们期待与您的合作。"
        keywords="联系我们,业务咨询,正心智能,合作"
      />
      <div className="py-12">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              联系我们
            </h1>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              我们期待与您的合作
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <ContactForm />
          </div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
};
