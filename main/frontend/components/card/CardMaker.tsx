/**
 * 卡片制作工具组件
 */

import React, { useState, useEffect } from 'react';
import { Card, CardTemplate, CardType } from '../../services/card-system/types/CardTypes';
import { useCardSystem } from '../../services/card-system/hooks/useCardSystem';
import { CardEditor } from './CardEditor';
import { CardPreview } from './CardPreview';
import { CardSender } from './CardSender';

interface CardMakerProps {
  templateId?: string;
  initialCard?: Partial<Card>;
  userId: number;
  onSave?: (card: Card) => void;
  onSend?: (card: Card, recipientId: number) => void;
  onClose: () => void;
}

export const CardMaker: React.FC<CardMakerProps> = ({
  templateId,
  initialCard,
  userId,
  onSave,
  onSend,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [card, setCard] = useState<Partial<Card>>({
    type: CardType.GREETING,
    title: '',
    content: '',
    background: { type: 'color', value: '#FFE5E5' },
    style: {
      titleFont: 'Arial',
      titleColor: '#333',
      titleSize: 24,
      contentFont: 'Arial',
      contentColor: '#666',
      contentSize: 16,
      layout: {
        type: 'centered',
        titlePosition: 'top',
        contentPosition: 'center',
      },
    },
    ...initialCard,
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'template' | 'custom'>('template');
  const [showSender, setShowSender] = useState(false);

  const cardSystem = useCardSystem({
    enabled: true,
    userId,
  });

  // 加载模板列表
  const templates = cardSystem.getAllTemplates();

  // 加载预设模板
  useEffect(() => {
    if (templateId && cardSystem.isReady) {
      const template = cardSystem.getTemplateById(templateId);
      if (template) {
        applyTemplate(template);
      }
    }
  }, [templateId, cardSystem.isReady]);

  const applyTemplate = (template: CardTemplate) => {
    setSelectedTemplate(template);
    setCard({
      ...card,
      type: template.type,
      templateId: template.id,
      background: template.background,
      style: {
        ...card.style!,
        ...template.defaultStyle,
        layout: template.layout,
      },
    });
  };

  const handleSave = async () => {
    if (cardSystem.isReady) {
      const savedCard = await cardSystem.createCard(card as Card);
      onSave?.(savedCard);
      onClose();
    }
  };

  const handleSendClick = () => {
    setShowSender(true);
  };

  const handleSend = async (recipientId: number, message?: string) => {
    if (cardSystem.isReady) {
      const savedCard = await cardSystem.createCard(card as Card);
      onSend?.(savedCard, recipientId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.5))' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--bg-modal, #ffffff)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-color-overlay, #e5e7eb)' }}
        >
          <h3 
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            制作卡片
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(243, 244, 246, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：模板选择 */}
          <div 
            className="w-64 border-r flex flex-col"
            style={{ borderColor: 'var(--border-color-overlay)' }}
          >
            <div 
              className="flex border-b"
              style={{ borderColor: 'var(--border-color-overlay)' }}
            >
              <button
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === 'template'
                    ? 'var(--color-primary, rgba(236, 72, 153, 0.2))'
                    : 'transparent',
                  color: activeTab === 'template'
                    ? 'var(--color-primary, #ec4899)'
                    : 'var(--text-secondary)',
                  borderBottom: activeTab === 'template' ? '2px solid var(--color-primary, #ec4899)' : 'none',
                }}
                onClick={() => setActiveTab('template')}
                onMouseEnter={(e) => {
                  if (activeTab !== 'template') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(243, 244, 246, 1))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'template') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                模板
              </button>
              <button
                className="flex-1 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === 'custom'
                    ? 'var(--color-primary, rgba(236, 72, 153, 0.2))'
                    : 'transparent',
                  color: activeTab === 'custom'
                    ? 'var(--color-primary, #ec4899)'
                    : 'var(--text-secondary)',
                  borderBottom: activeTab === 'custom' ? '2px solid var(--color-primary, #ec4899)' : 'none',
                }}
                onClick={() => setActiveTab('custom')}
                onMouseEnter={(e) => {
                  if (activeTab !== 'custom') {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(243, 244, 246, 1))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'custom') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                自定义
              </button>
            </div>

            {activeTab === 'template' && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 rounded-lg cursor-pointer transition-all border-2"
                      style={{
                        backgroundColor: selectedTemplate?.id === template.id
                          ? 'var(--color-primary, rgba(236, 72, 153, 0.1))'
                          : 'var(--bg-card, rgba(249, 250, 251, 1))',
                        borderColor: selectedTemplate?.id === template.id
                          ? 'var(--color-primary, #ec4899)'
                          : 'transparent',
                      }}
                      onClick={() => applyTemplate(template)}
                      onMouseEnter={(e) => {
                        if (selectedTemplate?.id !== template.id) {
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay, #d1d5db)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTemplate?.id !== template.id) {
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      <div 
                        className="text-sm font-medium mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {template.name}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {template.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>自定义模式：从空白开始创建</p>
              </div>
            )}
          </div>

          {/* 中间：卡片预览/编辑区 */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 rounded-lg transition-colors text-sm"
                style={{
                  backgroundColor: 'var(--bg-card, rgba(243, 244, 246, 1))',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(229, 231, 235, 1))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(243, 244, 246, 1))';
                }}
              >
                {previewMode ? '编辑' : '预览'}
              </button>
            </div>

            {previewMode ? (
              <CardPreview card={card as Card} />
            ) : (
              <CardEditor
                card={card}
                onChange={setCard}
                selectedTemplate={selectedTemplate}
                userId={userId}
              />
            )}
          </div>
        </div>

        {/* 底部操作 */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: 'var(--border-color-overlay, #e5e7eb)' }}
        >
          <button
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-card, rgba(243, 244, 246, 1))',
              color: 'var(--text-primary)',
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(229, 231, 235, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(243, 244, 246, 1))';
            }}
          >
            取消
          </button>
          <button
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-info, #3b82f6)',
              color: 'var(--text-primary)',
            }}
            onClick={handleSave}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-info, #2563eb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-info, #3b82f6)';
            }}
          >
            保存
          </button>
          <button
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-primary, #ec4899)',
              color: 'var(--text-primary)',
            }}
            onClick={handleSendClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #db2777)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #ec4899)';
            }}
          >
            发送
          </button>
        </div>
      </div>

      {/* 卡片发送对话框 */}
      {showSender && (
        <CardSender
          card={card as Card}
          userId={userId}
          onSend={handleSend}
          onClose={() => setShowSender(false)}
        />
      )}
    </div>
  );
};

