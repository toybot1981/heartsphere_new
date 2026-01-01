package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.extern.slf4j.Slf4j;

/**
 * DialogueNode使用示例
 * 
 * 演示如何使用DialogueNode创建和执行Graph
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class DialogueNodeExample {
    
    /**
     * 示例1：简单的对话流程
     */
    public static void example1_SimpleDialogue() {
        log.info("=== 示例1：简单的对话流程 ===");
        
        GraphEngine engine = new GraphEngine();
        GraphEngine.GraphDefinition graph = engine.createGraphDefinition();
        
        // 创建对话节点
        DialogueNode node1 = DialogueNode.create("dialogue_1", "你好，欢迎来到心域！");
        DialogueNode node2 = DialogueNode.create("dialogue_2", "很高兴见到你！", "char_1", "角色A");
        DialogueNode node3 = DialogueNode.create("dialogue_3", "让我们开始冒险吧！");
        
        // 添加节点
        graph.addNode(node1);
        graph.addNode(node2);
        graph.addNode(node3);
        
        // 添加边
        graph.addEdge(new GraphEngine.GraphEdge("dialogue_1", "dialogue_2"));
        graph.addEdge(new GraphEngine.GraphEdge("dialogue_2", "dialogue_3"));
        
        // 设置起始节点
        graph.setStartNodeId("dialogue_1");
        
        // 执行Graph
        GraphEngine.GraphState initialState = engine.createState();
        GraphEngine.GraphExecutor executor = engine.createExecutor(graph);
        GraphEngine.GraphState finalState = executor.execute(initialState);
        
        // 查看结果
        log.info("对话历史: {}", finalState.getData("dialogue_history"));
    }
    
    /**
     * 示例2：包含旁白和内心独白的对话
     */
    public static void example2_MixedDialogue() {
        log.info("=== 示例2：包含旁白和内心独白的对话 ===");
        
        GraphEngine engine = new GraphEngine();
        GraphEngine.GraphDefinition graph = engine.createGraphDefinition();
        
        // 创建不同类型的对话节点
        DialogueNode narration = DialogueNode.createNarration("narration_1", "阳光透过窗户洒进房间。");
        DialogueNode dialogue = DialogueNode.create("dialogue_1", "早上好！", "char_1", "角色A");
        DialogueNode thought = DialogueNode.createThought("thought_1", "他看起来心情不错。");
        
        graph.addNode(narration);
        graph.addNode(dialogue);
        graph.addNode(thought);
        
        graph.addEdge(new GraphEngine.GraphEdge("narration_1", "dialogue_1"));
        graph.addEdge(new GraphEngine.GraphEdge("dialogue_1", "thought_1"));
        
        graph.setStartNodeId("narration_1");
        
        GraphEngine.GraphState initialState = engine.createState();
        GraphEngine.GraphExecutor executor = engine.createExecutor(graph);
        executor.execute(initialState);
        
        log.info("示例2执行完成");
    }
    
    /**
     * 示例3：使用NodeFactory创建节点
     */
    public static void example3_UsingNodeFactory() {
        log.info("=== 示例3：使用NodeFactory创建节点 ===");
        
        NodeFactory factory = new NodeFactory();
        
        // 使用Map配置创建节点
        java.util.Map<String, Object> config = new java.util.HashMap<>();
        config.put("id", "dialogue_1");
        config.put("text", "你好！");
        config.put("characterId", "char_1");
        config.put("characterName", "角色A");
        config.put("type", "dialogue");
        
        GraphEngine.GraphNode node = factory.createNode("dialogue", config);
        
        log.info("创建的节点: {}", node.getId());
    }
    
    /**
     * 主方法，运行所有示例
     */
    public static void main(String[] args) {
        example1_SimpleDialogue();
        example2_MixedDialogue();
        example3_UsingNodeFactory();
    }
}
