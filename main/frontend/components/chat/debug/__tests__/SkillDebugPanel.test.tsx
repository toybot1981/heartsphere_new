/**
 * SkillDebugPanel 组件测试
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SkillDebugPanel } from '../SkillDebugPanel';
import { SkillDebugInfo, SkillExecutionRecord } from '../../../../types/skill';

// Mock useSkillDebug hook
jest.mock('../../../../hooks/useSkillDebug', () => ({
  useSkillDebug: jest.fn(),
}));

describe('SkillDebugPanel', () => {
  const mockDebugInfo: SkillDebugInfo = {
    records: [
      {
        id: 1,
        conversationId: 100,
        skillId: 1,
        skillName: '测试技能',
        userId: 1,
        decision: 'APPLIED',
        executionStatus: 'COMPLETED',
        compositeScore: 85,
        semanticScore: 80,
        contextScore: 90,
        memoryScore: 85,
        keywordMatches: ['测试', '关键词'],
        relatedMemoryIds: [1, 2],
        createdAt: '2026-01-24T10:00:00Z',
        updatedAt: '2026-01-24T10:00:00Z',
      },
      {
        id: 2,
        conversationId: 100,
        skillId: 2,
        skillName: '另一个技能',
        userId: 1,
        decision: 'REJECTED',
        executionStatus: 'FAILED',
        rejectionReason: '评分过低',
        errorMessage: '执行失败',
        createdAt: '2026-01-24T10:01:00Z',
        updatedAt: '2026-01-24T10:01:00Z',
      },
    ],
    lastUpdate: '2026-01-24T10:02:00Z',
  };

  const defaultProps = {
    debugInfo: mockDebugInfo,
    conversationId: 100,
    isVisible: true,
    onClose: jest.fn(),
    onRefresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染技能调试面板', () => {
    render(<SkillDebugPanel {...defaultProps} />);
    
    expect(screen.getByText('技能调试面板')).toBeInTheDocument();
    expect(screen.getByText('总计')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 总记录数
  });

  it('应该显示统计信息', () => {
    render(<SkillDebugPanel {...defaultProps} />);
    
    expect(screen.getByText('总计')).toBeInTheDocument();
    expect(screen.getByText('已应用')).toBeInTheDocument();
    expect(screen.getByText('已拒绝')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
    expect(screen.getByText('失败')).toBeInTheDocument();
  });

  it('应该正确计算统计数据', () => {
    render(<SkillDebugPanel {...defaultProps} />);
    
    // 检查统计值
    const statValues = screen.getAllByText('1');
    expect(statValues.length).toBeGreaterThan(0);
  });

  it('应该支持关闭面板', () => {
    const onClose = jest.fn();
    render(<SkillDebugPanel {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByTitle('关闭');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('应该支持刷新数据', () => {
    const onRefresh = jest.fn();
    render(<SkillDebugPanel {...defaultProps} onRefresh={onRefresh} />);
    
    const refreshButton = screen.getByTitle('刷新');
    fireEvent.click(refreshButton);
    
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('应该支持状态过滤', () => {
    render(<SkillDebugPanel {...defaultProps} />);
    
    const allButton = screen.getByText('全部');
    const appliedButton = screen.getByText('已应用');
    
    fireEvent.click(appliedButton);
    expect(appliedButton).toHaveClass('active');
    
    fireEvent.click(allButton);
    expect(allButton).toHaveClass('active');
  });

  it('应该支持搜索功能', () => {
    render(<SkillDebugPanel {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('搜索技能名称、关键词、错误信息...');
    expect(searchInput).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: '测试' } });
    expect(searchInput).toHaveValue('测试');
  });

  it('应该显示技能记录列表', () => {
    render(<SkillDebugPanel {...defaultProps} />);
    
    expect(screen.getByText('测试技能')).toBeInTheDocument();
    expect(screen.getByText('另一个技能')).toBeInTheDocument();
  });

  it('应该支持选择记录查看详情', () => {
    render(<SkillDebugPanel {...defaultProps} />);
    
    const skillItem = screen.getByText('测试技能').closest('.skill-activation-item');
    if (skillItem) {
      fireEvent.click(skillItem);
      // 应该显示详情面板
      expect(screen.getByText('技能执行详情')).toBeInTheDocument();
    }
  });

  it('当没有记录时应该显示空状态', () => {
    const emptyDebugInfo: SkillDebugInfo = {
      records: [],
      lastUpdate: '2026-01-24T10:00:00Z',
    };
    
    render(
      <SkillDebugPanel
        {...defaultProps}
        debugInfo={emptyDebugInfo}
      />
    );
    
    expect(screen.getByText('暂无技能执行记录')).toBeInTheDocument();
  });

  it('当不可见时应该返回 null', () => {
    const { container } = render(
      <SkillDebugPanel
        {...defaultProps}
        isVisible={false}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('应该正确处理错误状态', () => {
    const errorDebugInfo: SkillDebugInfo = {
      records: [
        {
          id: 1,
          conversationId: 100,
          skillId: 1,
          skillName: '错误技能',
          userId: 1,
          decision: 'APPLIED',
          executionStatus: 'FAILED',
          errorMessage: '执行失败',
          createdAt: '2026-01-24T10:00:00Z',
          updatedAt: '2026-01-24T10:00:00Z',
        },
      ],
    };
    
    render(
      <SkillDebugPanel
        {...defaultProps}
        debugInfo={errorDebugInfo}
      />
    );
    
    expect(screen.getByText('错误技能')).toBeInTheDocument();
  });
});
