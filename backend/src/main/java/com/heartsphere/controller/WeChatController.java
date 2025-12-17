package com.heartsphere.controller;

import com.heartsphere.service.WeChatAuthService;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.entity.World;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.heartsphere.utils.DTOMapper;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/wechat")
public class WeChatController {

    @Autowired
    private WeChatAuthService weChatAuthService;

    @Autowired
    private WorldRepository worldRepository;

    /**
     * 生成微信登录二维码URL
     */
    @GetMapping("/qr-code")
    public ResponseEntity<?> getQrCodeUrl() {
        try {
            Map<String, String> result = weChatAuthService.generateQrCodeUrl();
            Map<String, Object> response = new HashMap<>();
            response.put("qrCodeUrl", result.get("qrCodeUrl"));
            response.put("state", result.get("state"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "生成二维码失败: " + e.getMessage()));
        }
    }

    /**
     * 检查登录状态（前端轮询）
     */
    @GetMapping("/status/{state}")
    public ResponseEntity<?> checkStatus(@PathVariable String state) {
        try {
            Map<String, Object> status = weChatAuthService.checkLoginStatus(state);
            
            // 如果登录成功，添加世界列表
            if ("confirmed".equals(status.get("status"))) {
                Long userId = (Long) status.get("userId");
                List<World> userWorlds = worldRepository.findByUserId(userId);
                boolean isFirstLogin = userWorlds.isEmpty();
                status.put("isFirstLogin", isFirstLogin);
                status.put("worlds", userWorlds.stream()
                    .map(DTOMapper::toWorldDTO)
                    .collect(Collectors.toList()));
            }
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "检查状态失败: " + e.getMessage()));
        }
    }

    /**
     * 微信OAuth回调接口
     */
    @GetMapping("/callback")
    public ResponseEntity<?> callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state) {
        try {
            if (code == null || state == null) {
                return ResponseEntity.badRequest().body("<html><body><h1>登录失败：缺少必要参数</h1></body></html>");
            }

            Map<String, Object> result = weChatAuthService.handleCallback(code, state);
            
            if ("confirmed".equals(result.get("status"))) {
                // 登录成功，返回成功页面（前端会通过轮询获取状态）
                return ResponseEntity.ok()
                    .header("Content-Type", "text/html;charset=UTF-8")
                    .body("<html><body><h1>登录成功！</h1><p>请关闭此页面，返回应用查看登录结果。</p><script>setTimeout(function(){window.close();}, 2000);</script></body></html>");
            } else {
                return ResponseEntity.badRequest()
                    .header("Content-Type", "text/html;charset=UTF-8")
                    .body("<html><body><h1>登录失败</h1><p>" + result.get("error") + "</p></body></html>");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .header("Content-Type", "text/html;charset=UTF-8")
                .body("<html><body><h1>登录异常</h1><p>" + e.getMessage() + "</p></body></html>");
        }
    }

    /**
     * 获取微信AppID（兼容旧接口）
     */
    @GetMapping("/appid")
    public ResponseEntity<?> getWechatAppId() {
        Map<String, String> response = new HashMap<>();
        response.put("appid", weChatAuthService.getAppId());
        return ResponseEntity.ok(response);
    }
}