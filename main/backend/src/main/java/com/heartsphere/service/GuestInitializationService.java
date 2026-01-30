package com.heartsphere.service;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.SystemCharacter;
import com.heartsphere.entity.SystemEra;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.SystemCharacterRepository;
import com.heartsphere.repository.SystemEraRepository;
import com.heartsphere.repository.WorldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 游客默认场景与角色初始化。
 * 为新建的 guest 用户创建默认 World、Era（日常生活助手 system_era_id=50）、6 个 Character（时小光等）。
 */
@Service
public class GuestInitializationService {

    /** 游客默认场景：日常生活助手 */
    public static final long GUEST_DEFAULT_SYSTEM_ERA_ID = 50L;
    /** 游客默认 6 个角色（时小光、康小健、学小知、心小暖、心小安、暖小阳） */
    public static final List<Long> GUEST_DEFAULT_SYSTEM_CHARACTER_IDS =
            List.of(315L, 316L, 317L, 318L, 319L, 320L);

    @Autowired
    private WorldRepository worldRepository;
    @Autowired
    private EraRepository eraRepository;
    @Autowired
    private CharacterRepository characterRepository;
    @Autowired
    private SystemEraRepository systemEraRepository;
    @Autowired
    private SystemCharacterRepository systemCharacterRepository;

    /**
     * 为指定游客用户创建默认世界、场景与 6 个角色。若该用户已有世界则跳过（幂等）。
     */
    @Transactional
    public void initializeForGuest(User guest) {
        List<World> existing = worldRepository.findByUserId(guest.getId());
        if (!existing.isEmpty()) {
            return;
        }
        World world = new World();
        world.setName("心域");
        world.setDescription("一个平行于现实的记忆与情感世界");
        world.setUser(guest);
        world = worldRepository.save(world);

        SystemEra systemEra = systemEraRepository.findById(GUEST_DEFAULT_SYSTEM_ERA_ID).orElse(null);
        if (systemEra == null || !Boolean.TRUE.equals(systemEra.getIsActive())) {
            return;
        }
        Era era = new Era();
        era.setName(systemEra.getName());
        era.setDescription(systemEra.getDescription());
        era.setStartYear(systemEra.getStartYear());
        era.setEndYear(systemEra.getEndYear());
        era.setImageUrl(systemEra.getImageUrl());
        era.setStyle(systemEra.getStyle() != null ? systemEra.getStyle() : "minimalist");
        era.setSystemEraId(systemEra.getId());
        era.setWorld(world);
        era.setUser(guest);
        era.setIsDeleted(false);
        era = eraRepository.save(era);

        List<SystemCharacter> systemChars = systemCharacterRepository.findAllById(GUEST_DEFAULT_SYSTEM_CHARACTER_IDS);
        for (SystemCharacter sc : systemChars) {
            if (sc.getIsActive() == null || !sc.getIsActive()) continue;
            Character ch = new Character();
            ch.setName(sc.getName());
            ch.setDescription(sc.getDescription());
            ch.setAge(sc.getAge());
            ch.setGender(sc.getGender());
            ch.setRole(sc.getRole());
            ch.setBio(sc.getBio());
            ch.setAvatarUrl(sc.getAvatarUrl());
            ch.setBackgroundUrl(sc.getBackgroundUrl());
            ch.setThemeColor(sc.getThemeColor());
            ch.setColorAccent(sc.getColorAccent());
            ch.setFirstMessage(sc.getFirstMessage());
            ch.setSystemInstruction(sc.getSystemInstruction());
            ch.setVoiceName(sc.getVoiceName());
            ch.setMbti(sc.getMbti());
            ch.setTags(sc.getTags());
            ch.setSpeechStyle(sc.getSpeechStyle());
            ch.setCatchphrases(sc.getCatchphrases());
            ch.setSecrets(sc.getSecrets());
            ch.setMotivations(sc.getMotivations());
            ch.setRelationships(sc.getRelationships());
            ch.setWorld(world);
            ch.setEra(era);
            ch.setUser(guest);
            ch.setIsDeleted(false);
            characterRepository.save(ch);
        }
    }
}
