import { useState } from 'react';
import { adminApi } from '../../services/api';

export const useAdminConfig = () => {
    // 邮箱验证配置
    const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);
    
    // 邮箱配置状态
    const [emailConfig, setEmailConfig] = useState({
        emailType: '163' as 'qq' | '163',
        host: 'smtp.163.com',
        port: '25',
        username: 'tongyexin@163.com',
        password: '',
        from: 'tongyexin@163.com'
    });
    const [isLoadingEmailConfig, setIsLoadingEmailConfig] = useState(false);
    const [showAuthCodeGuide, setShowAuthCodeGuide] = useState(false);
    
    // Notion 配置状态
    const [notionConfig, setNotionConfig] = useState({
        clientId: '',
        clientSecret: '',
        redirectUri: 'http://localhost:8081/api/notes/notion/callback',
        syncButtonEnabled: false
    });
    const [isLoadingNotionConfig, setIsLoadingNotionConfig] = useState(false);
    
    // 微信配置状态
    const [wechatConfig, setWechatConfig] = useState({
        appId: '',
        appSecret: '',
        redirectUri: 'http://localhost:8081/api/wechat/callback'
    });
    const [isLoadingWechatConfig, setIsLoadingWechatConfig] = useState(false);
    
    // 微信支付配置状态
    const [wechatPayConfig, setWechatPayConfig] = useState({
        appId: '',
        mchId: '',
        apiKey: '',
        apiV3Key: '',
        certPath: '',
        notifyUrl: ''
    });
    const [isLoadingWechatPayConfig, setIsLoadingWechatPayConfig] = useState(false);
    
    // 支付宝配置状态
    const [alipayConfig, setAlipayConfig] = useState({
        appId: '',
        privateKey: '',
        publicKey: '',
        gatewayUrl: 'https://openapi.alipay.com/gateway.do',
        notifyUrl: '',
        returnUrl: ''
    });
    const [isLoadingAlipayConfig, setIsLoadingAlipayConfig] = useState(false);

    const loadConfigData = async (token: string) => {
        console.log("========== [useAdminConfig] 加载配置数据 ==========");
        try {
            const results = await Promise.allSettled([
                adminApi.config.getEmailConfig(token).catch(() => null),
                adminApi.config.getEmailVerificationRequired(token).catch(() => null),
                adminApi.config.getNotionConfig(token).catch(() => null),
                adminApi.config.getWechatConfig(token).catch(() => null),
                adminApi.config.getWechatPayConfig(token).catch(() => null),
                adminApi.config.getAlipayConfig(token).catch(() => null)
            ]);
            
            const emailConfigData = results[0].status === 'fulfilled' && results[0].value ? results[0].value : null;
            const emailVerificationConfig = results[1].status === 'fulfilled' && results[1].value ? results[1].value : null;
            const notionConfigData = results[2].status === 'fulfilled' && results[2].value ? results[2].value : null;
            const wechatConfigData = results[3].status === 'fulfilled' && results[3].value ? results[3].value : null;
            const wechatPayConfigData = results[4].status === 'fulfilled' && results[4].value ? results[4].value : null;
            const alipayConfigData = results[5].status === 'fulfilled' && results[5].value ? results[5].value : null;
            
            console.log("[useAdminConfig] 邮箱验证配置加载结果:", {
                emailVerificationConfig,
                hasValue: !!emailVerificationConfig,
                emailVerificationRequired: emailVerificationConfig?.emailVerificationRequired
            });
            
            // 更新邮箱验证配置
            if (emailVerificationConfig) {
                const required = emailVerificationConfig.emailVerificationRequired;
                if (required !== undefined && required !== null) {
                    console.log("[useAdminConfig] 设置邮箱验证状态:", required);
                    setEmailVerificationRequired(Boolean(required));
                } else {
                    console.warn("[useAdminConfig] 邮箱验证配置存在但 emailVerificationRequired 字段无效:", emailVerificationConfig);
                }
            } else {
                console.warn("[useAdminConfig] 邮箱验证配置未加载，使用默认值: true");
            }
            
            // 更新邮箱配置
            if (emailConfigData) {
                const emailType = emailConfigData.host?.includes('qq.com') ? 'qq' : '163';
                setEmailConfig({
                    emailType: emailType,
                    host: emailConfigData.host || 'smtp.163.com',
                    port: emailConfigData.port || (emailType === 'qq' ? '587' : '25'),
                    username: emailConfigData.username || (emailType === 'qq' ? 'heartsphere@qq.com' : 'tongyexin@163.com'),
                    password: emailConfigData.password || '',
                    from: emailConfigData.from || (emailType === 'qq' ? 'heartsphere@qq.com' : 'tongyexin@163.com')
                });
            }
            
            // 更新 Notion 配置
            if (notionConfigData) {
                console.log("[useAdminConfig] 加载 Notion 配置:", notionConfigData);
                setNotionConfig({
                    clientId: notionConfigData.clientId || '',
                    clientSecret: notionConfigData.clientSecret || '',
                    redirectUri: notionConfigData.redirectUri || 'http://localhost:8081/api/notes/notion/callback',
                    syncButtonEnabled: notionConfigData.syncButtonEnabled !== undefined ? notionConfigData.syncButtonEnabled : false
                });
            } else {
                console.log("[useAdminConfig] 未加载到 Notion 配置，使用默认值");
            }
            
            // 更新微信配置
            if (wechatConfigData) {
                console.log("[useAdminConfig] 加载微信配置:", wechatConfigData);
                setWechatConfig({
                    appId: wechatConfigData.appId || '',
                    appSecret: wechatConfigData.appSecret === '******' ? '' : (wechatConfigData.appSecret || ''),
                    redirectUri: wechatConfigData.redirectUri || 'http://localhost:8081/api/wechat/callback'
                });
            }
            
            // 更新微信支付配置
            if (wechatPayConfigData) {
                console.log("[useAdminConfig] 加载微信支付配置:", wechatPayConfigData);
                setWechatPayConfig({
                    appId: wechatPayConfigData.appId || '',
                    mchId: wechatPayConfigData.mchId || '',
                    apiKey: wechatPayConfigData.apiKey === '******' ? '' : (wechatPayConfigData.apiKey || ''),
                    apiV3Key: wechatPayConfigData.apiV3Key === '******' ? '' : (wechatPayConfigData.apiV3Key || ''),
                    certPath: wechatPayConfigData.certPath || '',
                    notifyUrl: wechatPayConfigData.notifyUrl || ''
                });
            }
            
            // 更新支付宝配置
            if (alipayConfigData) {
                console.log("[useAdminConfig] 加载支付宝配置:", alipayConfigData);
                setAlipayConfig({
                    appId: alipayConfigData.appId || '',
                    privateKey: alipayConfigData.privateKey === '******' ? '' : (alipayConfigData.privateKey || ''),
                    publicKey: alipayConfigData.publicKey || '',
                    gatewayUrl: alipayConfigData.gatewayUrl || 'https://openapi.alipay.com/gateway.do',
                    notifyUrl: alipayConfigData.notifyUrl || '',
                    returnUrl: alipayConfigData.returnUrl || ''
                });
            }
        } catch (error: any) {
            console.error('[useAdminConfig] 加载配置数据失败:', error);
        }
    };

    return {
        // 邮箱验证
        emailVerificationRequired,
        setEmailVerificationRequired,
        
        // 邮箱配置
        emailConfig,
        setEmailConfig,
        isLoadingEmailConfig,
        setIsLoadingEmailConfig,
        showAuthCodeGuide,
        setShowAuthCodeGuide,
        
        // Notion 配置
        notionConfig,
        setNotionConfig,
        isLoadingNotionConfig,
        setIsLoadingNotionConfig,
        
        // 微信配置
        wechatConfig,
        setWechatConfig,
        isLoadingWechatConfig,
        setIsLoadingWechatConfig,
        
        // 微信支付配置
        wechatPayConfig,
        setWechatPayConfig,
        isLoadingWechatPayConfig,
        setIsLoadingWechatPayConfig,
        
        // 支付宝配置
        alipayConfig,
        setAlipayConfig,
        isLoadingAlipayConfig,
        setIsLoadingAlipayConfig,
        
        // 加载函数
        loadConfigData
    };
};


