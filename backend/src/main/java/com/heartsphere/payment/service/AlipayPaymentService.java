package com.heartsphere.payment.service;

import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.api.domain.AlipayTradePagePayModel;
import com.alipay.api.domain.AlipayTradePrecreateModel;
import com.alipay.api.request.AlipayTradePagePayRequest;
import com.alipay.api.request.AlipayTradePrecreateRequest;
import com.alipay.api.request.AlipayTradeQueryRequest;
import com.alipay.api.response.AlipayTradePagePayResponse;
import com.alipay.api.response.AlipayTradePrecreateResponse;
import com.alipay.api.response.AlipayTradeQueryResponse;
import com.heartsphere.payment.entity.PaymentConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 支付宝支付服务
 */
@Slf4j
@Service
public class AlipayPaymentService {

    /**
     * 创建支付宝客户端
     */
    private AlipayClient createAlipayClient(PaymentConfig config) {
        return new DefaultAlipayClient(
                config.getGatewayUrl(),
                config.getAppId(),
                config.getMerchantPrivateKey(),
                config.getFormat(),
                config.getCharset(),
                config.getAlipayPublicKey(),
                config.getSignType()
        );
    }

    /**
     * 创建PC网站支付订单（返回支付表单HTML）
     */
    public String createPagePay(PaymentConfig config, String orderNo, BigDecimal amount, String subject, String body) {
        try {
            AlipayClient alipayClient = createAlipayClient(config);
            AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
            
            // 设置异步通知地址
            request.setNotifyUrl(config.getNotifyUrl());
            // 设置同步跳转地址
            request.setReturnUrl(config.getReturnUrl());

            AlipayTradePagePayModel model = new AlipayTradePagePayModel();
            model.setOutTradeNo(orderNo);
            model.setTotalAmount(amount.setScale(2, RoundingMode.HALF_UP).toString());
            model.setSubject(subject);
            model.setBody(body);
            model.setProductCode("FAST_INSTANT_TRADE_PAY"); // 固定值

            request.setBizModel(model);

            AlipayTradePagePayResponse response = alipayClient.pageExecute(request);
            if (response.isSuccess()) {
                log.info("创建支付宝PC支付订单成功: orderNo={}", orderNo);
                return response.getBody();
            } else {
                log.error("创建支付宝PC支付订单失败: orderNo={}, error={}", orderNo, response.getSubMsg());
                throw new RuntimeException("创建支付订单失败: " + response.getSubMsg());
            }
        } catch (AlipayApiException e) {
            log.error("创建支付宝PC支付订单异常: orderNo={}", orderNo, e);
            throw new RuntimeException("创建支付订单异常: " + e.getMessage(), e);
        }
    }

    /**
     * 创建手机网站支付订单（返回支付URL）
     */
    public String createWapPay(PaymentConfig config, String orderNo, BigDecimal amount, String subject, String body) {
        try {
            AlipayClient alipayClient = createAlipayClient(config);
            AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();
            
            request.setNotifyUrl(config.getNotifyUrl());
            request.setReturnUrl(config.getReturnUrl());

            AlipayTradePagePayModel model = new AlipayTradePagePayModel();
            model.setOutTradeNo(orderNo);
            model.setTotalAmount(amount.setScale(2, RoundingMode.HALF_UP).toString());
            model.setSubject(subject);
            model.setBody(body);
            model.setProductCode("QUICK_WAP_WAY"); // 手机网站支付

            request.setBizModel(model);

            AlipayTradePagePayResponse response = alipayClient.pageExecute(request);
            if (response.isSuccess()) {
                log.info("创建支付宝手机支付订单成功: orderNo={}", orderNo);
                return response.getBody();
            } else {
                log.error("创建支付宝手机支付订单失败: orderNo={}, error={}", orderNo, response.getSubMsg());
                throw new RuntimeException("创建支付订单失败: " + response.getSubMsg());
            }
        } catch (AlipayApiException e) {
            log.error("创建支付宝手机支付订单异常: orderNo={}", orderNo, e);
            throw new RuntimeException("创建支付订单异常: " + e.getMessage(), e);
        }
    }

    /**
     * 创建扫码支付订单（返回二维码URL）
     */
    public String createQrCodePay(PaymentConfig config, String orderNo, BigDecimal amount, String subject, String body) {
        try {
            AlipayClient alipayClient = createAlipayClient(config);
            AlipayTradePrecreateRequest request = new AlipayTradePrecreateRequest();
            
            request.setNotifyUrl(config.getNotifyUrl());

            AlipayTradePrecreateModel model = new AlipayTradePrecreateModel();
            model.setOutTradeNo(orderNo);
            model.setTotalAmount(amount.setScale(2, RoundingMode.HALF_UP).toString());
            model.setSubject(subject);
            model.setBody(body);

            request.setBizModel(model);

            AlipayTradePrecreateResponse response = alipayClient.execute(request);
            if (response.isSuccess()) {
                String qrCode = response.getQrCode();
                log.info("创建支付宝扫码支付订单成功: orderNo={}, qrCode={}", orderNo, qrCode);
                return qrCode;
            } else {
                log.error("创建支付宝扫码支付订单失败: orderNo={}, error={}", orderNo, response.getSubMsg());
                throw new RuntimeException("创建支付订单失败: " + response.getSubMsg());
            }
        } catch (AlipayApiException e) {
            log.error("创建支付宝扫码支付订单异常: orderNo={}", orderNo, e);
            throw new RuntimeException("创建支付订单异常: " + e.getMessage(), e);
        }
    }

    /**
     * 查询订单状态
     */
    public AlipayTradeQueryResponse queryOrder(PaymentConfig config, String orderNo) {
        try {
            AlipayClient alipayClient = createAlipayClient(config);
            AlipayTradeQueryRequest request = new AlipayTradeQueryRequest();

            com.alipay.api.domain.AlipayTradeQueryModel model = new com.alipay.api.domain.AlipayTradeQueryModel();
            model.setOutTradeNo(orderNo);
            request.setBizModel(model);

            AlipayTradeQueryResponse response = alipayClient.execute(request);
            if (response.isSuccess()) {
                log.info("查询支付宝订单成功: orderNo={}, tradeStatus={}", orderNo, response.getTradeStatus());
                return response;
            } else {
                log.error("查询支付宝订单失败: orderNo={}, error={}", orderNo, response.getSubMsg());
                throw new RuntimeException("查询订单失败: " + response.getSubMsg());
            }
        } catch (AlipayApiException e) {
            log.error("查询支付宝订单异常: orderNo={}", orderNo, e);
            throw new RuntimeException("查询订单异常: " + e.getMessage(), e);
        }
    }

    /**
     * 验证回调签名
     */
    public boolean verifyCallback(PaymentConfig config, java.util.Map<String, String> params) {
        try {
            com.alipay.api.internal.util.AlipaySignature.rsaCheckV1(
                    params,
                    config.getAlipayPublicKey(),
                    config.getCharset(),
                    config.getSignType()
            );
            return true;
        } catch (AlipayApiException e) {
            log.error("验证支付宝回调签名失败", e);
            return false;
        }
    }
}

