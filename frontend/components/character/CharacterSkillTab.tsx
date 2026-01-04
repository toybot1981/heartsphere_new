import React from 'react';
import { CharacterSkillManagement } from './CharacterSkillManagement';

interface CharacterSkillTabProps {
  characterId: number;
  characterName?: string;
  adminToken?: string | null;
}

/**
 * 角色技能标签页组件
 * 用于集成到角色详情或编辑页面
 */
export const CharacterSkillTab: React.FC<CharacterSkillTabProps> = ({
  characterId,
  characterName,
  adminToken,
}) => {
  return (
    <div className="character-skill-tab">
      <CharacterSkillManagement
        characterId={characterId}
        characterName={characterName}
        adminToken={adminToken}
      />
    </div>
  );
};
