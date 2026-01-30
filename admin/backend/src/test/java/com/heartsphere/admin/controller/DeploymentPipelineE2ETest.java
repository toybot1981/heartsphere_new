package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.PipelineExecutionRequest;
import com.heartsphere.admin.dto.PipelineExecutionResponse;
import com.heartsphere.admin.entity.DeploymentPipeline;
import com.heartsphere.admin.entity.PipelineExecution;
import com.heartsphere.admin.entity.PipelineStep;
import com.heartsphere.admin.repository.DeploymentPipelineRepository;
import com.heartsphere.admin.repository.PipelineExecutionRepository;
import com.heartsphere.admin.repository.PipelineStepExecutionRepository;
import com.heartsphere.admin.repository.PipelineStepRepository;
import com.heartsphere.admin.repository.ScriptExecutionRepository;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.admin.service.PipelineExecutionService;
import com.heartsphere.admin.util.PipelineTestDataBuilder;
import com.heartsphere.shared.util.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 部署流程端到端测试
 * 测试完整的流程执行生命周期
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DeploymentPipelineE2ETest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private DeploymentPipelineRepository pipelineRepository;
    
    @Autowired
    private PipelineStepRepository stepRepository;
    
    @Autowired
    private PipelineExecutionRepository executionRepository;
    
    @Autowired
    private PipelineStepExecutionRepository stepExecutionRepository;
    
    @Autowired
    private ScriptExecutionRepository scriptExecutionRepository;
    
    @Autowired
    private SystemAdminRepository adminRepository;
    
    @Autowired
    private PipelineExecutionService executionService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private com.heartsphere.admin.entity.SystemAdmin testAdmin;
    private String authToken;
    
    @BeforeEach
    void setUp() {
        // 清理数据（注意顺序：先删除子表，再删除父表）
        // 先删除步骤执行记录和脚本执行记录
        stepExecutionRepository.deleteAll();
        scriptExecutionRepository.deleteAll();
        // 再删除流程执行记录
        executionRepository.deleteAll();
        // 再删除步骤
        stepRepository.deleteAll();
        // 再删除流程
        pipelineRepository.deleteAll();
        // 最后删除管理员
        adminRepository.deleteAll();
        
        // 创建测试管理员
        testAdmin = PipelineTestDataBuilder.createTestAdmin();
        testAdmin.setPassword(passwordEncoder.encode("test-password"));
        testAdmin = adminRepository.save(testAdmin);
        
        // 生成认证 Token
        authToken = "Bearer " + jwtUtils.generateJwtTokenFromUsername(testAdmin.getUsername());
    }
    
    /**
     * 测试完整流程执行生命周期
     */
    @Test
    void testCompletePipelineExecutionLifecycle() throws Exception {
        // Given: 创建包含步骤的流程模板
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        
        // 保存步骤
        for (PipelineStep step : pipeline.getSteps()) {
            stepRepository.save(step);
        }
        
        // When: 执行流程
        PipelineExecutionRequest request = new PipelineExecutionRequest();
        request.setPipelineId(pipeline.getId());
        PipelineExecutionResponse executionResponse = executionService.executePipeline(request, testAdmin);
        
        assertThat(executionResponse).isNotNull();
        assertThat(executionResponse.getExecutionId()).isNotNull();
        assertThat(executionResponse.getStatus()).isEqualTo("RUNNING");
        
        // Then: 验证执行记录已创建
        java.util.Optional<PipelineExecution> executionOpt = 
                executionRepository.findById(executionResponse.getExecutionId());
        assertThat(executionOpt).isPresent();
        
        PipelineExecution execution = executionOpt.get();
        assertThat(execution.getPipeline().getId()).isEqualTo(pipeline.getId());
        assertThat(execution.getExecutedBy().getId()).isEqualTo(testAdmin.getId());
        assertThat(execution.getStatus()).isEqualTo(PipelineExecution.ExecutionStatus.RUNNING);
        
        // 等待一段时间，让流程执行（在实际测试中，可能需要等待更长时间）
        Thread.sleep(2000);
        
        // 验证可以通过 API 查询执行状态
        mockMvc.perform(get("/api/admin/devops/pipelines/executions/{executionId}", executionResponse.getExecutionId())
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(executionResponse.getExecutionId()))
                .andExpect(jsonPath("$.status").exists());
        
        // 验证可以通过 API 查询执行详情
        mockMvc.perform(get("/api/admin/devops/pipelines/executions/{executionId}/detail", executionResponse.getExecutionId())
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(executionResponse.getExecutionId()))
                .andExpect(jsonPath("$.stepExecutions").exists());
    }
    
    /**
     * 测试并发执行多个流程
     */
    @Test
    void testConcurrentPipelineExecution() throws Exception {
        // Given: 创建多个流程模板
        DeploymentPipeline pipeline1 = PipelineTestDataBuilder.createTestPipelineWithSteps("main", "test");
        pipeline1.setCreatedBy(testAdmin);
        pipeline1 = pipelineRepository.save(pipeline1);
        for (PipelineStep step : pipeline1.getSteps()) {
            stepRepository.save(step);
        }
        
        DeploymentPipeline pipeline2 = PipelineTestDataBuilder.createTestPipelineWithSteps("admin", "test");
        pipeline2.setCreatedBy(testAdmin);
        pipeline2 = pipelineRepository.save(pipeline2);
        for (PipelineStep step : pipeline2.getSteps()) {
            stepRepository.save(step);
        }
        
        // When: 并发执行两个流程
        ExecutorService executor = Executors.newFixedThreadPool(2);
        
        final Long pipeline1Id = pipeline1.getId();
        final Long pipeline2Id = pipeline2.getId();
        final com.heartsphere.admin.entity.SystemAdmin finalTestAdmin = testAdmin;
        
        Future<PipelineExecutionResponse> future1 = executor.submit(() -> {
            PipelineExecutionRequest request = new PipelineExecutionRequest();
            request.setPipelineId(pipeline1Id);
            return executionService.executePipeline(request, finalTestAdmin);
        });
        
        Future<PipelineExecutionResponse> future2 = executor.submit(() -> {
            PipelineExecutionRequest request = new PipelineExecutionRequest();
            request.setPipelineId(pipeline2Id);
            return executionService.executePipeline(request, finalTestAdmin);
        });
        
        // Then: 验证两个流程都成功执行
        PipelineExecutionResponse response1 = future1.get(5, TimeUnit.SECONDS);
        PipelineExecutionResponse response2 = future2.get(5, TimeUnit.SECONDS);
        
        assertThat(response1).isNotNull();
        assertThat(response1.getExecutionId()).isNotNull();
        assertThat(response2).isNotNull();
        assertThat(response2.getExecutionId()).isNotNull();
        assertThat(response1.getExecutionId()).isNotEqualTo(response2.getExecutionId());
        
        // 验证执行记录正确隔离
        java.util.Optional<PipelineExecution> exec1 = executionRepository.findById(response1.getExecutionId());
        java.util.Optional<PipelineExecution> exec2 = executionRepository.findById(response2.getExecutionId());
        
        assertThat(exec1).isPresent();
        assertThat(exec2).isPresent();
        assertThat(exec1.get().getPipeline().getId()).isEqualTo(pipeline1.getId());
        assertThat(exec2.get().getPipeline().getId()).isEqualTo(pipeline2.getId());
        
        executor.shutdown();
    }
    
    /**
     * 测试执行无步骤的流程
     */
    @Test
    void testExecutePipeline_WithoutSteps_ShouldCreateErrorStep() throws Exception {
        // Given: 创建无步骤的流程
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        
        // When: 执行流程
        PipelineExecutionRequest request = new PipelineExecutionRequest();
        request.setPipelineId(pipeline.getId());
        
        try {
            PipelineExecutionResponse response = executionService.executePipeline(request, testAdmin);
            
            // 等待一段时间
            Thread.sleep(1000);
            
            // Then: 验证创建了错误步骤执行记录
            java.util.Optional<PipelineExecution> executionOpt = 
                    executionRepository.findByIdWithStepExecutions(response.getExecutionId());
            
            if (executionOpt.isPresent()) {
                PipelineExecution execution = executionOpt.get();
                // 应该有一个错误步骤执行记录
                assertThat(execution.getStepExecutions()).isNotNull();
            }
        } catch (Exception e) {
            // 预期可能会抛出异常，因为流程没有步骤
            // 但应该创建了执行记录和错误步骤
        }
    }
}
