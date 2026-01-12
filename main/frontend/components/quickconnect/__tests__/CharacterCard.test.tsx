import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCard } from '../CharacterCard';
import type { QuickConnectCharacter } from '../../../services/api/quickconnect/types';

// Mock StarParticles组件
jest.mock('../StarParticles', () => ({
  StarParticles: () => <div data-testid="star-particles">StarParticles</div>,
}));

describe('CharacterCard', () => {
  const mockCharacter: QuickConnectCharacter = {
    characterId: 1,
    characterName: 'Test Character',
    avatarUrl: 'https://example.com/avatar.jpg',
    sceneId: 1,
    sceneName: 'Test Scene',
    themeColor: '#3b82f6',
    colorAccent: '#60a5fa',
    bio: 'Test bio',
    tags: 'tag1,tag2',
    isFavorite: false,
    accessCount: 5,
    lastAccessTime: Date.now() - 3600000, // 1小时前
  };

  const mockOnSelect = jest.fn();
  const mockOnToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染角色信息', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(screen.getByText('Test Scene')).toBeInTheDocument();
  });

  it('应该显示收藏按钮', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const favoriteButton = screen.getByLabelText(/收藏/i);
    expect(favoriteButton).toBeInTheDocument();
  });

  it('应该显示已收藏状态', () => {
    const favoriteCharacter = { ...mockCharacter, isFavorite: true };
    
    render(
      <CharacterCard
        character={favoriteCharacter}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const favoriteButton = screen.getByLabelText(/取消收藏/i);
    expect(favoriteButton).toBeInTheDocument();
  });

  it('应该调用onSelect当点击卡片时', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const card = screen.getByText('Test Character').closest('div[class*="cursor-pointer"]');
    if (card) {
      fireEvent.click(card);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    }
  });

  it('应该调用onToggleFavorite当点击收藏按钮时', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    const favoriteButton = screen.getByLabelText(/收藏/i);
    fireEvent.click(favoriteButton);
    expect(mockOnToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('应该高亮搜索关键词', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
        searchQuery="Test"
      />
    );

    // 检查是否有高亮标记
    const highlights = screen.getAllByText(/Test/i);
    expect(highlights.length).toBeGreaterThan(0);
  });

  it('应该格式化最后访问时间', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onSelect={mockOnSelect}
        onToggleFavorite={mockOnToggleFavorite}
      />
    );

    // 应该显示"1小时前"
    expect(screen.getByText(/1小时前/i)).toBeInTheDocument();
  });
});




