import React, { useState, useEffect } from 'react';
import { membershipApi, paymentApi } from '../../services/api';
import type { SubscriptionPlan, UpgradePrice, UpgradeResult } from '../../services/api/membership/types';
import { showAlert } from '../../utils/dialog';
import './UpgradeModal.css';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  currentPlanType: string;
  currentPlanId?: number;
  onSuccess?: () => void;
}

/**
 * 升级引导组件
 * 展示升级前后对比，处理升级流程
 */
export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  token,
  currentPlanType,
  currentPlanId,
  onSuccess,
}) => {
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [upgradePrice, setUpgradePrice] = useState<UpgradePrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<'wechat' | 'alipay'>('wechat');

  useEffect(() => {
    if (isOpen) {
      loadAvailablePlans();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPlan) {
      loadUpgradePrice();
    }
  }, [selectedPlan, token]);

  const loadAvailablePlans = async () => {
    try {
      const plans = await membershipApi.getPlans(undefined, token);
      // 只显示比当前计划层级更高的计划
      const currentLevel = getPlanLevel(currentPlanType);
      const higherPlans = plans.filter(
        (plan) => getPlanLevel(plan.type) > currentLevel
      );
      setAvailablePlans(higherPlans);
      
      // 默认选择第一个可用计划
      if (higherPlans.length > 0) {
        setSelectedPlan(higherPlans[0]);
      }
    } catch (error) {
      console.error('加载可用计划失败:', error);
      showAlert('加载计划失败，请稍后重试', '错误', 'error');
    }
  };

  const loadUpgradePrice = async () => {
    if (!selectedPlan) return;
    
    try {
      setLoadingPrice(true);
      const price = await membershipApi.getUpgradePrice(selectedPlan.id, token);
      setUpgradePrice(price);
    } catch (error) {
      console.error('加载升级价格失败:', error);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      
      // 执行升级
      const result: UpgradeResult = await membershipApi.upgrade(selectedPlan.id, token);
      
      if (result.success) {
        // 如果需要支付，创建支付订单
        if (result.actualPaymentAmount > 0) {
          setShowPaymentModal(true);
          const order = await paymentApi.createOrder(selectedPlan.id, paymentType, token);
          setPaymentOrder(order);
        } else {
          // 免费升级，直接成功
          showAlert('升级成功！', '成功', 'success');
          onSuccess?.();
          onClose();
          window.location.reload();
        }
      } else {
        showAlert(result.errorMessage || '升级失败', '错误', 'error');
      }
    } catch (error) {
      console.error('升级失败:', error);
      showAlert('升级失败，请稍后重试', '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkOrderStatus = async () => {
    if (!paymentOrder) return;

    try {
      const order = await paymentApi.getOrder(paymentOrder.orderNo, token);
      if (order.status === 'paid') {
        showAlert('支付成功！会员已升级', '支付成功', 'success');
        setShowPaymentModal(false);
        onSuccess?.();
        onClose();
        window.location.reload();
      } else {
        setPaymentOrder(order);
      }
    } catch (error) {
      console.error('查询订单状态失败:', error);
    }
  };

  const getPlanLevel = (planType: string): number => {
    const levels: Record<string, number> = {
      free: 0,
      basic: 1,
      standard: 2,
      premium: 3,
    };
    return levels[planType] || 0;
  };

  const getPlanTypeName = (planType: string): string => {
    const names: Record<string, string> = {
      free: '免费版',
      basic: '基础版',
      standard: '标准版',
      premium: '专业版',
    };
    return names[planType] || planType;
  };

  const parseFeatures = (featuresStr: string): string[] => {
    try {
      return JSON.parse(featuresStr);
    } catch {
      return [];
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="upgrade-modal-overlay" onClick={onClose}>
        <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
          <div className="upgrade-modal-header">
            <h2>升级会员</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="upgrade-content">
            {/* 当前计划 */}
            <div className="current-plan-section">
              <h3>当前计划</h3>
              <div className="plan-card current">
                <div className="plan-name">{getPlanTypeName(currentPlanType)}</div>
              </div>
            </div>

            {/* 可用升级计划 */}
            <div className="available-plans-section">
              <h3>选择升级计划</h3>
              <div className="plans-grid">
                {availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${plan.type === 'premium' ? 'premium' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {plan.type === 'premium' && (
                      <div className="best-value-badge">推荐</div>
                    )}
                    <div className="plan-header">
                      <div className="plan-name">{plan.name}</div>
                      <div className="plan-price">
                        ¥{plan.price.toFixed(2)} / 月
                      </div>
                    </div>
                    <div className="plan-features">
                      <div className="feature-item">
                        💎 {plan.pointsPerMonth.toLocaleString()} 积分/月
                      </div>
                      {plan.maxImagesPerMonth && (
                        <div className="feature-item">
                          🖼️ {plan.maxImagesPerMonth.toLocaleString()} 张图片/月
                        </div>
                      )}
                      {parseFeatures(plan.features).map((feature, idx) => (
                        <div key={idx} className="feature-item">
                          ✓ {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 升级价格信息 */}
            {selectedPlan && upgradePrice && (
              <div className="upgrade-price-section">
                <h3>升级价格</h3>
                <div className="price-breakdown">
                  <div className="price-item">
                    <span>目标计划价格</span>
                    <span>¥{upgradePrice.targetPlanPrice.toFixed(2)}</span>
                  </div>
                  {upgradePrice.proRatedAmount > 0 && (
                    <div className="price-item">
                      <span>当前计划剩余价值</span>
                      <span>-¥{upgradePrice.proRatedAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="price-item total">
                    <span>需支付金额</span>
                    <span>¥{upgradePrice.actualPaymentAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="upgrade-actions">
              <button className="cancel-btn" onClick={onClose}>
                取消
              </button>
              <button
                className="upgrade-btn"
                onClick={handleUpgrade}
                disabled={!selectedPlan || loading || loadingPrice}
              >
                {loading ? '处理中...' : loadingPrice ? '计算价格中...' : '确认升级'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 支付弹窗 */}
      {showPaymentModal && paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          paymentType={paymentType}
          onPaymentTypeChange={setPaymentType}
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

interface PaymentModalProps {
  order: any;
  paymentType: 'wechat' | 'alipay';
  onPaymentTypeChange: (type: 'wechat' | 'alipay') => void;
  onCheckStatus: () => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  paymentType,
  onPaymentTypeChange,
  onCheckStatus,
  onClose,
}) => {
  useEffect(() => {
    if (order && order.status === 'pending') {
      const interval = setInterval(() => {
        onCheckStatus();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order, onCheckStatus]);

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>扫码支付</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-content">
          {order.qrCodeUrl ? (
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
        </div>
      </div>
    </div>
  );
};
