package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.GenerateInviteCodeRequest;
import com.heartsphere.admin.dto.InviteCodeDTO;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.InviteCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 邀请码管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/invite-codes")
public class AdminInviteCodeController extends BaseAdminController {

    @Autowired
    private InviteCodeService inviteCodeService;

    @GetMapping
    public ResponseEntity<List<InviteCodeDTO>> getAllInviteCodes(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(inviteCodeService.getAllInviteCodes());
    }

    @PostMapping("/generate")
    public ResponseEntity<List<InviteCodeDTO>> generateInviteCodes(
            @RequestBody GenerateInviteCodeRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        SystemAdmin admin = validateAdmin(authHeader);
        return ResponseEntity.ok(inviteCodeService.generateInviteCodes(request, admin.getId()));
    }
}




