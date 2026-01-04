import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GraphRecommendationPanel } from '../GraphRecommendationPanel';
import { adminGraphRecommendationApi } from '../../../services/api/admin/graphRecommendation';

// Mock API
jest.mock('../../../services/api/admin/graphRecommendation', () => ({
  adminGraphRecommendationApi: {
    recommendEntities: jest.fn(),
    autoDetectRelations: jest.fn(),
    suggestOptimizations: jest.fn(),
  },
}));

describe('GraphRecommendationPanel', () => {
  const mockToken = 'test-token';
  const mockNodes: any[] = [];
  const mockEdges: any[] = [];
  const mockOnEntitySelect = jest.fn();
  const mockOnRelationCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default tab (entities)', () => {
    (adminGraphRecommendationApi.recommendEntities as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
        onEntitySelect={mockOnEntitySelect}
        onRelationCreate={mockOnRelationCreate}
      />
    );

    expect(screen.getByText('实体推荐')).toBeInTheDocument();
  });

  it('should switch tabs correctly', async () => {
    (adminGraphRecommendationApi.recommendEntities as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });
    (adminGraphRecommendationApi.autoDetectRelations as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
      />
    );

    const relationsTab = screen.getByText('关系识别');
    fireEvent.click(relationsTab);

    await waitFor(() => {
      expect(adminGraphRecommendationApi.autoDetectRelations).toHaveBeenCalled();
    });
  });

  it('should display entity recommendations', async () => {
    const mockRecommendations = [
      {
        entityId: '1',
        entityName: '推荐实体1',
        entityType: 'character',
        reason: '场景中的角色',
        score: 70,
      },
    ];

    (adminGraphRecommendationApi.recommendEntities as jest.Mock).mockResolvedValue({
      items: mockRecommendations,
      total: 1,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
        onEntitySelect={mockOnEntitySelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('推荐实体1')).toBeInTheDocument();
      expect(screen.getByText('场景中的角色')).toBeInTheDocument();
      expect(screen.getByText('70分')).toBeInTheDocument();
    });
  });

  it('should call onEntitySelect when recommendation is clicked', async () => {
    const mockRecommendation = {
      entityId: '1',
      entityName: '推荐实体1',
      entityType: 'character',
      reason: '场景中的角色',
      score: 70,
    };

    (adminGraphRecommendationApi.recommendEntities as jest.Mock).mockResolvedValue({
      items: [mockRecommendation],
      total: 1,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
        onEntitySelect={mockOnEntitySelect}
      />
    );

    await waitFor(() => {
      const recommendationCard = screen.getByText('推荐实体1').closest('div[class*="cursor-pointer"]');
      fireEvent.click(recommendationCard!);
    });

    expect(mockOnEntitySelect).toHaveBeenCalledWith(mockRecommendation);
  });

  it('should display relation recommendations', async () => {
    const mockRelations = [
      {
        sourceEntityType: 'character',
        sourceEntityId: '1',
        targetEntityType: 'character',
        targetEntityId: '2',
        relationType: 'FRIEND',
        strength: 50,
        reason: '同一场景中的角色',
        confidence: 60,
      },
    ];

    (adminGraphRecommendationApi.autoDetectRelations as jest.Mock).mockResolvedValue({
      items: mockRelations,
      total: 1,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
        onRelationCreate={mockOnRelationCreate}
      />
    );

    const relationsTab = screen.getByText('关系识别');
    fireEvent.click(relationsTab);

    await waitFor(() => {
      expect(screen.getByText(/character:1 → character:2/)).toBeInTheDocument();
      expect(screen.getByText('关系: FRIEND')).toBeInTheDocument();
      expect(screen.getByText('置信度: 60%')).toBeInTheDocument();
    });
  });

  it('should call onRelationCreate when create button is clicked', async () => {
    const mockRelation = {
      sourceEntityType: 'character',
      sourceEntityId: '1',
      targetEntityType: 'character',
      targetEntityId: '2',
      relationType: 'FRIEND',
      strength: 50,
      reason: '同一场景中的角色',
      confidence: 60,
    };

    (adminGraphRecommendationApi.autoDetectRelations as jest.Mock).mockResolvedValue({
      items: [mockRelation],
      total: 1,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
        onRelationCreate={mockOnRelationCreate}
      />
    );

    const relationsTab = screen.getByText('关系识别');
    fireEvent.click(relationsTab);

    await waitFor(() => {
      const createButton = screen.getByText('创建关系');
      fireEvent.click(createButton);
    });

    expect(mockOnRelationCreate).toHaveBeenCalledWith(mockRelation);
  });

  it('should display optimization suggestions', async () => {
    const mockSuggestions = [
      {
        type: 'ISOLATED_NODE',
        severity: 'warning' as const,
        nodeId: 'node1',
        message: '节点 node1 没有连接到其他节点',
        suggestion: '考虑将该节点连接到流程中',
      },
    ];

    (adminGraphRecommendationApi.suggestOptimizations as jest.Mock).mockResolvedValue({
      items: mockSuggestions,
      total: 1,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
      />
    );

    const optimizationsTab = screen.getByText('优化建议');
    fireEvent.click(optimizationsTab);

    await waitFor(() => {
      expect(screen.getByText('节点 node1 没有连接到其他节点')).toBeInTheDocument();
      expect(screen.getByText('考虑将该节点连接到流程中')).toBeInTheDocument();
    });
  });

  it('should change entity type filter', async () => {
    (adminGraphRecommendationApi.recommendEntities as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
      />
    );

    await waitFor(() => {
      const entityTypeSelect = screen.getByDisplayValue('角色');
      fireEvent.change(entityTypeSelect, { target: { value: 'era' } });
    });

    await waitFor(() => {
      expect(adminGraphRecommendationApi.recommendEntities).toHaveBeenCalledWith(
        'era',
        expect.any(Array),
        expect.any(Object),
        mockToken
      );
    });
  });

  it('should extract entities from nodes', async () => {
    const nodesWithEntities = [
      {
        nodeId: 'node1',
        nodeType: 'character',
        config: { characterId: 1, characterName: '角色1' },
      },
      {
        nodeId: 'node2',
        nodeType: 'era',
        config: { eraId: 100, eraName: '场景1' },
      },
    ];

    (adminGraphRecommendationApi.autoDetectRelations as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={nodesWithEntities as any}
        edges={mockEdges}
      />
    );

    const relationsTab = screen.getByText('关系识别');
    fireEvent.click(relationsTab);

    await waitFor(() => {
      expect(adminGraphRecommendationApi.autoDetectRelations).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            entityId: '1',
            entityType: 'character',
          }),
          expect.objectContaining({
            entityId: '100',
            entityType: 'era',
          }),
        ]),
        expect.any(Object),
        mockToken
      );
    });
  });

  it('should display loading state', () => {
    (adminGraphRecommendationApi.recommendEntities as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
      />
    );

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('should display error state', async () => {
    (adminGraphRecommendationApi.recommendEntities as jest.Mock).mockRejectedValue(
      new Error('加载失败')
    );

    render(
      <GraphRecommendationPanel
        adminToken={mockToken}
        nodes={mockNodes}
        edges={mockEdges}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });
});
