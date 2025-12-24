package com.heartsphere.payment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 支付开通引导控制器
 * 提供支付宝和微信支付的开通引导信息
 */
@RestController
@RequestMapping("/api/payment/guide")
@CrossOrigin(origins = "*")
public class PaymentGuideController {

    /**
     * 获取支付宝支付开通引导
     */
    @GetMapping("/alipay")
    public ResponseEntity<Map<String, Object>> getAlipayGuide() {
        Map<String, Object> guide = new HashMap<>();
        guide.put("title", "支付宝支付开通指南");
        guide.put("steps", new Object[]{
            Map.of(
                "step", 1,
                "title", "注册支付宝开放平台账号",
                "description", "访问支付宝开放平台（https://open.alipay.com/），使用支付宝账号登录",
                "link", "https://open.alipay.com/"
            ),
            Map.of(
                "step", 2,
                "title", "创建应用",
                "description", "在开放平台中创建新应用，选择应用类型（如：网页&移动应用）",
                "details", new String[]{
                    "填写应用名称、应用图标等信息",
                    "设置应用回调地址",
                    "提交审核"
                }
            ),
            Map.of(
                "step", 3,
                "title", "获取应用信息",
                "description", "应用创建成功后，获取以下信息：",
                "details", new String[]{
                    "AppID：应用的唯一标识",
                    "应用公钥：需要上传到支付宝",
                    "支付宝公钥：支付宝提供的公钥（用于验签）"
                }
            ),
            Map.of(
                "step", 4,
                "title", "生成密钥对",
                "description", "使用支付宝提供的密钥生成工具生成RSA2密钥对",
                "details", new String[]{
                    "下载密钥生成工具：https://opendocs.alipay.com/common/02kkv7",
                    "生成商户私钥和应用公钥",
                    "将应用公钥上传到支付宝开放平台",
                    "获取支付宝公钥"
                }
            ),
            Map.of(
                "step", 5,
                "title", "配置支付参数",
                "description", "在管理系统中配置以下参数：",
                "details", new String[]{
                    "AppID：支付宝应用ID",
                    "商户私钥：RSA2格式的私钥",
                    "支付宝公钥：从开放平台获取的公钥",
                    "网关地址：生产环境使用 https://openapi.alipay.com/gateway.do",
                    "回调地址：https://your-domain.com/api/payment/callback/alipay"
                }
            ),
            Map.of(
                "step", 6,
                "title", "测试支付",
                "description", "使用沙箱环境进行测试，确认支付流程正常",
                "details", new String[]{
                    "在管理系统中启用沙箱模式",
                    "使用沙箱账号进行支付测试",
                    "验证回调通知是否正常"
                }
            )
        });
        guide.put("officialDocs", "https://opendocs.alipay.com/open/270/105899");
        guide.put("support", "如有问题，请联系支付宝客服或查看官方文档");
        
        return ResponseEntity.ok(guide);
    }

    /**
     * 获取微信支付开通引导
     */
    @GetMapping("/wechat")
    public ResponseEntity<Map<String, Object>> getWechatGuide() {
        Map<String, Object> guide = new HashMap<>();
        guide.put("title", "微信支付开通指南");
        guide.put("steps", new Object[]{
            Map.of(
                "step", 1,
                "title", "注册微信支付商户号",
                "description", "访问微信支付商户平台（https://pay.weixin.qq.com/），注册并申请商户号",
                "link", "https://pay.weixin.qq.com/",
                "details", new String[]{
                    "使用微信账号登录",
                    "选择注册类型（企业/个体工商户/个人）",
                    "填写相关信息并提交审核",
                    "等待审核通过（通常1-3个工作日）"
                }
            ),
            Map.of(
                "step", 2,
                "title", "获取商户号信息",
                "description", "审核通过后，在商户平台获取以下信息：",
                "details", new String[]{
                    "商户号（MchId）：10位数字",
                    "AppID：关联的公众号或小程序的AppID",
                    "API密钥（v2）：用于v2接口签名（如果使用）",
                    "API v3密钥：用于v3接口签名"
                }
            ),
            Map.of(
                "step", 3,
                "title", "申请API证书",
                "description", "在商户平台申请API证书，用于API v3接口调用",
                "details", new String[]{
                    "登录商户平台，进入【账户中心】->【API安全】",
                    "点击【申请证书】，下载证书工具",
                    "使用证书工具生成证书请求串",
                    "上传证书请求串，获取证书文件",
                    "记录证书序列号"
                }
            ),
            Map.of(
                "step", 4,
                "title", "配置支付产品",
                "description", "在商户平台配置支付产品（如：Native支付）",
                "details", new String[]{
                    "进入【产品中心】",
                    "开通【Native支付】产品",
                    "设置支付回调地址：https://your-domain.com/api/payment/callback/wechat"
                }
            ),
            Map.of(
                "step", 5,
                "title", "配置支付参数",
                "description", "在管理系统中配置以下参数：",
                "details", new String[]{
                    "AppID：关联的公众号或小程序AppID",
                    "商户号（MchId）：10位数字",
                    "API v3密钥：32位字符串",
                    "商户私钥：从证书文件中提取的私钥",
                    "证书序列号：证书的序列号",
                    "回调地址：https://your-domain.com/api/payment/callback/wechat"
                }
            ),
            Map.of(
                "step", 6,
                "title", "测试支付",
                "description", "使用微信支付沙箱环境进行测试",
                "details", new String[]{
                    "在商户平台申请沙箱环境",
                    "获取沙箱密钥和证书",
                    "使用沙箱参数进行支付测试",
                    "验证回调通知是否正常"
                }
            )
        });
        guide.put("officialDocs", "https://pay.weixin.qq.com/docs/merchant/");
        guide.put("apiDocs", "https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml");
        guide.put("support", "如有问题，请联系微信支付客服或查看官方文档");
        
        return ResponseEntity.ok(guide);
    }

    /**
     * 获取所有支付方式的开通引导
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllGuides() {
        Map<String, Object> response = new HashMap<>();
        response.put("alipay", getAlipayGuide().getBody());
        response.put("wechat", getWechatGuide().getBody());
        return ResponseEntity.ok(response);
    }
}

