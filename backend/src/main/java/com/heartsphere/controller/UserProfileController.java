package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.dto.UpdateUserProfileRequest;
import com.heartsphere.dto.UserDTO;
import com.heartsphere.dto.UserProfileStatisticsDTO;
import com.heartsphere.entity.User;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.UserProfileService;
import com.heartsphere.utils.DTOMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 用户资料管理控制器
 * 提供用户个人信息管理和统计数据查询的API接口
 */
@Slf4j
@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * 获取当前用户的资料信息
     */
    @GetMapping
    public ResponseEntity<ApiResponse<UserDTO>> getProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("未授权：请重新登录"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            User user = userProfileService.getUserProfile(userId);
            UserDTO userDTO = DTOMapper.toUserDTO(user);

            return ResponseEntity.ok(ApiResponse.success("获取用户资料成功", userDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("获取用户资料失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取用户资料失败：" + e.getMessage()));
        }
    }

    /**
     * 更新用户资料（昵称和/或头像）
     */
    @PutMapping
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @Valid @RequestBody UpdateUserProfileRequest request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("未授权：请重新登录"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            User updatedUser = userProfileService.updateProfile(
                    userId,
                    request.getNickname(),
                    request.getAvatar()
            );

            UserDTO userDTO = DTOMapper.toUserDTO(updatedUser);

            return ResponseEntity.ok(ApiResponse.success("更新用户资料成功", userDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("更新用户资料失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("更新用户资料失败：" + e.getMessage()));
        }
    }

    /**
     * 更新用户昵称
     */
    @PutMapping("/nickname")
    public ResponseEntity<ApiResponse<UserDTO>> updateNickname(
            @RequestBody @Valid UpdateUserProfileRequest request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("未授权：请重新登录"));
            }

            if (request.getNickname() == null || request.getNickname().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("昵称不能为空"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            User updatedUser = userProfileService.updateNickname(userId, request.getNickname());
            UserDTO userDTO = DTOMapper.toUserDTO(updatedUser);

            return ResponseEntity.ok(ApiResponse.success("更新昵称成功", userDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("更新昵称失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("更新昵称失败：" + e.getMessage()));
        }
    }

    /**
     * 更新用户头像
     */
    @PutMapping("/avatar")
    public ResponseEntity<ApiResponse<UserDTO>> updateAvatar(
            @RequestBody @Valid UpdateUserProfileRequest request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("未授权：请重新登录"));
            }

            if (request.getAvatar() == null || request.getAvatar().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("头像URL不能为空"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            User updatedUser = userProfileService.updateAvatar(userId, request.getAvatar());
            UserDTO userDTO = DTOMapper.toUserDTO(updatedUser);

            return ResponseEntity.ok(ApiResponse.success("更新头像成功", userDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("更新头像失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("更新头像失败：" + e.getMessage()));
        }
    }

    /**
     * 获取用户统计数据
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<UserProfileStatisticsDTO>> getStatistics(
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("未授权：请重新登录"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            UserProfileStatisticsDTO statistics = userProfileService.getStatistics(userId);

            return ResponseEntity.ok(ApiResponse.success("获取统计数据成功", statistics));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("获取统计数据失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取统计数据失败：" + e.getMessage()));
        }
    }
}




