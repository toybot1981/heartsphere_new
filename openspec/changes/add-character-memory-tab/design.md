# Design: 在角色卡片中添加记忆标签页

## 架构设计

### 1. 组件结构

```
CharacterConstructorModal
├── 基本信息标签页（现有）
├── 技能标签页（现有，CharacterSkillTab）
└── 记忆标签页（新增，CharacterMemoryTab）
    ├── 记忆筛选器（可选）
    ├── 记忆列表
    │   ├── 记忆项组件
    │   │   ├── 记忆内容
    │   │   ├── 记忆类型标签
    │   │   ├── 重要性标识
    │   │   ├── 时间戳
    │   │   └── 来源信息
    │   └── 空状态提示
    └── 加载状态
```

### 2. 数据流

1. 用户打开角色编辑/查看界面
2. 切换到记忆标签页
3. 组件挂载时，获取当前用户 ID 和角色 ID
4. 调用记忆系统 API，搜索与当前角色相关的记忆
5. 过滤条件：`metadata.characterId === characterId`
6. 展示记忆列表
7. 支持刷新和实时更新

### 3. 记忆过滤逻辑

```typescript
// 搜索选项
const searchOptions: MemorySearchOptions = {
  // 通过 metadata.characterId 过滤
  // 注意：需要检查记忆系统是否支持按 characterId 过滤
  // 如果不支持，需要在客户端过滤
};
```

### 4. UI/UX 设计

#### 记忆列表项设计
- **记忆内容**：主要显示区域，支持多行文本
- **记忆类型标签**：显示记忆类型（个人信息、情感记忆、交互记忆等）
- **重要性标识**：使用颜色或图标标识（核心、重要、普通、临时）
- **时间戳**：显示记忆创建时间和最后使用时间
- **来源信息**：显示记忆来源（对话、日记、行为等）

#### 布局设计
- 使用卡片式布局，每个记忆项为一个卡片
- 支持展开/收起详细信息
- 使用时间线或列表布局
- 响应式设计，适配 PC 和移动端

## 技术实现细节

### 1. CharacterMemoryTab 组件

```typescript
interface CharacterMemoryTabProps {
  characterId: number;
  characterName?: string;
  userId: number; // 当前用户 ID
  token?: string | null;
}

export const CharacterMemoryTab: React.FC<CharacterMemoryTabProps> = ({
  characterId,
  characterName,
  userId,
  token,
}) => {
  // 状态管理
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选状态
  const [selectedType, setSelectedType] = useState<MemoryType | 'all'>('all');
  const [selectedImportance, setSelectedImportance] = useState<MemoryImportance | 'all'>('all');
  
  // 加载记忆数据
  useEffect(() => {
    loadMemories();
  }, [characterId, userId, selectedType, selectedImportance]);
  
  const loadMemories = async () => {
    // 实现记忆加载逻辑
  };
  
  // 渲染记忆列表
  return (
    <div className="character-memory-tab">
      {/* 筛选器 */}
      {/* 记忆列表 */}
    </div>
  );
};
```

### 2. 记忆数据获取

```typescript
// 使用记忆系统搜索记忆
const searchOptions: MemorySearchOptions = {
  // 注意：需要检查记忆系统是否支持按 characterId 过滤
  // 如果不支持，需要先获取所有记忆，然后在客户端过滤
};

// 方案1：如果记忆系统支持按 characterId 过滤
const memories = await memorySystem.searchMemories({
  ...searchOptions,
  // 假设有 characterId 参数
});

// 方案2：如果记忆系统不支持，需要客户端过滤
const allMemories = await memorySystem.searchMemories(searchOptions);
const filteredMemories = allMemories.filter(
  memory => memory.metadata?.characterId === String(characterId)
);
```

### 3. 记忆项组件

```typescript
interface MemoryItemProps {
  memory: UserMemory;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export const MemoryItem: React.FC<MemoryItemProps> = ({ memory }) => {
  return (
    <div className="memory-item">
      {/* 记忆内容 */}
      {/* 元数据信息 */}
    </div>
  );
};
```

## 兼容性和扩展性

### 兼容性
- 如果记忆数据中没有 `metadata.characterId`，需要兼容处理
- 如果记忆系统不支持按角色过滤，使用客户端过滤
- 支持空状态（没有记忆时显示友好提示）

### 扩展性
- 预留筛选和搜索功能的扩展接口
- 预留记忆编辑、删除等功能的扩展接口
- 预留记忆统计和分析功能的扩展接口

## 性能考虑

### 数据加载优化
- 使用懒加载，只在切换到记忆标签页时加载数据
- 支持分页加载，避免一次性加载大量记忆
- 使用缓存，避免重复请求

### 渲染优化
- 使用虚拟滚动（如果记忆数量很多）
- 使用 React.memo 优化记忆项组件
- 延迟加载非关键信息（如详细元数据）

## 测试策略

### 单元测试
- 记忆数据获取逻辑
- 记忆过滤逻辑
- 记忆项组件渲染

### 集成测试
- 记忆标签页与角色编辑界面的集成
- 记忆数据加载和展示流程

### E2E 测试
- 打开角色编辑界面
- 切换到记忆标签页
- 查看记忆列表
- 测试筛选功能（如果有）
