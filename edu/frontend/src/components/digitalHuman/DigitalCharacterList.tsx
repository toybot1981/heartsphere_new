// 数字人角色列表组件
import React from 'react';
import { DigitalCharacterCard } from './DigitalCharacterCard';
import type { EduCharacter } from '../../types/digitalHuman';

interface DigitalCharacterListProps {
  characters: EduCharacter[];
  ageGroup?: 'elementary' | 'middle';
  onCharacterClick?: (character: EduCharacter) => void;
  showStats?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * 数字人角色列表组件
 * 用于展示多个数字人角色的网格列表
 */
export const DigitalCharacterList: React.FC<DigitalCharacterListProps> = ({
  characters,
  ageGroup = 'elementary',
  onCharacterClick,
  showStats = false,
  loading = false,
  emptyMessage,
  className = '',
}) => {
  const isElementary = ageGroup === 'elementary';

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="w-full aspect-square bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4">{isElementary ? '👤' : '👤'}</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {isElementary ? '还没有角色' : '暂无角色'}
        </h3>
        <p className="text-gray-500">
          {emptyMessage || (isElementary ? '来创建你的第一个数字人角色吧！' : '开始创建你的第一个数字人角色')}
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {characters.map((character) => (
        <DigitalCharacterCard
          key={character.id}
          character={character}
          ageGroup={ageGroup}
          onClick={() => onCharacterClick?.(character)}
          showStats={showStats}
        />
      ))}
    </div>
  );
};
