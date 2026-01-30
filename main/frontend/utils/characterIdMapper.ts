/**
 * 角色ID映射工具
 * 统一处理前端字符串ID和后端数字ID之间的转换
 * 
 * 规则：
 * 1. 数字字符串直接转换为数字
 * 2. narrator_${scenarioId} -> 使用固定的系统角色ID（-1）或 scenarioId（如果scenarioId是数字）
 * 3. preset_* -> 使用固定的系统角色ID（-2）
 * 4. temp_* -> 使用固定的系统角色ID（-3）
 */

/**
 * 系统角色ID常量
 * 注意：这些ID用于标识系统角色，但后端可能不支持这些ID的成长系统
 * 如果后端需要支持系统角色，应该使用正数ID（如 0 或特殊值）
 */
export const SYSTEM_CHARACTER_IDS = {
  /** 旁白角色（Narrator）的统一ID - 使用 0 表示所有 narrator */
  NARRATOR: 0,
  /** 预设角色（Preset）的统一ID */
  PRESET: -2,
  /** 临时角色（Temporary）的统一ID */
  TEMP: -3,
} as const;

/**
 * 将前端角色ID转换为后端数字ID
 * @param characterId - 前端角色ID（可能是字符串或数字）
 * @returns 后端数字ID，如果无法转换则返回 null
 */
export function normalizeCharacterId(characterId: string | number): number | null {
  // 如果已经是数字，直接返回
  if (typeof characterId === 'number') {
    return characterId > 0 ? characterId : null;
  }

  // 如果是数字字符串，直接转换
  const numericId = parseInt(characterId, 10);
  if (!isNaN(numericId) && numericId > 0 && /^\d+$/.test(characterId)) {
    return numericId;
  }

  // 处理 narrator_${scenarioId} 格式
  if (characterId.startsWith('narrator_')) {
    const scenarioId = characterId.replace('narrator_', '');
    const scenarioIdNum = parseInt(scenarioId, 10);
    // 如果 scenarioId 是数字，可以使用它；否则使用固定的 NARRATOR ID
    if (!isNaN(scenarioIdNum) && scenarioIdNum > 0) {
      // 使用 scenarioId 作为映射，但加上一个偏移量避免与真实角色ID冲突
      // 或者直接使用固定的 NARRATOR ID
      return SYSTEM_CHARACTER_IDS.NARRATOR;
    }
    return SYSTEM_CHARACTER_IDS.NARRATOR;
  }

  // 处理 preset_* 格式
  if (characterId.startsWith('preset_')) {
    return SYSTEM_CHARACTER_IDS.PRESET;
  }

  // 处理 temp_* 格式
  if (characterId.startsWith('temp_')) {
    return SYSTEM_CHARACTER_IDS.TEMP;
  }

  // 无法识别的格式
  return null;
}

/**
 * 检查角色ID是否为系统角色
 * @param characterId - 角色ID
 * @returns 是否为系统角色
 */
export function isSystemCharacter(characterId: string | number): boolean {
  const normalizedId = normalizeCharacterId(characterId);
  if (normalizedId === null) {
    return false;
  }
  return normalizedId < 0; // 系统角色使用负数ID
}

/**
 * 检查角色ID是否有效（可以用于API调用）
 * @param characterId - 角色ID
 * @returns 是否有效
 */
export function isValidCharacterId(characterId: string | number): boolean {
  const normalizedId = normalizeCharacterId(characterId);
  // 只有正数ID（> 0）才有效，系统角色（0或负数）不支持成长系统
  return normalizedId !== null && normalizedId > 0;
}

/**
 * 获取角色ID的原始字符串表示（用于前端显示和存储）
 * @param characterId - 角色ID
 * @returns 原始字符串ID
 */
export function getOriginalCharacterId(characterId: string | number): string {
  return String(characterId);
}
