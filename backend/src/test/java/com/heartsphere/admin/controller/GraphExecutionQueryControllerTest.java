package com.heartsphere.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.aiagent.dto.GraphExecutionQueryRequest;
import com.heartsphere.aiagent.entity.GraphDefinition;
import com.heartsphere.aiagent.repository.GraphDefinitionRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Graph执行查询Controller测试
 * 测试账号: admin / Tyx@19811009
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class GraphExecutionQueryControllerTest {

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
    private ObjectMapper objectMapper;

    private String adminToken;
    private Long testGraphId;

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

        // 创建测试用的Graph定义
        testGraphId = createTestGraph();
    }

    /**
     * 测试查询执行历史
     */
    @Test
    public void testQueryExecutions() throws Exception {
        GraphExecutionQueryRequest request = GraphExecutionQueryRequest.builder()
                .page(0)
                .size(20)
                .build();

        mockMvc.perform(post("/api/admin/graph/executions/query")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executions").isArray())
                .andExpect(jsonPath("$.total").exists())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20));
    }

    /**
     * 测试根据Graph ID查询执行历史
     */
    @Test
    public void testQueryExecutionsByGraphId() throws Exception {
        GraphExecutionQueryRequest request = GraphExecutionQueryRequest.builder()
                .graphId(testGraphId)
                .page(0)
                .size(20)
                .build();

        mockMvc.perform(post("/api/admin/graph/executions/query")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executions").isArray());
    }

    /**
     * 测试根据状态查询执行历史
     */
    @Test
    public void testQueryExecutionsByStatus() throws Exception {
        GraphExecutionQueryRequest request = GraphExecutionQueryRequest.builder()
                .status("COMPLETED")
                .page(0)
                .size(20)
                .build();

        mockMvc.perform(post("/api/admin/graph/executions/query")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executions").isArray());
    }

    /**
     * 测试获取所有运行中的执行
     */
    @Test
    public void testGetRunningExecutions() throws Exception {
        mockMvc.perform(get("/api/admin/graph/executions/running")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executions").isArray());
    }

    /**
     * 测试根据Graph ID获取执行历史
     */
    @Test
    public void testGetExecutionsByGraphId() throws Exception {
        mockMvc.perform(get("/api/admin/graph/" + testGraphId + "/executions")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executions").isArray());
    }

    /**
     * 测试获取执行统计信息（全部）
     */
    @Test
    public void testGetExecutionStatistics() throws Exception {
        mockMvc.perform(get("/api/admin/graph/executions/statistics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isMap());
    }

    /**
     * 测试获取执行统计信息（指定Graph）
     */
    @Test
    public void testGetExecutionStatisticsByGraphId() throws Exception {
        mockMvc.perform(get("/api/admin/graph/executions/statistics")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("graphId", String.valueOf(testGraphId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isMap());
    }

    /**
     * 测试清理旧的执行记录
     */
    @Test
    public void testCleanupOldExecutions() throws Exception {
        mockMvc.perform(post("/api/admin/graph/executions/cleanup")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("daysBefore", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deletedCount").exists())
                .andExpect(jsonPath("$.daysBefore").value(30))
                .andExpect(jsonPath("$.message").exists());
    }

    /**
     * 测试清理旧的执行记录（默认天数）
     */
    @Test
    public void testCleanupOldExecutionsDefault() throws Exception {
        mockMvc.perform(post("/api/admin/graph/executions/cleanup")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deletedCount").exists())
                .andExpect(jsonPath("$.daysBefore").value(30));
    }

    /**
     * 创建测试用的Graph定义
     */
    private Long createTestGraph() {
        GraphDefinition graph = new GraphDefinition();
        graph.setName("测试查询Graph");
        graph.setDescription("用于测试查询的Graph");
        graph.setIsActive(true);
        graph.setCreatedBy(adminRepository.findByUsername("admin").get().getId());
        return graphDefinitionRepository.save(graph).getId();
    }
}
