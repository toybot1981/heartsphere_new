package com.heartsphere.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.aiagent.dto.*;
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

import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Graph执行Controller测试
 * 测试账号: admin / Tyx@19811009
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class GraphExecutionControllerTest {

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
     * 测试执行Graph
     */
    @Test
    public void testExecuteGraph() throws Exception {
        GraphExecutionRequest request = GraphExecutionRequest.builder()
                .initialState(new HashMap<>())
                .build();

        mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").exists())
                .andExpect(jsonPath("$.graphId").value(testGraphId))
                .andExpect(jsonPath("$.status").exists());
    }

    /**
     * 测试执行Graph（无请求体）
     */
    @Test
    public void testExecuteGraphWithoutBody() throws Exception {
        mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").exists())
                .andExpect(jsonPath("$.graphId").value(testGraphId));
    }

    /**
     * 测试获取执行状态
     */
    @Test
    public void testGetExecutionStatus() throws Exception {
        // 先执行Graph
        GraphExecutionRequest request = GraphExecutionRequest.builder()
                .initialState(new HashMap<>())
                .build();

        String executeResponse = mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphExecutionDTO execution = objectMapper.readValue(executeResponse, GraphExecutionDTO.class);
        String executionId = execution.getExecutionId();

        // 获取执行状态
        mockMvc.perform(get("/api/admin/graph/" + testGraphId + "/execution/" + executionId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").value(executionId))
                .andExpect(jsonPath("$.graphId").value(testGraphId))
                .andExpect(jsonPath("$.status").exists());
    }

    /**
     * 测试继续执行（用于WaitNode）
     */
    @Test
    public void testContinueExecution() throws Exception {
        // 先执行Graph
        GraphExecutionRequest request = GraphExecutionRequest.builder()
                .initialState(new HashMap<>())
                .build();

        String executeResponse = mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphExecutionDTO execution = objectMapper.readValue(executeResponse, GraphExecutionDTO.class);
        String executionId = execution.getExecutionId();

        // 继续执行
        mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execution/" + executionId + "/continue")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").value(executionId));
    }

    /**
     * 测试用户选择（用于ChoiceNode）
     */
    @Test
    public void testMakeChoice() throws Exception {
        // 先执行Graph
        GraphExecutionRequest request = GraphExecutionRequest.builder()
                .initialState(new HashMap<>())
                .build();

        String executeResponse = mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphExecutionDTO execution = objectMapper.readValue(executeResponse, GraphExecutionDTO.class);
        String executionId = execution.getExecutionId();

        // 做出选择
        GraphExecutionChoiceRequest choiceRequest = GraphExecutionChoiceRequest.builder()
                .optionId("option-0")
                .build();

        mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execution/" + executionId + "/choice")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(choiceRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").value(executionId));
    }

    /**
     * 测试暂停执行
     */
    @Test
    public void testPauseExecution() throws Exception {
        // 先执行Graph
        GraphExecutionRequest request = GraphExecutionRequest.builder()
                .initialState(new HashMap<>())
                .build();

        String executeResponse = mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphExecutionDTO execution = objectMapper.readValue(executeResponse, GraphExecutionDTO.class);
        String executionId = execution.getExecutionId();

        // 暂停执行
        GraphExecutionPauseRequest pauseRequest = GraphExecutionPauseRequest.builder()
                .reason("测试暂停")
                .build();

        mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execution/" + executionId + "/pause")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pauseRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").value(executionId));
    }

    /**
     * 测试恢复执行
     */
    @Test
    public void testResumeExecution() throws Exception {
        // 先执行Graph
        GraphExecutionRequest request = GraphExecutionRequest.builder()
                .initialState(new HashMap<>())
                .build();

        String executeResponse = mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphExecutionDTO execution = objectMapper.readValue(executeResponse, GraphExecutionDTO.class);
        String executionId = execution.getExecutionId();

        // 恢复执行
        mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execution/" + executionId + "/resume")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").value(executionId));
    }

    /**
     * 测试取消执行
     */
    @Test
    public void testCancelExecution() throws Exception {
        // 先执行Graph
        GraphExecutionRequest request = GraphExecutionRequest.builder()
                .initialState(new HashMap<>())
                .build();

        String executeResponse = mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphExecutionDTO execution = objectMapper.readValue(executeResponse, GraphExecutionDTO.class);
        String executionId = execution.getExecutionId();

        // 取消执行
        mockMvc.perform(post("/api/admin/graph/" + testGraphId + "/execution/" + executionId + "/cancel")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.executionId").value(executionId));
    }

    /**
     * 测试执行不存在的Graph
     */
    @Test
    public void testExecuteNonExistentGraph() throws Exception {
        GraphExecutionRequest request = GraphExecutionRequest.builder()
                .initialState(new HashMap<>())
                .build();

        mockMvc.perform(post("/api/admin/graph/99999/execute")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    /**
     * 创建测试用的Graph定义
     */
    private Long createTestGraph() {
        GraphDefinition graph = new GraphDefinition();
        graph.setName("测试执行Graph");
        graph.setDescription("用于测试执行的Graph");
        graph.setIsActive(true);
        graph.setCreatedBy(adminRepository.findByUsername("admin").get().getId());
        return graphDefinitionRepository.save(graph).getId();
    }
}
