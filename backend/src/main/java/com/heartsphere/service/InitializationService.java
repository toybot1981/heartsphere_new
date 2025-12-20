package com.heartsphere.service;

import com.heartsphere.entity.User;
import com.heartsphere.entity.*;
import com.heartsphere.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InitializationService {

    @Autowired
    private WorldRepository worldRepository;

    @Transactional
    public void initializeUserData(User user) {
        // 只创建主世界，不创建默认场景和角色
        // 场景、角色、主线剧情、剧本都通过初始化向导来创建
        // 这样用户可以只选择他们想要的预置场景，而不是自动创建所有体验场景
        // 非登录用户用于体验的三个场景（大学时代、赛博都市、心域心理治疗诊所）不会初始化给用户
        World mainWorld = new World();
        mainWorld.setName("心域");
        mainWorld.setDescription("一个平行于现实的记忆与情感世界");
        mainWorld.setUser(user);
        worldRepository.save(mainWorld);
    }
}
