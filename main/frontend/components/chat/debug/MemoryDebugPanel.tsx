/**
 * 记忆调试面板
 * 显示记忆的提取、检索、注入过程，便于调试
 */

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Collapse, IconButton, Chip, Divider } from '@mui/material';
import { ExpandMore, ExpandLess, Memory, Search, Upload, Info } from '@mui/icons-material';
import { logger } from '../../../utils/logger';

export interface MemoryDebugInfo {
  // 记忆检索信息
  retrieval?: {
    query: string;
    results: Array<{
      id: string;
      type: string;
      content: string;
      summary?: string;
      importance?: number;
    }>;
    timestamp: number;
    duration?: number;
  };
  
  // 记忆注入信息
  injection?: {
    memories: Array<{
      id: string;
      type: string;
      content: string;
      summary?: string;
    }>;
    formattedContext: string;
    tokenCount?: number;
    timestamp: number;
  };
  
  // 记忆提取信息
  extraction?: {
    source: string;
    extracted: Array<{
      type: string;
      content: string;
      summary?: string;
      confidence?: number;
    }>;
    hsmemResult?: {
      resourceId: string;
      itemsCount: number;
      categories: string[];
    };
    timestamp: number;
    duration?: number;
  };
}

interface MemoryDebugPanelProps {
  debugInfo: MemoryDebugInfo | null;
  onClose?: () => void;
  highlightedMemoryId?: string | null;
}

export const MemoryDebugPanel: React.FC<MemoryDebugPanelProps> = ({ 
  debugInfo, 
  onClose,
  highlightedMemoryId 
}) => {
  const [expanded, setExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    retrieval: true,
    injection: true,
    extraction: true,
  });

  if (!debugInfo) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      'preference': '#4caf50',
      'habit': '#2196f3',
      'personal_info': '#ff9800',
      'event': '#f44336',
      'asset': '#9c27b0',
      'work': '#00bcd4',
      'general': '#9e9e9e',
    };
    return colorMap[type] || colorMap.general;
  };

  return (
    <Card
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 480,
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 10000,
        boxShadow: 4,
        bgcolor: 'background.paper',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>🧠 记忆调试面板</Typography>
          </Box>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            <Typography>{expanded ? '▼' : '▶'}</Typography>
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          {/* 记忆检索 */}
          {debugInfo.retrieval && (
            <Box mb={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => toggleSection('retrieval')}
                sx={{ cursor: 'pointer' }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>🔍</Typography>
                  <Typography variant="subtitle2">记忆检索</Typography>
                  <Chip label={debugInfo.retrieval.results.length} size="small" />
                  {debugInfo.retrieval.duration && (
                    <Chip label={`${debugInfo.retrieval.duration}ms`} size="small" variant="outlined" />
                  )}
                </Box>
                <Typography>{expandedSections.retrieval ? '▼' : '▶'}</Typography>
              </Box>
              <Collapse in={expandedSections.retrieval}>
                <Box mt={1} pl={2}>
                  <Typography variant="caption" color="text.secondary">
                    查询: {debugInfo.retrieval.query}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    时间: {new Date(debugInfo.retrieval.timestamp).toLocaleTimeString()}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {debugInfo.retrieval.results.map((result, idx) => (
                    <Box key={idx} mb={1} p={1} sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Box display="flex" gap={1} alignItems="center" mb={0.5}>
                        <Chip
                          label={result.type}
                          size="small"
                          sx={{ bgcolor: getTypeColor(result.type), color: 'white' }}
                        />
                        {result.importance && (
                          <Chip
                            label={`重要性: ${(result.importance * 100).toFixed(0)}%`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {result.summary || result.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* 记忆注入 */}
          {debugInfo.injection && (
            <Box mb={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => toggleSection('injection')}
                sx={{ cursor: 'pointer' }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>📤</Typography>
                  <Typography variant="subtitle2">记忆注入</Typography>
                  <Chip label={debugInfo.injection.memories.length} size="small" />
                  {debugInfo.injection.tokenCount && (
                    <Chip label={`${debugInfo.injection.tokenCount} tokens`} size="small" variant="outlined" />
                  )}
                </Box>
                <Typography>{expandedSections.injection ? '▼' : '▶'}</Typography>
              </Box>
              <Collapse in={expandedSections.injection}>
                <Box mt={1} pl={2}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    时间: {new Date(debugInfo.injection.timestamp).toLocaleTimeString()}
                  </Typography>
                  
                  {/* 记忆列表 */}
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                    注入的记忆项 ({debugInfo.injection.memories.length}):
                  </Typography>
                  {debugInfo.injection.memories.map((memory, idx) => (
                    <Box key={idx} mb={1} p={1} sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Box display="flex" gap={1} alignItems="center" mb={0.5}>
                        <Chip
                          label={memory.type}
                          size="small"
                          sx={{ bgcolor: getTypeColor(memory.type), color: 'white' }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          ID: {memory.id || `memory_${idx}`}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.5, whiteSpace: 'pre-wrap' }}>
                        {memory.summary || memory.content}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* 格式化后的提示词内容 */}
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                    作为提示词注入的内容:
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      p: 1.5,
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {debugInfo.injection.formattedContext || '[无记忆内容]'}
                  </Box>
                  
                  {/* Token 统计 */}
                  {debugInfo.injection.tokenCount && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        估算 Token 数: {Math.round(debugInfo.injection.tokenCount)} tokens
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* 记忆提取 */}
          {debugInfo.extraction && (
            <Box mb={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => toggleSection('extraction')}
                sx={{ cursor: 'pointer' }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>ℹ️</Typography>
                  <Typography variant="subtitle2">记忆提取</Typography>
                  <Chip label={debugInfo.extraction.extracted.length} size="small" />
                  {debugInfo.extraction.duration && (
                    <Chip label={`${debugInfo.extraction.duration}ms`} size="small" variant="outlined" />
                  )}
                </Box>
                <Typography>{expandedSections.extraction ? '▼' : '▶'}</Typography>
              </Box>
              <Collapse in={expandedSections.extraction}>
                <Box mt={1} pl={2}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    来源: {debugInfo.extraction.source}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    时间: {new Date(debugInfo.extraction.timestamp).toLocaleTimeString()}
                  </Typography>
                  {debugInfo.extraction.hsmemResult && (
                    <Box mb={1} p={1} sx={{ bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        HSMem 结果:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        资源ID: {debugInfo.extraction.hsmemResult.resourceId}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        记忆项: {debugInfo.extraction.hsmemResult.itemsCount}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        分类: {debugInfo.extraction.hsmemResult.categories.join(', ')}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  {debugInfo.extraction.extracted.map((item, idx) => (
                    <Box key={idx} mb={1} p={1} sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Box display="flex" gap={1} alignItems="center" mb={0.5}>
                        <Chip
                          label={item.type}
                          size="small"
                          sx={{ bgcolor: getTypeColor(item.type), color: 'white' }}
                        />
                        {item.confidence && (
                          <Chip
                            label={`置信度: ${(item.confidence * 100).toFixed(0)}%`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                        {item.summary || item.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};
