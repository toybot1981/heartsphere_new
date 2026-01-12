// Graph流程编辑器类型定义

export interface GraphDefinition {
  id?: number;
  name: string;
  description?: string;
  graphType?: string;
  startNodeId?: string;
  isActive?: boolean;
  version?: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}

export interface GraphNode {
  id?: number;
  graphId?: number;
  nodeId: string;
  nodeType: string;
  nodeConfig?: Record<string, any>;
  positionX?: number;
  positionY?: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GraphEdge {
  id?: number;
  graphId?: number;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType?: string;
  edgeLabel?: string;
  conditionConfig?: Record<string, any>;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GraphDefinitionCreateRequest {
  name: string;
  description?: string;
  graphType?: string;
  startNodeId?: string;
  isActive?: boolean;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}
