package com.heartsphere.ai.skill.enums;

/**
 * 技能执行状态枚举
 * 用于追踪技能执行的生命周期
 */
public enum ExecutionStatus {
    PENDING("待执行", "技能已评估通过，等待执行"),
    EXECUTING("执行中", "技能正在执行"),
    COMPLETED("已完成", "技能执行成功完成"),
    FAILED("已失败", "技能执行失败");

    private final String name;
    private final String description;

    ExecutionStatus(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getDisplayName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    /**
     * 判断是否为最终状态
     */
    public boolean isFinal() {
        return this == COMPLETED || this == FAILED;
    }

    /**
     * 判断是否为进行中的状态
     */
    public boolean isInProgress() {
        return this == PENDING || this == EXECUTING;
    }
}
