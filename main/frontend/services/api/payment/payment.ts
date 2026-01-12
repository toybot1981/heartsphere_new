// 支付API
import { request } from '../base/request';
import type {
  PaymentType,
  CreatePaymentOrderResponse,
  PaymentOrder,
} from './types';

/**
 * 支付API
 */
export const paymentApi = {
  /**
   * 创建支付订单
   * @param planId - 订阅计划ID
   * @param paymentType - 支付类型
   * @param token - 用户token
   */
  createOrder: (
    planId: number,
    paymentType: PaymentType,
    token: string
  ): Promise<CreatePaymentOrderResponse> => {
    return request<CreatePaymentOrderResponse>('/payment/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, paymentType }),
    });
  },

  /**
   * 查询订单状态
   * @param orderNo - 订单号
   * @param token - 用户token
   */
  getOrder: (orderNo: string, token: string): Promise<PaymentOrder> => {
    return request<PaymentOrder>(`/payment/order/${orderNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

