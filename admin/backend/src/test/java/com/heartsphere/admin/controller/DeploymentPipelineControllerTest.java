package com.heartsphere.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.DeploymentPipelineDTO;
import com.heartsphere.admin.dto.PipelineExecutionRequest;
import com.heartsphere.admin.dto.PipelineStepDTO;
import com.heartsphere.admin.entity.DeploymentPipeline;
import com.heartsphere.admin.entity.PipelineStep;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.entity.PipelineExecution;
import com.heartsphere.admin.repository.DeploymentPipelineRepository;
import com.heartsphere.admin.repository.PipelineExecutionRepository;
import com.heartsphere.admin.repository.PipelineStepExecutionRepository;
import com.heartsphere.admin.repository.PipelineStepRepository;
import com.heartsphere.admin.repository.ScriptExecutionRepository;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.admin.service.DeploymentPipelineService;
import com.heartsphere.admin.service.PipelineExecutionService;
import com.heartsphere.admin.util.PipelineTestDataBuilder;
import com.heartsphere.shared.util.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 部署流程 Controller 集成测试
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DeploymentPipelineControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private DeploymentPipelineRepository pipelineRepository;
    
    @Autowired
    private PipelineStepRepository stepRepository;
    
    @Autowired
    private PipelineStepExecutionRepository stepExecutionRepository;
    
    @Autowired
    private ScriptExecutionRepository scriptExecutionRepository;
    
    @Autowired
    private PipelineExecutionRepository executionRepository;
    
    @Autowired
    private SystemAdminRepository adminRepository;
    
    @Autowired
    private DeploymentPipelineService pipelineService;
    
    @Autowired
    private PipelineExecutionService executionService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private SystemAdmin testAdmin;
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
     * 测试获取所有流程模板列表
     */
    @Test
    void testGetAllPipelines_ShouldReturn200() throws Exception {
        // Given: 创建测试流程
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        
        // When & Then: 调用 API
        mockMvc.perform(get("/api/admin/devops/pipelines")
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(pipeline.getId()))
                .andExpect(jsonPath("$[0].name").value("测试流程"));
    }
    
    /**
     * 测试按环境过滤流程模板
     */
    @Test
    void testGetAllPipelines_ByEnvironment_ShouldReturnFiltered() throws Exception {
        // Given: 创建不同环境的流程
        DeploymentPipeline testPipeline = PipelineTestDataBuilder.createTestPipeline("test");
        testPipeline.setCreatedBy(testAdmin);
        testPipeline = pipelineRepository.save(testPipeline);
        
        DeploymentPipeline prodPipeline = PipelineTestDataBuilder.createTestPipeline("prod");
        prodPipeline.setCreatedBy(testAdmin);
        prodPipeline = pipelineRepository.save(prodPipeline);
        
        // When & Then: 按环境过滤
        mockMvc.perform(get("/api/admin/devops/pipelines")
                .param("environment", "test")
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].environment").value("test"));
    }
    
    /**
     * 测试按项目过滤流程模板
     */
    @Test
    void testGetAllPipelines_ByProject_ShouldReturnFiltered() throws Exception {
        // Given: 创建不同项目的流程
        DeploymentPipeline mainPipeline = PipelineTestDataBuilder.createTestPipeline("main", "test");
        mainPipeline.setCreatedBy(testAdmin);
        mainPipeline = pipelineRepository.save(mainPipeline);
        
        DeploymentPipeline adminPipeline = PipelineTestDataBuilder.createTestPipeline("admin", "test");
        adminPipeline.setCreatedBy(testAdmin);
        adminPipeline = pipelineRepository.save(adminPipeline);
        
        // When & Then: 按项目过滤
        mockMvc.perform(get("/api/admin/devops/pipelines")
                .param("project", "main")
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].project").value("main"));
    }
    
    /**
     * 测试组合过滤（环境和项目）
     */
    @Test
    void testGetAllPipelines_ByEnvironmentAndProject_ShouldReturnFiltered() throws Exception {
        // Given: 创建不同组合的流程
        DeploymentPipeline pipeline1 = PipelineTestDataBuilder.createTestPipeline("main", "test");
        pipeline1.setCreatedBy(testAdmin);
        pipeline1 = pipelineRepository.save(pipeline1);
        
        DeploymentPipeline pipeline2 = PipelineTestDataBuilder.createTestPipeline("main", "prod");
        pipeline2.setCreatedBy(testAdmin);
        pipeline2 = pipelineRepository.save(pipeline2);
        
        // When & Then: 组合过滤
        mockMvc.perform(get("/api/admin/devops/pipelines")
                .param("project", "main")
                .param("environment", "test")
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].project").value("main"))
                .andExpect(jsonPath("$[0].environment").value("test"));
    }
    
    /**
     * 测试获取流程模板详情
     */
    @Test
    void testGetPipeline_WithValidId_ShouldReturn200() throws Exception {
        // Given: 创建测试流程
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        
        // When & Then: 获取详情
        mockMvc.perform(get("/api/admin/devops/pipelines/{pipelineId}", pipeline.getId())
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(pipeline.getId()))
                .andExpect(jsonPath("$.name").value("测试流程"));
    }
    
    /**
     * 测试获取不存在的流程模板
     */
    @Test
    void testGetPipeline_WithNonExistentId_ShouldReturn404() throws Exception {
        // When & Then: 获取不存在的流程
        mockMvc.perform(get("/api/admin/devops/pipelines/99999")
                .header("Authorization", authToken))
                .andExpect(status().isNotFound());
    }
    
    /**
     * 测试创建流程模板
     */
    @Test
    void testCreatePipeline_WithValidData_ShouldReturn200() throws Exception {
        // Given: 准备流程数据
        DeploymentPipelineDTO dto = new DeploymentPipelineDTO();
        dto.setName("新流程");
        dto.setDescription("新流程描述");
        dto.setEnvironment("test");
        dto.setProject("main");
        dto.setIsTemplate(false);
        
        // When & Then: 创建流程
        String response = mockMvc.perform(post("/api/admin/devops/pipelines")
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("新流程"))
                .andExpect(jsonPath("$.id").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        // 验证流程已保存
        DeploymentPipelineDTO created = objectMapper.readValue(response, DeploymentPipelineDTO.class);
        assertThat(pipelineRepository.findById(created.getId())).isPresent();
    }
    
    /**
     * 测试创建包含步骤的流程模板
     */
    @Test
    void testCreatePipeline_WithSteps_ShouldReturn200() throws Exception {
        // Given: 准备包含步骤的流程数据
        DeploymentPipelineDTO dto = new DeploymentPipelineDTO();
        dto.setName("带步骤的流程");
        dto.setEnvironment("test");
        dto.setProject("main");
        
        List<PipelineStepDTO> steps = new ArrayList<>();
        PipelineStepDTO step1 = new PipelineStepDTO();
        step1.setName("代码扫描");
        step1.setScriptId("code-scan-eslint");
        step1.setOrder(1);
        steps.add(step1);
        
        PipelineStepDTO step2 = new PipelineStepDTO();
        step2.setName("构建项目");
        step2.setScriptId("build-backend");
        step2.setOrder(2);
        steps.add(step2);
        
        dto.setSteps(steps);
        
        // When & Then: 创建流程
        mockMvc.perform(post("/api/admin/devops/pipelines")
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("带步骤的流程"))
                .andExpect(jsonPath("$.steps").isArray())
                .andExpect(jsonPath("$.steps.length()").value(2));
    }
    
    /**
     * 测试更新流程模板
     */
    @Test
    void testUpdatePipeline_WithValidData_ShouldReturn200() throws Exception {
        // Given: 创建测试流程
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        
        // 准备更新数据
        DeploymentPipelineDTO dto = new DeploymentPipelineDTO();
        dto.setName("更新后的流程");
        dto.setDescription("更新后的描述");
        dto.setEnvironment("prod");
        dto.setProject("admin");
        
        // When & Then: 更新流程
        mockMvc.perform(put("/api/admin/devops/pipelines/{pipelineId}", pipeline.getId())
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("更新后的流程"))
                .andExpect(jsonPath("$.environment").value("prod"));
        
        // 验证更新已保存
        DeploymentPipeline updated = pipelineRepository.findById(pipeline.getId()).orElseThrow();
        assertThat(updated.getName()).isEqualTo("更新后的流程");
        assertThat(updated.getEnvironment()).isEqualTo("prod");
    }
    
    /**
     * 测试删除流程模板
     */
    @Test
    void testDeletePipeline_WithValidId_ShouldReturn200() throws Exception {
        // Given: 创建测试流程
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        
        // When & Then: 删除流程
        mockMvc.perform(delete("/api/admin/devops/pipelines/{pipelineId}", pipeline.getId())
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("流程模板已删除"));
        
        // 验证流程已删除
        assertThat(pipelineRepository.findById(pipeline.getId())).isEmpty();
    }
    
    /**
     * 测试执行流程
     */
    @Test
    void testExecutePipeline_WithValidPipeline_ShouldReturn200() throws Exception {
        // Given: 创建包含步骤的测试流程
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        
        // 保存步骤
        for (PipelineStep step : pipeline.getSteps()) {
            stepRepository.save(step);
        }
        
        // When & Then: 执行流程
        mockMvc.perform(post("/api/admin/devops/pipelines/{pipelineId}/execute", pipeline.getId())
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PipelineExecutionRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").exists())
                .andExpect(jsonPath("$.status").value("RUNNING"));
    }
    
    /**
     * 测试执行不存在的流程
     */
    @Test
    void testExecutePipeline_WithNonExistentPipeline_ShouldReturn404() throws Exception {
        // When & Then: 执行不存在的流程
        mockMvc.perform(post("/api/admin/devops/pipelines/99999/execute")
                .header("Authorization", authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PipelineExecutionRequest())))
                .andExpect(status().isNotFound());
    }
    
    /**
     * 测试获取执行状态
     */
    @Test
    void testGetExecutionStatus_WithValidExecution_ShouldReturn200() throws Exception {
        // Given: 创建流程并执行
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        for (com.heartsphere.admin.entity.PipelineStep step : pipeline.getSteps()) {
            stepRepository.save(step);
        }
        
        // 执行流程
        PipelineExecutionRequest request = new PipelineExecutionRequest();
        request.setPipelineId(pipeline.getId());
        com.heartsphere.admin.dto.PipelineExecutionResponse executionResponse = executionService.executePipeline(request, testAdmin);
        
        // When & Then: 获取执行状态
        mockMvc.perform(get("/api/admin/devops/pipelines/executions/{executionId}", executionResponse.getExecutionId())
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(executionResponse.getExecutionId()))
                .andExpect(jsonPath("$.status").exists());
    }
    
    /**
     * 测试获取不存在的执行状态
     */
    @Test
    void testGetExecutionStatus_WithNonExistentExecution_ShouldReturn404() throws Exception {
        // When & Then: 获取不存在的执行
        mockMvc.perform(get("/api/admin/devops/pipelines/executions/99999")
                .header("Authorization", authToken))
                .andExpect(status().isNotFound());
    }
    
    /**
     * 测试获取执行详情
     */
    @Test
    void testGetExecutionDetail_WithValidExecution_ShouldReturn200() throws Exception {
        // Given: 创建流程并执行
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        for (com.heartsphere.admin.entity.PipelineStep step : pipeline.getSteps()) {
            stepRepository.save(step);
        }
        
        // 执行流程
        PipelineExecutionRequest request = new PipelineExecutionRequest();
        request.setPipelineId(pipeline.getId());
        com.heartsphere.admin.dto.PipelineExecutionResponse executionResponse = executionService.executePipeline(request, testAdmin);
        
        // When & Then: 获取执行详情
        mockMvc.perform(get("/api/admin/devops/pipelines/executions/{executionId}/detail", executionResponse.getExecutionId())
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(executionResponse.getExecutionId()))
                .andExpect(jsonPath("$.stepExecutions").exists());
    }
    
    /**
     * 测试获取执行列表
     */
    @Test
    void testGetExecutionHistory_ShouldReturn200() throws Exception {
        // Given: 创建流程并执行
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        for (com.heartsphere.admin.entity.PipelineStep step : pipeline.getSteps()) {
            stepRepository.save(step);
        }
        
        // 执行流程
        PipelineExecutionRequest request = new PipelineExecutionRequest();
        request.setPipelineId(pipeline.getId());
        executionService.executePipeline(request, testAdmin);
        
        // When & Then: 获取执行列表
        mockMvc.perform(get("/api/admin/devops/pipelines/executions")
                .header("Authorization", authToken)
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").exists());
    }
    
    /**
     * 测试按流程 ID 过滤执行列表
     */
    @Test
    void testGetExecutionHistory_ByPipelineId_ShouldReturnFiltered() throws Exception {
        // Given: 创建两个流程并执行
        DeploymentPipeline pipeline1 = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline1.setCreatedBy(testAdmin);
        pipeline1 = pipelineRepository.save(pipeline1);
        for (com.heartsphere.admin.entity.PipelineStep step : pipeline1.getSteps()) {
            stepRepository.save(step);
        }
        
        DeploymentPipeline pipeline2 = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline2.setCreatedBy(testAdmin);
        pipeline2 = pipelineRepository.save(pipeline2);
        for (com.heartsphere.admin.entity.PipelineStep step : pipeline2.getSteps()) {
            stepRepository.save(step);
        }
        
        // 执行两个流程
        PipelineExecutionRequest request1 = new PipelineExecutionRequest();
        request1.setPipelineId(pipeline1.getId());
        executionService.executePipeline(request1, testAdmin);
        
        PipelineExecutionRequest request2 = new PipelineExecutionRequest();
        request2.setPipelineId(pipeline2.getId());
        executionService.executePipeline(request2, testAdmin);
        
        // When & Then: 按流程 ID 过滤
        mockMvc.perform(get("/api/admin/devops/pipelines/executions")
                .header("Authorization", authToken)
                .param("pipelineId", pipeline1.getId().toString())
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
    
    /**
     * 测试认证失败场景
     */
    @Test
    void testGetAllPipelines_WithoutAuth_ShouldReturn401() throws Exception {
        // When & Then: 不带认证头
        mockMvc.perform(get("/api/admin/devops/pipelines"))
                .andExpect(status().isUnauthorized());
    }
    
    /**
     * 测试无效 Token
     */
    @Test
    void testGetAllPipelines_WithInvalidToken_ShouldReturn401() throws Exception {
        // When & Then: 使用无效 Token
        mockMvc.perform(get("/api/admin/devops/pipelines")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }
    
    /**
     * 测试取消执行
     */
    @Test
    void testCancelExecution_WithRunningExecution_ShouldReturn200() throws Exception {
        // Given: 创建流程并执行
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        for (com.heartsphere.admin.entity.PipelineStep step : pipeline.getSteps()) {
            stepRepository.save(step);
        }
        
        // 执行流程
        PipelineExecutionRequest request = new PipelineExecutionRequest();
        request.setPipelineId(pipeline.getId());
        com.heartsphere.admin.dto.PipelineExecutionResponse executionResponse = executionService.executePipeline(request, testAdmin);
        
        // When & Then: 取消执行
        mockMvc.perform(post("/api/admin/devops/pipelines/executions/{executionId}/cancel", executionResponse.getExecutionId())
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("流程执行已取消"));
    }
    
    /**
     * 测试取消不存在的执行
     */
    @Test
    void testCancelExecution_WithNonExistentExecution_ShouldReturn404() throws Exception {
        // When & Then: 取消不存在的执行
        mockMvc.perform(post("/api/admin/devops/pipelines/executions/99999/cancel")
                .header("Authorization", authToken))
                .andExpect(status().isNotFound());
    }
    
    /**
     * 测试下载执行日志（有步骤执行）
     */
    @Test
    void testDownloadLog_WithStepExecutions_ShouldReturn200() throws Exception {
        // Given: 创建流程并执行
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        for (com.heartsphere.admin.entity.PipelineStep step : pipeline.getSteps()) {
            stepRepository.save(step);
        }
        
        // 执行流程
        PipelineExecutionRequest request = new PipelineExecutionRequest();
        request.setPipelineId(pipeline.getId());
        com.heartsphere.admin.dto.PipelineExecutionResponse executionResponse = executionService.executePipeline(request, testAdmin);
        
        // When & Then: 下载日志
        mockMvc.perform(get("/api/admin/devops/pipelines/executions/{executionId}/log/download", executionResponse.getExecutionId())
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/plain;charset=UTF-8"))
                .andExpect(header().exists("Content-Disposition"));
    }
    
    /**
     * 测试下载不存在的执行日志
     */
    @Test
    void testDownloadLog_WithNonExistentExecution_ShouldReturn404() throws Exception {
        // When & Then: 下载不存在的执行日志
        mockMvc.perform(get("/api/admin/devops/pipelines/executions/99999/log/download")
                .header("Authorization", authToken))
                .andExpect(status().isNotFound());
    }
    
    /**
     * 测试下载无步骤执行的日志
     */
    @Test
    void testDownloadLog_WithoutStepExecutions_ShouldReturn200() throws Exception {
        // Given: 创建无步骤的流程并执行
        DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();
        pipeline.setCreatedBy(testAdmin);
        pipeline = pipelineRepository.save(pipeline);
        
        // 执行流程（会因为没有步骤而失败，但会创建执行记录）
        PipelineExecutionRequest request = new PipelineExecutionRequest();
        request.setPipelineId(pipeline.getId());
        try {
            executionService.executePipeline(request, testAdmin);
        } catch (Exception e) {
            // 预期会失败，因为流程没有步骤
        }
        
        // 查找执行记录
        java.util.List<com.heartsphere.admin.entity.PipelineExecution> executions = 
                executionRepository.findByPipelineIdOrderByStartedAtDesc(pipeline.getId());
        
        if (!executions.isEmpty()) {
            Long executionId = executions.get(0).getId();
            
            // When & Then: 下载日志（应该返回基本信息）
            mockMvc.perform(get("/api/admin/devops/pipelines/executions/{executionId}/log/download", executionId)
                    .header("Authorization", authToken))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Type", "text/plain;charset=UTF-8"));
        }
    }
    
    /**
     * 测试获取项目列表
     */
    @Test
    void testGetProjects_ShouldReturn200() throws Exception {
        // When & Then: 获取项目列表
        mockMvc.perform(get("/api/admin/devops/pipelines/projects")
                .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0]").exists());
    }
}
