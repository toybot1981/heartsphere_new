package com.heartsphere.controller;

import com.heartsphere.dto.AuthResponse;
import com.heartsphere.entity.User;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.entity.World;
import com.heartsphere.repository.WorldRepository;
import java.util.List;
import com.heartsphere.service.InitializationService;
import com.heartsphere.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/wechat")
public class WeChatController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private InitializationService initializationService;

    @Autowired
    private WorldRepository worldRepository;

    @Value("${wechat.app-id}")
    private String wechatAppId;

    @Value("${wechat.app-secret}")
    private String wechatAppSecret;

    @PostMapping("/login")
    public ResponseEntity<?> wechatLogin(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Code is required!");
        }

        // 调用微信API获取openid
        String url = String.format("https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                wechatAppId, wechatAppSecret, code);

        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || response.containsKey("errcode")) {
            return ResponseEntity.badRequest().body("Error: WeChat authentication failed!");
        }

        String openid = (String) response.get("openid");
        String unionid = (String) response.get("unionid");

        // 查找或创建用户
        User user = userRepository.findByWechatOpenid(openid)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setWechatOpenid(openid);
                    newUser.setUsername("wx_" + openid.substring(0, 10));
                    newUser.setEmail(openid + "@wechat.com");
                    newUser.setPassword(passwordEncoder.encode(openid));
                    newUser.setNickname("微信用户");
                    return userRepository.save(newUser);
                });

        // 使用新添加的findByUserId方法查询用户的世界
        List<World> userWorlds = worldRepository.findByUserId(user.getId());
        boolean isFirstLogin = userWorlds.isEmpty();
        if (isFirstLogin) {
            // 初始化用户数据（世界、时代、角色）
            initializationService.initializeUserData(user);
        }

        // 生成JWT令牌
        String jwt = jwtUtils.generateJwtTokenFromUsername(user.getUsername());

        // 返回登录响应，包含是否是首次登录的标识
        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "nickname", user.getNickname(),
                "avatar", user.getAvatar(),
                "isFirstLogin", isFirstLogin
        ));
    }

    @GetMapping("/appid")
    public ResponseEntity<?> getWechatAppId() {
        Map<String, String> response = new HashMap<>();
        response.put("appid", wechatAppId);
        return ResponseEntity.ok(response);
    }
}