import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/api';

export const useAdminData = (adminToken: string | null) => {
    const [systemWorlds, setSystemWorlds] = useState<any[]>([]);
    const [systemEras, setSystemEras] = useState<any[]>([]);
    const [systemCharacters, setSystemCharacters] = useState<any[]>([]);
    const [systemScripts, setSystemScripts] = useState<any[]>([]);
    const [systemMainStories, setSystemMainStories] = useState<any[]>([]);
    const [inviteCodes, setInviteCodes] = useState<any[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
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

    return {
        systemWorlds,
        systemEras,
        systemCharacters,
        systemScripts,
        systemMainStories,
        inviteCodes,
        subscriptionPlans,
        loading,
        setSystemWorlds,
        setSystemEras,
        setSystemCharacters,
        setSystemScripts,
        setSystemMainStories,
        setInviteCodes,
        setSubscriptionPlans,
        loadSystemData,
    };
};

