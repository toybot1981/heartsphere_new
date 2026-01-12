import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { adminApi } from '../services/api';
import type { GraphNode, GraphEdge, GraphDefinition, GraphDefinitionCreateRequest } from '../services/api';
import { Button } from "../components/Button";
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { showAlert } from "../utils/dialog";
import { NodePropertyPanel } from './NodePropertyPanel';

interface GraphFlowEditorProps {
  graphId: number | null;
  graphData: GraphDefinition | null;
  adminToken: string | null;
  onSave: (data: GraphDefinition) => void;
  onCancel: () => void;
}

// 节点类型定义
const nodeTypes = ['start', 'dialogue', 'choice', 'condition', 'skill_check', 'state_change', 'wait', 'end'];

// 节点样式配置
const nodeTypeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  start: { bg: 'bg-green-900/30', border: 'border-green-500', icon: '▶' },
  dialogue: { bg: 'bg-blue-900/30', border: 'border-blue-500', icon: '💬' },
  choice: { bg: 'bg-purple-900/30', border: 'border-purple-500', icon: '❓' },
  condition: { bg: 'bg-yellow-900/30', border: 'border-yellow-500', icon: '🔀' },
  skill_check: { bg: 'bg-orange-900/30', border: 'border-orange-500', icon: '⚡' },
  state_change: { bg: 'bg-pink-900/30', border: 'border-pink-500', icon: '🔄' },
  wait: { bg: 'bg-cyan-900/30', border: 'border-cyan-500', icon: '⏸' },
  end: { bg: 'bg-red-900/30', border: 'border-red-500', icon: '■' },
};

// 自定义节点组件
const CustomNode = React.memo(({ data, selected }: { data: any; selected: boolean }) => {
  const style = nodeTypeStyles[data.nodeType] || nodeTypeStyles.dialogue;
  
  return (
    <div className={`px-3 py-1.5 rounded-md border-2 min-w-[100px] max-w-[150px] ${style.bg} ${style.border} ${selected ? 'ring-2 ring-indigo-400' : ''}`}>
      {/* 输入Handle（顶部） */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-slate-400 border-2 border-slate-600"
        style={{ borderRadius: '50%' }}
      />
      
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-sm">{style.icon}</span>
        <span className="text-[10px] font-bold text-white uppercase leading-tight">{data.nodeType}</span>
      </div>
      <div className="text-xs text-white font-semibold truncate leading-tight">{data.label || data.nodeId}</div>
      {data.description && (
        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-tight">{data.description}</div>
      )}
      
      {/* 输出Handle（底部） */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-slate-400 border-2 border-slate-600"
        style={{ borderRadius: '50%' }}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

// 在组件外部定义nodeTypesMap，确保引用稳定
const nodeTypesMap = {
  custom: CustomNode,
} as const;

// 获取节点显示标签的辅助函数
const getNodeLabel = (nodeType: string, config: any): string => {
  if (!config) return '';
  switch (nodeType) {
    case 'dialogue':
      return config.content || '';
    case 'choice':
      return config.prompt || '';
    case 'start':
      return '开始';
    case 'end':
      return config.result || '结束';
    case 'condition':
      return '条件判断';
    case 'skill_check':
      return `技能检查: ${config.skillId || ''}`;
    case 'state_change':
      return '状态变更';
    case 'wait':
      return '等待';
    default:
      return '';
  }
};

const GraphFlowEditorContent: React.FC<GraphFlowEditorProps> = ({
  graphId,
  graphData,
  adminToken,
  onSave,
  onCancel,
}) => {
  const [graphName, setGraphName] = useState('');
  const [graphDescription, setGraphDescription] = useState('');
  const [graphType, setGraphType] = useState('SCRIPT');
  const [startNodeId, setStartNodeId] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [saving, setSaving] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);

  // 初始化表单数据
  useEffect(() => {
    if (graphData) {
      setGraphName(graphData.name || '');
      setGraphDescription(graphData.description || '');
      setGraphType(graphData.graphType || 'SCRIPT');
      setStartNodeId(graphData.startNodeId || '');
    }
  }, [graphData]);

  // 将DTO转换为ReactFlow的Node和Edge格式
  const initialNodes = useMemo(() => {
    if (!graphData?.nodes) return [];
    
    return graphData.nodes.map((node: GraphNode) => {
      const style = nodeTypeStyles[node.nodeType] || nodeTypeStyles.dialogue;
      const config = node.nodeConfig || {};
      
      return {
        id: node.nodeId,
        type: 'custom',
        position: { x: node.positionX || 0, y: node.positionY || 0 },
        data: {
          nodeId: node.nodeId,
          nodeType: node.nodeType,
          label: config.name || config.text || config.content || node.nodeId,
          description: config.description || '',
          config: config,
        },
      } as Node;
    });
  }, [graphData?.id]);

  const initialEdges = useMemo(() => {
    if (!graphData?.edges) return [];
    
    return graphData.edges.map((edge: GraphEdge) => ({
      id: `e${edge.sourceNodeId}-${edge.targetNodeId}`,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      label: edge.edgeLabel || edge.edgeType || '',
      type: edge.edgeType === 'true' ? 'smoothstep' : edge.edgeType === 'false' ? 'step' : 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    })) as Edge[];
  }, [graphData?.id]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // 处理节点点击
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // 处理节点拖拽结束（保存位置）
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? { ...n, position: node.position }
          : n
      )
    );
  }, [setNodes]);

  // 在指定位置添加节点
  const addNodeAtPosition = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const nodeId = `${nodeType}_${Date.now()}`;
    const style = nodeTypeStyles[nodeType] || nodeTypeStyles.dialogue;
    
    const newNode: Node = {
      id: nodeId,
      type: 'custom',
      position,
      data: {
        nodeId,
        nodeType,
        label: nodeType,
        description: '',
        config: {},
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // 保存Graph
  const handleSave = async () => {
    if (!graphData) return;
    
    setSaving(true);
    try {
      // 构建节点数据
      const nodeData = nodes.map((node) => ({
        nodeId: node.data.nodeId,
        nodeType: node.data.nodeType,
        positionX: node.position.x,
        positionY: node.position.y,
        nodeConfig: node.data.config || {},
      }));

      // 构建边数据
      // edge.label 可能是 ReactNode，需要转换为 string
      const edgeData: GraphEdge[] = edges.map((edge) => {
        let edgeLabel = '';
        if (edge.label) {
          if (typeof edge.label === 'string') {
            edgeLabel = edge.label;
          } else if (typeof edge.label === 'number') {
            edgeLabel = String(edge.label);
          } else {
            // 如果是 ReactNode，尝试提取文本内容或使用默认值
            edgeLabel = '';
          }
        }
        
        return {
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          edgeType: typeof edge.type === 'string' ? edge.type : 'default',
          edgeLabel: edgeLabel,
        };
      });

      const updateData: GraphDefinitionCreateRequest = {
        name: graphName || '未命名Graph',
        description: graphDescription,
        graphType: graphType as any,
        startNodeId: startNodeId || nodes[0]?.data.nodeId || '',
        nodes: nodeData,
        edges: edgeData,
      };

      if (!adminToken) {
        showAlert('未登录，请先登录', 'error');
        return;
      }

      if (graphId) {
        const updated = await adminApi.graph.update(graphId, updateData, adminToken);
        showAlert('保存成功', 'success');
        onSave(updated);
      } else {
        const created = await adminApi.graph.create(updateData, adminToken);
        showAlert('创建成功', 'success');
        onSave(created);
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '保存失败，请稍后重试';
      showAlert(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 删除选中的节点
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-xl font-bold">{graphId ? '编辑Graph' : '新建Graph'}</h2>
          
          <InputGroup label="名称" className="flex-1 max-w-xs">
            <TextInput
              value={graphName}
              onChange={(e) => setGraphName(e.target.value)}
              placeholder="Graph名称"
            />
          </InputGroup>

          <InputGroup label="描述" className="flex-1 max-w-xs">
            <TextInput
              value={graphDescription}
              onChange={(e) => setGraphDescription(e.target.value)}
              placeholder="Graph描述"
            />
          </InputGroup>

          <InputGroup label="类型" className="max-w-xs">
            <select
              value={graphType}
              onChange={(e) => setGraphType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
            >
              <option value="SCRIPT">脚本</option>
              <option value="DIALOGUE">对话</option>
              <option value="WORKFLOW">工作流</option>
            </select>
          </InputGroup>

          <InputGroup label="起始节点" className="max-w-xs">
            <select
              value={startNodeId}
              onChange={(e) => setStartNodeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
            >
              <option value="">-- 选择起始节点 --</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label || node.id}
                </option>
              ))}
            </select>
          </InputGroup>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧节点类型面板 */}
        <div className="w-48 border-r border-slate-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-bold mb-4 text-slate-400">节点类型</h3>
          <div className="space-y-2">
            {nodeTypes.map((type) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => {
                  setDraggedNodeType(type);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => setDraggedNodeType(null)}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded cursor-move hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{nodeTypeStyles[type]?.icon || '●'}</span>
                  <span className="text-xs font-semibold">{type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ReactFlow画布 */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypesMap}
            onInit={setReactFlowInstance}
            onDrop={(event) => {
              event.preventDefault();
              if (!draggedNodeType || !reactFlowInstance) return;
              
              const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
              });
              
              addNodeAtPosition(draggedNodeType, position);
              setDraggedNodeType(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            fitView
            connectionLineStyle={{ stroke: '#fff', strokeWidth: 2 }}
            defaultEdgeOptions={{ 
              style: { stroke: '#fff', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#fff' }
            }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>

          {/* 删除节点按钮（仅在选中节点时显示） */}
          {selectedNode && (
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleDeleteNode}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-lg"
              >
                删除节点
              </button>
            </div>
          )}
        </div>

        {/* 节点属性面板 */}
        {selectedNode && (
          <div className="w-80 border-l border-slate-700 p-4 overflow-y-auto">
            <NodePropertyPanel
              node={selectedNode}
              onUpdate={(nodeId, config) => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === nodeId
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            config: { ...n.data.config, ...config },
                            label: config.name || config.text || config.content || n.data.label,
                          },
                        }
                      : n
                  )
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// 使用ReactFlowProvider包装，并使用key强制重新挂载以避免状态问题
export const GraphFlowEditor: React.FC<GraphFlowEditorProps> = (props) => {
  const graphKey = props.graphData?.id ?? 'new';
  return (
    <ReactFlowProvider key={graphKey}>
      <GraphFlowEditorContent {...props} />
    </ReactFlowProvider>
  );
};
