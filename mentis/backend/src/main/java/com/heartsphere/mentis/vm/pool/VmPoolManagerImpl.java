package com.heartsphere.mentis.vm.pool;

import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmProvider;
import com.heartsphere.mentis.vm.VmProvider.VmInstance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 虚拟机池管理器实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Lazy
@Component
@RequiredArgsConstructor
public class VmPoolManagerImpl implements VmPoolManager {
    
    private final VmProvider vmProvider;
    
    // 可用虚拟机队列
    private final Queue<String> availableVmQueue = new ConcurrentLinkedQueue<>();
    
    // 使用中的虚拟机集合
    private final List<String> inUseVmList = new ArrayList<>();
    
    private final ReentrantLock lock = new ReentrantLock();
    
    @Override
    public VmInstance acquireVm(MentisVmService.VmConfig config) {
        log.info("从池中获取虚拟机");
        
        lock.lock();
        try {
            // 先尝试从池中获取
            String vmId = availableVmQueue.poll();
            
            if (vmId != null) {
                inUseVmList.add(vmId);
                VmInstance instance = new VmInstance();
                instance.setVmId(vmId);
                instance.setStatus("RUNNING");
                log.info("从池中获取虚拟机成功: vmId={}", vmId);
                return instance;
            }
            
            // 池中没有可用虚拟机，创建新的
            log.info("池中没有可用虚拟机，创建新的");
            VmInstance instance = vmProvider.createVm(config);
            inUseVmList.add(instance.getVmId());
            return instance;
            
        } finally {
            lock.unlock();
        }
    }
    
    @Override
    public void releaseVm(String vmId) {
        log.info("归还虚拟机到池中: vmId={}", vmId);
        
        lock.lock();
        try {
            if (inUseVmList.remove(vmId)) {
                availableVmQueue.offer(vmId);
                log.info("虚拟机已归还到池中: vmId={}", vmId);
            }
        } finally {
            lock.unlock();
        }
    }
    
    @Override
    public void initializePool(int poolSize, MentisVmService.VmConfig config) {
        log.info("初始化虚拟机池: poolSize={}", poolSize);
        
        lock.lock();
        try {
            for (int i = 0; i < poolSize; i++) {
                VmInstance instance = vmProvider.createVm(config);
                availableVmQueue.offer(instance.getVmId());
            }
            log.info("虚拟机池初始化完成: poolSize={}", poolSize);
        } finally {
            lock.unlock();
        }
    }
    
    @Override
    public PoolStatus getPoolStatus() {
        PoolStatus status = new PoolStatus();
        status.setTotalSize(availableVmQueue.size() + inUseVmList.size());
        status.setAvailableSize(availableVmQueue.size());
        status.setInUseSize(inUseVmList.size());
        status.setAvailableVmIds(new ArrayList<>(availableVmQueue));
        status.setInUseVmIds(new ArrayList<>(inUseVmList));
        return status;
    }
    
    @Override
    public void cleanupIdleVms() {
        log.info("清理空闲虚拟机");
        // TODO: 实现清理逻辑
    }
}
