package com.heartsphere.service;

import com.heartsphere.entity.ChronosLetter;
import com.heartsphere.entity.User;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.repository.ChronosLetterRepository;
import com.heartsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 跨时空信箱（时间信件）服务
 * 注意：与EmailService（真实邮件发送）区分开
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChronosLetterService {
    
    private final ChronosLetterRepository chronosLetterRepository;
    private final UserRepository userRepository;
    
    /**
     * 获取用户的所有信件
     */
    public List<ChronosLetter> getUserLetters(Long userId) {
        return chronosLetterRepository.findByUser_IdOrderByTimestampDesc(userId);
    }
    
    /**
     * 获取用户的未读信件数量
     */
    public Long getUnreadLetterCount(Long userId) {
        return chronosLetterRepository.countUnreadLettersByUserId(userId);
    }
    
    /**
     * 获取用户的未读信件
     */
    public List<ChronosLetter> getUnreadLetters(Long userId) {
        return chronosLetterRepository.findByUser_IdAndIsReadFalseOrderByTimestampDesc(userId);
    }
    
    /**
     * 根据ID获取信件（确保用户只能访问自己的信件）
     */
    public ChronosLetter getLetterById(String letterId, Long userId) {
        return chronosLetterRepository.findByIdAndUser_Id(letterId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("信件不存在: " + letterId));
    }
    
    /**
     * 创建用户反馈信件
     */
    @Transactional
    public ChronosLetter createUserFeedback(Long userId, String subject, String content, 
                                   String senderId, String senderName, String senderAvatarUrl, String themeColor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在: " + String.valueOf(userId)));
        
        ChronosLetter letter = new ChronosLetter();
        letter.setUser(user);
        letter.setSenderId(senderId != null ? senderId : "user");
        letter.setSenderName(senderName != null ? senderName : "我");
        letter.setSenderAvatarUrl(senderAvatarUrl);
        letter.setSubject(subject);
        letter.setContent(content);
        letter.setType("user_feedback");
        letter.setIsRead(false);
        letter.setThemeColor(themeColor);
        
        ChronosLetter saved = chronosLetterRepository.save(letter);
        log.info("创建用户反馈信件 - userId={}, letterId={}, subject={}", userId, saved.getId(), subject);
        return saved;
    }
    
    /**
     * 创建管理员回复
     * @param parentLetterId 父信件ID
     * @param content 回复内容
     * @return 创建的信件
     */
    @Transactional
    public ChronosLetter createAdminReply(String parentLetterId, String content) {
        // 获取父信件（不验证userId，因为管理员可以回复任何用户的信件）
        ChronosLetter parentLetter = chronosLetterRepository.findById(parentLetterId)
                .orElseThrow(() -> new ResourceNotFoundException("信件不存在: " + parentLetterId));
        
        ChronosLetter reply = new ChronosLetter();
        reply.setUser(parentLetter.getUser()); // 回复给原信件的用户
        reply.setSenderId("admin");
        reply.setSenderName("管理员");
        reply.setSenderAvatarUrl(null); // 管理员头像可以后续配置
        reply.setSubject("回复：" + parentLetter.getSubject());
        reply.setContent(content);
        reply.setType("admin_reply");
        reply.setParentLetterId(parentLetterId);
        reply.setIsRead(false);
        reply.setThemeColor("#6366f1"); // 管理员回复使用固定颜色
        
        ChronosLetter saved = chronosLetterRepository.save(reply);
        log.info("创建管理员回复 - userId={}, parentLetterId={}, replyId={}", 
                parentLetter.getUser().getId(), parentLetterId, saved.getId());
        return saved;
    }
    
    /**
     * 标记信件为已读
     */
    @Transactional
    public ChronosLetter markAsRead(String letterId, Long userId) {
        ChronosLetter letter = getLetterById(letterId, userId);
        letter.setIsRead(true);
        ChronosLetter saved = chronosLetterRepository.save(letter);
        log.info("标记信件为已读 - userId={}, letterId={}", userId, letterId);
        return saved;
    }
    
    /**
     * 删除信件
     */
    @Transactional
    public void deleteLetter(String letterId, Long userId) {
        ChronosLetter letter = getLetterById(letterId, userId);
        chronosLetterRepository.delete(letter);
        log.info("删除信件 - userId={}, letterId={}", userId, letterId);
    }
    
    /**
     * 获取信件的所有回复
     */
    public List<ChronosLetter> getLetterReplies(String letterId) {
        return chronosLetterRepository.findByParentLetterIdOrderByTimestampAsc(letterId);
    }
    
    /**
     * 获取所有用户反馈（管理员用）
     */
    public List<ChronosLetter> getAllUserFeedbacks() {
        return chronosLetterRepository.findByTypeOrderByTimestampDesc("user_feedback");
    }
    
    /**
     * 根据ID获取信件（管理员用，不验证userId）
     */
    public ChronosLetter getLetterByIdForAdmin(String letterId) {
        return chronosLetterRepository.findById(letterId)
                .orElseThrow(() -> new ResourceNotFoundException("信件不存在: " + letterId));
    }
}

