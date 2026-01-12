import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { EntitySelector } from '../EntitySelector';
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

describe('EntitySelector', () => {
  const mockToken = 'test-token';
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with placeholder', () => {
    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(
      <EntitySelector
        entityType="era"
        adminToken={mockToken}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('请选择场景')).toBeInTheDocument();
  });

  it('should load entities on mount', async () => {
    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(
      <EntitySelector
        entityType="era"
        adminToken={mockToken}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(adminEntityApi.getEras).toHaveBeenCalledWith(mockToken);
    });
  });

  it('should open dropdown when clicked', async () => {
    const mockEras = [
      { id: 1, name: '场景1', type: 'era' },
      { id: 2, name: '场景2', type: 'era' },
    ];

    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: mockEras,
      total: 2,
    });

    render(
      <EntitySelector
        entityType="era"
        adminToken={mockToken}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(adminEntityApi.getEras).toHaveBeenCalled();
    });

    const selector = screen.getByText('请选择场景').closest('div[class*="cursor-pointer"]');
    fireEvent.click(selector!);

    await waitFor(() => {
      expect(screen.getByText('场景1')).toBeInTheDocument();
      expect(screen.getByText('场景2')).toBeInTheDocument();
    });
  });

  it('should call onChange when entity is selected', async () => {
    const mockEra = { id: 1, name: '场景1', type: 'era' };

    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [mockEra],
      total: 1,
    });

    render(
      <EntitySelector
        entityType="era"
        adminToken={mockToken}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(adminEntityApi.getEras).toHaveBeenCalled();
    });

    const selector = screen.getByText('请选择场景').closest('div[class*="cursor-pointer"]');
    fireEvent.click(selector!);

    await waitFor(() => {
      const entityOption = screen.getByText('场景1');
      fireEvent.click(entityOption);
    });

    expect(mockOnChange).toHaveBeenCalledWith(1, mockEra);
  });

  it('should filter entities by search term', async () => {
    const mockEras = [
      { id: 1, name: '场景1', type: 'era' },
      { id: 2, name: '场景2', type: 'era' },
    ];

    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: mockEras,
      total: 2,
    });

    render(
      <EntitySelector
        entityType="era"
        adminToken={mockToken}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(adminEntityApi.getEras).toHaveBeenCalled();
    });

    const selector = screen.getByText('请选择场景').closest('div[class*="cursor-pointer"]');
    fireEvent.click(selector!);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('搜索...');
      fireEvent.change(searchInput, { target: { value: '场景1' } });
    });

    await waitFor(() => {
      expect(screen.getByText('场景1')).toBeInTheDocument();
      expect(screen.queryByText('场景2')).not.toBeInTheDocument();
    });
  });

  it('should display selected entity', async () => {
    const mockEra = { id: 1, name: '场景1', type: 'era' };

    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [mockEra],
      total: 1,
    });

    render(
      <EntitySelector
        entityType="era"
        value={1}
        adminToken={mockToken}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('场景1')).toBeInTheDocument();
    });
  });

  it('should clear selection when clear button is clicked', async () => {
    const mockEra = { id: 1, name: '场景1', type: 'era' };

    (adminEntityApi.getEras as jest.Mock).mockResolvedValue({
      items: [mockEra],
      total: 1,
    });

    render(
      <EntitySelector
        entityType="era"
        value={1}
        adminToken={mockToken}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(adminEntityApi.getEras).toHaveBeenCalled();
    });

    const selector = screen.getByText('场景1').closest('div[class*="cursor-pointer"]');
    fireEvent.click(selector!);

    await waitFor(() => {
      const clearButton = screen.getByText('清除选择');
      fireEvent.click(clearButton);
    });

    expect(mockOnChange).toHaveBeenCalledWith(undefined);
  });

  it('should use eraId filter for characters', async () => {
    (adminEntityApi.getCharacters as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(
      <EntitySelector
        entityType="character"
        eraId={100}
        adminToken={mockToken}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(adminEntityApi.getCharacters).toHaveBeenCalledWith(mockToken, 100);
    });
  });
});
