/**
 * 预设提示词模板库
 * 涵盖常见的资源类型，用于AI生成图片
 */

export interface PromptTemplate {
  name: string;
  prompt: string;
  description?: string;
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate[]> = {
  // 头像类提示词
  avatar: [
    {
      name: '二次元头像',
      prompt: 'High-quality character portrait, anime style, detailed eyes, expressive emotions, vibrant colors, centered face, soft lighting, professional illustration, 4K quality',
      description: '现代二次元风格头像'
    },
    {
      name: '写实头像',
      prompt: 'Photorealistic portrait, professional photography, natural lighting, detailed facial features, high resolution, studio quality, 8K',
      description: '写实风格头像'
    },
    {
      name: '赛博朋克头像',
      prompt: 'Cyberpunk character portrait, neon lights, futuristic aesthetic, dark background, glowing effects, high-tech low-life atmosphere, cinematic lighting',
      description: '赛博朋克风格头像'
    },
    {
      name: '古风头像',
      prompt: 'Traditional Chinese style character portrait, ancient costume, elegant pose, ink painting aesthetic, classical beauty, refined details',
      description: '中国古风头像'
    },
    {
      name: '极简头像',
      prompt: 'Minimalist character avatar, clean lines, simple design, modern aesthetic, geometric shapes, elegant simplicity, flat design',
      description: '极简风格头像'
    }
  ],

  // 角色类提示词
  character: [
    {
      name: '二次元角色立绘',
      prompt: 'Full body character illustration, anime style, detailed design, dynamic pose, vibrant colors, expressive character, professional artwork, 4K quality, vertical composition',
      description: '二次元角色全身立绘'
    },
    {
      name: '写实角色',
      prompt: 'Photorealistic character design, full body, professional photography, natural lighting, detailed costume, high resolution, cinematic composition',
      description: '写实风格角色'
    },
    {
      name: '奇幻角色',
      prompt: 'Fantasy character illustration, magical elements, epic design, detailed armor or costume, mystical atmosphere, high fantasy aesthetic, professional artwork',
      description: '奇幻风格角色'
    },
    {
      name: '赛博朋克角色',
      prompt: 'Cyberpunk character design, futuristic outfit, neon accents, high-tech elements, dark aesthetic, Blade Runner inspired, cinematic lighting',
      description: '赛博朋克风格角色'
    },
    {
      name: '古风角色',
      prompt: 'Traditional Chinese character design, ancient costume, elegant pose, classical beauty, refined details, ink painting style, cultural heritage',
      description: '中国古风角色'
    },
    {
      name: '角色背景',
      prompt: 'Atmospheric background scene for character, matching personality and theme, detailed environment, cinematic lighting, immersive setting, professional illustration',
      description: '角色背景场景'
    }
  ],

  // 场景类提示词
  era: [
    {
      name: '二次元世界',
      prompt: 'Beautiful vertical world illustration, anime style, vibrant colors, detailed environment, epic feel, cinematic lighting, immersive atmosphere, 4K quality',
      description: '二次元风格世界场景'
    },
    {
      name: '写实世界',
      prompt: 'Photorealistic world scene, highly detailed, realistic lighting and textures, professional photography quality, immersive environment, 8K resolution',
      description: '写实风格世界场景'
    },
    {
      name: '奇幻世界',
      prompt: 'Fantasy world illustration, magical elements, epic scenes, mystical atmosphere, high fantasy aesthetic, detailed world-building, professional artwork',
      description: '奇幻风格世界场景'
    },
    {
      name: '赛博朋克世界',
      prompt: 'Cyberpunk cityscape, neon lights, futuristic technology, dark aesthetic, Blade Runner inspired, high-tech low-life atmosphere, cinematic composition',
      description: '赛博朋克风格世界'
    },
    {
      name: '古风世界',
      prompt: 'Traditional Chinese world scene, ancient architecture, classical beauty, ink painting aesthetic, cultural heritage, refined details, elegant atmosphere',
      description: '中国古风世界场景'
    },
    {
      name: '蒸汽朋克世界',
      prompt: 'Steampunk world illustration, Victorian era aesthetics, brass and copper machinery, gears and cogs, retro-futuristic technology, detailed design',
      description: '蒸汽朋克风格世界'
    },
    {
      name: '未来科幻世界',
      prompt: 'Futuristic sci-fi world, advanced technology, space elements, high-tech environment, epic scale, cinematic lighting, professional illustration',
      description: '未来科幻风格世界'
    },
    {
      name: '自然风景',
      prompt: 'Beautiful natural landscape, serene atmosphere, detailed environment, natural lighting, peaceful scene, high quality, professional photography',
      description: '自然风景场景'
    }
  ],

  // 剧本类提示词
  scenario: [
    {
      name: '剧情场景',
      prompt: 'Dramatic scene illustration, storytelling atmosphere, detailed composition, cinematic lighting, emotional depth, professional artwork, immersive setting',
      description: '剧情场景图'
    },
    {
      name: '对话场景',
      prompt: 'Conversation scene, character interaction, detailed environment, natural lighting, storytelling composition, professional illustration',
      description: '对话场景图'
    },
    {
      name: '战斗场景',
      prompt: 'Action scene, dynamic composition, intense atmosphere, dramatic lighting, detailed action, epic scale, professional artwork',
      description: '战斗场景图'
    },
    {
      name: '温馨场景',
      prompt: 'Warm and cozy scene, soft lighting, peaceful atmosphere, detailed environment, emotional warmth, professional illustration',
      description: '温馨场景图'
    }
  ],

  // 日记类提示词
  journal: [
    {
      name: '日常记录',
      prompt: 'Daily life scene, natural lighting, realistic atmosphere, detailed environment, personal moment, professional photography quality',
      description: '日常记录场景'
    },
    {
      name: '回忆场景',
      prompt: 'Nostalgic scene, soft lighting, emotional atmosphere, memory-like quality, detailed composition, artistic photography',
      description: '回忆场景图'
    },
    {
      name: '心情记录',
      prompt: 'Emotional scene, atmospheric lighting, expressive composition, detailed environment, mood-based design, professional artwork',
      description: '心情记录场景'
    }
  ],

  // 通用类提示词
  general: [
    {
      name: '抽象艺术',
      prompt: 'Abstract art, creative composition, artistic design, vibrant colors, unique style, professional artwork, high quality',
      description: '抽象艺术作品'
    },
    {
      name: '装饰图案',
      prompt: 'Decorative pattern, elegant design, detailed ornamentation, artistic style, refined aesthetics, professional illustration',
      description: '装饰图案'
    },
    {
      name: '图标设计',
      prompt: 'Icon design, clean lines, modern aesthetic, simple yet detailed, professional graphic design, high quality',
      description: '图标设计'
    }
  ]
};

/**
 * 根据分类获取提示词模板
 */
export function getPromptTemplates(category: string): string[] {
  const templates = PROMPT_TEMPLATES[category] || [];
  return templates.map(t => t.prompt);
}

/**
 * 获取所有模板（用于选择）
 */
export function getAllTemplatesForCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES[category] || [];
}



