import React from 'react';
import { SkillsManagement } from '../SkillsManagement';

interface CharacterSkillTabProps {
  characterId: number;
  characterName?: string;
  adminToken?: string | null;
}

/**
 * 角色技能标签页组件 - Admin 版本
 * 用于集成到角色详情或编辑页面
 * 注意：目前使用通用的 SkillsManagement，未来可以扩展为角色特定的技能管理
 */
export const CharacterSkillTab: React.FC<CharacterSkillTabProps> = ({
  characterId,
  characterName,
  adminToken,
}) => {
  return (
    <div className="character-skill-tab p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">
          {characterName ? `${characterName} 的技能管理` : '技能管理'}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          角色 ID: {characterId}
        </p>
      </div>
      <SkillsManagement adminToken={adminToken || null} />
    </div>
  );
};
