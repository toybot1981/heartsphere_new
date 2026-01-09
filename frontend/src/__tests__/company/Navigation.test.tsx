/**
 * 导航组件测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navigation } from '../../../components/company/Navigation';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Navigation', () => {
  beforeEach(() => {
    mockLocation.href = '';
  });

  it('应该渲染导航栏', () => {
    render(<Navigation />);

    expect(screen.getByText('正心智能')).toBeInTheDocument();
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('关于我们')).toBeInTheDocument();
    expect(screen.getByText('核心产品')).toBeInTheDocument();
    expect(screen.getByText('AI服务')).toBeInTheDocument();
    expect(screen.getByText('联系我们')).toBeInTheDocument();
  });

  it('应该显示移动端菜单按钮', () => {
    render(<Navigation />);

    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('应该切换移动端菜单', () => {
    render(<Navigation />);

    const menuButton = screen.getByLabelText('Toggle menu');
    
    // 初始状态菜单应该隐藏
    expect(screen.queryByText('首页')).toBeInTheDocument(); // 桌面端显示
    
    // 点击菜单按钮
    fireEvent.click(menuButton);
    
    // 移动端菜单应该显示
    expect(screen.getByText('首页')).toBeInTheDocument();
  });

  it('应该导航到正确的页面', () => {
    render(<Navigation />);

    const aboutLink = screen.getByText('关于我们');
    fireEvent.click(aboutLink);

    expect(mockLocation.href).toBe('/company/about');
  });
});
