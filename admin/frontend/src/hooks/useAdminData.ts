import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../services/api';

export const useAdminData = (adminToken: string | null) => {
    const [systemWorlds, setSystemWorlds] = useState<any[]>([]);
    const [systemEras, setSystemEras] = useState<any[]>([]);
    const [systemCharacters, setSystemCharacters] = useState<any[]>([]);
    const [systemScripts, setSystemScripts] = useState<any[]>([]);
    const [systemMainStories, setSystemMainStories] = useState<any[]>([]);
    const [inviteCodes, setInviteCodes] = useState<any[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
    const [emailVerificationRequired, setEmailVerificationRequired] = useState<boolean>(false);
    const [inviteCodeRequired, setInviteCodeRequired] = useState<boolean>(false);
    const [notionConfig, setNotionConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadSystemData = useCallback(async (token: string) => {
        if (!token) return;

        setLoading(true);
        try {
            const [worlds, eras, characters, scripts, mainStories, codes, plans] = await Promise.all([
                adminApi.worlds.getAll(token).catch(() => []),
                adminApi.eras.getAll(token).catch(() => []),
                adminApi.characters.getAll(token).catch(() => []),
                adminApi.scripts.getAll(token).catch(() => []),
                adminApi.mainStories.getAll(token).catch(() => []),
                adminApi.inviteCodes.getAll(token).catch(() => []),
                adminApi.subscriptionPlans.getAll(token).catch(() => []),
            ]);

            setSystemWorlds(worlds);
            setSystemEras(eras);
            setSystemCharacters(characters);
            setSystemScripts(scripts);
            setSystemMainStories(mainStories);
            setInviteCodes(codes);
            setSubscriptionPlans(plans);
        } catch (error) {
            console.error('加载系统数据失败:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (adminToken) {
            loadSystemData(adminToken);
        }
    }, [adminToken, loadSystemData]);

    // 加载邮箱验证配置
    const loadEmailVerificationConfig = useCallback(async (token: string) => {
        if (!token) return;
        try {
            const data = await adminApi.config.getEmailVerificationRequired(token);
            setEmailVerificationRequired(data.emailVerificationRequired || false);
        } catch (error) {
            console.error('加载邮箱验证配置失败:', error);
            setEmailVerificationRequired(false);
        }
    }, []);

    // 加载邀请码配置
    const loadInviteCodeConfig = useCallback(async (token: string) => {
        if (!token) return;
        try {
            const data = await adminApi.config.getInviteCodeRequired(token);
            setInviteCodeRequired(data.inviteCodeRequired || false);
        } catch (error) {
            console.error('加载邀请码配置失败:', error);
            setInviteCodeRequired(false);
        }
    }, []);

    // 加载 Notion 配置
    const loadNotionConfig = useCallback(async (token: string) => {
        if (!token) return;
        try {
            const data = await adminApi.config.getNotionConfig(token);
            setNotionConfig(data);
        } catch (error) {
            console.error('加载 Notion 配置失败:', error);
            setNotionConfig(null);
        }
    }, []);

    useEffect(() => {
        if (adminToken) {
            loadSystemData(adminToken);
            loadEmailVerificationConfig(adminToken);
            loadInviteCodeConfig(adminToken);
            loadNotionConfig(adminToken);
        }
    }, [adminToken, loadSystemData, loadEmailVerificationConfig, loadInviteCodeConfig, loadNotionConfig]);

    return {
        systemWorlds,
        systemEras,
        systemCharacters,
        systemScripts,
        systemMainStories,
        inviteCodes,
        subscriptionPlans,
        emailVerificationRequired,
        inviteCodeRequired,
        notionConfig,
        loading,
        setSystemWorlds,
        setSystemEras,
        setSystemCharacters,
        setSystemScripts,
        setSystemMainStories,
        setInviteCodes,
        setSubscriptionPlans,
        loadSystemData,
        loadEmailVerificationConfig,
        loadInviteCodeConfig,
        loadNotionConfig,
    };
};

