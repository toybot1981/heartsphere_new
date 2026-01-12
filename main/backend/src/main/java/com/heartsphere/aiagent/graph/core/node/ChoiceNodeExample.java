package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ChoiceNode使用示例
 * 
 * 演示如何使用ChoiceNode创建和执行Graph
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class ChoiceNodeExample {
    
    /**
     * 示例1：简单的选择节点
     */
    public static void example1_SimpleChoice() {
        log.info("=== 示例1：简单的选择节点 ===");
        
        GraphEngine engine = new GraphEngine();
        GraphEngine.GraphDefinition graph = engine.createGraphDefinition();
        
        // 创建对话节点
        DialogueNode dialogue = DialogueNode.create("dialogue_1", "你遇到了一个选择...");
        
        // 创建选择节点
        List<ChoiceNode.ChoiceOption> options = new ArrayList<>();
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_1")
            .text("选择A")
            .nextNodeId("result_a")
            .build());
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_2")
            .text("选择B")
            .nextNodeId("result_b")
            .build());
        
        ChoiceNode choice = ChoiceNode.create("choice_1", "请做出选择：", options);
        
        // 创建结果节点
        DialogueNode resultA = DialogueNode.create("result_a", "你选择了A");
        DialogueNode resultB = DialogueNode.create("result_b", "你选择了B");
        
        // 添加节点和边
        graph.addNode(dialogue);
        graph.addNode(choice);
        graph.addNode(resultA);
        graph.addNode(resultB);
        
        graph.addEdge(new GraphEngine.GraphEdge("dialogue_1", "choice_1"));
        graph.addEdge(new GraphEngine.GraphEdge("choice_1", "result_a"));
        graph.addEdge(new GraphEngine.GraphEdge("choice_1", "result_b"));
        
        graph.setStartNodeId("dialogue_1");
        
        GraphEngine.GraphState initialState = engine.createState();
        GraphEngine.GraphExecutor executor = engine.createExecutor(graph);
        
        // 执行到选择节点
        GraphEngine.GraphState stateAfterDialogue = executor.execute(initialState);
        
        log.info("执行到选择节点，可用选项: {}", 
            ((ChoiceNode) stateAfterDialogue.getData("current_choice")).getAvailableOptions(stateAfterDialogue).size());
    }
    
    /**
     * 示例2：带条件的选择节点
     */
    public static void example2_ChoiceWithConditions() {
        log.info("=== 示例2：带条件的选择节点 ===");
        
        GraphEngine engine = new GraphEngine();
        GraphEngine.GraphState state = engine.createState();
        
        // 设置好感度
        Map<String, Integer> favorability = new HashMap<>();
        favorability.put("char_1", 50);
        state.setData("character_favorability", favorability);
        
        // 创建带条件的选项
        List<ChoiceNode.ChoiceOption> options = new ArrayList<>();
        
        // 选项1：无条件
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_1")
            .text("普通选项")
            .nextNodeId("node_1")
            .build());
        
        // 选项2：需要好感度>=50
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_2")
            .text("隐藏选项（需要好感度>=50）")
            .nextNodeId("node_2")
            .conditions(List.of(
                ChoiceNode.ChoiceCondition.builder()
                    .type(ChoiceNode.ChoiceCondition.ConditionType.FAVORABILITY)
                    .target("char_1")
                    .operator(">=")
                    .value(50)
                    .build()
            ))
            .build());
        
        // 选项3：需要好感度>=80（不满足）
        options.add(ChoiceNode.ChoiceOption.builder()
            .id("opt_3")
            .text("隐藏选项（需要好感度>=80）")
            .nextNodeId("node_3")
            .conditions(List.of(
                ChoiceNode.ChoiceCondition.builder()
                    .type(ChoiceNode.ChoiceCondition.ConditionType.FAVORABILITY)
                    .target("char_1")
                    .operator(">=")
                    .value(80)
                    .build()
            ))
            .build());
        
        ChoiceNode choice = ChoiceNode.builder()
            .id("choice_1")
            .prompt("请选择：")
            .options(options)
            .build();
        
        List<ChoiceNode.ChoiceOption> availableOptions = choice.getAvailableOptions(state);
        
        log.info("可用选项数量: {}/{}", availableOptions.size(), options.size());
        for (ChoiceNode.ChoiceOption option : availableOptions) {
            log.info("  - {}", option.getText());
        }
    }
    
    /**
     * 示例3：带效果的选择节点
     */
    public static void example3_ChoiceWithEffects() {
        log.info("=== 示例3：带效果的选择节点 ===");
        
        GraphEngine engine = new GraphEngine();
        GraphEngine.GraphState state = engine.createState();
        
        // 创建带效果的选项
        ChoiceNode.ChoiceOption option = ChoiceNode.ChoiceOption.builder()
            .id("opt_1")
            .text("帮助角色")
            .nextNodeId("node_1")
            .effect(ChoiceNode.ChoiceEffect.builder()
                .favorabilityChange(Map.of("char_1", 10))
                .skillChange(Map.of("skill_1", 5))
                .triggerEvents(List.of("event_help"))
                .addItems(List.of("item_reward"))
                .setVariables(Map.of("helped", true))
                .build())
            .build();
        
        ChoiceNode choice = ChoiceNode.builder()
            .id("choice_1")
            .options(List.of(option))
            .build();
        
        // 处理选择
        choice.handleChoice("opt_1", state);
        
        log.info("好感度: {}", state.getData("character_favorability"));
        log.info("技能: {}", state.getData("character_skills"));
        log.info("事件: {}", state.getData("triggered_events"));
        log.info("物品: {}", state.getData("items"));
        log.info("变量: {}", state.getData("variable_helped"));
    }
    
    /**
     * 主方法，运行所有示例
     */
    public static void main(String[] args) {
        example1_SimpleChoice();
        example2_ChoiceWithConditions();
        example3_ChoiceWithEffects();
    }
}
