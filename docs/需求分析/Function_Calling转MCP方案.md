# Function Calling 转 MCP 方案

## 一、核心答案

**可以改为 MCP 调用，而且推荐使用 MCP**。

MCP (Model Context Protocol) 是 Anthropic 推出的标准化协议，比 Function Calling 更强大、更灵活。

---

## 二、MCP vs Function Calling

### 2.1 对比

| 特性 | Function Calling | MCP |
|------|-----------------|-----|
| **协议标准** | 各厂商不同 | 统一标准 |
| **工具调用** | ✅ 支持 | ✅ 支持 |
| **资源支持** | ❌ 不支持 | ✅ 支持 Resources |
| **提示模板** | ❌ 不支持 | ✅ 支持 Prompts |
| **工具发现** | 手动传入 | 自动发现 |
| **扩展性** | 有限 | 高度可扩展 |
| **标准化** | 厂商特定 | 跨平台标准 |

### 2.2 MCP 优势

1. **标准化协议**：统一的工具调用接口
2. **功能更丰富**：不仅支持工具调用，还支持资源和提示
3. **更好的发现机制**：自动发现可用工具
4. **高度可扩展**：易于添加新功能
5. **跨平台兼容**：可以在不同系统间共享工具

---

## 三、MCP 架构

```
用户对话
  ↓
AI 对话服务
  ↓
MCP Client（前端）
  ├─ 工具发现
  ├─ 工具调用
  └─ 资源访问
  ↓
MCP Server（后端）
  ├─ 工具注册
  ├─ 工具执行
  └─ 资源管理
  ↓
Skill 执行引擎
```

---

## 四、实现方案

### 4.1 MCP Server（后端）

```java
@Service
public class MCPServer {
    
    /**
     * 列出可用工具
     */
    public List<MCPTool> listTools(Long characterId) {
        List<SkillDefinition> skills = skillRegistry.getCharacterSkills(characterId);
        return skills.stream()
            .map(this::skillToMCPTool)
            .collect(Collectors.toList());
    }
    
    /**
     * 调用工具
     */
    public MCPToolResult callTool(
        String toolName,
        Map<String, Object> arguments,
        SkillExecutionContext context
    ) {
        SkillExecutionResult result = skillExecutor.execute(
            toolName, arguments, context
        );
        
        return MCPToolResult.builder()
            .content(Collections.singletonList(
                MCPContent.builder()
                    .type("text")
                    .text(JSON.toJSONString(result.getResult()))
                    .build()
            ))
            .build();
    }
    
    /**
     * 列出可用资源
     */
    public List<MCPResource> listResources(Long characterId) {
        // 返回技能相关的资源
    }
    
    /**
     * 读取资源
     */
    public MCPResourceContent readResource(String uri) {
        // 读取技能资源
    }
}
```

### 4.2 MCP Client（前端）

```typescript
export class MCPClient {
  /**
   * 列出可用工具
   */
  async listTools(characterId: number): Promise<MCPTool[]> {
    const response = await fetch(`/api/mcp/tools?characterId=${characterId}`);
    return response.json();
  }
  
  /**
   * 调用工具
   */
  async callTool(
    toolName: string,
    arguments: Record<string, any>,
    characterId: number
  ): Promise<MCPToolResult> {
    const response = await fetch(`/api/mcp/tools/${toolName}/call`, {
      method: 'POST',
      body: JSON.stringify({ arguments, characterId }),
    });
    return response.json();
  }
}
```

### 4.3 集成到对话

```typescript
// 使用 MCP 替代 Function Calling
const mcpClient = new MCPClient();
const tools = await mcpClient.listTools(character.id);

// 如果 AI 模型支持 MCP，直接使用
// 如果不支持，转换为 Function Definitions（兼容层）
const functionDefinitions = tools.map(tool => ({
  name: tool.name,
  description: tool.description,
  parameters: tool.inputSchema,
}));

// 调用 AI
await aiService.generateTextStreamWithFunctions({
  functions: functionDefinitions,
  // ...
});
```

---

## 五、迁移策略

### 5.1 渐进式迁移

**阶段 1：并行支持**
- 同时支持 Function Calling 和 MCP
- 通过配置选择使用哪种方式

**阶段 2：统一接口**
- 创建统一接口，内部选择实现方式
- 保持向后兼容

**阶段 3：完全迁移**
- 完全使用 MCP
- 移除 Function Calling 代码

### 5.2 兼容性处理

```typescript
// 兼容层：将 MCP 转换为 Function Calling（如果 AI 不支持 MCP）
class MCPToFunctionCallAdapter {
  convertMCPToolToFunction(tool: MCPTool): FunctionDefinition {
    return {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    };
  }
}
```

---

## 六、MCP 核心概念

### 6.1 Tools（工具）

```json
{
  "name": "crisis_intervention",
  "description": "危机干预工具",
  "inputSchema": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": ["assess", "plan", "guide"]
      }
    }
  }
}
```

### 6.2 Resources（资源）

```json
{
  "uri": "skill://crisis_intervention/guide",
  "name": "危机干预指南",
  "description": "危机干预操作指南",
  "mimeType": "text/markdown"
}
```

### 6.3 Prompts（提示）

```json
{
  "name": "crisis_assessment_prompt",
  "description": "危机评估提示模板",
  "arguments": [
    {
      "name": "situation",
      "description": "危机情况描述"
    }
  ]
}
```

---

## 七、实施建议

### 7.1 推荐使用 MCP

**原因**：
1. ✅ **标准化**：MCP 是标准协议，未来会有更多支持
2. ✅ **功能丰富**：不仅支持工具调用，还支持资源和提示
3. ✅ **扩展性强**：易于扩展和维护
4. ✅ **未来兼容**：符合行业趋势

### 7.2 实施步骤

1. **实现 MCP Server**：在后端实现 MCP 服务器
2. **实现 MCP Client**：在前端实现 MCP 客户端
3. **并行支持**：同时支持 Function Calling 和 MCP
4. **逐步迁移**：逐步将功能迁移到 MCP
5. **完全迁移**：最终完全使用 MCP

### 7.3 注意事项

1. **AI 模型支持**：确保 AI 模型支持 MCP（或通过适配层转换）
2. **向后兼容**：保持与现有 Function Calling 的兼容
3. **性能优化**：MCP 可能增加一些开销，需要优化
4. **充分测试**：充分测试 MCP 实现

---

## 八、总结

### 核心要点

- ✅ **可以改为 MCP**：技术上完全可行
- ✅ **推荐使用 MCP**：更强大、更灵活、更标准
- ✅ **渐进式迁移**：可以逐步迁移，保持兼容
- ✅ **未来趋势**：MCP 是行业标准，值得投入

### 优势总结

1. **标准化**：统一协议，跨平台兼容
2. **功能丰富**：工具+资源+提示
3. **易于扩展**：高度可扩展
4. **未来兼容**：符合行业趋势

---

**最后更新**：2025-01-03
