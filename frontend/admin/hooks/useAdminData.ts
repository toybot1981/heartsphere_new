import { useState } from 'react';
import { adminApi } from '../../services/api';

export const useAdminData = (checkAndHandleTokenError?: (error: any) => boolean) => {
    // 系统数据状态
    const [systemWorlds, setSystemWorlds] = useState<any[]>([]);
    const [systemEras, setSystemEras] = useState<any[]>([]);
    const [systemCharacters, setSystemCharacters] = useState<any[]>([]);
    const [systemScripts, setSystemScripts] = useState<any[]>([]);
    const [systemMainStories, setSystemMainStories] = useState<any[]>([]);
    const [inviteCodes, setInviteCodes] = useState<any[]>([]);
    const [inviteCodeRequired, setInviteCodeRequired] = useState(false);
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);

    const loadSystemData = async (token: string) => {
        console.log("========== [useAdminData] 加载系统数据 ==========");
        console.log("[useAdminData] Token存在:", !!token);
        try {
            console.log("[useAdminData] 开始并行加载系统数据...");
            
            // 分别加载数据，允许部分失败
            const results = await Promise.allSettled([
                adminApi.worlds.getAll(token),
                adminApi.eras.getAll(token),
                adminApi.characters.getAll(token),
                adminApi.inviteCodes.getAll(token),
                adminApi.config.getInviteCodeRequired(token),
                adminApi.subscriptionPlans.getAll(token),
                adminApi.scripts.getAll(token),
                adminApi.mainStories.getAll(token)
            ]);
            
            const worlds = results[0].status === 'fulfilled' ? results[0].value : [];
            const eras = results[1].status === 'fulfilled' ? results[1].value : [];
            const characters = results[2].status === 'fulfilled' ? results[2].value : [];
            const codes = results[3].status === 'fulfilled' ? results[3].value : [];
            const config = results[4].status === 'fulfilled' ? results[4].value : { inviteCodeRequired: false };
            const plans = results[5].status === 'fulfilled' ? results[5].value : [];
            const scripts = results[6].status === 'fulfilled' ? results[6].value : [];
            const mainStories = results[7].status === 'fulfilled' ? results[7].value : [];
            
            console.log("[useAdminData] 数据加载结果:", {
                worlds: Array.isArray(worlds) ? worlds.length : 0,
                eras: Array.isArray(eras) ? eras.length : 0,
                characters: Array.isArray(characters) ? characters.length : 0,
                scripts: Array.isArray(scripts) ? scripts.length : 0,
                inviteCodes: Array.isArray(codes) ? codes.length : 0,
                plans: Array.isArray(plans) ? plans.length : 0,
                config: config
            });
            console.log("[useAdminData] 邀请码数据详情:", codes);
            console.log("[useAdminData] 邀请码数据类型:", typeof codes, Array.isArray(codes));
            
            // 确保 codes 是数组
            const inviteCodesArray = Array.isArray(codes) ? codes : (codes ? [codes] : []);
            console.log("[useAdminData] 处理后的邀请码数组:", inviteCodesArray);
            
            setSystemWorlds(Array.isArray(worlds) ? worlds : []);
            setSystemEras(Array.isArray(eras) ? eras : []);
            setSystemCharacters(Array.isArray(characters) ? characters : []);
            setSystemScripts(Array.isArray(scripts) ? scripts : []);
            setSystemMainStories(Array.isArray(mainStories) ? mainStories : []);
            setInviteCodes(inviteCodesArray);
            setInviteCodeRequired(config.inviteCodeRequired || false);
            setSubscriptionPlans(Array.isArray(plans) ? plans : []);
            
            console.log("[useAdminData] 系统数据状态已更新，邀请码数量:", inviteCodesArray.length);
        } catch (error: any) {
            console.error('[useAdminData] 加载系统数据失败:', error);
            console.error('[useAdminData] 错误详情:', error);
            
            // 检查是否是 token 验证失败
            if (checkAndHandleTokenError && checkAndHandleTokenError(error)) {
                return;
            }
            
            // 即使加载失败，也显示界面，只是数据为空
            setSystemWorlds([]);
            setSystemEras([]);
            setSystemCharacters([]);
            setSystemScripts([]);
            setInviteCodes([]);
            setSubscriptionPlans([]);
        }
    };

    return {
        systemWorlds,
        setSystemWorlds,
        systemEras,
        setSystemEras,
        systemCharacters,
        setSystemCharacters,
        systemScripts,
        setSystemScripts,
        systemMainStories,
        setSystemMainStories,
        inviteCodes,
        setInviteCodes,
        inviteCodeRequired,
        setInviteCodeRequired,
        subscriptionPlans,
        setSubscriptionPlans,
        loadSystemData
    };
};


