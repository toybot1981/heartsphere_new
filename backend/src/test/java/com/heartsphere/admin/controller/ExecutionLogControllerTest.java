package com.heartsphere.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.aiagent.dto.ExecutionLogQueryRequest;
import com.heartsphere.aiagent.entity.GraphDefinition;
import com.heartsphere.aiagent.entity.GraphExecution;
import com.heartsphere.aiagent.repository.GraphDefinitionRepository;
import com.heartsphere.aiagent.repository.GraphExecutionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Graph执行日志Controller测试
 * 测试账号: admin / Tyx@19811009
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ExecutionLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private GraphDefinitionRepository graphDefinitionRepository;

    @Autowired
    private GraphExecutionRepository graphExecutionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private Long testGraphId;
    private String testExecutionId;

    @BeforeEach
    public void setUp() {
        // 确保admin用户存在
        SystemAdmin admin = adminRepository.findByUsername("admin")
                .orElseGet(() -> {
                    SystemAdmin newAdmin = new SystemAdmin();
                    newAdmin.setUsername("admin");
                    newAdmin.setPassword(passwordEncoder.encode("Tyx@19811009"));
                    newAdmin.setEmail("admin@heartsphere.cn");
                    newAdmin.setIsActive(true);
                    newAdmin.setRole("SUPER_ADMIN");
                    return adminRepository.save(newAdmin);
                });

        // 如果密码不匹配，更新密码
        if (!passwordEncoder.matches("Tyx@19811009", admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode("Tyx@19811009"));
            adminRepository.save(admin);
        }

        // 获取管理员token
        Map<String, Object> loginResponse = adminAuthService.login("admin", "Tyx@19811009");
        adminToken = (String) loginResponse.get("token");

        // 创建测试用的Graph定义和执行
        testGraphId = createTestGraph();
        testExecutionId = createTestExecution();
    }

    /**
     * 测试查询执行日志
     */
    @Test
    public void testQueryLogs() throws Exception {
        ExecutionLogQueryRequest request = ExecutionLogQueryRequest.builder()
                .executionId(testExecutionId)
                .page(0)
                .size(50)
                .build();

        mockMvc.perform(post("/api/admin/graph/executions/logs/query")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray())
                .andExpect(jsonPath("$.total").exists())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(50));
    }

    /**
     * 测试根据执行ID查询所有日志
     */
    @Test
    public void testGetLogsByExecutionId() throws Exception {
        mockMvc.perform(get("/api/admin/graph/executions/" + testExecutionId + "/logs")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("all", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    /**
     * 测试根据执行ID分页查询日志
     */
    @Test
    public void testGetLogsByExecutionIdPage() throws Exception {
        mockMvc.perform(get("/api/admin/graph/executions/" + testExecutionId + "/logs")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("page", "0")
                        .param("size", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    /**
     * 测试根据执行ID分页查询日志（使用page端点）
     */
    @Test
    public void testGetLogsByExecutionIdPageEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/graph/executions/" + testExecutionId + "/logs/page")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("page", "0")
                        .param("size", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logs").isArray())
                .andExpect(jsonPath("$.total").exists())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(50));
    }

    /**
     * 测试删除执行日志
     */
    @Test
    public void testDeleteLogsByExecutionId() throws Exception {
        mockMvc.perform(delete("/api/admin/graph/executions/" + testExecutionId + "/logs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.executionId").value(testExecutionId));
    }

    /**
     * 测试清理旧的日志
     */
    @Test
    public void testCleanupOldLogs() throws Exception {
        mockMvc.perform(post("/api/admin/graph/executions/logs/cleanup")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("daysBefore", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deletedCount").exists())
                .andExpect(jsonPath("$.daysBefore").value(30))
                .andExpect(jsonPath("$.message").exists());
    }

    /**
     * 测试清理旧的日志（默认天数）
     */
    @Test
    public void testCleanupOldLogsDefault() throws Exception {
        mockMvc.perform(post("/api/admin/graph/executions/logs/cleanup")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deletedCount").exists())
                .andExpect(jsonPath("$.daysBefore").value(30));
    }

    /**
     * 测试查询不存在的执行ID的日志
     */
    @Test
    public void testGetLogsByNonExistentExecutionId() throws Exception {
        mockMvc.perform(get("/api/admin/graph/executions/non-existent-id/logs")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    /**
     * 创建测试用的Graph定义
     */
    private Long createTestGraph() {
        GraphDefinition graph = new GraphDefinition();
        graph.setName("测试日志Graph");
        graph.setDescription("用于测试日志的Graph");
        graph.setIsActive(true);
        graph.setCreatedBy(adminRepository.findByUsername("admin").get().getId());
        return graphDefinitionRepository.save(graph).getId();
    }

    /**
     * 创建测试用的执行记录
     */
    private String createTestExecution() {
        // 先确保testGraphId已创建
        if (testGraphId == null) {
            testGraphId = createTestGraph();
        }
        
        GraphExecution execution = new GraphExecution();
        execution.setGraphId(testGraphId);
        execution.setExecutionId(UUID.randomUUID().toString());
        execution.setStatus("RUNNING");
        execution.setCreatedBy(adminRepository.findByUsername("admin").get().getId());
        graphExecutionRepository.save(execution);
        return execution.getExecutionId();
    }
}
