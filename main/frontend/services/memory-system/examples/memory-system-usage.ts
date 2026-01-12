/**
 * 个性化记忆系统使用示例
 */

import { MemorySystem } from '../MemorySystem';
import { MemorySource, MemoryType, MemoryImportance } from '../types/MemoryTypes';

async function example1() {
  // 创建记忆系统
  const memorySystem = new MemorySystem({
    enabled: true,
    autoExtraction: true,
    userId: 1,
  });

  // 从对话中提取记忆
  const memories = await memorySystem.extractAndSave({
    text: '我叫张三，今年25岁，喜欢看电影和听音乐。我的生日是1月1日。',
    source: MemorySource.CONVERSATION,
    sourceId: 'conversation_123',
    context: {
      userProfile: { id: 1, name: '张三' },
    },
  });

  console.log('提取的记忆:', memories);

  // 搜索记忆
  const searchResults = await memorySystem.searchMemories({
    keyword: '喜欢',
    limit: 5,
  });

  console.log('搜索结果:', searchResults);

  // 获取相关记忆
  const relevantMemories = await memorySystem.getRelevantMemories('看电影', 3);
  console.log('相关记忆:', relevantMemories);
}

async function example2() {
  const memorySystem = new MemorySystem({
    enabled: true,
    autoExtraction: true,
    userId: 1,
  });

  // 手动添加记忆
  const memory = await memorySystem.addMemory({
    memoryType: MemoryType.IMPORTANT_MOMENT,
    importance: MemoryImportance.CORE,
    content: '2024年1月1日，新年第一天，心情很好',
    structuredData: {
      key: 'important_date',
      value: '2024-01-01',
      tags: ['新年', '重要时刻'],
    },
    source: MemorySource.MANUAL,
    confidence: 1.0,
  });

  console.log('添加的记忆:', memory);

  // 获取记忆统计
  const statistics = await memorySystem.getMemoryStatistics();
  console.log('记忆统计:', statistics);
}

export { example1, example2 };




