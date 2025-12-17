import React from 'react';
import { StoryNode } from '../../types';

interface ScenarioNodeFlowProps {
    nodes: Record<string, StoryNode>;
    startNodeId: string;
    onNodeClick?: (nodeId: string) => void;
    selectedNodeId?: string;
}

export const ScenarioNodeFlow: React.FC<ScenarioNodeFlowProps> = ({
    nodes,
    startNodeId,
    onNodeClick,
    selectedNodeId
}) => {
    if (!nodes || Object.keys(nodes).length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 text-sm">
                暂无节点数据
            </div>
        );
    }

    // 构建节点层级关系（简单的从左到右布局）
    const nodeList = Object.values(nodes);
    const startNode = nodes[startNodeId] || nodeList[0];

    return (
        <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                节点流程
            </h4>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {nodeList.map((node: StoryNode, index) => {
                    const isStart = node.id === startNodeId;
                    const isSelected = selectedNodeId === node.id;
                    
                    return (
                        <div
                            key={node.id}
                            onClick={() => onNodeClick?.(node.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                isStart
                                    ? 'bg-indigo-900/20 border-indigo-500/50'
                                    : isSelected
                                    ? 'bg-slate-800 border-slate-600'
                                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {isStart && (
                                            <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold">
                                                START
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400">#{index + 1}</span>
                                        <h5 className={`font-bold text-sm truncate ${
                                            isStart ? 'text-indigo-300' : 'text-white'
                                        }`}>
                                            {node.title}
                                        </h5>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                        {node.prompt || '暂无内容...'}
                                    </p>
                                    {node.options && node.options.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {node.options.map((opt, optIdx) => (
                                                <div
                                                    key={opt.id || optIdx}
                                                    className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-400"
                                                    title={`跳转到: ${nodes[opt.nextNodeId]?.title || opt.nextNodeId}`}
                                                >
                                                    <span className="text-slate-500">→</span> {opt.text || '未命名选项'}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {(!node.options || node.options.length === 0) && (
                                        <span className="text-xs text-slate-600 italic">无分支（结束节点）</span>
                                    )}
                                </div>
                                {onNodeClick && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNodeClick(node.id);
                                        }}
                                        className="text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
                                        title="点击编辑节点"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {nodeList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
                    共 {nodeList.length} 个节点，{nodeList.reduce((sum, n) => sum + (n.options?.length || 0), 0)} 个分支选项
                </div>
            )}
        </div>
    );
};
