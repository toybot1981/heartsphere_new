import React, { useState, useEffect } from 'react';
import { membershipApi, paymentApi } from '../services/api';
import { SubscriptionPlan, PaymentOrder } from '../types';
import './MembershipModal.css';
import { showAlert } from '../utils/dialog';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  currentMembership?: {
    planType: string;
    billingCycle: string;
    status: string;
    endDate: string | null;
    autoRenew: boolean;
    nextRenewalDate: string | null;
    currentPoints: number;
  };
}

export const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  token,
  currentMembership,
}) => {
  const [activeTab, setActiveTab] = useState<'continuous_yearly' | 'continuous_monthly' | 'monthly'>('continuous_yearly');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen, activeTab]);

  const loadPlans = async () => {
    try {
      const data = await membershipApi.getPlans(activeTab, token);
      setPlans(data);
    } catch (error) {
      console.error('加载订阅计划失败:', error);
    }
  };

  const handlePurchase = async (plan: SubscriptionPlan) => {
    if (!token) {
      showAlert('请先登录', '提示', 'warning');
      return;
    }
    
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setLoading(true);

    try {
      console.log('创建支付订单，planId:', plan.id, 'paymentType:', paymentType, 'token存在:', !!token);
      const order = await paymentApi.createOrder(plan.id, paymentType, token);
      setPaymentOrder(order);
    } catch (error) {
      console.error('创建支付订单失败:', error);
      showAlert('创建支付订单失败，请重试。如果问题持续，请检查是否已登录。', '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentTypeChange = async (type: 'wechat' | 'alipay') => {
    if (!selectedPlan) return;
    
    setPaymentType(type);
    setLoading(true);

    try {
      const order = await paymentApi.createOrder(selectedPlan.id, type, token);
      setPaymentOrder(order);
    } catch (error) {
      console.error('创建支付订单失败:', error);
      showAlert('创建支付订单失败，请重试', '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkOrderStatus = async () => {
    if (!paymentOrder) return;

    try {
      const order = await paymentApi.getOrder(paymentOrder.orderNo, token);
      if (order.status === 'paid') {
        showAlert('支付成功！会员已激活', '支付成功', 'success');
        setShowPaymentModal(false);
        onClose();
        window.location.reload();
      } else {
        setPaymentOrder(order);
      }
    } catch (error) {
      console.error('查询订单状态失败:', error);
    }
  };

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseFeatures = (featuresStr: string): string[] => {
    try {
      return JSON.parse(featuresStr);
    } catch {
      return [];
    }
  };

  return (
    <>
      <div className="membership-modal-overlay" onClick={onClose}>
        <div className="membership-modal" onClick={(e) => e.stopPropagation()}>
          <div className="membership-modal-header">
            <h2>订阅计划</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          {/* 当前会员状态 */}
          {currentMembership && (
            <div className="current-membership-card">
              <div className="membership-info">
                <div><strong>计划:</strong> {currentMembership.planType === 'free' ? '免费' : 
                  currentMembership.planType === 'basic' ? '基础会员' :
                  currentMembership.planType === 'standard' ? '标准会员' : '高级会员'}</div>
                <div><strong>状态:</strong> {currentMembership.status === 'active' ? '已激活' : '已过期'}</div>
                {currentMembership.autoRenew && (
                  <div><strong>续费时间:</strong> {formatDate(currentMembership.nextRenewalDate || null)}</div>
                )}
                {currentMembership.endDate && (
                  <div><strong>到期时间:</strong> {formatDate(currentMembership.endDate)}</div>
                )}
                <div><strong>剩余积分:</strong> {currentMembership.currentPoints}</div>
              </div>
            </div>
          )}

          {/* 标签页 */}
          <div className="membership-tabs">
            <button
              className={activeTab === 'continuous_yearly' ? 'active' : ''}
              onClick={() => setActiveTab('continuous_yearly')}
            >
              连续包年 节省30%
            </button>
            <button
              className={activeTab === 'continuous_monthly' ? 'active' : ''}
              onClick={() => setActiveTab('continuous_monthly')}
            >
              连续包月 节省12%
            </button>
            <button
              className={activeTab === 'monthly' ? 'active' : ''}
              onClick={() => setActiveTab('monthly')}
            >
              单月购买
            </button>
          </div>

          {/* 计划列表 */}
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className={`plan-card ${plan.type === 'premium' ? 'premium' : ''}`}>
                {plan.type === 'premium' && <div className="best-value-badge">最划算</div>}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <div className="price-main">
                      {formatPrice(plan.price)}
                      {plan.billingCycle === 'continuous_yearly' || plan.billingCycle === 'yearly' ? ' 每年' : ' 每月'}
                    </div>
                    {plan.billingCycle === 'continuous_yearly' || plan.billingCycle === 'yearly' ? (
                      <div className="price-monthly">
                        每月¥{(Number(plan.price) / 12).toFixed(2)} · ¥{(Number(plan.price) / plan.pointsPerMonth * 100).toFixed(2)}/100 积分
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="plan-features">
                  <div className="feature-points">
                    <span className="diamond-icon">💎</span>
                    {plan.pointsPerMonth.toLocaleString()} 积分每月
                  </div>
                  {plan.maxImagesPerMonth && (
                    <div>最多生成{plan.maxImagesPerMonth.toLocaleString()}张图片{plan.maxVideosPerMonth ? ` ${plan.maxVideosPerMonth}个视频` : ''}</div>
                  )}
                  {parseFeatures(plan.features).map((feature, idx) => (
                    <div key={idx}>✓ {feature}</div>
                  ))}
                </div>
                <button
                  className={`plan-button ${plan.type === 'premium' ? 'premium' : ''}`}
                  onClick={() => handlePurchase(plan)}
                >
                  {plan.type === 'basic' && currentMembership?.planType === 'basic' ? '订阅管理' : 
                   `订阅${plan.billingCycle === 'continuous_yearly' || plan.billingCycle === 'yearly' ? '包年' : '包月'}${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 支付弹窗 */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          paymentOrder={paymentOrder}
          paymentType={paymentType}
          onPaymentTypeChange={handlePaymentTypeChange}
          onCheckStatus={checkOrderStatus}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentOrder(null);
          }}
        />
      )}
    </>
  );
};

// 支付弹窗组件
interface PaymentModalProps {
  plan: SubscriptionPlan;
  paymentOrder: PaymentOrder | null;
  paymentType: 'wechat' | 'alipay';
  onPaymentTypeChange: (type: 'wechat' | 'alipay') => void;
  onCheckStatus: () => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  plan,
  paymentOrder,
  paymentType,
  onPaymentTypeChange,
  onCheckStatus,
  onClose,
}) => {
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (paymentOrder && paymentOrder.status === 'pending') {
      setPolling(true);
      const interval = setInterval(() => {
        onCheckStatus();
      }, 3000); // 每3秒查询一次

      return () => clearInterval(interval);
    } else {
      setPolling(false);
    }
  }, [paymentOrder]);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>扫码支付 {formatPrice(plan.price)} 元</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-content">
          <div className="payment-info">
            <div className="membership-preview">
              <div className="preview-label">高级会员</div>
              <div className="preview-price">¥{formatPrice(plan.price)} / 单月</div>
            </div>
          </div>

          {paymentOrder && paymentOrder.qrCodeUrl ? (
            <div className="qr-code-section">
              <div className="qr-code-placeholder">
                <div className="qr-code-text">支付前请阅读</div>
                <div className="agreement-text">《"即梦"付费服务协议(含自动续费条款)》</div>
              </div>
              <button className="agree-pay-button" onClick={onCheckStatus}>
                同意并支付
              </button>
              <div className="payment-hint">
                请扫码完成支付
                <span className="payment-icons">
                  {paymentType === 'wechat' ? '💚' : '💙'} {paymentType === 'wechat' ? '微信' : '支付宝'}
                </span>
              </div>
            </div>
          ) : (
            <div className="payment-loading">正在生成支付二维码...</div>
          )}

          <div className="payment-type-selector">
            <button
              className={paymentType === 'wechat' ? 'active' : ''}
              onClick={() => onPaymentTypeChange('wechat')}
            >
              微信支付
            </button>
            <button
              className={paymentType === 'alipay' ? 'active' : ''}
              onClick={() => onPaymentTypeChange('alipay')}
            >
              支付宝
            </button>
          </div>

          <div className="agreement-footer">
            《"即梦"付费服务协议(含自动续费条款)》
          </div>
        </div>
      </div>
    </div>
  );
};

