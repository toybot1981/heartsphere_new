// 支付API类型定义

/**
 * 支付类型
 */
export type PaymentType = 'wechat' | 'alipay';

/**
 * 支付订单状态
 */
export type PaymentOrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

/**
 * 创建支付订单响应
 */
export interface CreatePaymentOrderResponse {
  orderNo: string;
  amount: number;
  paymentType: string;
  status: string;
  qrCodeUrl: string | null;
  paymentUrl: string | null;
  expiresAt: string;
}

/**
 * 支付订单详情
 */
export interface PaymentOrder {
  orderNo: string;
  amount: number;
  paymentType: string;
  status: string;
  qrCodeUrl: string | null;
  paymentUrl: string | null;
  expiresAt: string;
  paidAt: string | null;
}

