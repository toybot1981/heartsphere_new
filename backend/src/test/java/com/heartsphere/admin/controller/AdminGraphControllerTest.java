package com.heartsphere.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.aiagent.dto.GraphDefinitionCreateRequest;
import com.heartsphere.aiagent.dto.GraphDefinitionDTO;
import com.heartsphere.aiagent.dto.GraphNodeDTO;
import com.heartsphere.aiagent.dto.GraphEdgeDTO;
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
 * Graph管理Controller测试
 * 测试账号: admin / Tyx@19811009
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AdminGraphControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminAuthService adminAuthService;

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
    }

    /**
     * 测试获取所有Graph定义
     */
    @Test
    public void testGetAllGraphs() throws Exception {
        mockMvc.perform(get("/api/admin/graph")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    /**
     * 测试创建Graph定义
     */
    @Test
    public void testCreateGraph() throws Exception {
        GraphDefinitionCreateRequest request = createTestGraphRequest();

        String response = mockMvc.perform(post("/api/admin/graph")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("测试Graph"))
                .andExpect(jsonPath("$.description").value("这是一个测试Graph"))
                .andExpect(jsonPath("$.nodes").isArray())
                .andExpect(jsonPath("$.edges").isArray())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 保存创建的Graph ID用于后续测试
        GraphDefinitionDTO graph = objectMapper.readValue(response, GraphDefinitionDTO.class);
        testGraphId = graph.getId();
    }

    /**
     * 测试根据ID获取Graph定义
     */
    @Test
    public void testGetGraphById() throws Exception {
        // 先创建一个Graph
        GraphDefinitionCreateRequest request = createTestGraphRequest();
        String createResponse = mockMvc.perform(post("/api/admin/graph")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphDefinitionDTO createdGraph = objectMapper.readValue(createResponse, GraphDefinitionDTO.class);
        Long graphId = createdGraph.getId();

        // 获取Graph
        mockMvc.perform(get("/api/admin/graph/" + graphId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(graphId))
                .andExpect(jsonPath("$.name").value("测试Graph"))
                .andExpect(jsonPath("$.nodes").isArray())
                .andExpect(jsonPath("$.edges").isArray());
    }

    /**
     * 测试获取不存在的Graph
     */
    @Test
    public void testGetGraphByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/admin/graph/99999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    /**
     * 测试更新Graph定义
     */
    @Test
    public void testUpdateGraph() throws Exception {
        // 先创建一个Graph
        GraphDefinitionCreateRequest createRequest = createTestGraphRequest();
        String createResponse = mockMvc.perform(post("/api/admin/graph")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphDefinitionDTO createdGraph = objectMapper.readValue(createResponse, GraphDefinitionDTO.class);
        Long graphId = createdGraph.getId();

        // 更新Graph
        GraphDefinitionCreateRequest updateRequest = createTestGraphRequest();
        updateRequest.setName("更新后的Graph");
        updateRequest.setDescription("这是更新后的描述");

        mockMvc.perform(put("/api/admin/graph/" + graphId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(graphId))
                .andExpect(jsonPath("$.name").value("更新后的Graph"))
                .andExpect(jsonPath("$.description").value("这是更新后的描述"));
    }

    /**
     * 测试删除Graph定义
     */
    @Test
    public void testDeleteGraph() throws Exception {
        // 先创建一个Graph
        GraphDefinitionCreateRequest request = createTestGraphRequest();
        String createResponse = mockMvc.perform(post("/api/admin/graph")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        GraphDefinitionDTO createdGraph = objectMapper.readValue(createResponse, GraphDefinitionDTO.class);
        Long graphId = createdGraph.getId();

        // 删除Graph
        mockMvc.perform(delete("/api/admin/graph/" + graphId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // 验证Graph已被删除
        mockMvc.perform(get("/api/admin/graph/" + graphId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    /**
     * 测试未授权访问
     */
    @Test
    public void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/admin/graph"))
                .andExpect(status().is5xxServerError()); // BaseAdminController会抛出RuntimeException
    }

    /**
     * 测试无效token
     */
    @Test
    public void testInvalidToken() throws Exception {
        mockMvc.perform(get("/api/admin/graph")
                        .header("Authorization", "Bearer invalid_token"))
                .andExpect(status().is5xxServerError());
    }

    /**
     * 创建测试用的Graph请求对象
     */
    private GraphDefinitionCreateRequest createTestGraphRequest() {
        GraphDefinitionCreateRequest request = new GraphDefinitionCreateRequest();
        request.setName("测试Graph");
        request.setDescription("这是一个测试Graph");
        request.setIsActive(true);

        // 创建节点
        List<GraphNodeDTO> nodes = new ArrayList<>();

        // Start节点
        GraphNodeDTO startNode = new GraphNodeDTO();
        startNode.setNodeId("start");
        startNode.setNodeType("START");
        startNode.setPositionX(100.0);
        startNode.setPositionY(100.0);
        startNode.setNodeConfig(new HashMap<>());
        nodes.add(startNode);

        // LLM节点
        GraphNodeDTO llmNode = new GraphNodeDTO();
        llmNode.setNodeId("llm1");
        llmNode.setNodeType("LLM");
        llmNode.setPositionX(300.0);
        llmNode.setPositionY(100.0);
        Map<String, Object> llmConfig = new HashMap<>();
        llmConfig.put("model", "qwen-max");
        llmConfig.put("prompt", "请回答用户的问题");
        llmNode.setNodeConfig(llmConfig);
        nodes.add(llmNode);

        // End节点
        GraphNodeDTO endNode = new GraphNodeDTO();
        endNode.setNodeId("end");
        endNode.setNodeType("END");
        endNode.setPositionX(500.0);
        endNode.setPositionY(100.0);
        endNode.setNodeConfig(new HashMap<>());
        nodes.add(endNode);

        request.setNodes(nodes);

        // 创建边
        List<GraphEdgeDTO> edges = new ArrayList<>();

        // Start -> LLM
        GraphEdgeDTO edge1 = new GraphEdgeDTO();
        edge1.setSourceNodeId("start");
        edge1.setTargetNodeId("llm1");
        edge1.setEdgeType("default");
        edges.add(edge1);

        // LLM -> End
        GraphEdgeDTO edge2 = new GraphEdgeDTO();
        edge2.setSourceNodeId("llm1");
        edge2.setTargetNodeId("end");
        edge2.setEdgeType("default");
        edges.add(edge2);

        request.setEdges(edges);

        return request;
    }
}
