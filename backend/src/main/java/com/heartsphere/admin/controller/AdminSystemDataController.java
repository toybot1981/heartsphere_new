package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.dto.SystemMainStoryDTO;
import com.heartsphere.admin.dto.SystemWorldDTO;
import com.heartsphere.admin.dto.InviteCodeDTO;
import com.heartsphere.admin.dto.GenerateInviteCodeRequest;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.admin.service.SystemDataService;
import com.heartsphere.admin.service.InviteCodeService;
import com.heartsphere.admin.service.SystemConfigService;
import com.heartsphere.admin.service.SystemResourceService;
import com.heartsphere.admin.dto.SystemResourceDTO;
import com.heartsphere.admin.dto.SubscriptionPlanDTO;
import com.heartsphere.admin.service.AdminSubscriptionPlanService;
import com.heartsphere.dto.ScriptDTO;
import com.heartsphere.entity.Script;
import com.heartsphere.entity.World;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.User;
import com.heartsphere.repository.ScriptRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.utils.DTOMapper;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/system")
public class AdminSystemDataController {

    @Autowired
    private SystemDataService systemDataService;

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private InviteCodeService inviteCodeService;

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private SystemResourceService systemResourceService;

    @Autowired
    private AdminSubscriptionPlanService adminSubscriptionPlanService;

    @Autowired
    private com.heartsphere.service.EmailService emailService;

    @Autowired
    private ScriptRepository scriptRepository;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private EraRepository eraRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 验证管理员token的拦截器方法
     */
    private com.heartsphere.admin.entity.SystemAdmin validateAdmin(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("需要管理员认证");
        }
        String token = authHeader.substring(7);
        return adminAuthService.validateToken(token);
    }

    // ========== SystemWorld APIs ==========
    @GetMapping("/worlds")
    public ResponseEntity<List<SystemWorldDTO>> getAllWorlds(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getAllWorlds());
    }

    @GetMapping("/worlds/{id}")
    public ResponseEntity<SystemWorldDTO> getWorldById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getWorldById(id));
    }

    @PostMapping("/worlds")
    public ResponseEntity<SystemWorldDTO> createWorld(
            @RequestBody SystemWorldDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.createWorld(dto));
    }

    @PutMapping("/worlds/{id}")
    public ResponseEntity<SystemWorldDTO> updateWorld(
            @PathVariable Long id,
            @RequestBody SystemWorldDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.updateWorld(id, dto));
    }

    @DeleteMapping("/worlds/{id}")
    public ResponseEntity<Void> deleteWorld(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        systemDataService.deleteWorld(id);
        return ResponseEntity.noContent().build();
    }

    // ========== SystemEra APIs ==========
    @GetMapping(value = "/eras", produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemEraDTO>> getAllEras(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getAllEras());
    }

    @GetMapping(value = "/eras/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemEraDTO> getEraById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getEraById(id));
    }

    @PostMapping(value = "/eras", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemEraDTO> createEra(
            @RequestBody SystemEraDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.createEra(dto));
    }

    @PutMapping(value = "/eras/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemEraDTO> updateEra(
            @PathVariable Long id,
            @RequestBody SystemEraDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.updateEra(id, dto));
    }

    @DeleteMapping("/eras/{id}")
    public ResponseEntity<Void> deleteEra(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        systemDataService.deleteEra(id);
        return ResponseEntity.noContent().build();
    }

    // ========== SystemCharacter APIs ==========
    @GetMapping(value = "/characters", produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemCharacterDTO>> getAllCharacters(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info("========== [AdminSystemDataController] 获取所有系统角色 ==========");
        validateAdmin(authHeader);
        List<SystemCharacterDTO> result = systemDataService.getAllCharacters();
        logger.info(String.format("[AdminSystemDataController] 返回 %d 个系统角色", result.size()));
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/characters/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemCharacterDTO> getCharacterById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info(String.format("========== [AdminSystemDataController] 获取系统角色详情 ========== ID: %d", id));
        validateAdmin(authHeader);
        SystemCharacterDTO result = systemDataService.getCharacterById(id);
        logger.info(String.format("[AdminSystemDataController] 成功获取系统角色: ID=%d, name=%s", result.getId(), result.getName()));
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/characters", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemCharacterDTO> createCharacter(
            @RequestBody SystemCharacterDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info("========== [AdminSystemDataController] 创建系统角色 ==========");
        logger.info(String.format("[AdminSystemDataController] 请求参数: name=%s, role=%s", dto.getName(), dto.getRole()));
        validateAdmin(authHeader);
        SystemCharacterDTO result = systemDataService.createCharacter(dto);
        logger.info(String.format("[AdminSystemDataController] 系统角色创建成功: ID=%d, name=%s", result.getId(), result.getName()));
        return ResponseEntity.ok(result);
    }

    @PutMapping(value = "/characters/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemCharacterDTO> updateCharacter(
            @PathVariable Long id,
            @RequestBody SystemCharacterDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info(String.format("========== [AdminSystemDataController] 更新系统角色 ========== ID: %d", id));
        logger.info(String.format("[AdminSystemDataController] 请求参数: name=%s, role=%s", dto.getName(), dto.getRole()));
        validateAdmin(authHeader);
        SystemCharacterDTO result = systemDataService.updateCharacter(id, dto);
        logger.info(String.format("[AdminSystemDataController] 系统角色更新成功: ID=%d, name=%s", result.getId(), result.getName()));
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/characters/{id}")
    public ResponseEntity<Void> deleteCharacter(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info(String.format("========== [AdminSystemDataController] 删除系统角色 ========== ID: %d", id));
        validateAdmin(authHeader);
        systemDataService.deleteCharacter(id);
        logger.info(String.format("[AdminSystemDataController] 系统角色删除成功: ID=%d", id));
        return ResponseEntity.noContent().build();
    }

    // ========== SystemMainStory APIs ==========
    @GetMapping("/main-stories")
    public ResponseEntity<List<SystemMainStoryDTO>> getAllMainStories(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getAllMainStories());
    }

    @GetMapping("/main-stories/{id}")
    public ResponseEntity<SystemMainStoryDTO> getMainStoryById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getMainStoryById(id));
    }

    @GetMapping("/main-stories/era/{eraId}")
    public ResponseEntity<SystemMainStoryDTO> getMainStoryByEraId(
            @PathVariable Long eraId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        SystemMainStoryDTO story = systemDataService.getMainStoryByEraId(eraId);
        if (story == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(story);
    }

    @PostMapping("/main-stories")
    public ResponseEntity<SystemMainStoryDTO> createMainStory(
            @RequestBody SystemMainStoryDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.createMainStory(dto));
    }

    @PutMapping("/main-stories/{id}")
    public ResponseEntity<SystemMainStoryDTO> updateMainStory(
            @PathVariable Long id,
            @RequestBody SystemMainStoryDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.updateMainStory(id, dto));
    }

    @DeleteMapping("/main-stories/{id}")
    public ResponseEntity<Void> deleteMainStory(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        systemDataService.deleteMainStory(id);
        return ResponseEntity.noContent().build();
    }

    // ========== InviteCode APIs ==========
    @GetMapping("/invite-codes")
    public ResponseEntity<List<InviteCodeDTO>> getAllInviteCodes(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(inviteCodeService.getAllInviteCodes());
    }

    @PostMapping("/invite-codes/generate")
    public ResponseEntity<List<InviteCodeDTO>> generateInviteCodes(
            @RequestBody GenerateInviteCodeRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        com.heartsphere.admin.entity.SystemAdmin admin = validateAdmin(authHeader);
        return ResponseEntity.ok(inviteCodeService.generateInviteCodes(request, admin.getId()));
    }

    // ========== SystemConfig APIs ==========
    @GetMapping("/config/invite-code-required")
    public ResponseEntity<Map<String, Object>> getInviteCodeRequired(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        boolean required = systemConfigService.isInviteCodeRequired();
        return ResponseEntity.ok(Map.of("inviteCodeRequired", required));
    }

      @PutMapping("/config/invite-code-required")
      public ResponseEntity<Map<String, Object>> setInviteCodeRequired(
              @RequestBody Map<String, Boolean> request,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          Boolean required = request.get("inviteCodeRequired");
          if (required == null) {
              return ResponseEntity.badRequest().body(Map.of("error", "inviteCodeRequired is required"));
          }
          systemConfigService.setInviteCodeRequired(required);
          return ResponseEntity.ok(Map.of("inviteCodeRequired", required));
      }

      // ========== Email Verification Config APIs ==========
      @GetMapping("/config/email-verification-required")
      public ResponseEntity<Map<String, Object>> getEmailVerificationRequired(
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          boolean required = systemConfigService.isEmailVerificationRequired();
          return ResponseEntity.ok(Map.of("emailVerificationRequired", required));
      }

      @PutMapping("/config/email-verification-required")
      public ResponseEntity<Map<String, Object>> setEmailVerificationRequired(
              @RequestBody Map<String, Object> request,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          Object requiredObj = request.get("emailVerificationRequired");
          if (requiredObj == null) {
              return ResponseEntity.badRequest().body(Map.of("error", "emailVerificationRequired is required"));
          }
          Boolean required;
          if (requiredObj instanceof Boolean) {
              required = (Boolean) requiredObj;
          } else if (requiredObj instanceof String) {
              required = Boolean.parseBoolean((String) requiredObj);
          } else {
              return ResponseEntity.badRequest().body(Map.of("error", "emailVerificationRequired must be a boolean"));
          }
          systemConfigService.setEmailVerificationRequired(required);
          return ResponseEntity.ok(Map.of("emailVerificationRequired", required));
      }

      // ========== WeChat Config APIs ==========
      @GetMapping("/config/wechat")
      public ResponseEntity<Map<String, Object>> getWechatConfig(
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          Map<String, Object> config = new HashMap<>();
          config.put("appId", systemConfigService.getWechatAppId() != null ? systemConfigService.getWechatAppId() : "");
          config.put("appSecret", systemConfigService.getWechatAppSecret() != null ? systemConfigService.getWechatAppSecret() : "");
          config.put("redirectUri", systemConfigService.getWechatRedirectUri());
          return ResponseEntity.ok(config);
      }

      @PutMapping("/config/wechat")
      public ResponseEntity<Map<String, Object>> setWechatConfig(
              @RequestBody Map<String, String> request,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          String appId = request.get("appId");
          String appSecret = request.get("appSecret");
          String redirectUri = request.get("redirectUri");
          
          if (appId != null) {
              systemConfigService.setWechatAppId(appId);
          }
          if (appSecret != null) {
              systemConfigService.setWechatAppSecret(appSecret);
          }
          if (redirectUri != null) {
              systemConfigService.setWechatRedirectUri(redirectUri);
          }
          
          Map<String, Object> response = new HashMap<>();
          response.put("appId", systemConfigService.getWechatAppId() != null ? systemConfigService.getWechatAppId() : "");
          response.put("appSecret", systemConfigService.getWechatAppSecret() != null ? systemConfigService.getWechatAppSecret() : "");
          response.put("redirectUri", systemConfigService.getWechatRedirectUri());
          return ResponseEntity.ok(response);
      }

      // ========== Email Config APIs ==========
      @GetMapping("/config/email")
      public ResponseEntity<Map<String, Object>> getEmailConfig(
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          Map<String, Object> config = new HashMap<>();
          config.put("host", systemConfigService.getEmailHost() != null ? systemConfigService.getEmailHost() : "smtp.163.com");
          config.put("port", systemConfigService.getEmailPort() != null ? systemConfigService.getEmailPort() : "25");
          config.put("username", systemConfigService.getEmailUsername() != null ? systemConfigService.getEmailUsername() : "tongyexin@163.com");
          config.put("password", systemConfigService.getEmailPassword() != null ? "******" : ""); // 密码不返回明文
          config.put("from", systemConfigService.getEmailFrom());
          return ResponseEntity.ok(config);
      }

      @PutMapping("/config/email")
      public ResponseEntity<Map<String, Object>> setEmailConfig(
              @RequestBody Map<String, String> request,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          String host = request.get("host");
          String port = request.get("port");
          String username = request.get("username");
          String password = request.get("password");
          String from = request.get("from");
          
          if (host != null) {
              systemConfigService.setEmailHost(host);
          }
          if (port != null) {
              systemConfigService.setEmailPort(port);
          }
          if (username != null) {
              systemConfigService.setEmailUsername(username);
          }
          if (password != null) {
              systemConfigService.setEmailPassword(password);
          }
          if (from != null) {
              systemConfigService.setEmailFrom(from);
          }
          
          // 更新邮件服务配置
          try {
              emailService.updateMailSender();
          } catch (Exception e) {
              java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName())
                  .warning("更新邮件服务配置失败: " + e.getMessage());
          }
          
          Map<String, Object> response = new HashMap<>();
          response.put("host", systemConfigService.getEmailHost() != null ? systemConfigService.getEmailHost() : "smtp.163.com");
          response.put("port", systemConfigService.getEmailPort() != null ? systemConfigService.getEmailPort() : "25");
          response.put("username", systemConfigService.getEmailUsername() != null ? systemConfigService.getEmailUsername() : "tongyexin@163.com");
          response.put("password", "******");
          response.put("from", systemConfigService.getEmailFrom());
          return ResponseEntity.ok(response);
      }

      // ========== Evernote Config APIs ==========
      @GetMapping("/config/evernote")
      public ResponseEntity<Map<String, Object>> getEvernoteConfig(
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          Map<String, Object> config = new HashMap<>();
          config.put("consumerKey", systemConfigService.getEvernoteConsumerKey() != null ? systemConfigService.getEvernoteConsumerKey() : "");
          config.put("consumerSecret", "******"); // 不返回实际密钥
          config.put("sandbox", systemConfigService.isEvernoteSandbox());
          return ResponseEntity.ok(config);
      }

      @PutMapping("/config/evernote")
      public ResponseEntity<Map<String, Object>> setEvernoteConfig(
              @RequestBody Map<String, String> request,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          String consumerKey = request.get("consumerKey");
          String consumerSecret = request.get("consumerSecret");
          Boolean sandbox = request.containsKey("sandbox") ? Boolean.parseBoolean(request.get("sandbox")) : null;

          java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
          logger.info("设置印象笔记配置 - consumerKey: " + (consumerKey != null ? consumerKey : "null") + 
                     ", consumerSecret: " + (consumerSecret != null ? "***" : "null") + 
                     ", sandbox: " + sandbox);

          if (consumerKey != null && !consumerKey.trim().isEmpty()) {
              systemConfigService.setEvernoteConsumerKey(consumerKey.trim());
              logger.info("已保存Consumer Key: " + consumerKey.trim());
          } else if (consumerKey != null && consumerKey.trim().isEmpty()) {
              logger.warning("Consumer Key为空字符串，跳过保存");
          }
          if (consumerSecret != null && !consumerSecret.trim().isEmpty()) {
              systemConfigService.setEvernoteConsumerSecret(consumerSecret.trim());
              logger.info("已保存Consumer Secret");
          } else if (consumerSecret != null && consumerSecret.trim().isEmpty()) {
              logger.warning("Consumer Secret为空字符串，跳过保存");
          }
          if (sandbox != null) {
              systemConfigService.setEvernoteSandbox(sandbox);
              logger.info("已保存Sandbox设置: " + sandbox);
          }

          // 验证配置是否已保存
          String savedKey = systemConfigService.getEvernoteConsumerKey();
          String savedSecret = systemConfigService.getEvernoteConsumerSecret();
          logger.info("验证保存结果 - Consumer Key: " + (savedKey != null ? savedKey : "null") + 
                     ", Consumer Secret: " + (savedSecret != null && !savedSecret.isEmpty() ? "已保存" : "未保存"));

          Map<String, Object> response = new HashMap<>();
          response.put("consumerKey", systemConfigService.getEvernoteConsumerKey() != null ? systemConfigService.getEvernoteConsumerKey() : "");
          response.put("consumerSecret", "******");
          response.put("sandbox", systemConfigService.isEvernoteSandbox());
          return ResponseEntity.ok(response);
      }

      // ========== System Resource APIs ==========
      @GetMapping("/resources")
      public ResponseEntity<List<SystemResourceDTO>> getAllResources(
              @RequestParam(required = false) String category,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          try {
              validateAdmin(authHeader);
              if (category != null && !category.isEmpty()) {
                  return ResponseEntity.ok(systemResourceService.getResourcesByCategory(category));
              }
              return ResponseEntity.ok(systemResourceService.getAllResources());
          } catch (Exception e) {
              java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
              logger.severe("获取资源失败: " + e.getMessage());
              e.printStackTrace();
              throw e;
          }
      }

      @GetMapping("/resources/{id}")
      public ResponseEntity<SystemResourceDTO> getResourceById(
              @PathVariable Long id,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          return ResponseEntity.ok(systemResourceService.getResourceById(id));
      }

      @PostMapping("/resources")
      public ResponseEntity<SystemResourceDTO> createResource(
              @RequestParam("file") MultipartFile file,
              @RequestParam("category") String category,
              @RequestParam(value = "name", required = false) String name,
              @RequestParam(value = "description", required = false) String description,
              @RequestParam(value = "prompt", required = false) String prompt,
              @RequestParam(value = "tags", required = false) String tags,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          com.heartsphere.admin.entity.SystemAdmin admin = validateAdmin(authHeader);
          return ResponseEntity.ok(systemResourceService.createResource(file, category, name, description, prompt, tags, admin.getId()));
      }

      @PutMapping("/resources/{id}")
      public ResponseEntity<SystemResourceDTO> updateResource(
              @PathVariable Long id,
              @RequestBody Map<String, String> request,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          return ResponseEntity.ok(systemResourceService.updateResource(
                  id,
                  request.get("name"),
                  request.get("description"),
                  request.get("prompt"),
                  request.get("tags"),
                  request.get("url")
          ));
      }

      @DeleteMapping("/resources/{id}")
      public ResponseEntity<Void> deleteResource(
              @PathVariable Long id,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          systemResourceService.deleteResource(id);
          return ResponseEntity.ok().build();
      }

      // ========== Subscription Plan Management APIs ==========
      @GetMapping(value = "/subscription-plans", produces = "application/json;charset=UTF-8")
      public ResponseEntity<List<SubscriptionPlanDTO>> getAllSubscriptionPlans(
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          List<SubscriptionPlanDTO> plans = adminSubscriptionPlanService.getAllPlans();
          // 确保响应头包含UTF-8字符集
          return ResponseEntity.ok()
                  .header("Content-Type", "application/json;charset=UTF-8")
                  .body(plans);
      }

      @GetMapping("/subscription-plans/{id}")
      public ResponseEntity<SubscriptionPlanDTO> getSubscriptionPlanById(
              @PathVariable Long id,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          return ResponseEntity.ok(adminSubscriptionPlanService.getPlanById(id));
      }

      @PostMapping("/subscription-plans")
      public ResponseEntity<SubscriptionPlanDTO> createSubscriptionPlan(
              @RequestBody SubscriptionPlanDTO dto,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          return ResponseEntity.ok(adminSubscriptionPlanService.createPlan(dto));
      }

      @PutMapping("/subscription-plans/{id}")
      public ResponseEntity<SubscriptionPlanDTO> updateSubscriptionPlan(
              @PathVariable Long id,
              @RequestBody SubscriptionPlanDTO dto,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          return ResponseEntity.ok(adminSubscriptionPlanService.updatePlan(id, dto));
      }

      @DeleteMapping("/subscription-plans/{id}")
      public ResponseEntity<Void> deleteSubscriptionPlan(
              @PathVariable Long id,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          adminSubscriptionPlanService.deletePlan(id);
          return ResponseEntity.ok().build();
      }

      // ========== User Scripts Management APIs (管理员管理用户剧本) ==========
      @GetMapping(value = "/scripts", produces = "application/json;charset=UTF-8")
      public ResponseEntity<List<ScriptDTO>> getAllUserScripts(
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          // 管理员可以查看所有用户的剧本（包括已删除的）
          List<Script> scripts = scriptRepository.findAll();
          List<ScriptDTO> scriptDTOs = scripts.stream()
                  .map(DTOMapper::toScriptDTO)
                  .collect(Collectors.toList());
          return ResponseEntity.ok()
                  .header("Content-Type", "application/json;charset=UTF-8")
                  .body(scriptDTOs);
      }

      @GetMapping("/scripts/{id}")
      public ResponseEntity<ScriptDTO> getUserScriptById(
              @PathVariable Long id,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          Script script = scriptRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("剧本不存在: " + id));
          return ResponseEntity.ok(DTOMapper.toScriptDTO(script));
      }

      @PostMapping("/scripts")
      public ResponseEntity<ScriptDTO> createUserScript(
              @RequestBody ScriptDTO scriptDTO,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          
          // 验证必需字段
          if (scriptDTO.getUserId() == null) {
              throw new RuntimeException("创建剧本时必须指定 userId");
          }
          if (scriptDTO.getWorldId() == null) {
              throw new RuntimeException("创建剧本时必须指定 worldId");
          }
          
          // 获取用户
          User user = userRepository.findById(scriptDTO.getUserId())
                  .orElseThrow(() -> new RuntimeException("用户不存在: " + scriptDTO.getUserId()));
          
          // 获取世界
          World world = worldRepository.findById(scriptDTO.getWorldId())
                  .orElseThrow(() -> new RuntimeException("世界不存在: " + scriptDTO.getWorldId()));
          
          Script script = new Script();
          script.setTitle(scriptDTO.getTitle());
          script.setContent(scriptDTO.getContent());
          script.setSceneCount(scriptDTO.getSceneCount());
          script.setUser(user);
          script.setWorld(world);
          
          // 如果指定了 eraId，设置时代
          if (scriptDTO.getEraId() != null) {
              Era era = eraRepository.findById(scriptDTO.getEraId())
                      .orElseThrow(() -> new RuntimeException("时代不存在: " + scriptDTO.getEraId()));
              script.setEra(era);
          }
          
          Script savedScript = scriptRepository.save(script);
          return ResponseEntity.ok(DTOMapper.toScriptDTO(savedScript));
      }

      @PutMapping("/scripts/{id}")
      public ResponseEntity<ScriptDTO> updateUserScript(
              @PathVariable Long id,
              @RequestBody ScriptDTO scriptDTO,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          Script script = scriptRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("剧本不存在: " + id));
          
          script.setTitle(scriptDTO.getTitle());
          script.setContent(scriptDTO.getContent());
          script.setSceneCount(scriptDTO.getSceneCount());
          
          // 如果 worldId 改变，更新 world 关联
          if (scriptDTO.getWorldId() != null && !scriptDTO.getWorldId().equals(script.getWorld().getId())) {
              World world = worldRepository.findById(scriptDTO.getWorldId())
                      .orElseThrow(() -> new RuntimeException("世界不存在: " + scriptDTO.getWorldId()));
              script.setWorld(world);
          }
          
          // 如果 eraId 改变，更新 era 关联
          if (scriptDTO.getEraId() != null) {
              if (script.getEra() == null || !scriptDTO.getEraId().equals(script.getEra().getId())) {
                  Era era = eraRepository.findById(scriptDTO.getEraId())
                          .orElseThrow(() -> new RuntimeException("时代不存在: " + scriptDTO.getEraId()));
                  script.setEra(era);
              }
          } else {
              script.setEra(null);
          }
          
          Script updatedScript = scriptRepository.save(script);
          return ResponseEntity.ok(DTOMapper.toScriptDTO(updatedScript));
      }

      @DeleteMapping("/scripts/{id}")
      public ResponseEntity<Void> deleteUserScript(
              @PathVariable Long id,
              @RequestHeader(value = "Authorization", required = false) String authHeader) {
          validateAdmin(authHeader);
          Script script = scriptRepository.findById(id)
                  .orElseThrow(() -> new RuntimeException("剧本不存在: " + id));
          
          // 软删除
          script.setIsDeleted(true);
          script.setDeletedAt(java.time.LocalDateTime.now());
          scriptRepository.save(script);
          return ResponseEntity.ok().build();
      }
}

