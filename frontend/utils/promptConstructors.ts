/**
 * 提示词构造工具类
 * 用于生成各种AI图片生成的提示词
 */

/**
 * 获取风格提示词后缀
 */
function getStylePromptSuffix(worldStyle?: string): string {
  const styleMap: Record<string, string> = {
    'anime': 'Style: Modern Chinese Anime (Manhua), vibrant colors, detailed eyes, expressive emotions, cinematic lighting.',
    'realistic': 'Style: Photorealistic, highly detailed, realistic lighting and textures, professional photography quality.',
    'cyberpunk': 'Style: Cyberpunk, neon lights, futuristic technology, dark aesthetic, Blade Runner inspired, high-tech low-life atmosphere.',
    'fantasy': 'Style: Fantasy art, magical elements, epic scenes, mystical atmosphere, high fantasy aesthetic, detailed world-building.',
    'steampunk': 'Style: Steampunk, Victorian era aesthetics, brass and copper machinery, gears and cogs, retro-futuristic technology.',
    'minimalist': 'Style: Minimalist, clean lines, elegant simplicity, modern design, ample white space, refined aesthetics.',
    'watercolor': 'Style: Watercolor painting, soft brushstrokes, dreamy color gradients, artistic and ethereal, flowing pigments.',
    'oil-painting': 'Style: Oil painting, classical art, rich brushstrokes and texture, Renaissance or Baroque inspired, artistic depth.'
  };
  return styleMap[worldStyle || ''] || styleMap['anime'];
}

/**
 * 构造时代封面提示词
 */
export function constructEraCoverPrompt(name: string, description: string, worldStyle?: string): string {
  const styleSuffix = worldStyle ? getStylePromptSuffix(worldStyle) : 'Style: Modern Chinese Anime (Manhua), cinematic lighting, vibrant, epic feel.';
  return `A beautiful, high-quality vertical world illustration for a world named "${name}". The theme is: "${description}". ${styleSuffix}`;
}

/**
 * 构造角色头像提示词
 */
export function constructCharacterAvatarPrompt(
  name: string,
  role: string,
  bio: string,
  themeColor: string,
  worldStyle?: string
): string {
  const styleSuffix = worldStyle ? getStylePromptSuffix(worldStyle) : 'Style: Modern Chinese Anime (Manhua), vibrant colors, detailed eyes.';
  return `High-quality vertical character portrait of ${name}. Role: ${role}. Description: ${bio}. ${styleSuffix} Centered character, abstract background matching theme color ${themeColor}.`;
}

/**
 * 构造角色背景提示词
 */
export function constructCharacterBackgroundPrompt(
  name: string,
  bio: string,
  eraName: string,
  worldStyle?: string
): string {
  const styleSuffix = worldStyle ? getStylePromptSuffix(worldStyle) : 'Style: Modern Chinese Anime (Manhua), high quality, cinematic lighting.';
  return `Atmospheric background scene for the world of "${eraName}". It should match the personality of a character named ${name}, described as: "${bio}". ${styleSuffix}`;
}

/**
 * 构造用户头像提示词
 */
export function constructUserAvatarPrompt(nickname: string, worldStyle?: string): string {
  const styleSuffix = worldStyle ? getStylePromptSuffix(worldStyle) : 'Style: Modern Anime, Cyberpunk, or Dreamy Digital Art.';
  return `Profile avatar for a user named "${nickname}". ${styleSuffix} High quality, centered face or symbol.`;
}

/**
 * 构造心情图片提示词
 */
export function constructMoodPrompt(content: string, worldStyle?: string): string {
  const styleSuffix = worldStyle ? getStylePromptSuffix(worldStyle) : 'Style: Ethereal, Dreamlike, Digital Art, vibrant colors, expressive brushstrokes.';
  return `Abstract, artistic, high-quality illustration representing this emotion/thought: "${content.substring(0, 100)}...". ${styleSuffix}`;
}

