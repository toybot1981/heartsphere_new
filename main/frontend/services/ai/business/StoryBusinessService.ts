/**
 * 故事/剧本相关业务逻辑服务
 * 从 gemini.ts 中提取的故事生成相关方法
 */

import { AIService } from '../AIService';
import { StoryNode, CustomScenario } from '../../../types';

/**
 * 故事业务服务
 */
export class StoryBusinessService {
  constructor(private aiService: AIService) {}

  /**
   * 生成主线剧情
   */
  async generateMainStory(
    eraName: string,
    eraDescription: string,
    characters: Array<{name: string, role: string, bio: string}>,
    optionalPrompt?: string
  ): Promise<{
    name: string;
    role: string;
    bio: string;
    firstMessage: string;
    themeColor: string;
    colorAccent: string;
    age?: number;
    voiceName?: string;
    tags?: string;
    speechStyle?: string;
    motivations?: string;
  } | null> {
    try {
      const charactersInfo = characters.map(c => `- ${c.name} (${c.role}): ${c.bio || '无简介'}`).join('\n');
      const userPrompt = optionalPrompt 
        ? `场景: "${eraName}"\n场景描述: ${eraDescription}\n\n预设角色:\n${charactersInfo}\n\n额外要求: ${optionalPrompt}\n\n请为这个场景生成一个完整的主线剧情序章。`
        : `场景: "${eraName}"\n场景描述: ${eraDescription}\n\n预设角色:\n${charactersInfo}\n\n请为这个场景生成一个完整的主线剧情序章。`;

      const systemPrompt = `You are a creative narrative director for an interactive story game. Create a main story prologue (主线剧情序章) for a scene/era.

The prologue should:
- Hook the player with an immersive opening scene
- Set the atmosphere and tone
- Introduce a key event or choice point
- Be engaging and draw the player into the story

Output JSON only with these properties:
- name: Story title (e.g., "未完成的春日合奏", "霓虹下的忒修斯")
- role: "叙事者" or "剧情向导"
- bio: Brief story description (2-3 sentences)
- firstMessage: Opening message (序幕) - should be immersive, set the scene, include an event or hook. Format: 【序幕：标题】\\n\\n[详细描述]\\n\\n[突发事件或选择提示]
- themeColor: Tailwind color class (e.g., "indigo-500", "cyan-500")
- colorAccent: Hex color (e.g., "#6366f1", "#06b6d4")
- age: Number (narrator age, usually 20-30)
- voiceName: Voice name (e.g., "Fenrir", "Charon")
- tags: Comma-separated tags (e.g., "Narrator,Story,Adventure")
- speechStyle: Description of narrative style (e.g., "紧张，快节奏，冷硬派" or "温柔，诗意，充满希望")
- motivations: What drives the story forward

The content MUST be in Chinese. The story should be engaging, with clear character involvement and meaningful choices.`;

      const responseText = await this.aiService.generateTextString(userPrompt, systemPrompt, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const details = JSON.parse(jsonStr);

      return {
        name: details.name || `${eraName}的主线剧情`,
        role: details.role || '叙事者',
        bio: details.bio || '',
        firstMessage: details.firstMessage || '',
        themeColor: details.themeColor || 'indigo-500',
        colorAccent: details.colorAccent || '#6366f1',
        age: details.age || 25,
        voiceName: details.voiceName || 'Fenrir',
        tags: details.tags || 'Narrator,Story',
        speechStyle: details.speechStyle || '',
        motivations: details.motivations || ''
      };
    } catch (error) {
      console.error('[StoryBusinessService] 生成主线剧情失败:', error);
      return null;
    }
  }

  /**
   * 从提示词生成场景
   */
  async generateScenarioFromPrompt(prompt: string): Promise<CustomScenario | null> {
    try {
      const systemPrompt = `You are a creative director for an interactive visual novel game.
Based on the user's idea, generate a branching scenario structure in JSON format.
JSON Structure: { "title": "...", "description": "...", "startNodeId": "node_1", "nodes": { "node_1": { "id": "node_1", "title": "...", "prompt": "...", "options": [...] } } }
Create at least 3-4 nodes with choices. The content MUST be in Chinese.`;

      const responseText = await this.aiService.generateTextString(prompt, systemPrompt, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const scenarioData = JSON.parse(jsonStr);

      const scenario: CustomScenario = {
        id: `scenario_${Date.now()}`,
        sceneId: '', 
        author: 'AI Architect',
        ...scenarioData
      };
      return scenario;
    } catch (error) {
      console.error('[StoryBusinessService] 生成场景失败:', error);
      return null;
    }
  }

  /**
   * 根据标题、场景、简介、标签和角色生成剧本节点流程
   */
  async generateScriptWithCharacters(params: {
    title: string;
    sceneName: string;
    sceneDescription?: string;
    description?: string;
    tags?: string;
    characters: Array<{
      id: string;
      name: string;
      role?: string;
      bio?: string;
    }>;
  }): Promise<{ nodes: Record<string, StoryNode>; startNodeId: string }> {
    try {
      // 构建角色信息字符串
      let characterInfo = '';
      if (params.characters && params.characters.length > 0) {
        characterInfo = '\n\n参与角色信息：\n';
        params.characters.forEach(char => {
          characterInfo += `- ${char.name}`;
          if (char.role) characterInfo += `（${char.role}）`;
          if (char.bio) characterInfo += `：${char.bio}`;
          characterInfo += '\n';
        });
        characterInfo += '\n故事应主要围绕这些角色展开，确保他们的性格、背景和关系在故事中得到体现。';
      }

      // 构建标签信息
      const tagsInfo = params.tags ? `\n标签：${params.tags}` : '';

      // 构建场景信息
      const sceneInfo = params.sceneDescription 
        ? `\n场景背景：${params.sceneDescription}`
        : '';

      const userPrompt = `请根据以下信息创建一个互动视觉小说剧本的节点流程结构：

剧本标题：${params.title}
${sceneInfo}
场景名称：${params.sceneName}
${params.description ? `剧本简介：${params.description}` : ''}
${tagsInfo}
${characterInfo}

请生成一个包含至少4-6个节点的分支剧情结构。每个节点应包含：
- id: 节点唯一标识符（如 "start", "node_1", "node_2" 等）
- title: 节点标题（简短描述）
- prompt: 场景描述和剧情推进内容（要详细，包含对话和动作，使用中文）
- options: 选项数组，每个选项包含 id, text（选项文本）, nextNodeId（指向的下一个节点ID）

要求：
1. 第一个节点的id必须是"start"
2. 每个节点应该有2-3个选项分支
3. 剧情要有逻辑性和连贯性
4. 内容必须使用中文
5. 确保选项能够形成合理的分支路径
6. 故事要围绕参与角色展开，体现他们的性格特点

请直接返回JSON格式，不要包含其他文本说明。JSON格式：
{
  "startNodeId": "start",
  "nodes": {
    "start": {
      "id": "start",
      "title": "...",
      "prompt": "...",
      "options": [
        {
          "id": "opt_1",
          "text": "...",
          "nextNodeId": "node_1"
        }
      ]
    },
    "node_1": { ... }
  }
}`;

      const systemPrompt = `You are a creative director for an interactive visual novel game.
Generate a branching scenario structure in JSON format based on the provided information.
The content MUST be in Chinese.`;

      const responseText = await this.aiService.generateTextString(userPrompt, systemPrompt, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const scenarioData = JSON.parse(jsonStr);

      // 验证并返回节点数据
      if (!scenarioData.nodes || typeof scenarioData.nodes !== 'object') {
        throw new Error('生成的剧本节点格式无效');
      }

      return {
        nodes: scenarioData.nodes,
        startNodeId: scenarioData.startNodeId || 'start'
      };
    } catch (error) {
      console.error('[StoryBusinessService] 生成剧本失败:', error);
      throw error;
    }
  }

  /**
   * 生成故事节拍流
   */
  async generateStoryBeatStream(
    character: {name: string, systemInstruction?: string},
    history: Array<{role: string, text: string}>,
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    // 这个方法需要流式生成，暂时委托给 AIService
    // TODO: 实现流式生成逻辑
    const prompt = `${userMessage}`;
    const systemInstruction = `You are ${character.name}. ${character.systemInstruction || ''}`;
    
    await this.aiService.generateTextStream(
      {
        prompt,
        systemInstruction,
        messages: history.map(m => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.text
        }))
      },
      (chunk) => {
        onChunk(chunk.content || '');
      }
    );
  }
}


