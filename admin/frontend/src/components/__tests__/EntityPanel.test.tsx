import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { EntityPanel } from '../EntityPanel';
import { adminEntityApi } from '../../../services/api/admin/entity';

// Mock API
jest.mock('../../../services/api/admin/entity', () => ({
  adminEntityApi: {
    getEras: jest.fn(),
    getCharacters: jest.fn(),
    getEvents: jest.fn(),
    getItems: jest.fn(),
    getWorlds: jest.fn(),
  },
}));

describe('EntityPanel', () => {
  const mockToken = 'test-token';
  const mockOnEntitySelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default tab (era)', () => {
    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(<EntityPanel adminToken={mockToken} onEntitySelect={mockOnEntitySelect} />);

    expect(screen.getByText('场景')).toBeInTheDocument();
    expect(adminEntityApi.getEras).toHaveBeenCalledWith(mockToken);
  });

  it('should switch tabs correctly', async () => {
    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });
    (adminEntityApi.getCharacters as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    const { rerender } = render(<EntityPanel adminToken={mockToken} />);

    // Click on character tab
    const characterTab = screen.getByText('角色');
    characterTab.click();

    await waitFor(() => {
      expect(adminEntityApi.getCharacters).toHaveBeenCalledWith(mockToken);
    });
  });

  it('should display entities when loaded', async () => {
    const mockEras = [
      { id: 1, name: '测试场景1', description: '描述1', type: 'era' },
      { id: 2, name: '测试场景2', description: '描述2', type: 'era' },
    ];

    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: mockEras,
      total: 2,
    });

    render(<EntityPanel adminToken={mockToken} onEntitySelect={mockOnEntitySelect} />);

    await waitFor(() => {
      expect(screen.getByText('测试场景1')).toBeInTheDocument();
      expect(screen.getByText('测试场景2')).toBeInTheDocument();
    });
  });

  it('should filter entities by search term', async () => {
    const mockEras = [
      { id: 1, name: '测试场景1', description: '描述1', type: 'era' },
      { id: 2, name: '另一个场景', description: '描述2', type: 'era' },
    ];

    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: mockEras,
      total: 2,
    });

    render(<EntityPanel adminToken={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('测试场景1')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText('搜索实体...');
    searchInput.value = '测试';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    await waitFor(() => {
      expect(screen.getByText('测试场景1')).toBeInTheDocument();
      expect(screen.queryByText('另一个场景')).not.toBeInTheDocument();
    });
  });

  it('should call onEntitySelect when entity is clicked', async () => {
    const mockEra = { id: 1, name: '测试场景', description: '描述', type: 'era' };

    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [mockEra],
      total: 1,
    });

    render(<EntityPanel adminToken={mockToken} onEntitySelect={mockOnEntitySelect} />);

    await waitFor(() => {
      expect(screen.getByText('测试场景')).toBeInTheDocument();
    });

    const entityCard = screen.getByText('测试场景').closest('div[class*="cursor-pointer"]');
    entityCard?.click();

    expect(mockOnEntitySelect).toHaveBeenCalledWith(mockEra);
  });

  it('should display loading state', () => {
    (adminEntityApi.getEras as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<EntityPanel adminToken={mockToken} />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('should display error state', async () => {
    (adminEntityApi.getEras as jest.Mock).mockRejectedValue(new Error('加载失败'));

    render(<EntityPanel adminToken={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });

  it('should display empty state when no entities', async () => {
    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(<EntityPanel adminToken={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('暂无实体')).toBeInTheDocument();
    });
  });

  it('should not load entities when token is null', () => {
    render(<EntityPanel adminToken={null} />);

    expect(adminEntityApi.getEras).not.toHaveBeenCalled();
  });
});
