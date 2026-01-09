/**
 * 功能卡片组件测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeatureCard } from '../../../components/company/FeatureCard';

describe('FeatureCard', () => {
  const mockFeature = {
    title: 'AI对话系统',
    description: '与数字生命体进行智能对话',
    icon: '💬',
  };

  it('应该渲染功能卡片', () => {
    render(<FeatureCard {...mockFeature} />);

    expect(screen.getByText('AI对话系统')).toBeInTheDocument();
    expect(screen.getByText('与数字生命体进行智能对话')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  it('应该显示所有必需的信息', () => {
    render(<FeatureCard {...mockFeature} />);

    expect(screen.getByRole('heading', { name: 'AI对话系统' })).toBeInTheDocument();
    expect(screen.getByText('与数字生命体进行智能对话')).toBeInTheDocument();
  });
});
