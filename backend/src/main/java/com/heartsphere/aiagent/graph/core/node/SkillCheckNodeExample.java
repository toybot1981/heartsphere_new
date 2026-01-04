package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * SkillCheckNode使用示例
 * 
 * 演示如何使用SkillCheckNode进行技能检查
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class SkillCheckNodeExample {
    
    public static void main(String[] args) {
        // 创建示例状态
        GraphEngine.SimpleGraphState state = new GraphEngine.SimpleGraphState();
        
        // 设置角色技能
        Map<String, Integer> skills = new HashMap<>();
        skills.put("strength", 60);
        skills.put("intelligence", 40);
        skills.put("charisma", 80);
        state.setData("character_skills", skills);
        
        // 示例1: 检查力量技能（成功）
        log.info("=== 示例1: 检查力量技能（成功） ===");
        SkillCheckNode strengthCheck = SkillCheckNode.builder()
                .id("strength_check_1")
                .skillId("strength")
                .operator(">=")
                .requiredValue(50)
                .successNodeId("node_strong_enough")
                .failureNodeId("node_too_weak")
                .build();
        
        GraphEngine.GraphState result1 = strengthCheck.execute(state.clone());
        log.info("检查结果: {}", result1.getData("skill_check_result"));
        log.info("当前技能值: {}", result1.getData("skill_check_current_value"));
        log.info("下一个节点: {}", result1.getData("next_node"));
        
        // 示例2: 检查智力技能（失败）
        log.info("\n=== 示例2: 检查智力技能（失败） ===");
        SkillCheckNode intelligenceCheck = SkillCheckNode.builder()
                .id("intelligence_check_1")
                .skillId("intelligence")
                .operator(">=")
                .requiredValue(50) // 需要50，但只有40
                .successNodeId("node_smart_enough")
                .failureNodeId("node_not_smart_enough")
                .build();
        
        GraphEngine.GraphState result2 = intelligenceCheck.execute(state.clone());
        log.info("检查结果: {}", result2.getData("skill_check_result"));
        log.info("当前技能值: {}", result2.getData("skill_check_current_value"));
        log.info("下一个节点: {}", result2.getData("next_node"));
        
        // 示例3: 精确匹配（==）
        log.info("\n=== 示例3: 精确匹配（==） ===");
        SkillCheckNode exactCheck = SkillCheckNode.builder()
                .id("exact_check_1")
                .skillId("charisma")
                .operator("==")
                .requiredValue(80)
                .successNodeId("node_exact_match")
                .failureNodeId("node_not_exact")
                .build();
        
        GraphEngine.GraphState result3 = exactCheck.execute(state.clone());
        log.info("检查结果: {}", result3.getData("skill_check_result"));
        log.info("当前技能值: {}", result3.getData("skill_check_current_value"));
        log.info("下一个节点: {}", result3.getData("next_node"));
        
        // 示例4: 小于等于（<=）
        log.info("\n=== 示例4: 小于等于（<=） ===");
        SkillCheckNode lessEqualCheck = SkillCheckNode.builder()
                .id("less_equal_check_1")
                .skillId("intelligence")
                .operator("<=")
                .requiredValue(50)
                .successNodeId("node_weak_enough")
                .failureNodeId("node_too_strong")
                .build();
        
        GraphEngine.GraphState result4 = lessEqualCheck.execute(state.clone());
        log.info("检查结果: {}", result4.getData("skill_check_result"));
        log.info("当前技能值: {}", result4.getData("skill_check_current_value"));
        log.info("下一个节点: {}", result4.getData("next_node"));
    }
}
