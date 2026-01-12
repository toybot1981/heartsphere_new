package com.heartsphere.mentis.executor.impl;

import com.heartsphere.mentis.executor.TaskQueue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.PriorityBlockingQueue;

/**
 * 内存任务队列实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class InMemoryTaskQueue implements TaskQueue {
    
    // 优先级队列：优先级高的先执行
    private final PriorityBlockingQueue<TaskItem> queue = new PriorityBlockingQueue<>(
            100,
            (t1, t2) -> {
                // 先按优先级排序，优先级相同则按创建时间排序
                int priorityCompare = Integer.compare(t2.getPriority(), t1.getPriority());
                if (priorityCompare != 0) {
                    return priorityCompare;
                }
                return Long.compare(t1.getCreateTime(), t2.getCreateTime());
            }
    );
    
    // 任务映射，用于快速查找
    private final Map<String, TaskItem> taskMap = new ConcurrentHashMap<>();
    
    @Override
    public synchronized void enqueue(TaskItem task) {
        log.info("任务入队: taskId={}, priority={}", task.getTaskId(), task.getPriority());
        
        taskMap.put(task.getTaskId(), task);
        queue.offer(task);
    }
    
    @Override
    public synchronized Optional<TaskItem> dequeue() {
        TaskItem task = queue.poll();
        if (task != null) {
            taskMap.remove(task.getTaskId());
            log.info("任务出队: taskId={}", task.getTaskId());
            return Optional.of(task);
        }
        return Optional.empty();
    }
    
    @Override
    public int size() {
        return queue.size();
    }
    
    @Override
    public boolean isEmpty() {
        return queue.isEmpty();
    }
    
    @Override
    public List<TaskItem> getAllTasks() {
        return new ArrayList<>(taskMap.values());
    }
    
    @Override
    public Optional<TaskItem> getTask(String taskId) {
        return Optional.ofNullable(taskMap.get(taskId));
    }
    
    @Override
    public synchronized void removeTask(String taskId) {
        log.info("移除任务: taskId={}", taskId);
        
        TaskItem task = taskMap.remove(taskId);
        if (task != null) {
            queue.remove(task);
        }
    }
}
