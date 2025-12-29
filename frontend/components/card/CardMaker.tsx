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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">制作卡片</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：模板选择 */}
          <div className="w-64 border-r border-gray-200 flex flex-col">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'template'
                    ? 'bg-pink-100 text-pink-600 border-b-2 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('template')}
              >
                模板
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'custom'
                    ? 'bg-pink-100 text-pink-600 border-b-2 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('custom')}
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
                      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedTemplate?.id === template.id
                          ? 'bg-pink-50 border-pink-400'
                          : 'bg-gray-50 border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="text-sm font-medium text-gray-800 mb-1">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500">{template.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-sm text-gray-500">自定义模式：从空白开始创建</p>
              </div>
            )}
          </div>

          {/* 中间：卡片预览/编辑区 */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
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
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={handleSave}
          >
            保存
          </button>
          <button
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            onClick={handleSendClick}
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

