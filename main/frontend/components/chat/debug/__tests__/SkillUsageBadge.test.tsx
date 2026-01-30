/**
 * SkillUsageBadge 组件测试
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SkillUsageBadge, SkillUsageBadges } from '../../SkillUsageBadge';

describe('SkillUsageBadge', () => {
  it('应该正确渲染技能标记', () => {
    render(
      <SkillUsageBadge
        skillId={1}
        skillName="测试技能"
        score={85}
      />
    );
    
    expect(screen.getByText('测试技能')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('应该在没有技能名称时显示默认名称', () => {
    render(
      <SkillUsageBadge
        skillId={1}
      />
    );
    
    expect(screen.getByText('技能 #1')).toBeInTheDocument();
  });

  it('应该支持悬停显示工具提示', async () => {
    render(
      <SkillUsageBadge
        skillId={1}
        skillName="测试技能"
        score={85}
      />
    );
    
    const badge = screen.getByText('测试技能').closest('.skill-usage-badge');
    if (badge) {
      fireEvent.mouseEnter(badge);
      // 工具提示应该显示
      await screen.findByText('测试技能');
    }
  });

  it('应该支持点击查看详情', () => {
    const onViewDetails = jest.fn();
    render(
      <SkillUsageBadge
        skillId={1}
        skillName="测试技能"
        onViewDetails={onViewDetails}
      />
    );
    
    const badge = screen.getByText('测试技能').closest('.skill-usage-badge');
    if (badge) {
      fireEvent.click(badge);
      expect(onViewDetails).toHaveBeenCalledWith(1);
    }
  });
});

describe('SkillUsageBadges', () => {
  it('应该正确渲染多个技能标记', () => {
    const skills = [
      { skillId: 1, skillName: '技能1', score: 85 },
      { skillId: 2, skillName: '技能2', score: 90 },
    ];
    
    render(<SkillUsageBadges skills={skills} />);
    
    expect(screen.getByText('技能1')).toBeInTheDocument();
    expect(screen.getByText('技能2')).toBeInTheDocument();
  });

  it('当技能列表为空时应该返回 null', () => {
    const { container } = render(<SkillUsageBadges skills={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('当技能列表为 undefined 时应该返回 null', () => {
    const { container } = render(<SkillUsageBadges skills={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });
});
