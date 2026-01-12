// 数字人角色卡片组件
import React from 'react';
import { Card } from '../common/Card';
import type { EduCharacter } from '../../types/digitalHuman';

interface DigitalCharacterCardProps {
  character: EduCharacter;
  ageGroup?: 'elementary' | 'middle';
  onClick?: () => void;
  showStats?: boolean;
  className?: string;
}

/**
 * 数字人角色卡片组件
 * 用于展示单个数字人角色的信息
 */
export const DigitalCharacterCard: React.FC<DigitalCharacterCardProps> = ({
  character,
  ageGroup = 'elementary',
  onClick,
  showStats = false,
  className = '',
}) => {
  const isElementary = ageGroup === 'elementary';
  
  // 角色类型显示文本
  const characterTypeLabels: Record<string, string> = {
    teaching_assistant: isElementary ? '📚 教学助手' : '教学助手',
    learning_companion: isElementary ? '👥 学习伙伴' : '学习伙伴',
    counseling: isElementary ? '💚 心理辅导' : '心理辅导',
    homework_helper: isElementary ? '✏️ 作业辅导' : '作业辅导',
    subject_explainer: isElementary ? '📖 学科讲解' : '学科讲解',
  };

  // 难度等级显示文本
  const difficultyLabels: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  };

  // 评分显示（星星）
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    const stars = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        <span className="text-yellow-400 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
        <span className="text-xs text-gray-500">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <Card
      onClick={onClick}
      className={`hover:shadow-xl transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="relative">
        {/* 头像 */}
        <div className="w-full aspect-square mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          {character.avatarUrl ? (
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : character.backgroundUrl ? (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${character.backgroundUrl})` }}
            />
          ) : (
            <div className="text-6xl">
              {isElementary ? '👤' : '👤'}
            </div>
          )}
          {/* 角色类型标签 */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isElementary 
                ? 'bg-primary-elementary-500 text-white' 
                : 'bg-primary-middle-500 text-white'
            }`}>
              {characterTypeLabels[character.characterType] || character.characterType}
            </span>
          </div>
        </div>

        {/* 角色信息 */}
        <div className="space-y-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
              {character.name}
            </h3>
            {character.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {character.description}
              </p>
            )}
          </div>

          {/* 学科标签 */}
          {character.subjectTags && character.subjectTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {character.subjectTags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {character.subjectTags.length > 3 && (
                <span className="px-2 py-0.5 text-gray-500 text-xs">
                  +{character.subjectTags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 难度等级和语言风格 */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {character.difficultyLevel && (
              <span>{difficultyLabels[character.difficultyLevel] || character.difficultyLevel}</span>
            )}
            {character.difficultyLevel && character.languageStyle && <span>•</span>}
            {character.languageStyle && (
              <span>
                {character.languageStyle === 'formal' ? '正式' : 
                 character.languageStyle === 'casual' ? '随意' : '友好'}
              </span>
            )}
          </div>

          {/* 统计信息 */}
          {showStats && (
            <div className="pt-2 border-t border-gray-200 space-y-1">
              {character.totalInteractions !== undefined && character.totalInteractions > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>互动次数</span>
                  <span className="font-semibold">{character.totalInteractions}</span>
                </div>
              )}
              {character.uniqueStudents !== undefined && character.uniqueStudents > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>使用学生</span>
                  <span className="font-semibold">{character.uniqueStudents}</span>
                </div>
              )}
              {character.averageRating !== undefined && character.averageRating > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">评分</span>
                  {renderRating(character.averageRating)}
                </div>
              )}
            </div>
          )}

          {/* 适用年龄段 */}
          {character.ageGroupSuitability && character.ageGroupSuitability.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                适用：{character.ageGroupSuitability.map(ag => 
                  ag === 'primary_6_12' ? '小学' : '中学'
                ).join('、')}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
