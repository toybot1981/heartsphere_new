import React, { useEffect, useRef, useState } from 'react';
import { Graph, Node as X6Node, Edge as X6Edge } from '@antv/x6';
import { adminApi } from '../../services/api';
import { adminGraphApi } from '../../services/api/admin/graph';
import type { GraphNode, GraphEdge, GraphDefinition } from '../../services/api/admin/graphTypes';
import type { GraphExecutionDTO } from '../../services/api/admin/graphExecutionTypes';
import type { ExecutionLogDTO } from '../../services/api/admin/graphExecutionLogTypes';
import { Button } from '../../components/Button';
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { showAlert } from '../../utils/dialog';
import { NodePropertyPanel } from './NodePropertyPanel';
import { EntityPanel } from './EntityPanel';
import { GraphRecommendationPanel } from './GraphRecommendationPanel';

interface X6GraphFlowEditorProps {
  graphId: number | null;
  graphData: GraphDefinition | null;
  adminToken: string | null;
  onSave: (data: GraphDefinition) => void;
  onCancel: () => void;
}

// 节点类型定义
const nodeTypes = ['start', 'dialogue', 'choice', 'condition', 'skill_check', 'state_change', 'wait', 'end', 'era', 'character', 'event', 'item', 'entity_relation'];

// 节点样式配置 - 参考 Dify 设计，使用更简洁的样式
const nodeTypeStyles: Record<string, { 
  bg: string; 
  border: string; 
  icon: string; 
  color: string;
  label: string; // 节点类型的中文标签
}> = {
  start: { bg: '#ffffff', border: '#10b981', icon: '▶', color: '#065f46', label: '开始' },
  dialogue: { bg: '#ffffff', border: '#3b82f6', icon: '💬', color: '#1e3a5f', label: '对话' },
  choice: { bg: '#ffffff', border: '#a855f7', icon: '❓', color: '#581c87', label: '选择' },
  condition: { bg: '#ffffff', border: '#eab308', icon: '🔀', color: '#713f12', label: '条件' },
  skill_check: { bg: '#ffffff', border: '#f97316', icon: '⚡', color: '#7c2d12', label: '技能检查' },
  state_change: { bg: '#ffffff', border: '#ec4899', icon: '🔄', color: '#831843', label: '状态变更' },
  wait: { bg: '#ffffff', border: '#06b6d4', icon: '⏸', color: '#164e63', label: '等待' },
  end: { bg: '#ffffff', border: '#ef4444', icon: '■', color: '#7f1d1d', label: '结束' },
  era: { bg: '#ffffff', border: '#3b82f6', icon: '🌍', color: '#1e40af', label: '场景' },
  character: { bg: '#ffffff', border: '#a78bfa', icon: '👤', color: '#7c3aed', label: '角色' },
  event: { bg: '#ffffff', border: '#ef4444', icon: '⚡', color: '#dc2626', label: '事件' },
  item: { bg: '#ffffff', border: '#f97316', icon: '🎁', color: '#ea580c', label: '物品' },
  entity_relation: { bg: '#ffffff', border: '#10b981', icon: '🔗', color: '#059669', label: '实体关系' },
};

/**
 * 获取节点标签文本 - 简洁显示，只显示关键信息
 */
const getNodeLabel = (nodeType: string, config: Record<string, any>, nodeId: string): string => {
  const style = nodeTypeStyles[nodeType] || nodeTypeStyles.dialogue;
  const baseLabel = style.label;
  
  switch (nodeType) {
    case 'dialogue':
      // 对话节点：显示内容的前20个字符
      const content = config.content || config.text || '';
      return content.length > 20 ? content.substring(0, 20) + '...' : content || baseLabel;
    case 'choice':
      // 选择节点：显示提示的前15个字符
      const prompt = config.prompt || config.text || '';
      return prompt.length > 15 ? prompt.substring(0, 15) + '...' : prompt || baseLabel;
    case 'start':
      return baseLabel;
    case 'end':
      return config.result ? `${baseLabel}: ${config.result}` : baseLabel;
    case 'era':
      return config.eraName || config.eraId || baseLabel;
    case 'character':
      return config.characterName || config.characterId || baseLabel;
    case 'event':
      return config.eventName || config.eventId || baseLabel;
    case 'item':
      return config.itemName || config.itemId || baseLabel;
    case 'entity_relation':
      const source = config.sourceEntityType || '源';
      const target = config.targetEntityType || '目标';
      return `${source}→${target}`;
    default:
      return config.name || config.text || baseLabel;
  }
};

/**
 * 根据节点类型获取端口配置
 * 参考 Dify 设计，condition 和 choice 节点的输出端口在右侧垂直分布
 */
const getPortsConfig = (nodeType: string, config?: Record<string, any>) => {
  const style = nodeTypeStyles[nodeType] || nodeTypeStyles.dialogue;
  const portAttrs = {
    circle: {
      r: 5,
      magnet: true,
        stroke: style.border,
        strokeWidth: 2,
      fill: '#ffffff',
    },
  };

  // 输入端口（顶部）- 所有节点都有一个输入端口
  const inputPorts = [
    { group: 'top', id: 'port-top' },
  ];

  // 创建端口组配置（先创建基础组）
  const portGroups: Record<string, any> = {
    top: {
      position: 'top',
      attrs: portAttrs,
    },
  };

  // 输出端口 - 根据节点类型动态生成
  // 注意：不要在 items 中添加 label，标签应该在 portGroups 中配置
  let outputPorts: Array<{ group: string; id: string }> = [];

  switch (nodeType) {
    case 'start':
      // 开始节点：只有一个输出（底部）
      portGroups.bottom = {
        position: 'bottom',
        attrs: portAttrs,
      };
      outputPorts = [{ group: 'bottom', id: 'port-bottom' }];
      break;

    case 'condition':
      // 条件节点：根据条件数量在右侧创建输出端口（参考 Dify 设计）
      const conditions = config?.conditions || [];
      const totalOutputs = conditions.length > 0 ? conditions.length + 1 : 2; // +1 for ELSE, or 2 for TRUE/FALSE
      
      if (conditions.length > 0) {
        // 每个条件一个输出端口（右侧垂直分布）
        conditions.forEach((condition: any, index: number) => {
          const portId = `port-right-${index}`;
          const label = index === 0 ? 'IF' : `ELIF${index}`;
          const y = (index + 1) / (totalOutputs + 1); // 垂直位置，均匀分布
          
          // 创建右侧端口组
          const portGroupId = `right-${index}`;
          portGroups[portGroupId] = {
            position: { name: 'right', args: { y } },
            attrs: portAttrs,
            // 移除 label 配置，避免格式错误
            // X6 的端口标签配置比较复杂，暂时不显示标签
          };
          
          outputPorts.push({
            group: portGroupId,
            id: portId,
          });
        });
        
        // 添加 ELSE 端口
        const elsePortId = 'port-right-else';
        const elsePortGroupId = 'right-else';
        const elseY = (conditions.length + 1) / (totalOutputs + 1);
        portGroups[elsePortGroupId] = {
          position: { name: 'right', args: { y: elseY } },
          attrs: portAttrs,
          // 移除 label 配置，避免格式错误
        };
        outputPorts.push({ group: elsePortGroupId, id: elsePortId });
      } else {
        // 默认 true/false 两个输出（右侧垂直分布）
        const truePortId = 'port-right-true';
        const falsePortId = 'port-right-false';
        const truePortGroupId = 'right-true';
        const falsePortGroupId = 'right-false';
        
        portGroups[truePortGroupId] = {
          position: { name: 'right', args: { y: 0.3 } },
          attrs: {
            ...portAttrs,
            circle: {
              ...portAttrs.circle,
              stroke: '#10b981', // 绿色表示 TRUE
            },
          },
          // 移除 label 配置，避免格式错误
        };
        
        portGroups[falsePortGroupId] = {
          position: { name: 'right', args: { y: 0.7 } },
          attrs: {
            ...portAttrs,
            circle: {
              ...portAttrs.circle,
              stroke: '#ef4444', // 红色表示 FALSE
            },
          },
          // 移除 label 配置，避免格式错误
        };
        
        outputPorts = [
          { group: truePortGroupId, id: truePortId },
          { group: falsePortGroupId, id: falsePortId },
        ];
      }
      break;

    case 'choice':
      // 选择节点：根据选项数量在右侧创建输出端口（参考 Dify 设计）
      const options = config?.options || [];
      if (options.length > 0) {
        options.forEach((option: any, index: number) => {
          const portId = `port-right-${index}`;
          const optionText = option.text || option.label || `选项${index + 1}`;
          const y = (index + 1) / (options.length + 1);
          
          const portGroupId = `right-choice-${index}`;
          portGroups[portGroupId] = {
            position: { name: 'right', args: { y } },
            attrs: portAttrs,
            // 移除 label 配置，避免格式错误
          };
          
          outputPorts.push({
            group: portGroupId,
            id: portId,
          });
        });
      } else {
        // 默认一个输出（底部）
        portGroups.bottom = {
          position: 'bottom',
          attrs: portAttrs,
        };
        outputPorts = [{ group: 'bottom', id: 'port-bottom' }];
      }
      break;

    case 'end':
      // 结束节点：没有输出
      outputPorts = [];
      break;

    default:
      // 其他节点：默认一个输出（底部）
      portGroups.bottom = {
        position: 'bottom',
        attrs: portAttrs,
      };
      outputPorts = [{ group: 'bottom', id: 'port-bottom' }];
      break;
  }

  return {
    groups: portGroups,
    items: [...inputPorts, ...outputPorts],
  };
};

/**
 * 根据节点类型计算节点高度
 */
const getNodeHeight = (nodeType: string, config?: Record<string, any>): number => {
  switch (nodeType) {
    case 'condition':
      // 条件节点：根据条件数量增加高度
      const conditions = config?.conditions || [];
      const conditionCount = conditions.length > 0 ? conditions.length : 2; // 默认 true/false
      return 56 + Math.max(0, (conditionCount - 1) * 8); // 每个额外条件增加 8px
    case 'choice':
      // 选择节点：根据选项数量增加高度
      const options = config?.options || [];
      return 56 + Math.max(0, (options.length - 1) * 8);
    default:
      return 56;
  }
};

/**
 * 创建 X6 节点配置 - 参考 Dify 设计，简洁的节点样式，支持动态端口
 */
const createX6NodeConfig = (nodeId: string, nodeType: string, x: number, y: number, config?: Record<string, any>) => {
  const style = nodeTypeStyles[nodeType] || nodeTypeStyles.dialogue;
  const label = config ? getNodeLabel(nodeType, config, nodeId) : style.label;
  const height = getNodeHeight(nodeType, config);
  
  // 使用 rect 形状，参考 Dify 设计
  return {
    id: nodeId,
    x: x,
    y: y,
    width: 180, // 稍微加宽，参考 Dify
    height: height,
    shape: 'rect',
    zIndex: 10, // 确保节点在边的上方
    attrs: {
      body: {
        fill: style.bg, // 白色背景，参考 Dify
        stroke: style.border,
        strokeWidth: 2,
        rx: 8, // 更大的圆角，参考 Dify
        ry: 8,
        filter: {
          name: 'dropShadow',
          args: {
            dx: 0,
            dy: 2,
            blur: 4,
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      // 图标文本
      icon: {
        text: style.icon,
        fontSize: 18,
        fill: style.border,
        x: 12,
        y: 20,
        refX: 0,
        refY: 0,
      },
      // 主标签文本
      label: {
        text: label,
        fill: '#1f2937', // 深灰色文字，参考 Dify
        fontSize: 13,
        fontWeight: 500,
        x: 40, // 图标右侧
        y: 22,
        refX: 0,
        refY: 0,
      },
      // 类型标签（右下角）
      typeLabel: {
        text: style.label,
        fill: '#6b7280', // 浅灰色
        fontSize: 10,
        x: 170,
        y: height - 8,
        refX: 0,
        refY: 0,
        textAnchor: 'end',
      },
    },
    label: label,
    ports: getPortsConfig(nodeType, config),
    data: {
      nodeId: nodeId,
      nodeType: nodeType,
      config: config || {},
      description: config?.description || '',
    },
  };
};

export const X6GraphFlowEditor: React.FC<X6GraphFlowEditorProps> = ({
  graphId,
  graphData,
  adminToken,
  onSave,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [graphName, setGraphName] = useState('');
  const [graphDescription, setGraphDescription] = useState('');
  const [graphType, setGraphType] = useState('SCRIPT');
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<X6Node | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<GraphExecutionDTO | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLogDTO[]>([]);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [showEntityPanel, setShowEntityPanel] = useState(false);
  const [showRecommendationPanel, setShowRecommendationPanel] = useState(false);
  const executionLogsRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化 graphData
  useEffect(() => {
    if (graphData) {
      setGraphName(graphData.name || '');
      setGraphDescription(graphData.description || '');
      setGraphType(graphData.graphType || 'SCRIPT');
    }
  }, [graphData]);

  // 初始化 X6 Graph
  useEffect(() => {
    if (!containerRef.current) return;

    // 创建 Graph 实例
    const graph = new Graph({
      container: containerRef.current,
      grid: {
        visible: true,
        type: 'dot',
        size: 20,
        args: {
          color: '#888',
          thickness: 1,
        },
      },
      background: {
        color: '#1e293b',
      },
      panning: {
        enabled: true,
        eventTypes: ['leftMouseDown', 'mouseWheel'],
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.1,
        maxScale: 4,
      },
      connecting: {
        router: {
          name: 'manhattan',
          args: {
            padding: 1,
          },
        },
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return graph.createEdge({
            attrs: {
              line: {
                    stroke: '#9ca3af', // 浅灰色线条，参考 Dify
                    strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                      width: 8,
                      height: 8,
                      fill: '#9ca3af',
                },
              },
            },
                zIndex: 0, // 确保边在节点下方
          });
        },
        validateConnection({ sourceMagnet, targetMagnet }) {
          if (sourceMagnet === targetMagnet) {
            return false;
          }
          return true;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#fff',
              stroke: '#3b82f6', // 蓝色高亮，参考 Dify
              strokeWidth: 3,
            },
          },
        },
      },
    });

    graphRef.current = graph;

    // 画布拖放事件处理
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!graphRef.current) return;
      
      // 从 dataTransfer 获取节点类型，而不是从 state
      const nodeType = e.dataTransfer?.getData('text/plain');
      if (!nodeType) return;

      const point = graphRef.current.clientToLocal(e.clientX, e.clientY);
      const nodeId = `${nodeType}_${Date.now()}`;
      const nodeConfig = createX6NodeConfig(nodeId, nodeType, point.x - 75, point.y - 30);
      const newNode = graphRef.current.createNode(nodeConfig);
      graphRef.current.addNode(newNode);
      graphRef.current.select(newNode);
      setSelectedNode(newNode);
      console.log('Node added:', nodeId, 'at', point.x - 75, point.y - 30);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    };

    const container = containerRef.current;
    container?.addEventListener('drop', handleDrop);
    container?.addEventListener('dragover', handleDragOver);

    // 节点事件处理
    graph.on('node:click', ({ node }) => {
      setSelectedNode(node);
      // 选中节点时，添加蓝色边框高亮，参考 Dify
      node.attr('body/stroke', '#3b82f6');
      node.attr('body/strokeWidth', 3);
    });

    graph.on('node:dblclick', ({ node }) => {
      setSelectedNode(node);
    });

    // 点击画布空白处，取消选中
    graph.on('blank:click', () => {
      setSelectedNode(null);
      // 恢复所有节点的默认边框
      graph.getNodes().forEach((node) => {
        const data = node.getData() || {};
        const nodeType = data.nodeType || 'dialogue';
        const style = nodeTypeStyles[nodeType] || nodeTypeStyles.dialogue;
        node.attr('body/stroke', style.border);
        node.attr('body/strokeWidth', 2);
      });
    });

    // 连线事件处理
    graph.on('edge:connected', ({ edge }) => {
      // 连线已创建
    });

    // 键盘删除事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode && graphRef.current) {
          graphRef.current.removeNode(selectedNode);
          setSelectedNode(null);
        } else if (graphRef.current) {
          const selectedCells = graphRef.current.getSelectedCells();
          selectedCells.forEach((cell) => {
            if (cell.isEdge()) {
              graphRef.current!.removeEdge(cell as X6Edge);
            }
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 清理函数
    return () => {
      container?.removeEventListener('drop', handleDrop);
      container?.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('keydown', handleKeyDown);
      if (graphRef.current) {
        graphRef.current.dispose();
        graphRef.current = null;
      }
    };
  }, []); // Graph 初始化只执行一次

  // 加载节点和边（当 graphData 变化时）
  useEffect(() => {
    if (!graphRef.current) return;

    // 清除现有节点和边
    graphRef.current.getNodes().forEach(node => graphRef.current!.removeNode(node));
    graphRef.current.getEdges().forEach(edge => graphRef.current!.removeEdge(edge));
    
    // 加载节点
    if (graphData?.nodes && graphData.nodes.length > 0) {
      graphData.nodes.forEach((node: GraphNode, index: number) => {
        const config = node.nodeConfig || {};
        const x = node.positionX != null ? node.positionX : (index % 3) * 200 + 100;
        const y = node.positionY != null ? node.positionY : Math.floor(index / 3) * 150 + 100;
        
        const x6NodeConfig = createX6NodeConfig(
          node.nodeId,
          node.nodeType,
          x,
          y,
          config
        );
        const x6Node = graphRef.current!.createNode(x6NodeConfig);
        graphRef.current!.addNode(x6Node);
      });
      
      // 确保节点可见
      setTimeout(() => {
        if (graphRef.current) {
          const nodes = graphRef.current.getNodes();
          if (nodes.length > 0) {
            graphRef.current.centerContent({ padding: 50 });
          }
        }
      }, 100);
    }

    // 加载连线
    if (graphData?.edges && graphData.edges.length > 0) {
      graphData.edges.forEach((edge: GraphEdge) => {
        const x6Edge = graphRef.current!.createEdge({
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          attrs: {
            line: {
              stroke: '#9ca3af', // 浅灰色线条，参考 Dify
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 8,
                height: 8,
                fill: '#9ca3af',
              },
            },
          },
          zIndex: 0, // 确保边在节点下方
          labels: edge.edgeLabel ? [
            {
              attrs: {
                text: {
                  text: edge.edgeLabel,
                  fill: '#999',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  padding: 2,
                },
              },
            },
          ] : [],
          data: {
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId,
            edgeType: edge.edgeType || 'default',
            edgeLabel: edge.edgeLabel || '',
            conditionConfig: edge.conditionConfig || {},
          },
        });

        graphRef.current!.addEdge(x6Edge);
      });
    }
  }, [graphData?.id]); // 只在 graphData.id 变化时重新加载节点和边

  // 处理节点删除
  const handleDeleteNode = () => {
    if (!selectedNode || !graphRef.current) return;
    graphRef.current.removeNode(selectedNode);
    setSelectedNode(null);
  };

  // 处理节点属性更新
  const handleNodeUpdate = (nodeId: string, config: Record<string, any>) => {
    if (!graphRef.current) return;
    
    const node = graphRef.current.getCellById(nodeId) as X6Node;
    if (!node) return;

    const nodeData = node.getData() || {};
    const updatedConfig = { ...nodeData.config, ...config };
    node.setData({
      ...nodeData,
      config: updatedConfig,
    });

    // 更新节点标签
    const label = getNodeLabel(nodeData.nodeType, updatedConfig, nodeId);
    node.attr('label/text', label);

    // 更新节点高度（如果条件/选项数量变化）
    const nodeType = nodeData.nodeType || 'dialogue';
    const newHeight = getNodeHeight(nodeType, updatedConfig);
    if (newHeight !== node.size().height) {
      node.resize(node.size().width, newHeight);
      node.attr('typeLabel/y', newHeight - 8);
    }

    // 更新端口配置（如果条件/选项数量变化）
    // 由于 X6 的端口更新比较复杂，这里先更新数据
    // 端口会在节点重新加载时更新（通过 graphData 变化触发）
    // 如果需要实时更新端口，可以重新创建节点，但会丢失连接关系
    // 暂时保留现有端口，在保存后重新加载时会更新
  };

  // 处理侧边栏节点类型的拖拽开始
  const handleDragStart = (nodeType: string, e: React.DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', nodeType);
    }
  };

  // 将 X6 Graph 数据转换为 GraphDefinition 格式
  const convertX6ToGraphDefinition = (): Partial<GraphDefinition> => {
    if (!graphRef.current) {
      return {
        name: graphName,
        description: graphDescription,
        graphType: graphType as any,
        nodes: [],
        edges: [],
      };
    }

    const graph = graphRef.current;
    const nodes = graph.getNodes();
    const edges = graph.getEdges();

    const nodeData: GraphNode[] = nodes.map((node: X6Node) => {
      const position = node.position();
      const data = node.getData() || {};
      return {
        nodeId: node.id,
        nodeType: data.nodeType || 'dialogue',
        positionX: position.x,
        positionY: position.y,
        nodeConfig: data.config || {},
      };
    });

    const edgeData: GraphEdge[] = edges.map((edge: X6Edge) => {
      const data = edge.getData() || {};
      const labels = edge.getLabels();
      const edgeLabel = labels && labels.length > 0 ? labels[0].attrs?.text?.text : '';
      
      return {
        sourceNodeId: edge.getSourceCellId(),
        targetNodeId: edge.getTargetCellId(),
        edgeType: data.edgeType || 'default',
        edgeLabel: edgeLabel || data.edgeLabel || '',
        conditionConfig: data.conditionConfig || {},
      };
    });

    let startNodeId = '';
    if (nodeData.length > 0) {
      const startNode = nodeData.find(n => n.nodeType === 'start');
      startNodeId = startNode?.nodeId || nodeData[0].nodeId;
    }

    return {
      name: graphName,
      description: graphDescription,
      graphType: graphType as any,
      startNodeId: startNodeId,
      nodes: nodeData,
      edges: edgeData,
    };
  };

  // 处理执行
  const handleExecute = async () => {
    if (!graphId || !adminToken) {
      showAlert('无法执行：缺少必要参数', 'error');
      return;
    }

    setExecuting(true);
    setExecutionLogs([]);
    setShowExecutionPanel(true);
    try {
      const result = await adminGraphApi.execute(graphId, {}, adminToken);
      setExecutionId(result.executionId);
      setExecutionStatus(result);
      
      // 开始轮询执行状态
      startPolling(graphId, result.executionId);
      
      showAlert('执行已开始', 'success');
    } catch (error: any) {
      console.error('执行失败:', error);
      showAlert(error.message || '执行失败', 'error');
      // 清理执行状态，以便下次执行
      setExecuting(false);
      setExecutionId(null);
      setExecutionStatus(null);
      setExecutionLogs([]);
      setShowExecutionPanel(false);
    }
  };

  // 开始轮询执行状态
  const startPolling = (graphId: number, execId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // 显示执行面板
    setShowExecutionPanel(true);
    setExecutionLogs([]);

    pollingIntervalRef.current = setInterval(async () => {
      if (!adminToken) return;
      
      try {
        // 同时获取执行状态和执行日志
        const [status, logs] = await Promise.all([
          adminGraphApi.getExecutionStatus(graphId, execId, adminToken),
          adminGraphApi.getExecutionLogs(execId, adminToken, true).catch(() => []), // 如果获取日志失败，返回空数组
        ]);
        
        setExecutionStatus(status);
        setExecutionLogs(logs);

        // 自动滚动到最新日志
        if (executionLogsRef.current) {
          executionLogsRef.current.scrollTop = executionLogsRef.current.scrollHeight;
        }

        // 如果执行完成或失败，停止轮询
        if (status.status === 'COMPLETED' || status.status === 'FAILED' || status.status === 'CANCELLED') {
          stopPolling();
          setExecuting(false);
          
          if (status.status === 'COMPLETED') {
            showAlert('执行完成', 'success');
          } else if (status.status === 'FAILED') {
            showAlert(status.errorMessage || '执行失败', 'error');
            // 执行失败后，清理状态以便下次执行（但保留执行日志和状态用于查看）
            // 注意：这里不清理 executionStatus 和 executionId，以便用户查看失败信息
            // 但在下次执行时会自动覆盖
          }
        }
      } catch (error: any) {
        console.error('获取执行状态失败:', error);
        stopPolling();
        setExecuting(false);
        // 获取执行状态失败时，清理状态以便下次执行
        setExecutionId(null);
        setExecutionStatus(null);
        setExecutionLogs([]);
      }
    }, 1000); // 每秒轮询一次
  };

  // 停止轮询
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // 清理轮询
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // 更新节点执行状态样式
  useEffect(() => {
    if (!graphRef.current || !executionStatus) return;

    const nodes = graphRef.current.getNodes();
    const currentId = executionStatus.currentNodeId;
    const status = executionStatus.status;

    nodes.forEach((node) => {
      const nodeId = node.id;
      const data = node.getData() || {};
      const nodeType = data.nodeType || 'dialogue';
      const style = nodeTypeStyles[nodeType] || nodeTypeStyles.dialogue;

      let borderColor = style.border;
      let borderWidth = 2;
      let bgColor = style.bg;

      // 根据执行状态设置样式
      if (status === 'COMPLETED') {
        // 执行完成：所有节点显示为灰色
        bgColor = '#f3f4f6';
        borderColor = '#9ca3af';
        borderWidth = 2;
      } else if (status === 'FAILED') {
        // 执行失败：当前节点显示为红色
        if (nodeId === currentId) {
          bgColor = '#fef2f2';
          borderColor = '#ef4444';
          borderWidth = 3;
        } else {
          bgColor = '#f3f4f6';
          borderColor = '#9ca3af';
          borderWidth = 2;
        }
      } else if (nodeId === currentId && status === 'RUNNING') {
        // 当前执行节点：显示为高亮（黄色边框）
        bgColor = style.bg;
        borderColor = '#eab308';
        borderWidth = 4;
      } else if (nodeId === currentId && status === 'WAITING') {
        // 等待状态的节点：显示为蓝色边框
        bgColor = style.bg;
        borderColor = '#3b82f6';
        borderWidth = 3;
      }

      // 更新节点样式
      node.attr('body/fill', bgColor);
      node.attr('body/stroke', borderColor);
      node.attr('body/strokeWidth', borderWidth);
    });
  }, [executionStatus]);

  // 处理保存
  const handleSave = async () => {
    if (!graphRef.current || !adminToken) {
      showAlert('无法保存：缺少必要参数', 'error');
      return;
    }

    if (!graphName || graphName.trim() === '') {
      showAlert('Graph名称不能为空', 'error');
      return;
    }

    setSaving(true);
    try {
      const graphData = convertX6ToGraphDefinition();
      
      // 确保 name 不为 undefined
      if (!graphData.name) {
        showAlert('Graph名称不能为空', 'error');
        setSaving(false);
        return;
      }

      if (graphId) {
        const updated = await adminGraphApi.update(graphId, graphData as any, adminToken);
        showAlert('保存成功', 'success');
        onSave(updated);
      } else {
        const created = await adminGraphApi.create(graphData as any, adminToken);
        showAlert('创建成功', 'success');
        onSave(created);
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      showAlert(error.message || '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 将 X6 Node 转换为 NodePropertyPanel 需要的格式
  const convertX6NodeToReactFlowNode = (x6Node: X6Node | null) => {
    if (!x6Node) {
      // 返回一个默认节点，避免null错误
      return {
        id: 'unknown',
        position: { x: 0, y: 0 },
        data: {
          nodeType: 'dialogue',
          config: {},
          label: '未知节点',
          description: '',
        },
      };
    }
    
    const data = x6Node.getData() || {};
    // 从配置中获取标签
    let label = x6Node.id;
      if (data.config) {
        label = getNodeLabel(data.nodeType || 'dialogue', data.config, x6Node.id);
    }
    
    const position = x6Node.position();
    return {
      id: x6Node.id,
      position: { x: position.x || 0, y: position.y || 0 },
      data: {
        nodeType: data.nodeType || 'dialogue',
        config: data.config || {},
        label: label,
        description: data.description || '',
      },
    };
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 工具栏 */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center gap-4 mb-4">
          <InputGroup label="名称">
            <TextInput
              value={graphName}
              onChange={(e) => setGraphName(e.target.value)}
              placeholder="Graph名称"
            />
          </InputGroup>
          <InputGroup label="类型">
            <select
              value={graphType}
              onChange={(e) => setGraphType(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
            >
              <option value="SCRIPT">剧本</option>
              <option value="SKILL">技能</option>
              <option value="CHARACTER">角色</option>
            </select>
          </InputGroup>
          <InputGroup label="描述">
            <TextInput
              value={graphDescription}
              onChange={(e) => setGraphDescription(e.target.value)}
              placeholder="Graph描述"
              className="min-w-[300px]"
            />
          </InputGroup>
          <div className="flex items-center gap-2 ml-auto">
            {graphId && (
              <Button 
                onClick={handleExecute} 
                disabled={executing || saving}
                className={executing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {executing ? '执行中...' : '执行'}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || executing}>
              {saving ? '保存中...' : '保存'}
            </Button>
            <Button onClick={onCancel} disabled={executing}>取消</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 节点类型侧边栏 */}
        <div className="w-48 border-r border-slate-700 p-4 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400">节点类型</h3>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setShowRecommendationPanel(!showRecommendationPanel);
                  setShowEntityPanel(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                title="智能推荐"
              >
                {showRecommendationPanel ? '💡' : '✨'}
              </button>
              <button
                onClick={() => {
                  setShowEntityPanel(!showEntityPanel);
                  setShowRecommendationPanel(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                title="实体管理"
              >
                {showEntityPanel ? '📋' : '🗂️'}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {nodeTypes.map((type) => {
              const style = nodeTypeStyles[type] || nodeTypeStyles.dialogue;
              return (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(type, e)}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded cursor-move hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{style.icon}</span>
                    <span className="text-xs font-semibold">{type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 画布容器 - 使用 flex-1 确保属性面板关闭时画布延伸 */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={containerRef}
            className="w-full h-full"
            style={{ background: '#1e293b' }}
          />
          
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

        {/* 智能推荐面板 */}
        {showRecommendationPanel && !selectedNode && !showExecutionPanel && (
          <div className="w-80 border-l border-slate-700">
            <GraphRecommendationPanel
              adminToken={adminToken}
              nodes={graphData?.nodes || []}
              edges={graphData?.edges || []}
              onEntitySelect={(rec) => {
                // 根据推荐创建实体节点
                console.log('选择推荐实体:', rec);
              }}
              onRelationCreate={(rec) => {
                // 创建实体关联节点
                console.log('创建关系:', rec);
              }}
            />
          </div>
        )}

        {/* 实体管理面板 */}
        {showEntityPanel && !selectedNode && !showExecutionPanel && !showRecommendationPanel && (
          <div className="w-80 border-l border-slate-700">
            <EntityPanel
              adminToken={adminToken}
              onEntitySelect={(entity) => {
                // 可以根据实体类型创建对应的节点
                console.log('选择实体:', entity);
              }}
            />
          </div>
        )}

        {/* 节点属性面板 - 条件渲染，关闭时画布会自动延伸 */}
        {selectedNode && !showExecutionPanel && (
          <div className="w-80 border-l border-slate-700 p-4 overflow-y-auto">
            <NodePropertyPanel
              node={convertX6NodeToReactFlowNode(selectedNode)}
              onUpdate={(nodeId, config) => handleNodeUpdate(nodeId, config)}
              adminToken={adminToken}
            />
          </div>
        )}

        {/* 执行日志面板 - 执行时显示 */}
        {showExecutionPanel && (
          <div className="w-96 border-l border-slate-700 bg-slate-900 flex flex-col">
            {/* 面板头部 */}
            <div className="border-b border-slate-700 p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">执行日志</h3>
              <button
                onClick={() => setShowExecutionPanel(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
      </div>

            {/* 当前执行状态 */}
            {executionStatus && (
              <div className="border-b border-slate-700 p-4 bg-slate-800">
                <div className="space-y-3">
                  {/* 执行状态卡片 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">执行状态:</span>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${
                        executionStatus.status === 'COMPLETED' ? 'bg-green-900/50 text-green-300 border border-green-700' :
                        executionStatus.status === 'FAILED' ? 'bg-red-900/50 text-red-300 border border-red-700' :
                        executionStatus.status === 'RUNNING' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700 animate-pulse' :
                        executionStatus.status === 'WAITING' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                        'bg-slate-700 text-slate-300 border border-slate-600'
                      }`}>
                        {executionStatus.status === 'COMPLETED' ? '✓ 已完成' :
                         executionStatus.status === 'FAILED' ? '✗ 执行失败' :
                         executionStatus.status === 'RUNNING' ? '▶ 执行中' :
                         executionStatus.status === 'WAITING' ? '⏸ 等待中' :
                         executionStatus.status}
                      </span>
    </div>
                    {executionStatus.stepCount !== undefined && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded border border-slate-600">
                        <span className="text-xs text-slate-400">步骤</span>
                        <span className="text-sm font-bold text-slate-200">{executionStatus.stepCount}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 当前执行节点 */}
                  {executionStatus.currentNodeId && (
                    <div className="p-2 bg-slate-900/50 rounded border border-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">当前节点:</span>
                        <span className="text-sm font-semibold text-yellow-400">{executionStatus.currentNodeId}</span>
                        {executionStatus.status === 'RUNNING' && (
                          <span className="text-xs text-yellow-500 animate-pulse">●</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 错误信息 */}
                  {executionStatus.errorMessage && (
                    <div className="p-2 bg-red-900/30 border border-red-700 rounded">
                      <div className="text-xs font-semibold text-red-400 mb-1">错误信息:</div>
                      <div className="text-xs text-red-300">{executionStatus.errorMessage}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 用户选择界面（当执行到Choice节点时显示） */}
            {executionStatus && 
             executionStatus.status === 'WAITING' && 
             executionStatus.waitType === 'CHOICE' && 
             executionStatus.state && (
              <ChoiceSelectionPanel
                executionStatus={executionStatus}
                graphId={graphId!}
                adminToken={adminToken!}
                onChoiceSelected={async (optionId: string) => {
                  try {
                    const result = await adminGraphApi.submitChoice(
                      graphId!,
                      executionStatus.executionId,
                      { optionId },
                      adminToken!
                    );
                    setExecutionStatus(result);
                    // 继续轮询
                    if (result.status === 'RUNNING' || result.status === 'WAITING') {
                      startPolling(graphId!, executionStatus.executionId);
                    }
                  } catch (error: any) {
                    showAlert(error.message || '提交选择失败', 'error');
                  }
                }}
              />
            )}

            {/* 执行日志列表 */}
            <div 
              ref={executionLogsRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            >
              {executionLogs.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">
                  {executing ? (
                    <div className="space-y-2">
                      <div className="animate-spin text-yellow-400">⏳</div>
                      <div>等待执行日志...</div>
                    </div>
                  ) : (
                    '暂无执行日志'
                  )}
                </div>
              ) : (
                executionLogs.map((log, index) => {
                  // 获取日志类型的中文名称和图标
                  const getLogTypeInfo = (logType: string) => {
                    switch (logType) {
                      case 'NODE_START':
                        return { icon: '▶', label: '开始执行', color: 'blue' };
                      case 'NODE_END':
                        return { icon: '✓', label: '执行完成', color: 'green' };
                      case 'NODE_ERROR':
                        return { icon: '✗', label: '执行错误', color: 'red' };
                      case 'STATE_CHANGE':
                        return { icon: '🔄', label: '状态变更', color: 'purple' };
                      default:
                        return { icon: '•', label: '日志', color: 'slate' };
                    }
                  };
                  
                  const typeInfo = getLogTypeInfo(log.logType);
                  const isLast = index === executionLogs.length - 1;
                  
                  return (
                    <div
                      key={log.id}
                      className={`relative p-3 rounded-lg border-l-4 ${
                        typeInfo.color === 'blue' ? 'bg-blue-900/10 border-blue-500' :
                        typeInfo.color === 'green' ? 'bg-green-900/10 border-green-500' :
                        typeInfo.color === 'red' ? 'bg-red-900/10 border-red-500' :
                        typeInfo.color === 'purple' ? 'bg-purple-900/10 border-purple-500' :
                        'bg-slate-800/30 border-slate-600'
                      } ${isLast && executing ? 'ring-2 ring-yellow-500/50' : ''}`}
                    >
                      {/* 步骤编号和时间线 */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {log.stepNumber !== undefined && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              typeInfo.color === 'blue' ? 'bg-blue-900/50 text-blue-300' :
                              typeInfo.color === 'green' ? 'bg-green-900/50 text-green-300' :
                              typeInfo.color === 'red' ? 'bg-red-900/50 text-red-300' :
                              typeInfo.color === 'purple' ? 'bg-purple-900/50 text-purple-300' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              #{log.stepNumber}
                            </span>
                          )}
                          <span className={`text-sm font-semibold ${
                            typeInfo.color === 'blue' ? 'text-blue-400' :
                            typeInfo.color === 'green' ? 'text-green-400' :
                            typeInfo.color === 'red' ? 'text-red-400' :
                            typeInfo.color === 'purple' ? 'text-purple-400' :
                            'text-slate-300'
                          }`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                        </div>
                        {log.createdAt && (
                          <span className="text-[10px] text-slate-500">
                            {new Date(log.createdAt).toLocaleTimeString('zh-CN', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              second: '2-digit',
                              fractionalSecondDigits: 3
                            })}
                          </span>
                        )}
                      </div>
                      
                      {/* 节点信息 */}
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-300">节点:</span>
                          <span className="text-sm font-bold text-yellow-400">{log.nodeId}</span>
                          {log.nodeType && (
                            <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400 border border-slate-600">
                              {log.nodeType}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* 日志消息 */}
                      <div className="text-sm text-slate-300 mb-2 leading-relaxed">
                        {log.message}
                      </div>
                      
                      {/* 执行时间 */}
                      {log.executionTimeMs !== undefined && log.executionTimeMs > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] text-slate-500">执行耗时:</span>
                          <span className={`text-xs font-semibold ${
                            log.executionTimeMs > 1000 ? 'text-yellow-400' :
                            log.executionTimeMs > 500 ? 'text-orange-400' :
                            'text-green-400'
                          }`}>
                            {log.executionTimeMs}ms
                          </span>
                        </div>
                      )}
                      
                      {/* 错误信息 */}
                      {log.errorMessage && (
                        <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded">
                          <div className="text-[10px] font-semibold text-red-400 mb-1">错误详情:</div>
                          <div className="text-xs text-red-300 whitespace-pre-wrap break-words">
                            {log.errorMessage}
                          </div>
                        </div>
                      )}
                      
                      {/* 状态快照（如果有） */}
                      {log.stateSnapshot && Object.keys(log.stateSnapshot).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-400">
                            查看状态快照
                          </summary>
                          <pre className="mt-1 p-2 bg-slate-900/50 rounded text-[10px] text-slate-400 overflow-x-auto">
                            {JSON.stringify(log.stateSnapshot, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 用户选择面板组件
 */
interface ChoiceSelectionPanelProps {
  executionStatus: GraphExecutionDTO;
  graphId: number;
  adminToken: string;
  onChoiceSelected: (optionId: string) => Promise<void>;
}

const ChoiceSelectionPanel: React.FC<ChoiceSelectionPanelProps> = ({
  executionStatus,
  onChoiceSelected,
}) => {
  const [submitting, setSubmitting] = useState(false);
  
  // 从执行状态中获取choice节点信息
  const choicePrompt = executionStatus.state?.choice_prompt as string | undefined;
  const choiceOptions = (executionStatus.state?.choice_options as any[]) || [];
  const currentNodeId = executionStatus.currentNodeId;

  const handleSelectOption = async (optionId: string) => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      await onChoiceSelected(optionId);
    } catch (error) {
      console.error('选择失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!choiceOptions || choiceOptions.length === 0) {
    return (
      <div className="border-b border-slate-700 p-4 bg-purple-900/20">
        <div className="text-sm text-slate-300">
          <div className="font-semibold mb-2">❓ 等待用户选择</div>
          <div className="text-xs text-slate-400">节点: {currentNodeId}</div>
          <div className="text-xs text-slate-500 mt-2">暂无可用选项</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-700 p-4 bg-purple-900/20">
      <div className="space-y-3">
        <div className="text-sm text-slate-300">
          <div className="font-semibold mb-1">❓ 请做出选择</div>
          {choicePrompt && (
            <div className="text-xs text-slate-400 mb-3">{choicePrompt}</div>
          )}
          <div className="text-xs text-slate-500 mb-2">节点: {currentNodeId}</div>
        </div>
        
        <div className="space-y-2">
          {choiceOptions.map((option: any, index: number) => {
            const optionId = option.id || option.optionId || `option_${index}`;
            const optionText = option.text || option.label || option.content || `选项 ${index + 1}`;
            const optionDescription = option.description;
            
            return (
              <button
                key={optionId}
                onClick={() => handleSelectOption(optionId)}
                disabled={submitting}
                className={`w-full p-3 text-left rounded border transition-all ${
                  submitting
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-purple-500 text-slate-200 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-semibold">{index + 1}.</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{optionText}</div>
                    {optionDescription && (
                      <div className="text-xs text-slate-400 mt-1">{optionDescription}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {submitting && (
          <div className="text-xs text-slate-400 text-center">提交中...</div>
        )}
      </div>
    </div>
  );
};
