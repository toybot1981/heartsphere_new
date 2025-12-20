package com.heartsphere.service;

import com.heartsphere.entity.JournalEntry;
import com.heartsphere.entity.Note;
import com.heartsphere.entity.NoteSync;
import com.heartsphere.repository.JournalEntryRepository;
import com.heartsphere.repository.NoteRepository;
import com.heartsphere.repository.NoteSyncRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * 笔记同步服务
 * 负责从各种笔记服务同步笔记数据
 */
@Service
public class NoteSyncService {

    private static final Logger logger = Logger.getLogger(NoteSyncService.class.getName());

    @Autowired
    private NoteSyncRepository noteSyncRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private NotionService notionService;

    // @Autowired
    // private EvernoteAuthService evernoteAuthService; // 暂时注释，等待实现

    /**
     * 同步用户的笔记
     * @param userId 用户ID
     * @param provider 笔记服务提供商
     * @return 同步结果
     */
    @Transactional
    public Map<String, Object> syncNotes(Long userId, String provider) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("syncedCount", 0);
        result.put("error", null);

        try {
            // 获取授权信息
            NoteSync noteSync = noteSyncRepository.findByUserIdAndProvider(userId, provider)
                .orElseThrow(() -> new RuntimeException("未找到" + provider + "的授权信息"));

            if (!noteSync.getIsActive()) {
                throw new RuntimeException(provider + "授权未激活");
            }

            // 更新同步状态
            noteSync.setSyncStatus("syncing");
            noteSync.setSyncError(null);
            noteSyncRepository.save(noteSync);

            int syncedCount = 0;

            // 根据provider调用不同的同步方法
            switch (provider.toLowerCase()) {
                case "evernote":
                    syncedCount = syncEvernoteNotes(userId, noteSync);
                    break;
                case "notion":
                    syncedCount = syncNotionNotes(userId, noteSync);
                    break;
                default:
                    throw new RuntimeException("不支持的笔记服务提供商: " + provider);
            }

            // 更新同步状态
            noteSync.setSyncStatus("success");
            noteSync.setLastSyncAt(LocalDateTime.now());
            noteSync.setSyncError(null);
            noteSyncRepository.save(noteSync);

            result.put("success", true);
            result.put("syncedCount", syncedCount);
            logger.info("笔记同步成功: userId=" + userId + ", provider=" + provider + ", count=" + syncedCount);

        } catch (Exception e) {
            logger.severe("笔记同步失败: userId=" + userId + ", provider=" + provider + ", error=" + e.getMessage());
            
            // 更新错误状态
            noteSyncRepository.findByUserIdAndProvider(userId, provider)
                .ifPresent(noteSync -> {
                    noteSync.setSyncStatus("error");
                    noteSync.setSyncError(e.getMessage());
                    noteSyncRepository.save(noteSync);
                });

            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * 同步印象笔记
     * @param userId 用户ID
     * @param noteSync 授权信息
     * @return 同步的笔记数量
     */
    private int syncEvernoteNotes(Long userId, NoteSync noteSync) {
        // TODO: 实现印象笔记API调用
        // 这里需要调用印象笔记API获取笔记列表
        // 由于印象笔记API较复杂，这里先返回0，后续可以完善
        
        logger.info("开始同步印象笔记: userId=" + userId);
        
        // 示例：这里应该调用印象笔记API
        // 1. 使用accessToken调用Evernote API获取笔记列表
        // 2. 解析笔记数据
        // 3. 保存到数据库
        
        return 0;
    }

    /**
     * 同步日记到 Notion
     * 将用户的所有日记条目同步到 Notion
     * @param userId 用户ID
     * @param noteSync 授权信息
     * @return 同步的日记数量
     */
    private int syncNotionNotes(Long userId, NoteSync noteSync) {
        logger.info("开始同步日记到 Notion: userId=" + userId);

        String accessToken = noteSync.getAccessToken();
        if (accessToken == null || accessToken.isEmpty()) {
            throw new RuntimeException("Notion access token 为空");
        }

        // 获取用户的所有日记条目
        List<JournalEntry> journalEntries = journalEntryRepository.findByUser_Id(userId);
        logger.info("找到 " + journalEntries.size() + " 条日记需要同步");

        if (journalEntries.isEmpty()) {
            logger.info("用户没有日记需要同步");
            return 0;
        }

        // 获取 Notion 父页面/数据库 ID
        // 可以从配置中获取，或者使用默认值
        // 这里暂时使用 workspace_id（存储在 refreshToken 字段中）作为父页面
        // 实际使用时，用户需要在 Notion 中创建一个数据库或页面，然后将 ID 配置到系统中
        String parentId = noteSync.getRefreshToken(); // workspace_id 存储在 refreshToken 字段中
        
        if (parentId == null || parentId.isEmpty()) {
            // 如果没有配置父页面，尝试获取用户的工作区
            // 注意：这需要用户手动在 Notion 中创建一个数据库或页面
            throw new RuntimeException("未配置 Notion 父页面/数据库 ID。请在 Notion 中创建一个数据库或页面，然后将 ID 配置到系统中。");
        }

        int syncedCount = 0;
        int failedCount = 0;

        for (JournalEntry journalEntry : journalEntries) {
            try {
                // 检查是否已经同步过（可以通过在 Note 表中记录来判断）
                // 这里简化处理，每次都同步（实际应该检查是否已同步）
                
                String pageId = notionService.syncJournalEntryToNotion(accessToken, parentId, journalEntry);
                logger.info("日记同步成功 - journalId: " + journalEntry.getId() + ", notionPageId: " + pageId);
                
                // 可选：保存同步记录到 Note 表
                // saveSyncRecord(userId, "notion", journalEntry.getId(), pageId);
                
                syncedCount++;
                
                // 添加延迟，避免 API 限流
                Thread.sleep(300); // 300ms 延迟
                
            } catch (Exception e) {
                failedCount++;
                logger.warning("同步日记失败 - journalId: " + journalEntry.getId() + ", error: " + e.getMessage());
                // 继续同步其他日记，不中断整个流程
            }
        }

        logger.info("Notion 同步完成 - 成功: " + syncedCount + ", 失败: " + failedCount);
        
        if (syncedCount == 0 && failedCount > 0) {
            throw new RuntimeException("所有日记同步失败，请检查 Notion 配置和网络连接");
        }

        return syncedCount;
    }

    /**
     * 获取用户的笔记列表
     * @param userId 用户ID
     * @param provider 笔记服务提供商（可选）
     * @return 笔记列表
     */
    public List<Note> getUserNotes(Long userId, String provider) {
        if (provider != null && !provider.isEmpty()) {
            return noteRepository.findByUserIdAndProvider(userId, provider);
        }
        return noteRepository.findByUserIdAndIsDeletedFalse(userId);
    }

    /**
     * 获取用户的笔记同步配置
     * @param userId 用户ID
     * @return 同步配置列表
     */
    public List<NoteSync> getUserNoteSyncs(Long userId) {
        return noteSyncRepository.findByUserId(userId);
    }

    /**
     * 获取活跃的笔记同步配置
     * @param userId 用户ID
     * @return 活跃的同步配置列表
     */
    public List<NoteSync> getActiveNoteSyncs(Long userId) {
        return noteSyncRepository.findByUserIdAndIsActiveTrue(userId);
    }
}

